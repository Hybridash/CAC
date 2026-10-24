import type { CSSProperties } from 'react';

/** Shared pieces for the lesson figures: one palette, one arrow, one callout, one glide. */

export type Pt = [number, number];

export const INK = '#1b2a20';
export const SOFT = '#4a5b4e';
export const MARKER = '#9e2247';
export const MOSS = '#2f6b3f';
export const WATER = { fill: '#dff0fb', stroke: '#2f6fb0' };
export const AMBER = { fill: '#fdf0cf', stroke: '#d99a06', text: '#6b4300' };
export const BLUE = { fill: '#dae7f1', stroke: '#345a80', text: '#1f4a6b' };
export const PINK = { fill: '#fadde5', stroke: '#c02b57', text: '#801e3e' };
export const LEAF = { fill: '#dcead5', stroke: '#2f6b3f', text: '#1f4528' };

/** Things glide between steps with one transition; reduced motion collapses it globally. */
export const glide: CSSProperties = {
  transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease',
};

export const at = (p: Pt): CSSProperties => ({ ...glide, transform: `translate(${p[0]}px, ${p[1]}px)` });

export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = SOFT,
  w = 2.4,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  w?: number;
}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 8 + w;
  const p = (t: number): Pt => [x2 - Math.cos(a + t) * h, y2 - Math.sin(a + t) * h];
  const [ax, ay] = p(0.45);
  const [bx, by] = p(-0.45);
  return (
    <g stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <polyline points={`${ax},${ay} ${x2},${y2} ${bx},${by}`} />
    </g>
  );
}

/** The marker-pen note for the current step. */
export function Callout({
  lines,
  x = 316,
  y = 34,
  anchor = 'start',
}: {
  lines: readonly string[];
  x?: number;
  y?: number;
  anchor?: 'start' | 'end' | 'middle';
}) {
  return (
    <g fill={MARKER} fontSize={14} fontWeight={700}>
      {lines.map((line, i) => (
        <text key={line} x={x} y={y + i * 17} textAnchor={anchor}>
          {line}
        </text>
      ))}
    </g>
  );
}

/** A labelled dot: an ion, a molecule, a small particle. */
export function Particle({
  p,
  r = 12,
  tone,
  label,
  show = true,
  fontSize = 11,
}: {
  p: Pt;
  r?: number;
  tone: { fill: string; stroke: string; text?: string };
  label?: string;
  show?: boolean;
  fontSize?: number;
}) {
  return (
    <g style={{ ...at(p), opacity: show ? 1 : 0 }}>
      <circle r={r} fill={tone.fill} stroke={tone.stroke} strokeWidth={1.5} />
      {label && (
        <text textAnchor="middle" y={fontSize * 0.36} fontSize={fontSize} fontWeight={700} fill={tone.text ?? INK}>
          {label}
        </text>
      )}
    </g>
  );
}

/** A phospholipid bilayer along y, with an optional gap (for a pump or channel). */
export function Bilayer({
  y = 170,
  gaps = [],
}: {
  y?: number;
  gaps?: [number, number][];
}) {
  const xs = Array.from({ length: 30 }, (_, i) => 10 + i * 16.2).filter(
    (x) => !gaps.some(([a, b]) => x > a && x < b),
  );
  return (
    <g>
      {xs.map((x) => (
        <g key={x}>
          <line x1={x} y1={y - 24} x2={x} y2={y - 12} stroke="#8c9c98" strokeWidth={2} />
          <line x1={x} y1={y + 24} x2={x} y2={y + 12} stroke="#8c9c98" strokeWidth={2} />
          <circle cx={x} cy={y - 30} r={7} fill="#d6dfdc" stroke="#667773" strokeWidth={1.2} />
          <circle cx={x} cy={y + 30} r={7} fill="#d6dfdc" stroke="#667773" strokeWidth={1.2} />
        </g>
      ))}
    </g>
  );
}

export const FIGURE_TEXT = { fontFamily: 'Instrument Sans, sans-serif' } as const;
