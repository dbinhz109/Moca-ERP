"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X } from "lucide-react";
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
import { useCreateProject, useUsers } from "@/lib/hooks/useProjects";
import { useWorkspaces } from "@/lib/hooks/useWorkspaces";
import { useQueryClient } from "@tanstack/react-query";
import { api, extractErrorMessage } from "@/lib/api";
import { formatVnd } from "@/lib/utils";
import type { ProjectResp } from "@/types/api";

const schema = z.object({
  workspace_id: z.string().optional(),
  code: z.string().min(1, "Mã dự án là bắt buộc").max(20),
  name: z.string().min(1, "Tên dự án là bắt buộc").max(300),
  type: z.string().min(1, "Loại dự án là bắt buộc"),
  description: z.string().optional(),
  start_date: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  end_date: z.string().min(1, "Ngày kết thúc là bắt buộc"),
  bonus_pool: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type MemberRow = { user_id: string; bonus_amount: number };

const PROJECT_TYPES = [
  { value: "stem", label: "STEM" },
  { value: "research", label: "Nghiên cứu (R&D)" },
  { value: "project", label: "Dự án" },
  { value: "internal", label: "Nội bộ" },
];

export function CreateProjectDialog({
  trigger,
  defaultWorkspaceId,
}: {
  trigger?: React.ReactNode;
  defaultWorkspaceId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const create = useCreateProject();
  const qc = useQueryClient();
  const { data: workspaces = [] } = useWorkspaces();
  const { data: users = [] } = useUsers();
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "project", workspace_id: defaultWorkspaceId, bonus_pool: "" },
  });

  const pool = Number(watch("bonus_pool")) || 0;
  const allocated = useMemo(
    () => members.reduce((sum, m) => sum + (Number(m.bonus_amount) || 0), 0),
    [members],
  );
  const overBudget = allocated > pool;

  const addMemberRow = () => setMembers((rows) => [...rows, { user_id: "", bonus_amount: 0 }]);
  const updateMemberRow = (idx: number, patch: Partial<MemberRow>) =>
    setMembers((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const removeMemberRow = (idx: number) =>
    setMembers((rows) => rows.filter((_, i) => i !== idx));

  const resetAll = () => {
    reset();
    setMembers([]);
  };

  const onSubmit = async (values: FormValues) => {
    const validMembers = members.filter((m) => m.user_id);
    if (overBudget) {
      toast.error("Tổng tiền thưởng thành viên vượt quá quỹ dự án");
      return;
    }
    try {
      const project = (await create.mutateAsync({
        code: values.code,
        name: values.name,
        type: values.type,
        description: values.description,
        start_date: values.start_date,
        end_date: values.end_date,
        bonus_pool: Number(values.bonus_pool) || 0,
        ...(values.workspace_id ? { workspace_id: values.workspace_id } : {}),
      })) as ProjectResp;

      // Thêm từng thành viên kèm tiền thưởng sau khi tạo dự án.
      for (const m of validMembers) {
        await api.post(`/projects/${project.id}/members`, {
          user_id: m.user_id,
          bonus_amount: Number(m.bonus_amount) || 0,
        });
      }
      qc.invalidateQueries({ queryKey: ["project", project.id, "members"] });

      toast.success(
        validMembers.length
          ? `Đã tạo dự án và thêm ${validMembers.length} thành viên`
          : "Đã tạo dự án",
      );
      resetAll();
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể tạo dự án"));
    }
  };

  const chosenIds = new Set(members.map((m) => m.user_id).filter(Boolean));

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetAll();
      }}
    >
      <DialogTrigger asChild>{trigger || <Button>+ Tạo dự án</Button>}</DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo dự án mới</DialogTitle>
          <DialogDescription>
            Khởi tạo dự án, đặt quỹ thưởng và phân bổ tiền thưởng cho thành viên.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="p-code">Mã dự án</Label>
              <Input id="p-code" placeholder="STEM-001" {...register("code")} />
              {errors.code && <p className="mt-1 text-[11px] text-rag-red">{errors.code.message}</p>}
            </div>
            <div>
              <Label htmlFor="p-type">Loại</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="mt-1 text-[11px] text-rag-red">{errors.type.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="p-name">Tên dự án</Label>
            <Input id="p-name" placeholder="Ví dụ: Robot giáo dục Moca v2" {...register("name")} />
            {errors.name && <p className="mt-1 text-[11px] text-rag-red">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="p-ws">Workspace</Label>
            <Controller
              name="workspace_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Không thuộc workspace nào" />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="p-start">Ngày bắt đầu</Label>
              <Input id="p-start" type="date" {...register("start_date")} />
              {errors.start_date && (
                <p className="mt-1 text-[11px] text-rag-red">{errors.start_date.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="p-end">Ngày kết thúc</Label>
              <Input id="p-end" type="date" {...register("end_date")} />
              {errors.end_date && (
                <p className="mt-1 text-[11px] text-rag-red">{errors.end_date.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="p-bonus">Tổng quỹ thưởng dự án (VND)</Label>
            <Input
              id="p-bonus"
              type="number"
              min={0}
              step={1000}
              placeholder="0"
              {...register("bonus_pool")}
            />
            {errors.bonus_pool && (
              <p className="mt-1 text-[11px] text-rag-red">{errors.bonus_pool.message}</p>
            )}
          </div>

          {/* Thành viên + tiền thưởng */}
          <div className="rounded-[10px] border border-border bg-bg/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <Label className="m-0">Thành viên & tiền thưởng</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addMemberRow}>
                + Thêm thành viên
              </Button>
            </div>

            {members.length === 0 ? (
              <p className="text-[11px] text-text2">
                Bạn là PM của dự án. Thêm thành viên và phân bổ tiền thưởng (có thể thêm sau).
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {members.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Select
                        value={row.user_id}
                        onValueChange={(v) => updateMemberRow(idx, { user_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn người" />
                        </SelectTrigger>
                        <SelectContent>
                          {users
                            .filter((u) => u.id === row.user_id || !chosenIds.has(u.id))
                            .map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.full_name || u.username}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      className="w-36"
                      placeholder="Tiền thưởng"
                      value={row.bonus_amount || ""}
                      onChange={(e) =>
                        updateMemberRow(idx, { bonus_amount: Number(e.target.value) || 0 })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeMemberRow(idx)}
                      className="text-text2 hover:text-rag-red"
                      aria-label="Xóa"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {(pool > 0 || allocated > 0) && (
              <div
                className={`mt-2 flex justify-between text-[11px] ${
                  overBudget ? "text-rag-red font-semibold" : "text-text2"
                }`}
              >
                <span>Đã phân bổ: {formatVnd(allocated)}</span>
                <span>Quỹ: {formatVnd(pool)}</span>
              </div>
            )}
            {overBudget && (
              <p className="mt-1 text-[11px] text-rag-red">
                Tổng tiền thưởng thành viên vượt quá quỹ dự án.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="p-desc">Mô tả</Label>
            <Textarea id="p-desc" placeholder="Mô tả ngắn..." {...register("description")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || overBudget}>
              {isSubmitting ? "Đang tạo..." : "Tạo dự án"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
