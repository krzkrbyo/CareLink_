import {
  ELEVENLABS_MODEL_ID,
  ELEVENLABS_VOICE_ID,
} from "@/lib/elevenlabs/constants";
import { prepareTextForSpeech } from "@/lib/time/speech";

export function getElevenLabsVoiceId() {
  return process.env.ELEVENLABS_VOICE_ID?.trim() || ELEVENLABS_VOICE_ID;
}

export function getElevenLabsConfigError(): string | null {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  if (!key) {
    return "ELEVENLABS_API_KEY está vacía en .env. Guarde el archivo y reinicie npm run dev.";
  }
  return null;
}

export function hasElevenLabs() {
  return !getElevenLabsConfigError();
}

export async function generateSpeech(
  text: string
): Promise<{ audio: ArrayBuffer; voiceId: string } | { error: string }> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = getElevenLabsVoiceId();

  if (!apiKey) {
    return { error: "ELEVENLABS_API_KEY no configurada" };
  }

  const speechText = prepareTextForSpeech(text);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: speechText,
        model_id: ELEVENLABS_MODEL_ID,
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.85,
          style: 0.2,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return {
      error: `ElevenLabs ${res.status}: ${detail.slice(0, 200) || res.statusText}`,
    };
  }

  return { audio: await res.arrayBuffer(), voiceId };
}

export function speechToBase64(audio: ArrayBuffer): string {
  return Buffer.from(audio).toString("base64");
}
