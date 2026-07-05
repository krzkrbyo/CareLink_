import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { elderCarePath } from "@/lib/elders/routes";

export async function revalidateElderCarePaths(elderId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("elders").select("slug").eq("id", elderId).single();

  if (data?.slug) {
    const sections = ["dashboard", "configuracion", "perfil"] as const;
    for (const section of sections) {
      revalidatePath(elderCarePath(data.slug, section), "page");
    }
    revalidatePath(`/cuidador/${data.slug}`, "layout");
  }

  revalidatePath("/cuidador", "layout");
  revalidatePath("/cuidador/resumen", "page");
  revalidatePath("/adulto", "layout");
}
