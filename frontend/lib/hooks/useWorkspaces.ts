"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateWorkspaceReq, WorkspaceResp } from "@/types/api";

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data } = await api.get<WorkspaceResp[] | null>("/workspaces");
      return data ?? [];
    },
  });
}

export function useWorkspace(id: string | undefined) {
  return useQuery({
    queryKey: ["workspace", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get<WorkspaceResp>(`/workspaces/${id}`);
      return data;
    },
  });
}

export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateWorkspaceReq) => {
      const { data } = await api.post<WorkspaceResp>("/workspaces", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useDeleteWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/workspaces/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspaces"] });
      qc.invalidateQueries({ queryKey: ["projects"] }); // xoá workspace cascade project
    },
  });
}
