"use client";

import { useState } from "react";
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
import { useAddProjectMember, useUsers } from "@/lib/hooks/useProjects";
import { extractErrorMessage } from "@/lib/api";
import { formatVnd } from "@/lib/utils";
import type { ProjectMemberResp } from "@/types/api";

export function AddMemberDialog({
  projectId,
  pool,
  allocated,
  members,
}: {
  projectId: string;
  pool: number;
  allocated: number;
  members: ProjectMemberResp[];
}) {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [bonus, setBonus] = useState(0);
  const { data: users = [] } = useUsers();
  const add = useAddProjectMember(projectId);

  const memberIds = new Set(members.map((m) => m.id));
  const remaining = pool - allocated;

  const onSubmit = async () => {
    if (!userId) {
      toast.error("Chọn thành viên");
      return;
    }
    try {
      await add.mutateAsync({ user_id: userId, bonus_amount: bonus });
      toast.success("Đã thêm thành viên");
      setUserId("");
      setBonus(0);
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể thêm thành viên"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">+ Thêm thành viên</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm thành viên</DialogTitle>
          <DialogDescription>
            Quỹ thưởng còn lại: <span className="font-semibold text-rag-green">{formatVnd(remaining)}</span>{" "}
            / {formatVnd(pool)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Thành viên</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn người" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter((u) => !memberIds.has(u.id))
                  .map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name || u.username}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="m-bonus">Tiền thưởng khi hoàn thành (VND)</Label>
            <Input
              id="m-bonus"
              type="number"
              min={0}
              step={1000}
              value={bonus || ""}
              onChange={(e) => setBonus(Number(e.target.value) || 0)}
            />
            {bonus > remaining && (
              <p className="mt-1 text-[11px] text-rag-red">
                Vượt quỹ còn lại ({formatVnd(remaining)}).
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button type="button" onClick={onSubmit} disabled={add.isPending || bonus > remaining}>
            {add.isPending ? "Đang thêm..." : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
