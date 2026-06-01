"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Calendar as CalendarIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn, formatDate } from "@/lib/utils";
import type { TaskResp, TaskStatus, TaskPriority } from "@/types/api";

const COLUMNS: { id: TaskStatus; label: string; accent?: string }[] = [
  { id: "new", label: "Mới" },
  { id: "in_progress", label: "Đang làm" },
  { id: "pending_review", label: "Chờ duyệt", accent: "bg-[#FEF3C7] text-rag-amber" },
  { id: "done", label: "Hoàn thành", accent: "bg-[#DCFCE7] text-rag-green" },
];

const priorityMap: Record<TaskPriority, { label: string; cls: string }> = {
  low: { label: "Thấp", cls: "bg-[#DCFCE7] text-[#16A34A]" },
  medium: { label: "Trung bình", cls: "bg-[#FEF3C7] text-[#D97706]" },
  high: { label: "Cao", cls: "bg-[#FEE2E2] text-[#DC2626]" },
  urgent: { label: "Khẩn", cls: "bg-pink/15 text-pink" },
};

interface KanbanBoardProps {
  tasks: TaskResp[];
  onAddTask?: (status: TaskStatus) => void;
  onTaskClick?: (task: TaskResp) => void;
  onMoveTask?: (taskId: string, toStatus: TaskStatus) => void;
}

export function KanbanBoard({ tasks, onAddTask, onTaskClick, onMoveTask }: KanbanBoardProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<TaskStatus | null>(null);

  const grouped = useMemo(() => {
    const g: Record<TaskStatus, TaskResp[]> = {
      new: [],
      in_progress: [],
      pending_review: [],
      done: [],
      rejected: [],
    };
    for (const t of tasks) {
      (g[t.status] ||= []).push(t);
    }
    return g;
  }, [tasks]);

  const handleDrop = (toStatus: TaskStatus) => {
    setOverCol(null);
    const id = dragId;
    setDragId(null);
    if (!id) return;
    const t = tasks.find((x) => x.id === id);
    if (t && t.status !== toStatus) onMoveTask?.(id, toStatus);
  };

  return (
    <div className="flex h-full flex-1 gap-3 overflow-x-auto px-5 py-4">
      {COLUMNS.map((col) => {
        const list = grouped[col.id] || [];
        const isOver = overCol === col.id;
        return (
          <div key={col.id} className="flex w-[280px] flex-shrink-0 flex-col">
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-md text-[10px] font-bold",
                    col.accent || "bg-bg text-text2"
                  )}
                >
                  {list.length}
                </span>
                {col.label}
              </div>
              {col.id === "in_progress" && (
                <span className="text-[10px] text-text3">WIP: {list.length}/5</span>
              )}
            </div>
            <div
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                if (overCol !== col.id) setOverCol(col.id);
              }}
              onDragLeave={(e) => {
                if (e.currentTarget === e.target) setOverCol(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(col.id);
              }}
              className={cn(
                "flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto rounded-xl p-1 transition-colors",
                isOver && "bg-pink/5 outline-2 outline-dashed outline-pink/40"
              )}
            >
              {list.map((task) => (
                <button
                  key={task.id}
                  draggable
                  onDragStart={(e) => {
                    setDragId(task.id);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", task.id);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverCol(null);
                  }}
                  onClick={() => onTaskClick?.(task)}
                  className={cn(
                    "w-full cursor-grab rounded-[10px] border bg-white p-3 text-left transition-all hover:border-pink/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:cursor-grabbing",
                    task.status === "pending_review" ? "border-rag-amber/40" : "border-border",
                    task.status === "done" ? "opacity-60" : "",
                    dragId === task.id ? "opacity-40 ring-2 ring-pink/40" : ""
                  )}
                >
                  <div
                    className={cn(
                      "mb-2 text-xs font-medium leading-snug",
                      task.status === "done" && "line-through"
                    )}
                  >
                    {task.title}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", priorityMap[task.priority]?.cls || "")}>
                      {priorityMap[task.priority]?.label || task.priority}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {task.assignee_count > 1 && (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                            task.done_count === task.assignee_count
                              ? "bg-[#DCFCE7] text-rag-green"
                              : "bg-bg text-text2"
                          )}
                        >
                          {task.done_count}/{task.assignee_count}
                        </span>
                      )}
                      <div className="flex -space-x-1.5">
                        {(task.assignees && task.assignees.length > 0
                          ? task.assignees.slice(0, 3)
                          : [{ id: "none", full_name: task.assignee_name || "?", is_done: false }]
                        ).map((a) => (
                          <span key={a.id} className="rounded-full ring-1 ring-white">
                            <Avatar name={a.full_name} size="xs" />
                          </span>
                        ))}
                        {task.assignee_count > 3 && (
                          <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-bg text-[9px] font-semibold text-text2 ring-1 ring-white">
                            +{task.assignee_count - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {task.due_date && (
                    <div
                      className={cn(
                        "mt-2 flex items-center gap-1 text-[10px]",
                        task.is_overdue ? "text-rag-red font-medium" : "text-text3"
                      )}
                    >
                      {task.is_overdue ? <AlertTriangle className="h-3 w-3" /> : <CalendarIcon className="h-3 w-3" />}
                      {task.is_overdue ? "Quá hạn · " : ""}
                      {formatDate(task.due_date)}
                    </div>
                  )}
                </button>
              ))}
              {onAddTask && col.id !== "done" && (
                <button
                  onClick={() => onAddTask(col.id)}
                  className="mt-1 w-full rounded-lg border border-dashed border-border bg-transparent p-2 text-xs text-text3 transition-colors hover:border-pink hover:bg-pink/5 hover:text-pink"
                >
                  + Thêm công việc
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
