import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";

const schema = z.object({
  elderId: z.string().uuid(),
  type: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  message: z.string(),
});

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-n8n-secret");
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = schema.parse(await req.json());
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("alerts")
      .insert({
        elder_id: body.elderId,
        type: body.type,
        severity: body.severity,
        message: body.message,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    if (body.type === "missed_medication") {
      await supabase
        .from("reminders")
        .update({ status: "missed" })
        .eq("elder_id", body.elderId)
        .eq("type", "medication")
        .eq("status", "pending");
    }

    return NextResponse.json({ success: true, alert: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 }
    );
  }
}
