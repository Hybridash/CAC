/**
 * Authorization rules. Every server route and page goes through these functions.
 * The pure functions at the top are unit tested; the DB-backed loaders below use them.
 */
import type { Role } from "@prisma/client";
import { prisma } from "./db";

export type AssignmentStatus = "UPCOMING" | "ACTIVE" | "PAST" | "CANCELLED";

export type AssignmentWindow = {
  teacherId: string;
  substituteId: string;
  schoolId: string;
  startDate: Date;
  endDate: Date;
  accessStartsAt: Date;
  accessEndsAt: Date;
  cancelledAt: Date | null;
};

export type Viewer = { id: string; role: Role; schoolId: string };

export function assignmentStatus(a: Pick<AssignmentWindow, "accessStartsAt" | "accessEndsAt" | "cancelledAt">, now = new Date()): AssignmentStatus {
  if (a.cancelledAt) return "CANCELLED";
  if (now < a.accessStartsAt) return "UPCOMING";
  if (now < a.accessEndsAt) return "ACTIVE";
  return "PAST";
}

export function isActive(a: AssignmentWindow, now = new Date()): boolean {
  return assignmentStatus(a, now) === "ACTIVE";
}

/** Does this assignment cover the given plan date? (dates are UTC-midnight @db.Date values) */
export function coversDate(a: Pick<AssignmentWindow, "startDate" | "endDate">, date: Date): boolean {
  return date.getTime() >= a.startDate.getTime() && date.getTime() <= a.endDate.getTime();
}

/** An assignment plus the bell-schedule periods it covers (empty = full day). */
export type ScopedAssignment = AssignmentWindow & { periodIds: string[] };

/** "ALL" = every block and file; otherwise only blocks/files for these period ids. */
export type PeriodScope = "ALL" | Set<string>;

/**
 * Which parts of a plan can the viewer see? Returns null for no access at all.
 * - The owning teacher: everything.
 * - A substitute: only via an ACTIVE assignment for that teacher that covers the plan's date,
 *   and only the periods that assignment covers (a full-day assignment covers everything).
 * - Admins and everyone else: nothing (least privilege; plans may contain student information).
 */
export function periodScope(
  viewer: Viewer,
  plan: { teacherId: string; date: Date },
  assignments: ScopedAssignment[],
  now = new Date(),
): PeriodScope | null {
  if (viewer.role === "TEACHER") return viewer.id === plan.teacherId ? "ALL" : null;
  if (viewer.role !== "SUBSTITUTE") return null;
  const covering = assignments.filter(
    (a) => a.substituteId === viewer.id && a.teacherId === plan.teacherId && isActive(a, now) && coversDate(a, plan.date),
  );
  if (covering.length === 0) return null;
  if (covering.some((a) => a.periodIds.length === 0)) return "ALL";
  return new Set(covering.flatMap((a) => a.periodIds));
}

/** Scope granted by one assignment on its own. */
export function assignmentScope(a: { periodIds: string[] }): PeriodScope {
  return a.periodIds.length === 0 ? "ALL" : new Set(a.periodIds);
}

export function canViewPlan(viewer: Viewer, plan: { teacherId: string; date: Date }, assignments: ScopedAssignment[], now = new Date()): boolean {
  return periodScope(viewer, plan, assignments, now) !== null;
}

/** Blocks not tied to a class period are only shown to full-day substitutes. */
export function canSeeBlock(scope: PeriodScope, block: { periodId: string | null }): boolean {
  return scope === "ALL" || (block.periodId !== null && scope.has(block.periodId));
}

/** Day-level files (no period) are shared with every sub that day; period files only with that period's sub. */
export function canSeeFile(scope: PeriodScope, file: { periodId: string | null }): boolean {
  return scope === "ALL" || file.periodId === null || scope.has(file.periodId);
}

/** Do two period selections clash? Empty = full day, which clashes with everything. */
export function periodsOverlap(a: string[], b: string[]): boolean {
  return a.length === 0 || b.length === 0 || a.some((id) => b.includes(id));
}

export function canEditPlan(viewer: Viewer, plan: { teacherId: string }): boolean {
  return viewer.role === "TEACHER" && viewer.id === plan.teacherId;
}

export type ChatPermissions = { canRead: boolean; canSend: boolean };

/**
 * Chat rules:
 * - Teacher & substitute can send only while the assignment is ACTIVE.
 * - Substitute can read only while ACTIVE.
 * - Teacher can always read their own assignment's history (read-only once it ends).
 * - Admin of the same school can always read (read-only, for records), never send.
 */
export function chatPermissions(viewer: Viewer, a: AssignmentWindow, now = new Date()): ChatPermissions {
  const active = isActive(a, now);
  if (viewer.role === "TEACHER" && viewer.id === a.teacherId) return { canRead: true, canSend: active };
  if (viewer.role === "SUBSTITUTE" && viewer.id === a.substituteId) return { canRead: active, canSend: active };
  if (viewer.role === "ADMIN" && viewer.schoolId === a.schoolId) return { canRead: true, canSend: false };
  return { canRead: false, canSend: false };
}

/** Can the viewer see the assignment record itself (dates, people, notes)? */
export function canViewAssignment(viewer: Viewer, a: AssignmentWindow): boolean {
  if (viewer.role === "ADMIN") return viewer.schoolId === a.schoolId;
  if (viewer.role === "TEACHER") return viewer.id === a.teacherId;
  if (viewer.role === "SUBSTITUTE") return viewer.id === a.substituteId;
  return false;
}

// ---------------------------------------------------------------------------
// DB-backed loaders. They return null when access is denied so callers respond 404
// (not 403) and don't reveal whether something exists.
// ---------------------------------------------------------------------------

async function activeAssignmentsFor(subId: string, teacherId: string, now: Date): Promise<ScopedAssignment[]> {
  const rows = await prisma.assignment.findMany({
    where: {
      substituteId: subId,
      teacherId,
      cancelledAt: null,
      accessStartsAt: { lte: now },
      accessEndsAt: { gt: now },
    },
    include: { periods: { select: { id: true } } },
  });
  return rows.map(({ periods, ...a }) => ({ ...a, periodIds: periods.map((p) => p.id) }));
}

export async function loadPlanForViewer(viewer: Viewer, planId: string, now = new Date()) {
  const plan = await prisma.subDayPlan.findUnique({
    where: { id: planId },
    include: {
      blocks: { orderBy: { order: "asc" } },
      attachments: { orderBy: { createdAt: "asc" } },
      teacher: { select: { id: true, name: true, room: true, subject: true, schoolId: true } },
    },
  });
  if (!plan) return null;
  const assignments = viewer.role === "SUBSTITUTE" ? await activeAssignmentsFor(viewer.id, plan.teacherId, now) : [];
  const scope = periodScope(viewer, plan, assignments, now);
  if (!scope) return null;
  return {
    ...plan,
    blocks: plan.blocks.filter((b) => canSeeBlock(scope, b)),
    attachments: plan.attachments.filter((f) => canSeeFile(scope, f)),
  };
}

export async function loadAttachmentForViewer(viewer: Viewer, attachmentId: string, now = new Date()) {
  const file = await prisma.fileAttachment.findUnique({
    where: { id: attachmentId },
    include: { plan: { select: { id: true, teacherId: true, date: true } } },
  });
  if (!file) return null;
  const assignments = viewer.role === "SUBSTITUTE" ? await activeAssignmentsFor(viewer.id, file.plan.teacherId, now) : [];
  const scope = periodScope(viewer, file.plan, assignments, now);
  return scope && canSeeFile(scope, file) ? file : null;
}

export async function loadAssignmentForViewer(viewer: Viewer, assignmentId: string, now = new Date()) {
  const a = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      teacher: { select: { id: true, name: true, email: true, room: true, subject: true } },
      substitute: { select: { id: true, name: true, email: true, phone: true } },
      school: { select: { timezone: true, name: true } },
      periods: { orderBy: { order: "asc" }, select: { id: true, name: true, startTime: true, endTime: true } },
    },
  });
  if (!a || !canViewAssignment(viewer, a)) return null;
  const assignment = { ...a, periodIds: a.periods.map((p) => p.id) };
  return { assignment, status: assignmentStatus(a, now), chat: chatPermissions(viewer, a, now) };
}

/**
 * Plans for an assignment's dates. Substitutes get them only while the assignment is active,
 * trimmed to the periods this assignment covers.
 */
export async function plansForAssignment(viewer: Viewer, a: ScopedAssignment, now = new Date()) {
  const isTeacher = viewer.role === "TEACHER" && viewer.id === a.teacherId;
  const isSub = viewer.role === "SUBSTITUTE" && viewer.id === a.substituteId && isActive(a, now);
  if (!isTeacher && !isSub) return [];
  const plans = await prisma.subDayPlan.findMany({
    where: { teacherId: a.teacherId, date: { gte: a.startDate, lte: a.endDate } },
    include: { blocks: { orderBy: { order: "asc" } }, attachments: { orderBy: { createdAt: "asc" } } },
    orderBy: { date: "asc" },
  });
  if (isTeacher) return plans;
  const scope = assignmentScope(a);
  return plans.map((p) => ({
    ...p,
    blocks: p.blocks.filter((b) => canSeeBlock(scope, b)),
    attachments: p.attachments.filter((f) => canSeeFile(scope, f)),
  }));
}

export async function audit(userId: string, action: string, targetType: string, targetId: string) {
  await prisma.auditLog.create({ data: { userId, action, targetType, targetId } }).catch(() => {});
}
