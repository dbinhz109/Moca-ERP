"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  CommonResp,
  NotificationConfigResp,
  NotificationSettingsResp,
  UpdateNotificationConfigReq,
  UpdateNotificationSettingsReq,
} from "@/types/api";

// ─── Cấu hình hệ thống (Admin) ──────────────────────────────────

export function useNotificationConfig(enabled: boolean) {
  return useQuery({
    queryKey: ["notification-config"],
    enabled,
    queryFn: async () => {
      const { data } = await api.get<NotificationConfigResp>("/notification-config");
      return data;
    },
  });
}

export function useUpdateNotificationConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateNotificationConfigReq) => {
      const { data } = await api.put<NotificationConfigResp>("/notification-config", payload);
      return data;
    },
    onSuccess: (data) => qc.setQueryData(["notification-config"], data),
  });
}

// ─── Tuỳ chọn của người dùng ────────────────────────────────────

export function useNotificationSettings() {
  return useQuery({
    queryKey: ["notification-settings"],
    queryFn: async () => {
      const { data } = await api.get<NotificationSettingsResp>("/notification-settings");
      return data;
    },
  });
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateNotificationSettingsReq) => {
      const { data } = await api.put<NotificationSettingsResp>("/notification-settings", payload);
      return data;
    },
    onSuccess: (data) => qc.setQueryData(["notification-settings"], data),
  });
}

export function useTestNotification() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<CommonResp>("/notification-settings/test");
      return data;
    },
  });
}
