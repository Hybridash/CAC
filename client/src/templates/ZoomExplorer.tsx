import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ZoomConfig } from '@bioplay/shared';
import type { TemplateProps } from './framework/types';
import { Prompt } from './framework/ui';
import { Scene } from './framework/Scene';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';

/** Click hotspots and zoom from organism → organ → tissue → cell → molecule. */
export function ZoomExplorer({
  config,
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<ZoomConfig>) {
  const { levels } = config;
  const [levelId, setLevelId] = useState(levels[0].id);
  const [hotspot, setHotspot] = useState<string | null>(null);
  const [seen, setSeen] = useState<Record<string, Set<string>>>({});
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
    sfx.whoosh();
    setLevelId(id);
    setHotspot(null);
    onStage?.(
      Math.min(
        3,
        levels.findIndex((l) => l.id === id),
      ),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>
      <nav aria-label="Zoom levels" className="flex flex-wrap items-center gap-1 text-sm">
        {levels.map((l, i) => (
          <span key={l.id} className="flex items-center gap-1">
            <button
              onClick={() => go(l.id)}
              aria-current={l.id === levelId ? 'step' : undefined}
              className={`chip py-1 ${l.id === levelId ? 'bg-teal-600 text-white' : seen[l.id] ? 'bg-teal-100 text-teal-900' : 'bg-slate-100 text-ink-soft'}`}
            >
              {l.label} <span className="font-normal opacity-80">· {l.scale}</span>
            </button>
            {i < levels.length - 1 && (
              <span aria-hidden className="text-slate-400">
                ›
              </span>
            )}
          </span>
        ))}
      </nav>
      <AnimatePresence mode="wait">
        <motion.div
          key={levelId}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Scene
            elements={level.elements}
            background={level.background}
            height={340}
            label={`${level.label}: ${level.description}`}
          >
            {level.hotspots.map((h) => {
              const isSeen = seen[levelId]?.has(h.id);
              return (
                <button
                  key={h.id}
                  onClick={() => open(h.id)}
                  className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full px-2 py-1 text-xs font-extrabold shadow-lg ring-2 transition hover:scale-110 ${
                    hotspot === h.id
                      ? 'bg-teal-600 text-white ring-white'
                      : isSeen
                        ? 'bg-white text-teal-800 ring-teal-300'
                        : 'animate-pulse bg-amber-300 text-amber-950 ring-white'
                  }`}
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  aria-pressed={hotspot === h.id}
                >
                  {h.zoomTo ? <Icon name="mystery" size={16} /> : '＋'} {h.label}
                </button>
              );
            })}
          </Scene>
        </motion.div>
      </AnimatePresence>
      <div className="rounded-2xl bg-white p-4 ring-1 ring-black/10" aria-live="polite">
        {hs ? (
          <>
            <h3 className="text-lg font-extrabold">{hs.label}</h3>
            <p className="text-ink-soft">{hs.text}</p>
            {hs.zoomTo && (
              <button className="btn-primary mt-2" onClick={() => go(hs.zoomTo!)}>
                <Icon name="mystery" size={18} /> Zoom in to{' '}
                {levels.find((l) => l.id === hs.zoomTo)?.label}
              </button>
            )}
          </>
        ) : (
          <>
            <h3 className="text-lg font-extrabold">{level.label}</h3>
            <p className="text-ink-soft">{level.description}</p>
            <p className="mt-1 text-sm font-bold text-amber-700">
              Tap a glowing hotspot to look closer.
            </p>
          </>
        )}
      </div>
      {index > 0 && (
        <button className="btn-ghost self-start text-sm" onClick={() => go(levels[index - 1].id)}>
          ← Zoom out to {levels[index - 1].label}
        </button>
      )}
      <p className="text-sm font-bold text-ink-soft">
        Levels explored: {levels.filter((l) => seen[l.id]?.size).length} / {levels.length}
      </p>
    </div>
  );
}
