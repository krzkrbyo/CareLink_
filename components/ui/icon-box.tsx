import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const toneStyles = {
  accent: "bg-care-accent/30 text-care-accent-darker",
  secondary: "bg-care-secondary/60 text-care-foreground",
  danger: "bg-red-100 text-red-700",
  success: "bg-green-100 text-green-700",
  muted: "bg-care-primary text-care-muted",
} as const;

const sizeStyles = {
  sm: "h-9 w-9 [&_svg]:h-4 [&_svg]:w-4",
  md: "h-11 w-11 [&_svg]:h-5 [&_svg]:w-5",
  lg: "h-14 w-14 [&_svg]:h-7 [&_svg]:w-7",
  xl: "h-16 w-16 [&_svg]:h-8 [&_svg]:w-8",
} as const;

interface IconBoxProps {
  icon: LucideIcon;
  tone?: keyof typeof toneStyles;
  size?: keyof typeof sizeStyles;
  className?: string;
}

export function IconBox({
  icon: Icon,
  tone = "accent",
  size = "md",
  className,
}: IconBoxProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl",
        toneStyles[tone],
        sizeStyles[size],
        className
      )}
    >
      <Icon />
    </div>
  );
}
