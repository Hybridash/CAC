import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { assignmentsFor, groupByStatus, type AssignmentRow } from "@/lib/queries";
import { dateKey, eachDateKey, formatDateKey } from "@/lib/time";
import { missingLessons } from "@/lib/coverage";
import { AssignmentList } from "@/components/AssignmentList";
import { BookIllustration, CalendarIllustration, ChalkboardIllustration, ClockIllustration, TeacherDeskIllustration } from "@/components/illustrations";
import { ButtonLink, Card, EmptyState, PageHeader, SectionTitle } from "@/components/ui";

export const metadata = { title: "Home" };

export default async function TeacherDashboard() {
  const user = await requireUser("TEACHER");
  const rows = await assignmentsFor(user);
  const { active, upcoming, past } = groupByStatus(rows);
  const plans = await prisma.subDayPlan.findMany({
    where: { teacherId: user.id },
    select: { date: true, directionsHtml: true, blocks: { select: { periodId: true, lessonHtml: true } } },
  });
  const missingFor = (r: AssignmentRow) =>
    eachDateKey(r.startKey, r.endKey).flatMap((d) => {
      const m = missingLessons(plans.find((p) => dateKey(p.date) === d), r.periods);
      return m.length ? [`${formatDateKey(d, "short")}: ${m.join(", ")}`] : [];
    });
  const href = (r: { id: string }) => `/teacher/assignments/${r.id}`;
  const tz = user.school.timezone;

  const planStatus = (r: AssignmentRow) => {
    const missing = missingFor(r);
    return (
      <p className={missing.length ? "mt-2 font-medium text-accent-strong" : "mt-2 font-medium text-ok"}>
        {missing.length ? `Lesson plan needed (${missing.join("; ")})` : "Lesson plans ready"}
      </p>
    );
  };

  const missingCount = [...active, ...upcoming].filter((r) => missingFor(r).length > 0).length;

  return (
    <>
      <PageHeader
        title={`Hello, ${user.name.split(" ")[0]}`}
        subtitle={missingCount ? `${missingCount} substitute${missingCount > 1 ? "s are" : " is"} still waiting on lesson plans.` : "Your sub plans and substitute assignments."}
        illustration={<TeacherDeskIllustration />}
        actions={<ButtonLink href="/teacher/plans">New sub day plan</ButtonLink>}
      />
      <p className="-mt-3 mb-6 text-muted">
        {user.teachingLevel === "ELEMENTARY" ? "Elementary: one substitute covers your whole day." : "Middle or high school: a substitute can cover each period."}{" "}
        <Link href="/welcome" className="font-medium text-primary underline underline-offset-2">Change</Link>
      </p>
      {rows.length === 0 ? (
        <Card>
          <EmptyState illustration={<CalendarIllustration title="A calendar" />} title="No substitute assignments yet">
            You can write sub day plans ahead of time. When your school admin assigns a substitute, they will appear here.{" "}
            <Link href="/teacher/plans" className="font-semibold text-primary underline underline-offset-2">Write a plan</Link>
          </EmptyState>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {active.length > 0 && (
            <section aria-labelledby="active-heading">
              <SectionTitle id="active-heading" illustration={<ChalkboardIllustration />}>Happening now</SectionTitle>
              <AssignmentList rows={active} hrefFor={href} perspective="TEACHER" timezone={tz} extra={planStatus} />
            </section>
          )}
          <section aria-labelledby="upcoming-heading">
            <SectionTitle id="upcoming-heading" illustration={<ClockIllustration />}>Upcoming</SectionTitle>
            {upcoming.length ? (
              <AssignmentList rows={upcoming} hrefFor={href} perspective="TEACHER" timezone={tz} extra={planStatus} />
            ) : (
              <p className="rounded-xl border border-dashed border-line bg-surface p-4 text-muted">No upcoming substitute days.</p>
            )}
          </section>
          {past.length > 0 && (
            <section aria-labelledby="past-heading">
              <SectionTitle id="past-heading" illustration={<BookIllustration />}>Past</SectionTitle>
              <AssignmentList rows={past} hrefFor={href} perspective="TEACHER" timezone={tz} />
            </section>
          )}
        </div>
      )}
    </>
  );
}
