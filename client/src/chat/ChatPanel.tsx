import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ChatMessage, ChatResponse, ChatStatus, Concept } from '@bioplay/shared';
import { api, RequestError } from '../lib/api';
import { Icon } from '../components/Icon';

const MAX_LENGTH = 500;

/** "Ask Bio Bot": an AI tutor for the current lesson, in a floating panel. */
export function ChatPanel({ concept }: { concept: Concept }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ChatStatus | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: 'bot',
      text: `Hi! I’m Bio Bot. Ask me anything about **${concept.title}**, and I’ll help you make sense of it.`,
    },
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    api<ChatStatus>('/chat/status')
      .then(setStatus)
      .catch((e: Error) => setError(chatError(e)));
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const disabled = status?.enabled === false;
  const outOfQuestions = status?.remaining === 0;

  const send = async (text: string) => {
    const question = text.trim().slice(0, MAX_LENGTH);
    if (!question || busy || disabled || outOfQuestions) return;
    const next: ChatMessage[] = [...messages, { role: 'user', text: question }];
    setMessages(next);
    setDraft('');
    setBusy(true);
    setError(null);
    try {
      const res = await api<ChatResponse>('/chat', {
        body: { lessonId: concept.id, messages: next },
      });
      setMessages([...next, { role: 'bot', text: res.reply }]);
      setStatus((s) => (s ? { ...s, remaining: res.remaining } : s));
    } catch (e) {
      setError(chatError(e as Error));
      if (e instanceof RequestError && e.status === 429)
        setStatus((s) => (s ? { ...s, remaining: 0 } : s));
      // Put the question back so it can be retried.
      setMessages(messages);
      setDraft(question);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const suggestions = [
    `Explain “${concept.steps[0].title}” another way`,
    'Give me a real-world example',
    'What do students often get wrong here?',
  ];

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 font-extrabold text-white shadow-lg shadow-indigo-900/30 hover:bg-indigo-700 lg:bottom-6"
            data-testid="open-chat"
          >
            <Icon name="chat" size={24} /> Ask Bio Bot
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Ask Bio Bot"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed inset-x-2 top-[calc(4.5rem+env(safe-area-inset-top))] bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10 sm:inset-x-auto sm:right-4 sm:w-[380px] lg:top-auto lg:bottom-6 lg:h-[min(600px,calc(100dvh-7rem))]"
            data-testid="chat-panel"
          >
            <header className="flex items-center gap-3 bg-indigo-600 px-4 py-3 text-white">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20">
                <Icon name="chat" size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-extrabold leading-tight">Bio Bot</h2>
                <p className="truncate text-xs text-indigo-100">AI tutor · {concept.title}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full px-2 py-1 text-xl leading-none hover:bg-white/20"
                aria-label="Close Bio Bot"
              >
                ×
              </button>
            </header>

            <div
              ref={listRef}
              className="flex flex-1 flex-col gap-3 overflow-y-auto p-3"
              aria-live="polite"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.role === 'user' ? 'self-end rounded-br-md bg-indigo-600 text-white' : 'self-start rounded-bl-md bg-slate-100 text-ink'}`}
                  data-testid={m.role === 'bot' ? 'bot-message' : 'user-message'}
                >
                  {m.role === 'bot' ? <RichText text={m.text} /> : m.text}
                </div>
              ))}
              {busy && (
                <div
                  className="flex gap-1 self-start rounded-2xl rounded-bl-md bg-slate-100 px-3 py-3"
                  aria-label="Bio Bot is typing"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-2 w-2 rounded-full bg-slate-400"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              )}
              {messages.length === 1 && !disabled && (
                <div className="flex flex-col items-start gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => void send(s)}
                      disabled={busy || outOfQuestions}
                      className="rounded-full bg-white px-3 py-1.5 text-left text-sm font-bold text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-50 disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {(error || disabled) && (
              <p
                role="alert"
                className="mx-3 mb-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900"
              >
                {disabled ? 'Bio Bot isn’t available on this server right now.' : error}
              </p>
            )}

            <form
              className="flex items-end gap-2 border-t border-black/5 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                void send(draft);
              }}
            >
              <label className="sr-only" htmlFor="chat-input">
                Your question
              </label>
              <textarea
                id="chat-input"
                ref={inputRef}
                rows={1}
                value={draft}
                maxLength={MAX_LENGTH}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void send(draft);
                  }
                }}
                placeholder={outOfQuestions ? 'No questions left today' : 'Ask a question…'}
                disabled={disabled || outOfQuestions}
                className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl bg-slate-50 px-3 py-2.5 text-sm ring-1 ring-black/10 focus:ring-2 focus:ring-indigo-400 focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!draft.trim() || busy || disabled || outOfQuestions}
                className="btn-primary h-11 px-4"
              >
                Send
              </button>
            </form>
            <p className="px-3 pb-2 text-center text-[11px] text-ink-soft">
              Bio Bot is an AI and can make mistakes.
              {status?.enabled && ` ${status.remaining} of ${status.limit} questions left today.`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** A friendly explanation of why a chat request failed. */
function chatError(e: Error): string {
  if (e instanceof RequestError && e.offline)
    return 'You’re offline. Bio Bot needs an internet connection.';
  // The chat routes are missing: the server predates Bio Bot and needs restarting.
  if (e instanceof RequestError && e.status === 404)
    return 'Bio Bot can’t be reached: the Bio Bites server is out of date. Restart the server, then try again.';
  return e.message;
}

/** Minimal, safe formatting for replies: paragraphs, "- " bullet lists and **bold**. */
function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/);
  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split('\n').filter((l) => l.trim());
        const bullet = /^\s*(?:[-*•]|\d+[.)])\s+/;
        if (lines.length && lines.every((l) => bullet.test(l)))
          return (
            <ul key={i} className="my-1 list-disc pl-5">
              {lines.map((l, j) => (
                <li key={j}>{bold(l.replace(bullet, ''))}</li>
              ))}
            </ul>
          );
        return (
          <p key={i} className={i ? 'mt-2' : ''}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {bold(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

function bold(line: string): ReactNode[] {
  return line
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        part
      ),
    );
}
