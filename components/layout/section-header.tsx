import type { LucideIcon } from "lucide-react";
import { IconBox } from "@/components/ui/icon-box";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  tone?: "accent" | "secondary" | "danger" | "success" | "muted";
  className?: string;
}

export function SectionHeader({
  icon,
  title,
  description,
  tone = "accent",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-4 flex items-start gap-3", className)}>
      <IconBox icon={icon} tone={tone} size="md" />
      <div>
        <h2 className="text-lg font-bold text-care-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-care-muted">{description}</p>}
      </div>
    </div>
  );
}
