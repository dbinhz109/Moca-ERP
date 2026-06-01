"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateMeetingReq, MeetingListResp, MeetingResp } from "@/types/api";

export function useMeetings() {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const { data } = await api.get<MeetingListResp>("/meetings");
      return data;
    },
  });
}

export function useCreateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMeetingReq) => {
      const { data } = await api.post<MeetingResp>("/meetings", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}
