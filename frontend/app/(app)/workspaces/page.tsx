"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/Topbar";
import { useWorkspaces, useDeleteWorkspace } from "@/lib/hooks/useWorkspaces";
import { CreateWorkspaceDialog } from "@/components/workspace/CreateWorkspaceDialog";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/ui/ConfirmDelete";
import { useAuthStore } from "@/store/authStore";
import { extractErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { FolderKanban } from "lucide-react";

export default function WorkspacesPage() {
  const { data: workspaces = [], isLoading } = useWorkspaces();
  const isAdmin = useAuthStore((s) => s.user?.role) === "admin";
  const deleteWorkspace = useDeleteWorkspace();

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkspace.mutateAsync(id);
      toast.success("Đã xoá workspace");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể xoá workspace"));
      throw err;
    }
  };

  return (
    <>
      <Topbar breadcrumb={<><span>Tổng quan</span> / <span className="font-medium text-text">Workspace</span></>} />
      <div className="p-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold">Workspace</h1>
            <p className="mt-0.5 text-sm text-text2">Nhóm dự án theo bộ phận hoặc chủ đề.</p>
          </div>
          {isAdmin && <CreateWorkspaceDialog trigger={<Button>+ Tạo workspace</Button>} />}
        </div>

        {isLoading ? (
          <SkeletonGrid />
        ) : workspaces.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center text-sm text-text2">
            Chưa có workspace nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workspaces.map((w) => (
              <div key={w.id} className="group relative">
                {isAdmin && (
                  <ConfirmDelete
                    className="absolute right-2 top-2 z-10"
                    ariaLabel={`Xoá workspace ${w.name}`}
                    title="Xoá workspace?"
                    description={`Xoá "${w.name}" sẽ xoá toàn bộ dự án, công việc bên trong. Không thể hoàn tác.`}
                    onConfirm={() => handleDelete(w.id)}
                  />
                )}
              <Link
                href={`/workspaces/${w.id}`}
                className="block rounded-xl border border-border bg-white p-4 transition-all hover:border-pink/30 hover:shadow-[0_4px_16px_rgba(255,107,157,0.12)]"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                    style={{ background: w.color || "linear-gradient(135deg,#FF6B9D,#FFB347)" }}
                  >
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{w.name}</div>
                    <div className="text-[11px] text-text2">Tạo {formatDate(w.created_at)}</div>
                  </div>
                </div>
                <p className="line-clamp-2 min-h-[2.5rem] text-[12px] text-text2">
                  {w.description || "—"}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-text2">
                  <span>{w.project_count} dự án</span>
                  <span className="text-pink opacity-0 transition-opacity group-hover:opacity-100">Mở →</span>
                </div>
              </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[140px] animate-pulse rounded-xl border border-border bg-white" />
      ))}
    </div>
  );
}
