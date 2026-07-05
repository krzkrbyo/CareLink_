"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createRoutineActivity, updateRoutineActivity } from "@/app/actions/caregiver";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { IconPicker } from "@/components/ui/icon-picker";
import {
  ALL_WEEKDAYS,
  WEEKDAY_LABELS,
  WEEKDAYS,
  WEEKENDS,
} from "@/lib/medications/types";
import type { RoutineActivityType } from "@/lib/routine-activities/types";
import { DEFAULT_CARE_ICONS, normalizeCareIconKey, type CareIconKey } from "@/lib/icons/registry";
import type { RoutineActivity } from "@/types/database";
import { cn } from "@/lib/utils";

interface RoutineActivityFormProps {
  elderId: string;
  editing?: RoutineActivity | null;
  onSuccess?: (message: string) => void;
  onCancelEdit?: () => void;
}

function timeFromDb(value: string): string {
  const [h, m] = value.split(":");
  return `${h?.padStart(2, "0") ?? "10"}:${m?.padStart(2, "0") ?? "00"}`;
}

function buildDefaults(editing?: RoutineActivity | null) {
  if (!editing) {
    return {
      title: "",
      type: "activity" as RoutineActivityType,
      messageText: "",
      scheduledTime: "10:00",
      daysOfWeek: ALL_WEEKDAYS,
      icon: DEFAULT_CARE_ICONS.activity as CareIconKey,
    };
  }
  return {
    title: editing.title,
    type: editing.type as RoutineActivityType,
    messageText: editing.message_text ?? "",
    scheduledTime: timeFromDb(editing.scheduled_time),
    daysOfWeek: editing.days_of_week,
    icon: normalizeCareIconKey(
      editing.icon,
      editing.type === "hydration" ? DEFAULT_CARE_ICONS.hydration : DEFAULT_CARE_ICONS.activity
    ),
  };
}

export function RoutineActivityForm({
  elderId,
  editing,
  onSuccess,
  onCancelEdit,
}: RoutineActivityFormProps) {
  const defaults = useMemo(() => buildDefaults(editing), [editing]);
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(defaults.title);
  const [type, setType] = useState<RoutineActivityType>(defaults.type);
  const [messageText, setMessageText] = useState(defaults.messageText);
  const [scheduledTime, setScheduledTime] = useState(defaults.scheduledTime);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(defaults.daysOfWeek);
  const [icon, setIcon] = useState<CareIconKey>(defaults.icon);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) return;
    setIcon(type === "hydration" ? DEFAULT_CARE_ICONS.hydration : DEFAULT_CARE_ICONS.activity);
  }, [type, editing]);

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Indique un nombre para la actividad");
      return;
    }
    if (daysOfWeek.length === 0) {
      setError("Seleccione al menos un día");
      return;
    }

    const payload = {
      title,
      type,
      messageText,
      scheduledTime,
      daysOfWeek,
      icon,
    };

    startTransition(async () => {
      try {
        if (editing) {
          await updateRoutineActivity(editing.id, elderId, payload);
          onSuccess?.("Actividad actualizada");
          onCancelEdit?.();
        } else {
          await createRoutineActivity(elderId, payload);
          setTitle("");
          setMessageText("");
          setScheduledTime("10:00");
          setType("activity");
          setDaysOfWeek(ALL_WEEKDAYS);
          setIcon(DEFAULT_CARE_ICONS.activity);
          onSuccess?.("Actividad de rutina agregada");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo guardar la actividad");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editing ? "Editar actividad" : "Nueva actividad de rutina"}</CardTitle>
        <p className="text-sm text-care-muted">
          Asigne ejercicios, hidratación u otros hábitos diarios. Aparecerán en el portal del adulto
          mayor.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Nombre de la actividad">
            <div className="flex items-stretch gap-2">
              <IconPicker
                compact
                context={type === "hydration" ? "hydration" : "activity"}
                value={icon}
                onChange={setIcon}
              />
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Caminata suave, Beber agua"
                required
                className="min-w-0 flex-1"
              />
            </div>
          </FormField>

          <FormField label="Tipo">
            <Select value={type} onChange={(e) => setType(e.target.value as RoutineActivityType)}>
              <option value="activity">Actividad / ejercicio</option>
              <option value="hydration">Hidratación</option>
            </Select>
          </FormField>

          <FormField label="Hora">
            <Input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Días de la semana">
            <div className="mb-2 flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setDaysOfWeek(WEEKDAYS)}>
                Lun–vie
              </Button>
              <Button type="button" variant="outline" onClick={() => setDaysOfWeek(WEEKENDS)}>
                Fin de semana
              </Button>
              <Button type="button" variant="outline" onClick={() => setDaysOfWeek(ALL_WEEKDAYS)}>
                Todos
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_LABELS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    daysOfWeek.includes(day.value)
                      ? "border-care-accent-dark bg-care-accent-dark text-white"
                      : "border-care-secondary/60 bg-white text-care-muted hover:border-care-accent"
                  )}
                  title={day.label}
                >
                  {day.short}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Mensaje para el adulto mayor (opcional)">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Ej: 15 minutos de caminata tranquila en el jardín"
            />
          </FormField>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-col gap-2 sm:flex-row">
            {editing && onCancelEdit && (
              <Button type="button" variant="outline" className="w-full" onClick={onCancelEdit}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Guardando..." : editing ? "Guardar cambios" : "Asignar actividad"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
