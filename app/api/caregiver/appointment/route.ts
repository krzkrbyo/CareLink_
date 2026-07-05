import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";

const schema = z.object({
  elderId: z.string().uuid(),
  title: z.string(),
  type: z.enum(["cita", "examen"]),
  startsAt: z.string(),
});

export async function POST(req: NextRequest) {
  const body = schema.parse(await req.json());
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      elder_id: body.elderId,
      title: body.title,
      type: body.type,
      starts_at: new Date(body.startsAt).toISOString(),
      calendar_export_enabled: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, appointment: data });
}
