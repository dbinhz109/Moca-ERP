"use client";

import Link from "next/link";
import { Bell, CheckCheck, UserPlus, ClipboardCheck, Gavel, MessageSquare, Settings } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { cn, formatDateTime } from "@/lib/utils";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/lib/hooks/useNotifications";
import type { NotificationResp } from "@/types/api";

const typeIcon: Record<string, React.ReactNode> = {
  assigned: <UserPlus className="h-4 w-4" />,
  review: <ClipboardCheck className="h-4 w-4" />,
  decision: <Gavel className="h-4 w-4" />,
  comment: <MessageSquare className="h-4 w-4" />,
};

const typeAccent: Record<string, string> = {
  assigned: "bg-pink/10 text-pink",
  review: "bg-[#FEF3C7] text-rag-amber",
  decision: "bg-[#DCFCE7] text-rag-green",
  comment: "bg-bg text-text2",
};

export default function NotificationsPage() {
  const { data: items = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const unread = items.filter((n) => !n.is_read).length;

  return (
    <div className="flex h-full flex-col">
      <Topbar breadcrumb={<span className="font-medium text-text">Thông báo</span>} />

      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">Thông báo</h1>
            {unread > 0 && (
              <span className="rounded-full bg-rag-red px-2 py-0.5 text-[10px] font-bold text-white">
                {unread} mới
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/settings/notifications">
                <Settings className="h-3.5 w-3.5" /> Cài đặt
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={unread === 0 || markAll.isPending}
              onClick={() => markAll.mutate()}
            >
              <CheckCheck className="h-3.5 w-3.5" /> Đọc tất cả
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-text2">Đang tải…</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-text2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg">
              <Bell className="h-5 w-5" />
            </div>
            <p className="text-sm">Chưa có thông báo nào</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((n) => (
              <NotificationItem
                key={n.id}
                n={n}
                onRead={() => !n.is_read && markRead.mutate(n.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationItem({ n, onRead }: { n: NotificationResp; onRead: () => void }) {
  return (
    <button
      onClick={onRead}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
        n.is_read ? "border-border bg-white" : "border-pink/30 bg-pink/[0.03] hover:bg-pink/5"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
          typeAccent[n.type] || "bg-bg text-text2"
        )}
      >
        {typeIcon[n.type] || <Bell className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-text">{n.title}</span>
          {!n.is_read && <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink" />}
        </div>
        {n.body && <p className="mt-0.5 text-xs leading-snug text-text2">{n.body}</p>}
        <div className="mt-1 text-[10px] text-text3">{formatDateTime(n.created_at)}</div>
      </div>
    </button>
  );
}
