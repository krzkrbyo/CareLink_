"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ElderSection {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface ElderSectionNavProps {
  sections: ElderSection[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function ElderSectionNav({ sections, activeId, onSelect }: ElderSectionNavProps) {
  return (
    <nav
      aria-label="Secciones del portal"
      className="sticky top-0 z-30 -mx-4 mb-6 border-b border-care-secondary/50 bg-white/90 px-4 py-3 backdrop-blur-sm lg:top-0"
    >
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              onSelect(id);
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
              activeId === id
                ? "bg-care-accent-dark text-white shadow-sm"
                : "bg-care-primary text-care-muted hover:bg-care-secondary/50"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
