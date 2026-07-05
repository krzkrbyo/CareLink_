export async function playBase64Audio(
  audioBase64: string,
  mimeType = "audio/mpeg"
): Promise<void> {
  const audio = new Audio(`data:${mimeType};base64,${audioBase64}`);
  await new Promise<void>((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("No se pudo reproducir la voz de CareLink"));
    void audio.play().catch(reject);
  });
}

export async function playSpeechFromTtsResponse(data: {
  audioBase64?: string;
  audioUrl?: string;
  audioMimeType?: string;
  text?: string;
  source?: string;
}): Promise<void> {
  if (data.audioBase64) {
    await playBase64Audio(data.audioBase64, data.audioMimeType ?? "audio/mpeg");
    return;
  }

  if (data.source === "elevenlabs" || data.source === "elevenlabs-inline") {
    if (!data.audioUrl) throw new Error("Sin audio de ElevenLabs");
    const audio = new Audio(data.audioUrl);
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Error al reproducir audio"));
      void audio.play().catch(reject);
    });
    return;
  }

  throw new Error("ElevenLabs no disponible — no se usará voz del navegador");
}
