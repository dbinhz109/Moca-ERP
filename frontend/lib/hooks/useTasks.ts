"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateTaskReq, TaskCommentResp, TaskResp, TaskStatus } from "@/types/api";

export function useProjectTasks(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project", projectId, "tasks"],
    enabled: !!projectId,
    queryFn: async () => {
      const { data } = await api.get<TaskResp[] | null>(`/projects/${projectId}/tasks`);
      return data ?? [];
    },
  });
}

export function useCreateTask(projectId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateTaskReq) => {
      const { data } = await api.post<TaskResp>(`/projects/${projectId}/tasks`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", projectId, "tasks"] });
    },
  });
}

export function useUpdateTask(projectId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: CreateTaskReq }) => {
      const { data } = await api.put<TaskResp>(`/tasks/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", projectId, "tasks"] });
    },
  });
}

export function useUpdateTaskStatus(projectId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { data } = await api.patch<TaskResp>(`/tasks/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", projectId, "tasks"] });
    },
  });
}

export function useApproveTask(projectId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, comment }: { id: string; action: "approve" | "reject"; comment?: string }) => {
      const { data } = await api.post<TaskResp>(`/tasks/${id}/approve`, { action, comment });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", projectId, "tasks"] });
    },
  });
}

export function useDeleteTask(projectId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/tasks/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", projectId, "tasks"] });
    },
  });
}

export function useTaskComments(taskId: string | undefined) {
  return useQuery({
    queryKey: ["task", taskId, "comments"],
    enabled: !!taskId,
    queryFn: async () => {
      const { data } = await api.get<TaskCommentResp[] | null>(`/tasks/${taskId}/comments`);
      return data ?? [];
    },
  });
}

export function useAddComment(taskId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const { data } = await api.post<TaskCommentResp>(`/tasks/${taskId}/comments`, { content });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task", taskId, "comments"] });
    },
  });
}

export function useAddTaskAssignee(projectId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }) => {
      const { data } = await api.post(`/tasks/${taskId}/assignees`, { user_id: userId });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", projectId, "tasks"] });
    },
  });
}

export function useRemoveTaskAssignee(projectId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }) => {
      const { data } = await api.delete(`/tasks/${taskId}/assignees/${userId}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", projectId, "tasks"] });
    },
  });
}

export function useMarkMyProgress(projectId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, done }: { taskId: string; done: boolean }) => {
      const { data } = await api.patch<TaskResp>(`/tasks/${taskId}/my-progress`, { done });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", projectId, "tasks"] });
    },
  });
}
