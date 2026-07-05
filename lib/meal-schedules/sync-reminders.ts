import { createClient } from "@/lib/supabase/server";
import type { MealSchedule } from "@/types/database";
import { appliesOnDate, buildDueAt, endOfDay, startOfDay } from "@/lib/routine-activities/schedule";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export async function syncMealRemindersForDate(
  supabase: Supabase,
  elderId: string,
  date: Date = new Date()
) {
  const { data: schedules } = await supabase
    .from("meal_schedules")
    .select("*")
    .eq("elder_id", elderId)
    .eq("active", true);

  if (!schedules?.length) return;

  const dayStart = startOfDay(date).toISOString();
  const dayEnd = endOfDay(date).toISOString();

  for (const schedule of schedules as MealSchedule[]) {
    if (!appliesOnDate(schedule, date)) continue;

    const { data: existing } = await supabase
      .from("reminders")
      .select("id")
      .eq("meal_schedule_id", schedule.id)
      .gte("due_at", dayStart)
      .lte("due_at", dayEnd)
      .maybeSingle();

    if (existing) continue;

    const dueAt = buildDueAt(schedule.scheduled_time, date);

    await supabase.from("reminders").insert({
      elder_id: elderId,
      meal_schedule_id: schedule.id,
      type: "meal",
      title: schedule.label,
      message_text: schedule.message_text,
      caregiver_message_text: `Hora del ${schedule.label.toLowerCase()}.`,
      due_at: dueAt.toISOString(),
      status: "pending",
    });
  }
}

export async function upsertMealReminder(
  supabase: Supabase,
  schedule: MealSchedule,
  from: Date = new Date()
) {
  if (!appliesOnDate(schedule, from)) {
    const next = findNextApplicableDate(schedule, from);
    if (!next) return;
    return upsertMealReminder(supabase, schedule, next);
  }

  const dueAt = buildDueAt(schedule.scheduled_time, from);
  const dayStart = startOfDay(from).toISOString();
  const dayEnd = endOfDay(from).toISOString();

  const { data: existing } = await supabase
    .from("reminders")
    .select("id, status")
    .eq("meal_schedule_id", schedule.id)
    .gte("due_at", dayStart)
    .lte("due_at", dayEnd)
    .maybeSingle();

  const payload = {
    elder_id: schedule.elder_id,
    meal_schedule_id: schedule.id,
    type: "meal" as const,
    title: schedule.label,
    message_text: schedule.message_text,
    caregiver_message_text: `Hora del ${schedule.label.toLowerCase()}.`,
    due_at: dueAt.toISOString(),
    status: (existing?.status === "completed" ? "completed" : "pending") as "pending" | "completed",
  };

  if (existing) {
    await supabase.from("reminders").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("reminders").insert(payload);
  }
}

function findNextApplicableDate(
  schedule: Pick<MealSchedule, "days_of_week">,
  from: Date
): Date | null {
  for (let offset = 0; offset < 7; offset++) {
    const candidate = new Date(from);
    candidate.setDate(from.getDate() + offset);
    if (appliesOnDate(schedule, candidate)) return candidate;
  }
  return null;
}
