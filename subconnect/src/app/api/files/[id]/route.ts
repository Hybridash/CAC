import { assertSameOrigin, errorResponse, HttpError, requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { audit, canEditPlan, loadAttachmentForViewer } from "@/lib/access";
import { storage } from "@/lib/storage";
import { isInlineViewable } from "@/lib/uploads";
import { notifyPlanUpdated } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Access-controlled file delivery. There are no public URLs: every request is checked against
 * the plan's permissions (owning teacher, or substitute with an active assignment covering the plan date).
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireApiUser("TEACHER", "SUBSTITUTE");
    const file = await loadAttachmentForViewer(user, id);
    if (!file) throw new HttpError(404, "Not found");

    const download = new URL(req.url).searchParams.get("download") === "1" || !isInlineViewable(file.mimeType);
    const bytes = await storage().get(file.storageKey);
    if (user.role === "SUBSTITUTE") await audit(user.id, download ? "download" : "view", "file", file.id);

    const encoded = encodeURIComponent(file.originalName);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": String(bytes.length),
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${file.originalName.replace(/"/g, "")}"; filename*=UTF-8''${encoded}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const { id } = await params;
    const user = await requireApiUser("TEACHER");
    const file = await prisma.fileAttachment.findUnique({ where: { id }, include: { plan: true } });
    if (!file || !canEditPlan(user, file.plan)) throw new HttpError(404, "Not found");
    await prisma.fileAttachment.delete({ where: { id } });
    await storage().delete(file.storageKey).catch((e) => console.error("Storage delete failed", e));
    await notifyPlanUpdated(file.plan);
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
