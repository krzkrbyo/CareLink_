"use client";

import { useState } from "react";
import { Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playSpeechFromTtsResponse } from "@/lib/voice-chat/play-audio";

interface ReminderPlayerProps {
  reminderType?: string;
  defaultText?: string;
}

export function ReminderPlayer({
  reminderType = "medication",
  defaultText,
}: ReminderPlayerProps) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");

  async function playReminder() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: defaultText,
          type: reminderType,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo generar el audio");
      }

      setPlaying(true);
      await playSpeechFromTtsResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reproducir");
    } finally {
      setPlaying(false);
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        size="lg"
        variant="secondary"
        onClick={() => void playReminder()}
        disabled={loading || playing}
        className="w-full text-lg"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
        {playing ? "Reproduciendo..." : "Escuchar recordatorio"}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
