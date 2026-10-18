"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChatMessageDTO } from "@/lib/chat";
import { ChatIllustration } from "./illustrations";
import { Icon } from "./icons";
import { Alert, cx } from "./ui";

type Props = {
  assignmentId: string;
  currentUserId: string;
  initialMessages: ChatMessageDTO[];
  canSend: boolean;
  closedNotice?: string;
  timezone: string;
  /** Admin views are read-only and labeled by sender name on both sides. */
  observer?: boolean;
};

function dayLabel(iso: string, timezone: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: timezone }).format(new Date(iso));
}
function timeLabel(iso: string, timezone: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: timezone }).format(new Date(iso));
}

export function ChatPanel({ assignmentId, currentUserId, initialMessages, canSend, closedNotice, timezone, observer }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => setMessages(initialMessages), [initialMessages]);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    if (!observer) {
      fetch(`/api/assignments/${assignmentId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markReadOnly: true }),
      }).catch(() => {});
    }
    const es = new EventSource(`/api/assignments/${assignmentId}/stream`);
    es.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.type === "message") {
        setMessages((prev) => (prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]));
        if (!observer && data.message.senderId !== currentUserId && document.visibilityState === "visible") {
          fetch(`/api/assignments/${assignmentId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ markReadOnly: true }),
          }).catch(() => {});
        }
      } else if (data.type === "access-ended") {
        es.close();
        router.refresh();
      }
    };
    return () => es.close();
  }, [assignmentId, currentUserId, observer, router]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Your message couldn't be sent.");
        if (res.status === 403) router.refresh();
        return;
      }
      setDraft("");
      setMessages((prev) => (prev.some((m) => m.id === json.message.id) ? prev : [...prev, json.message]));
    } catch {
      setError("You appear to be offline. Please try again.");
    } finally {
      setSending(false);
    }
  }

  let lastDay = "";
  return (
    <div className="flex flex-col">
      <div
        ref={listRef}
        className="flex max-h-[60vh] min-h-64 flex-col gap-2 overflow-y-auto rounded-xl border border-line bg-canvas p-3"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        tabIndex={0}
      >
        {messages.length === 0 && (
          <div className="m-auto w-full max-w-xs py-6 text-center">
            <div className="mx-auto w-28">
              <ChatIllustration title="Two chat bubbles" />
            </div>
            <p className="mt-2 text-muted">No messages yet.</p>
          </div>
        )}
        {messages.map((m) => {
          const mine = !observer && m.senderId === currentUserId;
          const day = dayLabel(m.createdAt, timezone);
          const showDay = day !== lastDay;
          lastDay = day;
          return (
            <div key={m.id} className="flex flex-col">
              {showDay && <p className="my-2 text-center text-sm font-medium text-muted">{day}</p>}
              <div className={cx("max-w-[85%] rounded-2xl px-4 py-2.5", mine ? "self-end rounded-br-md bg-primary text-white" : "self-start rounded-bl-md border border-line bg-surface")}>
                {!mine && <p className="text-sm font-semibold text-primary-strong">{m.senderName}</p>}
                <p className="break-words whitespace-pre-wrap">{m.body}</p>
                <p className={cx("mt-0.5 text-right text-xs", mine ? "text-white/85" : "text-muted")}>
                  <time dateTime={m.createdAt}>{timeLabel(m.createdAt, timezone)}</time>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-3">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {canSend ? (
        <form onSubmit={send} className="mt-3 flex items-end gap-2">
          <label htmlFor={`chat-${assignmentId}`} className="sr-only">Message</label>
          <textarea
            id={`chat-${assignmentId}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            maxLength={2000}
            rows={2}
            placeholder="Write a message"
            className="min-h-12 flex-1 resize-none rounded-xl border border-line bg-surface px-3 py-2.5 text-[16px] focus:border-primary"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-xl bg-accent px-4 font-semibold text-white hover:bg-accent-strong disabled:opacity-60"
          >
            <Icon name="send" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      ) : (
        closedNotice && <p className="mt-3 rounded-lg bg-primary-soft px-4 py-3 text-primary-strong">{closedNotice}</p>
      )}
    </div>
  );
}
