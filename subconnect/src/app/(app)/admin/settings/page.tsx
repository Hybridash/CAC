import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { regenerateJoinCode } from "@/app/actions/admin";
import { SchoolForm } from "@/components/admin/SchoolForm";
import { BellScheduleForm } from "@/components/admin/BellScheduleForm";
import { SchoolIllustration } from "@/components/illustrations";
import { Button, Card, PageHeader } from "@/components/ui";

export const metadata = { title: "School settings" };

export default async function SettingsPage() {
  const user = await requireUser("ADMIN");
  const school = await prisma.school.findUniqueOrThrow({ where: { id: user.schoolId } });
  const periods = await prisma.period.findMany({ where: { schoolId: user.schoolId, archived: false }, orderBy: { order: "asc" } });
  const timezones = Intl.supportedValuesOf("timeZone").filter((tz) => /^(America|Pacific|US|Europe|Asia|Australia|Africa|Atlantic)\//.test(tz));
  return (
    <>
      <PageHeader title="School settings" illustration={<SchoolIllustration />} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><SchoolForm school={school} timezones={timezones} /></Card>
        <Card>
          <h2 className="text-lg font-semibold">Join code</h2>
          <p className="mt-1 text-muted">Teachers and substitutes enter this code when they sign up. You approve each request.</p>
          <p className="my-4 rounded-xl bg-primary-soft px-4 py-3 text-center font-mono text-2xl font-bold tracking-widest text-primary-strong">{school.joinCode}</p>
          <form action={regenerateJoinCode}>
            <Button type="submit" variant="secondary">Make a new code</Button>
          </form>
          <p className="mt-2 text-sm text-muted">The old code stops working right away.</p>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold">Bell schedule</h2>
          <p className="mt-1 mb-4 text-muted">The periods in your school day. Admins can assign a different substitute to each period, and teachers write a lesson plan for each one.</p>
          <BellScheduleForm periods={periods.map((p) => ({ id: p.id, name: p.name, startTime: p.startTime, endTime: p.endTime }))} />
        </Card>
      </div>
    </>
  );
}
