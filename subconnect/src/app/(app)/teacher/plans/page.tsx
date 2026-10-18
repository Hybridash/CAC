import Link from "next/link";
import { DateTime } from "luxon";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createPlan } from "@/app/actions/plans";
import { dateKey, formatDateKey, todayKey } from "@/lib/time";
import { BookIllustration, ChalkboardIllustration } from "@/components/illustrations";
import { Alert, Button, Card, EmptyState, Field, Input, PageHeader, SectionTitle, Select } from "@/components/ui";

export const metadata = { title: "Sub day plans" };

export default async function PlansPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser("TEACHER");
  const { error } = await searchParams;
  const tz = user.school.timezone;
  const today = todayKey(tz);
  const [plans, templates, assignments] = await Promise.all([
    prisma.subDayPlan.findMany({
      where: { teacherId: user.id },
      orderBy: { date: "asc" },
      include: { _count: { select: { blocks: true, attachments: true } } },
    }),
    prisma.template.findMany({ where: { teacherId: user.id }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.assignment.findMany({ where: { teacherId: user.id, cancelledAt: null }, include: { substitute: { select: { name: true } } } }),
  ]);
  const subFor = (key: string) =>
    assignments.find((a) => dateKey(a.startDate) <= key && key <= dateKey(a.endDate))?.substitute.name;
  const upcoming = plans.filter((p) => dateKey(p.date) >= today);
  const past = plans.filter((p) => dateKey(p.date) < today).reverse();
  const tomorrow = DateTime.fromISO(today).plus({ days: 1 }).toISODate()!;

  const PlanRow = ({ p }: { p: (typeof plans)[number] }) => {
    const key = dateKey(p.date);
    const sub = subFor(key);
    return (
      <li>
        <Link href={`/teacher/plans/${p.id}`} className="block rounded-xl border border-line bg-surface p-4 hover:border-primary-tint hover:bg-primary-soft/40">
          <p className="text-lg font-semibold">{formatDateKey(key)}</p>
          {p.title && <p>{p.title}</p>}
          <p className="text-sm text-muted">
            {p._count.blocks} period{p._count.blocks === 1 ? "" : "s"} · {p._count.attachments} file{p._count.attachments === 1 ? "" : "s"} ·{" "}
            {sub ? `Substitute: ${sub}` : "No substitute assigned yet"}
          </p>
        </Link>
      </li>
    );
  };

  return (
    <>
      <PageHeader title="Sub day plans" subtitle="One plan for each day you'll be out." illustration={<ChalkboardIllustration />} />
      <Card className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Start a plan</h2>
        {error === "date" && <div className="mb-3"><Alert tone="error">Choose a valid date.</Alert></div>}
        <form action={createPlan} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Date you'll be absent" htmlFor="date">
            <Input id="date" name="date" type="date" defaultValue={tomorrow} min={today} required />
          </Field>
          <Field label="Start from" htmlFor="templateId">
            <Select id="templateId" name="templateId" defaultValue={templates[0]?.id ?? ""}>
              <option value="">Blank plan</option>
              {templates.map((t) => <option key={t.id} value={t.id}>Template: {t.name}</option>)}
            </Select>
          </Field>
          <Button type="submit">Create plan</Button>
        </form>
        <p className="mt-2 text-sm text-muted">If a plan already exists for that date, it will open for editing.</p>
      </Card>

      <section aria-labelledby="upcoming-plans" className="mb-8">
        <SectionTitle id="upcoming-plans">Upcoming</SectionTitle>
        {upcoming.length ? (
          <ul className="flex flex-col gap-3">{upcoming.map((p) => <PlanRow key={p.id} p={p} />)}</ul>
        ) : (
          <Card><EmptyState illustration={<BookIllustration title="An open book" />} title="No upcoming plans">Plans you create will be listed here.</EmptyState></Card>
        )}
      </section>
      {past.length > 0 && (
        <section aria-labelledby="past-plans">
          <SectionTitle id="past-plans">Past</SectionTitle>
          <ul className="flex flex-col gap-3">{past.map((p) => <PlanRow key={p.id} p={p} />)}</ul>
        </section>
      )}
    </>
  );
}
