import { createClient } from "@/lib/supabase/server";
import { ConfigTabs } from "@/components/caregiver/ConfigTabs";
import { PageHeader } from "@/components/layout/page-header";
import { getElderWithAvatar } from "@/lib/data/elder-display";
import { getMedicalCatalog } from "@/app/actions/medical-catalog";
import { requireElderCarePage } from "@/lib/elders/page-access";
import { elderCarePath } from "@/lib/elders/routes";
import { selectOrEmpty } from "@/lib/supabase/safe-query";
import type {
  Appointment,
  FoodRule,
  MealSchedule,
  Medication,
  RoutineActivity,
} from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { elderId } = await requireElderCarePage(slug, "configuracion");
  const supabase = await createClient();

  const elder = await getElderWithAvatar(elderId);

  const [medications, appointments, foodRules, routineActivities, mealSchedules, catalog] =
    await Promise.all([
      selectOrEmpty<Medication>(
        supabase.from("medications").select("*").eq("elder_id", elderId).order("created_at")
      ),
      selectOrEmpty<Appointment>(
        supabase.from("appointments").select("*").eq("elder_id", elderId).order("starts_at")
      ),
      selectOrEmpty<FoodRule>(
        supabase.from("food_rules").select("*").eq("elder_id", elderId).order("created_at")
      ),
      selectOrEmpty<RoutineActivity>(
        supabase
          .from("routine_activities")
          .select("*")
          .eq("elder_id", elderId)
          .order("created_at")
      ),
      selectOrEmpty<MealSchedule>(
        supabase.from("meal_schedules").select("*").eq("elder_id", elderId).order("created_at")
      ),
      getMedicalCatalog(elderId),
    ]);

  return (
    <div className="p-4 pb-24 lg:p-8 lg:pb-8">
      <PageHeader
        title={`Plan de cuidado · ${elder?.full_name}`}
        description="Configure medicamentos, citas médicas, actividades de rutina y reglas alimenticias. Los cambios se reflejan en el portal del adulto mayor y en las alertas."
        breadcrumbs={[
          { label: "Mis personas", href: "/cuidador" },
          { label: elder?.full_name ?? "Plan", href: elderCarePath(slug, "dashboard") },
          { label: "Plan de cuidado" },
        ]}
        avatar={
          elder ? { name: elder.full_name, url: elder.avatar_url } : undefined
        }
      />

      <ConfigTabs
        elderId={elderId}
        medications={medications}
        appointments={appointments}
        foodRules={foodRules}
        routineActivities={routineActivities}
        mealSchedules={mealSchedules}
        catalog={catalog}
      />
    </div>
  );
}
