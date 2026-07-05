"use client";

import { VoiceChatFloating } from "@/components/elder/VoiceChatFloating";
import { VoiceChatProvider } from "@/components/elder/voice-chat-context";

export function ElderVoiceChatShell({
  elderName,
  children,
}: {
  elderName: string;
  children: React.ReactNode;
}) {
  return (
    <VoiceChatProvider elderName={elderName}>
      {children}
      <VoiceChatFloating />
    </VoiceChatProvider>
  );
}
