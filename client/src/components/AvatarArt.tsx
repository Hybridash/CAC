import type { ReactNode } from 'react';
import type { Avatar, AvatarAccessory } from '@bioplay/shared';

interface BodyDrawing {
  /** Drawn behind the body (e.g. tentacles, tails). */
  back?: ReactNode;
  shape: ReactNode;
  /** Where the face goes, and how big. */
  face: { x: number; y: number; s: number };
  /** Top of the head, for hats. */
  top: number;
  /** Hide the generic face (for bodies that draw their own). */
  noFace?: boolean;
}

const INK = '#1e1b2e';
const stroke = {
  stroke: INK,
  strokeWidth: 2.5,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
};

function drawBody(art: Avatar['art']): BodyDrawing {
  const { color: c, accent: k } = art;
  switch (art.body) {
    case 'cell':
      return {
        shape: (
          <g>
            <path
              d="M50 14c20 0 34 12 34 32s-12 38-36 38S14 70 16 48 30 14 50 14z"
              fill={c}
              {...stroke}
            />
            <circle cx="66" cy="66" r="9" fill={k} opacity=".55" />
            <circle cx="30" cy="36" r="3" fill={k} opacity=".5" />
          </g>
        ),
        face: { x: 48, y: 46, s: 1 },
        top: 16,
      };
    case 'mitochondrion':
      return {
        shape: (
          <g>
            <ellipse cx="50" cy="54" rx="38" ry="26" fill={c} {...stroke} />
            <path d="M20 62q6-14 12 0t12 0 12 0 12 0 12 0" fill="none" stroke={k} strokeWidth="3" />
          </g>
        ),
        face: { x: 50, y: 46, s: 1 },
        top: 28,
      };
    case 'helix':
      return {
        shape: (
          <g strokeLinecap="round" fill="none">
            <path d="M32 8c36 14-36 28 0 42s-36 28 0 42" stroke={c} strokeWidth="8" />
            <path d="M68 8c-36 14 36 28 0 42s36 28 0 42" stroke={k} strokeWidth="8" />
            {[18, 34, 66, 82].map((y) => (
              <path key={y} d={`M38 ${y}h24`} stroke={INK} strokeWidth="2.5" />
            ))}
            <circle cx="50" cy="50" r="17" fill="white" stroke={INK} strokeWidth="2.5" />
          </g>
        ),
        face: { x: 50, y: 48, s: 0.75 },
        top: 30,
      };
    case 'neuron':
      return {
        back: (
          <g stroke={k} strokeWidth="5" strokeLinecap="round" fill="none">
            <path d="M28 40L10 26M26 58L8 66M72 40l18-14M50 76v18l10 4" />
          </g>
        ),
        shape: <circle cx="50" cy="50" r="28" fill={c} {...stroke} />,
        face: { x: 50, y: 50, s: 1 },
        top: 22,
      };
    case 'phage':
      return {
        back: (
          <g stroke={k} strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M50 62v20M50 82l-16 12M50 82l16 12M50 82l-8 14M50 82l8 14" />
          </g>
        ),
        shape: (
          <g>
            <rect x="44" y="58" width="12" height="24" fill={k} {...stroke} />
            <path d="M50 8l26 15v30L50 68 24 53V23z" fill={c} {...stroke} />
          </g>
        ),
        face: { x: 50, y: 38, s: 0.95 },
        top: 10,
      };
    case 'virus':
      return {
        back: (
          <g>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <g key={i}>
                  <line
                    x1={50 + Math.cos(a) * 28}
                    y1={52 + Math.sin(a) * 28}
                    x2={50 + Math.cos(a) * 42}
                    y2={52 + Math.sin(a) * 42}
                    stroke={k}
                    strokeWidth="4"
                  />
                  <circle cx={50 + Math.cos(a) * 43} cy={52 + Math.sin(a) * 43} r="4.5" fill={k} />
                </g>
              );
            })}
          </g>
        ),
        shape: <circle cx="50" cy="52" r="30" fill={c} {...stroke} />,
        face: { x: 50, y: 52, s: 1 },
        top: 22,
      };
    case 'bacterium':
      return {
        back: (
          <path
            d="M88 54c6 8-2 16 4 24"
            fill="none"
            stroke={k}
            strokeWidth="3"
            strokeLinecap="round"
          />
        ),
        shape: (
          <g>
            <rect x="10" y="30" width="80" height="44" rx="22" fill={c} {...stroke} />
            {[22, 78].map((x) => (
              <path key={x} d={`M${x} 30l-4-8M${x} 74l-4 8`} stroke={k} strokeWidth="2" />
            ))}
          </g>
        ),
        face: { x: 50, y: 50, s: 1 },
        top: 30,
      };
    case 'rbc':
      return {
        shape: (
          <g>
            <ellipse cx="50" cy="54" rx="40" ry="30" fill={c} {...stroke} />
            <ellipse cx="50" cy="56" rx="22" ry="14" fill={k} opacity=".35" />
          </g>
        ),
        face: { x: 50, y: 50, s: 1 },
        top: 24,
      };
    case 'antibody':
      return {
        shape: (
          <g>
            <path d="M44 92V58L18 26l10-8 22 28 22-28 10 8-26 32v34z" fill={c} {...stroke} />
            <path d="M18 26l-6-6M82 26l6-6" stroke={k} strokeWidth="6" strokeLinecap="round" />
            <circle cx="50" cy="56" r="16" fill={c} {...stroke} />
          </g>
        ),
        face: { x: 50, y: 56, s: 0.8 },
        top: 40,
      };
    case 'jellyfish':
      return {
        back: (
          <g stroke={k} strokeWidth="3.5" fill="none" strokeLinecap="round">
            <path d="M28 56q-6 14 2 26t0 14M42 58q-4 14 2 24M58 58q4 14-2 24M72 56q6 14-2 26t0 14" />
          </g>
        ),
        shape: (
          <path
            d="M14 58C14 30 30 14 50 14s36 16 36 44q-8 6-18 0-9 6-18 0-9 6-18 0-9 6-18 0z"
            fill={c}
            {...stroke}
          />
        ),
        face: { x: 50, y: 40, s: 1 },
        top: 14,
      };
    case 'fish':
      return {
        back: <path d="M80 50l16-16v32z" fill={k} {...stroke} />,
        shape: (
          <g>
            <ellipse cx="46" cy="50" rx="36" ry="26" fill={c} {...stroke} />
            <path d="M40 26q8-10 18 0" fill={k} {...stroke} />
            {art.color === '#334155' && (
              <g>
                <path d="M26 30q-8-18 6-24" fill="none" stroke={INK} strokeWidth="2" />
                <circle cx="33" cy="6" r="5" fill={k}>
                  <animate
                    attributeName="opacity"
                    values="1;.4;1"
                    dur="1.6s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            )}
          </g>
        ),
        face: { x: 36, y: 48, s: 0.95 },
        top: 26,
      };
    case 'axolotl':
      return {
        back: (
          <g stroke={k} strokeWidth="5" strokeLinecap="round">
            <path d="M18 34l-12-8M16 46H4M18 58l-12 8M82 34l12-8M84 46h12M82 58l12 8" />
          </g>
        ),
        shape: <ellipse cx="50" cy="50" rx="34" ry="28" fill={c} {...stroke} />,
        face: { x: 50, y: 48, s: 1.1 },
        top: 22,
      };
    case 'tardigrade':
      return {
        back: (
          <g fill={c} {...stroke}>
            {[22, 40, 58, 76].map((x) => (
              <rect key={x} x={x - 6} y="70" width="12" height="16" rx="6" />
            ))}
          </g>
        ),
        shape: (
          <g>
            <rect x="10" y="30" width="80" height="48" rx="24" fill={c} {...stroke} />
            {[34, 50, 66].map((x) => (
              <path key={x} d={`M${x} 32v44`} stroke={k} strokeWidth="2" opacity=".5" />
            ))}
            <ellipse cx="14" cy="54" rx="6" ry="4" fill={k} />
          </g>
        ),
        face: { x: 28, y: 50, s: 0.85 },
        top: 30,
      };
    case 'mushroom':
      return {
        shape: (
          <g>
            <rect x="36" y="52" width="28" height="36" rx="10" fill={k} {...stroke} />
            <path d="M10 56C10 30 28 14 50 14s40 16 40 42z" fill={c} {...stroke} />
            {[
              [30, 34],
              [52, 26],
              [70, 40],
            ].map(([x, y]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r="5" fill="white" opacity=".85" />
            ))}
          </g>
        ),
        face: { x: 50, y: 70, s: 0.7 },
        top: 14,
      };
    case 'plant':
      return {
        shape: (
          <g>
            <path d="M50 52V30" stroke="#15803d" strokeWidth="4" />
            <path
              d="M50 34c-18 2-24-10-20-20 14-2 22 8 20 20zM50 30c16 0 22-12 18-20-12-2-20 6-18 20z"
              fill={c}
              {...stroke}
            />
            <path d="M24 52h52l-8 40H32z" fill={k} {...stroke} />
            <rect x="20" y="48" width="60" height="10" rx="4" fill={k} {...stroke} />
          </g>
        ),
        face: { x: 50, y: 72, s: 0.8 },
        top: 10,
      };
    case 'flytrap':
      return {
        shape: (
          <g>
            <path d="M50 66v28" stroke="#15803d" strokeWidth="5" />
            <path d="M14 46C14 22 86 22 86 46z" fill={c} {...stroke} />
            <path d="M14 50C14 74 86 74 86 50z" fill={k} {...stroke} />
            {[22, 34, 46, 58, 70, 80].map((x) => (
              <path key={x} d={`M${x} 44l-2-8M${x} 52l-2 8`} stroke="#14532d" strokeWidth="2.5" />
            ))}
          </g>
        ),
        face: { x: 50, y: 36, s: 0.8 },
        top: 22,
      };
    case 'key':
      return {
        shape: (
          <g>
            <circle cx="38" cy="40" r="26" fill={c} {...stroke} />
            <path d="M58 52l30 30-8 8-6-6-6 6-6-6-8 8-12-12" fill={c} {...stroke} />
            <circle cx="38" cy="40" r="7" fill={k} />
          </g>
        ),
        face: { x: 38, y: 40, s: 0.8 },
        top: 14,
        noFace: false,
      };
    case 'ribosome':
      return {
        shape: (
          <g>
            <ellipse cx="50" cy="70" rx="30" ry="18" fill={k} {...stroke} />
            <ellipse cx="50" cy="44" rx="36" ry="26" fill={c} {...stroke} />
            <path d="M8 70h84" stroke="#f43f5e" strokeWidth="3" strokeDasharray="5 3" />
          </g>
        ),
        face: { x: 50, y: 44, s: 1 },
        top: 18,
      };
    case 'molerat':
      return {
        shape: (
          <g>
            <ellipse cx="50" cy="56" rx="36" ry="30" fill={c} {...stroke} />
            {[38, 48, 58].map((y) => (
              <path
                key={y}
                d={`M26 ${y + 10}q8-4 16 0`}
                fill="none"
                stroke={k}
                strokeWidth="1.5"
                opacity=".5"
              />
            ))}
            <rect
              x="44"
              y="70"
              width="5"
              height="10"
              rx="1"
              fill="#fef9c3"
              stroke={INK}
              strokeWidth="1.5"
            />
            <rect
              x="51"
              y="70"
              width="5"
              height="10"
              rx="1"
              fill="#fef9c3"
              stroke={INK}
              strokeWidth="1.5"
            />
          </g>
        ),
        face: { x: 50, y: 50, s: 0.85 },
        top: 26,
      };
    case 'octopus':
      return {
        back: (
          <g stroke={c} strokeWidth="7" strokeLinecap="round" fill="none">
            <path d="M24 66q-10 14 0 26M38 70q-4 16 4 24M62 70q4 16-4 24M76 66q10 14 0 26" />
          </g>
        ),
        shape: <path d="M18 56C14 28 30 10 50 10s36 18 32 46q-32 18-64 0z" fill={c} {...stroke} />,
        face: { x: 50, y: 42, s: 1 },
        top: 10,
      };
    case 'leaf':
      return {
        shape: (
          <g>
            <path d="M14 86C10 40 40 12 88 12c2 46-28 76-74 74z" fill={c} {...stroke} />
            <path d="M14 86L70 30" stroke={k} strokeWidth="3" />
          </g>
        ),
        face: { x: 50, y: 52, s: 0.9 },
        top: 18,
      };
    case 'heart':
      return {
        shape: (
          <path
            d="M50 88S10 62 10 36a20 20 0 0140-8 20 20 0 0140 8c0 26-40 52-40 52z"
            fill={c}
            {...stroke}
          />
        ),
        face: { x: 50, y: 48, s: 1 },
        top: 18,
      };
    case 'brain':
      return {
        shape: (
          <g>
            <path
              d="M20 60c-10-6-8-24 4-26 0-14 16-20 26-14 10-6 26 0 26 14 12 2 14 20 4 26 2 14-16 22-30 14-14 8-32 0-30-14z"
              fill={c}
              {...stroke}
            />
            <path
              d="M50 20v58M32 40q8 4 6 12M68 40q-8 4-6 12"
              fill="none"
              stroke={k}
              strokeWidth="2"
              opacity=".6"
            />
          </g>
        ),
        face: { x: 50, y: 54, s: 0.9 },
        top: 16,
      };
    case 'bone':
      return {
        shape: (
          <g fill={c} {...stroke}>
            <path d="M24 34a10 10 0 1114-12l26 26a10 10 0 1112 14 10 10 0 11-14 12L36 48a10 10 0 11-12-14z" />
          </g>
        ),
        face: { x: 50, y: 48, s: 0.75 },
        top: 22,
      };
    case 'egg':
      return {
        shape: (
          <path
            d="M50 10C30 10 18 44 18 62a32 32 0 0064 0C82 44 70 10 50 10z"
            fill={c}
            {...stroke}
          />
        ),
        face: { x: 50, y: 56, s: 1 },
        top: 12,
      };
    case 'worm':
      return {
        shape: (
          <g>
            <path
              d="M12 74c10-30 30-30 40-10s30 20 36-14"
              fill="none"
              stroke={INK}
              strokeWidth="24"
              strokeLinecap="round"
            />
            <path
              d="M12 74c10-30 30-30 40-10s30 20 36-14"
              fill="none"
              stroke={c}
              strokeWidth="19"
              strokeLinecap="round"
            />
            {[30, 46, 62].map((x) => (
              <path
                key={x}
                d={`M${x} ${x === 46 ? 58 : 62}v12`}
                stroke={k}
                strokeWidth="2"
                opacity=".5"
              />
            ))}
          </g>
        ),
        face: { x: 86, y: 48, s: 0.6 },
        top: 32,
      };
    case 'beetle':
      return {
        back: (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round">
            <path d="M22 50H8M24 66l-12 8M78 50h14M76 66l12 8M40 22l-6-10M60 22l6-10" />
          </g>
        ),
        shape: (
          <g>
            <ellipse cx="50" cy="58" rx="30" ry="30" fill={c} {...stroke} />
            <path d="M50 28v60" stroke={INK} strokeWidth="2.5" />
            {[
              [38, 52],
              [62, 52],
              [40, 72],
              [60, 72],
            ].map(([x, y]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r="5" fill={k} />
            ))}
            <ellipse cx="50" cy="28" rx="18" ry="12" fill={k} {...stroke} />
          </g>
        ),
        face: { x: 50, y: 28, s: 0.65 },
        top: 16,
      };
    case 'bird':
      return {
        back: <path d="M80 56l14 6-14 6z" fill={k} {...stroke} />,
        shape: (
          <g>
            <circle cx="50" cy="52" r="32" fill={c} {...stroke} />
            <path d="M54 58q14 4 22-6-6 16-22 18z" fill={c} {...stroke} opacity=".9" />
            <path d="M22 50l-12 4 12 4z" fill={k} {...stroke} />
          </g>
        ),
        face: { x: 42, y: 46, s: 0.95 },
        top: 20,
      };
    case 'eel':
      return {
        shape: (
          <g>
            <path
              d="M10 60c14-24 26 8 40-12s28 6 40-14"
              fill="none"
              stroke={INK}
              strokeWidth="22"
              strokeLinecap="round"
            />
            <path
              d="M10 60c14-24 26 8 40-12s28 6 40-14"
              fill="none"
              stroke={c}
              strokeWidth="17"
              strokeLinecap="round"
            />
          </g>
        ),
        face: { x: 84, y: 36, s: 0.6 },
        top: 20,
      };
    case 'bat':
      return {
        shape: (
          <g>
            <path
              d="M50 40c-14-16-36-18-46-6 10 0 12 8 10 14 8-4 16 0 14 8 8-6 16-2 22 4 6-6 14-10 22-4-2-8 6-12 14-8-2-6 0-14 10-14-10-12-32-10-46 6z"
              fill={k}
              {...stroke}
            />
            <circle cx="50" cy="52" r="20" fill={c} {...stroke} />
            <path d="M36 36l4 12M64 36l-4 12" stroke={INK} strokeWidth="3" />
          </g>
        ),
        face: { x: 50, y: 52, s: 0.75 },
        top: 30,
      };
    case 'flower':
      return {
        shape: (
          <g>
            {Array.from({ length: 6 }, (_, i) => {
              const a = (i / 6) * Math.PI * 2;
              return (
                <ellipse
                  key={i}
                  cx={50 + Math.cos(a) * 22}
                  cy={48 + Math.sin(a) * 22}
                  rx="15"
                  ry="11"
                  transform={`rotate(${(a * 180) / Math.PI} ${50 + Math.cos(a) * 22} ${48 + Math.sin(a) * 22})`}
                  fill={c}
                  {...stroke}
                />
              );
            })}
            <circle cx="50" cy="48" r="18" fill={k} {...stroke} />
          </g>
        ),
        face: { x: 50, y: 48, s: 0.7 },
        top: 16,
      };
    case 'tooth':
      return {
        shape: (
          <path
            d="M22 26c0-14 18-16 28-8 10-8 28-6 28 8 0 18-6 26-8 46-2 16-12 16-14 0-2-10-10-10-12 0-2 16-12 16-14 0-2-20-8-28-8-46z"
            fill={c}
            {...stroke}
          />
        ),
        face: { x: 50, y: 38, s: 0.95 },
        top: 14,
      };
    case 'wolf':
      return {
        shape: (
          <g>
            <path d="M20 40L16 10l22 16M80 40l4-30-22 16" fill={c} {...stroke} />
            <path
              d="M18 44c0-20 14-24 32-24s32 4 32 24-12 38-32 46C30 82 18 64 18 44z"
              fill={c}
              {...stroke}
            />
            <path d="M36 62q14 18 28 0" fill="#f5f5f4" stroke={INK} strokeWidth="2" />
            <ellipse cx="50" cy="64" rx="5" ry="4" fill={k} />
          </g>
        ),
        face: { x: 50, y: 46, s: 0.9 },
        top: 18,
      };
  }
}

function Face({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g>
      <circle cx={x - 9 * s} cy={y} r={4.6 * s} fill={INK} />
      <circle cx={x + 9 * s} cy={y} r={4.6 * s} fill={INK} />
      <circle cx={x - 7.6 * s} cy={y - 1.6 * s} r={1.6 * s} fill="white" />
      <circle cx={x + 10.4 * s} cy={y - 1.6 * s} r={1.6 * s} fill="white" />
      <ellipse
        cx={x - 15 * s}
        cy={y + 7 * s}
        rx={3.6 * s}
        ry={2.2 * s}
        fill="#fb7185"
        opacity=".55"
      />
      <ellipse
        cx={x + 15 * s}
        cy={y + 7 * s}
        rx={3.6 * s}
        ry={2.2 * s}
        fill="#fb7185"
        opacity=".55"
      />
      <path
        d={`M${x - 5 * s} ${y + 7 * s} q${5 * s} ${5 * s} ${10 * s} 0`}
        fill="none"
        stroke={INK}
        strokeWidth={2.2 * s}
        strokeLinecap="round"
      />
    </g>
  );
}

function Accessory({
  kind,
  face,
  top,
  accent,
}: {
  kind: AvatarAccessory;
  face: BodyDrawing['face'];
  top: number;
  accent: string;
}) {
  const { x, y, s } = face;
  const eye = 9 * s;
  switch (kind) {
    case 'none':
    case 'cape':
      return null;
    case 'sunglasses':
      return (
        <g>
          <rect
            x={x - eye - 7 * s}
            y={y - 5 * s}
            width={14 * s}
            height={10 * s}
            rx={3 * s}
            fill={INK}
          />
          <rect
            x={x + eye - 7 * s}
            y={y - 5 * s}
            width={14 * s}
            height={10 * s}
            rx={3 * s}
            fill={INK}
          />
          <path
            d={`M${x - eye + 7 * s} ${y - 2 * s}h${2 * eye - 14 * s}`}
            stroke={INK}
            strokeWidth={2.5 * s}
          />
          <path
            d={`M${x - eye - 4 * s} ${y - 2 * s}l3 -2`}
            stroke="white"
            strokeWidth="1.5"
            opacity=".7"
          />
        </g>
      );
    case 'goggles':
      return (
        <g fill="#bae6fd" fillOpacity=".55" stroke="#475569" strokeWidth={2.5 * s}>
          <path d={`M${x - 26 * s} ${y}h${52 * s}`} stroke="#475569" strokeWidth={3 * s} />
          <circle cx={x - eye} cy={y} r={7.5 * s} />
          <circle cx={x + eye} cy={y} r={7.5 * s} />
        </g>
      );
    case 'monocle':
      return (
        <g fill="none" stroke="#a16207" strokeWidth={2.2 * s}>
          <circle cx={x + eye} cy={y} r={7 * s} />
          <path d={`M${x + eye + 5 * s} ${y + 5 * s}q4 12 -2 20`} strokeWidth="1.2" />
        </g>
      );
    case 'helmet':
      return (
        <g>
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="#e0f2fe"
            fillOpacity=".22"
            stroke="#94a3b8"
            strokeWidth="3"
          />
          <path
            d="M22 22a40 40 0 0118-12"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            opacity=".8"
            fill="none"
          />
          <rect x="34" y="90" width="32" height="8" rx="3" fill="#94a3b8" />
        </g>
      );
    case 'crown':
      return (
        <path
          d={`M${x - 14} ${top + 2}l-2 -16 9 8 7 -12 7 12 9 -8 -2 16z`}
          fill="#facc15"
          stroke="#a16207"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      );
    case 'chef-hat':
      return (
        <g fill="white" stroke={INK} strokeWidth="2">
          <rect x={x - 12} y={top - 6} width="24" height="10" />
          <path
            d={`M${x - 14} ${top - 6}c-10 -2 -8 -18 4 -14 2 -10 18 -10 20 0 12 -4 14 12 4 14z`}
          />
        </g>
      );
    case 'wizard-hat':
      return (
        <g>
          <path
            d={`M${x - 20} ${top + 4}h40l-16 -34z`}
            fill="#6d28d9"
            stroke={INK}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <text x={x - 6} y={top - 6} fontSize="9" fill="#fde047">
            ★
          </text>
        </g>
      );
    case 'cap':
      return (
        <g stroke={INK} strokeWidth="2" strokeLinejoin="round">
          <path d={`M${x - 16} ${top + 6}c0 -16 32 -16 32 0z`} fill={accent} />
          <path d={`M${x + 12} ${top + 6}h16q-2 4 -16 4z`} fill={accent} />
        </g>
      );
    case 'shield':
      return (
        <g>
          <path
            d="M70 60h22v14c0 10-11 16-11 16s-11-6-11-16z"
            fill="#cbd5e1"
            stroke={INK}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M81 64v20M74 72h14" stroke="#dc2626" strokeWidth="3" />
        </g>
      );
    case 'bowtie':
      return (
        <path
          d={`M${x} ${y + 18 * s}l-10 -6v12zM${x} ${y + 18 * s}l10 -6v12z`}
          fill="#ef4444"
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      );
    case 'headphones':
      return (
        <g>
          <path
            d={`M${x - 22 * s} ${y}c0 -30 ${44 * s} -30 ${44 * s} 0`}
            fill="none"
            stroke={INK}
            strokeWidth="3.5"
          />
          <rect
            x={x - 27 * s}
            y={y - 6}
            width="9"
            height="14"
            rx="4"
            fill="#ef4444"
            stroke={INK}
            strokeWidth="2"
          />
          <rect
            x={x + 18 * s}
            y={y - 6}
            width="9"
            height="14"
            rx="4"
            fill="#ef4444"
            stroke={INK}
            strokeWidth="2"
          />
        </g>
      );
    case 'scarf':
      return (
        <g stroke={INK} strokeWidth="2" strokeLinejoin="round">
          <rect x={x - 18 * s} y={y + 14 * s} width={36 * s} height="8" rx="4" fill="#f43f5e" />
          <path d={`M${x + 8 * s} ${y + 18 * s}l4 16h-8z`} fill="#f43f5e" />
        </g>
      );
    case 'halo':
      return (
        <ellipse
          cx={x}
          cy={top - 6}
          rx="16"
          ry="4.5"
          fill="none"
          stroke="#facc15"
          strokeWidth="3.5"
        />
      );
    case 'flower':
      return (
        <g transform={`translate(${x + 18} ${top + 4})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx="0"
              cy="-5"
              rx="3.5"
              ry="5"
              fill="#f9a8d4"
              stroke={INK}
              strokeWidth="1"
              transform={`rotate(${a})`}
            />
          ))}
          <circle r="3" fill="#facc15" />
        </g>
      );
    case 'lightning':
      return (
        <path
          d={`M${x - 14} ${top + 2}l6 -16 4 8 6 -14 4 10 6 -10 2 22z`}
          fill="#fde047"
          stroke="#a16207"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      );
    case 'stethoscope':
      return (
        <g fill="none" stroke="#475569" strokeWidth="2.5">
          <path d={`M${x - 14} ${y + 14}q14 18 28 0`} />
          <circle cx={x + 14} cy={y + 30} r="5" fill="#94a3b8" />
          <path d={`M${x + 14} ${y + 14}v11`} />
        </g>
      );
  }
}

/** Renders any avatar as cute SVG art. Locked avatars can be shown as silhouettes. */
export function AvatarArt({
  avatar,
  size = 96,
  silhouette = false,
  animate = true,
}: {
  avatar: Avatar;
  size?: number;
  silhouette?: boolean;
  animate?: boolean;
}) {
  const d = drawBody(avatar.art);
  const moving = animate && avatar.animated && !silhouette;
  return (
    <svg
      width={size}
      height={size}
      viewBox="-4 -12 108 112"
      role="img"
      aria-label={silhouette ? 'Locked avatar' : avatar.name}
      style={silhouette ? { filter: 'brightness(0) opacity(0.55)' } : undefined}
      className={moving ? 'animate-float' : undefined}
    >
      {avatar.art.accessory === 'cape' && (
        <path
          d="M24 40L10 96h80L76 40z"
          fill="#dc2626"
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}
      {moving && avatar.rarity === 'legendary' && (
        <g>
          {[
            [8, 10],
            [92, 20],
            [6, 80],
            [94, 84],
          ].map(([x, y], i) => (
            <text key={i} x={x} y={y} fontSize="10" fill="#f59e0b">
              ✦
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="1.8s"
                begin={`${i * 0.45}s`}
                repeatCount="indefinite"
              />
            </text>
          ))}
        </g>
      )}
      {d.back}
      {d.shape}
      {!d.noFace && <Face {...d.face} />}
      <Accessory kind={avatar.art.accessory} face={d.face} top={d.top} accent={avatar.art.accent} />
    </svg>
  );
}
