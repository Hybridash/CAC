import { AMBER, Callout, FIGURE_TEXT, INK, LEAF, MARKER, MOSS, PINK, SOFT, at } from './kit';

/** Transcription: find the gene, copy it, edit the copy, ship it out of the nucleus. */

const CALLOUT = [
  ['Factors mark the', 'start of the gene'],
  ['RNA polymerase', 'copies the gene', 'into RNA'],
  ['Cap and tail added;', 'introns cut out'],
  ['The finished mRNA', 'leaves the nucleus'],
] as const;

export const TRANSCRIPTION_ALT = [
  'A stretch of DNA inside the nucleus with a gene marked. Two small transcription factors sit at the start of the gene, the promoter.',
  'RNA polymerase has opened the DNA at the gene and is building a pink RNA strand that grows away from it.',
  'The RNA strand has a cap at one end and a tail at the other. A grey intron in the middle is being cut out between two green exons.',
  'The introns are gone and the exons are joined. The finished mRNA is passing through a pore in the nuclear envelope toward the cytoplasm.',
] as const;

export function TranscriptionFigure({ step }: { step: number }) {
  const s = Math.max(0, Math.min(3, step)) as 0 | 1 | 2 | 3;
  const rungs = Array.from({ length: 29 }, (_, i) => 22 + i * 15);
  const out = s === 3;
  return (
    <svg viewBox="0 0 480 340" role="img" aria-label={TRANSCRIPTION_ALT[s]} className="block h-auto w-full" {...FIGURE_TEXT}>
      <g aria-hidden>
        {/* Nuclear envelope with a pore. */}
        <path d="M10 112H296M344 112H470" stroke={MOSS} strokeWidth={5} strokeLinecap="round" strokeDasharray="1 0" />
        <path d="M296 108v8M344 108v8" stroke={MOSS} strokeWidth={5} strokeLinecap="round" />
        <text x={14} y={96} fontSize={13} fontWeight={600} fill={SOFT}>Cytoplasm</text>
        <text x={14} y={136} fontSize={13} fontWeight={600} fill={SOFT}>Nucleus</text>

        {/* DNA. */}
        <path d="M10 262H470M10 292H470" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        {rungs.map((x) => (
          <line key={x} x1={x} y1={265} x2={x} y2={289} stroke={SOFT} strokeWidth={2} opacity={0.55} />
        ))}
        {/* The gene. */}
        <path d="M120 316v8h250v-8" stroke={INK} strokeWidth={2} fill="none" />
        <text x={245} y={338} textAnchor="middle" fontSize={13} fontWeight={600} fill={INK}>gene</text>
        <text x={140} y={252} textAnchor="middle" fontSize={12} fill={SOFT} style={{ opacity: s === 0 ? 1 : 0 }}>promoter</text>

        {/* Step 1: transcription factors. */}
        <g style={{ opacity: s === 0 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          {[132, 156].map((x) => (
            <g key={x} transform={`translate(${x} 232)`}>
              <circle r={11} fill={AMBER.fill} stroke={AMBER.stroke} strokeWidth={1.8} />
              <text textAnchor="middle" y={4} fontSize={10} fontWeight={700} fill={AMBER.text}>TF</text>
            </g>
          ))}
        </g>

        {/* Step 2: the open bubble and the polymerase. */}
        <g style={{ opacity: s === 1 ? 1 : 0, transition: 'opacity 0.45s ease' }}>
          <rect x={206} y={266} width={60} height={22} rx={11} fill="#edf1e8" />
          <ellipse cx={236} cy={277} rx={38} ry={26} fill={AMBER.fill} stroke={AMBER.stroke} strokeWidth={2} opacity={0.9} />
          <text x={236} y={281} textAnchor="middle" fontSize={11} fontWeight={700} fill={AMBER.text}>RNA pol</text>
          <path d="M214 262C200 230 190 214 150 200" stroke={PINK.stroke} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M214 262C228 226 250 220 300 206" stroke={PINK.stroke} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.0} />
        </g>

        {/* Steps 3 and 4: the RNA, edited, then on its way out. */}
        <g style={{ ...at(out ? [118, -134] : [0, 0]), opacity: s >= 2 ? 1 : 0 }}>
          <circle cx={130} cy={196} r={7} fill={PINK.stroke} />
          <path d="M138 196H206" stroke={LEAF.stroke} strokeWidth={6} strokeLinecap="round" />
          <path
            d="M206 196H266"
            stroke="#8c9c98"
            strokeWidth={6}
            strokeLinecap="round"
            style={{ opacity: out ? 0 : 1, transition: 'opacity 0.45s ease' }}
          />
          <path
            d="M266 196H334"
            stroke={LEAF.stroke}
            strokeWidth={6}
            strokeLinecap="round"
            style={{ transform: `translateX(${out ? -60 : 0}px)`, transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
          <text
            x={338}
            y={201}
            fontSize={12}
            fontWeight={700}
            fill={PINK.text}
            style={{ transform: `translateX(${out ? -60 : 0}px)`, transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
          >
            AAAA
          </text>
        </g>
        <g style={{ opacity: s === 2 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <path d="M230 176l8 14M238 176l-8 14" stroke={MARKER} strokeWidth={2.6} strokeLinecap="round" />
          <text x={236} y={166} textAnchor="middle" fontSize={12} fontWeight={600} fill={INK}>intron</text>
          <text x={172} y={226} textAnchor="middle" fontSize={12} fontWeight={600} fill={LEAF.text}>exon</text>
          <text x={300} y={226} textAnchor="middle" fontSize={12} fontWeight={600} fill={LEAF.text}>exon</text>
        </g>
        <g style={{ opacity: out ? 1 : 0, transition: 'opacity 0.45s ease' }}>
          <text x={440} y={44} textAnchor="end" fontSize={13} fontWeight={600} fill={SOFT}>to the ribosome</text>
        </g>
        <Callout lines={CALLOUT[s]} x={316} y={s === 3 ? 224 : s === 2 ? 132 : 168} />
      </g>
    </svg>
  );
}
