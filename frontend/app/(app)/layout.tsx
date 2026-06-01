"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/login");
    }
  }, [isHydrated, token, router]);

  if (!isHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-pink border-t-transparent" />
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-bg">{children}</main>
    </div>
  );
}
