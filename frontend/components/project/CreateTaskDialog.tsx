"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTask } from "@/lib/hooks/useTasks";
import { useProjectMembers } from "@/lib/hooks/useProjects";
import { useAuthStore } from "@/store/authStore";
import { extractErrorMessage } from "@/lib/api";
import type { PhaseResp } from "@/types/api";

const UNASSIGNED = "none";

const schema = z.object({
  phase_id: z.string().min(1, "Chọn giai đoạn"),
  title: z.string().min(1, "Tên task là bắt buộc").max(500),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assignee_id: z.string().optional(),
  due_date: z.string().optional(),
  estimated_hours: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CreateTaskDialog({
  projectId,
  phases,
  trigger,
  canAssignOthers = true,
}: {
  projectId: string;
  phases: PhaseResp[];
  trigger?: React.ReactNode;
  canAssignOthers?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const create = useCreateTask(projectId);
  const { data: members = [] } = useProjectMembers(projectId);
  const currentUser = useAuthStore((s) => s.user);
  const defaultAssignee = currentUser?.id ?? UNASSIGNED;
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "medium", phase_id: phases[0]?.id, assignee_id: defaultAssignee },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const estStr = values.estimated_hours?.trim();
      const estimated = estStr ? Number(estStr) : undefined;
      const payload = {
        phase_id: values.phase_id,
        title: values.title,
        description: values.description,
        priority: values.priority,
        assignee_id: values.assignee_id && values.assignee_id !== UNASSIGNED ? values.assignee_id : undefined,
        due_date: values.due_date || undefined,
        estimated_hours: estimated !== undefined && !Number.isNaN(estimated) ? estimated : undefined,
      };
      await create.mutateAsync(payload);
      toast.success("Đã tạo task");
      reset({ priority: "medium", phase_id: phases[0]?.id, assignee_id: defaultAssignee });
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể tạo task"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>+ Tạo công việc</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm công việc</DialogTitle>
          <DialogDescription>Tạo task mới và gắn vào một giai đoạn của dự án.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label htmlFor="t-title">Tiêu đề</Label>
            <Input id="t-title" placeholder="Ví dụ: Thiết kế PCB mạch nguồn" {...register("title")} />
            {errors.title && <p className="mt-1 text-[11px] text-rag-red">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Giai đoạn</Label>
              <Controller
                name="phase_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giai đoạn" />
                    </SelectTrigger>
                    <SelectContent>
                      {phases.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.phase_id && <p className="mt-1 text-[11px] text-rag-red">{errors.phase_id.message}</p>}
            </div>
            <div>
              <Label>Ưu tiên</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Thấp</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="high">Cao</SelectItem>
                      <SelectItem value="urgent">Khẩn</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div>
            <Label>Người thực hiện</Label>
            {canAssignOthers ? (
              <>
                <Controller
                  name="assignee_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || UNASSIGNED} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chưa gán" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UNASSIGNED}>Chưa gán</SelectItem>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.full_name || m.username}
                            {m.id === currentUser?.id ? " (Tôi)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="mt-1 text-[11px] text-text3">
                  Mặc định gán cho bạn. PM/Admin có thể gán cho thành viên khác.
                </p>
              </>
            ) : (
              <>
                <div className="flex h-9 items-center rounded-md border border-border bg-bg/50 px-3 text-sm text-text2">
                  {currentUser?.full_name || currentUser?.username || "Tôi"} (Tôi)
                </div>
                <p className="mt-1 text-[11px] text-text3">
                  Chỉ PM/Admin mới được gán việc cho người khác.
                </p>
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="t-due">Hạn chót</Label>
              <Input id="t-due" type="date" {...register("due_date")} />
            </div>
            <div>
              <Label htmlFor="t-est">Số giờ ước tính</Label>
              <Input id="t-est" type="number" step="0.5" min="0" {...register("estimated_hours")} />
            </div>
          </div>
          <div>
            <Label htmlFor="t-desc">Mô tả</Label>
            <Textarea id="t-desc" {...register("description")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || !phases.length}>
              {isSubmitting ? "Đang tạo..." : "Tạo task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
