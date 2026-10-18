"use server";

import { requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function markAllNotificationsRead() {
  const user = await requireApiUser();
  await prisma.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
}
