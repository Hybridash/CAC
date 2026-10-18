import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loadPlanForViewer } from "@/lib/access";
import { deletePlan } from "@/app/actions/plans";
import { dateKey, formatDateKey } from "@/lib/time";
import { ACCEPT_ATTR, MAX_UPLOAD_BYTES } from "@/lib/uploads";
import { PlanEditor, type CoverageEntry } from "@/components/PlanEditor";
import { periodOptions } from "@/lib/queries";
import { describePeriods } from "@/lib/coverage";
import { parseSections } from "@/lib/sections";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui";

export const metadata = { title: "Edit plan" };

const blocksSchema = z.array(z.object({ periodId: z.string().nullable().optional(), label: z.string(), startTime: z.string(), endTime: z.string(), location: z.string(), lessonHtml: z.string() })).catch([]);

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("TEACHER");
  const { id } = await params;
  const plan = await loadPlanForViewer(user, id);
  if (!plan) notFound();
  const templates = await prisma.template.findMany({ where: { teacherId: user.id }, orderBy: { name: "asc" } });
  const key = dateKey(plan.date);
  // Every substitute covering this date (one per period, or a full-day sub).
  const assignments = await prisma.assignment.findMany({
    where: { teacherId: user.id, cancelledAt: null, startDate: { lte: plan.date }, endDate: { gte: plan.date } },
    include: { substitute: { select: { name: true } }, periods: { orderBy: { order: "asc" }, select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  const coverage = assignments.flatMap<CoverageEntry>((a) =>
    a.periods.length ? a.periods.map((p) => ({ periodId: p.id, subName: a.substitute.name })) : [{ periodId: null, subName: a.substitute.name }],
  );
  const periods = await periodOptions(user.schoolId, plan.blocks.map((b) => b.periodId).filter((x): x is string => !!x));

  return (
    <>
      <Link href="/teacher/plans" className="mb-3 inline-flex min-h-11 items-center gap-1 font-medium text-primary">
        <Icon name="back" /> All plans
      </Link>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sub plan for {formatDateKey(key)}</h1>
          {assignments.length ? (
            <>
              <ul className="mt-1 flex flex-col gap-0.5">
                {assignments.map((a) => (
                  <li key={a.id}>
                    <Link className="font-medium text-primary underline underline-offset-2" href={`/teacher/assignments/${a.id}`}>{a.substitute.name}</Link>
                    <span className="text-muted">: {describePeriods(a.periods)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted">Each substitute sees only their own periods, and only while their assignment is active.</p>
            </>
          ) : (
            <p className="text-muted">No substitute assigned yet. Only you can see this plan.</p>
          )}
        </div>
        <form action={deletePlan}>
          <input type="hidden" name="planId" value={plan.id} />
          <Button variant="danger" type="submit">Delete plan</Button>
        </form>
      </div>
      <PlanEditor
        mode="plan"
        planId={plan.id}
        level={user.teachingLevel ?? "SECONDARY"}
        initial={{ title: plan.title, directionsHtml: plan.directionsHtml, sections: parseSections(plan.sections), blocks: plan.blocks }}
        files={plan.attachments.map((f) => ({ id: f.id, originalName: f.originalName, mimeType: f.mimeType, size: f.size, periodId: f.periodId, kind: f.kind }))}
        periods={periods}
        coverage={coverage}
        templates={templates.map((t) => ({ id: t.id, name: t.name, directionsHtml: t.directionsHtml, sections: parseSections(t.sections), blocks: blocksSchema.parse(t.blocks) }))}
        maxUploadMb={Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}
        accept={ACCEPT_ATTR}
      />
    </>
  );
}
