import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { chatPermissions, isActive } from "@/lib/access";
import { subscribe } from "@/lib/events";
import { sseResponse } from "@/lib/sse";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Live events for one assignment (chat messages, plan updates).
 * Access is re-checked on every heartbeat, so a substitute is disconnected automatically
 * when the assignment ends or is cancelled.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment) return new Response("Not found", { status: 404 });

  const allowed = () => {
    const perms = chatPermissions(user, assignment);
    // Teachers also get plan-update events while the assignment is upcoming.
    return perms.canRead || (user.role === "SUBSTITUTE" && user.id === assignment.substituteId && isActive(assignment));
  };
  if (!allowed()) return new Response("Not found", { status: 404 });

  return sseResponse(
    req,
    (send) => subscribe(`assignment:${id}`, send),
    async (send, close) => {
      const fresh = await prisma.assignment.findUnique({ where: { id } });
      if (!fresh) return close();
      Object.assign(assignment, fresh);
      if (!allowed()) {
        send({ type: "access-ended" });
        close();
      }
    },
  );
}
