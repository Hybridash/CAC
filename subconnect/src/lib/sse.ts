import type { AppEvent } from "./events";

type Event = AppEvent | { type: "access-ended" } | { type: "ready" };

/** Build a Server-Sent Events response. `setup` returns a cleanup function. */
export function sseResponse(
  req: Request,
  setup: (send: (e: Event) => void, close: () => void) => () => void,
  heartbeat?: (send: (e: Event) => void, close: () => void) => Promise<void> | void,
) {
  const enc = new TextEncoder();
  let cleanup: (() => void) | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const send = (e: Event) => {
        if (!closed) controller.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`));
      };
      const close = () => {
        if (closed) return;
        closed = true;
        if (timer) clearInterval(timer);
        cleanup?.();
        try {
          controller.close();
        } catch {}
      };
      cleanup = setup(send, close);
      send({ type: "ready" });
      timer = setInterval(async () => {
        if (closed) return;
        controller.enqueue(enc.encode(": ping\n\n"));
        await heartbeat?.(send, close);
      }, 20_000);
      req.signal.addEventListener("abort", close);
    },
    cancel() {
      closed = true;
      if (timer) clearInterval(timer);
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
