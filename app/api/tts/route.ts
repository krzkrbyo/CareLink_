import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  generateSpeech,
  getElevenLabsVoiceId,
  hasElevenLabs,
  speechToBase64,
} from "@/lib/elevenlabs/tts";
import { FALLBACK_TTS_TEXTS } from "@/lib/demo-data/fallback-messages";

const schema = z.object({
  text: z.string().optional(),
  type: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = schema.parse(await req.json());
  const text =
    body.text ??
    FALLBACK_TTS_TEXTS[body.type ?? "medication"] ??
    FALLBACK_TTS_TEXTS.medication;

  if (!hasElevenLabs()) {
    return NextResponse.json(
      { error: "ElevenLabs no configurado", source: "fallback", text },
      { status: 503 }
    );
  }

  const speech = await generateSpeech(text);
  if ("error" in speech) {
    return NextResponse.json({ error: speech.error, source: "fallback", text }, { status: 502 });
  }

  return NextResponse.json({
    audioBase64: speechToBase64(speech.audio),
    audioMimeType: "audio/mpeg",
    voiceId: getElevenLabsVoiceId(),
    source: "elevenlabs",
    text,
  });
}
