import { AMBER, BLUE, Callout, FIGURE_TEXT, INK, LEAF, PINK, SOFT, at, type Pt } from './kit';

/** Protein folding: one chain of beads, four levels of structure. */

const N = 18;

const CALLOUT = [
  ['A chain of', 'amino acids'],
  ['Parts coil into', 'helices and fold', 'into sheets'],
  ['The whole chain', 'folds into one', '3D shape'],
  ['Some proteins join', 'several chains'],
] as const;

export const FOLDING_ALT = [
  'Eighteen beads in a straight line, a chain of amino acids.',
  'The chain has begun to coil: the first half spirals like a helix, the second half zigzags like a pleated sheet.',
  'The whole chain has curled up into one compact, folded shape.',
  'Four folded chains sit together to form one larger protein, like hemoglobin.',
] as const;

function layout(): Pt[][] {
  const line: Pt[] = Array.from({ length: N }, (_, i) => [34 + i * 25, 190]);
  const second: Pt[] = Array.from({ length: N }, (_, i) =>
    i < 9
      ? [60 + i * 17, 150 + Math.sin(i * 1.5) * 26]
      : [214 + (i - 9) * 25, i % 2 ? 236 : 200],
  );
  const fold: Pt[] = Array.from({ length: N }, (_, i) => {
    const a = i * 0.72;
    const r = 78 - i * 3.6;
    return [240 + Math.cos(a) * r, 190 + Math.sin(a) * r * 0.85];
  });
  const quad: Pt[] = fold.map(([x, y]) => [240 + (x - 240) * 0.34, 190 + (y - 190) * 0.34]);
  return [line, second, fold, quad];
}
const POS = layout();
const HUB: Pt[] = [[132, 130], [348, 130], [132, 250], [348, 250]];

export function FoldingFigure({ step }: { step: number }) {
  const s = Math.max(0, Math.min(3, step)) as 0 | 1 | 2 | 3;
  const quat = s === 3;
  return (
    <svg viewBox="0 0 480 340" role="img" aria-label={FOLDING_ALT[s]} className="block h-auto w-full" {...FIGURE_TEXT}>
      <g aria-hidden>
        {/* The chain itself: the first copy of the beads, plus the backbone drawn through them. */}
        <polyline
          points={POS[quat ? 2 : s].map((p) => p.join(',')).join(' ')}
          fill="none"
          stroke={SOFT}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={quat ? 0 : 0.55}
          style={{ transition: 'opacity 0.4s ease' }}
        />
        {POS[0].map((_, i) => {
          const p = POS[quat ? 2 : s][i];
          const tone = i < 9 ? PINK : BLUE;
          return (
            <g key={i} style={{ ...at(p), opacity: quat ? 0 : 1 }}>
              <circle r={10} fill={tone.fill} stroke={tone.stroke} strokeWidth={1.8} />
            </g>
          );
        })}

        {/* Step 4: four folded chains around a core. */}
        <g style={{ opacity: quat ? 1 : 0, transition: 'opacity 0.5s ease' }}>
          {HUB.map(([cx, cy], k) => (
            <g key={k}>
              <polyline
                points={POS[3].map(([x, y]) => `${x - 240 + cx},${y - 190 + cy}`).join(' ')}
                fill="none"
                stroke={SOFT}
                strokeWidth={2.4}
                strokeLinecap="round"
                opacity={0.6}
              />
              {POS[3].map(([x, y], i) => (
                <circle key={i} cx={x - 240 + cx} cy={y - 190 + cy} r={5.5} fill={(i < 9 ? PINK : BLUE).fill} stroke={(i < 9 ? PINK : BLUE).stroke} strokeWidth={1.4} />
              ))}
              <circle cx={cx + (k % 2 ? -34 : 34)} cy={cy + (k < 2 ? 28 : -28)} r={9} fill={AMBER.fill} stroke={AMBER.stroke} strokeWidth={1.8} />
            </g>
          ))}
          <text x={240} y={196} textAnchor="middle" fontSize={13} fontWeight={600} fill={INK}>hemoglobin</text>
        </g>

        {/* Labels for each level. */}
        <g fontSize={13} fontWeight={600} fill={INK}>
          <text x={14} y={s === 0 ? 232 : 300} style={{ opacity: s === 0 ? 1 : 0 }}>primary structure</text>
          <g style={{ opacity: s === 1 ? 1 : 0 }}>
            <text x={60} y={118} fill={PINK.text}>helix</text>
            <text x={330} y={268} fill={BLUE.text}>sheet</text>
          </g>
          <text x={240} y={300} textAnchor="middle" style={{ opacity: s === 2 ? 1 : 0 }}>tertiary structure</text>
          <text x={240} y={326} textAnchor="middle" style={{ opacity: s === 3 ? 1 : 0 }} fill={LEAF.text}>quaternary structure</text>
        </g>
        <Callout lines={CALLOUT[s]} x={316} y={34} />
      </g>
    </svg>
  );
}
