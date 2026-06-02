"use client";

import { useState } from "react";
import { Crown, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatVnd } from "@/lib/utils";
import type { ProjectMemberResp } from "@/types/api";

const ROLE_LABEL: Record<string, string> = {
  pm: "PM",
  team_lead: "Team Lead",
  member: "Thành viên",
};

interface MemberListProps {
  members: ProjectMemberResp[];
  /** Cho phép đổi PM (admin hoặc PM hiện tại). */
  canManage?: boolean;
  /** Gọi khi chọn "Đặt làm PM"; trả Promise để hiện trạng thái loading. */
  onSetPm?: (userId: string) => Promise<void>;
}

export function MemberList({ members, canManage, onSetPm }: MemberListProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (!members.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-white p-8 text-center text-sm text-text2">
        Chưa có thành viên trong dự án.
      </div>
    );
  }

  const handleSetPm = async (userId: string) => {
    if (!onSetPm) return;
    setPendingId(userId);
    try {
      await onSetPm(userId);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {members.map((m) => {
        const isPm = m.project_role === "pm";
        return (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-[10px] border border-border bg-white px-4 py-3"
          >
            <Avatar name={m.full_name || m.username} size="md" />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold truncate">{m.full_name || m.username}</div>
              <div className="text-[11px] text-text2 truncate">{m.email || m.username}</div>
            </div>

            {(m.bonus_amount > 0 || m.advance_amount > 0 || m.expense_amount > 0) && (
              <div className="text-right">
                <div className="text-[13px] font-semibold text-rag-green">{formatVnd(m.net_amount)}</div>
                <div className="text-[10px] text-text2">thực nhận</div>
                {(m.advance_amount > 0 || m.expense_amount > 0) && (
                  <div className="mt-0.5 text-[10px] text-text3">
                    thưởng {formatVnd(m.bonus_amount)}
                    {m.advance_amount > 0 && <span className="text-rag-red"> − ứng {formatVnd(m.advance_amount)}</span>}
                    {m.expense_amount > 0 && <span className="text-rag-amber"> + chi {formatVnd(m.expense_amount)}</span>}
                  </div>
                )}
              </div>
            )}

            {/* Đặt làm PM — chỉ hiện với người chưa phải PM khi có quyền quản lý */}
            {canManage && onSetPm && !isPm && (
              <button
                type="button"
                onClick={() => handleSetPm(m.id)}
                disabled={pendingId !== null}
                className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-text2 transition-colors hover:border-pink/40 hover:bg-pink/5 hover:text-pink disabled:opacity-50"
              >
                {pendingId === m.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Crown className="h-3 w-3" />
                )}
                Đặt làm PM
              </button>
            )}

            <span
              className={
                isPm
                  ? "flex items-center gap-1 rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-semibold uppercase text-white"
                  : "rounded-full bg-bg px-2 py-0.5 text-[10px] font-semibold uppercase text-text2"
              }
            >
              {isPm && <Crown className="h-3 w-3" />}
              {ROLE_LABEL[m.project_role] || m.project_role}
            </span>
          </div>
        );
      })}
    </div>
  );
}
