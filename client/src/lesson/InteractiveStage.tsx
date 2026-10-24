import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CATEGORY_BY_ID, type Concept } from '@bioplay/shared';
import { Icon } from '../components/Icon';
import { TEMPLATE_ICON, TEMPLATE_LABEL } from '../templates/registry';
import { StageContext } from '../templates/framework/stage';
import { Confetti } from '../templates/framework/ui';
import { sfx } from '../lib/sound';

type FsElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
type FsDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

const fsElement = () =>
  document.fullscreenElement ?? (document as FsDocument).webkitFullscreenElement ?? null;

/**
 * The frame around every lesson's interaction. It can fill the screen: with the Fullscreen API
 * where the browser allows it, otherwise (iPhone, some webviews) as a full-window overlay.
 * Children stay mounted in the same place in the tree, so going full screen never resets a game.
 */
export function InteractiveStage({
  concept,
  guide,
  done,
  onQuiz,
  children,
}: {
  concept: Concept;
  /** The step-by-step explanation, shown beside the interaction in full screen. */
  guide: ReactNode;
  done: boolean;
  onQuiz: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [native, setNative] = useState(false);
  const [pseudo, setPseudo] = useState(false);
  const [guideOpen, setGuideOpen] = useState(true);
  const [celebrate, setCelebrate] = useState(0);
  const immersive = native || pseudo;
  const cat = CATEGORY_BY_ID[concept.category];
  const template = concept.interaction.template;
  const wasDone = useRef(done);

  useEffect(() => {
    const sync = () => setNative(!!ref.current && fsElement() === ref.current);
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync);
    };
  }, []);

  const enter = useCallback(async () => {
    const el = ref.current as FsElement | null;
    if (!el) return;
    sfx.whoosh();
    // On a phone the interaction needs every pixel; the guide is one tap away.
    setGuideOpen(window.matchMedia('(min-width: 1024px)').matches);
    try {
      if (el.requestFullscreen && document.fullscreenEnabled) {
        await el.requestFullscreen({ navigationUI: 'hide' });
        return;
      }
      if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
        // Older Safari resolves without throwing even when it refuses; check it actually worked.
        if (fsElement() === el) return;
      }
    } catch {
      // Fall through to the overlay.
    }
    setPseudo(true);
  }, []);

  const exit = useCallback(async () => {
    setPseudo(false);
    const d = document as FsDocument;
    if (fsElement()) {
      try {
        await (document.exitFullscreen ? document.exitFullscreen() : d.webkitExitFullscreen?.());
      } catch {
        // Already left full screen.
      }
    }
  }, []);

  // The overlay fallback: lock page scroll and let Escape close it (native full screen does both itself).
  useEffect(() => {
    if (!pseudo) return;
    document.documentElement.classList.add('stage-locked');
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPseudo(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.classList.remove('stage-locked');
      window.removeEventListener('keydown', onKey);
    };
  }, [pseudo]);

  // "F" toggles full screen, unless the player is typing somewhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'f' && e.key !== 'F') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) {
        if (!(t instanceof HTMLInputElement && t.type === 'range')) return;
      }
      e.preventDefault();
      void (immersive ? exit() : enter());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [immersive, enter, exit]);

  // Leaving the lesson (or unmounting) must never leave the page stuck in full screen.
  useEffect(() => {
    const el = ref.current;
    return () => {
      if (el && fsElement() === el) void document.exitFullscreen?.();
    };
  }, []);

  useEffect(() => {
    if (done && !wasDone.current) setCelebrate(Date.now());
    wasDone.current = done;
  }, [done]);
  useEffect(() => {
    if (!celebrate) return;
    const t = setTimeout(() => setCelebrate(0), 4200);
    return () => clearTimeout(t);
  }, [celebrate]);

  const stage = useMemo(() => ({ immersive }), [immersive]);
  const label = TEMPLATE_LABEL[template];
  const icon = TEMPLATE_ICON[template];

  return (
    <section
      ref={ref}
      aria-label="Interactive"
      className={
        immersive
          ? 'fixed inset-0 z-[150] flex flex-col overflow-hidden text-white'
          : 'relative min-w-0'
      }
      style={
        immersive
          ? {
              background: 'var(--color-night)',
            }
          : undefined
      }
    >
      {immersive && <Backdrop emoji={cat.emoji} />}

      <header
        className={`relative z-10 flex items-center gap-3 ${
          immersive
            ? 'px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 sm:px-5'
            : 'border-b border-line pb-3'
        }`}
      >
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl shadow-sm ${immersive ? 'bg-white/15 ring-1 ring-white/25' : 'bg-surface ring-1 ring-black/10'}`}
        >
          <Icon name={icon} size={26} />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p
            className={`truncate font-display font-extrabold ${immersive ? 'text-xl sm:text-2xl' : 'text-lg'}`}
          >
            {immersive ? concept.title : 'Interactive lab'}
          </p>
          <p
            className={`text-xs font-semibold ${immersive ? 'text-white/70' : 'text-ink-soft'}`}
          >
            {label}
            {done && (
              <span className={immersive ? 'text-emerald-300' : 'text-emerald-700'}>
                {' '}
                (complete)
              </span>
            )}
          </p>
        </div>
        {immersive && (
          <button
            type="button"
            onClick={() => setGuideOpen((g) => !g)}
            aria-pressed={guideOpen}
            className="btn bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/25 hover:bg-white/20"
          >
            <Icon name="book" size={20} />
            <span className="hidden sm:inline">{guideOpen ? 'Hide guide' : 'Show guide'}</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => void (immersive ? exit() : enter())}
          className={
            immersive
              ? 'btn bg-surface px-3 py-2 text-sm text-ink shadow-lg hover:bg-slate-100'
              : 'btn bg-night px-3 py-2 text-sm text-white hover:bg-brand-hover'
          }
          aria-keyshortcuts="F"
          data-testid="stage-fullscreen"
        >
          <FullscreenGlyph exit={immersive} />
          <span className={immersive ? 'hidden sm:inline' : ''}>
            {immersive ? 'Exit full screen' : 'Full screen'}
          </span>
        </button>
      </header>

      <div
        className={
          immersive
            ? 'relative z-10 flex min-h-0 flex-1 flex-col gap-3 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 lg:flex-row lg:gap-5'
            : 'relative'
        }
      >
        {immersive && guideOpen && (
          <aside
            aria-label="Guide"
            className="max-h-[38vh] shrink-0 overflow-y-auto rounded-3xl text-ink lg:max-h-none lg:w-80 lg:self-stretch"
          >
            {guide}
          </aside>
        )}
        <div
          data-theme="light"
          className={
            immersive
              ? 'mx-auto min-h-0 w-full max-w-7xl flex-1 overflow-y-auto rounded-3xl bg-paper p-4 text-ink shadow-2xl ring-4 ring-white/15 sm:p-6'
              : 'bg-paper pt-4 dark:rounded-xl dark:sm:p-4'
          }
        >
          <StageContext.Provider value={stage}>{children}</StageContext.Provider>
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-300"
                data-testid="interaction-complete"
              >
                <span className="flex items-center gap-2 font-bold text-emerald-900">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-200">
                    <Icon name="trophy" size={26} />
                  </span>
                  Interaction complete! Keep playing, or test yourself.
                </span>
                <button
                  className="btn-primary"
                  onClick={async () => {
                    if (!immersive) return onQuiz();
                    await exit();
                    // Let the page unlock and settle back into place before scrolling it.
                    setTimeout(onQuiz, 150);
                  }}
                >
                  Take the quiz ↓
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Confetti key={celebrate} run={!!celebrate} />
      <AnimatePresence>
        {!!celebrate && (
          <motion.div
            key="cheer"
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="pointer-events-none absolute inset-x-0 top-20 z-40 flex justify-center px-4"
            aria-hidden
          >
            <div className="flex items-center gap-3 rounded-xl bg-amber-300 px-6 py-3 font-display text-2xl font-extrabold text-amber-950 shadow-lg ring-2 ring-white">
              <Icon name="star" size={34} /> Lab complete!
              <Icon name="star" size={34} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function FullscreenGlyph({ exit }: { exit: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {exit ? (
        <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" />
      ) : (
        <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />
      )}
    </svg>
  );
}

/** Slowly drifting cells, bubbles and molecules behind the full-screen stage. */
function Backdrop({ emoji }: { emoji: string }) {
  const blobs = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: (i * 61) % 100,
        top: (i * 37) % 100,
        size: 60 + ((i * 47) % 160),
        dur: 18 + ((i * 7) % 16),
        dx: ((i % 2 ? 1 : -1) * (30 + ((i * 13) % 60))) | 0,
        dy: ((i % 3 ? -1 : 1) * (30 + ((i * 17) % 70))) | 0,
        hue: [160, 200, 270, 320, 45][i % 5],
      })),
    [],
  );
  const bubbles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        left: (i * 29 + 7) % 100,
        size: 6 + ((i * 5) % 16),
        dur: 10 + ((i * 3) % 12),
        delay: -((i * 1.7) % 14),
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {blobs.map((b, i) => (
        <span
          key={i}
          className="drift absolute rounded-[45%_55%_60%_40%/50%_40%_60%_50%]"
          style={
            {
              left: `${b.left}%`,
              top: `${b.top}%`,
              width: b.size,
              height: b.size * 0.85,
              background: `radial-gradient(circle at 35% 35%, hsla(${b.hue},90%,75%,0.35), hsla(${b.hue},80%,55%,0.08) 60%, transparent 70%)`,
              border: `2px solid hsla(${b.hue},90%,80%,0.18)`,
              '--dur': `${b.dur}s`,
              '--dx': `${b.dx}px`,
              '--dy': `${b.dy}px`,
            } as React.CSSProperties
          }
        >
          {/* A nucleus, so the blobs read as cells. */}
          <span
            className="absolute top-[38%] left-[40%] h-1/4 w-1/4 rounded-full"
            style={{ background: `hsla(${b.hue},80%,80%,0.25)` }}
          />
        </span>
      ))}
      {bubbles.map((b, i) => (
        <span
          key={`b${i}`}
          className="rise absolute bottom-[-40px] rounded-full border border-white/40 bg-white/10"
          style={
            {
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              '--dur': `${b.dur}s`,
              animationDelay: `${b.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
      <span className="drift absolute right-[6%] bottom-[8%] text-9xl opacity-[0.07]">
        {emoji}
      </span>
    </div>
  );
}
