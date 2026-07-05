import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Elder } from "@/lib/auth/session";

export async function getElderForApi(): Promise<Elder | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: elder } = await supabase
    .from("elders")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  return elder;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}
