import { createClient } from "@/lib/supabase/server";
import type { RoutineActivity } from "@/types/database";
import { appliesOnDate, buildDueAt, endOfDay, startOfDay } from "./schedule";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export async function syncRoutineRemindersForDate(
  supabase: Supabase,
  elderId: string,
  date: Date = new Date()
) {
  const { data: activities } = await supabase
    .from("routine_activities")
    .select("*")
    .eq("elder_id", elderId)
    .eq("active", true);

  if (!activities?.length) return;

  const dayStart = startOfDay(date).toISOString();
  const dayEnd = endOfDay(date).toISOString();

  for (const activity of activities as RoutineActivity[]) {
    if (!appliesOnDate(activity, date)) continue;

    const { data: existing } = await supabase
      .from("reminders")
      .select("id")
      .eq("routine_activity_id", activity.id)
      .gte("due_at", dayStart)
      .lte("due_at", dayEnd)
      .maybeSingle();

    if (existing) continue;

    const dueAt = buildDueAt(activity.scheduled_time, date);

    await supabase.from("reminders").insert({
      elder_id: elderId,
      routine_activity_id: activity.id,
      type: activity.type,
      title: activity.title,
      message_text: activity.message_text,
      caregiver_message_text: `${activity.title} programada para hoy.`,
      due_at: dueAt.toISOString(),
      status: "pending",
    });
  }
}

export async function upsertRoutineReminder(
  supabase: Supabase,
  activity: RoutineActivity,
  from: Date = new Date()
) {
  const dueAt = buildDueAt(activity.scheduled_time, from);

  if (!appliesOnDate(activity, from)) {
    const next = findNextApplicableDate(activity, from);
    if (!next) return;
    return upsertRoutineReminder(supabase, activity, next);
  }

  const dayStart = startOfDay(from).toISOString();
  const dayEnd = endOfDay(from).toISOString();

  const { data: existing } = await supabase
    .from("reminders")
    .select("id, status")
    .eq("routine_activity_id", activity.id)
    .gte("due_at", dayStart)
    .lte("due_at", dayEnd)
    .maybeSingle();

  const payload = {
    elder_id: activity.elder_id,
    routine_activity_id: activity.id,
    type: activity.type,
    title: activity.title,
    message_text: activity.message_text,
    caregiver_message_text: `${activity.title} programada.`,
    due_at: dueAt.toISOString(),
    status: (existing?.status === "completed" ? "completed" : "pending") as "pending" | "completed",
  };

  if (existing) {
    await supabase.from("reminders").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("reminders").insert(payload);
  }
}

function findNextApplicableDate(activity: Pick<RoutineActivity, "days_of_week">, from: Date): Date | null {
  for (let offset = 0; offset < 7; offset++) {
    const candidate = new Date(from);
    candidate.setDate(from.getDate() + offset);
    if (appliesOnDate(activity, candidate)) return candidate;
  }
  return null;
}
