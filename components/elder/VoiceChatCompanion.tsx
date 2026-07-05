"use client";

import { VoiceChatPanel } from "@/components/elder/VoiceChatPanel";

interface VoiceChatCompanionProps {
  elderName: string;
}

/** Vista completa del acompañante (pestaña del menú). Comparte estado con la burbuja flotante. */
export function VoiceChatCompanion(_props: VoiceChatCompanionProps) {
  return <VoiceChatPanel variant="embedded" />;
}
