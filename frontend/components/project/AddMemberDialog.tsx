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
  const [advance, setAdvance] = useState(0); // ứng cá nhân (trừ)
  const [expense, setExpense] = useState(0); // chi mua đồ (được bù)
  const { data: users = [] } = useUsers();
  const add = useAddProjectMember(projectId);

  const selected = members.find((m) => m.id === userId);
  const isExisting = !!selected;
  // Quỹ còn lại: nếu sửa người đã có thì cộng lại phần thưởng cũ của họ.
  const remaining = pool - allocated + (selected?.bonus_amount || 0);
  const bonusOver = bonus > remaining;
  const advanceOver = advance > bonus;
  const net = bonus - advance + expense;

  const pickUser = (v: string) => {
    setUserId(v);
    const m = members.find((x) => x.id === v);
    setBonus(m?.bonus_amount || 0);
    setAdvance(m?.advance_amount || 0);
    setExpense(m?.expense_amount || 0);
  };

  const close = () => {
    setOpen(false);
    setUserId("");
    setBonus(0);
    setAdvance(0);
    setExpense(0);
  };

  const onSubmit = async () => {
    if (!userId) {
      toast.error("Chọn thành viên");
      return;
    }
    try {
      await add.mutateAsync({
        user_id: userId,
        bonus_amount: bonus,
        advance_amount: advance,
        expense_amount: expense,
      });
      toast.success(isExisting ? "Đã cập nhật thành viên" : "Đã thêm thành viên");
      close();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể lưu thành viên"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <DialogTrigger asChild>
        <Button size="sm">+ Thêm / sửa thành viên</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isExisting ? "Cập nhật thành viên" : "Thêm thành viên"}</DialogTitle>
          <DialogDescription>
            Quỹ thưởng còn lại:{" "}
            <span className="font-semibold text-rag-green">{formatVnd(remaining)}</span> / {formatVnd(pool)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Thành viên</Label>
            <Select value={userId} onValueChange={pickUser}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn người" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => {
                  const inProject = members.some((m) => m.id === u.id);
                  return (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name || u.username}
                      {inProject ? " · đã trong dự án" : ""}
                    </SelectItem>
                  );
                })}
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
            {bonusOver && (
              <p className="mt-1 text-[11px] text-rag-red">Vượt quỹ còn lại ({formatVnd(remaining)}).</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="m-adv">Ứng cá nhân (trừ thưởng)</Label>
              <Input
                id="m-adv"
                type="number"
                min={0}
                step={1000}
                value={advance || ""}
                onChange={(e) => setAdvance(Number(e.target.value) || 0)}
              />
              {advanceOver && (
                <p className="mt-1 text-[11px] text-rag-red">Không được vượt tiền thưởng.</p>
              )}
            </div>
            <div>
              <Label htmlFor="m-exp">Chi mua đồ (được bù)</Label>
              <Input
                id="m-exp"
                type="number"
                min={0}
                step={1000}
                value={expense || ""}
                onChange={(e) => setExpense(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Xem trước thực nhận */}
          <div className="rounded-lg bg-bg px-3 py-2 text-[12px]">
            <div className="flex items-center justify-between text-text2">
              <span>Thực nhận khi quyết toán</span>
              <span className="text-sm font-bold text-rag-green">{formatVnd(net)}</span>
            </div>
            <div className="mt-0.5 text-[11px] text-text3">
              Thưởng {formatVnd(bonus)} − ứng {formatVnd(advance)} + chi {formatVnd(expense)}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={close}>
            Hủy
          </Button>
          <Button type="button" onClick={onSubmit} disabled={add.isPending || !userId || bonusOver || advanceOver}>
            {add.isPending ? "Đang lưu..." : isExisting ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
