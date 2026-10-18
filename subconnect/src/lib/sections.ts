import { z } from "zod";

/** Extra sections an elementary sub plan has (one class, one substitute, all day). */
export const ELEMENTARY_SECTIONS = [
  { key: "arrivalHtml", title: "Arrival and morning routine", hint: "Where students go when they arrive, morning work, attendance, lunch count." },
  { key: "dismissalHtml", title: "Dismissal", hint: "Bus riders, car riders, walkers, after-care, and who goes where." },
  { key: "managementHtml", title: "Classroom management and helpers", hint: "Signals, rewards, class jobs, helpful students, and the teacher next door." },
] as const;

export type SectionKey = (typeof ELEMENTARY_SECTIONS)[number]["key"];
export type Sections = Partial<Record<SectionKey, string>>;

export const sectionsSchema = z
  .object({ arrivalHtml: z.string().max(100_000), dismissalHtml: z.string().max(100_000), managementHtml: z.string().max(100_000) })
  .partial();

/** Read the JSON column safely (anything unexpected becomes empty). */
export function parseSections(value: unknown): Sections {
  const r = sectionsSchema.safeParse(value);
  return r.success ? r.data : {};
}

/** Whether a coverage choice is allowed for a teacher: elementary classrooms get one sub for the whole day. */
export function coverageAllowed(level: "ELEMENTARY" | "SECONDARY" | null, periodIds: string[]): boolean {
  return !(level === "ELEMENTARY" && periodIds.length > 0);
}

/** Default schedule for a new elementary plan (not tied to the bell schedule). */
export const ELEMENTARY_DEFAULT_BLOCKS = [
  ["Arrival and morning work", "07:50", "08:15"],
  ["Morning meeting", "08:15", "08:35"],
  ["Reading", "08:35", "09:45"],
  ["Specials", "09:50", "10:35"],
  ["Math", "10:40", "11:40"],
  ["Lunch and recess", "11:45", "12:30"],
  ["Writing", "12:35", "13:20"],
  ["Science or social studies", "13:20", "14:10"],
  ["Pack up and dismissal", "14:10", "14:30"],
].map(([label, startTime, endTime]) => ({ periodId: null, label, startTime, endTime, location: "", lessonHtml: "" }));
