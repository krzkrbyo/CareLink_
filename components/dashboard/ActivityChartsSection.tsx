import { BarChart } from "@/components/charts/BarChart";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { AnalyticsMetrics } from "@/components/dashboard/AnalyticsMetrics";
import { SectionHeader } from "@/components/layout/section-header";
import { BarChart3, Clock, PieChart } from "lucide-react";
import type { ActivityAnalytics } from "@/lib/data/analytics";

interface ActivityChartsSectionProps {
  analytics: ActivityAnalytics;
  title?: string;
}

export function ActivityChartsSection({
  analytics,
  title = "Análisis de actividad",
}: ActivityChartsSectionProps) {
  return (
    <section className="mb-8 space-y-6">
      <SectionHeader
        icon={BarChart3}
        title={title}
        description="Métricas y tendencias de los últimos 7 días."
      />

      <AnalyticsMetrics analytics={analytics} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="care-surface p-4 lg:p-5">
          <h3 className="mb-1 flex items-center gap-2 font-semibold text-care-foreground">
            <BarChart3 className="h-4 w-4 text-care-accent-dark" />
            Actividad por día
          </h3>
          <p className="mb-4 text-sm text-care-muted">
            Interacciones registradas cada día de la semana
          </p>
          <BarChart
            data={analytics.byDay.map((d) => ({ label: d.label, value: d.count }))}
          />
        </div>

        <div className="care-surface p-4 lg:p-5">
          <h3 className="mb-1 flex items-center gap-2 font-semibold text-care-foreground">
            <Clock className="h-4 w-4 text-care-accent-dark" />
            Horario de actividad
          </h3>
          <p className="mb-4 text-sm text-care-muted">
            En qué horas del día suele interactuar más (6:00 – 22:00)
          </p>
          <BarChart
            data={analytics.byHour.map((h) => ({
              label: h.label,
              value: h.count,
            }))}
            barClassName="bg-care-accent"
            height={140}
          />
        </div>

        <div className="care-surface p-4 lg:p-5">
          <h3 className="mb-1 flex items-center gap-2 font-semibold text-care-foreground">
            <PieChart className="h-4 w-4 text-care-accent-dark" />
            Actividades más realizadas
          </h3>
          <p className="mb-4 text-sm text-care-muted">
            Tipos de interacción más frecuentes en el periodo
          </p>
          <HorizontalBarChart
            data={analytics.byType.map((t) => ({
              label: t.label,
              value: t.count,
              percentage: t.percentage,
            }))}
          />
        </div>

        <div className="care-surface p-4 lg:p-5">
          <h3 className="mb-1 flex items-center gap-2 font-semibold text-care-foreground">
            <PieChart className="h-4 w-4 text-care-accent-dark" />
            Distribución
          </h3>
          <p className="mb-4 text-sm text-care-muted">
            Proporción de cada tipo de actividad
          </p>
          <DonutChart
            data={analytics.byType.map((t) => ({
              label: t.label,
              value: t.count,
            }))}
          />
        </div>
      </div>
    </section>
  );
}
