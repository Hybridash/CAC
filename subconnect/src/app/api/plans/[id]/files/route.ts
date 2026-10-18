import { assertSameOrigin, errorResponse, HttpError, requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canEditPlan } from "@/lib/access";
import { newStorageKey, storage } from "@/lib/storage";
import { cleanFilename, MAX_UPLOAD_BYTES, validateUpload } from "@/lib/uploads";
import { rateLimit } from "@/lib/rate-limit";
import { notifyPlanUpdated } from "@/lib/plans";

export const runtime = "nodejs";

/** Upload a file to a plan. Only the owning teacher can upload. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const { id } = await params;
    const user = await requireApiUser("TEACHER");
    const plan = await prisma.subDayPlan.findUnique({ where: { id } });
    if (!plan || !canEditPlan(user, plan)) throw new HttpError(404, "Not found");
    if (!rateLimit(`upload:${user.id}`, 30, 10 * 60_000)) throw new HttpError(429, "Too many uploads. Please wait a few minutes.");

    const len = Number(req.headers.get("content-length") ?? 0);
    if (len > MAX_UPLOAD_BYTES + 1024 * 64) throw new HttpError(413, `Files must be under ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.`);

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(400, "Choose a file to upload.");
    if ((await prisma.fileAttachment.count({ where: { planId: id } })) >= 25) throw new HttpError(400, "A plan can have up to 25 files.");

    const bytes = Buffer.from(await file.arrayBuffer());
    const check = validateUpload(file.name, bytes);
    if (!check.ok) throw new HttpError(400, check.error);

    // Optional: limit the file to the substitute covering one period (e.g. a seating chart).
    const periodField = String(form.get("periodId") ?? "");
    const period = periodField ? await prisma.period.findFirst({ where: { id: periodField, schoolId: user.schoolId } }) : null;
    if (periodField && !period) throw new HttpError(400, "Choose a valid period.");

    const kind = form.get("kind") === "SEATING_CHART" ? "SEATING_CHART" : "FILE";

    const storageKey = newStorageKey(user.id);
    await storage().put(storageKey, bytes, check.mime);
    const saved = await prisma.fileAttachment.create({
      data: { planId: id, uploaderId: user.id, originalName: cleanFilename(file.name), mimeType: check.mime, size: bytes.length, storageKey, kind, periodId: period?.id ?? null },
    });
    await prisma.subDayPlan.update({ where: { id }, data: { updatedAt: new Date() } });
    await notifyPlanUpdated(plan);
    return Response.json(
      { file: { id: saved.id, originalName: saved.originalName, mimeType: saved.mimeType, size: saved.size, kind: saved.kind, periodId: saved.periodId } },
      { status: 201 },
    );
  } catch (e) {
    return errorResponse(e);
  }
}
