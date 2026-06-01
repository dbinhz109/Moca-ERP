"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PhaseResp } from "@/types/api";

export function usePhases(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project", projectId, "phases"],
    enabled: !!projectId,
    queryFn: async () => {
      const { data } = await api.get<PhaseResp[] | null>(`/projects/${projectId}/phases`);
      return data ?? [];
    },
  });
}
