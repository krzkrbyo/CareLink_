import type { RoutineActivity } from "@/types/database";

function toIsoWeekday(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

export function appliesOnDate(activity: Pick<RoutineActivity, "days_of_week">, date: Date): boolean {
  return activity.days_of_week.includes(toIsoWeekday(date));
}

export function buildDueAt(scheduledTime: string, date: Date): Date {
  const parts = scheduledTime.split(":").map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const due = new Date(date);
  due.setHours(hours, minutes, 0, 0);
  return due;
}

export function startOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function endOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}
