import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CATEGORIES,
  CONCEPT_BY_ID,
  CONCEPTS,
  DIFFICULTY_LABEL,
  isMysteryUnlocked,
  MYSTERIES,
  potentialReward,
  type ConceptProgress,
} from '@bioplay/shared';
import { computeMapLayout } from './layout';
import { usePlayer } from '../store/player';
import { AtpAmount } from '../components/Atp';
import { Stars } from '../components/ConceptBits';

const NO_PROGRESS: Record<string, ConceptProgress> = {};
type Status = 'done' | 'started' | 'new';

export function KnowledgeMapPage() {
  const progress = usePlayer((s) => s.player?.progress ?? NO_PROGRESS);
  const solved = usePlayer((s) => s.player?.mysteriesSolved);
  const navigate = useNavigate();
  const layout = useMemo(() => computeMapLayout(CONCEPTS, CATEGORIES, MYSTERIES), []);
  const [focus, setFocus] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const status = (id: string): Status =>
    progress[id]?.completedAt ? 'done' : progress[id] ? 'started' : 'new';
  const done = (id: string) => !!progress[id]?.completedAt;
  const pos = useMemo(() => new Map(layout.nodes.map((n) => [n.concept.id, n])), [layout]);
  const focused = focus ? CONCEPT_BY_ID[focus] : null;
  const related = useMemo(() => {
    if (!focus) return new Set<string>();
    const s = new Set<string>([focus]);
    for (const e of layout.edges) {
      if (e.to === focus) s.add(e.from);
      if (e.from === focus) s.add(e.to);
    }
    return s;
  }, [focus, layout.edges]);
  const totalDone = CONCEPTS.filter((c) => done(c.id)).length;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-extrabold">Knowledge Map</h1>
          <p className="text-ink-soft">
            {totalDone} of {CONCEPTS.length} concepts explored. Regions fill up as you complete
            them; lines show recommended paths.
          </p>
        </div>
        <div className="flex items-center gap-1" aria-label="Zoom">
          <button
            className="btn-ghost px-3 py-1"
            onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
            aria-label="Zoom out"
            disabled={zoom <= 1}
          >
            −
          </button>
          <span className="w-14 text-center text-sm font-bold">{Math.round(zoom * 100)}%</span>
          <button
            className="btn-ghost px-3 py-1"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="card overflow-auto p-2" style={{ maxHeight: '75vh' }}>
          <svg
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            style={{ width: `${zoom * 100}%`, minWidth: zoom * 760 }}
            role="group"
            aria-label="Knowledge map of all concepts"
          >
            <defs>
              {layout.regions.map((r) => (
                <clipPath key={r.category.id} id={`clip-${r.category.id}`}>
                  <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="36" />
                </clipPath>
              ))}
            </defs>
            {/* regions */}
            {layout.regions.map((r) => {
              const all = CONCEPTS.filter((c) => c.category === r.category.id);
              const n = all.filter((c) => done(c.id)).length;
              const frac = n / all.length;
              return (
                <g key={r.category.id}>
                  <rect
                    x={r.x}
                    y={r.y}
                    width={r.w}
                    height={r.h}
                    rx="36"
                    fill={r.category.tint}
                    stroke={r.category.color}
                    strokeWidth="3"
                    strokeOpacity=".35"
                  />
                  {/* water level fills as concepts are completed */}
                  <g clipPath={`url(#clip-${r.category.id})`}>
                    <rect
                      x={r.x}
                      y={r.y + r.h * (1 - frac)}
                      width={r.w}
                      height={r.h * frac}
                      fill={r.category.color}
                      opacity=".22"
                      style={{ transition: 'all .8s' }}
                    />
                    {frac > 0 && (
                      <path
                        d={`M ${r.x} ${r.y + r.h * (1 - frac)} q ${r.w / 4} -8 ${r.w / 2} 0 t ${r.w / 2} 0`}
                        stroke={r.category.color}
                        strokeOpacity=".4"
                        strokeWidth="3"
                        fill="none"
                      />
                    )}
                  </g>
                  <text
                    x={r.x + 18}
                    y={r.y + 30}
                    fontSize="17"
                    fontWeight="800"
                    fill={r.category.color}
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {r.category.emoji}{' '}
                    {r.category.name
                      .replace('Molecular Biology & Genetics', 'Genetics')
                      .replace('Microbiology & Disease', 'Microbes')
                      .replace('Developmental Biology', 'Development')}
                  </text>
                  <text
                    x={r.x + r.w - 16}
                    y={r.y + 30}
                    fontSize="13"
                    fontWeight="800"
                    textAnchor="end"
                    fill={r.category.color}
                  >
                    {n}/{all.length}
                  </text>
                  {frac === 1 && (
                    <text x={r.x + r.w - 16} y={r.y + r.h - 12} fontSize="20" textAnchor="end">
                      🏅
                    </text>
                  )}
                </g>
              );
            })}
            {/* prerequisite paths */}
            {layout.edges.map((e, i) => {
              const a = pos.get(e.from)!;
              const b = pos.get(e.to)!;
              const hot =
                focus &&
                related.has(e.from) &&
                related.has(e.to) &&
                (e.from === focus || e.to === focus);
              const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.15;
              const my = (a.y + b.y) / 2 - (b.x - a.x) * 0.15;
              return (
                <path
                  key={i}
                  d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
                  fill="none"
                  stroke={hot ? '#4f46e5' : done(e.from) ? '#10b981' : '#94a3b8'}
                  strokeWidth={hot ? 3 : 1.4}
                  strokeOpacity={focus ? (hot ? 0.95 : 0.08) : 0.35}
                  strokeDasharray={done(e.from) ? undefined : '4 4'}
                />
              );
            })}
            {/* mysteries */}
            {layout.mysteryNodes.map(({ mystery: m, x, y }) => {
              const unlocked = isMysteryUnlocked(m, done);
              const isSolved = solved?.includes(m.id);
              return (
                <a
                  key={m.id}
                  href={`/mysteries/${m.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/mysteries/${m.id}`);
                  }}
                  aria-label={`Bio Mystery: ${m.title}. ${isSolved ? 'Solved' : unlocked ? 'Unlocked' : 'Locked'}`}
                >
                  <rect
                    x={x - 11}
                    y={y - 11}
                    width="22"
                    height="22"
                    rx="4"
                    transform={`rotate(45 ${x} ${y})`}
                    fill={isSolved ? '#fde047' : unlocked ? '#a78bfa' : '#e2e8f0'}
                    stroke="#1e1b2e"
                    strokeWidth="2"
                  />
                  <text x={x} y={y + 5} fontSize="13" textAnchor="middle">
                    {isSolved ? '✓' : unlocked ? '🕵️' : '🔒'}
                  </text>
                </a>
              );
            })}
            {/* concept nodes */}
            {layout.nodes.map(({ concept: c, x, y }) => {
              const st = status(c.id);
              const cat = CATEGORIES.find((k) => k.id === c.category)!;
              const dim = focus && !related.has(c.id);
              return (
                <a
                  key={c.id}
                  href={`/learn/${c.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (focus === c.id) navigate(`/learn/${c.id}`);
                    else setFocus(c.id);
                  }}
                  onMouseEnter={() => setFocus(c.id)}
                  onFocus={() => setFocus(c.id)}
                  aria-label={`${c.title}, ${DIFFICULTY_LABEL[c.difficulty]}, ${st === 'done' ? 'completed' : st === 'started' ? 'in progress' : 'not started'}`}
                  style={{ opacity: dim ? 0.3 : 1 }}
                  className="cursor-pointer"
                >
                  {c.flagship && (
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="3 2"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={focus === c.id ? 14 : 11}
                    fill={st === 'done' ? cat.color : st === 'started' ? cat.tint : 'white'}
                    stroke={cat.color}
                    strokeWidth="3"
                  />
                  {st === 'started' && (
                    <path
                      d={`M ${x} ${y - 11} A 11 11 0 0 1 ${x} ${y + 11} Z`}
                      fill={cat.color}
                      opacity=".6"
                    />
                  )}
                  {st === 'done' && (
                    <text
                      x={x}
                      y={y + 4}
                      fontSize="11"
                      fontWeight="900"
                      textAnchor="middle"
                      fill="white"
                    >
                      ✓
                    </text>
                  )}
                  {c.rarity === 'obscure' && st !== 'done' && (
                    <text x={x} y={y + 4} fontSize="9" textAnchor="middle" fill={cat.color}>
                      ✦
                    </text>
                  )}
                </a>
              );
            })}
          </svg>
        </div>

        <aside className="flex flex-col gap-3 lg:sticky lg:top-20 lg:self-start" aria-live="polite">
          {focused ? (
            <div className="card p-4">
              <p className="text-xs font-extrabold text-ink-soft uppercase">
                {CATEGORIES.find((k) => k.id === focused.category)?.name}
              </p>
              <h2 className="text-2xl font-extrabold">{focused.title}</h2>
              <div className="my-1 flex items-center justify-between">
                <Stars difficulty={focused.difficulty} />
                <AtpAmount
                  amount={potentialReward(focused.difficulty, focused.rarity)}
                  prefix="up to "
                />
              </div>
              <p className="text-sm text-ink-soft">{focused.summary}</p>
              {(focused.prerequisites?.length ?? 0) > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-extrabold text-ink-soft uppercase">
                    Recommended first
                  </p>
                  <ul className="text-sm">
                    {focused.prerequisites!.map((p) => (
                      <li key={p}>
                        {done(p) ? '✅' : '⬜'}{' '}
                        <button
                          className="font-bold text-indigo-700 hover:underline"
                          onClick={() => setFocus(p)}
                        >
                          {CONCEPT_BY_ID[p]?.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Link to={`/learn/${focused.id}`} className="btn-primary mt-3 w-full">
                {status(focused.id) === 'done' ? 'Review lesson' : 'Start lesson'} →
              </Link>
            </div>
          ) : (
            <div className="card p-4 text-sm text-ink-soft">
              Hover, tap or tab to a dot to see its details and paths. Tap again to open the lesson.
            </div>
          )}
          <div className="card p-4 text-sm">
            <h3 className="mb-2 font-extrabold">Legend</h3>
            <ul className="flex flex-col gap-1.5">
              <li className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 rounded-full border-[3px] border-emerald-600 bg-emerald-600" />{' '}
                Completed
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 rounded-full border-[3px] border-emerald-600 bg-gradient-to-r from-emerald-200 to-emerald-500" />{' '}
                In progress
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 rounded-full border-[3px] border-emerald-600 bg-white" />{' '}
                Not started
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 rounded-full border-2 border-dashed border-amber-500" />{' '}
                Flagship lesson
              </li>
              <li className="flex items-center gap-2">
                <span className="text-xs">✦</span> Obscure concept (bonus ATP)
              </li>
              <li className="flex items-center gap-2">
                <span>🕵️</span> Bio Mystery (unlocks when its concepts are done)
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block w-5 border-t-2 border-dashed border-slate-400" />{' '}
                Recommended path
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
