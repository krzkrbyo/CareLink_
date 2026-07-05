import { createClient } from "@/lib/supabase/server";
import type { VoiceChatReply } from "@/lib/voice-chat/generate-reply";

export async function logVoiceChatTurn(
  elderId: string,
  elderName: string,
  userMessage: string,
  result: VoiceChatReply
) {
  const supabase = await createClient();

  await Promise.all([
    supabase.from("interactions").insert({
      elder_id: elderId,
      type: "voice_message",
      value: userMessage.slice(0, 500),
      metadata: { reply: result.reply.slice(0, 500) },
    }),
    supabase
      .from("elders")
      .update({ last_activity_at: new Date().toISOString() })
      .eq("id", elderId),
    result.suggestAlert
      ? supabase.from("alerts").insert({
          elder_id: elderId,
          severity: result.severity,
          type: result.alertType === "none" ? "mood" : result.alertType,
          message: `${elderName} compartió algo que requiere atención en el chat de voz.`,
          status: "active",
        })
      : Promise.resolve(),
  ]);
}
