"use client";

import { Avatar } from "@/components/ui/avatar";
import { formatVnd } from "@/lib/utils";
import type { ProjectMemberResp } from "@/types/api";

const ROLE_LABEL: Record<string, string> = {
  pm: "PM",
  team_lead: "Team Lead",
  member: "Thành viên",
};

export function MemberList({ members }: { members: ProjectMemberResp[] }) {
  if (!members.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-white p-8 text-center text-sm text-text2">
        Chưa có thành viên trong dự án.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {members.map((m) => (
        <div
          key={m.id}
          className="flex items-center gap-3 rounded-[10px] border border-border bg-white px-4 py-3"
        >
          <Avatar name={m.full_name || m.username} size="md" />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold truncate">{m.full_name || m.username}</div>
            <div className="text-[11px] text-text2 truncate">{m.email || m.username}</div>
          </div>
          {m.bonus_amount > 0 && (
            <div className="text-right">
              <div className="text-[13px] font-semibold text-rag-green">{formatVnd(m.bonus_amount)}</div>
              <div className="text-[10px] text-text2">thưởng khi hoàn thành</div>
            </div>
          )}
          <span className="rounded-full bg-pink/10 px-2 py-0.5 text-[10px] font-semibold text-pink uppercase">
            {ROLE_LABEL[m.project_role] || m.project_role}
          </span>
        </div>
      ))}
    </div>
  );
}
