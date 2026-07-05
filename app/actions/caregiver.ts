"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireCaregiver, requireCaregiverElderAccess } from "@/lib/auth/session";
import { FALLBACK_REMINDERS } from "@/lib/demo-data/fallback-messages";
import type { MedicationScheduleInput } from "@/lib/medications/types";
import {
  formatMedicationScheduleSummary,
  getNextOccurrence,
} from "@/lib/medications/schedule";
import {
  buildReminderMessages,
  resolveAppointmentSnapshots,
} from "@/lib/appointments/build-payload";
import type { AppointmentInput, AppointmentStatus } from "@/lib/appointments/types";
import { createUniqueElderSlug } from "@/lib/elders/slug";
import { revalidateElderCarePaths } from "@/lib/elders/revalidate";
import type { RoutineActivityInput } from "@/lib/routine-activities/types";
import { upsertRoutineReminder } from "@/lib/routine-activities/sync-reminders";
import type { MealScheduleInput } from "@/lib/meal-schedules/types";
import { DEFAULT_MEAL_ICONS } from "@/lib/meal-schedules/types";
import { upsertMealReminder } from "@/lib/meal-schedules/sync-reminders";
import { DEFAULT_CARE_ICONS } from "@/lib/icons/registry";

async function revalidateCaregiver(elderId: string) {
  await revalidateElderCarePaths(elderId);
}

// --- Medications CRUD ---

export async function createMedication(elderId: string, data: MedicationScheduleInput) {
  await requireCaregiverElderAccess(elderId);
  const supabase = await createClient();

  const schedule = {
    times: [...data.schedule.times].sort(),
    daysOfWeek: [...new Set(data.schedule.daysOfWeek)].sort(),
    ...(data.schedule.timingMode === "interval"
      ? {
          timingMode: "interval" as const,
          intervalHours: data.schedule.intervalHours,
          firstDoseTime: data.schedule.firstDoseTime,
        }
      : { timingMode: "specific" as const }),
  };
  const primaryTime = schedule.times[0];
  const frequency =
    schedule.timingMode === "interval" && schedule.intervalHours
      ? `cada ${schedule.intervalHours}h (${schedule.times.length}x/día)`
      : `${schedule.times.length}x/día`;

  const { error } = await supabase.from("medications").insert({
    elder_id: elderId,
    name: data.name,
    dose: data.dose,
    time: primaryTime,
    scheduled_time: `${primaryTime}:00`,
    frequency,
    notes: data.notes,
    start_date: data.startDate,
    end_date: data.endDate ?? null,
    schedule,
    calendar_export_enabled: true,
    active: true,
    icon: data.icon ?? DEFAULT_CARE_ICONS.medication,
  });

  if (error) throw new Error(error.message);

  const nextOccurrence = getNextOccurrence(schedule, data.startDate, data.endDate);
  const scheduleSummary = formatMedicationScheduleSummary({
    dose: data.dose ?? null,
    time: primaryTime,
    start_date: data.startDate,
    end_date: data.endDate ?? null,
    schedule,
  });

  await supabase.from("reminders").insert({
    elder_id: elderId,
    type: "medication",
    title: data.name,
    message_text: FALLBACK_REMINDERS.medication.adultMessage,
    caregiver_message_text: `Medicamento ${data.name}: ${scheduleSummary}.`,
    due_at: (nextOccurrence ?? new Date()).toISOString(),
    status: "pending",
  });

  revalidateCaregiver(elderId);
  return { success: true };
}

export async function updateMedication(id: string, elderId: string, data: MedicationScheduleInput) {
  await requireCaregiverElderAccess(elderId);
  const supabase = await createClient();

  const schedule = {
    times: [...data.schedule.times].sort(),
    daysOfWeek: [...new Set(data.schedule.daysOfWeek)].sort(),
    ...(data.schedule.timingMode === "interval"
      ? {
          timingMode: "interval" as const,
          intervalHours: data.schedule.intervalHours,
          firstDoseTime: data.schedule.firstDoseTime,
        }
      : { timingMode: "specific" as const }),
  };
  const primaryTime = schedule.times[0];
  const frequency =
    schedule.timingMode === "interval" && schedule.intervalHours
      ? `cada ${schedule.intervalHours}h (${schedule.times.length}x/día)`
      : `${schedule.times.length}x/día`;

  const { error } = await supabase
    .from("medications")
    .update({
      name: data.name,
      dose: data.dose,
      time: primaryTime,
      scheduled_time: `${primaryTime}:00`,
      frequency,
      notes: data.notes,
      start_date: data.startDate,
      end_date: data.endDate ?? null,
      schedule,
      icon: data.icon ?? DEFAULT_CARE_ICONS.medication,
    })
    .eq("id", id)
    .eq("elder_id", elderId);

  if (error) throw new Error(error.message);
  revalidateCaregiver(elderId);
  return { success: true };
}

export async function deleteMedication(id: string, elderId: string) {
  await requireCaregiverElderAccess(elderId);
  const supabase = await createClient();
  const { error } = await supabase.from("medications").delete().eq("id", id).eq("elder_id", elderId);
  if (error) throw new Error(error.message);
  revalidateCaregiver(elderId);
  return { success: true };
}

// --- Appointments CRUD ---

export async function createAppointment(elderId: string, data: AppointmentInput) {
  await requireCaregiverElderAccess(elderId);
  const supabase = await createClient();

  const resolved = await resolveAppointmentSnapshots(supabase, elderId, data);
  const startsAt = new Date(data.startsAt).toISOString();

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      elder_id: elderId,
      title: resolved.title,
      type: data.type,
      starts_at: startsAt,
      notes: data.notes?.trim() || null,
      facility_id: resolved.facilityId,
      professional_id: resolved.professionalId,
      facility_name: resolved.facilityName,
      professional_name: resolved.professionalName,
      location_text: resolved.locationText,
      exam_subtype: data.type === "examen" ? data.examSubtype ?? null : null,
      preparation_notes: data.preparationNotes?.trim() || null,
      duration_minutes: data.durationMinutes ?? 60,
      status: data.status ?? "scheduled",
      calendar_export_enabled: true,
      icon:
        data.icon ??
        (data.type === "examen" ? DEFAULT_CARE_ICONS.exam : DEFAULT_CARE_ICONS.appointment),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const reminderType = data.type === "examen" ? "exam" : "appointment";
  const messages = buildReminderMessages(data, resolved);
  const status = data.status ?? "scheduled";

  if (status === "scheduled" || status === "rescheduled") {
    await supabase.from("reminders").insert({
      elder_id: elderId,
      appointment_id: appointment.id,
      type: reminderType,
      title: resolved.title,
      message_text: messages.adultMessage,
      caregiver_message_text: messages.caregiverMessage,
      due_at: startsAt,
      status: "pending",
    });
  }

  revalidateCaregiver(elderId);
  return { success: true, id: appointment.id };
}

export async function updateAppointment(id: string, elderId: string, data: AppointmentInput) {
  await requireCaregiverElderAccess(elderId);
  const supabase = await createClient();

  const resolved = await resolveAppointmentSnapshots(supabase, elderId, data);
  const startsAt = new Date(data.startsAt).toISOString();
  const status = data.status ?? "scheduled";

  const { error } = await supabase
    .from("appointments")
    .update({
      title: resolved.title,
      type: data.type,
      starts_at: startsAt,
      notes: data.notes?.trim() || null,
      facility_id: resolved.facilityId,
      professional_id: resolved.professionalId,
      facility_name: resolved.facilityName,
      professional_name: resolved.professionalName,
      location_text: resolved.locationText,
      exam_subtype: data.type === "examen" ? data.examSubtype ?? null : null,
      preparation_notes: data.preparationNotes?.trim() || null,
      duration_minutes: data.durationMinutes ?? 60,
      status,
      icon:
        data.icon ??
        (data.type === "examen" ? DEFAULT_CARE_ICONS.exam : DEFAULT_CARE_ICONS.appointment),
    })
    .eq("id", id)
    .eq("elder_id", elderId);

  if (error) throw new Error(error.message);

  const messages = buildReminderMessages(data, resolved);
  const reminderType = data.type === "examen" ? "exam" : "appointment";

  if (status === "completed" || status === "cancelled") {
    await supabase
      .from("reminders")
      .update({ status: "completed" })
      .eq("appointment_id", id)
      .eq("status", "pending");
  } else {
    await supabase
      .from("reminders")
      .update({
        title: resolved.title,
        type: reminderType,
        message_text: messages.adultMessage,
        caregiver_message_text: messages.caregiverMessage,
        due_at: startsAt,
        status: "pending",
      })
      .eq("appointment_id", id);
  }

  revalidateCaregiver(elderId);
  return { success: true };
}

export async function updateAppointmentStatus(
  id: string,
  elderId: string,
  status: AppointmentStatus
) {
  await requireCaregiverElderAccess(elderId);
  const supabase = await createClient();

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .eq("elder_id", elderId);

  if (error) throw new Error(error.message);

  if (status === "completed" || status === "cancelled") {
    await supabase
      .from("reminders")
      .update({ status: "completed" })
      .eq("appointment_id", id)
      .eq("status", "pending");
  } else {
    await supabase
      .from("reminders")
      .update({ status: "pending" })
      .eq("appointment_id", id)
      .eq("status", "completed");
  }

  revalidateCaregiver(elderId);
  return { success: true };
}

export async function deleteAppointment(id: string, elderId: string) {
  await requireCaregiverElderAccess(elderId);
  const supabase = await createClient();

  await supabase.from("reminders").delete().eq("appointment_id", id);

  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id)
    .eq("elder_id", elderId);

  if (error) throw new Error(error.message);
  revalidateCaregiver(elderId);
  return { success: true };
}

// --- Routine activities CRUD ---

export async function createRoutineActivity(elderId: string, data: RoutineActivityInput) {
  await requireCaregiverElderAccess(elderId);
  const supabase = await createClient();

  const daysOfWeek = [...new Set(data.daysOfWeek)].sort();
  if (daysOfWeek.length === 0) {
    throw new Error("Seleccione al menos un día de la semana");
  }

  const { data: activity, error } = await supabase
    .from("routine_activities")
    .insert({
      elder_id: elderId,
      title: data.title.trim(),
      type: data.type,
      message_text: data.messageText?.trim() || null,
      scheduled_time: `${data.scheduledTime}:00`,
      days_of_week: daysOfWeek,
      active: true,
      icon:
        data.icon ??
        (data.type === "hydration" ? DEFAULT_CARE_ICONS.hydration : DEFAULT_CARE_ICONS.activity),
    })
    .select("*")
    .single();

  if (error || !activity) throw new Error(error?.message ?? "No se pudo crear la actividad");

  await upsertRoutineReminder(supabase, activity);

  revalidateCaregiver(elderId);
  return { success: true, id: activity.id };
}

export async function updateRoutineActivity(
  id: string,
  elderId: string,
  data: Partial<RoutineActivityInput> & { active?: boolean }
) {
  await requireCaregiverElderAccess(elderId);
  const supabase = await createClient();

  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title.trim();
  if (data.type !== undefined) update.type = data.type;
  if (data.messageText !== undefined) update.message_text = data.messageText.trim() || null;
  if (data.scheduledTime !== undefined) update.scheduled_time = `${data.scheduledTime}:00`;
  if (data.daysOfWeek !== undefined) {
    const daysOfWeek = [...new Set(data.daysOfWeek)].sort();
    if (daysOfWeek.length === 0) throw new Error("Seleccione al menos un día de la semana");
    update.days_of_week = daysOfWeek;
  }
  if (data.active !== undefined) update.active = data.active;
  if (data.icon !== undefined) update.icon = data.icon;

  const { data: activity, error } = await supabase
    .from("routine_activities")
    .update(update)
    .eq("id", id)
    .eq("elder_id", elderId)
    .select("*")
    .single();

  if (error || !activity) throw new Error(error?.message ?? "No se pudo actualizar la actividad");

  if (activity.active) {
    await upsertRoutineReminder(supabase, activity);
  } else {
    await supabase.from("reminders").delete().eq("routine_activity_id", id).eq("status", "pending");
  }

  revalidateCaregiver(elderId);
  return { success: true };
}

export async function deleteRoutineActivity(id: string, elderId: string) {
  await requireCaregiverElderAccess(elderId);
  const supabase = await createClient();

  await supabase.from("reminders").delete().eq("routine_activity_id", id);

  const { error } = await supabase
    .from("routine_activities")
    .delete()
    .eq("id", id)
    .eq("elder_id", elderId);

  if (error) throw new Error(error.message);
  revalidateCaregiver(elderId);
  return { success: true };
}

// --- Meal schedules CRUD ---

export async function createMealSchedule(elderId: string, data: MealScheduleInput) {
  await requireCaregiverElderAccess(elderId);
  const supabase = await createClient();

  const daysOfWeek = [...new Set(data.daysOfWeek)].sort();
  if (daysOfWeek.length === 0) {
    throw new Error("Seleccione al menos un día de la semana");
  }

  const { data: schedule, error } = await supabase
    .from("meal_schedules")
    .insert({
      elder_id: elderId,
      label: data.label,
      message_text: data.messageText?.trim() || null,
      scheduled_time: `${data.scheduledTime}:00`,
      days_of_week: daysOfWeek,
      active: true,
      icon: data.icon ?? DEFAULT_MEAL_ICONS[data.label] ?? DEFAULT_CARE_ICONS.meal,
    })
    .select("*")
    .single();

  if (error || !schedule) throw new Error(error?.message ?? "No se pudo crear el horario de comida");

  await upsertMealReminder(supabase, schedule);

  revalidateCaregiver(elderId);
  return { success: true, id: schedule.id };
}

export async function updateMealSchedule(
  id: string,
  elderId: string,
  data: Partial<MealScheduleInput> & { active?: boolean }
) {
  await requireCaregiverElderAccess(elderId);
  const supabase = await createClient();

  const update: Record<string, unknown> = {};
  if (data.label !== undefined) update.label = data.label;
  if (data.messageText !== undefined) update.message_text = data.messageText.trim() || null;
  if (data.scheduledTime !== undefined) update.scheduled_time = `${data.scheduledTime}:00`;
  if (data.daysOfWeek !== undefined) {
    const daysOfWeek = [...new Set(data.daysOfWeek)].sort();
    if (daysOfWeek.length === 0) throw new Error("Seleccione al menos un día de la semana");
    update.days_of_week = daysOfWeek;
  }
  if (data.active !== undefined) update.active = data.active;
  if (data.icon !== undefined) update.icon = data.icon;

  const { data: schedule, error } = await supabase
    .from("meal_schedules")
    .update(update)
    .eq("id", id)
    .eq("elder_id", elderId)
    .select("*")
    .single();

  if (error || !schedule) throw new Error(error?.message ?? "No se pudo actualizar el horario");

  if (schedule.active) {
    await upsertMealReminder(supabase, schedule);
  } else {
    await supabase.from("reminders").delete().eq("meal_schedule_id", id).eq("status", "pending");
  }

  revalidateCaregiver(elderId);
  return { success: true };
}

export async function deleteMealSchedule(id: string, elderId: string) {
  await requireCaregiverElderAccess(elderId);
  const supabase = await createClient();

  await supabase.from("reminders").delete().eq("meal_schedule_id", id);

  const { error } = await supabase
    .from("meal_schedules")
    .delete()
    .eq("id", id)
    .eq("elder_id", elderId);

  if (error) throw new Error(error.message);
  revalidateCaregiver(elderId);
  return { success: true };
}

// --- Food rules CRUD ---

export async function createFoodRule(elderId: string, data: {
  label: string;
  type: "allergen" | "prohibited" | "reduce" | "recommendation";
  notes?: string;
}) {
  await requireCaregiverElderAccess(elderId);
  const supabase = await createClient();
  const { error } = await supabase.from("food_rules").insert({
    elder_id: elderId,
    label: data.label,
    type: data.type,
    notes: data.notes,
  });
  if (error) throw new Error(error.message);
  revalidateCaregiver(elderId);
  return { success: true };
}

export async function updateFoodRule(
  id: string,
  elderId: string,
  data: {
    label: string;
    type: "allergen" | "prohibited" | "reduce" | "recommendation";
    notes?: string;
  }
) {
  await requireCaregiverElderAccess(elderId);
  const supabase = await createClient();
  const { error } = await supabase
    .from("food_rules")
    .update({
      label: data.label.trim(),
      type: data.type,
      notes: data.notes?.trim() || null,
    })
    .eq("id", id)
    .eq("elder_id", elderId);
  if (error) throw new Error(error.message);
  revalidateCaregiver(elderId);
  return { success: true };
}

export async function deleteFoodRule(id: string, elderId: string) {
  await requireCaregiverElderAccess(elderId);
  const supabase = await createClient();
  const { error } = await supabase.from("food_rules").delete().eq("id", id).eq("elder_id", elderId);
  if (error) throw new Error(error.message);
  revalidateCaregiver(elderId);
  return { success: true };
}

// --- Alerts ---

export async function resolveAlert(alertId: string, elderId: string) {
  await requireCaregiverElderAccess(elderId);
  const supabase = await createClient();
  const { error } = await supabase
    .from("alerts")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", alertId)
    .eq("elder_id", elderId);
  if (error) throw new Error(error.message);
  revalidateCaregiver(elderId);
  return { success: true };
}

// --- Elder management ---

export async function createElderAndLink(data: {
  fullName: string;
  age?: number;
  relationship: string;
  emergencyContact?: string;
  elderEmail: string;
  elderPassword: string;
}) {
  const { user, profile } = await requireCaregiver();

  const email = data.elderEmail.trim().toLowerCase();
  const password = data.elderPassword;

  if (!email) throw new Error("El correo del adulto mayor es requerido");
  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }

  const admin = createAdminClient();

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: data.fullName, role: "elder" },
  });

  if (authError || !authData.user) {
    throw new Error(
      authError?.message === "User already registered"
        ? "Ese correo ya está registrado. Use otro correo."
        : authError?.message ?? "No se pudo crear la cuenta de acceso"
    );
  }

  const authUserId = authData.user.id;

  await admin.from("profiles").upsert({
    id: authUserId,
    full_name: data.fullName,
    role: "elder",
  });

  const slug = await createUniqueElderSlug(admin, data.fullName);

  const { data: elder, error: elderError } = await admin
    .from("elders")
    .insert({
      full_name: data.fullName,
      age: data.age,
      main_caregiver_name: profile.full_name,
      emergency_contact: data.emergencyContact,
      auth_user_id: authUserId,
      slug,
    })
    .select()
    .single();

  if (elderError || !elder) {
    await admin.auth.admin.deleteUser(authUserId);
    throw new Error(elderError?.message ?? "Error al registrar la persona");
  }

  const { error: linkError } = await admin.from("caregiver_elder_links").insert({
    caregiver_id: user.id,
    elder_id: elder.id,
    relationship: data.relationship,
  });

  if (linkError) {
    await admin.from("elders").delete().eq("id", elder.id);
    await admin.auth.admin.deleteUser(authUserId);
    throw new Error(linkError.message);
  }

  revalidatePath("/cuidador");
  return {
    success: true,
    elderId: elder.id,
    elderSlug: slug,
    elderEmail: email,
  };
}

export async function updateElder(elderId: string, data: {
  full_name?: string;
  age?: number;
  emergency_contact?: string;
}) {
  await requireCaregiverElderAccess(elderId);
  const supabase = await createClient();
  const { error } = await supabase.from("elders").update(data).eq("id", elderId);
  if (error) throw new Error(error.message);
  revalidateCaregiver(elderId);
  return { success: true };
}
