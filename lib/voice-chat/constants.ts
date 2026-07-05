/** Nombre del acompañante de voz de CareLink. */
export const VOICE_COMPANION_NAME = "Link";

export function getVoiceCompanionWelcomeMessage(elderName: string): string {
  const name = elderName.trim();
  return `Hola, ${name}. Soy ${VOICE_COMPANION_NAME}, tu acompañante personal. Presione el micrófono y hable conmigo.`;
}
