"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canEditPlan } from "@/lib/access";
import { sanitizeRichText } from "@/lib/sanitize";
import { parseDateKey } from "@/lib/time";
import { storage } from "@/lib/storage";
import { notifyPlanUpdated } from "@/lib/plans";
import { ELEMENTARY_DEFAULT_BLOCKS, parseSections, sectionsSchema, type Sections } from "@/lib/sections";

const time = z
  .string()
  .transform((t) => t.trim().replace(/^(\d):(\d{2})$/, "0$1:$2"))
  .pipe(z.string().regex(/^(([01]\d|2[0-3]):[0-5]\d)?$/, "Use a valid time for each period."));
const blockSchema = z.object({
  periodId: z.string().nullable().optional(),
  label: z.string().trim().min(1, "Each period needs a name.").max(80),
  startTime: time,
  endTime: time,
  location: z.string().trim().max(80),
  lessonHtml: z.string().max(100_000),
});
export type BlockInput = z.infer<typeof blockSchema>;

const planSchema = z.object({
  title: z.string().trim().max(140),
  directionsHtml: z.string().max(200_000),
  sections: sectionsSchema.optional(),
  blocks: z.array(blockSchema).max(20, "A plan can have up to 20 periods."),
});

/** Sanitize lesson HTML and drop period links that don't belong to the teacher's school. */
async function cleanBlocks(blocks: BlockInput[], schoolId: string) {
  const ids = new Set((await prisma.period.findMany({ where: { schoolId }, select: { id: true } })).map((p) => p.id));
  return blocks.map((b, i) => ({
    ...b,
    periodId: b.periodId && ids.has(b.periodId) ? b.periodId : null,
    order: i,
    lessonHtml: sanitizeRichText(b.lessonHtml),
  }));
}

const cleanSections = (sections: Sections | undefined) =>
  Object.fromEntries(Object.entries(sections ?? {}).map(([k, v]) => [k, sanitizeRichText(v ?? "")]));

export type SaveResult = { ok: true; savedAt: string } | { ok: false; error: string };

export async function createPlan(form: FormData) {
  const user = await requireApiUser("TEACHER");
  const dateKey = String(form.get("date") ?? "");
  const templateId = String(form.get("templateId") ?? "");
  let date: Date;
  try {
    date = parseDateKey(dateKey);
  } catch {
    redirect("/teacher/plans?error=date");
  }

  const existing = await prisma.subDayPlan.findUnique({ where: { teacherId_date: { teacherId: user.id, date } } });
  if (existing) redirect(`/teacher/plans/${existing.id}`);

  const template = templateId ? await prisma.template.findFirst({ where: { id: templateId, teacherId: user.id } }) : null;
  // No template: elementary teachers get a typical full-day schedule; secondary teachers get
  // one block per period in the school's bell schedule.
  const level = (await prisma.user.findUnique({ where: { id: user.id }, select: { teachingLevel: true } }))?.teachingLevel;
  const startingBlocks: BlockInput[] = template
    ? z.array(blockSchema).catch([]).parse(template.blocks)
    : level === "ELEMENTARY"
      ? ELEMENTARY_DEFAULT_BLOCKS
      : (await prisma.period.findMany({ where: { schoolId: user.schoolId, archived: false }, orderBy: { order: "asc" } })).map((p) => ({
        periodId: p.id,
        label: p.name,
        startTime: p.startTime,
        endTime: p.endTime,
        location: "",
        lessonHtml: "",
      }));
  const plan = await prisma.subDayPlan.create({
    data: {
      teacherId: user.id,
      date,
      directionsHtml: template?.directionsHtml ?? "",
      sections: template ? cleanSections(parseSections(template.sections)) : {},
      blocks: { create: await cleanBlocks(startingBlocks, user.schoolId) },
    },
  });
  await notifyPlanUpdated(plan);
  redirect(`/teacher/plans/${plan.id}`);
}

export async function savePlan(planId: string, input: unknown): Promise<SaveResult> {
  const user = await requireApiUser("TEACHER");
  const plan = await prisma.subDayPlan.findUnique({ where: { id: planId } });
  if (!plan || !canEditPlan(user, plan)) return { ok: false, error: "This plan could not be found." };
  const parsed = planSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { title, directionsHtml, blocks, sections } = parsed.data;
  const cleaned = await cleanBlocks(blocks, user.schoolId);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.planBlock.deleteMany({ where: { planId } });
    if (blocks.length) await tx.planBlock.createMany({ data: cleaned.map((b) => ({ ...b, planId })) });
    return tx.subDayPlan.update({ where: { id: planId }, data: { title, directionsHtml: sanitizeRichText(directionsHtml), sections: cleanSections(sections) } });
  });
  await notifyPlanUpdated(plan);
  revalidatePath(`/teacher/plans/${planId}`);
  return { ok: true, savedAt: updated.updatedAt.toISOString() };
}

export async function deletePlan(form: FormData) {
  const user = await requireApiUser("TEACHER");
  const planId = String(form.get("planId") ?? "");
  const plan = await prisma.subDayPlan.findUnique({ where: { id: planId }, include: { attachments: true } });
  if (!plan || !canEditPlan(user, plan)) redirect("/teacher/plans");
  await prisma.subDayPlan.delete({ where: { id: planId } });
  for (const f of plan.attachments) await storage().delete(f.storageKey).catch(() => {});
  await notifyPlanUpdated(plan);
  redirect("/teacher/plans");
}

const templateSchema = planSchema.omit({ title: true }).extend({ name: z.string().trim().min(1, "Give the template a name.").max(80) });

export async function saveTemplate(templateId: string | null, input: unknown): Promise<SaveResult & { id?: string }> {
  const user = await requireApiUser("TEACHER");
  const parsed = templateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = {
    name: parsed.data.name,
    directionsHtml: sanitizeRichText(parsed.data.directionsHtml),
    sections: cleanSections(parsed.data.sections),
    blocks: (await cleanBlocks(parsed.data.blocks, user.schoolId)).map(({ order: _o, ...b }) => b),
  };
  if (templateId) {
    const t = await prisma.template.findFirst({ where: { id: templateId, teacherId: user.id } });
    if (!t) return { ok: false, error: "This template could not be found." };
    const saved = await prisma.template.update({ where: { id: templateId }, data });
    revalidatePath("/teacher/templates");
    return { ok: true, savedAt: saved.updatedAt.toISOString(), id: saved.id };
  }
  if ((await prisma.template.count({ where: { teacherId: user.id } })) >= 30) return { ok: false, error: "You can keep up to 30 templates." };
  const saved = await prisma.template.create({ data: { ...data, teacherId: user.id } });
  revalidatePath("/teacher/templates");
  return { ok: true, savedAt: saved.updatedAt.toISOString(), id: saved.id };
}

export async function createBlankTemplate() {
  const user = await requireApiUser("TEACHER");
  const t = await prisma.template.create({ data: { teacherId: user.id, name: "New template" } });
  redirect(`/teacher/templates/${t.id}`);
}

export async function deleteTemplate(form: FormData) {
  const user = await requireApiUser("TEACHER");
  await prisma.template.deleteMany({ where: { id: String(form.get("templateId") ?? ""), teacherId: user.id } });
  redirect("/teacher/templates");
}
