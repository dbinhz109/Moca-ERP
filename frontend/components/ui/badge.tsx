"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "pink" | "amber" | "green" | "red" | "purple" | "neutral";
}

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  pink: "bg-pink/10 text-pink",
  amber: "bg-[#FEF3C7] text-[#D97706]",
  green: "bg-[#DCFCE7] text-[#16A34A]",
  red: "bg-[#FEE2E2] text-[#DC2626]",
  purple: "bg-[#EDE9FE] text-[#7C3AED]",
  neutral: "bg-bg text-text2",
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-medium rounded-full px-2 py-0.5",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
