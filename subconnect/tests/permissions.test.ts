import { describe, expect, it } from "vitest";
import {
  assignmentScope,
  assignmentStatus,
  canSeeBlock,
  canSeeFile,
  periodScope,
  periodsOverlap,
  canEditPlan,
  canViewAssignment,
  canViewPlan,
  chatPermissions,
  type ScopedAssignment,
  type Viewer,
} from "@/lib/access";
import { computeAccessWindow, parseDateKey } from "@/lib/time";
import { coverageAllowed, parseSections } from "@/lib/sections";

const TZ = "America/New_York";
const teacher: Viewer = { id: "t1", role: "TEACHER", schoolId: "s1" };
const otherTeacher: Viewer = { id: "t2", role: "TEACHER", schoolId: "s1" };
const sub: Viewer = { id: "sub1", role: "SUBSTITUTE", schoolId: "s1" };
const otherSub: Viewer = { id: "sub2", role: "SUBSTITUTE", schoolId: "s1" };
const admin: Viewer = { id: "a1", role: "ADMIN", schoolId: "s1" };
const otherAdmin: Viewer = { id: "a2", role: "ADMIN", schoolId: "s2" };

function makeAssignment(
  start: string,
  end: string,
  opens: "MORNING_OF" | "EVENING_BEFORE" = "MORNING_OF",
  extra: Partial<ScopedAssignment> = {},
): ScopedAssignment {
  return {
    teacherId: "t1",
    substituteId: "sub1",
    periodIds: [],
    schoolId: "s1",
    startDate: parseDateKey(start),
    endDate: parseDateKey(end),
    ...computeAccessWindow(start, end, TZ, opens),
    cancelledAt: null,
    ...extra,
  };
}

// Times expressed in New York local time (EDT, UTC-4, in October)
const at = (local: string) => new Date(`${local}-04:00`);

const a = makeAssignment("2026-10-14", "2026-10-15");
const planDay1 = { teacherId: "t1", date: parseDateKey("2026-10-14") };
const planDay2 = { teacherId: "t1", date: parseDateKey("2026-10-15") };
const planOutside = { teacherId: "t1", date: parseDateKey("2026-10-16") };
const otherTeachersPlan = { teacherId: "t2", date: parseDateKey("2026-10-14") };

describe("access window", () => {
  it("opens at 6:00 AM on the first day and closes at midnight after the last day", () => {
    expect(a.accessStartsAt.toISOString()).toBe("2026-10-14T10:00:00.000Z");
    expect(a.accessEndsAt.toISOString()).toBe("2026-10-16T04:00:00.000Z");
  });

  it("can open the evening before", () => {
    const e = makeAssignment("2026-10-14", "2026-10-14", "EVENING_BEFORE");
    expect(e.accessStartsAt.toISOString()).toBe("2026-10-13T22:00:00.000Z");
  });

  it("rejects an end date before the start date", () => {
    expect(() => computeAccessWindow("2026-10-15", "2026-10-14", TZ, "MORNING_OF")).toThrow();
  });

  it("computes status over time", () => {
    expect(assignmentStatus(a, at("2026-10-14T05:59:00"))).toBe("UPCOMING");
    expect(assignmentStatus(a, at("2026-10-14T06:00:00"))).toBe("ACTIVE");
    expect(assignmentStatus(a, at("2026-10-15T23:59:00"))).toBe("ACTIVE");
    expect(assignmentStatus(a, at("2026-10-16T00:00:00"))).toBe("PAST");
    expect(assignmentStatus({ ...a, cancelledAt: new Date() }, at("2026-10-14T09:00:00"))).toBe("CANCELLED");
  });
});

describe("plan access", () => {
  const during = at("2026-10-14T09:00:00");

  it("substitute can view covered plans only while the assignment is active", () => {
    expect(canViewPlan(sub, planDay1, [a], during)).toBe(true);
    expect(canViewPlan(sub, planDay2, [a], during)).toBe(true);
  });

  it("substitute cannot view plans before the assignment starts", () => {
    expect(canViewPlan(sub, planDay1, [a], at("2026-10-13T20:00:00"))).toBe(false);
  });

  it("substitute loses access automatically after the assignment ends", () => {
    expect(canViewPlan(sub, planDay1, [a], at("2026-10-16T00:00:01"))).toBe(false);
    expect(canViewPlan(sub, planDay2, [a], at("2026-10-20T09:00:00"))).toBe(false);
  });

  it("substitute cannot view the teacher's plans for dates outside the assignment", () => {
    expect(canViewPlan(sub, planOutside, [a], during)).toBe(false);
  });

  it("substitute cannot view another teacher's plans", () => {
    expect(canViewPlan(sub, otherTeachersPlan, [a], during)).toBe(false);
  });

  it("a different substitute cannot use someone else's assignment", () => {
    expect(canViewPlan(otherSub, planDay1, [a], during)).toBe(false);
  });

  it("cancelled assignments grant no access", () => {
    expect(canViewPlan(sub, planDay1, [{ ...a, cancelledAt: new Date() }], during)).toBe(false);
  });

  it("substitute with no assignments sees nothing", () => {
    expect(canViewPlan(sub, planDay1, [], during)).toBe(false);
  });

  it("teacher always sees and edits own plans, never others'", () => {
    expect(canViewPlan(teacher, planOutside, [], during)).toBe(true);
    expect(canEditPlan(teacher, planDay1)).toBe(true);
    expect(canViewPlan(otherTeacher, planDay1, [a], during)).toBe(false);
    expect(canEditPlan(otherTeacher, planDay1)).toBe(false);
  });

  it("substitutes and admins can never edit plans", () => {
    expect(canEditPlan(sub, planDay1)).toBe(false);
    expect(canEditPlan(admin, planDay1)).toBe(false);
  });

  it("admins do not see plan content", () => {
    expect(canViewPlan(admin, planDay1, [a], during)).toBe(false);
  });
});

describe("chat access", () => {
  const before = at("2026-10-13T12:00:00");
  const during = at("2026-10-14T09:00:00");
  const after = at("2026-10-17T09:00:00");

  it("teacher and substitute can chat only while active", () => {
    expect(chatPermissions(teacher, a, during)).toEqual({ canRead: true, canSend: true });
    expect(chatPermissions(sub, a, during)).toEqual({ canRead: true, canSend: true });
    expect(chatPermissions(sub, a, before)).toEqual({ canRead: false, canSend: false });
    expect(chatPermissions(teacher, a, before).canSend).toBe(false);
  });

  it("after the assignment ends, history is read-only for teacher and admin and hidden from the substitute", () => {
    expect(chatPermissions(teacher, a, after)).toEqual({ canRead: true, canSend: false });
    expect(chatPermissions(admin, a, after)).toEqual({ canRead: true, canSend: false });
    expect(chatPermissions(sub, a, after)).toEqual({ canRead: false, canSend: false });
  });

  it("outsiders get nothing", () => {
    expect(chatPermissions(otherSub, a, during)).toEqual({ canRead: false, canSend: false });
    expect(chatPermissions(otherTeacher, a, during)).toEqual({ canRead: false, canSend: false });
    expect(chatPermissions(otherAdmin, a, during)).toEqual({ canRead: false, canSend: false });
  });

  it("assignment records are visible only to participants and the school's admins", () => {
    expect(canViewAssignment(teacher, a)).toBe(true);
    expect(canViewAssignment(sub, a)).toBe(true);
    expect(canViewAssignment(admin, a)).toBe(true);
    expect(canViewAssignment(otherSub, a)).toBe(false);
    expect(canViewAssignment(otherTeacher, a)).toBe(false);
    expect(canViewAssignment(otherAdmin, a)).toBe(false);
  });
});

describe("per-period coverage", () => {
  const during = at("2026-10-14T09:00:00");
  // Jordan (sub1) covers periods 1-2, Sam (sub2) covers period 3, for the same teacher on the same day.
  const jordan = makeAssignment("2026-10-14", "2026-10-14", "MORNING_OF", { periodIds: ["p1", "p2"] });
  const sam = makeAssignment("2026-10-14", "2026-10-14", "MORNING_OF", { substituteId: "sub2", periodIds: ["p3"] });
  const both = [jordan, sam];
  const plan = { teacherId: "t1", date: parseDateKey("2026-10-14") };
  const block = (periodId: string | null) => ({ periodId });

  it("each substitute sees only the lesson blocks for their own periods", () => {
    const js = periodScope(sub, plan, both, during)!;
    const ss = periodScope(otherSub, plan, both, during)!;
    expect(canSeeBlock(js, block("p1"))).toBe(true);
    expect(canSeeBlock(js, block("p2"))).toBe(true);
    expect(canSeeBlock(js, block("p3"))).toBe(false);
    expect(canSeeBlock(ss, block("p3"))).toBe(true);
    expect(canSeeBlock(ss, block("p1"))).toBe(false);
  });

  it("blocks that aren't tied to a period are only for full-day substitutes", () => {
    expect(canSeeBlock(periodScope(sub, plan, both, during)!, block(null))).toBe(false);
    const fullDay = makeAssignment("2026-10-14", "2026-10-14");
    expect(canSeeBlock(periodScope(sub, plan, [fullDay], during)!, block(null))).toBe(true);
  });

  it("day-level files are shared; period files only reach that period's substitute", () => {
    const js = periodScope(sub, plan, both, during)!;
    const ss = periodScope(otherSub, plan, both, during)!;
    expect(canSeeFile(js, { periodId: null })).toBe(true);
    expect(canSeeFile(ss, { periodId: null })).toBe(true);
    expect(canSeeFile(js, { periodId: "p2" })).toBe(true);
    expect(canSeeFile(ss, { periodId: "p2" })).toBe(false);
  });

  it("the teacher sees every period", () => {
    const scope = periodScope(teacher, plan, [], during);
    expect(scope).toBe("ALL");
    expect(canSeeBlock(scope!, block("p3"))).toBe(true);
  });

  it("period access still ends with the assignment", () => {
    expect(periodScope(otherSub, plan, both, at("2026-10-15T09:00:00"))).toBeNull();
  });

  it("a single assignment's scope is limited to its periods", () => {
    const scope = assignmentScope(sam);
    expect(canSeeBlock(scope, block("p3"))).toBe(true);
    expect(canSeeBlock(scope, block("p1"))).toBe(false);
    expect(assignmentScope(makeAssignment("2026-10-14", "2026-10-14"))).toBe("ALL");
  });

  it("detects clashing period selections (empty means full day)", () => {
    expect(periodsOverlap(["p1", "p2"], ["p3"])).toBe(false);
    expect(periodsOverlap(["p1", "p2"], ["p2"])).toBe(true);
    expect(periodsOverlap([], ["p3"])).toBe(true);
    expect(periodsOverlap(["p1"], [])).toBe(true);
  });
});

describe("elementary classrooms", () => {
  it("allow only full-day coverage", () => {
    expect(coverageAllowed("ELEMENTARY", [])).toBe(true);
    expect(coverageAllowed("ELEMENTARY", ["p1"])).toBe(false);
    expect(coverageAllowed("SECONDARY", ["p1", "p2"])).toBe(true);
    expect(coverageAllowed(null, ["p1"])).toBe(true);
  });

  it("give the full-day substitute every block and file, including the class seating chart", () => {
    const fullDay = makeAssignment("2026-10-14", "2026-10-14");
    const scope = periodScope(sub, { teacherId: "t1", date: parseDateKey("2026-10-14") }, [fullDay], at("2026-10-14T09:00:00"))!;
    expect(canSeeBlock(scope, { periodId: null })).toBe(true);
    expect(canSeeFile(scope, { periodId: null })).toBe(true);
  });

  it("read stored sections defensively", () => {
    expect(parseSections({ arrivalHtml: "<p>Line up</p>" })).toEqual({ arrivalHtml: "<p>Line up</p>" });
    expect(parseSections("garbage")).toEqual({});
    expect(parseSections({ arrivalHtml: 5 })).toEqual({});
  });
});
