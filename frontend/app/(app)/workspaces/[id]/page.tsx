"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { useWorkspace } from "@/lib/hooks/useWorkspaces";
import { useProjects } from "@/lib/hooks/useProjects";
import { ProjectCard } from "@/components/project/ProjectCard";
import { CreateProjectDialog } from "@/components/project/CreateProjectDialog";
import { Button } from "@/components/ui/button";

export default function WorkspaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: ws } = useWorkspace(id);
  const { data: projectsResp, isLoading } = useProjects();
  const projects = (projectsResp?.projects || []).filter((p) => p.workspace_id === id);

  return (
    <>
      <Topbar
        breadcrumb={
          <>
            <Link href="/workspaces" className="hover:underline">Workspace</Link> /{" "}
            <span className="font-medium text-text">{ws?.name || "..."}</span>
          </>
        }
      />
      <div className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <Link
            href="/workspaces"
            className="flex items-center gap-1 text-sm text-text2 hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Link>
        </div>

        <div className="mb-6 rounded-xl border border-border bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-lg"
                style={{ background: ws?.color || "linear-gradient(135deg,#FF6B9D,#FFB347)" }}
              />
              <div>
                <h1 className="text-xl font-bold">{ws?.name || "..."}</h1>
                <p className="mt-0.5 text-sm text-text2">{ws?.description || "Không có mô tả"}</p>
              </div>
            </div>
            <CreateProjectDialog
              defaultWorkspaceId={id}
              trigger={<Button>+ Tạo dự án</Button>}
            />
          </div>
        </div>

        <h2 className="mb-3 text-sm font-semibold">Dự án trong workspace ({projects.length})</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[140px] animate-pulse rounded-xl border border-border bg-white" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center text-sm text-text2">
            Workspace này chưa có dự án.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>
    </>
  );
}
