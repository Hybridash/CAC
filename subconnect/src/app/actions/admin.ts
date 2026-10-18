"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hashPassword, requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notify } from "@/lib/notify";
import { publish } from "@/lib/events";
import { computeAccessWindow, formatDateRange, parseDateKey } from "@/lib/time";
import { periodsOverlap } from "@/lib/access";
import { describePeriods } from "@/lib/coverage";
import { coverageAllowed } from "@/lib/sections";

export type ActionState = { error?: string; success?: string } | undefined;

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.");
const assignmentSchema = z.object({
  id: z.string().optional(),
  teacherId: z.string().min(1, "Choose a teacher."),
  substituteId: z.string().min(1, "Choose a substitute."),
  startDate: dateKeySchema,
  endDate: dateKeySchema,
  accessOpens: z.enum(["MORNING_OF", "EVENING_BEFORE"]),
  notes: z.string().trim().max(1000).optional(),
});

function emitChanged(...userIds: string[]) {
  for (const id of userIds) publish(`user:${id}`, { type: "assignment-changed" });
}

export async function saveAssignment(_prev: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireApiUser("ADMIN");
  const parsed = assignmentSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { id, teacherId, substituteId, startDate, endDate, accessOpens, notes } = parsed.data;
  if (endDate < startDate) return { error: "The last day must be on or after the first day." };

  const school = await prisma.school.findUniqueOrThrow({ where: { id: admin.schoolId } });
  const fullDay = form.get("coverage") !== "periods";
  const requested = fullDay ? [] : [...new Set(form.getAll("periodIds").map(String))];
  const periods = requested.length
    ? await prisma.period.findMany({ where: { id: { in: requested }, schoolId: school.id }, orderBy: { order: "asc" } })
    : [];
  if (!fullDay && periods.length === 0) return { error: "Choose at least one period, or choose Full day." };
  if (periods.length !== requested.length) return { error: "One of the chosen periods no longer exists." };
  const periodIds = periods.map((p) => p.id);
  const [teacher, sub] = await Promise.all([
    prisma.user.findFirst({ where: { id: teacherId, schoolId: school.id, role: "TEACHER", status: "ACTIVE" } }),
    prisma.user.findFirst({ where: { id: substituteId, schoolId: school.id, role: "SUBSTITUTE", status: "ACTIVE" } }),
  ]);
  if (!teacher) return { error: "Choose an active teacher from your school." };
  if (!sub) return { error: "Choose an active substitute from your school." };

  if (!coverageAllowed(teacher.teachingLevel, periodIds)) {
    return { error: `${teacher.name} teaches elementary, so one substitute covers the whole day. Choose Full day.` };
  }

  const start = parseDateKey(startDate);
  const end = parseDateKey(endDate);
  // A clash = same days AND overlapping periods (full day overlaps everything).
  const clash = async (field: "teacherId" | "substituteId", value: string) => {
    const rows = await prisma.assignment.findMany({
      where: { [field]: value, cancelledAt: null, startDate: { lte: end }, endDate: { gte: start }, ...(id ? { id: { not: id } } : {}) },
      include: { periods: { select: { id: true } }, substitute: { select: { name: true } } },
    });
    return rows.find((r) => periodsOverlap(periodIds, r.periods.map((p) => p.id)));
  };
  if (await clash("substituteId", sub.id)) return { error: `${sub.name} is already assigned elsewhere during those periods.` };
  const teacherClash = await clash("teacherId", teacher.id);
  if (teacherClash) return { error: `${teacher.name} already has ${teacherClash.substitute.name} covering some of those periods.` };

  const window = computeAccessWindow(startDate, endDate, school.timezone, accessOpens);
  const data = { teacherId, substituteId, startDate: start, endDate: end, notes: notes || null, ...window };
  const covering = describePeriods(periods);
  const when = `${formatDateRange(startDate, endDate)} (${covering})`;

  if (id) {
    const existing = await prisma.assignment.findFirst({ where: { id, schoolId: school.id } });
    if (!existing) return { error: "Assignment not found." };
    if (existing.cancelledAt) return { error: "Cancelled assignments can't be edited." };
    await prisma.assignment.update({ where: { id }, data: { ...data, periods: { set: periodIds.map((pid) => ({ id: pid })) } } });
    const recipients = await prisma.user.findMany({ where: { id: { in: [teacherId, substituteId] } }, select: { id: true, email: true, role: true } });
    for (const r of recipients) {
      await notify([r], "Assignment updated", `Your substitute assignment for ${when} was updated.`, r.role === "TEACHER" ? `/teacher/assignments/${id}` : `/sub/assignments/${id}`);
    }
    if (existing.substituteId !== substituteId) {
      const old = await prisma.user.findUnique({ where: { id: existing.substituteId }, select: { id: true, email: true } });
      if (old) await notify([old], "Assignment removed", `You are no longer assigned to cover for ${teacher.name}.`, "/sub");
    }
    if (existing.teacherId !== teacherId) {
      const old = await prisma.user.findUnique({ where: { id: existing.teacherId }, select: { id: true, email: true } });
      if (old) await notify([old], "Assignment changed", "A substitute assignment for your class was moved to another teacher.", "/teacher");
    }
    emitChanged(teacherId, substituteId, existing.teacherId, existing.substituteId);
    revalidatePath("/admin", "layout");
    return { success: "Assignment updated. The teacher and substitute were notified." };
  }

  const created = await prisma.assignment.create({
    data: { ...data, schoolId: school.id, createdById: admin.id, periods: { connect: periodIds.map((pid) => ({ id: pid })) } },
  });
  await notify([teacher], "Substitute assigned", `${sub.name} will cover your class ${when}. Add or review the lesson plans for ${periods.length ? "those periods" : "the day"}.`, `/teacher/assignments/${created.id}`);
  await notify([sub], "New assignment", `You are covering for ${teacher.name}${teacher.room ? ` (Room ${teacher.room})` : ""} ${when}.`, `/sub/assignments/${created.id}`);
  emitChanged(teacher.id, sub.id);
  revalidatePath("/admin", "layout");
  redirect(`/admin/assignments/${created.id}?created=1`);
}

export async function cancelAssignment(form: FormData) {
  const admin = await requireApiUser("ADMIN");
  const id = String(form.get("id") ?? "");
  const a = await prisma.assignment.findFirst({
    where: { id, schoolId: admin.schoolId, cancelledAt: null },
    include: { teacher: { select: { id: true, email: true, name: true } }, substitute: { select: { id: true, email: true } } },
  });
  if (!a) redirect("/admin/assignments");
  await prisma.assignment.update({ where: { id }, data: { cancelledAt: new Date() } });
  const when = formatDateRange(a.startDate.toISOString().slice(0, 10), a.endDate.toISOString().slice(0, 10));
  await notify([a.teacher], "Assignment cancelled", `The substitute assignment for ${when} was cancelled.`, `/teacher/assignments/${id}`);
  await notify([a.substitute], "Assignment cancelled", `Your assignment covering for ${a.teacher.name} ${when} was cancelled.`, "/sub");
  emitChanged(a.teacherId, a.substituteId);
  revalidatePath("/admin", "layout");
  redirect(`/admin/assignments/${id}`);
}

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

const createUserSchema = z.object({
  name: z.string().trim().min(2, "Enter a full name.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email.").max(160),
  role: z.enum(["TEACHER", "SUBSTITUTE", "ADMIN"]),
  password: z.string().min(10, "Temporary password must be at least 10 characters.").max(200),
  room: z.string().trim().max(40).optional(),
  subject: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(40).optional(),
});

export async function createUser(_prev: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireApiUser("ADMIN");
  const parsed = createUserSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { password, room, subject, phone, ...rest } = parsed.data;
  if (await prisma.user.findUnique({ where: { email: rest.email } })) return { error: "An account with that email already exists." };
  await prisma.user.create({
    data: {
      ...rest,
      room: room || null,
      subject: subject || null,
      phone: phone || null,
      status: "ACTIVE",
      schoolId: admin.schoolId,
      passwordHash: await hashPassword(password),
    },
  });
  revalidatePath("/admin/people");
  return { success: `Account created for ${rest.name}. Share the temporary password with them privately.` };
}

async function schoolUser(adminSchoolId: string, userId: string) {
  return prisma.user.findFirst({ where: { id: userId, schoolId: adminSchoolId } });
}

export async function setUserStatus(form: FormData) {
  const admin = await requireApiUser("ADMIN");
  const userId = String(form.get("userId") ?? "");
  const status = z.enum(["ACTIVE", "DISABLED"]).parse(form.get("status"));
  const user = await schoolUser(admin.schoolId, userId);
  if (!user || user.id === admin.id) return;
  await prisma.user.update({ where: { id: userId }, data: { status } });
  if (status === "DISABLED") await prisma.session.deleteMany({ where: { userId } });
  if (status === "ACTIVE" && user.status === "PENDING") {
    await notify([user], "Account approved", "Your SubConnect account was approved. You can now sign in.", "/");
  }
  revalidatePath("/admin", "layout");
}

export async function resetPassword(_prev: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireApiUser("ADMIN");
  const userId = String(form.get("userId") ?? "");
  const password = String(form.get("password") ?? "");
  if (password.length < 10) return { error: "Use at least 10 characters." };
  const user = await schoolUser(admin.schoolId, userId);
  if (!user) return { error: "User not found." };
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(password) } });
  await prisma.session.deleteMany({ where: { userId } });
  return { success: `Password reset for ${user.name}. They have been signed out everywhere.` };
}

// ---------------------------------------------------------------------------
// School settings
// ---------------------------------------------------------------------------

const schoolSchema = z.object({
  name: z.string().trim().min(2).max(120),
  timezone: z.string().refine((tz) => Intl.supportedValuesOf("timeZone").includes(tz), "Choose a valid timezone."),
  defaultAccessOpens: z.enum(["MORNING_OF", "EVENING_BEFORE"]),
});

export async function updateSchool(_prev: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireApiUser("ADMIN");
  const parsed = schoolSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await prisma.school.update({ where: { id: admin.schoolId }, data: parsed.data });
  revalidatePath("/", "layout");
  return { success: "School settings saved." };
}

export async function regenerateJoinCode() {
  const admin = await requireApiUser("ADMIN");
  await prisma.school.update({ where: { id: admin.schoolId }, data: { joinCode: crypto.randomBytes(4).toString("hex").toUpperCase() } });
  revalidatePath("/admin/settings");
}

// ---------------------------------------------------------------------------
// Bell schedule
// ---------------------------------------------------------------------------

const hhmm = z.string().regex(/^(([01]\d|2[0-3]):[0-5]\d)?$/, "Use a valid time.");
const periodsSchema = z
  .array(z.object({ id: z.string().optional(), name: z.string().trim().min(1, "Each period needs a name.").max(40), startTime: hhmm, endTime: hhmm }))
  .max(20, "A bell schedule can have up to 20 periods.");

/**
 * Save the school's bell schedule. Removed periods are archived (not deleted) so existing
 * assignments and plans keep their links.
 */
export async function savePeriods(input: unknown): Promise<ActionState> {
  const admin = await requireApiUser("ADMIN");
  const parsed = periodsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const existing = await prisma.period.findMany({ where: { schoolId: admin.schoolId } });
  const known = new Set(existing.map((p) => p.id));
  const keep = new Set(parsed.data.map((p) => p.id).filter((x): x is string => !!x && known.has(x)));

  await prisma.$transaction([
    prisma.period.updateMany({ where: { schoolId: admin.schoolId, id: { notIn: [...keep] } }, data: { archived: true } }),
    ...parsed.data.map((p, order) =>
      p.id && known.has(p.id)
        ? prisma.period.update({ where: { id: p.id }, data: { name: p.name, startTime: p.startTime, endTime: p.endTime, order, archived: false } })
        : prisma.period.create({ data: { schoolId: admin.schoolId, name: p.name, startTime: p.startTime, endTime: p.endTime, order } }),
    ),
  ]);
  revalidatePath("/", "layout");
  return { success: "Bell schedule saved." };
}
