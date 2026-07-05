import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getElderForApi, unauthorizedResponse } from "@/lib/auth/require-elder-api";
import { generateVoiceChatReply } from "@/lib/voice-chat/generate-reply";
import { loadElderChatContext } from "@/lib/voice-chat/elder-context";
import { logVoiceChatTurn } from "@/lib/voice-chat/log-turn";

const schema = z.object({
  message: z.string().min(1),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

export async function POST(req: NextRequest) {
  const elder = await getElderForApi();
  if (!elder) return unauthorizedResponse();

  const body = schema.parse(await req.json());
  const dayContext = await loadElderChatContext(elder);
  const result = await generateVoiceChatReply(
    elder.full_name,
    body.message,
    body.history ?? [],
    dayContext
  );

  void logVoiceChatTurn(elder.id, elder.full_name, body.message, result).catch(
    console.error
  );

  return NextResponse.json(result);
}
