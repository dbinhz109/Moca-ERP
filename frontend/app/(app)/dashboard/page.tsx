"use client";

import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/lib/hooks/useProjects";
import { useWorkspaces } from "@/lib/hooks/useWorkspaces";
import { useMeetings } from "@/lib/hooks/useMeetings";
import { useAuthStore } from "@/store/authStore";
import { CreateProjectDialog } from "@/components/project/CreateProjectDialog";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: workspaces = [] } = useWorkspaces();
  const { data: projectsResp, isLoading: loadingProjects } = useProjects();
  const projects = projectsResp?.projects || [];
  const { data: meetingsResp } = useMeetings();
  const meetings = meetingsResp?.meetings || [];
  const upcomingMeetings = meetings
    .filter((m) => new Date(m.start_time).getTime() > Date.now() - 86400000)
    .slice(0, 5);

  const overdue = projects.reduce((acc, p) => (p.rag_status === "red" ? acc + 1 : acc), 0);
  const onTrack = projects.reduce((acc, p) => (p.rag_status === "green" ? acc + 1 : acc), 0);
  const totalTasks = projects.reduce((acc, p) => acc + (p.task_count || 0), 0);

  const today = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <>
      <Topbar breadcrumb={<span className="font-medium text-text">Dashboard</span>} />
      <div className="p-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold">Xin chào, {user?.full_name?.split(" ").pop() || user?.username || "bạn"} 👋</h1>
          <p className="mt-0.5 text-sm text-text2 capitalize">{today}</p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <StatCard label="Dự án của tôi" value={projects.length} sub={`🟢 ${onTrack} đúng tiến độ · 🔴 ${overdue} trễ`} highlight />
          <StatCard label="Workspace" value={workspaces.length} sub="Đang quản lý" />
          <StatCard label="Tổng công việc" value={totalTasks} sub={`${projects.length} dự án đang chạy`} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Dự án đang tham gia</h2>
              <div className="flex gap-2">
                <Link
                  href="/projects"
                  className="rounded-[7px] border border-border bg-white px-3 py-1.5 text-xs text-text2 hover:bg-bg"
                >
                  Xem tất cả
                </Link>
                <CreateProjectDialog trigger={<Button size="sm">+ Tạo dự án</Button>} />
              </div>
            </div>

            {loadingProjects ? (
              <SkeletonGrid />
            ) : projects.length === 0 ? (
              <EmptyState text="Chưa có dự án nào. Hãy tạo dự án đầu tiên." />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {projects.slice(0, 6).map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Lịch họp sắp tới</h2>
              <Link href="/meetings" className="text-xs text-pink hover:underline">
                Xem lịch
              </Link>
            </div>
            <div className="rounded-xl border border-border bg-white">
              {upcomingMeetings.length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-text3">Chưa có cuộc họp sắp tới.</div>
              )}
              {upcomingMeetings.map((m) => (
                <div key={m.id} className="border-b border-border px-4 py-3 last:border-0">
                  <div className="line-clamp-1 text-[13px] font-semibold">{m.title}</div>
                  <div className="mt-1 text-[11px] text-text2">
                    {formatDate(m.start_time)} · {m.location || (m.meeting_url ? "Online" : "—")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: number | string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-white px-5 py-4">
      <div className="text-xs font-medium text-text2">{label}</div>
      <div className={`mt-1 text-3xl font-bold leading-none ${highlight ? "text-gradient-brand" : "text-text"}`}>
        {value}
      </div>
      {sub && <div className="mt-1.5 text-[11px] text-text3">{sub}</div>}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[140px] animate-pulse rounded-xl border border-border bg-white" />
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center text-sm text-text2">
      {text}
    </div>
  );
}
