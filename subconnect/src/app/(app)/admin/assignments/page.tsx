import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { assignmentsFor, groupByStatus } from "@/lib/queries";
import { AssignmentList } from "@/components/AssignmentList";
import { CalendarIllustration } from "@/components/illustrations";
import { ButtonLink, Card, cx, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Assignments" };

const VIEWS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "active", label: "Active" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export default async function AdminAssignments({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const user = await requireUser("ADMIN");
  const { view: v } = await searchParams;
  const view = (VIEWS.find((x) => x.id === v)?.id ?? "upcoming") as (typeof VIEWS)[number]["id"];
  const groups = groupByStatus(await assignmentsFor(user, { includeCancelled: true }));
  const rows = groups[view];

  return (
    <>
      <PageHeader title="Assignments" subtitle="Connect substitutes with teachers for specific days." illustration={<CalendarIllustration />} actions={<ButtonLink href="/admin/assignments/new">New assignment</ButtonLink>} />
      <nav aria-label="Filter assignments" className="mb-5">
        <ul className="flex flex-wrap gap-2">
          {VIEWS.map((x) => (
            <li key={x.id}>
              <Link href={`?view=${x.id}`} aria-current={view === x.id ? "page" : undefined}
                className={cx("inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-medium", view === x.id ? "border-primary bg-primary text-white" : "border-line bg-surface")}>
                {x.label} <span className={view === x.id ? "text-white/85" : "text-muted"}>{groups[x.id].length}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {rows.length ? (
        <AssignmentList rows={rows} hrefFor={(r) => `/admin/assignments/${r.id}`} perspective="ADMIN" timezone={user.school.timezone} />
      ) : (
        <Card><EmptyState illustration={<CalendarIllustration title="A calendar" />} title={`No ${view} assignments`} /></Card>
      )}
    </>
  );
}
