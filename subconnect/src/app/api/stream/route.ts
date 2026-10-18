import { getCurrentUser } from "@/lib/auth";
import { subscribe } from "@/lib/events";
import { sseResponse } from "@/lib/sse";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** User-level live events: notifications, unread chat counts, assignment changes. */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  return sseResponse(req, (send) => subscribe(`user:${user.id}`, send));
}
