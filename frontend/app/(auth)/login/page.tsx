"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";
import { extractErrorMessage } from "@/lib/api";

const schema = z.object({
  username: z.string().min(1, "Tên đăng nhập là bắt buộc"),
  password: z.string().min(1, "Mật khẩu là bắt buộc"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { token, isHydrated, setAuth } = useAuthStore();

  useEffect(() => {
    if (isHydrated && token) router.replace("/dashboard");
  }, [isHydrated, token, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "admin", password: "password" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const data = await login(values);
      setAuth(data.token, data.user);
      toast.success(`Chào mừng, ${data.user.full_name || data.user.username}`);
      router.replace("/dashboard");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Đăng nhập thất bại"));
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Brand panel */}
      <div className="relative hidden flex-1 overflow-hidden bg-navy text-white lg:flex lg:flex-col">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(80% 60% at 80% 20%, rgba(255,107,157,0.35) 0%, transparent 60%), radial-gradient(70% 60% at 10% 90%, rgba(255,179,71,0.28) 0%, transparent 60%), #1A1A2E",
          }}
        />
        <div className="relative z-10 flex h-full flex-col p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-brand text-base font-extrabold">
              M
            </div>
            <div className="leading-tight">
              <div className="text-base font-bold">MOCA ERP</div>
              <div className="text-xs text-white/50">Research · STEM · Project</div>
            </div>
          </div>
          <div className="mt-auto max-w-md">
            <div className="text-3xl font-bold leading-tight">
              Quản trị dự án MOCA <br />
              <span className="text-gradient-brand">đơn giản và hiệu quả.</span>
            </div>
            <p className="mt-3 text-sm text-white/60">
              Workspace · Dự án · Giai đoạn · Kanban · Lịch họp — gọn trong một nền tảng.
            </p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-sm font-extrabold text-white">
              M
            </div>
            <div className="text-sm font-bold">MOCA ERP</div>
          </div>
          <h1 className="text-2xl font-bold">Đăng nhập</h1>
          <p className="mt-1 text-sm text-text2">
            Sử dụng tài khoản nội bộ để truy cập hệ thống.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input id="username" autoFocus placeholder="admin" {...register("username")} />
              {errors.username && (
                <p className="mt-1 text-[11px] text-rag-red">{errors.username.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && (
                <p className="mt-1 text-[11px] text-rag-red">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Đăng nhập
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-border bg-bg p-3 text-xs text-text2">
            <div className="font-semibold text-text mb-1">Tài khoản demo</div>
            <div>Username: <code className="text-pink">admin</code> · Password: <code className="text-pink">password</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}
