"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createMealSchedule, updateMealSchedule } from "@/app/actions/caregiver";
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
import {
  DEFAULT_MEAL_ICONS,
  DEFAULT_MEAL_MESSAGES,
  DEFAULT_MEAL_TIMES,
  MEAL_LABELS,
  type MealLabel,
} from "@/lib/meal-schedules/types";
import {
  DEFAULT_CARE_ICONS,
  normalizeCareIconKey,
  type CareIconKey,
} from "@/lib/icons/registry";
import type { MealSchedule } from "@/types/database";
import { cn } from "@/lib/utils";

interface MealScheduleFormProps {
  elderId: string;
  existingSchedules: MealSchedule[];
  editing?: MealSchedule | null;
  onSuccess?: (message: string) => void;
  onCancelEdit?: () => void;
}

function timeFromDb(value: string): string {
  const [h, m] = value.split(":");
  return `${h?.padStart(2, "0") ?? "08"}:${m?.padStart(2, "0") ?? "00"}`;
}

function buildDefaults(editing?: MealSchedule | null, fallbackLabel?: MealLabel) {
  if (editing) {
    return {
      label: editing.label as MealLabel,
      messageText: editing.message_text ?? "",
      scheduledTime: timeFromDb(editing.scheduled_time),
      daysOfWeek: editing.days_of_week,
      icon: normalizeCareIconKey(
        editing.icon,
        (DEFAULT_MEAL_ICONS[editing.label as MealLabel] as CareIconKey) ?? DEFAULT_CARE_ICONS.meal
      ),
    };
  }
  const label = fallbackLabel ?? "Desayuno";
  return {
    label,
    messageText: DEFAULT_MEAL_MESSAGES[label],
    scheduledTime: DEFAULT_MEAL_TIMES[label],
    daysOfWeek: ALL_WEEKDAYS,
    icon: normalizeCareIconKey(DEFAULT_MEAL_ICONS[label], DEFAULT_CARE_ICONS.meal),
  };
}

export function MealScheduleForm({
  elderId,
  existingSchedules,
  editing,
  onSuccess,
  onCancelEdit,
}: MealScheduleFormProps) {
  const usedLabels = new Set(
    existingSchedules.filter((s) => s.id !== editing?.id).map((s) => s.label)
  );
  const availableLabels = MEAL_LABELS.filter((label) => !usedLabels.has(label));

  const defaults = useMemo(
    () => buildDefaults(editing, availableLabels[0]),
    [editing, availableLabels]
  );

  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState<MealLabel>(defaults.label);
  const [messageText, setMessageText] = useState(defaults.messageText);
  const [scheduledTime, setScheduledTime] = useState(defaults.scheduledTime);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(defaults.daysOfWeek);
  const [icon, setIcon] = useState<CareIconKey>(defaults.icon);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) return;
    setMessageText(DEFAULT_MEAL_MESSAGES[label]);
    setScheduledTime(DEFAULT_MEAL_TIMES[label]);
    setIcon(normalizeCareIconKey(DEFAULT_MEAL_ICONS[label], DEFAULT_CARE_ICONS.meal));
  }, [label, editing]);

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!editing && usedLabels.has(label)) {
      setError("Ese horario de comida ya está registrado");
      return;
    }
    if (daysOfWeek.length === 0) {
      setError("Seleccione al menos un día");
      return;
    }

    const payload = { label, messageText, scheduledTime, daysOfWeek, icon };

    startTransition(async () => {
      try {
        if (editing) {
          await updateMealSchedule(editing.id, elderId, payload);
          onSuccess?.("Horario de comida actualizado");
          onCancelEdit?.();
        } else {
          await createMealSchedule(elderId, payload);
          onSuccess?.(`Horario de ${label.toLowerCase()} agregado`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo guardar el horario");
      }
    });
  }

  if (!editing && availableLabels.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-care-muted">
          Ya están registrados los cuatro horarios de comida. Edite uno existente para modificarlo.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editing ? `Editar ${editing.label.toLowerCase()}` : "Horario de comida"}</CardTitle>
        <p className="text-sm text-care-muted">
          Configure cuándo debe comer el adulto mayor. Aparecerá en su rutina diaria.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Comida">
            <div className="flex items-stretch gap-2">
              <IconPicker compact context="meal" value={icon} onChange={setIcon} />
              <div className="min-w-0 flex-1">
                {editing ? (
                  <Input value={label} disabled />
                ) : (
                  <Select value={label} onChange={(e) => setLabel(e.target.value as MealLabel)}>
                    {availableLabels.map((mealLabel) => (
                      <option key={mealLabel} value={mealLabel}>
                        {mealLabel}
                      </option>
                    ))}
                  </Select>
                )}
              </div>
            </div>
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
              placeholder={`Recordatorio de ${label.toLowerCase()}`}
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
              {pending ? "Guardando..." : editing ? "Guardar cambios" : "Asignar horario de comida"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
