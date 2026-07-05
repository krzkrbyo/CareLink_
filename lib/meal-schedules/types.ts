import type { MealSchedule } from "@/types/database";

export type MealLabel = MealSchedule["label"];

export const MEAL_LABELS: MealLabel[] = ["Desayuno", "Almuerzo", "Merienda", "Cena"];

export const MEAL_ORDER = MEAL_LABELS;

export const DEFAULT_MEAL_TIMES: Record<MealLabel, string> = {
  Desayuno: "07:30",
  Almuerzo: "13:00",
  Merienda: "17:00",
  Cena: "19:30",
};

export const DEFAULT_MEAL_MESSAGES: Record<MealLabel, string> = {
  Desayuno: "Buenos días. Es hora del desayuno. Prefiera avena, fruta y evite sal.",
  Almuerzo: "Es hora del almuerzo. Prefiera verduras, pescado y poca sal.",
  Merienda: "Es hora de la merienda. Una fruta o yogurt bajo en grasa es ideal.",
  Cena: "Es hora de la cena. Comida ligera: evite frituras y embutidos.",
};

export const DEFAULT_MEAL_ICONS: Record<MealLabel, string> = {
  Desayuno: "coffee",
  Almuerzo: "sun",
  Merienda: "cookie",
  Cena: "moon",
};

export interface MealScheduleInput {
  label: MealLabel;
  messageText?: string;
  scheduledTime: string;
  daysOfWeek: number[];
  icon?: string;
}

export function formatMealScheduleSummary(schedule: Pick<
  MealSchedule,
  "label" | "scheduled_time" | "days_of_week"
>): string {
  const parts = schedule.scheduled_time.split(":").map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  const timeLabel = `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;

  const days = schedule.days_of_week;
  let daysLabel = "todos los días";
  if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) {
    daysLabel = "lun–vie";
  } else if (days.length === 2 && days.includes(6) && days.includes(7)) {
    daysLabel = "sáb–dom";
  } else if (days.length < 7) {
    daysLabel = `${days.length} días/semana`;
  }

  return `${schedule.label} · ${timeLabel} · ${daysLabel}`;
}
