import Link from "next/link";
import { DateTime } from "luxon";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { todayKey } from "@/lib/time";
import { periodOptions } from "@/lib/queries";
import { AssignmentForm } from "@/components/admin/AssignmentForm";
import { Icon } from "@/components/icons";
import { CalendarIllustration } from "@/components/illustrations";
import { Card, PageHeader } from "@/components/ui";

export const metadata = { title: "New assignment" };

export default async function NewAssignment() {
  const user = await requireUser("ADMIN");
  const school = await prisma.school.findUniqueOrThrow({ where: { id: user.schoolId } });
  const people = await prisma.user.findMany({
    where: { schoolId: user.schoolId, status: "ACTIVE", role: { in: ["TEACHER", "SUBSTITUTE"] } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, role: true, room: true, subject: true, teachingLevel: true },
  });
  const periods = await periodOptions(user.schoolId);
  const today = todayKey(school.timezone);
  const tomorrow = DateTime.fromISO(today).plus({ days: 1 }).toISODate()!;
  return (
    <>
      <Link href="/admin/assignments" className="mb-3 inline-flex min-h-11 items-center gap-1 font-medium text-primary"><Icon name="back" /> Assignments</Link>
      <PageHeader title="New assignment" subtitle="The teacher and substitute will be notified." illustration={<CalendarIllustration />} />
      <Card>
        <AssignmentForm
          teachers={people.filter((p) => p.role === "TEACHER").map((p) => ({ id: p.id, name: p.name, elementary: p.teachingLevel === "ELEMENTARY", detail: [p.teachingLevel === "ELEMENTARY" ? "Elementary" : p.subject, p.room && `Room ${p.room}`].filter(Boolean).join(", ") }))}
          substitutes={people.filter((p) => p.role === "SUBSTITUTE")}
          periods={periods}
          defaults={{ startDate: tomorrow, endDate: tomorrow, accessOpens: school.defaultAccessOpens }}
          minDate={today}
        />
      </Card>
    </>
  );
}
