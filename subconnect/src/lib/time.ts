import { DateTime } from "luxon";
import type { AccessOpens } from "@prisma/client";

/** "YYYY-MM-DD" from a Prisma @db.Date value (stored at UTC midnight). */
export function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Parse "YYYY-MM-DD" into the Date Prisma expects for @db.Date columns. */
export function parseDateKey(key: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) throw new Error("Invalid date");
  const d = new Date(`${key}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date");
  return d;
}

/** Today's date key in the given timezone. */
export function todayKey(timezone: string, now = new Date()): string {
  return DateTime.fromJSDate(now).setZone(timezone).toISODate()!;
}

/**
 * Compute when a substitute's access opens and closes, in the school's timezone.
 * Opens: 6:00 AM on the first day, or 6:00 PM the evening before.
 * Closes: midnight at the end of the last day.
 */
export function computeAccessWindow(
  startKey: string,
  endKey: string,
  timezone: string,
  opens: AccessOpens,
): { accessStartsAt: Date; accessEndsAt: Date } {
  const first = DateTime.fromISO(startKey, { zone: timezone }).startOf("day");
  const last = DateTime.fromISO(endKey, { zone: timezone }).startOf("day");
  if (!first.isValid || !last.isValid) throw new Error("Invalid date");
  if (last < first) throw new Error("End date must be on or after start date");
  const start =
    opens === "EVENING_BEFORE" ? first.minus({ days: 1 }).set({ hour: 18 }) : first.set({ hour: 6 });
  const end = last.plus({ days: 1 });
  return { accessStartsAt: start.toJSDate(), accessEndsAt: end.toJSDate() };
}

export function formatDateKey(key: string, opts: "long" | "short" = "long"): string {
  const dt = DateTime.fromISO(key);
  return opts === "long" ? dt.toFormat("cccc, LLLL d, yyyy") : dt.toFormat("ccc, LLL d");
}

export function formatDateRange(startKey: string, endKey: string): string {
  if (startKey === endKey) return formatDateKey(startKey, "long");
  return `${formatDateKey(startKey, "short")} – ${formatDateKey(endKey, "short")}, ${DateTime.fromISO(endKey).year}`;
}

export function formatDateTime(d: Date, timezone: string): string {
  return DateTime.fromJSDate(d).setZone(timezone).toFormat("ccc, LLL d 'at' h:mm a");
}

export function formatTime(d: Date, timezone: string): string {
  return DateTime.fromJSDate(d).setZone(timezone).toFormat("h:mm a");
}

/** Every date key from start to end inclusive. */
export function eachDateKey(startKey: string, endKey: string): string[] {
  const out: string[] = [];
  let d = DateTime.fromISO(startKey, { zone: "utc" });
  const end = DateTime.fromISO(endKey, { zone: "utc" });
  while (d <= end && out.length < 366) {
    out.push(d.toISODate()!);
    d = d.plus({ days: 1 });
  }
  return out;
}

/** "13:05" -> "1:05 PM" */
export function formatClock(hhmm: string): string {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return "";
  const h = Number(m[1]);
  return `${((h + 11) % 12) + 1}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
}
