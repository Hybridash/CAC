import { z } from "zod";
import { assertSameOrigin, errorResponse, HttpError, requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { chatPermissions } from "@/lib/access";
import { listMessages, markRead } from "@/lib/chat";
import { filterMessage } from "@/lib/profanity";
import { publish } from "@/lib/events";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

async function load(id: string) {
  const user = await requireApiUser();
  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment) throw new HttpError(404, "Not found");
  const perms = chatPermissions(user, assignment);
  if (!perms.canRead) throw new HttpError(404, "Not found");
  return { user, assignment, perms };
}

/** GET: message history (also marks the chat as read for the viewer). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user } = await load(id);
    const messages = await listMessages(id);
    if (user.role !== "ADMIN") await markRead(user.id, id);
    return Response.json({ messages });
  } catch (e) {
    return errorResponse(e);
  }
}

const bodySchema = z.object({ body: z.string().min(1).max(2000), markReadOnly: z.boolean().optional() });

/** POST: send a message. Every message passes through the profanity filter before saving or delivery. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const { id } = await params;
    const { user, assignment, perms } = await load(id);
    const json = await req.json().catch(() => null);

    if (json?.markReadOnly) {
      if (user.role !== "ADMIN") await markRead(user.id, id);
      return Response.json({ ok: true });
    }
    if (!perms.canSend) {
      throw new HttpError(403, user.role === "ADMIN" ? "Chat records are read-only for admins." : "This chat is closed. Messages can only be sent during the assignment.");
    }
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) throw new HttpError(400, "Messages must be between 1 and 2,000 characters.");
    if (!rateLimit(`chat:${user.id}`, 30, 60_000)) throw new HttpError(429, "You're sending messages quickly. Please wait a moment.");

    const result = filterMessage(parsed.data.body);
    if (result.status === "blocked") return Response.json({ error: result.notice, blocked: true }, { status: 422 });
    if (!result.text) throw new HttpError(400, "Message is empty.");

    const msg = await prisma.chatMessage.create({ data: { assignmentId: id, senderId: user.id, body: result.text } });
    await markRead(user.id, id);
    const dto = { id: msg.id, body: msg.body, senderId: user.id, senderName: user.name, createdAt: msg.createdAt.toISOString() };
    publish(`assignment:${id}`, { type: "message", message: dto });
    const recipient = user.id === assignment.teacherId ? assignment.substituteId : assignment.teacherId;
    publish(`user:${recipient}`, { type: "unread", assignmentId: id });
    return Response.json({ message: dto }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
