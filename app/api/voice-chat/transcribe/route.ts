import { NextRequest, NextResponse } from "next/server";
import { getElderForApi, unauthorizedResponse } from "@/lib/auth/require-elder-api";
import { hasOpenAI } from "@/lib/openai/client";
import { transcribeAudio } from "@/lib/openai/transcribe";

export async function POST(req: NextRequest) {
  const elder = await getElderForApi();
  if (!elder) return unauthorizedResponse();

  if (!hasOpenAI()) {
    return NextResponse.json(
      { error: "OpenAI no está configurado" },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const audio = formData.get("audio");

  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "Audio no recibido" }, { status: 400 });
  }

  const buffer = Buffer.from(await audio.arrayBuffer());
  const filename =
    audio instanceof File && audio.name ? audio.name : "recording.webm";

  try {
    const text = await transcribeAudio(buffer, filename, elder.full_name);
    if (!text) {
      return NextResponse.json(
        { error: "No se pudo entender el audio. Intente hablar de nuevo." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text, source: "whisper" });
  } catch {
    return NextResponse.json(
      { error: "Error al transcribir el audio" },
      { status: 500 }
    );
  }
}
