"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/project/ProjectCard";
import { CreateProjectDialog } from "@/components/project/CreateProjectDialog";
import { useProjects } from "@/lib/hooks/useProjects";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

type RagFilter = "all" | "green" | "amber" | "red";

const filters: { id: RagFilter; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "green", label: "Đúng tiến độ" },
  { id: "amber", label: "Cảnh báo" },
  { id: "red", label: "Trễ" },
];

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [rag, setRag] = useState<RagFilter>("all");
  const { data: resp, isLoading } = useProjects();
  const projects = resp?.projects || [];
  const isAdmin = useAuthStore((s) => s.user?.role) === "admin";

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (rag !== "all" && p.rag_status !== rag) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!p.name.toLowerCase().includes(s) && !p.code.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [projects, rag, search]);

  return (
    <>
      <Topbar
        breadcrumb={
          <>
            <span>Quản lý dự án</span> / <span className="font-medium text-text">Dự án</span>
          </>
        }
      />
      <div className="p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Dự án</h1>
            <p className="mt-0.5 text-sm text-text2">{resp?.total ?? 0} dự án trong hệ thống.</p>
          </div>
          {isAdmin && <CreateProjectDialog />}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px] max-w-[320px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text3" />
            <Input
              className="pl-8"
              placeholder="Tìm dự án..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setRag(f.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] whitespace-nowrap transition-colors",
                  rag === f.id
                    ? "bg-pink/10 border-pink text-pink font-medium"
                    : "border-border bg-white text-text2 hover:bg-bg"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[140px] animate-pulse rounded-xl border border-border bg-white" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center text-sm text-text2">
            Không có dự án nào khớp bộ lọc.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>
    </>
  );
}
