"use client";

import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconBox } from "@/components/ui/icon-box";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  icon: LucideIcon;
  iconTone?: "accent" | "secondary" | "danger" | "success" | "muted";
  title: string;
  description: string;
  actionLabel: string;
  onClick?: () => void;
  loading?: boolean;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
  prominent?: boolean;
  children?: React.ReactNode;
}

export function ActionCard({
  icon,
  iconTone = "accent",
  title,
  description,
  actionLabel,
  onClick,
  loading,
  variant = "default",
  className,
  prominent,
  children,
}: ActionCardProps) {
  return (
    <article
      className={cn(
        "care-surface flex flex-col gap-4 p-5 transition-shadow hover:shadow-md",
        prominent && "border-red-200 bg-gradient-to-br from-red-50/80 to-white",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <IconBox icon={icon} tone={iconTone} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold text-care-foreground">{title}</h3>
          <p className="mt-1 text-base text-care-muted">{description}</p>
        </div>
      </div>

      {children}

      {onClick && (
        <Button
          variant={variant}
          size="lg"
          onClick={onClick}
          disabled={loading}
          className="w-full text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Un momento...
            </>
          ) : (
            actionLabel
          )}
        </Button>
      )}
    </article>
  );
}
