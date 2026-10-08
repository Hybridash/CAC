import type { ShapeKind } from '@bioplay/shared';

/** Simple cartoon shapes used by data-driven scenes. Drawn in a 100×100 box. */
export function Shape({
  kind,
  color = '#60a5fa',
  size = 48,
}: {
  kind: ShapeKind;
  color?: string;
  size?: number;
}) {
  const stroke = 'rgba(30,27,46,0.55)';
  const common = { fill: color, stroke, strokeWidth: 4, strokeLinejoin: 'round' as const };
  let body: React.ReactNode;
  switch (kind) {
    case 'circle':
      body = <circle cx="50" cy="50" r="42" {...common} />;
      break;
    case 'blob':
      body = <path d="M50 8c22 0 40 14 40 38s-14 46-42 46S8 76 10 50 28 8 50 8z" {...common} />;
      break;
    case 'rod':
      body = <rect x="10" y="32" width="80" height="36" rx="18" {...common} />;
      break;
    case 'bean':
      body = (
        <g>
          <ellipse cx="50" cy="50" rx="44" ry="28" {...common} />
          <path
            d="M18 50c8-12 14 12 22 0s14 12 22 0 14 12 22 0"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />
        </g>
      );
      break;
    case 'chromosome':
      body = (
        <g>
          <path
            d="M30 10c8 0 12 30 20 40-8 10-12 40-20 40"
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M70 10c-8 0-12 30-20 40 8 10 12 40 20 40"
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
          />
          <circle cx="50" cy="50" r="6" fill={stroke} />
        </g>
      );
      break;
    case 'rect':
      body = <rect x="12" y="12" width="76" height="76" rx="12" {...common} />;
      break;
    case 'star':
      body = <path d="M50 6l12 28 30 3-23 20 7 30-26-16-26 16 7-30L8 37l30-3z" {...common} />;
      break;
    case 'triangle':
      body = <path d="M50 10l42 76H8z" {...common} />;
      break;
    case 'ring':
      body = (
        <circle
          cx="50"
          cy="50"
          r="44"
          fill={color}
          fillOpacity={0.12}
          stroke={color}
          strokeWidth="5"
          vectorEffect="non-scaling-stroke"
        />
      );
      break;
    case 'helix':
      body = (
        <g strokeWidth="7" fill="none" strokeLinecap="round">
          <path d="M30 6c40 15-40 29 0 44s-40 29 0 44" stroke={color} />
          <path d="M70 6c-40 15 40 29 0 44s40 29 0 44" stroke={stroke} />
          {[16, 32, 50, 68, 84].map((y) => (
            <path key={y} d={`M36 ${y}h28`} stroke={stroke} strokeWidth="3" />
          ))}
        </g>
      );
      break;
    case 'wave':
      body = (
        <path
          d="M6 50c11-24 22-24 33 0s22 24 33 0 22-24 22-8"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
        />
      );
      break;
    case 'spiky':
      body = (
        <g>
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={50 + Math.cos(a) * 30}
                y1={50 + Math.sin(a) * 30}
                x2={50 + Math.cos(a) * 46}
                y2={50 + Math.sin(a) * 46}
                stroke={stroke}
                strokeWidth="5"
                strokeLinecap="round"
              />
            );
          })}
          <circle cx="50" cy="50" r="32" {...common} />
        </g>
      );
      break;
    case 'leaf':
      body = <path d="M10 90C10 40 40 10 90 10c0 50-30 80-80 80zM10 90L60 40" {...common} />;
      break;
    case 'drop':
      body = <path d="M50 6C50 6 16 46 16 64a34 34 0 0068 0C84 46 50 6 50 6z" {...common} />;
      break;
    case 'heart':
      body = (
        <path d="M50 88S8 62 8 34A22 22 0 0150 22a22 22 0 0142 12c0 28-42 54-42 54z" {...common} />
      );
      break;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      {body}
    </svg>
  );
}
