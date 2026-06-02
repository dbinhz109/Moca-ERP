"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Boxes,
  FolderKanban,
  Calendar,
  Bell,
  Settings,
  UserCog,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    label: "Tổng quan",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: <LayoutGrid className="h-4 w-4" /> },
      { href: "/notifications", label: "Thông báo", icon: <Bell className="h-4 w-4" /> },
    ],
  },
  {
    label: "Quản lý dự án",
    items: [
      { href: "/workspaces", label: "Workspace", icon: <Boxes className="h-4 w-4" /> },
      { href: "/projects", label: "Dự án", icon: <FolderKanban className="h-4 w-4" /> },
      { href: "/meetings", label: "Lịch họp", icon: <Calendar className="h-4 w-4" /> },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { href: "/settings/profile", label: "Tài khoản", icon: <UserCog className="h-4 w-4" /> },
      { href: "/settings/notifications", label: "Cài đặt thông báo", icon: <Settings className="h-4 w-4" /> },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="flex w-[220px] flex-shrink-0 flex-col bg-navy text-white">
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/moca-logo.jpg" alt="MOCA TECH" className="h-9 w-9 flex-shrink-0 rounded-lg object-cover" />
        <div className="leading-tight">
          <div className="text-[13px] font-bold">MOCA ERP</div>
          <div className="text-[10px] text-white/40">Research · STEM · Project</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3">
        {groups.map((g) => (
          <div key={g.label} className="mb-2">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/30">
              {g.label}
            </div>
            <div className="flex flex-col gap-0.5">
              {g.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] transition-colors",
                      active
                        ? "bg-pink/20 text-pink"
                        : "text-white/60 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    <span className="flex h-4 w-4 items-center justify-center">{item.icon}</span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {typeof item.badge === "number" && item.badge > 0 && (
                      <span className="ml-auto rounded-full bg-rag-red px-1.5 py-px text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / user */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/8">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-brand text-[11px] font-bold">
            {initials(user?.full_name || user?.username || "U")}
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-xs font-semibold">{user?.full_name || user?.username || "—"}</div>
            <div className="truncate text-[10px] text-white/40">{user?.role || "User"}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
