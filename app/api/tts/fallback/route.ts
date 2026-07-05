import { NextRequest, NextResponse } from "next/server";
import { FALLBACK_TTS_TEXTS } from "@/lib/demo-data/fallback-messages";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "medication";
  const text = FALLBACK_TTS_TEXTS[type] ?? FALLBACK_TTS_TEXTS.medication;

  // Browser Speech Synthesis fallback via data URL with silent mp3 placeholder
  // Return a minimal valid silent MP3 for demo when ElevenLabs unavailable
  const silentMp3Base64 =
    "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwmHAAAAAAD/+1DEAAAHAAGf9AAAIAAANIAAAAQAAAGkAAAAAA";

  return NextResponse.json({
    audioUrl: `data:audio/mpeg;base64,${silentMp3Base64}`,
    text,
    note: "Fallback TTS — configure ELEVENLABS_API_KEY for voice",
  });
}
