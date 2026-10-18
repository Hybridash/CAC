import { EventEmitter } from "node:events";

/**
 * In-process pub/sub used by the Server-Sent Events endpoints.
 * Channels: `assignment:<id>` (chat messages, plan updates) and `user:<id>` (notifications, unread counts).
 * For multiple server instances, back this with Postgres LISTEN/NOTIFY or Redis pub/sub.
 */
export type AppEvent =
  | { type: "message"; message: { id: string; body: string; senderId: string; senderName: string; createdAt: string } }
  | { type: "plan-updated"; planId: string }
  | { type: "notification" }
  | { type: "unread"; assignmentId: string }
  | { type: "assignment-changed" };

const g = globalThis as unknown as { __bus?: EventEmitter };
const bus = (g.__bus ??= (() => {
  const e = new EventEmitter();
  e.setMaxListeners(0);
  return e;
})());

export function publish(channel: string, event: AppEvent) {
  bus.emit(channel, event);
}

export function subscribe(channel: string, fn: (e: AppEvent) => void) {
  bus.on(channel, fn);
  return () => bus.off(channel, fn);
}
