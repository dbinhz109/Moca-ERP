"use client";

import { cn } from "@/lib/utils";
import type { RagStatus } from "@/types/api";

const ragMap: Record<RagStatus, { dot: string; text: string; label: string }> = {
  green: { dot: "bg-rag-green", text: "text-rag-green", label: "Đúng tiến độ" },
  amber: { dot: "bg-rag-amber", text: "text-rag-amber", label: "Cảnh báo" },
  red: { dot: "bg-rag-red", text: "text-rag-red", label: "Trễ tiến độ" },
};

export function RagDot({ status, className }: { status: RagStatus; className?: string }) {
  return <span className={cn("h-2 w-2 flex-shrink-0 rounded-full", ragMap[status].dot, className)} aria-label={ragMap[status].label} />;
}

export function RagBadge({ status, withDot = true }: { status: RagStatus; withDot?: boolean }) {
  const m = ragMap[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", m.text)}>
      {withDot && <span className={cn("h-2 w-2 rounded-full", m.dot)} />}
      {m.label}
    </span>
  );
}

export const ragLabels = ragMap;
