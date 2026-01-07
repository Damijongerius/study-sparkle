import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-nunito",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-pink-deep hover:scale-105 active:scale-95 shadow-soft",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 hover:scale-105",
        secondary: "bg-secondary text-secondary-foreground hover:bg-lavender-deep hover:scale-105 shadow-soft",
        ghost: "hover:bg-primary/10 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        cute: "bg-gradient-primary text-primary-foreground hover:scale-105 active:scale-95 shadow-glow border-2 border-pink-soft/50",
        mint: "bg-mint text-accent-foreground hover:bg-mint-deep hover:scale-105 active:scale-95 shadow-soft",
        timer: "bg-card border-2 border-primary/30 text-foreground hover:border-primary hover:bg-primary/5 hover:scale-105 transition-all",
        timerActive: "bg-primary text-primary-foreground scale-105 shadow-glow border-2 border-primary",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-xl px-4",
        lg: "h-14 rounded-2xl px-8 text-base",
        xl: "h-16 rounded-3xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
