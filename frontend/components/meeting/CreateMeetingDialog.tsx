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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateMeeting } from "@/lib/hooks/useMeetings";
import { useProjects } from "@/lib/hooks/useProjects";
import { extractErrorMessage } from "@/lib/api";

const schema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc").max(300),
  type: z.enum(["review", "standup", "board", "other"]),
  start_time: z.string().min(1, "Thời gian bắt đầu là bắt buộc"),
  meeting_url: z.string().optional(),
  project_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CreateMeetingDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const create = useCreateMeeting();
  const { data: projectsResp } = useProjects();
  const projects = projectsResp?.projects || [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "standup" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Convert local datetime to ISO (giờ kết thúc do server tự đặt = bắt đầu + 1h)
      const payload = {
        ...values,
        start_time: new Date(values.start_time).toISOString(),
      };
      if (!payload.project_id) delete payload.project_id;
      await create.mutateAsync(payload);
      toast.success("Đã tạo lịch họp");
      reset({ type: "standup" });
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể tạo lịch họp"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>+ Tạo lịch họp</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lên lịch họp</DialogTitle>
          <DialogDescription>Tạo lịch họp mới và gắn vào dự án (tuỳ chọn).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label htmlFor="m-title">Tiêu đề</Label>
            <Input id="m-title" placeholder="Ví dụ: Daily standup" {...register("title")} />
            {errors.title && <p className="mt-1 text-[11px] text-rag-red">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Loại</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standup">Standup</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="board">Board</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label>Dự án</Label>
              <Controller
                name="project_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Không gắn dự án" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          [{p.code}] {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="m-start">Thời gian bắt đầu</Label>
            <Input id="m-start" type="datetime-local" {...register("start_time")} />
            {errors.start_time && (
              <p className="mt-1 text-[11px] text-rag-red">{errors.start_time.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="m-url">Link online</Label>
            <Input id="m-url" placeholder="https://meet.google.com/..." {...register("meeting_url")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Tạo lịch họp"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
