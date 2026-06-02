"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarClock, Link2, Search, Check, Loader2 } from "lucide-react";
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
import { Avatar } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateMeeting } from "@/lib/hooks/useMeetings";
import { useProjects, useUsers } from "@/lib/hooks/useProjects";
import { extractErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { MeetingType } from "@/types/api";

const schema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc").max(300),
  type: z.enum(["review", "standup", "board", "other"]),
  start_time: z.string().min(1, "Thời gian bắt đầu là bắt buộc"),
  meeting_url: z.string().optional(),
  project_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const TYPE_OPTIONS: { value: MeetingType; label: string }[] = [
  { value: "standup", label: "Standup" },
  { value: "review", label: "Review" },
  { value: "board", label: "Board" },
  { value: "other", label: "Khác" },
];

export function CreateMeetingDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [attendees, setAttendees] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const create = useCreateMeeting();
  const { data: projectsResp } = useProjects();
  const { data: users = [] } = useUsers();
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

  const filteredUsers = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return users;
    return users.filter(
      (u) =>
        (u.full_name || "").toLowerCase().includes(s) ||
        (u.username || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s)
    );
  }, [users, search]);

  const toggleAttendee = (id: string) =>
    setAttendees((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const resetAll = () => {
    reset({ type: "standup" });
    setAttendees([]);
    setSearch("");
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: Record<string, unknown> = {
        ...values,
        start_time: new Date(values.start_time).toISOString(),
      };
      if (!payload.project_id) delete payload.project_id;
      if (attendees.length) payload.attendee_ids = attendees;
      await create.mutateAsync(payload as never);
      toast.success(
        attendees.length
          ? `Đã tạo lịch họp · mời ${attendees.length} người`
          : "Đã tạo lịch họp"
      );
      resetAll();
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể tạo lịch họp"));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetAll();
      }}
    >
      <DialogTrigger asChild>{trigger || <Button>+ Tạo lịch họp</Button>}</DialogTrigger>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="flex-row items-center gap-3 border-b border-border bg-gradient-to-r from-pink/10 to-orange/10 px-5 py-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-sm">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <DialogTitle>Lên lịch họp</DialogTitle>
            <DialogDescription className="text-xs">
              Mời thành viên — hệ thống tự gửi thông báo kèm link và nhắc trước 5 phút.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="max-h-[62vh] space-y-4 overflow-y-auto px-5 py-4">
            {/* Tiêu đề */}
            <div>
              <Label htmlFor="m-title">Tiêu đề</Label>
              <Input id="m-title" placeholder="Ví dụ: Daily standup" {...register("title")} />
              {errors.title && <p className="mt-1 text-[11px] text-rag-red">{errors.title.message}</p>}
            </div>

            {/* Loại họp — pills */}
            <div>
              <Label>Loại họp</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <div className="mt-1 grid grid-cols-4 gap-1.5">
                    {TYPE_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => field.onChange(o.value)}
                        className={cn(
                          "rounded-lg border px-2 py-1.5 text-[12px] font-medium transition-colors",
                          field.value === o.value
                            ? "border-pink bg-pink/10 text-pink"
                            : "border-border bg-white text-text2 hover:bg-bg"
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Thời gian + Dự án */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="m-start">Thời gian bắt đầu</Label>
                <Input id="m-start" type="datetime-local" {...register("start_time")} />
                {errors.start_time && (
                  <p className="mt-1 text-[11px] text-rag-red">{errors.start_time.message}</p>
                )}
              </div>
              <div>
                <Label>Dự án</Label>
                <Controller
                  name="project_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Không gắn" />
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

            {/* Link online */}
            <div>
              <Label htmlFor="m-url">Link online</Label>
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text3" />
                <Input id="m-url" className="pl-8" placeholder="https://meet.google.com/..." {...register("meeting_url")} />
              </div>
            </div>

            {/* Người tham dự */}
            <div>
              <div className="flex items-center justify-between">
                <Label>Người tham dự</Label>
                {attendees.length > 0 && (
                  <span className="rounded-full bg-pink/10 px-2 py-0.5 text-[10px] font-semibold text-pink">
                    đã chọn {attendees.length}
                  </span>
                )}
              </div>
              <div className="relative mt-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text3" />
                <Input
                  className="pl-8"
                  placeholder="Tìm người để mời..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-border">
                {filteredUsers.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-text3">Không tìm thấy người dùng</div>
                ) : (
                  filteredUsers.map((u) => {
                    const picked = attendees.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggleAttendee(u.id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 border-b border-border px-3 py-2 text-left last:border-b-0 transition-colors",
                          picked ? "bg-pink/5" : "hover:bg-bg"
                        )}
                      >
                        <Avatar name={u.full_name || u.username} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12px] font-medium">{u.full_name || u.username}</div>
                          <div className="truncate text-[10px] text-text2">{u.email || u.username}</div>
                        </div>
                        <span
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-full border",
                            picked ? "border-pink bg-gradient-brand text-white" : "border-border"
                          )}
                        >
                          {picked && <Check className="h-3 w-3" />}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border px-5 py-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Đang tạo..." : "Tạo lịch họp"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
