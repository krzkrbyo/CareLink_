"use client";

import { useEffect, useRef } from "react";
import type { ChatStatus } from "@/components/elder/voice-chat-context";
import { cn } from "@/lib/utils";

export const VOICE_CHAT_AVATAR_SRC = "/avatar/tortuga.mp4";

type AvatarVariant = "featured" | "banner" | "fab" | "corner";

interface VoiceChatAvatarProps {
  status: ChatStatus;
  variant?: AvatarVariant;
  className?: string;
  /** Si es false, solo muestra el primer fotograma (evita 2 videos compitiendo). */
  playback?: boolean;
}

export function VoiceChatAvatar({
  status,
  variant = "banner",
  className,
  playback = true,
}: VoiceChatAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isSpeaking = status === "speaking";
  const isListening = status === "recording";
  const shouldAnimate = playback && isSpeaking;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const primeFrame = () => {
      if (shouldAnimate) return;
      video.pause();
      if (video.readyState >= 2) {
        video.currentTime = 0.01;
      }
    };

    video.addEventListener("loadeddata", primeFrame);
    video.addEventListener("canplay", primeFrame);

    if (video.readyState >= 2) primeFrame();

    return () => {
      video.removeEventListener("loadeddata", primeFrame);
      video.removeEventListener("canplay", primeFrame);
    };
  }, [shouldAnimate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (shouldAnimate) {
      video.currentTime = 0;
      void video.play().catch(() => {});
      return;
    }

    if (!video.paused) {
      video.pause();
    }
    if (video.readyState >= 2) {
      video.currentTime = 0.01;
    }
  }, [shouldAnimate]);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-care-primary/30",
        variant === "featured" && "aspect-video w-full max-h-72",
        variant === "banner" && "aspect-video w-full max-h-44",
        variant === "corner" && "aspect-square",
        variant === "fab" && "aspect-square h-full w-full",
        className
      )}
    >
      <video
        ref={videoRef}
        src={VOICE_CHAT_AVATAR_SRC}
        muted
        playsInline
        loop
        preload="auto"
        className="h-full w-full object-cover object-center"
        aria-hidden
      />

      {isSpeaking && playback && (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-care-accent-dark/90 via-care-accent-dark/40 to-transparent",
            variant === "corner" || variant === "fab" ? "px-1 pb-1 pt-4" : "px-3 pb-2 pt-8"
          )}
        >
          <p
            className={cn(
              "text-center font-semibold text-white",
              variant === "corner" || variant === "fab" ? "text-[10px] leading-tight" : "text-sm"
            )}
          >
            {variant === "corner" || variant === "fab" ? "Hablando…" : "Hablando con usted…"}
          </p>
        </div>
      )}

      {isListening && playback && (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-care-foreground/70 via-care-foreground/30 to-transparent",
            variant === "corner" || variant === "fab" ? "px-1 pb-1 pt-4" : "px-3 pb-2 pt-8"
          )}
        >
          <p
            className={cn(
              "text-center font-semibold text-white",
              variant === "corner" || variant === "fab" ? "text-[10px] leading-tight" : "text-sm"
            )}
          >
            Escuchando…
          </p>
        </div>
      )}

      {variant !== "fab" && status === "processing" && playback && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center bg-care-foreground/10 pb-2">
          <span
            className={cn(
              "rounded-full bg-white/90 font-semibold text-care-muted shadow",
              variant === "corner" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
            )}
          >
            Pensando…
          </span>
        </div>
      )}
    </div>
  );
}
