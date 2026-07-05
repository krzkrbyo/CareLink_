import { getOpenAIClient, hasOpenAI } from "@/lib/openai/client";
import {
  formatMexicoCityLocalIso,
  formatSpokenTimeMexico,
  mexicoLocalToUtc,
} from "@/lib/time/mexico-city";

export interface VoiceReminderIntent {
  title: string;
  timePhrase: string;
  minutesFromNow: number;
  dueAtLocal?: string;
}

const MIN_MINUTES = 1;
const MAX_MINUTES = 10_080;

const REMINDER_REQUEST_PATTERN =
  /\b(recu[eé]rdame|recuerda(?:me)?|recordar|me recuerdes|me recuerde|pon(?:ga)?(?:me)? un recordatorio|av[ií]s(?:ame|eme)|recordatorio para)\b/i;

export function looksLikeReminderRequest(text: string): boolean {
  return REMINDER_REQUEST_PATTERN.test(text.trim());
}

function coerceMinutes(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeTimePhrase(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const phrase = value.trim();
  if (/^a las/i.test(phrase)) return phrase;
  if (/^las /i.test(phrase)) return `a ${phrase}`;
  if (/^en \d+/i.test(phrase)) return phrase;
  return phrase.startsWith("a ") ? phrase : `a las ${phrase}`;
}

function normalizeDueAtLocal(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 16);
  }
  return null;
}

export function resolveReminderDueAt(
  intent: Pick<VoiceReminderIntent, "dueAtLocal" | "minutesFromNow">,
  now = new Date()
): Date {
  if (intent.dueAtLocal) {
    const due = mexicoLocalToUtc(intent.dueAtLocal);
    if (due.getTime() > now.getTime()) return due;
  }
  return new Date(now.getTime() + intent.minutesFromNow * 60_000);
}

export function parseVoiceReminderIntent(raw: unknown): VoiceReminderIntent | null {
  if (!raw || typeof raw !== "object") return null;

  const { title, minutesFromNow, timePhrase, dueAtLocal } = raw as Record<string, unknown>;
  if (typeof title !== "string" || !title.trim()) return null;

  const minutes = coerceMinutes(minutesFromNow);
  const dueLocal = normalizeDueAtLocal(dueAtLocal);
  const phrase = normalizeTimePhrase(timePhrase);

  if (minutes == null && !dueLocal) return null;

  const now = new Date();
  const resolvedMinutes = minutes ?? MIN_MINUTES;
  if (resolvedMinutes < MIN_MINUTES || resolvedMinutes > MAX_MINUTES) return null;

  const dueAt = dueLocal
    ? mexicoLocalToUtc(dueLocal)
    : new Date(now.getTime() + resolvedMinutes * 60_000);

  const finalMinutes = Math.max(
    MIN_MINUTES,
    Math.min(MAX_MINUTES, Math.round((dueAt.getTime() - now.getTime()) / 60_000))
  );

  return {
    title: title.trim().slice(0, 120),
    timePhrase: phrase ?? formatSpokenTimeMexico(dueAt),
    minutesFromNow: finalMinutes,
    dueAtLocal: dueLocal ?? formatMexicoCityLocalIso(dueAt),
  };
}

export function parseVoiceReminderFromChatResult(result: {
  createReminder?: unknown;
  reminder?: unknown;
}): VoiceReminderIntent | null {
  const flag =
    result.createReminder === true ||
    result.createReminder === "true" ||
    result.createReminder === 1;

  if (!flag || !result.reminder) return null;
  return parseVoiceReminderIntent(result.reminder);
}

const EXTRACT_PROMPT = `Analiza si el adulto mayor pide un recordatorio personal (tarea, llamada, tomar agua, etc.).
NO es recordatorio de medicamentos ni citas médicas del plan familiar.

Usa la HORA ACTUAL del contexto (zona horaria Ciudad de México).

Devuelve JSON estricto:
- hasReminder (boolean)
- title (string breve SIN la hora; ejemplo: "Llamar a Ana")
- timePhrase (string con la hora en palabras tal como la diría usted; ejemplo: "a las tres de la tarde", "en una hora", "a las ocho y media de la mañana")
- dueAtLocal (string ISO local YYYY-MM-DDTHH:mm en Ciudad de México; ejemplo si pide las 3pm hoy: "2026-07-04T15:00")
- minutesFromNow (number entero, minutos desde ahora hasta dueAtLocal; respaldo)

Reglas:
- Si dice "a las tres de la tarde", dueAtLocal debe ser hoy (o mañana si ya pasó) a las 15:00 hora México.
- title NUNCA debe incluir la hora; la hora va solo en timePhrase.
- timePhrase debe sonar natural en español mexicano.`;

export async function extractReminderIntentFromSpeech(
  userText: string,
  dayContext: string
): Promise<VoiceReminderIntent | null> {
  if (!looksLikeReminderRequest(userText) || !hasOpenAI()) return null;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      max_tokens: 160,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: EXTRACT_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            userMessage: userText,
            context: dayContext,
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as {
      hasReminder?: boolean;
      title?: string;
      timePhrase?: string;
      dueAtLocal?: string;
      minutesFromNow?: unknown;
    };

    if (!parsed.hasReminder) return null;
    return parseVoiceReminderIntent(parsed);
  } catch {
    return null;
  }
}

export function resolveReminderIntent(
  chatResult: { createReminder?: unknown; reminder?: unknown },
  userText: string,
  extracted: VoiceReminderIntent | null
): VoiceReminderIntent | null {
  return (
    parseVoiceReminderFromChatResult(chatResult) ??
    extracted ??
    (looksLikeReminderRequest(userText)
      ? parseVoiceReminderIntent({
          title: userText.replace(REMINDER_REQUEST_PATTERN, "").trim().slice(0, 120) || "Recordatorio",
          timePhrase: "en una hora",
          minutesFromNow: 60,
        })
      : null)
  );
}
