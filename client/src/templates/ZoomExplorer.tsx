import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ZoomConfig } from '@bioplay/shared';
import type { TemplateProps } from './framework/types';
import { Progress, Prompt } from './framework/ui';
import { Scene } from './framework/Scene';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';

/** Look down a microscope: tap hotspots and zoom from organism → organ → tissue → cell → molecule. */
export function ZoomExplorer({
  config,
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<ZoomConfig>) {
  const { levels } = config;
  const reduce = useReducedMotion();
  const [levelId, setLevelId] = useState(levels[0].id);
  const [hotspot, setHotspot] = useState<string | null>(null);
  const [seen, setSeen] = useState<Record<string, Set<string>>>({});
  const [dir, setDir] = useState<1 | -1>(1);
  const completed = useRef(alreadyDone);
  const index = levels.findIndex((l) => l.id === levelId);
  const level = levels[index];
  const hs = level.hotspots.find((h) => h.id === hotspot);

  const done = levels.every((l) => (seen[l.id]?.size ?? 0) >= Math.min(1, l.hotspots.length));
  useEffect(() => {
    if (done && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      onComplete();
    }
  }, [done, onComplete]);

  const open = (id: string) => {
    sfx.pop();
    setHotspot(id);
    setSeen((s) => ({ ...s, [levelId]: new Set(s[levelId] ?? []).add(id) }));
  };
  const go = (id: string) => {
    const to = levels.findIndex((l) => l.id === id);
    if (to === index) return;
    sfx.whoosh();
    setDir(to > index ? 1 : -1);
    setLevelId(id);
    setHotspot(null);
    onStage?.(Math.min(3, to));
  };

  const explored = levels.filter((l) => seen[l.id]?.size).length;

  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>

      {/* Magnification stepper */}
      <nav aria-label="Zoom levels" className="flex items-stretch gap-1 overflow-x-auto pb-1">
        {levels.map((l, i) => {
          const current = l.id === levelId;
          return (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              aria-current={current ? 'step' : undefined}
              className={`flex min-w-28 flex-1 flex-col items-start rounded-2xl px-3 py-2 text-left transition ${
                current
                  ? 'bg-teal-600 text-white'
                  : seen[l.id]
                    ? 'bg-teal-50 text-teal-900 ring-2 ring-teal-200'
                    : 'bg-surface text-ink-soft ring-2 ring-black/5'
              }`}
            >
              <span className="flex items-center gap-1 text-xs font-extrabold opacity-80">
                <span
                  className="inline-block rounded-full border-2 border-current"
                  style={{ width: 6 + i * 3, height: 6 + i * 3 }}
                  aria-hidden
                />
                {l.scale}
              </span>
              <span className="text-sm leading-tight font-extrabold">{l.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* The eyepiece */}
        <div className="relative rounded-3xl bg-night p-2.5 shadow-xl">
          <div className="relative overflow-hidden rounded-[1.5rem]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={levelId}
                initial={
                  reduce
                    ? { opacity: 0 }
                    : { scale: dir > 0 ? 0.5 : 1.6, opacity: 0, filter: 'blur(10px)' }
                }
                animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1, filter: 'blur(0px)' }}
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { scale: dir > 0 ? 1.8 : 0.5, opacity: 0, filter: 'blur(10px)' }
                }
                transition={{ duration: 0.45 }}
              >
                <Scene
                  elements={level.elements}
                  background={level.background}
                  height={360}
                  label={`${level.label}: ${level.description}`}
                >
                  {level.hotspots.map((h) => {
                    const isSeen = seen[levelId]?.has(h.id);
                    const active = hotspot === h.id;
                    return (
                      <button
                        key={h.id}
                        onClick={() => open(h.id)}
                        className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold shadow-lg ring-2 transition hover:scale-110 ${
                          active
                            ? 'scale-110 bg-teal-600 text-white ring-white'
                            : isSeen
                              ? 'bg-surface text-teal-800 ring-teal-300'
                              : 'glow-pulse bg-amber-300 text-amber-950 ring-white'
                        }`}
                        style={{ left: `${h.x}%`, top: `${h.y}%` }}
                        aria-pressed={active}
                      >
                        {h.zoomTo ? (
                          <Icon name="microscope" size={16} />
                        ) : isSeen ? (
                          <Icon name="check" size={14} />
                        ) : (
                          '＋'
                        )}{' '}
                        {h.label}
                      </button>
                    );
                  })}
                </Scene>
              </motion.div>
            </AnimatePresence>
            {/* Reticle and lens vignette, like looking through an eyepiece. */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, transparent 58%, rgba(15,23,42,0.55) 100%)',
              }}
              aria-hidden
            />
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
              aria-hidden
            >
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#0f172a" strokeDasharray="4 6" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#0f172a" strokeDasharray="4 6" />
              <circle cx="50%" cy="50%" r="18%" fill="none" stroke="#0f172a" strokeWidth="1.5" />
            </svg>
            <div className="pointer-events-none absolute bottom-3 left-3 flex items-end gap-2 rounded-xl bg-night/80 px-3 py-1.5 text-white">
              <span className="mb-1 block h-1.5 w-12 rounded-full bg-surface" aria-hidden />
              <span className="font-mono text-xs font-bold">{level.scale}</span>
            </div>
          </div>
        </div>

        {/* The specimen card */}
        <div
          className="flex flex-col gap-3 rounded-3xl bg-surface p-4 ring-2 ring-teal-100"
          aria-live="polite"
        >
          <span className="chip self-start bg-teal-100 text-teal-900">
            <Icon name="microscope" size={18} /> Level {index + 1} of {levels.length} ·{' '}
            {level.scale}
          </span>
          <AnimatePresence mode="wait">
            <motion.div
              key={hs?.id ?? `level-${levelId}`}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className="flex flex-col gap-2"
            >
              {hs ? (
                <>
                  <h3 className="text-2xl font-extrabold">{hs.label}</h3>
                  <p className="text-ink-soft">{hs.text}</p>
                  {hs.zoomTo && (
                    <button className="btn-primary mt-1 self-start" onClick={() => go(hs.zoomTo!)}>
                      <Icon name="microscope" size={20} /> Zoom in to{' '}
                      {levels.find((l) => l.id === hs.zoomTo)?.label}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-extrabold">{level.label}</h3>
                  <p className="text-ink-soft">{level.description}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-amber-700">
                    <span className="glow-pulse inline-block h-3 w-3 rounded-full bg-amber-300" />
                    Tap a glowing hotspot to look closer.
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="mt-auto flex flex-col gap-2">
            <div className="flex flex-wrap gap-1.5" aria-label="Hotspots on this level">
              {level.hotspots.map((h) => (
                <span
                  key={h.id}
                  className={`chip text-xs ${seen[levelId]?.has(h.id) ? 'bg-teal-100 text-teal-900' : 'bg-slate-100 text-slate-500'}`}
                >
                  <Icon name={seen[levelId]?.has(h.id) ? 'check' : 'todo'} size={14} /> {h.label}
                </span>
              ))}
            </div>
            {index > 0 && (
              <button
                className="btn-ghost self-start text-sm"
                onClick={() => go(levels[index - 1].id)}
              >
                ← Zoom out to {levels[index - 1].label}
              </button>
            )}
          </div>
        </div>
      </div>
      <Progress value={explored} max={levels.length} label="levels explored" />
    </div>
  );
}
