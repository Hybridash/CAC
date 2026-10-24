import { useId, useState } from 'react';
import type { Diagram, DiagramShape } from '@bioplay/shared';

const HIGHLIGHT = '#f59e0b';

/**
 * A labeled scientific diagram. Numbered markers sit on each part; tapping a marker or its
 * legend entry highlights that part's shapes and shows its description.
 */
export function DiagramView({ diagram }: { diagram: Diagram }) {
  const uid = useId().replace(/:/g, '');
  const [selected, setSelected] = useState<string | null>(null);
  const part = diagram.parts.find((p) => p.id === selected) ?? null;
  const toggle = (id: string) => setSelected((s) => (s === id ? null : id));

  return (
    <figure className="mx-auto flex w-full max-w-3xl flex-col gap-3" data-testid="hs-diagram">
      <div>
        <h3 className="text-xl font-extrabold">{diagram.title}</h3>
        <p className="text-ink-soft">{diagram.caption}</p>
      </div>
      <div data-theme="light" className="pebble overflow-hidden bg-surface ring-1 ring-black/10">
        <svg
          viewBox={`0 0 ${diagram.width} ${diagram.height}`}
          className="block h-auto w-full select-none"
          role="img"
          aria-label={`${diagram.title}. ${diagram.caption}`}
          style={{ fontFamily: 'inherit' }}
        >
          {diagram.shapes.map((s, i) => (
            <Shape key={i} s={s} selected={selected} />
          ))}
          {diagram.parts.map((p, i) => {
            const on = p.id === selected;
            return (
              <g
                key={p.id}
                transform={`translate(${p.at[0]} ${p.at[1]})`}
                onClick={() => toggle(p.id)}
                className="cursor-pointer"
                aria-hidden
              >
                <circle
                  r={on ? 10 : 8.5}
                  fill={on ? HIGHLIGHT : '#1e1b4b'}
                  stroke="#fff"
                  strokeWidth={2}
                />
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  fontSize={on ? 11 : 10}
                  fontWeight={800}
                  fill="#fff"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <ol className="grid gap-1.5 sm:grid-cols-2">
        {diagram.parts.map((p, i) => {
          const on = p.id === selected;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => toggle(p.id)}
                aria-pressed={on}
                aria-controls={`${uid}-desc`}
                className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-sm font-bold transition ${on ? 'bg-amber-100 text-amber-950 ring-2 ring-amber-400' : 'bg-slate-50 hover:bg-slate-100'}`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-extrabold text-white ${on ? 'bg-amber-500' : 'bg-indigo-950'}`}
                >
                  {i + 1}
                </span>
                {p.label}
              </button>
            </li>
          );
        })}
      </ol>
      <div
        id={`${uid}-desc`}
        aria-live="polite"
        className="min-h-16 rounded-2xl bg-amber-50 p-3 text-ink ring-1 ring-amber-200"
      >
        {part ? (
          <p>
            <span className="font-extrabold">{part.label}: </span>
            {part.description}
          </p>
        ) : (
          <p className="text-ink-soft">Tap a number to learn what that part does.</p>
        )}
      </div>
    </figure>
  );
}

function Shape({ s, selected }: { s: DiagramShape; selected: string | null }) {
  const lit = !!s.part && s.part === selected;
  const dim = !!selected && !!s.part && s.part !== selected;
  const common = {
    fill: s.fill ?? 'none',
    stroke: lit ? HIGHLIGHT : s.stroke,
    strokeWidth: lit
      ? Math.max(3, (s.strokeWidth ?? 1.5) + 1.5)
      : (s.strokeWidth ?? (s.stroke ? 1.5 : 0)),
    strokeDasharray: s.dash ? '5 4' : undefined,
    opacity: (s.opacity ?? 1) * (dim ? 0.3 : 1),
    style: { transition: 'opacity .2s, stroke .2s' },
  };
  switch (s.kind) {
    case 'rect':
      return <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.r ?? 0} {...common} />;
    case 'circle':
      return <circle cx={s.cx} cy={s.cy} r={s.r} {...common} />;
    case 'ellipse':
      return <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} {...common} />;
    case 'path':
      return <path d={s.d} strokeLinecap="round" strokeLinejoin="round" {...common} />;
    case 'arrow': {
      const [x1, y1] = s.from;
      const [x2, y2] = s.to;
      const bend = s.bend ?? 0;
      // Control point: the midpoint pushed sideways by `bend`.
      const len = Math.hypot(x2 - x1, y2 - y1) || 1;
      const cx = (x1 + x2) / 2 + (-(y2 - y1) / len) * bend;
      const cy = (y1 + y2) / 2 + ((x2 - x1) / len) * bend;
      // Arrowhead: a triangle along the curve's direction at its end, in the arrow's own color.
      const stroke = common.stroke ?? '#334155';
      const a = Math.atan2(y2 - cy, x2 - cx);
      const size = 5 + common.strokeWidth;
      const pt = (ang: number) => `${x2 - size * Math.cos(ang)},${y2 - size * Math.sin(ang)}`;
      return (
        <g opacity={common.opacity} style={common.style}>
          <path
            d={`M${x1} ${y1}Q${cx} ${cy} ${x2 - (size / 2) * Math.cos(a)} ${y2 - (size / 2) * Math.sin(a)}`}
            fill="none"
            stroke={stroke}
            strokeWidth={common.strokeWidth}
            strokeDasharray={common.strokeDasharray}
            strokeLinecap="round"
          />
          <polygon points={`${x2},${y2} ${pt(a - 0.45)} ${pt(a + 0.45)}`} fill={stroke} />
        </g>
      );
    }
    case 'text':
      return (
        <text
          x={s.x}
          y={s.y}
          textAnchor={s.anchor ?? 'middle'}
          fontSize={s.size ?? 11}
          fontWeight={s.bold ? 800 : 600}
          fill={lit ? '#92400e' : (s.fill ?? '#1e293b')}
          opacity={common.opacity}
          style={common.style}
        >
          {s.text}
        </text>
      );
  }
}
