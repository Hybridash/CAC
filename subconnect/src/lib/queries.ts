import "server-only";
import { prisma } from "./db";
import { assignmentStatus, type AssignmentStatus } from "./access";
import { unreadCounts } from "./chat";
import { dateKey, formatClock } from "./time";

export type AssignmentRow = {
  id: string;
  status: AssignmentStatus;
  startKey: string;
  endKey: string;
  accessStartsAt: Date;
  accessEndsAt: Date;
  notes: string | null;
  teacher: { id: string; name: string; room: string | null; subject: string | null };
  substitute: { id: string; name: string };
  periods: Array<{ id: string; name: string }>;
  unread: number;
};

/** Assignments for a teacher or substitute (or a whole school for admins), with status and unread counts. */
export async function assignmentsFor(user: { id: string; role: string; schoolId: string }, opts: { includeCancelled?: boolean } = {}) {
  const where =
    user.role === "TEACHER" ? { teacherId: user.id } : user.role === "SUBSTITUTE" ? { substituteId: user.id } : { schoolId: user.schoolId };
  const rows = await prisma.assignment.findMany({
    where: { ...where, ...(opts.includeCancelled ? {} : { cancelledAt: null }) },
    include: {
      teacher: { select: { id: true, name: true, room: true, subject: true } },
      substitute: { select: { id: true, name: true } },
      periods: { orderBy: { order: "asc" }, select: { id: true, name: true } },
    },
    orderBy: { startDate: "asc" },
  });
  const unread = user.role === "ADMIN" ? {} : await unreadCounts(user.id, rows.map((r) => r.id));
  return rows.map<AssignmentRow>((a) => ({
    id: a.id,
    status: assignmentStatus(a),
    startKey: dateKey(a.startDate),
    endKey: dateKey(a.endDate),
    accessStartsAt: a.accessStartsAt,
    accessEndsAt: a.accessEndsAt,
    notes: a.notes,
    teacher: a.teacher,
    substitute: a.substitute,
    periods: a.periods,
    unread: unread[a.id] ?? 0,
  }));
}

export function groupByStatus(rows: AssignmentRow[]) {
  return {
    active: rows.filter((r) => r.status === "ACTIVE"),
    upcoming: rows.filter((r) => r.status === "UPCOMING"),
    past: rows.filter((r) => r.status === "PAST").reverse(),
    cancelled: rows.filter((r) => r.status === "CANCELLED").reverse(),
  };
}

export function periodTime(p: { startTime: string; endTime: string }) {
  return p.startTime ? `${formatClock(p.startTime)}${p.endTime ? ` – ${formatClock(p.endTime)}` : ""}` : "";
}

/** Bell-schedule periods to offer in forms: active ones, plus any archived ones already in use. */
export async function periodOptions(schoolId: string, keepIds: string[] = []) {
  const periods = await prisma.period.findMany({
    where: { schoolId, OR: [{ archived: false }, { id: { in: keepIds } }] },
    orderBy: { order: "asc" },
  });
  return periods.map((p) => ({ id: p.id, name: p.name, startTime: p.startTime, endTime: p.endTime, time: periodTime(p) }));
}
