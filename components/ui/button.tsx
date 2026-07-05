import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-care-accent-dark text-white shadow-md hover:bg-care-accent-darker focus-visible:ring-care-accent/40",
        secondary:
          "bg-care-secondary text-care-foreground shadow-sm hover:bg-care-secondary/80 focus-visible:ring-care-secondary",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300",
        outline:
          "border-4 border-care-accent-dark bg-white text-care-foreground hover:bg-care-primary focus-visible:ring-care-accent/30",
        ghost: "text-care-foreground hover:bg-care-secondary/40",
      },
      size: {
        default: "h-14 px-6 text-xl",
        lg: "h-20 px-8 text-2xl",
        xl: "h-24 w-full text-2xl",
        icon: "h-14 w-14",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
