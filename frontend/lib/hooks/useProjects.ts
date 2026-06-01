"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  AddProjectMemberReq,
  CreateProjectReq,
  ProjectListResp,
  ProjectMemberResp,
  ProjectResp,
  UserInfo,
} from "@/types/api";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await api.get<ProjectListResp>("/projects");
      return data;
    },
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["project", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get<ProjectResp>(`/projects/${id}`);
      return data;
    },
  });
}

export function useProjectMembers(id: string | undefined) {
  return useQuery({
    queryKey: ["project", id, "members"],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get<ProjectMemberResp[]>(`/projects/${id}/members`);
      return data ?? [];
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get<UserInfo[]>("/users");
      return data ?? [];
    },
  });
}

export function useAddProjectMember(projectId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AddProjectMemberReq) => {
      const { data } = await api.post(`/projects/${projectId}/members`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", projectId, "members"] });
      qc.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateProjectReq) => {
      const { data } = await api.post<ProjectResp>("/projects", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
