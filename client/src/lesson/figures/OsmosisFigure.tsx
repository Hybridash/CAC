import type { CSSProperties } from 'react';

/**
 * Osmosis in three drawings, one per lesson step. Steps 1 and 2 share one membrane scene, so the
 * water molecules visibly cross between them; step 3 swaps to three cells in three solutions.
 */

type Pt = [number, number];

const WATER = { fill: '#dff0fb', stroke: '#2f6fb0' };
const SOLUTE = { fill: '#fdf0cf', stroke: '#d99a06' };

const PORES = [120, 240, 360];

const TOP_WATER: Pt[] = [
  [90, 100],
  [150, 58],
  [220, 142],
  [350, 112],
  [430, 128],
];
const BOTTOM_WATER: Pt[] = [
  [96, 232],
  [182, 304],
  [262, 226],
  [450, 304],
  [40, 300],
];
/** Water that crosses a pore between step 1 (even sides) and step 2 (toward the salt). */
const MOVERS: [Pt, Pt][] = [
  [[120, 134], [124, 242]],
  [[240, 120], [234, 256]],
  [[360, 134], [356, 240]],
  [[300, 90], [296, 270]],
  [[178, 100], [170, 228]],
];
const TOP_SOLUTE: [Pt, number][] = [
  [[60, 72], 1],
  [[400, 82], 1],
  [[196, 110], 0],
];
const BOTTOM_SOLUTE: [Pt, number][] = [
  [[70, 262], 1],
  [[300, 296], 1],
  [[420, 244], 1],
  [[150, 214], 0],
  [[210, 262], 0],
  [[330, 214], 0],
  [[386, 288], 0],
  [[262, 288], 0],
];

const glide: CSSProperties = {
  transition: 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease',
};

const CALLOUT = [
  ['Water slips through', 'the channels.', 'Solutes cannot.'],
  ['Water flows toward', 'the side with', 'more solutes'],
  ['Water follows', 'the salt'],
] as const;

export const OSMOSIS_ALT = [
  'A membrane with three water channels divides two solutions with the same amount of dissolved solute. Water molecules cross freely through the channels in both directions; solute particles stay on their side.',
  'The lower solution now has many more solute particles. Water molecules have moved through the channels from the dilute upper side to the lower side.',
  'Three red blood cells. In pure water the cell swells, with water flowing in. In a matching solution it stays normal size. In salty water it shrivels, with water flowing out.',
] as const;

/** A shrivelled, spiky cell outline. */
function crenated(cx: number, cy: number, r: number) {
  const pts = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const rr = i % 2 ? r * 0.8 : r;
    return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  });
  return pts.join(' ');
}

function Water({ x, y, style }: { x: number; y: number; style?: CSSProperties }) {
  return (
    <g style={{ ...glide, transform: `translate(${x}px, ${y}px)`, ...style }}>
      <circle r={6} fill={WATER.fill} stroke={WATER.stroke} strokeWidth={1.5} />
    </g>
  );
}

function Solute({ x, y, show }: { x: number; y: number; show: boolean }) {
  return (
    <g style={{ ...glide, transform: `translate(${x}px, ${y}px)`, opacity: show ? 1 : 0 }}>
      <circle r={10} fill={SOLUTE.fill} stroke={SOLUTE.stroke} strokeWidth={1.5} />
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 8;
  const p = (t: number): Pt => [x2 - Math.cos(a + t) * h, y2 - Math.sin(a + t) * h];
  const [ax, ay] = p(0.45);
  const [bx, by] = p(-0.45);
  return (
    <g stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <polyline points={`${ax},${ay} ${x2},${y2} ${bx},${by}`} />
    </g>
  );
}

export function OsmosisFigure({ step }: { step: number }) {
  const s = Math.max(0, Math.min(2, step)) as 0 | 1 | 2;
  const scene = s < 2;
  const moved = s === 1;

  return (
    <svg
      viewBox="0 0 480 340"
      role="img"
      aria-label={OSMOSIS_ALT[s]}
      className="block h-auto w-full"
      fontFamily="Instrument Sans, sans-serif"
    >
      <g aria-hidden>
        {/* Steps 1 and 2: a membrane with water channels between two solutions. */}
        <g style={{ opacity: scene ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          {[0, 1, 2, 3].map((i) => {
            const x0 = i === 0 ? 0 : PORES[i - 1] + 14;
            const x1 = i === 3 ? 480 : PORES[i] - 14;
            return (
              <rect key={i} x={x0} y={163} width={x1 - x0} height={14} rx={3} fill="#8c9c98" />
            );
          })}
          {PORES.map((x) => (
            <g key={x}>
              <rect x={x - 14} y={158} width={5} height={24} rx={2} fill="#667773" />
              <rect x={x + 9} y={158} width={5} height={24} rx={2} fill="#667773" />
            </g>
          ))}

          {TOP_WATER.map(([x, y]) => (
            <Water key={`t${x}`} x={x} y={y} />
          ))}
          {BOTTOM_WATER.map(([x, y]) => (
            <Water key={`b${x}`} x={x} y={y} />
          ))}
          {MOVERS.map(([a, b], i) => (
            <Water key={`m${i}`} x={(moved ? b : a)[0]} y={(moved ? b : a)[1]} />
          ))}
          {TOP_SOLUTE.map(([[x, y], always]) => (
            <Solute key={`ts${x}`} x={x} y={y} show={always === 1 || !moved} />
          ))}
          {BOTTOM_SOLUTE.map(([[x, y], always]) => (
            <Solute key={`bs${x}`} x={x} y={y} show={always === 1 || moved} />
          ))}

          {PORES.map((x) =>
            moved ? (
              <Arrow key={x} x1={x} y1={140} x2={x} y2={196} color="#0b6558" />
            ) : (
              <g key={x}>
                <Arrow x1={x - 5} y1={196} x2={x - 5} y2={142} color="#667773" />
                <Arrow x1={x + 5} y1={142} x2={x + 5} y2={196} color="#667773" />
              </g>
            ),
          )}

          <text x={14} y={30} fontSize={14} fontWeight={600} fill="#465f5d">
            {moved ? 'Fewer solutes' : 'Solution A'}
          </text>
          <text x={14} y={332} fontSize={14} fontWeight={600} fill="#465f5d">
            {moved ? 'More solutes' : 'Solution B'}
          </text>
        </g>

        {/* Step 3: three cells in three solutions. */}
        <g style={{ opacity: scene ? 0 : 1, transition: 'opacity 0.4s ease' }}>
          {[
            { cx: 85, r: 50, label: 'Pure water', note: 'swells', angles: [], dir: 'in' },
            {
              cx: 240,
              r: 40,
              label: 'Matching solution',
              note: 'stays the same',
              angles: [20, 160, 200],
              dir: 'both',
            },
            {
              cx: 395,
              r: 30,
              label: 'Salty water',
              note: 'shrivels',
              angles: [22, 67, 112, 157, 202, 247, 292, 337].map((d) => d + 0.5),
              dir: 'out',
            },
          ].map((c) => (
            <g key={c.cx}>
              {c.dir === 'out' ? (
                <polygon
                  points={crenated(c.cx, 150, c.r)}
                  fill="#fadde5"
                  stroke="#c02b57"
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              ) : (
                <circle cx={c.cx} cy={150} r={c.r} fill="#fadde5" stroke="#c02b57" strokeWidth={2} />
              )}
              {c.angles.map((deg, i) => {
                const a = (deg * Math.PI) / 180;
                const d = (c.dir === 'out' ? 58 : 66) + (i % 2) * 10;
                return (
                  <circle
                    key={deg}
                    cx={c.cx + Math.cos(a) * d}
                    cy={150 + Math.sin(a) * d}
                    r={7}
                    fill={SOLUTE.fill}
                    stroke={SOLUTE.stroke}
                    strokeWidth={1.5}
                  />
                );
              })}
              {c.dir === 'in' && (
                <>
                  <Arrow x1={c.cx} y1={150 - c.r - 36} x2={c.cx} y2={150 - c.r - 8} color="#2f6fb0" />
                  <Arrow x1={c.cx} y1={150 + c.r + 36} x2={c.cx} y2={150 + c.r + 8} color="#2f6fb0" />
                </>
              )}
              {c.dir === 'out' && (
                <>
                  <Arrow x1={c.cx} y1={150 - c.r - 40} x2={c.cx} y2={150 - c.r - 66} color="#2f6fb0" />
                  <Arrow x1={c.cx} y1={150 + c.r + 40} x2={c.cx} y2={150 + c.r + 66} color="#2f6fb0" />
                </>
              )}
              {c.dir === 'both' && (
                <>
                  <Arrow x1={c.cx - 7} y1={150 - c.r - 40} x2={c.cx - 7} y2={150 - c.r - 10} color="#667773" />
                  <Arrow x1={c.cx + 7} y1={150 - c.r - 10} x2={c.cx + 7} y2={150 - c.r - 40} color="#667773" />
                </>
              )}
              <text x={c.cx} y={268} textAnchor="middle" fontSize={14} fontWeight={700} fill="#0d2b2a">
                {c.label}
              </text>
              <text x={c.cx} y={288} textAnchor="middle" fontSize={14} fill="#465f5d">
                cell {c.note}
              </text>
            </g>
          ))}
        </g>

        {/* Legend. */}
        <g fontSize={12} fill="#465f5d">
          <circle cx={206} cy={324} r={5} fill={WATER.fill} stroke={WATER.stroke} strokeWidth={1.5} />
          <text x={216} y={328}>
            water
          </text>
          <circle cx={274} cy={324} r={7} fill={SOLUTE.fill} stroke={SOLUTE.stroke} strokeWidth={1.5} />
          <text x={286} y={328}>
            dissolved solute
          </text>
        </g>

        {/* Marker-pen callout. */}
        <g fill="#9e2247" fontSize={14} fontWeight={700}>
          {CALLOUT[s].map((line, i) => (
            <text key={line} x={scene ? 300 : 14} y={scene ? 30 + i * 17 : 24 + i * 17} textAnchor="start">
              {line}
            </text>
          ))}
        </g>
      </g>
    </svg>
  );
}
