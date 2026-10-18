import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loadAssignmentForViewer } from "@/lib/access";
import { listMessages } from "@/lib/chat";
import { periodOptions } from "@/lib/queries";
import { describePeriods, missingLessons } from "@/lib/coverage";
import { cancelAssignment } from "@/app/actions/admin";
import { computeAccessWindow, dateKey, eachDateKey, formatDateKey, formatDateRange, formatDateTime } from "@/lib/time";
import { AssignmentForm } from "@/components/admin/AssignmentForm";
import { ChatPanel } from "@/components/ChatPanel";
import { Icon } from "@/components/icons";
import { ChatIllustration } from "@/components/illustrations";
import { Alert, Button, Card, SectionTitle, StatusBadge } from "@/components/ui";

export const metadata = { title: "Assignment" };
export const dynamic = "force-dynamic";

export default async function AdminAssignmentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const user = await requireUser("ADMIN");
  const { id } = await params;
  const { created } = await searchParams;
  const loaded = await loadAssignmentForViewer(user, id);
  if (!loaded) notFound();
  const { assignment: a, status } = loaded;
  const tz = a.school.timezone;
  const startKey = dateKey(a.startDate);
  const endKey = dateKey(a.endDate);
  const editable = status === "UPCOMING" || status === "ACTIVE";

  const [people, plans] = await Promise.all([
    editable
      ? prisma.user.findMany({ where: { schoolId: user.schoolId, status: "ACTIVE", role: { in: ["TEACHER", "SUBSTITUTE"] } }, orderBy: { name: "asc" }, select: { id: true, name: true, role: true, room: true, subject: true, teachingLevel: true } })
      : Promise.resolve([]),
    prisma.subDayPlan.findMany({
      where: { teacherId: a.teacherId, date: { gte: a.startDate, lte: a.endDate } },
      select: { date: true, directionsHtml: true, blocks: { select: { periodId: true, lessonHtml: true } } },
    }),
  ]);
  const periodChoices = editable ? await periodOptions(user.schoolId, a.periodIds) : [];
  // Admins see whether lesson plans exist for the covered periods, never their contents.
  const missingFor = (d: string) => missingLessons(plans.find((p) => dateKey(p.date) === d), a.periods);
  const opensEvening =
    a.accessStartsAt.getTime() === computeAccessWindow(startKey, endKey, tz, "EVENING_BEFORE").accessStartsAt.getTime();

  return (
    <>
      <Link href="/admin/assignments" className="mb-3 inline-flex min-h-11 items-center gap-1 font-medium text-primary"><Icon name="back" /> Assignments</Link>
      {created && <div className="mb-4"><Alert tone="success">Assignment created. The teacher and substitute were notified.</Alert></div>}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{formatDateRange(startKey, endKey)}</h1>
            <StatusBadge status={status} />
          </div>
          <p className="font-medium text-primary-strong">{describePeriods(a.periods)}</p>
          <p className="text-muted"><span className="font-medium text-ink">{a.substitute.name}</span> covering for <span className="font-medium text-ink">{a.teacher.name}</span>{a.teacher.room && ` · Room ${a.teacher.room}`}</p>
          <p className="text-sm text-muted">Substitute access: {formatDateTime(a.accessStartsAt, tz)} to {formatDateTime(a.accessEndsAt, tz)}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {eachDateKey(startKey, endKey).map((d) => {
              const missing = missingFor(d);
              return (
                <li key={d} className={missing.length ? "rounded-full bg-accent-soft px-3 py-0.5 text-sm text-accent-strong" : "rounded-full bg-ok-soft px-3 py-0.5 text-sm text-ok"}>
                  {formatDateKey(d, "short")}: {missing.length ? `lesson plan needed for ${missing.join(", ")}` : "lesson plans posted"}
                </li>
              );
            })}
          </ul>
        </div>
        {editable && (
          <form action={cancelAssignment}>
            <input type="hidden" name="id" value={a.id} />
            <Button type="submit" variant="danger">Cancel assignment</Button>
          </form>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {editable ? (
          <Card>
            <h2 className="mb-4 text-lg font-semibold">Edit assignment</h2>
            <AssignmentForm
              teachers={people.filter((p) => p.role === "TEACHER").map((p) => ({ id: p.id, name: p.name, elementary: p.teachingLevel === "ELEMENTARY", detail: [p.teachingLevel === "ELEMENTARY" ? "Elementary" : p.subject, p.room && `Room ${p.room}`].filter(Boolean).join(", ") }))}
              substitutes={people.filter((p) => p.role === "SUBSTITUTE")}
              periods={periodChoices}
              defaults={{
                periodIds: a.periodIds,
                id: a.id,
                teacherId: a.teacherId,
                substituteId: a.substituteId,
                startDate: startKey,
                endDate: endKey,
                accessOpens: opensEvening ? "EVENING_BEFORE" : "MORNING_OF",
                notes: a.notes ?? "",
              }}
            />
          </Card>
        ) : (
          <Card>
            <h2 className="mb-2 text-lg font-semibold">Details</h2>
            {a.notes ? <p>{a.notes}</p> : <p className="text-muted">No notes.</p>}
            {a.cancelledAt && <p className="mt-2 text-muted">Cancelled {formatDateTime(a.cancelledAt, tz)}</p>}
          </Card>
        )}
        <Card aria-labelledby="chat-heading">
          <SectionTitle id="chat-heading" illustration={<ChatIllustration />}>Chat record</SectionTitle>
          <p className="mb-3 text-muted">Read-only. Kept for school records.</p>
          <ChatPanel assignmentId={a.id} currentUserId={user.id} initialMessages={await listMessages(a.id)} canSend={false} timezone={tz} observer />
        </Card>
      </div>
    </>
  );
}
