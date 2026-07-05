"use client";

import { useTransition } from "react";
import { resolveAlert } from "@/app/actions/caregiver";
import { Alert } from "@/types/database";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AlertsPanelProps {
  alerts: Alert[];
  elderId: string;
}

const severityStyles = {
  low: "border-care-secondary bg-care-primary text-care-foreground",
  medium: "border-orange-400 bg-orange-50",
  high: "border-red-500 bg-red-50 animate-pulse",
};

export function AlertsPanel({ alerts, elderId }: AlertsPanelProps) {
  const [pending, startTransition] = useTransition();

  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-4 text-green-900">
        Sin alertas activas ✓
      </div>
    );
  }

  function handleResolve(alertId: string) {
    startTransition(async () => {
      await resolveAlert(alertId, elderId);
    });
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            "rounded-2xl border-2 p-4",
            severityStyles[alert.severity as keyof typeof severityStyles]
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold uppercase text-sm">
                {alert.type.replace(/_/g, " ")}
              </p>
              <p className="text-lg">{alert.message}</p>
            </div>
            <Button
              size="default"
              variant="outline"
              onClick={() => handleResolve(alert.id)}
              disabled={pending}
              className="shrink-0"
            >
              Marcar resuelta
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
