import {
  subDays,
  startOfDay,
  format,
  differenceInMinutes,
  isSameDay,
} from "date-fns";
import { es } from "date-fns/locale";
import type { Interaction } from "@/types/database";

export const INTERACTION_LABELS: Record<string, string> = {
  medication_confirmed: "Medicamento",
  meal_confirmed: "Comida",
  mood: "Estado de ánimo",
  checkin: "Check-in",
  help: "Ayuda",
  family_notified: "Aviso a familia",
  voice_message: "Mensaje de voz",
};

export interface DayActivity {
  date: string;
  label: string;
  count: number;
}

export interface HourActivity {
  hour: number;
  label: string;
  count: number;
}

export interface TypeActivity {
  type: string;
  label: string;
  count: number;
  percentage: number;
}

export interface ActivityAnalytics {
  byDay: DayActivity[];
  byHour: HourActivity[];
  byType: TypeActivity[];
  totalLast7Days: number;
  avgPerDay: number;
  activeDays: number;
  mostActiveHour: string | null;
  topActivity: string | null;
  topActivityCount: number;
  avgMinutesBetweenActivity: number | null;
  interactionsToday: number;
}

export function computeActivityAnalytics(
  interactions: Interaction[],
  days = 7
): ActivityAnalytics {
  const now = new Date();
  const windowStart = startOfDay(subDays(now, days - 1));

  const inWindow = interactions.filter(
    (i) => new Date(i.created_at) >= windowStart
  );

  const byDay: DayActivity[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(now, i);
    const dateStr = format(d, "yyyy-MM-dd");
    const count = inWindow.filter((int) =>
      isSameDay(new Date(int.created_at), d)
    ).length;
    byDay.push({
      date: dateStr,
      label: format(d, "EEE", { locale: es }),
      count,
    });
  }

  const byHour: HourActivity[] = Array.from({ length: 24 }, (_, hour) => {
    const count = inWindow.filter(
      (int) => new Date(int.created_at).getHours() === hour
    ).length;
    return {
      hour,
      label: hour === 0 ? "12a" : hour < 12 ? `${hour}a` : hour === 12 ? "12p" : `${hour - 12}p`,
      count,
    };
  });

  const typeMap = new Map<string, number>();
  for (const int of inWindow) {
    typeMap.set(int.type, (typeMap.get(int.type) ?? 0) + 1);
  }

  const totalLast7Days = inWindow.length;
  const byType: TypeActivity[] = Array.from(typeMap.entries())
    .map(([type, count]) => ({
      type,
      label: INTERACTION_LABELS[type] ?? type,
      count,
      percentage: totalLast7Days > 0 ? Math.round((count / totalLast7Days) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const activeDays = byDay.filter((d) => d.count > 0).length;
  const peakHour = byHour.reduce(
    (best, h) => (h.count > best.count ? h : best),
    byHour[0]
  );

  const sorted = [...inWindow].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  let gapSum = 0;
  let gapCount = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gap = differenceInMinutes(
      new Date(sorted[i].created_at),
      new Date(sorted[i - 1].created_at)
    );
    if (gap > 0 && gap < 24 * 60) {
      gapSum += gap;
      gapCount++;
    }
  }

  const interactionsToday = inWindow.filter((i) =>
    isSameDay(new Date(i.created_at), now)
  ).length;

  return {
    byDay,
    byHour: byHour.filter((h) => h.hour >= 6 && h.hour <= 22),
    byType,
    totalLast7Days,
    avgPerDay: Math.round((totalLast7Days / days) * 10) / 10,
    activeDays,
    mostActiveHour:
      peakHour.count > 0
        ? `${String(peakHour.hour).padStart(2, "0")}:00`
        : null,
    topActivity: byType[0]?.label ?? null,
    topActivityCount: byType[0]?.count ?? 0,
    avgMinutesBetweenActivity:
      gapCount > 0 ? Math.round(gapSum / gapCount) : null,
    interactionsToday,
  };
}
