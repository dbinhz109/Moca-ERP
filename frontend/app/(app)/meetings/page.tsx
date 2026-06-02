"use client";

import { useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useMeetings } from "@/lib/hooks/useMeetings";
import { CreateMeetingDialog } from "@/components/meeting/CreateMeetingDialog";
import { MeetingCard } from "@/components/meeting/MeetingCard";
import { Button } from "@/components/ui/button";

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export default function MeetingsPage() {
  const { data, isLoading } = useMeetings();
  const meetings = data?.meetings || [];

  const groups = useMemo(() => {
    const map = new Map<string, typeof meetings>();
    const sorted = [...meetings].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    for (const m of sorted) {
      const key = dayKey(m.start_time);
      const arr = map.get(key) || [];
      arr.push(m);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [meetings]);

  return (
    <>
      <Topbar breadcrumb={<span className="font-medium text-text">Lịch họp</span>} />
      <div className="p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Lịch họp</h1>
            <p className="mt-0.5 text-sm text-text2">{data?.total ?? 0} cuộc họp trong hệ thống.</p>
          </div>
          <CreateMeetingDialog trigger={<Button>+ Tạo lịch họp</Button>} />
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-border bg-white">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[72px] animate-pulse border-b border-border bg-white last:border-0" />
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center text-sm text-text2">
            Chưa có cuộc họp nào.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            {groups.map(([day, items]) => (
              <div key={day}>
                <div className="border-b border-border bg-bg px-4 py-2 text-[12px] font-semibold text-text2">
                  {new Intl.DateTimeFormat("vi-VN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(day))}{" "}
                  · {items.length} cuộc họp
                </div>
                {items.map((m) => (
                  <MeetingCard key={m.id} meeting={m} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
