import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  buildReminderDisplayTitle,
  formatTimeMexicoCity,
} from "@/lib/time/mexico-city";
import type { VoiceReminderIntent } from "@/lib/voice-chat/reminder-intent";
import { resolveReminderDueAt } from "@/lib/voice-chat/reminder-intent";

export type { VoiceReminderIntent } from "@/lib/voice-chat/reminder-intent";
export {
  looksLikeReminderRequest,
  parseVoiceReminderIntent,
  parseVoiceReminderFromChatResult,
  extractReminderIntentFromSpeech,
  resolveReminderIntent,
} from "@/lib/voice-chat/reminder-intent";

export interface CreatePersonalReminderResult {
  success: boolean;
  reminderId?: string;
  title?: string;
  dueAt?: string;
  timeLabel?: string;
  error?: string;
}

const MAX_DAILY_PERSONAL = 15;

export async function createPersonalReminderFromVoice(
  elderId: string,
  elderName: string,
  intent: VoiceReminderIntent,
  options?: { useAdmin?: boolean }
): Promise<CreatePersonalReminderResult> {
  const supabase = options?.useAdmin ? createAdminClient() : await createClient();
  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("reminders")
    .select("id", { count: "exact", head: true })
    .eq("elder_id", elderId)
    .gte("created_at", startOfDay.toISOString())
    .or("type.eq.personal,caregiver_message_text.ilike.%pidió recordatorio por voz%");

  if ((count ?? 0) >= MAX_DAILY_PERSONAL) {
    return {
      success: false,
      error: "Ya tiene muchos recordatorios para hoy. Intente mañana o complete algunos.",
    };
  }

  const dueAt = resolveReminderDueAt(intent, now);
  const timeLabel = formatTimeMexicoCity(dueAt);
  const displayTitle = buildReminderDisplayTitle(intent.title, intent.timePhrase);
  const messageText = `${elderName}, le recuerdo: ${displayTitle}.`;
  const caregiverMessage = `${elderName} pidió recordatorio por voz: "${intent.title}" — ${intent.timePhrase}.`;

  const baseRow = {
    elder_id: elderId,
    title: intent.title,
    message_text: messageText,
    caregiver_message_text: caregiverMessage,
    due_at: dueAt.toISOString(),
    status: "pending" as const,
  };

  let data: { id: string; due_at: string | null } | null = null;
  let error: { message?: string; code?: string } | null = null;

  ({ data, error } = await supabase
    .from("reminders")
    .insert({ ...baseRow, type: "personal" })
    .select("id, due_at")
    .single());

  // Fallback si la migración 008 aún no está aplicada en Supabase
  if (error?.code === "23514") {
    ({ data, error } = await supabase
      .from("reminders")
      .insert({ ...baseRow, type: "activity" })
      .select("id, due_at")
      .single());
  }

  if (error || !data) {
    console.error("[createPersonalReminderFromVoice]", error?.message, error?.code);
    return { success: false, error: error?.message ?? "No se pudo guardar el recordatorio" };
  }

  const interactionInsert = await supabase.from("interactions").insert({
    elder_id: elderId,
    type: "reminder_created",
    value: intent.title,
    metadata: {
      reminderId: data.id,
      dueAt: data.due_at,
      source: "voice_chat",
    },
  });

  if (interactionInsert.error?.code === "23514") {
    await supabase.from("interactions").insert({
      elder_id: elderId,
      type: "voice_message",
      value: intent.title,
      metadata: {
        reminderId: data.id,
        dueAt: data.due_at,
        source: "voice_chat",
        reminderCreated: true,
      },
    });
  }

  await supabase.from("alerts").insert({
    elder_id: elderId,
    severity: "low",
    type: "checkin",
    message: `${elderName} pidió un recordatorio: ${displayTitle}.`,
    status: "active",
  });

  return {
    success: true,
    reminderId: data.id,
    title: intent.title,
    dueAt: data.due_at ?? dueAt.toISOString(),
    timeLabel: intent.timePhrase,
  };
}
