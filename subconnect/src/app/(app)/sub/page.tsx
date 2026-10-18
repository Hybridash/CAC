import { requireUser } from "@/lib/auth";
import { assignmentsFor, groupByStatus } from "@/lib/queries";
import { AssignmentList } from "@/components/AssignmentList";
import { BookIllustration, CalendarIllustration, ClockIllustration, TeacherDeskIllustration } from "@/components/illustrations";
import { Card, EmptyState, PageHeader, SectionTitle } from "@/components/ui";

export const metadata = { title: "My assignments" };

export default async function SubDashboard() {
  const user = await requireUser("SUBSTITUTE");
  const rows = await assignmentsFor(user);
  const { active, upcoming, past } = groupByStatus(rows);
  const href = (r: { id: string }) => `/sub/assignments/${r.id}`;
  const tz = user.school.timezone;

  return (
    <>
      <PageHeader
        title={`Hello, ${user.name.split(" ")[0]}`}
        subtitle="Your substitute assignments and today's plans."
        illustration={<TeacherDeskIllustration />}
      />
      {rows.length === 0 ? (
        <Card>
          <EmptyState illustration={<CalendarIllustration title="An empty calendar" />} title="No assignments yet">
            When your school admin assigns you to a classroom, it will show up here and you will get a notification.
          </EmptyState>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          <section aria-labelledby="active-heading">
            <SectionTitle id="active-heading" illustration={<TeacherDeskIllustration />}>Today</SectionTitle>
            {active.length ? (
              <AssignmentList rows={active} hrefFor={href} perspective="SUBSTITUTE" timezone={tz} />
            ) : (
              <p className="rounded-xl border border-dashed border-line bg-surface p-4 text-muted">You have no active assignments right now.</p>
            )}
          </section>
          <section aria-labelledby="upcoming-heading">
            <SectionTitle id="upcoming-heading" illustration={<ClockIllustration />}>Upcoming</SectionTitle>
            {upcoming.length ? (
              <AssignmentList rows={upcoming} hrefFor={href} perspective="SUBSTITUTE" timezone={tz} />
            ) : (
              <p className="rounded-xl border border-dashed border-line bg-surface p-4 text-muted">Nothing scheduled.</p>
            )}
          </section>
          {past.length > 0 && (
            <section aria-labelledby="past-heading">
              <SectionTitle id="past-heading" illustration={<BookIllustration />}>Past</SectionTitle>
              <AssignmentList rows={past} hrefFor={href} perspective="SUBSTITUTE" timezone={tz} />
            </section>
          )}
        </div>
      )}
    </>
  );
}
