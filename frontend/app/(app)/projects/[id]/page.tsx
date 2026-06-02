"use client";

import { use, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Users } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useProject, useProjectMembers, useSetProjectPm } from "@/lib/hooks/useProjects";
import { usePhases } from "@/lib/hooks/usePhases";
import { useProjectTasks, useUpdateTaskStatus } from "@/lib/hooks/useTasks";
import { extractErrorMessage } from "@/lib/api";
import { KanbanBoard } from "@/components/project/KanbanBoard";
import { PhaseList } from "@/components/project/PhaseList";
import { MemberList } from "@/components/project/MemberList";
import { AddMemberDialog } from "@/components/project/AddMemberDialog";
import { CreateTaskDialog } from "@/components/project/CreateTaskDialog";
import { TaskDetailDialog } from "@/components/project/TaskDetailDialog";
import { RagBadge } from "@/components/project/RagBadge";
import { useAuthStore } from "@/store/authStore";
import { formatDate, formatVnd } from "@/lib/utils";
import type { ProjectMemberResp } from "@/types/api";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState("kanban");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { data: project, isLoading: loadingProject } = useProject(id);
  const { data: phases = [], isLoading: loadingPhases } = usePhases(id);
  const { data: tasks = [], isLoading: loadingTasks } = useProjectTasks(id);
  const { data: members = [], isLoading: loadingMembers } = useProjectMembers(id) as {
    data: ProjectMemberResp[];
    isLoading: boolean;
  };
  const currentUser = useAuthStore((s) => s.user);
  const canAssignOthers = currentUser?.role === "admin" || project?.pm_id === currentUser?.id;
  const updateStatus = useUpdateTaskStatus(id);
  const setPm = useSetProjectPm(id);

  const handleSetPm = async (userId: string) => {
    try {
      await setPm.mutateAsync(userId);
      toast.success("Đã đổi PM dự án");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể đổi PM"));
      throw err;
    }
  };

  const moveTask = async (taskId: string, toStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id: taskId, status: toStatus as never });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể chuyển trạng thái"));
    }
  };

  return (
    <div className="flex h-full flex-col">
      <Topbar
        breadcrumb={
          <>
            <Link href="/projects" className="hover:underline">
              Dự án
            </Link>{" "}
            /{" "}
            <span className="font-medium text-text">
              {project ? `[${project.code}] ${project.name}` : "..."}
            </span>
          </>
        }
      />

      <div className="border-b border-border bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/projects"
              className="flex items-center gap-1 text-sm text-text2 hover:text-text"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại
            </Link>
            <div>
              <h1 className="text-lg font-bold">
                {project ? `[${project.code}] ${project.name}` : loadingProject ? "Đang tải..." : "Không tìm thấy"}
              </h1>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-text2">
                <span>PM: {project?.pm_name || "—"}</span>
                {project && <RagBadge status={project.rag_status} />}
                {project && (
                  <span>
                    {formatDate(project.start_date)} → {formatDate(project.end_date)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-text2">
              <Users className="h-3.5 w-3.5" /> {project?.member_count ?? 0}
            </div>
            <CreateTaskDialog
              projectId={id}
              phases={phases}
              canAssignOthers={canAssignOthers}
              trigger={<Button size="sm" disabled={!phases.length}>+ Tạo công việc</Button>}
            />
          </div>
        </div>

        {project && (
          <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-5">
            <Stat label="Tiến độ" value={`${Math.round(project.progress)}%`} progress={project.progress} />
            <Stat label="Tasks" value={project.task_count} />
            <Stat label="Giai đoạn" value={phases.length} />
            <Stat label="Thành viên" value={project.member_count} />
            <Stat label="Quỹ thưởng" value={formatVnd(project.bonus_pool)} />
          </div>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="px-5">
          <TabsTrigger value="kanban">⊞ Kanban</TabsTrigger>
          <TabsTrigger value="phases">⧖ Giai đoạn</TabsTrigger>
          <TabsTrigger value="resources">👥 Nguồn lực</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
          {loadingTasks ? (
            <div className="p-5 text-sm text-text2">Đang tải tasks...</div>
          ) : (
            <KanbanBoard
              tasks={tasks}
              onTaskClick={(t) => setSelectedTaskId(t.id)}
              onMoveTask={moveTask}
            />
          )}
        </TabsContent>

        <TabsContent value="phases" className="flex-1 overflow-y-auto p-5 data-[state=inactive]:hidden">
          {loadingPhases ? (
            <div className="text-sm text-text2">Đang tải giai đoạn...</div>
          ) : (
            <PhaseList phases={phases} />
          )}
        </TabsContent>

        <TabsContent value="resources" className="flex-1 overflow-y-auto p-5 data-[state=inactive]:hidden">
          {project && (
            <div className="mb-4 flex items-center justify-between rounded-[10px] border border-border bg-white px-4 py-3">
              <div className="text-xs text-text2">
                Quỹ thưởng:{" "}
                <span className="font-semibold text-text">{formatVnd(project.bonus_pool)}</span>
                {" · "}Đã phân bổ:{" "}
                <span className="font-semibold text-rag-amber">{formatVnd(project.bonus_allocated)}</span>
                {" · "}Còn lại:{" "}
                <span className="font-semibold text-rag-green">
                  {formatVnd(project.bonus_pool - project.bonus_allocated)}
                </span>
              </div>
              {canAssignOthers && (
                <AddMemberDialog
                  projectId={id}
                  pool={project.bonus_pool}
                  allocated={project.bonus_allocated}
                  members={members}
                />
              )}
            </div>
          )}
          {loadingMembers ? (
            <div className="text-sm text-text2">Đang tải thành viên...</div>
          ) : (
            <MemberList members={members} canManage={canAssignOthers} onSetPm={handleSetPm} />
          )}
        </TabsContent>
      </Tabs>

      <TaskDetailDialog
        projectId={id}
        task={tasks.find((t) => t.id === selectedTaskId) ?? null}
        canManage={canAssignOthers}
        open={selectedTaskId !== null}
        onOpenChange={(o) => !o && setSelectedTaskId(null)}
      />
    </div>
  );
}

function Stat({ label, value, progress }: { label: string; value: number | string; progress?: number }) {
  return (
    <div className="rounded-lg bg-bg px-3 py-2">
      <div className="text-[10px] font-medium text-text2 uppercase tracking-wide">{label}</div>
      <div className="mt-0.5 text-sm font-bold">{value}</div>
      {typeof progress === "number" && (
        <div className="mt-1.5 h-1 rounded-full bg-border">
          <div
            className="h-full rounded-full bg-gradient-brand"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}
