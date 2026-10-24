import { AMBER, Callout, FIGURE_TEXT, INK, MARKER, MOSS, PINK, SOFT, at, type Pt } from './kit';

/** DNA replication at the fork: unzip, prime, build, seal. */

const CALLOUT = [
  ['Helicase unzips', 'the double helix'],
  ['Primase lays down', 'a short starter piece'],
  ['Polymerase adds', 'matching letters'],
  ['Ligase seals gaps:', 'one old strand,', 'one new strand'],
] as const;

export const REPLICATION_ALT = [
  'A double helix on the left is being unzipped at a fork by an enzyme called helicase. The two single strands curve apart to the right.',
  'Each separated strand now has a short pink starter piece, called a primer, at the fork.',
  'DNA polymerase is adding new matching letters along each old strand, so a pink new strand grows beside each one.',
  'Ligase has sealed the gaps. There are now two double helices, each made of one old strand and one new strand.',
] as const;

const TOP_OLD = 'M190 150C250 150 300 100 450 70';
const BOT_OLD = 'M190 190C250 190 300 240 450 270';
const TOP_NEW = 'M200 164C250 164 300 118 450 90';
const BOT_NEW = 'M200 176C250 176 300 222 450 250';
const GROW = [0, 9, 70, 100];

export function ReplicationFigure({ step }: { step: number }) {
  const s = Math.max(0, Math.min(3, step)) as 0 | 1 | 2 | 3;
  const rungs = Array.from({ length: 11 }, (_, i) => 30 + i * 15);
  const poly: [Pt, Pt] = [[338, 112], [338, 228]];
  return (
    <svg viewBox="0 0 480 340" role="img" aria-label={REPLICATION_ALT[s]} className="block h-auto w-full" {...FIGURE_TEXT}>
      <g aria-hidden>
        {/* The parent helix. */}
        <path d="M24 150H190M24 190H190" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        {rungs.map((x) => (
          <line key={x} x1={x} y1={152} x2={x} y2={188} stroke={SOFT} strokeWidth={2} opacity={0.6} />
        ))}
        {/* The old strands, pulled apart. */}
        <path d={TOP_OLD} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d={BOT_OLD} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* The new strands grow with the steps. */}
        {[TOP_NEW, BOT_NEW].map((d) => (
          <path
            key={d}
            d={d}
            pathLength={100}
            stroke={PINK.stroke}
            strokeWidth={s === 1 ? 7 : 4}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${GROW[s]} 100`}
            style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.22, 1, 0.36, 1), stroke-width 0.4s ease' }}
          />
        ))}
        {/* Helicase at the fork. */}
        <g transform="translate(190 170)">
          <circle r={17} fill="#bcd8b0" stroke={MOSS} strokeWidth={2.2} />
          <text y={36} textAnchor="middle" fontSize={13} fontWeight={600} fill={INK}>helicase</text>
        </g>
        {/* Polymerase rides the growing ends in step 3. */}
        {poly.map((p, i) => (
          <g key={i} style={{ ...at(p), opacity: s === 2 ? 1 : 0 }}>
            <circle r={14} fill={AMBER.fill} stroke={AMBER.stroke} strokeWidth={2} />
          </g>
        ))}
        <g style={{ opacity: s === 2 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <text x={338} y={90} textAnchor="middle" fontSize={12} fontWeight={600} fill={INK}>polymerase</text>
        </g>
        {/* Seals in step 4. */}
        <g style={{ opacity: s === 3 ? 1 : 0, transition: 'opacity 0.45s ease' }}>
          {([[286, 140], [286, 200]] as Pt[]).map((p) => (
            <circle key={p[1]} cx={p[0]} cy={p[1]} r={6} fill={MARKER} />
          ))}
          <text x={286} y={118} textAnchor="middle" fontSize={12} fontWeight={600} fill={INK}>ligase</text>
          <text x={440} y={54} textAnchor="end" fontSize={12} fill={SOFT}>old</text>
          <text x={440} y={112} textAnchor="end" fontSize={12} fontWeight={600} fill={PINK.text}>new</text>
        </g>
        <g style={{ opacity: s === 1 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <text x={226} y={140} fontSize={12} fontWeight={600} fill={PINK.text}>primer</text>
        </g>
        <Callout lines={CALLOUT[s]} x={14} y={36} />
      </g>
    </svg>
  );
}
