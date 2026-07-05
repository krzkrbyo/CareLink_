const HOUR_WORDS: Record<number, string> = {
  1: "una",
  2: "dos",
  3: "tres",
  4: "cuatro",
  5: "cinco",
  6: "seis",
  7: "siete",
  8: "ocho",
  9: "nueve",
  10: "diez",
  11: "once",
  12: "doce",
};

function periodOfDay(hours24: number): string {
  if (hours24 >= 0 && hours24 < 6) return "de la madrugada";
  if (hours24 < 12) return "de la mañana";
  if (hours24 < 14) return "del mediodía";
  if (hours24 < 19) return "de la tarde";
  return "de la noche";
}

function hourWord12(hours24: number): string {
  const h12 = hours24 % 12 || 12;
  return HOUR_WORDS[h12] ?? String(h12);
}

function minuteToWords(minutes: number): string {
  if (minutes === 0) return "";
  if (minutes === 15) return "y cuarto";
  if (minutes === 30) return "y media";
  if (minutes === 45) return "menos cuarto";

  const ones = [
    "",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
  ];
  const teens = [
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "dieciséis",
    "diecisiete",
    "dieciocho",
    "diecinueve",
  ];

  if (minutes < 10) return `y ${ones[minutes]}`;
  if (minutes < 20) return `y ${teens[minutes - 10]}`;
  if (minutes % 10 === 0) {
    const tens = ["", "", "veinte", "treinta", "cuarenta", "cincuenta"];
    return `y ${tens[minutes / 10]}`;
  }
  if (minutes < 30) return `y veinti${ones[minutes - 20]}`;
  if (minutes < 40) return `y treinta y ${ones[minutes - 30]}`;
  if (minutes < 50) return `y cuarenta y ${ones[minutes - 40]}`;
  return `y cincuenta y ${ones[minutes - 50]}`;
}

function parseClockTo24h(hours: number, minutes: number, period?: string): [number, number] {
  let h = hours;
  const p = (period ?? "").toLowerCase().replace(/\s/g, "");

  if (p) {
    const isPm = p.startsWith("p") || p === "pm";
    const isAm = p.startsWith("a") || p === "am";
    if (isPm && h < 12) h += 12;
    if (isAm && h === 12) h = 0;
  }

  return [h, minutes];
}

/** Frase natural sin artículo: "ocho de la mañana", "nueve menos cuarto de la noche". */
export function formatTimeForSpeech(hours24: number, minutes: number): string {
  const period = periodOfDay(hours24);

  if (minutes === 45) {
    const nextH12 = (hours24 % 12) + 1;
    const nextWord = HOUR_WORDS[nextH12 > 12 ? 1 : nextH12];
    return `${nextWord} menos cuarto ${period}`;
  }

  const hour = hourWord12(hours24);
  const minPart = minuteToWords(minutes);

  if (!minPart) {
    return `${hour} ${period}`;
  }

  return `${hour} ${minPart} ${period}`;
}

/** Con frase "a las …" lista para hablar. */
export function formatTimePhraseForSpeech(hours24: number, minutes: number): string {
  return `las ${formatTimeForSpeech(hours24, minutes)}`;
}

/** Desde "HH:MM" en 24 horas. */
export function formatTimeForSpeechFrom24(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return formatTimePhraseForSpeech(h, m ?? 0);
}

/** Desde etiqueta tipo "8:00 AM" o "08:00 a.m." */
export function formatTimeForSpeechFromLabel(label: string): string {
  const match = label
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?|AM|PM)?$/i);
  if (!match) return label;

  const [hours24, minutes] = parseClockTo24h(
    parseInt(match[1], 10),
    parseInt(match[2], 10),
    match[3]
  );

  return formatTimePhraseForSpeech(hours24, minutes);
}

const TIME_PATTERN =
  /\b(a\s+las?\s+)?(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?|AM|PM)?(\s|$|[.,;:!?])/gi;

/** Reemplaza todas las horas en un texto antes de enviarlo a ElevenLabs. */
export function prepareTextForSpeech(text: string): string {
  return text.replace(TIME_PATTERN, (_full, prefix, h, m, period, trailing) => {
    const [hours24, minutes] = parseClockTo24h(parseInt(h, 10), parseInt(m, 10), period);
    const spoken = formatTimeForSpeech(hours24, minutes);
    const phrase = prefix ? `a las ${spoken}` : `las ${spoken}`;
    return `${phrase}${trailing}`;
  });
}
