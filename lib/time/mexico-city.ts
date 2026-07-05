export const MEXICO_CITY_TZ = "America/Mexico_City";
const MEXICO_UTC_OFFSET = "-06:00";

export function mexicoLocalToUtc(localIso: string): Date {
  const trimmed = localIso.trim();
  const normalized =
    trimmed.length === 16 ? `${trimmed}:00` : trimmed.replace(/Z$/i, "");
  if (/[+-]\d{2}:\d{2}$/.test(normalized)) {
    return new Date(normalized);
  }
  return new Date(`${normalized}${MEXICO_UTC_OFFSET}`);
}

export function getMexicoCityParts(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MEXICO_CITY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

export function formatMexicoCityLocalIso(date: Date = new Date()): string {
  const { year, month, day, hour, minute } = getMexicoCityParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function formatTimeMexicoCity(date: Date): string {
  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: MEXICO_CITY_TZ,
  });
}

export function formatDateLabelMexicoCity(date: Date, now: Date = new Date()): string {
  const dateKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: MEXICO_CITY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: MEXICO_CITY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const tomorrow = new Date(now.getTime() + 86_400_000);
  const tomorrowKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: MEXICO_CITY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(tomorrow);

  if (dateKey === todayKey) return "Hoy";
  if (dateKey === tomorrowKey) return "Mañana";

  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: MEXICO_CITY_TZ,
  });
}

const HOUR_WORDS: Record<number, string> = {
  1: "la una",
  2: "las dos",
  3: "las tres",
  4: "las cuatro",
  5: "las cinco",
  6: "las seis",
  7: "las siete",
  8: "las ocho",
  9: "las nueve",
  10: "las diez",
  11: "las once",
  12: "las doce",
};

/** Convierte una hora a frase hablada: "a las tres de la tarde", "a las ocho y media de la mañana". */
export function formatSpokenTimeMexico(date: Date): string {
  const { hour, minute } = getMexicoCityParts(date);
  const hour12 = hour % 12 || 12;
  const hourWord = HOUR_WORDS[hour12] ?? `las ${hour12}`;
  const period = hour < 12 ? "de la mañana" : hour < 19 ? "de la tarde" : "de la noche";

  if (minute === 0) return `a ${hourWord} ${period}`;
  if (minute === 30) return `a ${hourWord} y media ${period}`;
  if (minute === 15) return `a ${hourWord} y cuarto ${period}`;
  if (minute === 45) return `a ${hourWord} menos cuarto ${period}`;

  return `a ${hourWord} con ${minute} minutos ${period}`;
}

export function buildReminderDisplayTitle(title: string, timePhrase: string | null): string {
  const task = title.trim();
  const time = timePhrase?.trim();
  if (!time) return task;
  if (task.toLowerCase().includes(time.toLowerCase())) return task;
  return `${task} ${time}`;
}

export function extractTimePhraseFromCaregiverMessage(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(/—\s*(.+?)\.\s*$/);
  return match?.[1]?.trim() ?? null;
}
