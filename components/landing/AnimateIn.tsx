"use client";

import { cn } from "@/lib/utils";
import { useInView } from "./use-in-view";

type Animation = "fade-up" | "fade-in" | "scale-in" | "slide-right" | "slide-left";

interface AnimateInProps {
  children: React.ReactNode;
  className?: string;
  animation?: Animation;
  delay?: number;
  as?: "div" | "section" | "article" | "li";
}

export function AnimateIn({
  children,
  className,
  animation = "fade-up",
  delay = 0,
  as: Tag = "div",
}: AnimateInProps) {
  const { ref, inView } = useInView();

  return (
    <Tag
      ref={(node: HTMLElement | null) => {
        ref.current = node;
      }}
      className={cn(
        "landing-animate",
        inView && "landing-animate-visible",
        `landing-animate-${animation}`,
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
