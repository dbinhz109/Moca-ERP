"use client";

import { MapPin, FolderOpen, Video } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatTime } from "@/lib/utils";
import type { MeetingResp, MeetingType } from "@/types/api";

const typeBadge: Record<MeetingType, { label: string; cls: string }> = {
  review: { label: "Review", cls: "bg-[#EDE9FE] text-[#7C3AED]" },
  standup: { label: "Standup", cls: "bg-[#DCFCE7] text-[#16A34A]" },
  board: { label: "Board", cls: "bg-[#FEF3C7] text-[#D97706]" },
  other: { label: "Khác", cls: "bg-bg text-text2" },
};

export function MeetingCard({ meeting }: { meeting: MeetingResp }) {
  const t = typeBadge[meeting.type] || typeBadge.other;
  const attendees = meeting.attendees || [];
  const shown = attendees.slice(0, 4);
  const extra = attendees.length - shown.length;

  return (
    <div className="flex gap-3 border-b border-border bg-white px-4 py-4 transition-colors hover:bg-pink/5">
      <div className="w-[80px] flex-shrink-0 pt-0.5 text-[11px] text-text2">
        {formatTime(meeting.start_time)}
        <br />
        <span className="text-text3">{formatTime(meeting.end_time)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 truncate text-[13px] font-semibold">{meeting.title}</div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${t.cls}`}>{t.label}</span>
          {meeting.location && (
            <span className="flex items-center gap-1 text-[11px] text-text2">
              <MapPin className="h-3 w-3" /> {meeting.location}
            </span>
          )}
          {meeting.meeting_url && (
            <span className="flex items-center gap-1 text-[11px] text-text2">
              <Video className="h-3 w-3" /> Online
            </span>
          )}
          {meeting.project_name && (
            <span className="flex items-center gap-1 text-[11px] text-text2">
              <FolderOpen className="h-3 w-3" /> {meeting.project_name}
            </span>
          )}
        </div>
        {attendees.length > 0 && (
          <div className="mt-2 flex items-center">
            <div className="flex">
              {shown.map((a) => (
                <span key={a.id} className="-ml-1.5 first:ml-0 ring-2 ring-white rounded-full">
                  <Avatar name={a.full_name || a.username} size="sm" />
                </span>
              ))}
              {extra > 0 && (
                <span className="-ml-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-border text-[9px] font-bold text-text2 ring-2 ring-white">
                  +{extra}
                </span>
              )}
            </div>
            <span className="ml-2 text-[11px] text-text2">{attendees.length} người tham dự</span>
          </div>
        )}
      </div>
    </div>
  );
}
