"use client";

import { Bell, LogOut, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import { useNotifications } from "@/lib/hooks/useNotifications";

interface TopbarProps {
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Topbar({ breadcrumb, actions }: TopbarProps) {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const router = useRouter();
  const { data: notifications = [] } = useNotifications();
  const unread = notifications.filter((n) => !n.is_read).length;

  const logout = () => {
    clear();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-10 flex h-12 items-center gap-3 border-b border-border bg-white px-5">
      <div className="flex-1 text-[13px] text-text2">{breadcrumb}</div>
      <div className="flex items-center gap-2">
        {actions}
        <button
          onClick={() => router.push("/notifications")}
          className="relative flex h-8 w-8 items-center justify-center rounded-[7px] border border-border bg-white text-text2 hover:bg-bg"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rag-red text-[9px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full" aria-label="User menu">
              <Avatar name={user?.full_name || user?.username || "U"} size="md" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <div className="px-2 py-1.5">
              <div className="text-sm font-semibold text-text truncate">{user?.full_name || user?.username}</div>
              <div className="text-[11px] text-text2 truncate">{user?.email}</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
              <UserCog className="h-4 w-4" /> Tài khoản
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-rag-red data-[highlighted]:text-rag-red data-[highlighted]:bg-rag-red/10">
              <LogOut className="h-4 w-4" /> Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
