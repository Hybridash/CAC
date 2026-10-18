import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loadAssignmentForViewer } from "@/lib/access";
import { listMessages } from "@/lib/chat";
import { createPlan } from "@/app/actions/plans";
import { describePeriods, missingLessons } from "@/lib/coverage";
import { dateKey, eachDateKey, formatDateKey, formatDateRange, formatDateTime } from "@/lib/time";
import { ChatPanel } from "@/components/ChatPanel";
import { Icon } from "@/components/icons";
import { ChalkboardIllustration, ChatIllustration } from "@/components/illustrations";
import { Button, ButtonLink, Card, SectionTitle, StatusBadge } from "@/components/ui";

export const metadata = { title: "Assignment" };
export const dynamic = "force-dynamic";

export default async function TeacherAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("TEACHER");
  const { id } = await params;
  const loaded = await loadAssignmentForViewer(user, id);
  if (!loaded) notFound();
  const { assignment: a, status, chat } = loaded;
  const tz = a.school.timezone;
  const days = eachDateKey(dateKey(a.startDate), dateKey(a.endDate));
  const plans = await prisma.subDayPlan.findMany({
    where: { teacherId: user.id, date: { gte: a.startDate, lte: a.endDate } },
    select: { id: true, date: true, title: true, directionsHtml: true, blocks: { select: { periodId: true, lessonHtml: true } } },
  });
  const planFor = (d: string) => plans.find((p) => dateKey(p.date) === d);

  const closedNotice =
    status === "UPCOMING"
      ? `Chat opens when the assignment starts, ${formatDateTime(a.accessStartsAt, tz)}.`
      : status === "CANCELLED"
        ? "This assignment was cancelled. The chat is read-only."
        : "This assignment has ended. The chat history is kept read-only for your records.";

  return (
    <>
      <Link href="/teacher" className="mb-3 inline-flex min-h-11 items-center gap-1 font-medium text-primary">
        <Icon name="back" /> Home
      </Link>
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{formatDateRange(days[0], days[days.length - 1])}</h1>
          <StatusBadge status={status} />
        </div>
        <p className="font-medium text-primary-strong">Covering: {describePeriods(a.periods)}</p>
        <p className="text-muted">
          Substitute: <span className="font-medium text-ink">{a.substitute.name}</span>
          {a.substitute.phone && <> · {a.substitute.phone}</>}
        </p>
        <p className="text-sm text-muted">
          Their access: {formatDateTime(a.accessStartsAt, tz)} to {formatDateTime(a.accessEndsAt, tz)}
        </p>
        {a.notes && <p className="mt-3 rounded-xl bg-primary-soft px-4 py-3 text-primary-strong"><span className="font-semibold">Note from the office:</span> {a.notes}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card aria-labelledby="plans-heading">
          <SectionTitle id="plans-heading" illustration={<ChalkboardIllustration />}>Sub day plans</SectionTitle>
          <ul className="flex flex-col gap-3">
            {days.map((d) => {
              const p = planFor(d);
              const missing = missingLessons(p, a.periods);
              return (
                <li key={d} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-3">
                  <div>
                    <p className="font-semibold">{formatDateKey(d)}</p>
                    <p className={missing.length ? "text-sm text-accent-strong" : "text-sm text-ok"}>
                      {!p ? "No plan yet" : missing.length ? `Lesson plan needed: ${missing.join(", ")}` : p.title || "Lesson plans ready"}
                    </p>
                  </div>
                  {p ? (
                    <ButtonLink href={`/teacher/plans/${p.id}`} variant="secondary">Edit</ButtonLink>
                  ) : status === "PAST" || status === "CANCELLED" ? null : (
                    <form action={createPlan}>
                      <input type="hidden" name="date" value={d} />
                      <Button type="submit">Write plan</Button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
        <Card aria-labelledby="chat-heading">
          <SectionTitle id="chat-heading" illustration={<ChatIllustration />}>Chat with {a.substitute.name}</SectionTitle>
          <ChatPanel assignmentId={a.id} currentUserId={user.id} initialMessages={await listMessages(a.id)} canSend={chat.canSend} closedNotice={closedNotice} timezone={tz} />
        </Card>
      </div>
    </>
  );
}
