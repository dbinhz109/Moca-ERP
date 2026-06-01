"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, Send, MessageCircle, ShieldCheck, Loader2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { extractErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  useNotificationConfig,
  useUpdateNotificationConfig,
  useNotificationSettings,
  useUpdateNotificationSettings,
  useTestNotification,
} from "@/lib/hooks/useNotificationSettings";
import type { NotificationSettingsResp } from "@/types/api";

/** Toggle gọn dùng cho bật/tắt kênh & sự kiện. */
function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 flex-shrink-0 rounded-full transition-colors disabled:opacity-40",
        checked ? "bg-gradient-brand" : "bg-border"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function Row({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-text">{title}</div>
        {desc && <div className="text-[11px] text-text2">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

const EVENTS: { key: keyof NotificationSettingsResp; label: string; desc: string }[] = [
  { key: "notify_assigned", label: "Được giao việc", desc: "Khi bạn được thêm vào một công việc" },
  { key: "notify_review", label: "Việc chờ duyệt", desc: "Khi có công việc cần bạn duyệt (PM/Admin)" },
  { key: "notify_decision", label: "Duyệt / từ chối", desc: "Khi việc của bạn được duyệt hoặc bị từ chối" },
  { key: "notify_comment", label: "Bình luận mới", desc: "Khi có bình luận trong việc bạn tham gia" },
];

export default function NotificationSettingsPage() {
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");

  return (
    <div className="flex h-full flex-col">
      <Topbar
        breadcrumb={
          <span className="font-medium text-text">Cài đặt / Thông báo</span>
        }
      />
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Thông báo</h1>
            <p className="text-xs text-text2">
              Nhận thông báo qua Telegram hoặc Zalo OA bên cạnh thông báo trong ứng dụng.
            </p>
          </div>
        </div>

        {isAdmin && <AdminChannels />}
        <UserSettings />
      </div>
    </div>
  );
}

// ─── Admin: cấu hình token hệ thống ─────────────────────────────

function AdminChannels() {
  const { data, isLoading } = useNotificationConfig(true);
  const update = useUpdateNotificationConfig();

  const [tgEnabled, setTgEnabled] = useState(false);
  const [tgToken, setTgToken] = useState("");
  const [zaloEnabled, setZaloEnabled] = useState(false);
  const [zaloToken, setZaloToken] = useState("");

  useEffect(() => {
    if (data) {
      setTgEnabled(data.telegram_enabled);
      setZaloEnabled(data.zalo_enabled);
    }
  }, [data]);

  const save = async () => {
    try {
      await update.mutateAsync({
        telegram_enabled: tgEnabled,
        telegram_bot_token: tgToken, // rỗng = giữ token cũ
        zalo_enabled: zaloEnabled,
        zalo_oa_token: zaloToken,
      });
      setTgToken("");
      setZaloToken("");
      toast.success("Đã lưu cấu hình kênh");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể lưu cấu hình"));
    }
  };

  return (
    <section className="mb-5 rounded-2xl border border-border bg-white p-5">
      <div className="mb-1 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-pink" />
        <h2 className="text-sm font-bold">Kênh hệ thống</h2>
        <span className="rounded-full bg-pink/10 px-2 py-0.5 text-[10px] font-semibold text-pink">
          Admin
        </span>
      </div>
      <p className="mb-3 text-[11px] text-text2">
        Token dùng chung cho toàn hệ thống. Người dùng tự liên kết ID của mình ở phần bên dưới.
      </p>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-text2">Đang tải…</div>
      ) : (
        <div className="divide-y divide-border">
          {/* Telegram */}
          <div className="py-3">
            <Row
              title="Telegram Bot"
              desc={
                data?.telegram_token_set
                  ? "Bot token đã được cấu hình"
                  : "Tạo bot với @BotFather để lấy token"
              }
            >
              <Toggle checked={tgEnabled} onChange={setTgEnabled} />
            </Row>
            <Input
              type="password"
              autoComplete="off"
              placeholder={data?.telegram_token_set ? "•••••••• (để trống = giữ nguyên)" : "123456:ABC-DEF..."}
              value={tgToken}
              onChange={(e) => setTgToken(e.target.value)}
            />
          </div>
          {/* Zalo */}
          <div className="py-3">
            <Row
              title="Zalo OA"
              desc={
                data?.zalo_token_set
                  ? "OA access token đã được cấu hình"
                  : "Cần Official Account đã duyệt + access token"
              }
            >
              <Toggle checked={zaloEnabled} onChange={setZaloEnabled} />
            </Row>
            <Input
              type="password"
              autoComplete="off"
              placeholder={data?.zalo_token_set ? "•••••••• (để trống = giữ nguyên)" : "OA access token"}
              value={zaloToken}
              onChange={(e) => setZaloToken(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={save} disabled={update.isPending}>
          {update.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Lưu cấu hình
        </Button>
      </div>
    </section>
  );
}

// ─── Người dùng: liên kết + tuỳ chọn ────────────────────────────

function UserSettings() {
  const { data, isLoading } = useNotificationSettings();
  const update = useUpdateNotificationSettings();
  const test = useTestNotification();

  const [form, setForm] = useState<NotificationSettingsResp | null>(null);
  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const set = <K extends keyof NotificationSettingsResp>(key: K, value: NotificationSettingsResp[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const save = async () => {
    if (!form) return;
    try {
      await update.mutateAsync(form);
      toast.success("Đã lưu tuỳ chọn thông báo");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không thể lưu tuỳ chọn"));
    }
  };

  const runTest = async () => {
    try {
      const res = await test.mutateAsync();
      toast.success(res.message);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gửi thử thất bại"));
    }
  };

  if (isLoading || !form) {
    return (
      <section className="rounded-2xl border border-border bg-white p-5 text-center text-xs text-text2">
        Đang tải…
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-white p-5">
      <h2 className="mb-3 text-sm font-bold">Thông báo của tôi</h2>

      {/* Liên kết kênh */}
      <div className="space-y-4">
        <div className="rounded-xl bg-bg p-3">
          <div className="mb-2 flex items-center gap-2">
            <Send className="h-3.5 w-3.5 text-[#229ED9]" />
            <span className="text-[13px] font-semibold">Telegram</span>
            <div className="ml-auto">
              <Toggle checked={form.telegram_on} onChange={(v) => set("telegram_on", v)} />
            </div>
          </div>
          <Label className="text-[11px] text-text2">Chat ID</Label>
          <Input
            placeholder="VD: 123456789 — nhắn @userinfobot để lấy"
            value={form.telegram_chat_id}
            onChange={(e) => set("telegram_chat_id", e.target.value)}
          />
        </div>

        <div className="rounded-xl bg-bg p-3">
          <div className="mb-2 flex items-center gap-2">
            <MessageCircle className="h-3.5 w-3.5 text-[#0068FF]" />
            <span className="text-[13px] font-semibold">Zalo</span>
            <div className="ml-auto">
              <Toggle checked={form.zalo_on} onChange={(v) => set("zalo_on", v)} />
            </div>
          </div>
          <Label className="text-[11px] text-text2">Zalo User ID</Label>
          <Input
            placeholder="User ID trên OA (cần đã follow OA)"
            value={form.zalo_user_id}
            onChange={(e) => set("zalo_user_id", e.target.value)}
          />
        </div>
      </div>

      {/* Sự kiện */}
      <div className="mt-4 border-t border-border pt-2">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text2">
          Loại thông báo
        </div>
        <div className="divide-y divide-border">
          {EVENTS.map((ev) => (
            <Row key={ev.key} title={ev.label} desc={ev.desc}>
              <Toggle
                checked={Boolean(form[ev.key])}
                onChange={(v) => set(ev.key, v as never)}
              />
            </Row>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={runTest} disabled={test.isPending}>
          {test.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Gửi thử
        </Button>
        <Button onClick={save} disabled={update.isPending}>
          {update.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Lưu tuỳ chọn
        </Button>
      </div>
    </section>
  );
}
