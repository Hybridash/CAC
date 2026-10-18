import Link from "next/link";
import { notFound } from "next/navigation";
import { DateTime } from "luxon";
import { requireUser } from "@/lib/auth";
import { audit, loadAssignmentForViewer, plansForAssignment } from "@/lib/access";
import { listMessages, unreadCounts } from "@/lib/chat";
import { dateKey, eachDateKey, formatClock, formatDateKey, formatDateRange, formatDateTime } from "@/lib/time";
import { ChatPanel } from "@/components/ChatPanel";
import { describePeriods } from "@/lib/coverage";
import { ELEMENTARY_SECTIONS, parseSections } from "@/lib/sections";
import { isBlankHtml } from "@/lib/sanitize";
import { LiveAssignment } from "@/components/LiveAssignment";
import { fileKind, formatBytes } from "@/lib/format";
import { Icon } from "@/components/icons";
import { BookIllustration, ChalkboardIllustration, ClockIllustration, FilesIllustration } from "@/components/illustrations";
import { Card, CountBadge, cx, EmptyState, RichText, StatusBadge, buttonClass } from "@/components/ui";

export const metadata = { title: "Assignment" };
export const dynamic = "force-dynamic";

const TABS = [
  { id: "schedule", label: "Schedule" },
  { id: "directions", label: "Directions" },
  { id: "files", label: "Files" },
  { id: "chat", label: "Chat" },
] as const;

type FileRow = { id: string; originalName: string; mimeType: string; size: number; kind: string };

/** Compact, tap-friendly file links used inside schedule cards. */
function FileLinks({ files }: { files: FileRow[] }) {
  if (files.length === 0) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {files.map((f) => (
        <li key={f.id}>
          <a href={`/api/files/${f.id}`} target="_blank" rel="noopener" className={buttonClass("secondary", "px-3")}>
            <Icon name="eye" /> {f.kind === "SEATING_CHART" ? "Seating chart" : f.originalName}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default async function SubAssignmentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string; date?: string }> }) {
  const user = await requireUser("SUBSTITUTE");
  const { id } = await params;
  const sp = await searchParams;
  const loaded = await loadAssignmentForViewer(user, id);
  if (!loaded) notFound();
  const { assignment: a, status, chat } = loaded;
  const tz = a.school.timezone;
  const startKey = dateKey(a.startDate);
  const endKey = dateKey(a.endDate);

  const header = (
    <div className="mb-5">
      <Link href="/sub" className="mb-3 inline-flex min-h-11 items-center gap-1 font-medium text-primary">
        <Icon name="back" /> All assignments
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{a.teacher.name}</h1>
        <StatusBadge status={status} />
      </div>
      <p className="text-muted">
        {[a.teacher.subject, a.teacher.room && `Room ${a.teacher.room}`].filter(Boolean).join(" · ")}
      </p>
      <p className="mt-1 font-medium">{formatDateRange(startKey, endKey)}</p>
      <p className="font-medium text-primary-strong">
        You cover: {a.periods.length ? a.periods.map((p) => `${p.name}${p.startTime ? ` (${formatClock(p.startTime)})` : ""}`).join(", ") : describePeriods([])}
      </p>
      {a.notes && <p className="mt-3 rounded-xl bg-primary-soft px-4 py-3 text-primary-strong"><span className="font-semibold">Note from the office:</span> {a.notes}</p>}
    </div>
  );

  if (status !== "ACTIVE") {
    return (
      <>
        {header}
        <Card>
          {status === "UPCOMING" ? (
            <EmptyState illustration={<ClockIllustration title="A clock" />} title="Plans aren't open yet">
              You will be able to see lesson plans and chat with {a.teacher.name} starting {formatDateTime(a.accessStartsAt, tz)}.
            </EmptyState>
          ) : (
            <EmptyState illustration={<BookIllustration title="A closed book" />} title={status === "CANCELLED" ? "This assignment was cancelled" : "This assignment has ended"}>
              Lesson plans and chat are no longer available. Thank you for covering this classroom.
            </EmptyState>
          )}
        </Card>
      </>
    );
  }

  const plans = await plansForAssignment(user, a);
  const days = eachDateKey(startKey, endKey);
  const today = DateTime.now().setZone(tz).toISODate()!;
  const selectedDate = sp.date && days.includes(sp.date) ? sp.date : days.includes(today) ? today : days[0];
  const plan = plans.find((p) => dateKey(p.date) === selectedDate);
  const tab = TABS.some((t) => t.id === sp.tab) ? sp.tab! : "schedule";
  const unread = (await unreadCounts(user.id, [a.id]))[a.id] ?? 0;
  if (plan) await audit(user.id, "view", "plan", plan.id);
  const sections = plan ? parseSections(plan.sections) : {};
  const hasSections = ELEMENTARY_SECTIONS.some((sec) => !isBlankHtml(sections[sec.key] ?? ""));
  const dayCharts = plan ? plan.attachments.filter((f) => f.kind === "SEATING_CHART" && f.periodId === null) : [];

  const nowClock = DateTime.now().setZone(tz).toFormat("HH:mm");
  const q = (patch: Record<string, string>) => `?${new URLSearchParams({ tab, date: selectedDate, ...patch })}`;

  return (
    <>
      <LiveAssignment assignmentId={a.id} />
      {header}

      {days.length > 1 && (
        <nav aria-label="Days" className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
          {days.map((d) => (
            <Link key={d} href={q({ date: d })} aria-current={d === selectedDate ? "date" : undefined}
              className={cx("min-h-11 shrink-0 rounded-full border px-4 py-2 font-medium", d === selectedDate ? "border-primary bg-primary text-white" : "border-line bg-surface text-ink")}>
              {formatDateKey(d, "short")}
            </Link>
          ))}
        </nav>
      )}

      <nav aria-label="Plan sections" className="sticky top-[57px] z-10 -mx-4 mb-5 border-b border-line bg-canvas/95 px-4 backdrop-blur">
        <ul className="grid grid-cols-4">
          {TABS.map((t) => (
            <li key={t.id}>
              <Link href={q({ tab: t.id })} aria-current={tab === t.id ? "page" : undefined}
                className={cx("flex min-h-12 items-center justify-center gap-1.5 border-b-[3px] font-semibold", tab === t.id ? "border-primary text-primary-strong" : "border-transparent text-muted")}>
                {t.label}
                {t.id === "chat" && tab !== "chat" && <CountBadge count={unread} label="unread messages" />}
                {t.id === "files" && plan && plan.attachments.length > 0 && <span className="text-sm text-muted">({plan.attachments.length})</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {tab === "chat" ? (
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Chat with {a.teacher.name}</h2>
          <ChatPanel assignmentId={a.id} currentUserId={user.id} initialMessages={await listMessages(a.id)} canSend={chat.canSend} timezone={tz} closedNotice="Chat is closed." />
        </Card>
      ) : !plan ? (
        <Card>
          <EmptyState illustration={<ChalkboardIllustration title="A chalkboard" />} title="No plan posted for this day yet">
            {a.teacher.name} hasn&apos;t posted a plan for {formatDateKey(selectedDate)}. This page updates automatically, or you can send a message in Chat.
          </EmptyState>
        </Card>
      ) : tab === "schedule" ? (
        <div className="flex flex-col gap-3">
          {plan.title && <h2 className="text-xl font-semibold">{plan.title}</h2>}
          {dayCharts.length > 0 && (
            <div className="rounded-2xl border border-line bg-surface p-4">
              <p className="font-semibold">Class seating chart</p>
              <FileLinks files={dayCharts} />
            </div>
          )}
          {plan.blocks.length === 0 && (
            <Card>
              <p className="text-muted">
                {a.periods.length ? "No lesson plans have been posted for your periods yet. This page updates automatically." : "No schedule was added. Check the Directions tab."}
              </p>
            </Card>
          )}
          <ol className="flex flex-col gap-3">
            {plan.blocks.map((b) => {
              const isNow = selectedDate === today && b.startTime && b.endTime && nowClock >= b.startTime && nowClock < b.endTime;
              return (
                <li key={b.id} className={cx("rounded-2xl border bg-surface p-4 sm:p-5", isNow ? "border-primary ring-2 ring-primary-tint" : "border-line")}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="text-lg font-semibold">{b.label}</h3>
                    {b.startTime && <p className="font-medium text-primary-strong">{formatClock(b.startTime)}{b.endTime && ` – ${formatClock(b.endTime)}`}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {b.location && <p className="text-muted">{b.location}</p>}
                    {isNow && <span className="rounded-full bg-primary px-2.5 py-0.5 text-sm font-semibold text-white">Now</span>}
                  </div>
                  {b.lessonHtml ? (
                    <RichText html={b.lessonHtml} className="mt-2" />
                  ) : (
                    <p className="mt-2 text-muted">{a.teacher.name} hasn&apos;t posted the lesson plan for this period yet. This page updates automatically.</p>
                  )}
                  {b.periodId && <FileLinks files={plan.attachments.filter((f) => f.periodId === b.periodId)} />}
                </li>
              );
            })}
          </ol>
          <p className="text-sm text-muted">Last updated {formatDateTime(plan.updatedAt, tz)}</p>
        </div>
      ) : tab === "directions" ? (
        <div className="flex flex-col gap-3">
          {ELEMENTARY_SECTIONS.filter((sec) => !isBlankHtml(sections[sec.key] ?? "")).map((sec) => (
            <Card key={sec.key}>
              <h2 className="mb-2 text-lg font-semibold">{sec.title}</h2>
              <RichText html={sections[sec.key]!} />
            </Card>
          ))}
          <Card>
            {hasSections && <h2 className="mb-2 text-lg font-semibold">Other directions</h2>}
            {plan.directionsHtml ? <RichText html={plan.directionsHtml} /> : <p className="text-muted">No general directions were added.</p>}
          </Card>
        </div>
      ) : (
        <Card>
          {plan.attachments.length === 0 ? (
            <EmptyState illustration={<FilesIllustration title="A folder" />} title="No files attached" />
          ) : (
            <ul className="divide-y divide-line">
              {[...plan.attachments].sort((x, y) => Number(y.kind === "SEATING_CHART") - Number(x.kind === "SEATING_CHART")).map((f) => (
                <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <p className="font-medium break-words">
                      {f.kind === "SEATING_CHART" && <span className="mr-2 rounded-full bg-primary-soft px-2 py-0.5 text-sm font-semibold text-primary-strong">Seating chart</span>}
                      {f.originalName}
                    </p>
                    <p className="text-sm text-muted">
                      {f.periodId ? `${plan.blocks.find((b) => b.periodId === f.periodId)?.label ?? "Your period"} · ` : ""}
                      {fileKind(f.mimeType)} · {formatBytes(f.size)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {(f.mimeType === "application/pdf" || f.mimeType.startsWith("image/")) && (
                      <a href={`/api/files/${f.id}`} target="_blank" rel="noopener" className={buttonClass("secondary", "px-3")}><Icon name="eye" /> View</a>
                    )}
                    <a href={`/api/files/${f.id}?download=1`} className={buttonClass("secondary", "px-3")}><Icon name="download" /> Download</a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </>
  );
}
