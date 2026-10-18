import "server-only";
import { prisma } from "./db";

export async function unreadCounts(userId: string, assignmentIds: string[]): Promise<Record<string, number>> {
  if (assignmentIds.length === 0) return {};
  const states = await prisma.chatReadState.findMany({ where: { userId, assignmentId: { in: assignmentIds } } });
  const lastRead = new Map(states.map((s) => [s.assignmentId, s.lastReadAt]));
  const out: Record<string, number> = {};
  await Promise.all(
    assignmentIds.map(async (id) => {
      out[id] = await prisma.chatMessage.count({
        where: { assignmentId: id, senderId: { not: userId }, createdAt: { gt: lastRead.get(id) ?? new Date(0) } },
      });
    }),
  );
  return out;
}

export async function markRead(userId: string, assignmentId: string) {
  const now = new Date();
  await prisma.chatReadState.upsert({
    where: { assignmentId_userId: { assignmentId, userId } },
    create: { assignmentId, userId, lastReadAt: now },
    update: { lastReadAt: now },
  });
}

export type ChatMessageDTO = { id: string; body: string; senderId: string; senderName: string; createdAt: string };

export async function listMessages(assignmentId: string): Promise<ChatMessageDTO[]> {
  const messages = await prisma.chatMessage.findMany({
    where: { assignmentId },
    orderBy: { createdAt: "asc" },
    take: 500,
    include: { sender: { select: { name: true } } },
  });
  return messages.map((m) => ({ id: m.id, body: m.body, senderId: m.senderId, senderName: m.sender.name, createdAt: m.createdAt.toISOString() }));
}
