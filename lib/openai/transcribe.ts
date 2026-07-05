import { toFile } from "openai";
import { getOpenAIClient, hasOpenAI } from "@/lib/openai/client";

const WHISPER_PROMPT =
  "Conversación en español de México. Un adulto mayor habla con CareLink sobre medicamentos, pastillas, citas médicas, comida, presión arterial, cómo se siente, ayuda, familia y rutina diaria.";

export async function transcribeAudio(
  buffer: Buffer,
  filename: string,
  elderName?: string
): Promise<string | null> {
  if (!hasOpenAI()) return null;

  const openai = getOpenAIClient();
  const file = await toFile(buffer, filename);

  const prompt = elderName
    ? `${WHISPER_PROMPT} El adulto mayor se llama ${elderName}.`
    : WHISPER_PROMPT;

  const result = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: "es",
    prompt,
    temperature: 0,
  });

  return result.text?.trim() || null;
}
