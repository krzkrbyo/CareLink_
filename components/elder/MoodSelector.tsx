"use client";

import { Smile, Meh, Frown, HeartCrack } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconBox } from "@/components/ui/icon-box";

const MOODS: {
  value: string;
  icon: LucideIcon;
  description: string;
  tone: "success" | "muted" | "secondary" | "accent";
}[] = [
  { value: "Bien", icon: Smile, description: "Me siento con ánimo", tone: "success" },
  { value: "Regular", icon: Meh, description: "Ni muy bien ni mal", tone: "muted" },
  { value: "Triste", icon: Frown, description: "Me siento decaído", tone: "secondary" },
  { value: "Solo", icon: HeartCrack, description: "Me siento solo", tone: "accent" },
];

interface MoodSelectorProps {
  onSelect: (mood: string) => void;
  loading?: boolean;
}

export function MoodSelector({ onSelect, loading }: MoodSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {MOODS.map(({ value, icon, description, tone }) => (
        <button
          key={value}
          type="button"
          disabled={loading}
          onClick={() => onSelect(value)}
          className={cn(
            "care-surface flex items-center gap-4 p-4 text-left transition-all hover:shadow-md disabled:opacity-50",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-care-accent/30"
          )}
        >
          <IconBox icon={icon} tone={tone} size="md" />
          <div>
            <p className="font-bold text-care-foreground">{value}</p>
            <p className="text-sm text-care-muted">{description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
