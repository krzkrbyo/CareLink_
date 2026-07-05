import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const markSizes = {
  sm: "h-8 w-8",
  md: "h-11 w-11",
  lg: "h-14 w-14",
  xl: "h-16 w-16",
} as const;

const iconSizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
  xl: "h-8 w-8",
} as const;

const textSizes = {
  sm: "text-lg",
  md: "text-xl sm:text-2xl",
  lg: "text-2xl",
  xl: "text-3xl",
} as const;

type CareLinkLogoSize = keyof typeof markSizes;

interface CareLinkLogoMarkProps {
  size?: CareLinkLogoSize;
  pulse?: boolean;
  className?: string;
}

export function CareLinkLogoMark({ size = "md", pulse = false, className }: CareLinkLogoMarkProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl bg-care-accent-dark text-white shadow-md",
        markSizes[size],
        pulse && "landing-logo-pulse",
        className
      )}
      aria-hidden
    >
      <Heart className={iconSizes[size]} />
    </div>
  );
}

interface CareLinkLogoProps {
  size?: CareLinkLogoSize;
  pulse?: boolean;
  showText?: boolean;
  href?: string;
  className?: string;
  textClassName?: string;
}

export function CareLinkLogo({
  size = "md",
  pulse = false,
  showText = true,
  href,
  className,
  textClassName,
}: CareLinkLogoProps) {
  const content = (
    <>
      <CareLinkLogoMark size={size} pulse={pulse} />
      {showText && (
        <span className={cn("font-bold text-care-foreground", textSizes[size], textClassName)}>
          CareLink
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn("flex items-center gap-3", className)} aria-label="CareLink">
        {content}
      </Link>
    );
  }

  return <div className={cn("flex items-center gap-3", className)}>{content}</div>;
}
