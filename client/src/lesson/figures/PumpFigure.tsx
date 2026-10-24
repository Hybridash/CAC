import type { CSSProperties } from 'react';

/**
 * The sodium–potassium pump, drawn as a textbook cross-section. It follows the lesson's four
 * steps: the same `step` that drives the text drives which ions sit where, so the picture and the
 * words never disagree. Ions glide between positions with one CSS transition.
 */

type Pt = [number, number];
type Kind = 'na' | 'k';

interface Ion {
  kind: Kind;
  /** Position at each of the four steps. */
  at: [Pt, Pt, Pt, Pt];
}

const still = (p: Pt, kind: Kind): Ion => ({ kind, at: [p, p, p, p] });

const IONS: Ion[] = [
  // Sodium is crowded outside the cell and scarce inside.
  still([40, 44], 'na'),
  still([104, 78], 'na'),
  still([164, 30], 'na'),
  still([388, 118], 'na'),
  still([440, 96], 'na'),
  still([46, 316], 'na'),
  // Potassium is the reverse.
  still([50, 252], 'k'),
  still([112, 300], 'k'),
  still([176, 276], 'k'),
  still([300, 306], 'k'),
  still([430, 300], 'k'),
  still([456, 252], 'k'),
  still([362, 94], "k"),
  // The three sodium ions that ride the pump out.
  {
    kind: 'na',
    at: [
      [160, 238],
      [226, 198],
      [176, 84],
      [176, 84],
    ],
  },
  {
    kind: 'na',
    at: [
      [322, 268],
      [254, 198],
      [240, 56],
      [240, 56],
    ],
  },
  {
    kind: 'na',
    at: [
      [108, 270],
      [240, 172],
      [304, 84],
      [304, 84],
    ],
  },
  // The two potassium ions that ride it in.
  {
    kind: 'k',
    at: [
      [148, 106],
      [148, 106],
      [222, 102],
      [228, 254],
    ],
  },
  {
    kind: 'k',
    at: [
      [330, 112],
      [330, 112],
      [258, 102],
      [254, 254],
    ],
  },
];

const ION_STYLE: Record<Kind, { fill: string; stroke: string; text: string; label: string }> = {
  na: { fill: '#fdf0cf', stroke: '#d99a06', text: '#6b4300', label: 'Na⁺' },
  k: { fill: '#dae7f1', stroke: '#345a80', text: '#1f3f5c', label: 'K⁺' },
};

const CALLOUT = [
  ['Uphill work:', 'few Na⁺ inside,', 'many outside'],
  ['3 Na⁺ bind', 'inside the pump'],
  ['Phosphate reshapes', 'the pump; Na⁺', 'leaves outside'],
  ['2 K⁺ go in,', 'phosphate comes off'],
] as const;

export const PUMP_ALT = [
  'Cell membrane cross-section. Sodium ions are crowded outside the cell and scarce inside. The pump sits in the membrane, open to the inside and empty.',
  'The pump is open to the inside and three sodium ions are bound in it. An ATP molecule waits beside it.',
  'ATP has given the pump a phosphate. The pump now faces outside and the three sodium ions have been released outside the cell. Two potassium ions wait at its opening.',
  'The phosphate has come off and the pump faces inside again, releasing two potassium ions into the cell.',
] as const;

const glide: CSSProperties = {
  transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease',
};

export function PumpFigure({ step }: { step: number }) {
  const s = Math.max(0, Math.min(3, step)) as 0 | 1 | 2 | 3;
  const facingOut = s === 2;
  const heads = Array.from({ length: 29 }, (_, i) => 12 + i * 16.2).filter(
    (x) => x < 182 || x > 298,
  );

  return (
    <svg
      viewBox="0 0 480 340"
      role="img"
      aria-label={PUMP_ALT[s]}
      className="block h-auto w-full"
      fontFamily="Instrument Sans, sans-serif"
    >
      <g aria-hidden>
        {/* Membrane: two rows of phospholipid heads, tails pointing in. */}
        {heads.map((x) => (
          <g key={x}>
            <line x1={x} y1={146} x2={x} y2={158} stroke="#8c9c98" strokeWidth={2} />
            <line x1={x} y1={194} x2={x} y2={182} stroke="#8c9c98" strokeWidth={2} />
            <circle cx={x} cy={140} r={7} fill="#d6dfdc" stroke="#667773" strokeWidth={1.2} />
            <circle cx={x} cy={200} r={7} fill="#d6dfdc" stroke="#667773" strokeWidth={1.2} />
          </g>
        ))}

        {/* The pump protein, with its cavity open to one side. */}
        <rect x={186} y={116} width={108} height={108} rx={22} fill="#0e7c6b" />
        <path
          d="M214 224 L226 152 Q240 132 254 152 L266 224 Z"
          fill="#e9efed"
          style={{ opacity: facingOut ? 0 : 1, transition: 'opacity 0.45s ease' }}
        />
        <path
          d="M214 116 L226 188 Q240 208 254 188 L266 116 Z"
          fill="#e9efed"
          style={{ opacity: facingOut ? 1 : 0, transition: 'opacity 0.45s ease' }}
        />

        {/* Phosphate: on the pump while it is flipped, drifting away once it lets go. */}
        <g
          style={{
            ...glide,
            transform: `translate(${[330, 330, 268, 332][s]}px, ${[236, 236, 206, 232][s]}px)`,
            opacity: s === 2 ? 1 : s === 3 ? 0.35 : 0,
          }}
        >
          <circle r={11} fill="#fff3c4" stroke="#b97d00" strokeWidth={1.5} />
          <text textAnchor="middle" y={4} fontSize={10} fontWeight={700} fill="#6b4300">
            Pᵢ
          </text>
        </g>

        {/* ATP waits beside the pump, then becomes ADP once it has paid. */}
        <g
          style={{
            ...glide,
            transform: `translate(${[360, 360, 372, 372][s]}px, ${[250, 250, 276, 276][s]}px)`,
            opacity: s === 0 ? 0 : 1,
          }}
        >
          <rect x={-30} y={-14} width={60} height={28} rx={6} fill="#fff3c4" stroke="#b97d00" />
          <text textAnchor="middle" y={5} fontSize={12} fontWeight={700} fill="#6b4300">
            {s === 1 ? 'ATP' : 'ADP'}
          </text>
        </g>

        {/* Ions. */}
        {IONS.map((ion, i) => {
          const [x, y] = ion.at[s];
          const c = ION_STYLE[ion.kind];
          return (
            <g key={i} style={{ ...glide, transform: `translate(${x}px, ${y}px)` }}>
              <circle r={12} fill={c.fill} stroke={c.stroke} strokeWidth={1.5} />
              <text textAnchor="middle" y={4} fontSize={11} fontWeight={700} fill={c.text}>
                {c.label}
              </text>
            </g>
          );
        })}

        {/* Region labels. */}
        <text x={14} y={128} fontSize={14} fontWeight={600} fill="#465f5d">
          Outside the cell
        </text>
        <text x={14} y={226} fontSize={14} fontWeight={600} fill="#465f5d">
          Inside the cell
        </text>

        {/* Marker-pen callout for the current step. */}
        <g fill="#9e2247" fontSize={14} fontWeight={700}>
          {CALLOUT[s].map((line, i) => (
            <text key={line} x={316} y={34 + i * 17}>
              {line}
            </text>
          ))}
        </g>
      </g>
    </svg>
  );
}
