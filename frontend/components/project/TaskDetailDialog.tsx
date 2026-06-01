"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, AlertTriangle, Clock, Calendar as CalendarIcon, Send, Check, X, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useApproveTask,
  useDeleteTask,
  useTaskComments,
  useAddComment,
  useUpdateTask,
  useUpdateTaskStatus,
  useAddTaskAssignee,
  useRemoveTaskAssignee,
  useMarkMyProgress,
} from "@/lib/hooks/useTasks";
import { useProjectMembers } from "@/lib/hooks/useProjects";
import { extractErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import type { TaskResp, TaskStatus, TaskPriority } from "@/types/api";

const STATUS_LABEL: Record<TaskStatus, { label: string; cls: string; bar: string }> = {
  new: { label: "Mới", cls: "bg-bg text-text2", bar: "bg-text3" },
  in_progress: { label: "Đang làm", cls: "bg-[#DBEAFE] text-[#2563EB]", bar: "bg-[#2563EB]" },
  pending_review: { label: "Chờ duyệt", cls: "bg-[#FEF3C7] text-rag-amber", bar: "bg-rag-amber" },
  done: { label: "Hoàn thành", cls: "bg-[#DCFCE7] text-rag-green", bar: "bg-rag-green" },
  rejected: { label: "Từ chối", cls: "bg-[#FEE2E2] text-rag-red", bar: "bg-rag-red" },
};

const PRIORITY_LABEL: Record<TaskPriority, { label: string; cls: string }> = {
  low: { label: "Thấp", cls: "bg-[#DCFCE7] text-[#16A34A]" },
  medium: { label: "Trung bình", cls: "bg-[#FEF3C7] text-[#D97706]" },
  high: { label: "Cao", cls: "bg-[#FEE2E2] text-[#DC2626]" },
  urgent: { label: "Khẩn", cls: "bg-pink/15 text-pink" },
};

export function TaskDetailDialog({
  task,
  projectId,
  canManage = false,
  open,
  onOpenChange,
}: {
  task: TaskResp | null;
  projectId: string;
  canManage?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");
  const currentUser = useAuthStore((s) => s.user);
  const updateStatus = useUpdateTaskStatus(projectId);
  const updateTask = useUpdateTask(projectId);
  const approve = useApproveTask(projectId);
  const del = useDeleteTask(projectId);
  const addAssignee = useAddTaskAssignee(projectId);
  const removeAssignee = useRemoveTaskAssignee(projectId);
  const markProgress = useMarkMyProgress(projectId);
  const { data: members = [] } = useProjectMembers(projectId);
  const { data: comments = [], isLoading: loadingComments } = useTaskComments(open ? task?.id : undefined);
  const addComment = useAddComment(task?.id);

  if (!task) return null;

  const myAssignment = task.assignees?.find((a) => a.id === currentUser?.id);
  const isAssignee = !!myAssignment;
  const isCreator = task.created_by === currentUser?.id;
  const canEditTeam = canManage || isCreator; // thêm/bớt người: người tạo hoặc PM/Admin
  const canAct = canManage || isAssignee; // mở lại / xóa
  const busy = updateStatus.isPending || approve.isPending || del.isPending;
  const assignedIds = new Set(task.assignees?.map((a) => a.id) || []);
  const pct = task.assignee_count ? Math.round((task.done_count / task.assignee_count) * 100) : 0;
  const allDone = task.assignee_count > 0 && task.done_count === task.assignee_count;
  const status = STATUS_LABEL[task.status];

  const canEditInfo = canAct && task.status !== "done"; // sửa tên/mô tả (trừ task đã hoàn thành)

  const startEdit = () => {
    setTitleDraft(task.title);
    setDescDraft(task.description || "");
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!titleDraft.trim()) {
      toast.error("Tên công việc không được trống");
      return;
    }
    try {
      await updateTask.mutateAsync({
        id: task.id,
        payload: {
          phase_id: task.phase_id,
          title: titleDraft.trim(),
          description: descDraft,
          priority: task.priority,
          assignee_id: task.assignee_id || undefined,
          due_date: task.due_date || undefined,
          estimated_hours: task.estimated_hours,
        },
      });
      toast.success("Đã lưu thay đổi");
      setEditing(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể lưu"));
    }
  };

  const onPickAssignee = async (userId: string) => {
    if (!userId) return;
    try {
      await addAssignee.mutateAsync({ taskId: task.id, userId });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể thêm người"));
    }
  };

  const doRemoveAssignee = async (userId: string) => {
    try {
      await removeAssignee.mutateAsync({ taskId: task.id, userId });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể bớt người"));
    }
  };

  const toggleMyProgress = async () => {
    try {
      await markProgress.mutateAsync({ taskId: task.id, done: !myAssignment?.is_done });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể cập nhật"));
    }
  };

  const changeStatus = async (status: TaskStatus, okMsg: string) => {
    try {
      await updateStatus.mutateAsync({ id: task.id, status });
      toast.success(okMsg);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể đổi trạng thái"));
    }
  };

  const doApprove = async (action: "approve" | "reject") => {
    try {
      await approve.mutateAsync({ id: task.id, action });
      toast.success(action === "approve" ? "Đã duyệt công việc" : "Đã từ chối — chuyển lại Đang làm");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể duyệt"));
    }
  };

  const doDelete = async () => {
    if (!confirm("Xóa công việc này?")) return;
    try {
      await del.mutateAsync(task.id);
      toast.success("Đã xóa công việc");
      onOpenChange(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể xóa"));
    }
  };

  const submitComment = async () => {
    const text = comment.trim();
    if (!text) return;
    try {
      await addComment.mutateAsync(text);
      setComment("");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể gửi bình luận"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid max-h-[90vh] w-[94vw] max-w-3xl grid-rows-[auto_1fr] gap-0 overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="gap-0 border-b border-border px-6 py-4 pr-12">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", status.cls)}>
              {status.label}
            </span>
            <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", PRIORITY_LABEL[task.priority]?.cls)}>
              {PRIORITY_LABEL[task.priority]?.label}
            </span>
            {task.due_date && (
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]",
                  task.is_overdue ? "bg-rag-red/10 font-medium text-rag-red" : "bg-bg text-text2",
                )}
              >
                {task.is_overdue ? <AlertTriangle className="h-3 w-3" /> : <CalendarIcon className="h-3 w-3" />}
                {task.is_overdue ? "Quá hạn · " : "Hạn · "}
                {formatDate(task.due_date)}
              </span>
            )}
          </div>
          {editing ? (
            <>
              <DialogTitle className="sr-only">{task.title}</DialogTitle>
              <Input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                placeholder="Tên công việc"
                className="text-lg font-bold"
              />
            </>
          ) : (
            <div className="flex items-start gap-2">
              <DialogTitle className="flex-1 text-lg font-bold leading-snug">{task.title}</DialogTitle>
              {canEditInfo && (
                <button
                  type="button"
                  onClick={startEdit}
                  className="mt-0.5 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-text3 hover:bg-bg hover:text-text"
                  aria-label="Sửa"
                >
                  <Pencil className="h-3 w-3" /> Sửa
                </button>
              )}
            </div>
          )}
        </DialogHeader>

        {/* Body: nội dung chính + cột phụ */}
        <div className="grid grid-cols-1 overflow-hidden sm:grid-cols-[1fr_16rem]">
          {/* Cột chính */}
          <div className="flex min-h-0 flex-col overflow-y-auto px-6 py-5">
            {/* Hero tiến độ */}
            <div className="rounded-xl border border-border bg-gradient-to-br from-pink/[0.06] to-orange/[0.06] p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-text3">Tiến độ hoàn thành</span>
                <span className={cn("text-sm font-bold", allDone ? "text-rag-green" : "text-text")}>
                  {task.done_count}/{task.assignee_count || 0}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-border/70">
                <div
                  className={cn("h-full rounded-full transition-all", allDone ? "bg-rag-green" : "bg-gradient-brand")}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-text3">
                {task.status === "done"
                  ? "Công việc đã được duyệt hoàn thành."
                  : task.status === "rejected"
                    ? "Công việc bị từ chối — mở lại để làm tiếp."
                    : task.assignee_count === 0
                      ? "Chưa có người thực hiện."
                      : allDone
                        ? "Tất cả đã xong — chờ PM/Admin duyệt."
                        : "Hoàn thành khi tất cả thành viên đánh dấu xong."}
              </p>
            </div>

            {/* Mô tả */}
            <div className="mt-5">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text3">Mô tả</div>
              {editing ? (
                <>
                  <Textarea
                    rows={4}
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                    placeholder="Mô tả công việc…"
                  />
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" disabled={updateTask.isPending} onClick={saveEdit}>
                      {updateTask.isPending ? "Đang lưu…" : "Lưu thay đổi"}
                    </Button>
                    <Button size="sm" variant="ghost" disabled={updateTask.isPending} onClick={() => setEditing(false)}>
                      Hủy
                    </Button>
                  </div>
                </>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-text2">
                  {task.description || "Chưa có mô tả."}
                </p>
              )}
            </div>

            {/* Bình luận */}
            <div className="mt-6 flex-1">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-text3">
                Bình luận {comments.length > 0 && `· ${comments.length}`}
              </div>
              <div className="flex flex-col gap-3.5">
                {loadingComments ? (
                  <p className="text-xs text-text3">Đang tải...</p>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-text3">Chưa có bình luận. Hãy mở đầu cuộc trao đổi.</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="flex gap-2.5">
                      <Avatar name={c.author?.full_name || "?"} size="sm" />
                      <div className="min-w-0 flex-1 rounded-lg rounded-tl-sm bg-bg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{c.author?.full_name || "Ẩn danh"}</span>
                          <span className="text-[10px] text-text3">{formatDateTime(c.created_at)}</span>
                        </div>
                        <p className="mt-0.5 whitespace-pre-wrap text-sm text-text2">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 flex items-end gap-2">
                <Textarea
                  rows={2}
                  placeholder="Viết bình luận…  (Ctrl/⌘ + Enter để gửi)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitComment();
                  }}
                />
                <Button
                  size="sm"
                  disabled={addComment.isPending || !comment.trim()}
                  onClick={submitComment}
                  className="self-end"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Cột phụ: người thực hiện + meta + hành động */}
          <aside className="flex min-h-0 flex-col gap-5 overflow-y-auto border-t border-border bg-bg/40 px-5 py-5 sm:border-l sm:border-t-0">
            {/* Người thực hiện */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-text3">Người thực hiện</span>
                <span className="text-[11px] text-text3">{task.assignee_count || 0}</span>
              </div>
              <div className="flex flex-col gap-1">
                {(task.assignees || []).map((a) => (
                  <div key={a.id} className="group flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-white">
                    <div className="relative">
                      <Avatar name={a.full_name} size="sm" />
                      {a.is_done && (
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-rag-green ring-2 ring-bg">
                          <Check className="h-2 w-2 text-white" />
                        </span>
                      )}
                    </div>
                    <span className="flex-1 truncate text-[12px] font-medium">
                      {a.full_name}
                      {a.id === currentUser?.id && <span className="text-text3"> · Tôi</span>}
                    </span>
                    {canEditTeam && task.assignees.length > 1 && (
                      <button
                        type="button"
                        onClick={() => doRemoveAssignee(a.id)}
                        className="text-text3 opacity-0 transition-opacity hover:text-rag-red group-hover:opacity-100"
                        aria-label="Bớt"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {task.assignee_count === 0 && <p className="px-1.5 text-[11px] text-text3">Chưa có ai.</p>}
              </div>

              {canEditTeam && members.filter((m) => !assignedIds.has(m.id)).length > 0 && (
                <div className="mt-2">
                  <Select value="" onValueChange={onPickAssignee} disabled={addAssignee.isPending}>
                    <SelectTrigger className="h-8 w-full text-[12px]">
                      <SelectValue placeholder="+ Thêm người…" />
                    </SelectTrigger>
                    <SelectContent>
                      {members
                        .filter((m) => !assignedIds.has(m.id))
                        .map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.full_name || m.username}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isAssignee && task.status !== "done" && task.status !== "rejected" && (
                <Button
                  size="sm"
                  variant={myAssignment?.is_done ? "ghost" : "primary"}
                  disabled={markProgress.isPending}
                  onClick={toggleMyProgress}
                  className="mt-3 w-full"
                >
                  {myAssignment?.is_done ? "↩ Bỏ đánh dấu" : "✓ Hoàn thành phần của tôi"}
                </Button>
              )}
            </div>

            {/* Thông tin */}
            <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-text3">Ước tính</div>
                <div className="mt-1 flex items-center gap-1 font-medium">
                  <Clock className="h-3 w-3 text-text3" /> {task.estimated_hours || 0}h
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-text3">Thực tế</div>
                <div className="mt-1 font-medium">{task.actual_hours || 0}h</div>
              </div>
            </div>

            {/* Hành động */}
            <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
              {task.status === "pending_review" &&
                (canManage ? (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" disabled={busy} onClick={() => doApprove("approve")}>
                      ✓ Duyệt
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1 text-rag-red hover:bg-rag-red/10" disabled={busy} onClick={() => doApprove("reject")}>
                      ✕ Từ chối
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg bg-rag-amber/10 px-3 py-2 text-center text-[11px] font-medium text-rag-amber">
                    Đang chờ PM/Admin duyệt…
                  </div>
                ))}
              {(task.status === "done" || task.status === "rejected") && canAct && (
                <Button size="sm" variant="ghost" className="w-full" disabled={busy} onClick={() => changeStatus("in_progress", "Đã mở lại công việc")}>
                  Mở lại công việc
                </Button>
              )}
              {canAct && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={doDelete}
                  className="w-full text-rag-red hover:bg-rag-red/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Xóa công việc
                </Button>
              )}
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
