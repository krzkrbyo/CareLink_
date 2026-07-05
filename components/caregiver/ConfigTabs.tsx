"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteMedication,
  deleteFoodRule,
  deleteRoutineActivity,
  deleteMealSchedule,
} from "@/app/actions/caregiver";
import { MedicationScheduleForm } from "@/components/caregiver/MedicationScheduleForm";
import { AppointmentScheduleForm } from "@/components/caregiver/AppointmentScheduleForm";
import { AppointmentList } from "@/components/caregiver/AppointmentList";
import { MedicalCatalogPanel } from "@/components/caregiver/MedicalCatalogPanel";
import { RoutineActivityForm } from "@/components/caregiver/RoutineActivityForm";
import { MealScheduleForm } from "@/components/caregiver/MealScheduleForm";
import { FoodRuleForm } from "@/components/caregiver/FoodRuleForm";
import { CalendarClock, CalendarPlus, Dumbbell, Pencil, Pill, Salad, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconBox } from "@/components/ui/icon-box";
import { formatMedicationScheduleSummary } from "@/lib/medications/schedule";
import { formatRoutineActivitySummary } from "@/lib/routine-activities/types";
import { formatMealScheduleSummary, DEFAULT_MEAL_ICONS } from "@/lib/meal-schedules/types";
import {
  DEFAULT_CARE_ICONS,
  normalizeCareIconKey,
  resolveCareIcon,
  type CareIconKey,
} from "@/lib/icons/registry";
import type { Medication, Appointment, FoodRule, RoutineActivity, MealSchedule } from "@/types/database";
import type { MedicalCatalog } from "@/lib/appointments/types";

interface ConfigTabsProps {
  elderId: string;
  medications: Medication[];
  appointments: Appointment[];
  foodRules: FoodRule[];
  routineActivities: RoutineActivity[];
  mealSchedules: MealSchedule[];
  catalog: MedicalCatalog;
}

const TABS = [
  {
    id: "medicamentos",
    label: "Medicamentos",
    description: "Horarios y dosis",
    icon: Pill,
  },
  {
    id: "citas",
    label: "Citas y exámenes",
    description: "Agenda médica",
    icon: CalendarClock,
  },
  {
    id: "rutina",
    label: "Rutina",
    description: "Actividades e hidratación",
    icon: Dumbbell,
  },
  {
    id: "alimentacion",
    label: "Alimentación",
    description: "Comidas y restricciones",
    icon: Salad,
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ConfigTabs({
  elderId,
  medications,
  appointments,
  foodRules,
  routineActivities,
  mealSchedules,
  catalog,
}: ConfigTabsProps) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("medicamentos");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<RoutineActivity | null>(null);
  const [editingMeal, setEditingMeal] = useState<MealSchedule | null>(null);
  const [editingFoodRule, setEditingFoodRule] = useState<FoodRule | null>(null);

  function handleSuccess(nextMessage: string) {
    setMessage(nextMessage);
    router.refresh();
  }

  function handleDelete(action: () => Promise<void>, nextMessage: string) {
    startTransition(async () => {
      await action();
      setMessage(nextMessage);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {TABS.map(({ id, label, description, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
              tab === id
                ? "border-care-accent-dark bg-care-accent-dark text-white shadow-sm"
                : "border-care-secondary/50 bg-white text-care-muted hover:border-care-secondary hover:bg-care-primary"
            )}
          >
            <IconBox
              icon={Icon}
              tone={tab === id ? "muted" : "accent"}
              size="sm"
              className={tab === id ? "bg-white/20 text-white" : undefined}
            />
            <div>
              <p className="font-semibold">{label}</p>
              <p className={cn("text-xs", tab === id ? "text-white/80" : "text-care-muted-light")}>
                {description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {message && (
        <p className="mb-4 rounded-lg bg-green-50 p-3 text-green-800">{message}</p>
      )}

      {tab === "medicamentos" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <MedicationScheduleForm
            key={editingMedication?.id ?? "new-med"}
            elderId={elderId}
            editing={editingMedication}
            onSuccess={handleSuccess}
            onCancelEdit={() => setEditingMedication(null)}
          />
          <ItemList
            fallbackIcon={Pill}
            fallbackIconKey={DEFAULT_CARE_ICONS.medication}
            items={medications.map((m) => ({
              id: m.id,
              title: m.name,
              subtitle: formatMedicationScheduleSummary(m),
              iconKey: normalizeCareIconKey(m.icon, DEFAULT_CARE_ICONS.medication),
              calendarHref: `/api/calendar/medication/${m.id}`,
            }))}
            editingId={editingMedication?.id ?? null}
            onEdit={(id) => setEditingMedication(medications.find((m) => m.id === id) ?? null)}
            onDelete={(id) =>
              handleDelete(async () => {
                await deleteMedication(id, elderId);
                if (editingMedication?.id === id) setEditingMedication(null);
              }, "Medicamento eliminado")
            }
            pending={pending}
            emptyText="No hay medicamentos registrados todavía."
          />
        </div>
      )}

      {tab === "citas" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <AppointmentScheduleForm
              key={editingAppointment?.id ?? "new-appt"}
              elderId={elderId}
              catalog={catalog}
              editing={editingAppointment}
              onSuccess={handleSuccess}
              onCancelEdit={() => setEditingAppointment(null)}
            />
            <AppointmentList
              elderId={elderId}
              appointments={appointments}
              editingId={editingAppointment?.id ?? null}
              onEdit={setEditingAppointment}
              onNew={() => setEditingAppointment(null)}
              onMessage={handleSuccess}
            />
          </div>
          <MedicalCatalogPanel elderId={elderId} catalog={catalog} onMessage={handleSuccess} />
        </div>
      )}

      {tab === "rutina" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <RoutineActivityForm
            key={editingRoutine?.id ?? "new-routine"}
            elderId={elderId}
            editing={editingRoutine}
            onSuccess={handleSuccess}
            onCancelEdit={() => setEditingRoutine(null)}
          />
          <ItemList
            fallbackIcon={Dumbbell}
            fallbackIconKey={DEFAULT_CARE_ICONS.activity}
            items={routineActivities.map((activity) => ({
              id: activity.id,
              title: activity.title,
              subtitle: formatRoutineActivitySummary(activity),
              iconKey: normalizeCareIconKey(
                activity.icon,
                activity.type === "hydration"
                  ? DEFAULT_CARE_ICONS.hydration
                  : DEFAULT_CARE_ICONS.activity
              ),
            }))}
            editingId={editingRoutine?.id ?? null}
            onEdit={(id) =>
              setEditingRoutine(routineActivities.find((a) => a.id === id) ?? null)
            }
            onDelete={(id) =>
              handleDelete(async () => {
                await deleteRoutineActivity(id, elderId);
                if (editingRoutine?.id === id) setEditingRoutine(null);
              }, "Actividad eliminada")
            }
            pending={pending}
            emptyText="No hay actividades de rutina asignadas todavía."
          />
        </div>
      )}

      {tab === "alimentacion" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <MealScheduleForm
              key={editingMeal?.id ?? "new-meal"}
              elderId={elderId}
              existingSchedules={mealSchedules}
              editing={editingMeal}
              onSuccess={handleSuccess}
              onCancelEdit={() => setEditingMeal(null)}
            />
            <ItemList
              fallbackIcon={Salad}
              fallbackIconKey={DEFAULT_CARE_ICONS.meal}
              items={mealSchedules.map((schedule) => ({
                id: schedule.id,
                title: schedule.label,
                subtitle: formatMealScheduleSummary(schedule),
                iconKey: normalizeCareIconKey(
                  schedule.icon,
                  normalizeCareIconKey(
                    DEFAULT_MEAL_ICONS[schedule.label],
                    DEFAULT_CARE_ICONS.meal
                  )
                ),
              }))}
              editingId={editingMeal?.id ?? null}
              onEdit={(id) => setEditingMeal(mealSchedules.find((s) => s.id === id) ?? null)}
            onDelete={(id) =>
              handleDelete(async () => {
                await deleteMealSchedule(id, elderId);
                if (editingMeal?.id === id) setEditingMeal(null);
              }, "Horario de comida eliminado")
            }
              pending={pending}
              emptyText="No hay horarios de comida registrados todavía."
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <FoodRuleForm
              key={editingFoodRule?.id ?? "new-food-rule"}
              elderId={elderId}
              editing={editingFoodRule}
              onSuccess={handleSuccess}
              onCancelEdit={() => setEditingFoodRule(null)}
            />
            <ItemList
              fallbackIcon={Salad}
              items={foodRules.map((f) => ({
                id: f.id,
                title: f.label,
                subtitle: f.type,
              }))}
              editingId={editingFoodRule?.id ?? null}
              onEdit={(id) => setEditingFoodRule(foodRules.find((f) => f.id === id) ?? null)}
              onDelete={(id) =>
                handleDelete(async () => {
                  await deleteFoodRule(id, elderId);
                  if (editingFoodRule?.id === id) setEditingFoodRule(null);
                }, "Regla eliminada")
              }
              pending={pending}
              emptyText="No hay reglas alimenticias registradas."
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ItemList({
  fallbackIcon,
  fallbackIconKey,
  items,
  editingId,
  onEdit,
  onDelete,
  pending,
  emptyText,
}: {
  fallbackIcon: LucideIcon;
  fallbackIconKey?: CareIconKey;
  items: {
    id: string;
    title: string;
    subtitle: string;
    iconKey?: CareIconKey;
    calendarHref?: string;
  }[];
  editingId?: string | null;
  onEdit?: (id: string) => void;
  onDelete: (id: string) => void;
  pending: boolean;
  emptyText: string;
}) {
  if (items.length === 0) {
    return (
      <div className="care-surface flex flex-col items-center gap-3 py-10 text-center text-care-muted">
        <IconBox icon={fallbackIcon} tone="muted" size="lg" />
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const ItemIcon = item.iconKey
          ? resolveCareIcon(item.iconKey, fallbackIconKey ?? DEFAULT_CARE_ICONS.medication)
          : fallbackIcon;
        const isEditing = editingId === item.id;

        return (
          <div
            key={item.id}
            className={cn(
              "care-surface flex items-center justify-between gap-3 p-4",
              isEditing && "ring-2 ring-care-accent-dark"
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <IconBox icon={ItemIcon} tone="accent" size="sm" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-care-foreground">{item.title}</p>
                <p className="truncate text-sm text-care-muted">{item.subtitle}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {item.calendarHref && (
                <a
                  href={item.calendarHref}
                  className="rounded-lg p-2 text-care-accent-dark hover:bg-care-primary"
                  aria-label={`Exportar ${item.title} al calendario`}
                  title="Exportar al calendario"
                >
                  <CalendarPlus className="h-5 w-5" />
                </a>
              )}
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(item.id)}
                  disabled={pending}
                  className="rounded-lg p-2 text-care-accent-dark hover:bg-care-primary"
                  aria-label={`Editar ${item.title}`}
                >
                  <Pencil className="h-5 w-5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                disabled={pending}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                aria-label={`Eliminar ${item.title}`}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
