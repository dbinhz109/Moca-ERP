"use client";

import Link from "next/link";
import { Users, ListTodo } from "lucide-react";
import { RagDot } from "./RagBadge";
import type { ProjectResp } from "@/types/api";

const ragGradient: Record<string, string> = {
  green: "bg-gradient-brand",
  amber: "bg-rag-amber",
  red: "bg-rag-red",
};

export function ProjectCard({ project }: { project: ProjectResp }) {
  const pct = Math.round((project.progress || 0) * 100) / 100;
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-xl border border-border bg-white p-4 transition-all hover:border-pink/30 hover:shadow-[0_4px_16px_rgba(255,107,157,0.12)]"
    >
      <div className="mb-2 flex items-start justify-between">
        <span className="rounded-full bg-pink/10 px-2 py-0.5 text-[10px] font-semibold text-pink uppercase">
          {project.type}
        </span>
        <RagDot status={project.rag_status} className="mt-1" />
      </div>
      <div className="mb-1 line-clamp-2 text-[13px] font-semibold leading-tight">
        [{project.code}] {project.name}
      </div>
      <div className="mb-3 text-[11px] text-text2 truncate">PM: {project.pm_name || "—"}</div>
      <div className="mb-2 h-1 rounded-full bg-border">
        <div className={`h-full rounded-full ${ragGradient[project.rag_status] || "bg-gradient-brand"}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex gap-3 text-[11px] text-text2">
        <span className="flex items-center gap-1"><ListTodo className="h-3 w-3" /> {project.task_count} tasks</span>
        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {project.member_count} người</span>
        <span className="ml-auto font-medium text-text">{pct}%</span>
      </div>
    </Link>
  );
}
