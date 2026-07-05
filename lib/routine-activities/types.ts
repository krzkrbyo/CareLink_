import type { RoutineActivity } from "@/types/database";

export type RoutineActivityType = "activity" | "hydration";

export interface RoutineActivityInput {
  title: string;
  type: RoutineActivityType;
  messageText?: string;
  scheduledTime: string;
  daysOfWeek: number[];
  icon?: string;
}

export const ROUTINE_TYPE_LABELS: Record<RoutineActivityType, string> = {
  activity: "Actividad",
  hydration: "Hidratación",
};

export function formatRoutineActivitySummary(activity: Pick<
  RoutineActivity,
  "scheduled_time" | "days_of_week" | "type"
>): string {
  const parts = activity.scheduled_time.split(":").map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  const timeLabel = `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;

  const days = activity.days_of_week;
  let daysLabel = "todos los días";
  if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) {
    daysLabel = "lun–vie";
  } else if (days.length === 2 && days.includes(6) && days.includes(7)) {
    daysLabel = "sáb–dom";
  } else if (days.length < 7) {
    daysLabel = `${days.length} días/semana`;
  }

  return `${ROUTINE_TYPE_LABELS[activity.type as RoutineActivityType]} · ${timeLabel} · ${daysLabel}`;
}
