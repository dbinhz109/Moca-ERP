"use client";

import { Check, AlertTriangle, Circle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { PhaseResp } from "@/types/api";

function phaseStatus(p: PhaseResp): "done" | "warn" | "todo" {
  if (p.progress >= 100) return "done";
  if (p.progress > 0) return "warn";
  return "todo";
}

export function PhaseList({ phases }: { phases: PhaseResp[] }) {
  if (!phases.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-white p-8 text-center text-sm text-text2">
        Chưa có giai đoạn nào. Hãy tạo giai đoạn đầu tiên.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {phases.map((p, idx) => {
        const status = phaseStatus(p);
        const pct = Math.round(p.progress);
        const fill =
          status === "done" ? "bg-gradient-brand" : status === "warn" ? "bg-rag-amber" : "bg-border";
        const pctColor =
          status === "done" ? "text-rag-green" : status === "warn" ? "text-rag-amber" : "text-text3";
        const icon =
          status === "done" ? (
            <Check className="h-4 w-4 text-rag-green" />
          ) : status === "warn" ? (
            <AlertTriangle className="h-4 w-4 text-rag-amber" />
          ) : (
            <Circle className="h-4 w-4 text-text3" />
          );

        return (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-[10px] border border-border bg-white px-4 py-3.5"
          >
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-pink/10 text-[11px] font-bold text-pink">
              {p.sort_order || idx + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold">{p.name}</div>
              <div className="text-[11px] text-text2">
                {p.start_date ? `${formatDate(p.start_date)} → ${formatDate(p.end_date)}` : "—"} · {p.task_count} tasks
              </div>
            </div>
            <div className="px-3 text-[11px] text-text2">Trọng số: {p.weight}%</div>
            <div className="w-[100px]">
              <div className={`mb-1 text-right text-[11px] font-semibold ${pctColor}`}>{pct}%</div>
              <div className="h-1.5 rounded-full bg-border">
                <div className={`h-full rounded-full ${fill}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="ml-2 flex-shrink-0">{icon}</div>
          </div>
        );
      })}
    </div>
  );
}
