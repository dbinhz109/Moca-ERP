"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-[7px] text-xs font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink/40",
  {
    variants: {
      variant: {
        primary: "bg-gradient-brand text-white shadow-sm hover:shadow-md hover:brightness-105",
        ghost: "bg-transparent text-text2 border border-border hover:bg-bg",
        danger: "bg-rag-red text-white hover:brightness-110",
        outline: "bg-white text-text border border-border hover:bg-bg",
        link: "text-pink underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-7 px-2.5 text-[11px]",
        md: "h-8 px-3.5",
        lg: "h-10 px-5 text-sm",
        icon: "h-8 w-8 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
