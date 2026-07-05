const DEFAULT_TIME_ZONE = "America/Mexico_City";

export function formatCurrentTimeForContext(
  date: Date = new Date(),
  timeZone: string = DEFAULT_TIME_ZONE
): string {
  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone,
  });
}

export function formatCurrentDateTimeForContext(
  date: Date = new Date(),
  timeZone: string = DEFAULT_TIME_ZONE
): string {
  const day = date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone,
  });
  const time = formatCurrentTimeForContext(date, timeZone);
  return `${day}, ${time}`;
}

/** Texto en español: "faltan aproximadamente 36 minutos", "ya pasó", etc. */
export function formatRelativeUntil(target: Date, now: Date = new Date()): string {
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) return "ya pasó";

  const totalMinutes = Math.max(1, Math.round(diffMs / 60_000));

  if (totalMinutes < 60) {
    return totalMinutes === 1
      ? "falta aproximadamente 1 minuto"
      : `faltan aproximadamente ${totalMinutes} minutos`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return hours === 1
      ? "falta aproximadamente 1 hora"
      : `faltan aproximadamente ${hours} horas`;
  }

  const hourPart = hours === 1 ? "1 hora" : `${hours} horas`;
  const minutePart = minutes === 1 ? "1 minuto" : `${minutes} minutos`;
  return `faltan aproximadamente ${hourPart} y ${minutePart}`;
}

export function isUpcoming(target: Date, now: Date = new Date()): boolean {
  return target.getTime() > now.getTime();
}
