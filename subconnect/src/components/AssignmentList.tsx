import Link from "next/link";
import type { AssignmentRow } from "@/lib/queries";
import { formatDateRange, formatDateTime } from "@/lib/time";
import { describePeriods } from "@/lib/coverage";
import { CountBadge, StatusBadge } from "./ui";

type Props = {
  rows: AssignmentRow[];
  hrefFor: (row: AssignmentRow) => string;
  perspective: "TEACHER" | "SUBSTITUTE" | "ADMIN";
  timezone: string;
  extra?: (row: AssignmentRow) => React.ReactNode;
};

export function AssignmentList({ rows, hrefFor, perspective, timezone, extra }: Props) {
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((r) => (
        <li key={r.id}>
          <Link href={hrefFor(r)} className="block rounded-xl border border-line bg-surface p-4 transition-colors hover:border-primary-tint hover:bg-primary-soft/40">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-lg font-semibold">{formatDateRange(r.startKey, r.endKey)}</p>
                <p className="font-medium text-primary-strong">{describePeriods(r.periods)}</p>
                <p className="text-muted">
                  {perspective === "SUBSTITUTE" && (
                    <>Covering for <span className="font-medium text-ink">{r.teacher.name}</span>{r.teacher.subject ? ` · ${r.teacher.subject}` : ""}{r.teacher.room ? ` · Room ${r.teacher.room}` : ""}</>
                  )}
                  {perspective === "TEACHER" && (
                    <>Substitute: <span className="font-medium text-ink">{r.substitute.name}</span></>
                  )}
                  {perspective === "ADMIN" && (
                    <><span className="font-medium text-ink">{r.substitute.name}</span> covering for <span className="font-medium text-ink">{r.teacher.name}</span></>
                  )}
                </p>
                {r.status === "UPCOMING" && perspective === "SUBSTITUTE" && (
                  <p className="mt-1 text-sm text-muted">Plans open {formatDateTime(r.accessStartsAt, timezone)}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <CountBadge count={r.unread} label="unread messages" />
                <StatusBadge status={r.status} />
              </div>
            </div>
            {extra?.(r)}
          </Link>
        </li>
      ))}
    </ul>
  );
}
