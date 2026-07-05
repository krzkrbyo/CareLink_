"use client";

import { Activity, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/layout/section-header";
import { IconBox } from "@/components/ui/icon-box";
import type { ElderRoutineView } from "@/lib/data/elder-care-plan";
import { resolveCareIcon, DEFAULT_CARE_ICONS } from "@/lib/icons/registry";
import { cn } from "@/lib/utils";

interface RoutineActivitiesListProps {
  activities: ElderRoutineView[];
  onConfirm?: (activityId: string) => void;
  loading?: boolean;
  confirmedActivities?: Set<string>;
}

export function RoutineActivitiesList({
  activities,
  onConfirm,
  loading,
  confirmedActivities,
}: RoutineActivitiesListProps) {
  if (activities.length === 0) {
    return (
      <div className="care-surface px-5 py-8 text-center text-lg text-care-muted">
        No hay actividades de rutina registradas por ahora.
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        icon={Activity}
        title="Actividades de rutina"
        description="Ejercicios, hidratación y hábitos saludables del día."
      />
      <div className="mt-4 space-y-3">
        {activities.map((activity) => {
          const fallback =
            activity.type === "hydration" ? DEFAULT_CARE_ICONS.hydration : DEFAULT_CARE_ICONS.activity;
          const Icon = resolveCareIcon(activity.icon, fallback);
          const confirmed =
            confirmedActivities?.has(activity.id) || activity.status === "completed";

          return (
            <article
              key={activity.id}
              className={cn(
                "care-surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center",
                confirmed && "border-green-300 bg-green-50/50 opacity-90"
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-care-accent/20 text-care-accent-darker">
                  <span className="text-xs font-semibold uppercase">
                    {confirmed ? "Hecho" : "Hora"}
                  </span>
                  <span className="text-sm font-bold leading-tight">{activity.timeLabel}</span>
                </div>
                <IconBox
                  icon={Icon}
                  tone={activity.type === "hydration" ? "accent" : "secondary"}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold text-care-foreground">{activity.title}</p>
                  {activity.message && (
                    <p className="text-base text-care-muted">{activity.message}</p>
                  )}
                </div>
              </div>

              {onConfirm &&
                (confirmed ? (
                  <div className="flex items-center gap-2 rounded-xl bg-green-100 px-4 py-3 text-green-800 sm:shrink-0">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span className="font-semibold">Actividad registrada</span>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => onConfirm(activity.id)}
                    disabled={loading}
                    className="w-full sm:w-auto sm:shrink-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Un momento...
                      </>
                    ) : (
                      "Ya la hice"
                    )}
                  </Button>
                ))}
            </article>
          );
        })}
      </div>
    </div>
  );
}
