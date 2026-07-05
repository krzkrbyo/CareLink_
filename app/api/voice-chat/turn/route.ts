import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getElderForApi, unauthorizedResponse } from "@/lib/auth/require-elder-api";
import { hasOpenAI } from "@/lib/openai/client";
import { transcribeAudio } from "@/lib/openai/transcribe";
import {
  generateSpeech,
  getElevenLabsConfigError,
  getElevenLabsVoiceId,
  hasElevenLabs,
  speechToBase64,
} from "@/lib/elevenlabs/tts";
import { generateVoiceChatReply } from "@/lib/voice-chat/generate-reply";
import { loadElderChatContext } from "@/lib/voice-chat/elder-context";
import { logVoiceChatTurn } from "@/lib/voice-chat/log-turn";

const historySchema = z.array(
  z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })
);

/** Un solo request: audio → texto → respuesta → voz ElevenLabs. */
export async function POST(req: NextRequest) {
  const elder = await getElderForApi();
  if (!elder) return unauthorizedResponse();

  if (!hasOpenAI()) {
    return NextResponse.json({ error: "OpenAI no configurado" }, { status: 503 });
  }

  if (!hasElevenLabs()) {
    return NextResponse.json(
      { error: getElevenLabsConfigError() ?? "ElevenLabs no configurado" },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const audio = formData.get("audio");
  const historyRaw = formData.get("history");

  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "Audio no recibido" }, { status: 400 });
  }

  if (audio.size < 1000) {
    return NextResponse.json(
      { error: "Audio muy corto. Hable un poco más antes de enviar." },
      { status: 422 }
    );
  }

  let history: { role: "user" | "assistant"; content: string }[] = [];
  if (typeof historyRaw === "string" && historyRaw) {
    history = historySchema.parse(JSON.parse(historyRaw));
  }

  const buffer = Buffer.from(await audio.arrayBuffer());
  const ext = audio.type.includes("mp4") ? "recording.mp4" : "recording.webm";

  const [userText, dayContext] = await Promise.all([
    transcribeAudio(buffer, ext, elder.full_name),
    loadElderChatContext(elder),
  ]);

  if (!userText) {
    return NextResponse.json(
      { error: "No se pudo entender. Hable más claro y cerca del micrófono." },
      { status: 422 }
    );
  }

  const chatResult = await generateVoiceChatReply(
    elder.full_name,
    userText,
    history,
    dayContext
  );

  const speech = await generateSpeech(chatResult.reply);
  if ("error" in speech) {
    return NextResponse.json(
      { error: `No se pudo generar la voz: ${speech.error}` },
      { status: 502 }
    );
  }

  void logVoiceChatTurn(elder.id, elder.full_name, userText, chatResult).catch(
    console.error
  );

  return NextResponse.json({
    userText,
    reply: chatResult.reply,
    audioBase64: speechToBase64(speech.audio),
    audioMimeType: "audio/mpeg",
    voiceId: getElevenLabsVoiceId(),
    ttsSource: "elevenlabs",
    chatSource: chatResult.source,
    suggestAlert: chatResult.suggestAlert,
  });
}
