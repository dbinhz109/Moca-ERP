"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type {
  ChangePasswordReq,
  CommonResp,
  UpdateProfileReq,
  UserInfo,
} from "@/types/api";

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: async (payload: UpdateProfileReq) => {
      const { data } = await api.put<UserInfo>("/me", payload);
      return data;
    },
    onSuccess: (user) => setUser(user), // đồng bộ lại tên/sđt hiển thị
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordReq) => {
      const { data } = await api.put<CommonResp>("/me/password", payload);
      return data;
    },
  });
}
