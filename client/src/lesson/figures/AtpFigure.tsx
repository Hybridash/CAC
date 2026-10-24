import { AMBER, Arrow, Callout, FIGURE_TEXT, INK, MARKER, MOSS, SOFT, at, type Pt } from './kit';

/** ATP as a rechargeable battery: spend a phosphate, then put it back. */

const CALLOUT = [
  ['Three phosphates;', 'the last bond', 'holds the energy'],
  ['Snap off the last', 'phosphate: energy', 'is released'],
  ['Respiration puts', 'the phosphate back'],
] as const;

export const ATP_ALT = [
  'An ATP molecule: an adenosine unit joined to a chain of three phosphate groups.',
  'The third phosphate has broken off and moved away, releasing energy. What is left is ADP, with two phosphates.',
  'The loose phosphate is being reattached to ADP by respiration, making ATP again.',
] as const;

const P3: [Pt, Pt, Pt] = [[300, 170], [410, 92], [300, 170]];

function Phosphate({ p, show = true }: { p: Pt; show?: boolean }) {
  return (
    <g style={{ ...at(p), opacity: show ? 1 : 0 }}>
      <circle r={22} fill={AMBER.fill} stroke={AMBER.stroke} strokeWidth={2} />
      <text textAnchor="middle" y={6} fontSize={17} fontWeight={700} fill={AMBER.text}>P</text>
    </g>
  );
}

export function AtpFigure({ step }: { step: number }) {
  const s = Math.max(0, Math.min(2, step)) as 0 | 1 | 2;
  return (
    <svg viewBox="0 0 480 340" role="img" aria-label={ATP_ALT[s]} className="block h-auto w-full" {...FIGURE_TEXT}>
      <g aria-hidden>
        {/* Adenosine: a ring and a sugar. */}
        <g transform="translate(88 170)">
          <polygon points="-30,-14 -14,-34 14,-34 30,-14 14,6 -14,6" fill="#dcead5" stroke={MOSS} strokeWidth={2.2} transform="translate(0 -16)" />
          <polygon points="0,6 26,24 16,52 -16,52 -26,24" fill="#bcd8b0" stroke={MOSS} strokeWidth={2.2} transform="translate(0 -6)" />
          <text textAnchor="middle" y={-27} fontSize={12} fontWeight={700} fill={INK}>adenine</text>
          <text textAnchor="middle" y={66} fontSize={13} fill={SOFT}>ribose</text>
        </g>
        <path d="M122 168h26M194 170h24M246 170h26" stroke={SOFT} strokeWidth={3} strokeLinecap="round" />
        <Phosphate p={[170, 170]} />
        <Phosphate p={[236, 170]} />
        <Phosphate p={P3[s]} />

        {/* The last bond: a wavy mark where the energy is stored. */}
        <g style={{ opacity: s === 0 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <path d="M262 170q4-8 8 0t8 0" stroke={MARKER} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        </g>

        {/* Step 2: energy leaves for work. */}
        <g style={{ opacity: s === 1 ? 1 : 0, transition: 'opacity 0.45s ease' }}>
          <path d="M434 112L416 142H432L420 172" stroke={MARKER} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x={446} y={150} fontSize={13} fontWeight={700} fill={MARKER}>energy</text>
          <Arrow x1={300} y1={214} x2={300} y2={262} color={MOSS} />
          <text x={308} y={246} fontSize={14} fontWeight={600} fill={INK}>work: a muscle, a pump</text>
          <text x={236} y={218} textAnchor="middle" fontSize={15} fontWeight={700} fill={INK}>ADP</text>
        </g>

        {/* Step 3: recharged. */}
        <g style={{ opacity: s === 2 ? 1 : 0, transition: 'opacity 0.45s ease' }}>
          <Arrow x1={300} y1={290} x2={300} y2={226} color={MOSS} />
          <text x={308} y={284} fontSize={14} fontWeight={600} fill={INK}>respiration</text>
          <text x={236} y={218} textAnchor="middle" fontSize={15} fontWeight={700} fill={INK}>ATP</text>
        </g>
        <g style={{ opacity: s === 0 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <text x={236} y={218} textAnchor="middle" fontSize={15} fontWeight={700} fill={INK}>ATP</text>
        </g>
        <Callout lines={CALLOUT[s]} x={14} y={34} />
      </g>
    </svg>
  );
}
