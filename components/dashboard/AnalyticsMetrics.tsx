import { BarChart3, Clock, Flame, TrendingUp } from "lucide-react";
import { IconBox } from "@/components/ui/icon-box";
import type { ActivityAnalytics } from "@/lib/data/analytics";

interface MetricTileProps {
  icon: typeof BarChart3;
  label: string;
  value: string;
  detail?: string;
  tone?: "accent" | "secondary" | "success" | "danger" | "muted";
}

function MetricTile({ icon, label, value, detail, tone = "accent" }: MetricTileProps) {
  return (
    <div className="care-surface flex gap-3 p-4">
      <IconBox icon={icon} tone={tone} size="sm" />
      <div className="min-w-0">
        <p className="text-sm text-care-muted">{label}</p>
        <p className="text-2xl font-bold text-care-foreground">{value}</p>
        {detail && <p className="text-xs text-care-muted-light">{detail}</p>}
      </div>
    </div>
  );
}

interface AnalyticsMetricsProps {
  analytics: ActivityAnalytics;
}

export function AnalyticsMetrics({ analytics }: AnalyticsMetricsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricTile
        icon={BarChart3}
        label="Actividades (7 días)"
        value={String(analytics.totalLast7Days)}
        detail={`Promedio ${analytics.avgPerDay}/día`}
      />
      <MetricTile
        icon={TrendingUp}
        label="Días con actividad"
        value={`${analytics.activeDays}/7`}
        detail={
          analytics.topActivity
            ? `Más frecuente: ${analytics.topActivity}`
            : undefined
        }
        tone="success"
      />
      <MetricTile
        icon={Clock}
        label="Hora más activa"
        value={analytics.mostActiveHour ?? "—"}
        detail={
          analytics.avgMinutesBetweenActivity != null
            ? `~${analytics.avgMinutesBetweenActivity} min entre actividades`
            : "Patrón horario del periodo"
        }
        tone="secondary"
      />
      <MetricTile
        icon={Flame}
        label="Actividad hoy"
        value={String(analytics.interactionsToday)}
        detail={
          analytics.topActivityCount > 0
            ? `${analytics.topActivity}: ${analytics.topActivityCount} esta semana`
            : undefined
        }
        tone={analytics.interactionsToday > 0 ? "success" : "muted"}
      />
    </div>
  );
}
