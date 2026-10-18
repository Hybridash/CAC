import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteTemplate } from "@/app/actions/plans";
import { PlanEditor } from "@/components/PlanEditor";
import { periodOptions } from "@/lib/queries";
import { parseSections } from "@/lib/sections";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui";

export const metadata = { title: "Edit template" };

const blocksSchema = z.array(z.object({ periodId: z.string().nullable().optional(), label: z.string(), startTime: z.string(), endTime: z.string(), location: z.string(), lessonHtml: z.string() })).catch([]);

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("TEACHER");
  const { id } = await params;
  const t = await prisma.template.findFirst({ where: { id, teacherId: user.id } });
  if (!t) notFound();
  const blocks = blocksSchema.parse(t.blocks);
  const periods = await periodOptions(user.schoolId, blocks.map((b) => b.periodId).filter((x): x is string => !!x));
  return (
    <>
      <Link href="/teacher/templates" className="mb-3 inline-flex min-h-11 items-center gap-1 font-medium text-primary">
        <Icon name="back" /> All templates
      </Link>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit template</h1>
        <form action={deleteTemplate}>
          <input type="hidden" name="templateId" value={t.id} />
          <Button variant="danger" type="submit">Delete template</Button>
        </form>
      </div>
      <PlanEditor
        mode="template"
        templateId={t.id}
        periods={periods}
        level={user.teachingLevel ?? "SECONDARY"}
        initial={{ name: t.name, directionsHtml: t.directionsHtml, sections: parseSections(t.sections), blocks }}
      />
    </>
  );
}
