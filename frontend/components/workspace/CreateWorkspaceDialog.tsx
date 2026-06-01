"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { useCreateWorkspace } from "@/lib/hooks/useWorkspaces";
import { extractErrorMessage } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1, "Tên workspace là bắt buộc").max(200),
  description: z.string().optional(),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const PRESET_COLORS = ["#FF6B9D", "#FFB347", "#10B981", "#F59E0B", "#EF4444", "#7C3AED"];

export function CreateWorkspaceDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const create = useCreateWorkspace();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { color: "#FF6B9D" },
  });
  const color = watch("color");

  const onSubmit = async (values: FormValues) => {
    try {
      await create.mutateAsync(values);
      toast.success("Đã tạo workspace");
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể tạo workspace"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>+ Tạo workspace</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo workspace mới</DialogTitle>
          <DialogDescription>Workspace giúp gom nhóm các dự án theo bộ phận hoặc chủ đề.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="ws-name">Tên workspace</Label>
            <Input id="ws-name" placeholder="Ví dụ: Phòng STEM" {...register("name")} />
            {errors.name && <p className="mt-1 text-[11px] text-rag-red">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="ws-desc">Mô tả</Label>
            <Textarea id="ws-desc" placeholder="Mô tả ngắn..." {...register("description")} />
          </div>
          <div>
            <Label>Màu</Label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setValue("color", c)}
                  className={`h-7 w-7 rounded-full ring-2 ring-offset-2 transition-all ${color === c ? "ring-text" : "ring-transparent"}`}
                  style={{ background: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Tạo workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
