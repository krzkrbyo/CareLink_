import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";

const schema = z.object({
  elderId: z.string().uuid(),
  label: z.string(),
  type: z.enum(["allergen", "prohibited", "reduce", "recommendation"]),
});

export async function POST(req: NextRequest) {
  const body = schema.parse(await req.json());
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("food_rules")
    .insert({
      elder_id: body.elderId,
      label: body.label,
      type: body.type,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, foodRule: data });
}
