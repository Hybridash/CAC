import { AMBER, Arrow, BLUE, Callout, FIGURE_TEXT, INK, LEAF, PINK, Particle, SOFT, WATER, type Pt } from './kit';

/** Fuel in, ATP out. A mitochondrion with its folded inner membrane. */

const CALLOUT = [
  ['Glucose and', 'oxygen reach', 'the cell'],
  ['Glucose is split;', 'the pieces go', 'inside'],
  ['The folds give', 'room for many', 'ATP makers'],
  ['CO₂ and water', 'are the leftovers'],
] as const;

export const MITO_ALT = [
  'A cell with a mitochondrion in the middle. A glucose molecule and an oxygen molecule arrive from the left.',
  'Glucose has been split in the cytoplasm into two pieces, and the pieces are entering the mitochondrion.',
  'Inside the mitochondrion the inner membrane is folded into cristae, and several ATP molecules are being made along the folds.',
  'Carbon dioxide and water leave the mitochondrion to the right, as waste.',
] as const;

type Item = { label: string; tone: { fill: string; stroke: string; text?: string }; r: number; at: [Pt, Pt, Pt, Pt]; show: [boolean, boolean, boolean, boolean] };
const T = true, F = false;

const ITEMS: Item[] = [
  { label: 'Glu', tone: AMBER, r: 15, at: [[56, 120], [120, 150], [120, 150], [120, 150]], show: [T, F, F, F] },
  { label: 'O₂', tone: BLUE, r: 12, at: [[56, 220], [130, 212], [190, 200], [190, 200]], show: [T, T, F, F] },
  { label: 'C₃', tone: AMBER, r: 11, at: [[120, 134], [220, 156], [250, 150], [250, 150]], show: [F, T, F, F] },
  { label: 'C₃', tone: AMBER, r: 11, at: [[120, 166], [220, 184], [250, 190], [250, 190]], show: [F, T, F, F] },
  { label: 'CO₂', tone: WATER, r: 14, at: [[300, 170], [300, 170], [300, 170], [436, 120]], show: [F, F, F, T] },
  { label: 'H₂O', tone: WATER, r: 14, at: [[320, 190], [320, 190], [320, 190], [440, 214]], show: [F, F, F, T] },
];

export function MitochondriaFigure({ step }: { step: number }) {
  const s = Math.max(0, Math.min(3, step)) as 0 | 1 | 2 | 3;
  const folds = [212, 244, 276, 308, 340];
  return (
    <svg viewBox="0 0 480 340" role="img" aria-label={MITO_ALT[s]} className="block h-auto w-full" {...FIGURE_TEXT}>
      <g aria-hidden>
        <text x={14} y={324} fontSize={14} fontWeight={600} fill={SOFT}>Cytoplasm</text>
        {/* The mitochondrion: outer membrane, then an inner membrane folded into cristae. */}
        <ellipse cx={276} cy={170} rx={120} ry={74} fill={LEAF.fill} stroke="#2f6b3f" strokeWidth={2.4} />
        <path
          d="M176 170c0-40 30-56 62-56h76c34 0 62 16 62 56s-28 56-62 56h-76c-32 0-62-16-62-56Z"
          fill="none" stroke="#2f6b3f" strokeWidth={1.8} opacity={0.6}
        />
        {folds.map((x, i) => (
          <path
            key={x}
            d={i % 2 ? `M${x} 226v-38q0-10 8-10t8 10v38` : `M${x} 114v38q0 10 8 10t8-10v-38`}
            fill="none" stroke="#2f6b3f" strokeWidth={2.2} strokeLinecap="round"
          />
        ))}
        <text x={276} y={270} textAnchor="middle" fontSize={13} fill={SOFT}>mitochondrion</text>

        {/* ATP made along the folds in step 3. */}
        <g style={{ opacity: s === 2 ? 1 : 0, transition: 'opacity 0.5s ease' }}>
          {([[226, 168], [258, 168], [290, 168], [322, 168]] as Pt[]).map((p) => (
            <Particle key={p[0]} p={p} r={11} tone={PINK} label="ATP" fontSize={8} />
          ))}
        </g>

        {ITEMS.map((it, i) => (
          <Particle key={i} p={it.at[s]} r={it.r} tone={it.tone} label={it.label} show={it.show[s]} fontSize={it.r > 12 ? 11 : 10} />
        ))}

        <g style={{ opacity: s === 1 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <Arrow x1={226} y1={154} x2={250} y2={154} color={INK} />
        </g>
        <g style={{ opacity: s === 3 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <Arrow x1={400} y1={150} x2={430} y2={128} color={SOFT} />
          <Arrow x1={400} y1={190} x2={432} y2={208} color={SOFT} />
        </g>
        <Callout lines={CALLOUT[s]} x={306} y={30} />
      </g>
    </svg>
  );
}
