"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireElder } from "@/lib/auth/session";

async function getElderContext() {
  const { elder } = await requireElder();
  const supabase = await createClient();
  return { elder, supabase };
}

async function touchActivity(supabase: Awaited<ReturnType<typeof createClient>>, elderId: string) {
  await supabase
    .from("elders")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", elderId);
}

function revalidateElder(elderName?: string) {
  revalidatePath("/adulto");
  revalidatePath("/cuidador/dashboard");
}

export async function confirmMedication() {
  const { elder, supabase } = await getElderContext();

  await supabase.from("interactions").insert({
    elder_id: elder.id,
    type: "medication_confirmed",
    value: "Tomado",
  });

  await supabase
    .from("reminders")
    .update({ status: "completed" })
    .eq("elder_id", elder.id)
    .eq("type", "medication")
    .eq("status", "pending");

  await touchActivity(supabase, elder.id);
  revalidateElder(elder.full_name);
  return { success: true };
}

export async function confirmRoutineActivity(activityId: string) {
  const { elder, supabase } = await getElderContext();

  const { data: reminder } = await supabase
    .from("reminders")
    .select("title")
    .eq("id", activityId)
    .eq("elder_id", elder.id)
    .maybeSingle();

  await supabase.from("interactions").insert({
    elder_id: elder.id,
    type: "meal_confirmed",
    value: reminder?.title ? `Actividad: ${reminder.title}` : "Actividad completada",
    metadata: { kind: "routine_activity", reminderId: activityId },
  });

  await supabase
    .from("reminders")
    .update({ status: "completed" })
    .eq("id", activityId)
    .eq("elder_id", elder.id)
    .in("type", ["activity", "hydration"])
    .eq("status", "pending");

  await touchActivity(supabase, elder.id);
  revalidateElder();
  return { success: true };
}

export async function confirmMeal(mealLabel?: string) {
  const { elder, supabase } = await getElderContext();

  await supabase.from("interactions").insert({
    elder_id: elder.id,
    type: "meal_confirmed",
    value: mealLabel ? `Comió: ${mealLabel}` : "Comió",
    metadata: mealLabel ? { meal: mealLabel } : null,
  });

  let query = supabase
    .from("reminders")
    .update({ status: "completed" })
    .eq("elder_id", elder.id)
    .eq("type", "meal")
    .eq("status", "pending");

  if (mealLabel) {
    query = query.eq("title", mealLabel);
  }

  await query;

  await touchActivity(supabase, elder.id);
  revalidateElder();
  return { success: true };
}

export async function dailyCheckin() {
  const { elder, supabase } = await getElderContext();

  await supabase.from("interactions").insert({
    elder_id: elder.id,
    type: "checkin",
    value: "Estoy bien",
  });

  await supabase
    .from("reminders")
    .update({ status: "completed" })
    .eq("elder_id", elder.id)
    .eq("type", "checkin")
    .eq("status", "pending");

  await supabase
    .from("elders")
    .update({ last_activity_at: new Date().toISOString(), mood_today: "Bien" })
    .eq("id", elder.id);

  revalidateElder();
  return { success: true };
}

export async function registerMood(mood: string) {
  const { elder, supabase } = await getElderContext();
  const negative = ["Triste", "Mal", "Solo"].includes(mood);

  await supabase.from("interactions").insert({
    elder_id: elder.id,
    type: "mood",
    value: mood,
  });

  await supabase
    .from("elders")
    .update({ mood_today: mood, last_activity_at: new Date().toISOString() })
    .eq("id", elder.id);

  if (negative) {
    await supabase.from("alerts").insert({
      elder_id: elder.id,
      severity: mood === "Solo" ? "medium" : "low",
      type: "mood",
      message: `${elder.full_name} reportó que se siente ${mood.toLowerCase()}.`,
      status: "active",
    });
  }

  revalidateElder();
  return { success: true, alert: negative };
}

export async function requestHelp() {
  const { elder, supabase } = await getElderContext();

  await supabase.from("interactions").insert({
    elder_id: elder.id,
    type: "help",
    value: "Ayuda solicitada",
  });

  await supabase.from("alerts").insert({
    elder_id: elder.id,
    severity: "high",
    type: "help_requested",
    message: `${elder.full_name} presionó 'Necesito ayuda'. Contactar de inmediato.`,
    status: "active",
  });

  await touchActivity(supabase, elder.id);
  revalidateElder();
  return { success: true };
}

export async function notifyFamily() {
  const { elder, supabase } = await getElderContext();

  await supabase.from("interactions").insert({
    elder_id: elder.id,
    type: "family_notified",
    value: "Aviso enviado a la familia",
  });

  await touchActivity(supabase, elder.id);
  revalidateElder();
  return { success: true };
}

export async function confirmPersonalReminder(reminderId: string) {
  const { elder, supabase } = await getElderContext();

  const { data: reminder } = await supabase
    .from("reminders")
    .select("id, title, type, caregiver_message_text")
    .eq("id", reminderId)
    .eq("elder_id", elder.id)
    .eq("status", "pending")
    .maybeSingle();

  if (
    !reminder ||
    (reminder.type !== "personal" &&
      !(
        reminder.type === "activity" &&
        reminder.caregiver_message_text?.includes("pidió recordatorio por voz")
      ))
  ) {
    return { success: false, error: "Recordatorio no encontrado" };
  }

  await supabase
    .from("reminders")
    .update({ status: "completed" })
    .eq("id", reminderId)
    .eq("elder_id", elder.id);

  await supabase.from("interactions").insert({
    elder_id: elder.id,
    type: "reminder_completed",
    value: reminder.title,
    metadata: { reminderId },
  });

  await touchActivity(supabase, elder.id);
  revalidateElder();
  return { success: true };
}
