import Link from "next/link";
import { DateTime } from "luxon";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { assignmentsFor, groupByStatus } from "@/lib/queries";
import { dateKey, eachDateKey, formatDateKey } from "@/lib/time";
import { missingLessons } from "@/lib/coverage";
import { AssignmentList } from "@/components/AssignmentList";
import { CalendarIllustration, ClockIllustration, PeopleIllustration, SchoolIllustration } from "@/components/illustrations";
import { ButtonLink, Card, EmptyState, PageHeader, SectionTitle } from "@/components/ui";

export const metadata = { title: "Admin home" };

export default async function AdminDashboard() {
  const user = await requireUser("ADMIN");
  const tz = user.school.timezone;
  const rows = await assignmentsFor(user);
  const { active, upcoming } = groupByStatus(rows);
  const weekAhead = DateTime.now().setZone(tz).plus({ days: 7 }).toISODate()!;
  const soon = upcoming.filter((r) => r.startKey <= weekAhead);
  const pending = await prisma.user.count({ where: { schoolId: user.schoolId, status: "PENDING" } });

  // Admins see whether a plan exists, never its contents.
  const plans = await prisma.subDayPlan.findMany({
    where: { teacherId: { in: [...new Set([...active, ...soon].map((r) => r.teacher.id))] } },
    select: { teacherId: true, date: true, directionsHtml: true, blocks: { select: { periodId: true, lessonHtml: true } } },
  });
  const planStatus = (r: (typeof rows)[number]) => {
    const missing = eachDateKey(r.startKey, r.endKey).flatMap((d) => {
      const m = missingLessons(plans.find((p) => p.teacherId === r.teacher.id && dateKey(p.date) === d), r.periods);
      return m.length ? [`${formatDateKey(d, "short")}: ${m.join(", ")}`] : [];
    });
    return (
      <p className={missing.length ? "mt-2 text-sm font-medium text-accent-strong" : "mt-2 text-sm font-medium text-ok"}>
        {missing.length ? `Lesson plan needed (${missing.join("; ")})` : "Lesson plans posted"}
      </p>
    );
  };
  const href = (r: { id: string }) => `/admin/assignments/${r.id}`;

  return (
    <>
      <PageHeader title={user.school.name} subtitle="Substitute coverage at a glance." illustration={<SchoolIllustration />} actions={<ButtonLink href="/admin/assignments/new">New assignment</ButtonLink>} />
      {pending > 0 && (
        <Link href="/admin/people" className="mb-6 flex items-center gap-4 rounded-2xl border border-accent/30 bg-accent-soft p-4 text-accent-strong">
          <div className="w-14 shrink-0"><PeopleIllustration /></div>
          <p className="font-semibold">{pending} account request{pending > 1 ? "s" : ""} waiting for approval</p>
        </Link>
      )}
      <div className="flex flex-col gap-8">
        <section aria-labelledby="today-heading">
          <SectionTitle id="today-heading" illustration={<CalendarIllustration />}>Covered today</SectionTitle>
          {active.length ? (
            <AssignmentList rows={active} hrefFor={href} perspective="ADMIN" timezone={tz} extra={planStatus} />
          ) : (
            <Card><EmptyState illustration={<CalendarIllustration title="A calendar" />} title="No substitutes scheduled right now" /></Card>
          )}
        </section>
        <section aria-labelledby="week-heading">
          <SectionTitle id="week-heading" illustration={<ClockIllustration />}>Next 7 days</SectionTitle>
          {soon.length ? (
            <AssignmentList rows={soon} hrefFor={href} perspective="ADMIN" timezone={tz} extra={planStatus} />
          ) : (
            <p className="rounded-xl border border-dashed border-line bg-surface p-4 text-muted">Nothing scheduled this week.</p>
          )}
        </section>
      </div>
    </>
  );
}
