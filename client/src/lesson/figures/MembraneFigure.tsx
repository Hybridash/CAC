import { AMBER, Arrow, Bilayer, BLUE, Callout, FIGURE_TEXT, INK, MARKER, MOSS, Particle, SOFT, WATER, type Pt } from './kit';

/** The cell membrane and diffusion, in four steps. Small molecules slip through; big ones need a gate. */

const CALLOUT = [
  ['Two layers of', 'phospholipids with', 'proteins floating in'],
  ['Crowded to', 'less crowded:', 'diffusion'],
  ['A bigger gap', 'means faster', 'diffusion'],
  ['Small slips through;', 'big needs a gate'],
] as const;

export const MEMBRANE_ALT = [
  'A cell membrane: two rows of phospholipid heads with a protein channel and a carrier protein embedded in it.',
  'Many small molecules crowd above the membrane and a few are below. Arrows show them spreading down toward the emptier side.',
  'Even more molecules crowd above, so the arrow is thicker: a bigger concentration difference makes diffusion faster.',
  'A small oxygen molecule passes straight through the lipid layer. A large glucose molecule is blocked there, and another passes through the protein channel.',
] as const;

type Mol = { tone: typeof WATER | typeof BLUE | typeof AMBER; label?: string; r: number; at: [Pt, Pt, Pt, Pt]; show: [boolean, boolean, boolean, boolean] };

const T = true;
const F = false;
const small = (a: [Pt, Pt, Pt, Pt], show: [boolean, boolean, boolean, boolean]): Mol => ({ tone: BLUE, r: 7, at: a, show });
const same = (p: Pt): [Pt, Pt, Pt, Pt] => [p, p, p, p];

const MOLS: Mol[] = [
  small(same([60, 70]), [T, T, T, F]),
  small(same([140, 110]), [T, T, T, F]),
  small(same([210, 60]), [F, T, T, F]),
  small(same([290, 100]), [F, T, T, F]),
  small(same([436, 108]), [T, T, T, F]),
  small(same([396, 100]), [F, F, T, F]),
  small(same([100, 40]), [F, F, T, F]),
  small(same([294, 44]), [F, F, T, F]),
  // Movers: cross the membrane region and end up on the emptier side.
  small([[180, 80], [180, 220], [180, 262], [180, 80]], [F, T, T, F]),
  small([[260, 120], [262, 232], [262, 280], [260, 120]], [F, T, T, F]),
  small([[400, 110], [400, 244], [404, 290], [400, 110]], [F, F, T, F]),
  small([[60, 250], [60, 250], [60, 250], [60, 250]], [T, T, T, F]),
  small([[450, 270], [450, 270], [450, 270], [450, 270]], [F, T, T, F]),
  // Step 4: oxygen slips through the lipids.
  small([[250, 100], [250, 100], [250, 100], [250, 172]], [F, F, F, T]),
  small([[250, 100], [250, 100], [250, 100], [250, 250]], [F, F, F, T]),
];

export function MembraneFigure({ step }: { step: number }) {
  const s = Math.max(0, Math.min(3, step)) as 0 | 1 | 2 | 3;
  return (
    <svg viewBox="0 0 480 340" role="img" aria-label={MEMBRANE_ALT[s]} className="block h-auto w-full" {...FIGURE_TEXT}>
      <g aria-hidden>
        <Bilayer y={170} gaps={[[96, 150], [346, 396]]} />
        {/* A carrier protein and a channel protein. */}
        <rect x={98} y={132} width={50} height={76} rx={14} fill="#43854b" />
        <path d="M112 132v-0 M123 140c0 14 0 14 0 28s0 14 0 30" stroke="#dcead5" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.7} />
        <rect x={348} y={132} width={22} height={76} rx={8} fill="#2f6b3f" />
        <rect x={374} y={132} width={22} height={76} rx={8} fill="#2f6b3f" />

        {MOLS.map((m, i) => (
          <Particle key={i} p={m.at[s]} r={m.r} tone={m.tone} show={m.show[s]} />
        ))}

        {/* Step 2 and 3: the direction of diffusion. */}
        <g style={{ opacity: s === 1 || s === 2 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <Arrow x1={240} y1={92} x2={240} y2={140} color={MOSS} w={s === 2 ? 5 : 2.6} />
        </g>

        {/* Step 4: a big molecule is blocked by the lipids, another uses the channel. */}
        <g style={{ opacity: s === 3 ? 1 : 0, transition: 'opacity 0.45s ease' }}>
          <Particle p={[186, 104]} r={13} tone={AMBER} label="Glu" />
          <path d="M178 126l16 16M194 126l-16 16" stroke={MARKER} strokeWidth={2.6} strokeLinecap="round" />
          <Particle p={[360, 170]} r={13} tone={AMBER} label="Glu" />
          <Arrow x1={360} y1={96} x2={360} y2={126} color={SOFT} />
          <text x={264} y={178} fontSize={12} fontWeight={600} fill={SOFT}>O₂</text>
        </g>

        <text x={14} y={128} fontSize={14} fontWeight={600} fill={SOFT}>Outside the cell</text>
        <text x={14} y={226} fontSize={14} fontWeight={600} fill={SOFT}>Inside the cell</text>
        <g fontSize={12} fill={INK} textAnchor="middle" opacity={s === 0 ? 1 : 0} style={{ transition: 'opacity 0.4s ease' }}>
          <text x={123} y={250}>carrier protein</text>
          <text x={371} y={228}>channel protein</text>
          <text x={252} y={228}>phospholipids</text>
        </g>
        <Callout lines={CALLOUT[s]} />
      </g>
    </svg>
  );
}
