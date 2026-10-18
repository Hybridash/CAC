/**
 * Sample data so the app can be tried immediately. Dates are relative to "today" in the school's timezone.
 * All people and students are fictional.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DateTime } from "luxon";
import { computeAccessWindow, parseDateKey, todayKey } from "../src/lib/time";

const prisma = new PrismaClient();
const TZ = "America/New_York";
const PASSWORD = "Password123!";

const shift = (key: string, days: number) => DateTime.fromISO(key).plus({ days }).toISODate()!;

/** Minimal valid one-page PDF with a few lines of text. */
function makePdf(lines: string[]): Buffer {
  const esc = (s: string) => s.replace(/[\\()]/g, (c) => `\\${c}`);
  const stream = ["BT", "/F1 16 Tf", "72 720 Td", "22 TL", ...lines.map((l) => `(${esc(l)}) Tj T*`), "ET"].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((o, i) => {
    offsets.push(Buffer.byteLength(out));
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out);
}

const STANDARD_DIRECTIONS = `
<h2>Attendance</h2>
<p>Take attendance within the first 10 minutes of each period using the printed roster in the red folder on my desk. Mark absences and send the sheet with a student to the front office.</p>
<h2>Emergency procedures</h2>
<ul><li><strong>Fire drill:</strong> exit left, down the east stairwell, line up at the soccer field fence. Bring the red folder.</li><li><strong>Lockdown:</strong> lock the door, lights off, students to the back corner away from the window.</li><li>The emergency binder is hanging by the door.</li></ul>
<h2>Helpful students</h2>
<p>Period 1: Maya and Leo. Period 3: Priya. They know where everything is.</p>
<h2>Where things are</h2>
<ul><li>Extra pencils and paper: bottom drawer of the gray cabinet</li><li>Printed worksheets: labeled trays on the side table</li><li>Teacher laptop is not needed today</li></ul>
<p>Office extension: <strong>2100</strong>. Team teacher next door: Mr. Chen (Room 114).</p>`;

async function main() {
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.chatReadState.deleteMany(),
    prisma.chatMessage.deleteMany(),
    prisma.fileAttachment.deleteMany(),
    prisma.planBlock.deleteMany(),
    prisma.subDayPlan.deleteMany(),
    prisma.template.deleteMany(),
    prisma.assignment.deleteMany(),
    prisma.period.deleteMany(),
    prisma.session.deleteMany(),
    prisma.user.deleteMany(),
    prisma.school.deleteMany(),
  ]);

  const school = await prisma.school.create({
    data: { name: "Maple Grove Community School", timezone: TZ, joinCode: "MAPLE-2026", defaultAccessOpens: "MORNING_OF" },
  });
  const bell = [
    ["Homeroom", "07:45", "08:00"],
    ["Period 1", "08:05", "08:55"],
    ["Period 2", "09:00", "09:50"],
    ["Period 3", "09:55", "10:45"],
    ["Lunch", "10:50", "11:20"],
    ["Period 4", "11:25", "12:15"],
    ["Period 5", "12:20", "13:10"],
    ["Period 6", "13:15", "14:05"],
  ];
  const P: Record<string, { id: string; startTime: string; endTime: string }> = {};
  for (const [order, [name, startTime, endTime]] of bell.entries()) {
    P[name] = await prisma.period.create({ data: { schoolId: school.id, name, startTime, endTime, order } });
  }
  const at = (name: string) => ({ periodId: P[name].id, label: name, startTime: P[name].startTime, endTime: P[name].endTime });

  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const mk = (email: string, name: string, role: "ADMIN" | "TEACHER" | "SUBSTITUTE", extra: object = {}, status: "ACTIVE" | "PENDING" = "ACTIVE") =>
    prisma.user.create({ data: { email, name, role, status, passwordHash, schoolId: school.id, ...extra } });

  const admin = await mk("admin@maplegrove.test", "Dana Whitaker", "ADMIN");
  const rivera = await mk("rivera@maplegrove.test", "Elena Rivera", "TEACHER", { room: "112", subject: "7th Grade Science", teachingLevel: "SECONDARY" });
  const chen = await mk("chen@maplegrove.test", "David Chen", "TEACHER", { room: "114", subject: "8th Grade Math", teachingLevel: "SECONDARY" });
  const okafor = await mk("okafor@maplegrove.test", "Grace Okafor", "TEACHER", { room: "120", subject: "6th Grade English", teachingLevel: "SECONDARY" });
  const jordan = await mk("jordan@subs.test", "Jordan Lee", "SUBSTITUTE", { phone: "555-0142" });
  const sam = await mk("sam@subs.test", "Sam Patel", "SUBSTITUTE", { phone: "555-0187" });
  const shah = await mk("shah@maplegrove.test", "Priya Shah", "TEACHER", { room: "8", subject: "2nd Grade", teachingLevel: "ELEMENTARY" });
  // Hasn't chosen a teaching level yet, so sees the welcome choice on first sign-in.
  await mk("hill@maplegrove.test", "Marcus Hill", "TEACHER", { room: "205", subject: "Biology" });
  const taylor = await mk("taylor@subs.test", "Taylor Brooks", "SUBSTITUTE", { phone: "555-0163" });
  await mk("alex@subs.test", "Alex Morgan", "SUBSTITUTE", {}, "PENDING");

  const today = todayKey(TZ);
  const assign = async (teacherId: string, substituteId: string, start: string, end: string, notes?: string, periods: string[] = []) =>
    prisma.assignment.create({
      data: {
        schoolId: school.id,
        teacherId,
        substituteId,
        createdById: admin.id,
        startDate: parseDateKey(start),
        endDate: parseDateKey(end),
        ...computeAccessWindow(start, end, TZ, "MORNING_OF"),
        notes,
        periods: { connect: periods.map((n) => ({ id: P[n].id })) },
      },
    });

  // Today Rivera's day is split between two substitutes. Access opened at midnight for the demo.
  const note = "Please check in at the front office by 7:30 AM for a badge.";
  const active = await assign(rivera.id, jordan.id, today, today, note, ["Homeroom", "Period 1", "Period 2", "Period 3"]);
  const activePm = await assign(rivera.id, sam.id, today, today, note, ["Period 4", "Period 5"]);
  // Elementary: one substitute for Ms. Shah's whole day.
  const activeElem = await assign(shah.id, taylor.id, today, today, "Second grade is on the first floor, east wing.");
  await prisma.assignment.updateMany({
    where: { id: { in: [active.id, activePm.id, activeElem.id] } },
    data: { accessStartsAt: DateTime.fromISO(today, { zone: TZ }).startOf("day").toJSDate() },
  });
  const upcoming = await assign(chen.id, sam.id, shift(today, 3), shift(today, 4), "Two-day coverage for a conference.");
  await assign(rivera.id, sam.id, shift(today, 8), shift(today, 8));
  const past = await assign(okafor.id, jordan.id, shift(today, -6), shift(today, -6));

  // Plans
  const riveraPlan = await prisma.subDayPlan.create({
    data: {
      teacherId: rivera.id,
      date: parseDateKey(today),
      title: "Cells review and microscope practice",
      directionsHtml: STANDARD_DIRECTIONS,
      blocks: {
        create: [
          { order: 0, ...at("Homeroom"), location: "Room 112", lessonHtml: "<p>Attendance and announcements. Collect permission slips in the tray by the door.</p>" },
          { order: 1, ...at("Period 1"), location: "Room 112", lessonHtml: "<h3>Cell structure review</h3><ul><li>Hand out the <strong>Cell Parts</strong> worksheet (tray 1).</li><li>Students work in pairs for 30 minutes.</li><li>Last 10 minutes: go over answers using the key in the red folder.</li></ul>" },
          { order: 2, ...at("Period 2"), location: "Room 112", lessonHtml: "<p>Same as Period 1. This group is chatty; the seating chart is in the Files tab.</p>" },
          { order: 3, ...at("Period 3"), label: "Period 3 (planning)", location: "", lessonHtml: "<p>Your planning period. The staff lounge is down the hall on the left.</p>" },
          { order: 4, ...at("Period 4"), location: "Science Lab B", lessonHtml: "<h3>Microscope practice</h3><p>Microscopes are in the cabinet labeled <strong>B</strong>. Students may only use the prepared slides (onion skin). See the video link: <a href=\"https://www.example.org/microscope-basics\">Microscope basics</a>.</p>" },
          { order: 5, ...at("Period 5"), location: "Room 112", lessonHtml: "" },
        ],
      },
    },
  });

  const chenDay1 = shift(today, 3);
  await prisma.subDayPlan.create({
    data: {
      teacherId: chen.id,
      date: parseDateKey(chenDay1),
      title: "Linear equations practice",
      directionsHtml: "<h2>Attendance</h2><p>Use the clipboard by the door.</p><h2>Notes</h2><p>Calculators are in the numbered caddy. Count them back in before students leave.</p>",
      blocks: {
        create: [
          { order: 0, ...at("Period 1"), location: "Room 114", lessonHtml: "<p>Textbook page 142, problems 1 to 20 (odd).</p>" },
          { order: 1, ...at("Period 2"), location: "Room 114", lessonHtml: "<p>Same as Period 1.</p>" },
        ],
      },
    },
  });
  // A plan for a day with no assignment yet (sub must never see this).
  await prisma.subDayPlan.create({
    data: { teacherId: rivera.id, date: parseDateKey(shift(today, 20)), title: "Draft: field trip prep", directionsHtml: "<p>Draft notes.</p>" },
  });
  await prisma.subDayPlan.create({
    data: {
      teacherId: okafor.id,
      date: parseDateKey(shift(today, -6)),
      title: "Independent reading day",
      directionsHtml: "<p>Students read their independent novels and complete a reading log.</p>",
      blocks: { create: [{ order: 0, periodId: null, label: "Periods 1 to 4", startTime: "08:05", endTime: "12:15", location: "Room 120", lessonHtml: "<p>Silent reading, then reading log.</p>" }] },
    },
  });

  const shahPlan = await prisma.subDayPlan.create({
    data: {
      teacherId: shah.id,
      date: parseDateKey(today),
      title: "Pumpkin math and fall writing",
      directionsHtml:
        "<h2>Emergency procedures</h2><p>The red emergency folder is on the hook by the door. Fire drill: exit right, line up on the blacktop by the hopscotch.</p><h2>Health</h2><p>One student has a peanut allergy. The nurse knows; the class eats lunch at the peanut-free table. Send anyone who feels sick to the nurse with a buddy.</p>",
      sections: {
        arrivalHtml:
          "<p>Students come in at 7:50, hang up backpacks, and start the morning work page on their desks.</p><ul><li>Take attendance on the clipboard by 8:10.</li><li>Lunch count: hot lunch or lunch from home. Send the card to the office.</li></ul>",
        dismissalHtml:
          "<ul><li><strong>Bus riders</strong> line up at the door at 2:20 when called on the speaker.</li><li><strong>Car riders</strong> walk with Mrs. Lopez's class to the front loop.</li><li><strong>After-care</strong> students go to the cafeteria.</li></ul><p>The dismissal list is taped inside the red folder.</p>",
        managementHtml:
          "<p>Attention signal: say \"Class, class\" and students answer \"Yes, yes\". Students earn marbles in the jar for good choices.</p><p>Line leader this week: Mateo. Door holder: Ava. Teacher next door: Mrs. Lopez (Room 9).</p>",
      },
      blocks: {
        create: [
          { order: 0, label: "Arrival and morning work", startTime: "07:50", endTime: "08:15", location: "Room 8", lessonHtml: "<p>Morning work page is on each desk. Read quietly when finished.</p>" },
          { order: 1, label: "Morning meeting", startTime: "08:15", endTime: "08:35", location: "Carpet", lessonHtml: "<p>Calendar, weather, and share time. Two students share.</p>" },
          { order: 2, label: "Reading", startTime: "08:35", endTime: "09:45", location: "Room 8", lessonHtml: "<p>Read aloud <strong>The Little Old Lady Who Was Not Afraid of Anything</strong> (on my chair). Then reading groups at the back table.</p>" },
          { order: 3, label: "Specials (music)", startTime: "09:50", endTime: "10:35", location: "Music room", lessonHtml: "<p>Walk the class to music and pick them up at 10:35.</p>" },
          { order: 4, label: "Math", startTime: "10:40", endTime: "11:40", location: "Room 8", lessonHtml: "<h3>Pumpkin math</h3><p>Students estimate and count seeds in groups of 10. Worksheets are in the orange tray.</p>" },
          { order: 5, label: "Lunch and recess", startTime: "11:45", endTime: "12:30", location: "Cafeteria", lessonHtml: "<p>Walk to the cafeteria; lunch aides take over. Pick up from the blacktop at 12:30.</p>" },
          { order: 6, label: "Writing", startTime: "12:35", endTime: "13:20", location: "Room 8", lessonHtml: "<p>Fall writing: three sentences about a favorite fall activity, then draw a picture.</p>" },
          { order: 7, label: "Science", startTime: "13:20", endTime: "14:10", location: "Room 8", lessonHtml: "<p>Watch the leaf life cycle video (link on the board), then color the leaf sheet.</p>" },
          { order: 8, label: "Pack up and dismissal", startTime: "14:10", endTime: "14:30", location: "Room 8", lessonHtml: "<p>Stack chairs, pack folders, and follow the dismissal directions.</p>" },
        ],
      },
    },
  });

  // Attachments (local storage driver only)
  if ((process.env.STORAGE_DRIVER ?? "local") === "local") {
    const dir = path.resolve(process.env.LOCAL_STORAGE_DIR ?? "./storage");
    const addPdf = async (
      plan: { id: string; teacherId: string },
      originalName: string,
      lines: string[],
      kind: "FILE" | "SEATING_CHART",
      periodName?: string,
    ) => {
      const key = `plans/${plan.teacherId}/${crypto.randomUUID()}`;
      fs.mkdirSync(path.join(dir, path.dirname(key)), { recursive: true, mode: 0o700 });
      const pdf = makePdf([...lines, "", "(Sample data - fictional students)"]);
      fs.writeFileSync(path.join(dir, key), pdf, { mode: 0o600 });
      await prisma.fileAttachment.create({
        data: {
          planId: plan.id,
          uploaderId: plan.teacherId,
          originalName,
          mimeType: "application/pdf",
          size: pdf.length,
          storageKey: key,
          kind,
          periodId: periodName ? P[periodName].id : null,
        },
      });
    };
    await addPdf(riveraPlan, "Seating chart - Period 2.pdf", ["Room 112 Seating Chart - Period 2", "", "Row 1: Maya   Leo    Priya   Sam", "Row 2: Noah   Ava    Lucas   Zoe", "Row 3: Ethan  Mia    Omar    Lily"], "SEATING_CHART", "Period 2");
    await addPdf(riveraPlan, "Seating chart - Period 4 lab.pdf", ["Science Lab B Seating Chart - Period 4", "", "Table 1: Grace  Henry", "Table 2: Isla   Jack", "Table 3: Kai    Luna"], "SEATING_CHART", "Period 4");
    await addPdf(riveraPlan, "Lab safety rules.pdf", ["Lab Safety Rules", "", "1. Goggles on at all times.", "2. Carry microscopes with two hands.", "3. Report broken glass to the teacher."], "FILE", "Period 4");
    await addPdf(shahPlan, "Class seating chart.pdf", ["Room 8 Seating Chart - 2nd Grade", "", "Table A: Mateo  Ava   Sofia", "Table B: Liam   Emma  Noah", "Table C: Zara   Ben   Chloe"], "SEATING_CHART");
  }

  await prisma.template.create({
    data: {
      teacherId: rivera.id,
      name: "Standard Sub Directions",
      directionsHtml: STANDARD_DIRECTIONS,
      blocks: [
        { ...at("Homeroom"), location: "Room 112", lessonHtml: "<p>Attendance and announcements.</p>" },
        ...["Period 1", "Period 2", "Period 3", "Period 4", "Period 5"].map((n) => ({ ...at(n), location: "Room 112", lessonHtml: "" })),
      ],
    },
  });

  // Chat history
  const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);
  await prisma.chatMessage.createMany({
    data: [
      { assignmentId: active.id, senderId: rivera.id, body: "Hi Jordan, thanks for covering today! Everything is in the red folder on my desk.", createdAt: minutesAgo(50) },
      { assignmentId: active.id, senderId: jordan.id, body: "Thanks! Found it. Where do I send the attendance sheet?", createdAt: minutesAgo(42) },
      { assignmentId: active.id, senderId: rivera.id, body: "Just send it with a student to the front office after first period.", createdAt: minutesAgo(40) },
    ],
  });
  await prisma.chatReadState.create({ data: { assignmentId: active.id, userId: jordan.id, lastReadAt: minutesAgo(45) } });
  const pastDay = DateTime.fromISO(shift(today, -6), { zone: TZ });
  await prisma.chatMessage.createMany({
    data: [
      { assignmentId: past.id, senderId: okafor.id, body: "Good morning! The reading logs are on the back table.", createdAt: pastDay.set({ hour: 7, minute: 50 }).toJSDate() },
      { assignmentId: past.id, senderId: jordan.id, body: "Got them, thank you. The class was great today.", createdAt: pastDay.set({ hour: 14, minute: 5 }).toJSDate() },
    ],
  });

  for (const [u, a] of [[jordan, active], [sam, upcoming], [taylor, activeElem]] as const) {
    await prisma.notification.create({
      data: { userId: u.id, title: "New assignment", body: "You have a new substitute assignment.", link: `/sub/assignments/${a.id}` },
    });
  }

  console.log(`Seeded "${school.name}" (join code ${school.joinCode}). All sample accounts use password: ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
