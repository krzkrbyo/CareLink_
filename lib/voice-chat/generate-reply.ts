import type OpenAI from "openai";
import { getOpenAIClient, hasOpenAI } from "@/lib/openai/client";
import { VOICE_CHAT_SYSTEM_PROMPT } from "@/lib/openai/prompts";
import { FALLBACK_COMPANION } from "@/lib/demo-data/fallback-messages";

export interface VoiceChatReply {
  reply: string;
  suggestAlert: boolean;
  alertType: string;
  severity: "low" | "medium" | "high";
  source: "openai" | "fallback";
  createReminder?: boolean;
  reminder?: {
    title: string;
    timePhrase: string;
    minutesFromNow: number;
    dueAtLocal?: string;
  };
}

export async function generateVoiceChatReply(
  elderName: string,
  message: string,
  history: { role: "user" | "assistant"; content: string }[],
  dayContext: string
): Promise<VoiceChatReply> {
  if (!hasOpenAI()) {
    return {
      reply: FALLBACK_COMPANION.reply,
      suggestAlert: FALLBACK_COMPANION.suggestAlert,
      alertType: FALLBACK_COMPANION.alertType,
      severity: FALLBACK_COMPANION.severity,
      source: "fallback",
    };
  }

  const openai = getOpenAIClient();
  const historyMessages: OpenAI.Chat.ChatCompletionMessageParam[] = history
    .slice(-6)
    .map((m) => ({
      role: m.role,
      content: m.content,
    }));

  const systemPrompt = VOICE_CHAT_SYSTEM_PROMPT.replace("{elderName}", elderName).replace(
    "{context}",
    dayContext
  );

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.5,
    max_tokens: 240,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      ...historyMessages,
      { role: "user", content: message },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Respuesta vacía de OpenAI");
  }

  const parsed = JSON.parse(content) as {
    reply: string;
    suggestAlert?: boolean;
    alertType?: string;
    severity?: string;
    createReminder?: unknown;
    reminder?: {
      title?: string;
      timePhrase?: string;
      dueAtLocal?: string;
      minutesFromNow?: unknown;
    };
  };

  const result: VoiceChatReply = {
    reply: parsed.reply,
    suggestAlert: parsed.suggestAlert ?? false,
    alertType: parsed.alertType ?? "none",
    severity: (parsed.severity as VoiceChatReply["severity"]) ?? "low",
    source: "openai",
  };

  if (parsed.createReminder != null && parsed.reminder?.title) {
    const minutes = parsed.reminder.minutesFromNow;
    const hasMinutes =
      minutes != null &&
      (typeof minutes === "number" || (typeof minutes === "string" && minutes.trim() !== ""));

    if (
      parsed.createReminder === true ||
      parsed.createReminder === "true" ||
      parsed.createReminder === 1
    ) {
      if (hasMinutes || parsed.reminder.dueAtLocal) {
        result.createReminder = true;
        result.reminder = {
          title: parsed.reminder.title,
          timePhrase: parsed.reminder.timePhrase ?? "",
          dueAtLocal: parsed.reminder.dueAtLocal,
          minutesFromNow:
            typeof minutes === "number" ? minutes : Number.parseInt(String(minutes ?? "60"), 10),
        };
      }
    }
  }

  return result;
}
