"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserCog, Lock, Loader2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { extractErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useUpdateProfile, useChangePassword } from "@/lib/hooks/useProfile";

export default function ProfileSettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex h-full flex-col">
      <Topbar breadcrumb={<span className="font-medium text-text">Cài đặt / Tài khoản</span>} />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto p-5">
        <div className="mb-5 flex items-center gap-3">
          <Avatar name={user?.full_name || user?.username || "U"} size="lg" />
          <div>
            <h1 className="text-lg font-bold">{user?.full_name || user?.username}</h1>
            <p className="text-xs text-text2">
              @{user?.username} · {user?.email}
            </p>
          </div>
        </div>

        <ProfileForm />
        <PasswordForm />
      </div>
    </div>
  );
}

// ─── Thông tin cá nhân ──────────────────────────────────────────

function ProfileForm() {
  const user = useAuthStore((s) => s.user);
  const update = useUpdateProfile();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const dirty = !!user && (fullName !== user.full_name || phone !== (user.phone ?? ""));

  const save = async () => {
    if (!fullName.trim()) {
      toast.error("Họ tên không được để trống");
      return;
    }
    try {
      await update.mutateAsync({ full_name: fullName.trim(), phone: phone.trim() });
      toast.success("Đã cập nhật thông tin");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể cập nhật thông tin"));
    }
  };

  return (
    <section className="mb-5 rounded-2xl border border-border bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <UserCog className="h-4 w-4 text-pink" />
        <h2 className="text-sm font-bold">Thông tin cá nhân</h2>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="mb-1 block text-[11px] text-text2">Họ và tên</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Họ và tên" />
        </div>
        <div>
          <Label className="mb-1 block text-[11px] text-text2">Số điện thoại</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="VD: 0901234567"
            inputMode="tel"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 opacity-60">
          <div>
            <Label className="mb-1 block text-[11px] text-text2">Tên đăng nhập</Label>
            <Input value={user?.username ?? ""} disabled />
          </div>
          <div>
            <Label className="mb-1 block text-[11px] text-text2">Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={save} disabled={!dirty || update.isPending}>
          {update.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Lưu thay đổi
        </Button>
      </div>
    </section>
  );
}

// ─── Đổi mật khẩu ───────────────────────────────────────────────

function PasswordForm() {
  const change = useChangePassword();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  const submit = async () => {
    if (next.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (next !== confirm) {
      toast.error("Xác nhận mật khẩu không khớp");
      return;
    }
    try {
      const res = await change.mutateAsync({ current_password: current, new_password: next });
      toast.success(res.message || "Đổi mật khẩu thành công");
      reset();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể đổi mật khẩu"));
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <Lock className="h-4 w-4 text-pink" />
        <h2 className="text-sm font-bold">Đổi mật khẩu</h2>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="mb-1 block text-[11px] text-text2">Mật khẩu hiện tại</Label>
          <Input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1 block text-[11px] text-text2">Mật khẩu mới</Label>
            <Input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Tối thiểu 6 ký tự" />
          </div>
          <div>
            <Label className="mb-1 block text-[11px] text-text2">Xác nhận mật khẩu</Label>
            <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          onClick={submit}
          disabled={change.isPending || !current || !next || !confirm}
        >
          {change.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Đổi mật khẩu
        </Button>
      </div>
    </section>
  );
}
