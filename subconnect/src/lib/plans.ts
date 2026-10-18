import "server-only";
import { prisma } from "./db";
import { publish } from "./events";

/** Tell anyone viewing an assignment that covers this plan's date to refresh. */
export async function notifyPlanUpdated(plan: { id: string; teacherId: string; date: Date }) {
  const assignments = await prisma.assignment.findMany({
    where: {
      teacherId: plan.teacherId,
      cancelledAt: null,
      startDate: { lte: plan.date },
      endDate: { gte: plan.date },
      accessEndsAt: { gt: new Date() },
    },
    select: { id: true },
  });
  for (const a of assignments) publish(`assignment:${a.id}`, { type: "plan-updated", planId: plan.id });
}
