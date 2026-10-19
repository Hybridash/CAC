import type { Concept, DiagramShape } from '../../types';
import { label, mc, predict } from '../concepts/helpers';
import { arrow, circle, diagram, ellipse, hs, path, rect, text } from './build';

const BASE_COLOR: Record<string, string> = {
  A: '#f87171',
  T: '#60a5fa',
  U: '#c084fc',
  G: '#4ade80',
  C: '#facc15',
};
const OLD = '#2563eb';
const NEW = '#f97316';

/** One rung of the DNA ladder: sugar–phosphate on each side, two bases and their hydrogen bonds. */
function rung(y: number, left: string, right: string): DiagramShape[] {
  const purine = (b: string) => b === 'A' || b === 'G';
  const mid = purine(left) ? 222 : 178;
  const bonds = left === 'G' || left === 'C' ? [-6, 0, 6] : [-4, 4];
  return [
    rect(92, y - 9, mid - 97, 18, BASE_COLOR[left], {
      r: 3,
      part: purine(left) ? 'purine' : 'pyrimidine',
    }),
    rect(mid + 5, y - 9, 308 - mid - 5, 18, BASE_COLOR[right], {
      r: 3,
      part: purine(right) ? 'purine' : 'pyrimidine',
    }),
    text((92 + mid - 5) / 2, y + 4, left, {
      bold: true,
      size: 11,
      part: purine(left) ? 'purine' : 'pyrimidine',
    }),
    text((mid + 5 + 308) / 2, y + 4, right, {
      bold: true,
      size: 11,
      part: purine(right) ? 'purine' : 'pyrimidine',
    }),
    ...bonds.map((d) =>
      path(`M${mid - 5} ${y + d} L${mid + 5} ${y + d}`, {
        stroke: '#0f172a',
        strokeWidth: 1.5,
        part: 'hbond',
      }),
    ),
    path(`M66 ${y - 9} L80 ${y - 14} L90 ${y - 2} L84 ${y + 10} L68 ${y + 8} Z`, {
      fill: '#fde68a',
      stroke: '#b45309',
      strokeWidth: 1.2,
      part: 'backbone',
    }),
    path(`M334 ${y - 9} L320 ${y - 14} L310 ${y - 2} L316 ${y + 10} L332 ${y + 8} Z`, {
      fill: '#fde68a',
      stroke: '#b45309',
      strokeWidth: 1.2,
      part: 'backbone',
    }),
    circle(52, y - 20, 7, '#cbd5e1', { stroke: '#475569', strokeWidth: 1.2, part: 'backbone' }),
    circle(348, y + 20, 7, '#cbd5e1', { stroke: '#475569', strokeWidth: 1.2, part: 'backbone' }),
    path(`M58 ${y - 16} L68 ${y - 8} M342 ${y + 16} L332 ${y + 8}`, {
      stroke: '#475569',
      strokeWidth: 1.5,
      part: 'backbone',
    }),
  ];
}

/** The double helix drawn as two sine waves, offset to show major and minor grooves. */
function helix(): DiagramShape[] {
  const y = (x: number, phase: number) =>
    120 + 48 * Math.sin(((x - 30) / 170) * 2 * Math.PI + phase);
  const strand = (phase: number) =>
    'M' +
    Array.from({ length: 69 }, (_, i) => 30 + i * 5)
      .map((x) => `${x} ${y(x, phase).toFixed(1)}`)
      .join(' L');
  const rungs = Array.from({ length: 21 }, (_, i) => 36 + i * 16).map((x, i) =>
    path(`M${x} ${y(x, 0).toFixed(1)} L${x} ${y(x, 2.3).toFixed(1)}`, {
      stroke: ['#f87171', '#60a5fa', '#4ade80', '#facc15'][i % 4],
      strokeWidth: 3,
      part: 'pairs',
    }),
  );
  return [
    ...rungs,
    path(strand(0), { stroke: '#2563eb', strokeWidth: 4, part: 'strands' }),
    path(strand(2.3), { stroke: '#e11d48', strokeWidth: 4, part: 'strands' }),
  ];
}

/** A row of codon boxes with optional amino acid labels underneath. */
function codonRow(
  x: number,
  y: number,
  codons: string[],
  aminos: string[],
  part: string,
  changed = -1,
): DiagramShape[] {
  return codons.flatMap((c, i) => [
    rect(x + i * 46, y, 42, 20, i === changed ? '#fde68a' : '#f1f5f9', {
      r: 4,
      stroke: i === changed ? '#d97706' : '#cbd5e1',
      part,
    }),
    text(x + i * 46 + 21, y + 14, c, { size: 10.5, bold: true, part }),
    text(x + i * 46 + 21, y + 32, aminos[i] ?? '', {
      size: 8.5,
      fill: aminos[i] === 'STOP' ? '#dc2626' : '#475569',
      bold: aminos[i] === 'STOP',
      part,
    }),
  ]);
}

export const dna: Concept[] = [
  hs({
    base: 'dna-structure',
    unit: 'dna',
    summary:
      'DNA is a double helix of two antiparallel strands of nucleotides. Sugar–phosphate backbones run along the outside, and complementary bases (A–T, G–C) pair in the middle with hydrogen bonds. The order of bases stores genetic information.',
    steps: [
      [
        'The double helix',
        'In 1953 Watson and Crick, using Rosalind Franklin’s X-ray images, showed that DNA is a double helix: two strands twisted around each other, about 2 nm wide, making a full turn every 10 base pairs.',
      ],
      [
        'Nucleotides',
        'Each strand is a polymer of nucleotides. A nucleotide = a phosphate group + deoxyribose (a 5-carbon sugar) + a nitrogenous base. Bases are purines (adenine, guanine: two rings) or pyrimidines (thymine, cytosine: one ring).',
      ],
      [
        'Complementary base pairing',
        'A pairs with T using two hydrogen bonds; G pairs with C using three. A purine always pairs with a pyrimidine, so the helix has a constant width. Chargaff’s rule follows: in DNA, %A = %T and %G = %C.',
      ],
      [
        'Antiparallel strands store information',
        'The strands run in opposite directions (5′→3′ and 3′→5′). Because each strand determines its partner, either can serve as a template for copying. The sequence of bases in a gene codes for the sequence of amino acids in a protein.',
      ],
    ],
    diagrams: [
      diagram(
        'DNA unwound: the ladder',
        'Five base pairs with the helix untwisted. Phosphates (gray) and deoxyribose sugars (yellow) form the sides; base pairs form the rungs.',
        [
          rect(38, 6, 186, 42, 'none', {
            r: 6,
            stroke: '#7c3aed',
            strokeWidth: 1.5,
            dash: true,
            part: 'nucleotide',
          }),
          ...rung(40, 'A', 'T'),
          ...rung(84, 'G', 'C'),
          ...rung(128, 'C', 'G'),
          ...rung(172, 'T', 'A'),
          ...rung(216, 'G', 'C'),
          path('M52 20 L52 236', { stroke: '#94a3b8', strokeWidth: 1, opacity: 0.6 }),
          path('M348 24 L348 240', { stroke: '#94a3b8', strokeWidth: 1, opacity: 0.6 }),
          text(30, 16, '5′', { bold: true, size: 12, fill: '#7c3aed', part: 'anti' }),
          text(30, 248, '3′', { bold: true, size: 12, fill: '#7c3aed', part: 'anti' }),
          text(372, 16, '3′', { bold: true, size: 12, fill: '#7c3aed', part: 'anti' }),
          text(372, 248, '5′', { bold: true, size: 12, fill: '#7c3aed', part: 'anti' }),
          arrow([20, 60], [20, 200], { stroke: '#7c3aed', strokeWidth: 1.5, part: 'anti' }),
          arrow([382, 200], [382, 60], { stroke: '#7c3aed', strokeWidth: 1.5, part: 'anti' }),
        ],
        [
          [
            'nucleotide',
            'One nucleotide',
            [234, 14],
            'Phosphate + deoxyribose sugar + base. Nucleotides link into a strand through sugar–phosphate bonds.',
          ],
          [
            'backbone',
            'Sugar–phosphate backbone',
            [52, 106],
            'Alternating sugars and phosphates joined by strong covalent (phosphodiester) bonds. The phosphates make DNA negatively charged.',
          ],
          [
            'purine',
            'Purines: A and G',
            [150, 62],
            'Larger bases with two rings (drawn longer here).',
          ],
          [
            'pyrimidine',
            'Pyrimidines: T and C',
            [262, 62],
            'Smaller bases with one ring. Each purine pairs with a pyrimidine, keeping the width constant.',
          ],
          [
            'hbond',
            'Hydrogen bonds',
            [200, 150],
            'Weak bonds between paired bases: 2 for A–T, 3 for G–C. Weak enough to unzip for copying, strong in large numbers. G–C-rich DNA is harder to separate.',
          ],
          [
            'anti',
            'Antiparallel strands',
            [388, 130],
            'One strand runs 5′→3′, the other 3′→5′ (the numbers refer to carbons in the sugar). Enzymes can only add nucleotides to the 3′ end.',
          ],
        ],
      ),
      diagram(
        'The double helix',
        'The two strands wind around a common axis. Because the backbones are not evenly spaced, the helix has a wide major groove and a narrow minor groove.',
        [
          ...helix(),
          path('M30 196 L200 196', { stroke: '#475569', strokeWidth: 1.5, part: 'turn' }),
          path('M30 190 L30 202 M200 190 L200 202', {
            stroke: '#475569',
            strokeWidth: 1.5,
            part: 'turn',
          }),
          text(115, 214, 'one turn = 3.4 nm = 10 base pairs', { size: 9.5, part: 'turn' }),
          path('M388 72 L388 168', { stroke: '#475569', strokeWidth: 1.5, part: 'width' }),
          path('M382 72 L394 72 M382 168 L394 168', {
            stroke: '#475569',
            strokeWidth: 1.5,
            part: 'width',
          }),
          text(394, 62, '2 nm', { anchor: 'end', size: 9.5, part: 'width' }),
          text(122, 40, 'major groove', { size: 9, fill: '#475569', part: 'grooves' }),
          text(262, 40, 'minor groove', { size: 9, fill: '#475569', part: 'grooves' }),
          text(
            200,
            244,
            'Proteins that switch genes on and off read the bases through the grooves.',
            { size: 8.5, fill: '#64748b', part: 'grooves' },
          ),
        ],
        [
          [
            'strands',
            'Two strands',
            [30, 60],
            'The backbones (blue and red) spiral around each other, like a twisted rope ladder.',
          ],
          [
            'pairs',
            'Base pairs',
            [200, 140],
            'The rungs: stacked base pairs inside the helix, protected from chemical damage.',
          ],
          [
            'grooves',
            'Major & minor grooves',
            [190, 36],
            'Uneven gaps between the backbones. Regulatory proteins fit into the major groove to recognize specific sequences.',
          ],
          [
            'turn',
            'One full turn',
            [216, 196],
            'About 10 base pairs per 3.4 nm. A human cell’s DNA would stretch about 2 m if unwound.',
          ],
          [
            'width',
            'Constant width',
            [364, 44],
            'About 2 nm everywhere, because each pair always has one purine and one pyrimidine.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Nucleotide', 'Monomer of DNA: phosphate + deoxyribose + base.'],
      ['Complementary base pairing', 'A pairs with T and G pairs with C.'],
      ['Antiparallel', 'Running in opposite directions (5′→3′ vs 3′→5′).'],
      ['Purine / pyrimidine', 'Double-ringed (A, G) vs single-ringed (T, C) bases.'],
      ['Chargaff’s rule', 'In DNA, the amount of A equals T and G equals C.'],
    ],
    goDeeper:
      'Rosalind Franklin’s “Photo 51,” an X-ray diffraction image, showed an X pattern that revealed a helix with a regular repeat. Combined with Chargaff’s base ratios and model building, it let Watson and Crick propose the structure in 1953. Franklin died in 1958; the 1962 Nobel Prize went to Watson, Crick and Wilkins.\n\nIn eukaryotes, DNA is packaged by wrapping around histone proteins to form nucleosomes (“beads on a string”), which coil further into chromatin and, during division, into compact chromosomes. Chemical tags on histones and DNA affect how tightly regions are packed, and so whether genes can be read.\n\nIn reality, it’s a bit more complicated: the helix described here is B-DNA, the common form in cells. DNA can also form other shapes (A-DNA and left-handed Z-DNA) depending on conditions and sequence.',
    quiz: [
      mc(
        'A DNA sample is 20% adenine. What percentage is guanine?',
        ['30%', '20%', '40%', '60%'],
        0,
        'A = T = 20%, so A + T = 40%. The remaining 60% is split equally between G and C: 30% each.',
      ),
      predict(
        'Two DNA molecules are the same length. Molecule X is 70% G–C pairs; molecule Y is 30% G–C pairs. Both are heated slowly.',
        'Which separates into single strands at the lower temperature?',
        [
          'Y, because A–T pairs have fewer hydrogen bonds',
          'X, because G–C pairs are weaker',
          'Both at exactly the same temperature',
          'Neither; heat can’t separate DNA',
        ],
        0,
        'G–C pairs have three hydrogen bonds versus two for A–T, so G–C-rich DNA needs more energy to unzip.',
      ),
      label(
        'Match each part of DNA to its description.',
        [
          ['Deoxyribose', 'Five-carbon sugar in the backbone'],
          ['Phosphate group', 'Links sugars, gives DNA its negative charge'],
          ['Hydrogen bonds', 'Hold complementary bases together'],
          ['Purine', 'Double-ringed base such as adenine'],
        ],
        'Strong covalent bonds make the backbone; weak hydrogen bonds join the strands.',
      ),
    ],
  }),

  hs({
    base: 'dna-replication',
    unit: 'dna',
    summary:
      'DNA replication is semi-conservative: each new molecule has one old and one new strand. Helicase unzips the helix, primase lays down RNA primers, DNA polymerase builds new strands 5′→3′ (continuously on the leading strand, in Okazaki fragments on the lagging strand) and ligase seals the gaps.',
    steps: [
      [
        'Unwinding at the fork',
        'Replication starts at origins of replication. Helicase breaks the hydrogen bonds between bases, opening a replication fork. Single-strand binding proteins keep the strands apart, and topoisomerase relieves the twisting strain ahead of the fork.',
      ],
      [
        'Primers',
        'DNA polymerase can’t start a strand from nothing; it can only extend one. Primase builds a short RNA primer (about 10 nucleotides) complementary to the template, giving polymerase a 3′ end to build from.',
      ],
      [
        'Leading and lagging strands',
        'DNA polymerase adds nucleotides only to the 3′ end, so new DNA grows 5′→3′. On the leading strand it builds continuously toward the fork. On the lagging strand it works away from the fork in short Okazaki fragments, each needing its own primer. Polymerase also proofreads, fixing most mistakes.',
      ],
      [
        'Finishing up',
        'The RNA primers are removed and replaced with DNA, and DNA ligase joins the fragments into one continuous strand. Each daughter molecule has one parental strand and one new strand (semi-conservative replication).',
      ],
    ],
    diagrams: [
      diagram(
        'The replication fork',
        'Blue strands are the parent DNA; orange strands are new. The fork moves to the right as helicase unzips the helix.',
        [
          ...Array.from({ length: 8 }, (_, i) =>
            path(`M${268 + i * 16} 118 L${268 + i * 16} 142`, {
              stroke: '#cbd5e1',
              strokeWidth: 3,
            }),
          ),
          path('M260 118 L392 118', { stroke: OLD, strokeWidth: 4 }),
          path('M260 142 L392 142', { stroke: OLD, strokeWidth: 4 }),
          path('M24 64 L200 64 Q236 64 256 118', { stroke: OLD, strokeWidth: 4, part: 'leading' }),
          path('M24 196 L200 196 Q236 196 256 142', {
            stroke: OLD,
            strokeWidth: 4,
            part: 'lagging',
          }),
          text(14, 68, '3′', { size: 10, bold: true, fill: OLD }),
          text(14, 200, '5′', { size: 10, bold: true, fill: OLD }),
          text(396, 112, '5′', { anchor: 'end', size: 10, bold: true, fill: OLD }),
          text(396, 158, '3′', { anchor: 'end', size: 10, bold: true, fill: OLD }),
          path('M30 78 L188 78', { stroke: NEW, strokeWidth: 4, part: 'leading' }),
          arrow([180, 78], [200, 78], { stroke: NEW, strokeWidth: 4, part: 'leading' }),
          rect(30, 76, 14, 5, '#dc2626', { part: 'primer' }),
          ellipse(206, 84, 16, 11, '#a78bfa', { stroke: '#6d28d9', part: 'pol' }),
          path('M60 182 L104 182', { stroke: NEW, strokeWidth: 4, part: 'lagging' }),
          path('M112 182 L160 182', { stroke: NEW, strokeWidth: 4, part: 'lagging' }),
          path('M170 182 L214 182', { stroke: NEW, strokeWidth: 4, part: 'lagging' }),
          arrow([110, 182], [70, 182], { stroke: NEW, strokeWidth: 4, part: 'lagging' }),
          rect(150, 180, 12, 5, '#dc2626', { part: 'primer' }),
          rect(204, 180, 12, 5, '#dc2626', { part: 'primer' }),
          rect(96, 180, 10, 5, '#dc2626', { part: 'primer' }),
          ellipse(168, 174, 14, 10, '#a78bfa', { stroke: '#6d28d9', part: 'pol' }),
          circle(108, 182, 6, '#34d399', { stroke: '#047857', part: 'ligase' }),
          ellipse(226, 168, 11, 8, '#fca5a5', { stroke: '#b91c1c', part: 'primer' }),
          circle(256, 130, 13, '#fde047', { stroke: '#a16207', strokeWidth: 2, part: 'helicase' }),
          circle(256, 130, 5, '#fff', { part: 'helicase' }),
          ellipse(330, 130, 14, 20, '#fdba74', { stroke: '#c2410c', opacity: 0.85, part: 'topo' }),
          ...[
            [220, 98],
            [232, 110],
            [222, 162],
            [234, 150],
          ].map(([x, y]) =>
            circle(x, y, 4, '#e2e8f0', { stroke: '#64748b', strokeWidth: 1, part: 'ssb' }),
          ),
          arrow([300, 34], [370, 34], { stroke: '#475569', strokeWidth: 2 }),
          text(336, 26, 'fork moves', { size: 9, fill: '#475569' }),
          text(110, 100, 'leading strand (continuous)', {
            size: 9,
            bold: true,
            fill: '#c2410c',
            part: 'leading',
          }),
          text(120, 218, 'lagging strand (Okazaki fragments)', {
            size: 9,
            bold: true,
            fill: '#c2410c',
            part: 'lagging',
          }),
        ],
        [
          [
            'helicase',
            'Helicase',
            [272, 104],
            'Unzips the double helix by breaking hydrogen bonds between base pairs.',
          ],
          [
            'topo',
            'Topoisomerase',
            [352, 104],
            'Cuts and rejoins DNA ahead of the fork to release the strain of unwinding.',
          ],
          [
            'ssb',
            'Single-strand binding proteins',
            [244, 86],
            'Coat the exposed strands so they don’t snap back together.',
          ],
          [
            'primer',
            'Primase & RNA primers (red)',
            [228, 186],
            'Primase (pink) makes short RNA primers so polymerase has a 3′ end to extend.',
          ],
          [
            'pol',
            'DNA polymerase',
            [222, 64],
            'Adds complementary nucleotides to the 3′ end of the new strand and proofreads, making only about 1 error per billion bases after repair.',
          ],
          [
            'leading',
            'Leading strand',
            [30, 46],
            'Built continuously toward the fork, because its template runs 3′→5′ in that direction.',
          ],
          [
            'lagging',
            'Lagging strand',
            [30, 218],
            'Built in short Okazaki fragments, away from the fork, because polymerase can only work 5′→3′.',
          ],
          [
            'ligase',
            'DNA ligase',
            [92, 166],
            'Seals the gaps between Okazaki fragments (after primers are replaced) into one continuous strand.',
          ],
        ],
      ),
      diagram(
        'Semi-conservative replication',
        'After each round, every DNA molecule keeps one strand from its parent. Meselson and Stahl confirmed this in 1958 using heavy and light nitrogen.',
        [
          path('M50 50 L50 200', { stroke: OLD, strokeWidth: 6, part: 'parent' }),
          path('M66 50 L66 200', { stroke: OLD, strokeWidth: 6, part: 'parent' }),
          text(58, 226, 'Parent', { bold: true, part: 'parent' }),
          arrow([84, 125], [124, 90], { strokeWidth: 2 }),
          arrow([84, 125], [124, 160], { strokeWidth: 2 }),
          ...[50, 140].flatMap((y) => [
            path(`M146 ${y + 10} L146 ${y + 70}`, { stroke: OLD, strokeWidth: 6, part: 'gen1' }),
            path(`M162 ${y + 10} L162 ${y + 70}`, { stroke: NEW, strokeWidth: 6, part: 'gen1' }),
          ]),
          text(154, 226, '1st generation', { bold: true, part: 'gen1' }),
          text(154, 240, 'all hybrid', { size: 9, fill: '#475569', part: 'gen1' }),
          arrow([180, 90], [230, 46], { strokeWidth: 2 }),
          arrow([180, 90], [230, 98], { strokeWidth: 2 }),
          arrow([180, 180], [230, 152], { strokeWidth: 2 }),
          arrow([180, 180], [230, 204], { strokeWidth: 2 }),
          ...[
            [26, OLD],
            [80, NEW],
            [134, NEW],
            [188, OLD],
          ].flatMap(([y, c]) => [
            path(`M252 ${y as number} L252 ${(y as number) + 34}`, {
              stroke: c as string,
              strokeWidth: 6,
              part: c === OLD ? 'gen2hybrid' : 'gen2new',
            }),
            path(`M268 ${y as number} L268 ${(y as number) + 34}`, {
              stroke: NEW,
              strokeWidth: 6,
              part: c === OLD ? 'gen2hybrid' : 'gen2new',
            }),
          ]),
          text(260, 236, '2nd generation', { bold: true, part: 'gen2hybrid' }),
          text(260, 250, 'half hybrid, half new', { size: 9, fill: '#475569', part: 'gen2new' }),
          rect(300, 60, 92, 70, '#f8fafc', { r: 8, stroke: '#e2e8f0' }),
          path('M312 80 L332 80', { stroke: OLD, strokeWidth: 6 }),
          text(338, 84, 'old strand', { anchor: 'start', size: 9 }),
          path('M312 108 L332 108', { stroke: NEW, strokeWidth: 6 }),
          text(338, 112, 'new strand', { anchor: 'start', size: 9 }),
        ],
        [
          [
            'parent',
            'Parent molecule',
            [30, 40],
            'Both strands are “old.” Each one will act as a template.',
          ],
          [
            'gen1',
            'First generation',
            [186, 124],
            'Two molecules, each with one old and one new strand. Meselson and Stahl saw a single “hybrid” band of intermediate density.',
          ],
          [
            'gen2hybrid',
            'Hybrid molecules',
            [290, 52],
            'The two original strands are still present, each paired with a new partner.',
          ],
          [
            'gen2new',
            'All-new molecules',
            [290, 146],
            'Made by copying new strands. The original strands are never broken up or lost.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Semi-conservative', 'Each new DNA molecule has one old and one new strand.'],
      ['Helicase', 'Enzyme that unwinds and unzips DNA.'],
      ['DNA polymerase', 'Enzyme that adds nucleotides to build a new strand, 5′→3′.'],
      ['Okazaki fragments', 'Short pieces of DNA made on the lagging strand.'],
      ['DNA ligase', 'Enzyme that joins DNA fragments together.'],
      ['Primer', 'Short RNA strand that gives polymerase a starting point.'],
    ],
    goDeeper:
      'Human chromosomes are so long that replication starts at thousands of origins at once, forming “bubbles” that grow in both directions and merge. Even so, copying all 6 billion base pairs takes several hours during S phase.\n\nThe ends of linear chromosomes pose a problem: when the last primer on the lagging strand is removed, there is no way to fill the gap, so chromosomes shorten slightly with each division. Telomeres (repeats of TTAGGG) act as disposable caps. Stem cells and most cancer cells use the enzyme telomerase to rebuild them, which is one reason cancer cells can divide indefinitely.\n\nIn reality, it’s a bit more complicated: eukaryotes use several DNA polymerases with different jobs, and the leading and lagging strand polymerases work together in one large complex (the replisome), with the lagging strand looping around so both move in the same physical direction.',
    quiz: [
      mc(
        'Why is the lagging strand made in fragments?',
        [
          'DNA polymerase can only add nucleotides to a 3′ end, so it must work away from the fork on that strand',
          'Helicase only unzips small pieces at a time',
          'The lagging strand is made of RNA',
          'Ligase cuts it into pieces',
        ],
        0,
        'Synthesis is always 5′→3′. On the lagging strand that direction points away from the fork, so polymerase restarts repeatedly.',
      ),
      predict(
        'Bacteria are grown on heavy nitrogen (¹⁵N) for many generations, then moved to light nitrogen (¹⁴N) and allowed to replicate twice.',
        'If replication is semi-conservative, what DNA is found after the second round?',
        [
          'Half hybrid (¹⁵N/¹⁴N) and half light (¹⁴N/¹⁴N)',
          'All hybrid',
          'Half heavy and half light',
          'All light',
        ],
        0,
        'This is the Meselson–Stahl result. The two original heavy strands each stay paired with a light strand, and all other molecules are fully light.',
      ),
      label(
        'Match each enzyme to its job.',
        [
          ['Helicase', 'Unzips the double helix'],
          ['Primase', 'Lays down an RNA primer'],
          ['DNA polymerase', 'Adds complementary nucleotides'],
          ['Ligase', 'Joins Okazaki fragments'],
        ],
        'Replication is a team effort of specialized enzymes.',
      ),
    ],
  }),

  hs({
    base: 'transcription',
    unit: 'dna',
    summary:
      'Transcription copies a gene’s DNA into RNA. RNA polymerase binds the promoter, reads the template strand and builds a complementary mRNA 5′→3′. In eukaryotes, the pre-mRNA gets a cap and tail and has its introns spliced out before leaving the nucleus.',
    steps: [
      [
        'Initiation at the promoter',
        'Transcription factors bind the promoter, a DNA sequence just before the gene (often containing a TATA box), and recruit RNA polymerase. Which genes are transcribed, and when, is the main way cells control gene expression.',
      ],
      [
        'Elongation',
        'RNA polymerase unwinds a short stretch of DNA and reads the template strand 3′→5′, adding complementary RNA nucleotides to the growing mRNA’s 3′ end. RNA uses uracil (U) in place of thymine, so A in the template gives U in the RNA.',
      ],
      [
        'RNA processing',
        'The pre-mRNA is modified: a 5′ cap (modified guanine) and a 3′ poly-A tail protect it and help ribosomes bind. The spliceosome cuts out introns (non-coding sequences) and joins exons (coding sequences) together.',
      ],
      [
        'Export to the cytoplasm',
        'When polymerase reaches a terminator sequence, it releases the RNA. The mature mRNA leaves through a nuclear pore to the ribosomes in the cytoplasm. Only the template strand is read; the other (coding) strand has the same sequence as the mRNA, with T instead of U.',
      ],
    ],
    diagrams: [
      diagram(
        'Transcription in action',
        'RNA polymerase moves along a gene, opening a bubble of DNA and building mRNA from the template strand.',
        [
          path('M18 108 L170 108 Q190 108 200 84 Q215 70 230 84 Q240 108 262 108 L384 108', {
            stroke: '#2563eb',
            strokeWidth: 4,
            part: 'coding',
          }),
          path('M18 132 L170 132 Q190 132 200 156 Q215 170 230 156 Q240 132 262 132 L384 132', {
            stroke: '#0f766e',
            strokeWidth: 4,
            part: 'template',
          }),
          ...Array.from({ length: 9 }, (_, i) =>
            path(`M${26 + i * 16} 110 L${26 + i * 16} 130`, { stroke: '#cbd5e1', strokeWidth: 3 }),
          ),
          ...Array.from({ length: 7 }, (_, i) =>
            path(`M${274 + i * 16} 110 L${274 + i * 16} 130`, {
              stroke: '#cbd5e1',
              strokeWidth: 3,
            }),
          ),
          rect(36, 98, 70, 44, '#fef3c7', { r: 6, opacity: 0.7, part: 'promoter' }),
          text(71, 92, 'promoter', { size: 9, bold: true, fill: '#92400e', part: 'promoter' }),
          circle(54, 146, 8, '#fb923c', { stroke: '#c2410c', part: 'tf' }),
          circle(72, 150, 7, '#fdba74', { stroke: '#c2410c', part: 'tf' }),
          rect(330, 98, 46, 44, '#fee2e2', { r: 6, opacity: 0.7, part: 'terminator' }),
          text(353, 92, 'terminator', { size: 9, bold: true, fill: '#b91c1c', part: 'terminator' }),
          ellipse(214, 120, 58, 48, '#c4b5fd', {
            opacity: 0.45,
            stroke: '#6d28d9',
            strokeWidth: 2,
            part: 'polymerase',
          }),
          path('M240 150 L210 150 Q160 170 130 210 Q118 228 92 236', {
            stroke: '#a855f7',
            strokeWidth: 4,
            part: 'mrna',
          }),
          ...[
            [222, 150],
            [234, 150],
          ].map(([x, y]) =>
            path(`M${x} ${y - 2} L${x} ${y - 10}`, {
              stroke: '#a855f7',
              strokeWidth: 2,
              part: 'mrna',
            }),
          ),
          text(80, 242, '5′', { bold: true, size: 10, fill: '#7e22ce', part: 'mrna' }),
          text(156, 228, 'mRNA', { bold: true, size: 10, fill: '#7e22ce', part: 'mrna' }),
          arrow([180, 30], [250, 30], { stroke: '#6d28d9', strokeWidth: 2.5, part: 'polymerase' }),
          text(215, 22, 'direction of transcription', {
            size: 9,
            fill: '#6d28d9',
            part: 'polymerase',
          }),
          text(276, 100, 'coding strand', {
            anchor: 'start',
            size: 8.5,
            fill: '#1d4ed8',
            part: 'coding',
          }),
          text(270, 148, 'template strand', {
            anchor: 'start',
            size: 8.5,
            fill: '#0f766e',
            part: 'template',
          }),
        ],
        [
          [
            'promoter',
            'Promoter',
            [36, 70],
            'A DNA sequence that marks where a gene starts and which strand to read. Polymerase binds here.',
          ],
          [
            'tf',
            'Transcription factors',
            [92, 160],
            'Proteins that bind the promoter and help RNA polymerase attach. Different cells make different factors, so they express different genes.',
          ],
          [
            'polymerase',
            'RNA polymerase',
            [272, 62],
            'Unwinds about 10–20 base pairs at a time and joins RNA nucleotides complementary to the template, 5′→3′, without needing a primer.',
          ],
          [
            'template',
            'Template strand',
            [282, 162],
            'The strand that is read (3′→5′). The mRNA is complementary to it.',
          ],
          [
            'coding',
            'Coding strand',
            [130, 92],
            'The non-template strand. Its sequence matches the mRNA, except DNA has T where RNA has U.',
          ],
          [
            'mrna',
            'Growing mRNA',
            [116, 196],
            'Peels away from the DNA as it is made, so the DNA zips back up behind the polymerase.',
          ],
          [
            'terminator',
            'Terminator',
            [384, 154],
            'A sequence that signals the end of the gene; polymerase releases the RNA and the DNA.',
          ],
        ],
      ),
      diagram(
        'Processing pre-mRNA',
        'In eukaryotes, the first RNA copy (pre-mRNA) is edited in the nucleus before it is translated.',
        [
          text(14, 44, 'pre-mRNA', { anchor: 'start', size: 9, bold: true, fill: '#475569' }),
          circle(30, 66, 9, '#f472b6', { stroke: '#be185d', part: 'cap' }),
          rect(42, 56, 60, 20, '#86efac', { r: 4, stroke: '#15803d', part: 'exon' }),
          rect(102, 56, 50, 20, '#e2e8f0', { r: 4, stroke: '#94a3b8', part: 'intron' }),
          rect(152, 56, 60, 20, '#86efac', { r: 4, stroke: '#15803d', part: 'exon' }),
          rect(212, 56, 50, 20, '#e2e8f0', { r: 4, stroke: '#94a3b8', part: 'intron' }),
          rect(262, 56, 60, 20, '#86efac', { r: 4, stroke: '#15803d', part: 'exon' }),
          text(350, 70, 'AAAAA', { size: 10, bold: true, fill: '#b45309', part: 'tail' }),
          ...['Exon 1', 'Intron', 'Exon 2', 'Intron', 'Exon 3'].map((t, i) =>
            text(72 + [0, 55, 110, 165, 220][i], 70, t, {
              size: 8.5,
              bold: true,
              part: i % 2 ? 'intron' : 'exon',
            }),
          ),
          path('M110 80 Q127 112 144 80', {
            stroke: '#94a3b8',
            strokeWidth: 2,
            dash: true,
            part: 'splice',
          }),
          path('M220 80 Q237 112 254 80', {
            stroke: '#94a3b8',
            strokeWidth: 2,
            dash: true,
            part: 'splice',
          }),
          ellipse(127, 112, 14, 10, '#fde68a', { stroke: '#a16207', part: 'splice' }),
          ellipse(237, 112, 14, 10, '#fde68a', { stroke: '#a16207', part: 'splice' }),
          arrow([180, 126], [180, 156], { strokeWidth: 2.5, part: 'splice' }),
          text(186, 146, 'splicing', {
            anchor: 'start',
            size: 9,
            bold: true,
            fill: '#a16207',
            part: 'splice',
          }),
          text(14, 170, 'mature mRNA', {
            anchor: 'start',
            size: 9,
            bold: true,
            fill: '#475569',
            part: 'mature',
          }),
          circle(66, 192, 9, '#f472b6', { stroke: '#be185d', part: 'cap' }),
          rect(78, 182, 60, 20, '#86efac', { r: 4, stroke: '#15803d', part: 'mature' }),
          rect(138, 182, 60, 20, '#86efac', { r: 4, stroke: '#15803d', part: 'mature' }),
          rect(198, 182, 60, 20, '#86efac', { r: 4, stroke: '#15803d', part: 'mature' }),
          text(108, 196, 'Exon 1', { size: 8.5, bold: true, part: 'mature' }),
          text(168, 196, 'Exon 2', { size: 8.5, bold: true, part: 'mature' }),
          text(228, 196, 'Exon 3', { size: 8.5, bold: true, part: 'mature' }),
          text(286, 196, 'AAAAA', { size: 10, bold: true, fill: '#b45309', part: 'tail' }),
          path('M334 160 L334 228', { stroke: '#64748b', strokeWidth: 3, part: 'export' }),
          path('M334 184 L334 200', { stroke: '#fff', strokeWidth: 5, part: 'export' }),
          arrow([318, 192], [372, 192], { stroke: '#7e22ce', strokeWidth: 2.5, part: 'export' }),
          text(366, 226, 'to cytoplasm', { size: 9, fill: '#475569', part: 'export' }),
          text(334, 152, 'nuclear pore', { size: 8.5, fill: '#475569', part: 'export' }),
        ],
        [
          [
            'cap',
            '5′ cap',
            [30, 88],
            'A modified guanine added to the front. It protects mRNA from enzymes and helps the ribosome find the start.',
          ],
          [
            'exon',
            'Exons',
            [72, 40],
            'Expressed sequences: the parts that code for the protein and are kept.',
          ],
          [
            'intron',
            'Introns',
            [127, 40],
            'Intervening sequences that are removed. Most of a typical human gene is intron.',
          ],
          [
            'splice',
            'Spliceosome',
            [270, 118],
            'RNA–protein complexes that cut out each intron (as a loop) and join the exons.',
          ],
          [
            'tail',
            'Poly-A tail',
            [380, 56],
            'A chain of 100–250 adenines added to the 3′ end, protecting the mRNA and helping export.',
          ],
          ['mature', 'Mature mRNA', [54, 216], 'Cap + joined exons + tail: ready for translation.'],
          [
            'export',
            'Export through a nuclear pore',
            [360, 162],
            'Only processed mRNA is allowed out of the nucleus to the ribosomes.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Transcription', 'Making an RNA copy of a gene.'],
      ['RNA polymerase', 'Enzyme that builds RNA from a DNA template.'],
      ['Promoter', 'DNA sequence where RNA polymerase binds to start transcription.'],
      ['Intron / exon', 'Non-coding sequences removed vs coding sequences kept in mRNA.'],
      ['Uracil (U)', 'RNA’s base in place of thymine; pairs with adenine.'],
    ],
    goDeeper:
      'Alternative splicing lets one gene make several proteins: different combinations of exons are kept in different cells. This is one reason humans have only about 20,000 protein-coding genes but make far more distinct proteins.\n\nBacteria do things differently. They have no nucleus, so transcription and translation happen in the same place at the same time: ribosomes start reading an mRNA while it is still being made. Bacterial genes usually have no introns, and related genes are often transcribed together as an operon (like the lac operon).\n\nIn reality, it’s a bit more complicated: eukaryotes have three RNA polymerases (for rRNA, mRNA and tRNA and other small RNAs), and enhancer sequences thousands of bases away from a gene can loop around to boost its transcription.',
    quiz: [
      mc(
        'A template strand reads 3′-TACGGA-5′. What is the mRNA sequence?',
        ['5′-AUGCCU-3′', '5′-ATGCCT-3′', '5′-UACGGA-3′', '5′-TACGGA-3′'],
        0,
        'Pair each base: T→A, A→U, C→G, G→C. RNA uses U instead of T, and it runs antiparallel to the template.',
      ),
      predict(
        'A mutation destroys a gene’s promoter sequence.',
        'What is the most likely result?',
        [
          'The gene is no longer transcribed, so its protein isn’t made',
          'The protein has one wrong amino acid',
          'The mRNA is made but has no cap',
          'The gene is transcribed faster',
        ],
        0,
        'Without a promoter, transcription factors and RNA polymerase can’t bind, so no mRNA is made.',
      ),
      label(
        'Match each RNA-processing step to its purpose.',
        [
          ['5′ cap', 'Helps the ribosome bind; protects the 5′ end'],
          ['Poly-A tail', 'Protects the 3′ end and aids export'],
          ['Splicing', 'Removes introns and joins exons'],
        ],
        'Processing turns pre-mRNA into mature mRNA.',
      ),
    ],
  }),

  hs({
    base: 'translation',
    unit: 'dna',
    summary:
      'Protein synthesis turns a gene into a protein in two steps: transcription (DNA → mRNA, in the nucleus) and translation (mRNA → protein, at ribosomes). Ribosomes read mRNA codons, tRNAs bring matching amino acids, and peptide bonds link them until a stop codon is reached.',
    steps: [
      [
        'The central dogma',
        'Information flows DNA → RNA → protein. A gene is a DNA sequence that codes for a polypeptide; its base sequence determines the protein’s amino acid sequence, which determines its shape and function.',
      ],
      [
        'Transcription',
        'In the nucleus, RNA polymerase uses the gene’s template strand to build complementary mRNA (A–U, T–A, G–C, C–G). After processing, the mRNA travels to a ribosome in the cytoplasm or on the rough ER.',
      ],
      [
        'Codons and the ribosome',
        'The ribosome (a small and a large subunit made of rRNA and protein) reads mRNA three bases at a time. Each codon specifies one amino acid. Translation starts at AUG, which codes for methionine.',
      ],
      [
        'tRNA and anticodons',
        'Each tRNA carries a specific amino acid and has an anticodon complementary to a codon. tRNAs enter the A site, the growing chain sits on the tRNA in the P site, and empty tRNAs leave from the E site. The ribosome joins amino acids with peptide bonds.',
      ],
      [
        'Termination and folding',
        'A stop codon (UAA, UAG or UGA) has no matching tRNA. A release factor binds instead, the polypeptide is released and the ribosome separates. The chain then folds, sometimes with help, into its working shape.',
      ],
      [
        'One base can matter',
        'Because the code is read in triplets, changing one base can change one amino acid (missense), create an early stop (nonsense), or do nothing (silent, thanks to the code’s redundancy). In sickle cell disease, one base change swaps glutamic acid for valine.',
      ],
    ],
    diagrams: [
      diagram(
        'Translation at the ribosome',
        'The ribosome has three tRNA sites: A (arrival), P (peptide chain) and E (exit). Here it is adding the 8th amino acid.',
        [
          ellipse(200, 210, 108, 22, '#bae6fd', {
            stroke: '#0284c7',
            strokeWidth: 2,
            part: 'small',
          }),
          ellipse(200, 126, 116, 62, '#bfdbfe', {
            stroke: '#2563eb',
            strokeWidth: 2,
            opacity: 0.55,
            part: 'large',
          }),
          ...[
            'AUG',
            'ACC',
            'GGU',
            'UGC',
            'AAA',
            'GCU',
            'UUC',
            'GAA',
            'UGG',
            'CAU',
            'UAA',
            'GCA',
            'A',
          ].map((_, i) =>
            rect(5 + i * 30, 198, 29, 18, i === 0 ? '#bbf7d0' : i === 10 ? '#fecaca' : '#ede9fe', {
              r: 3,
              stroke: '#7c3aed',
              strokeWidth: 1,
              part: i === 0 ? 'start' : i === 10 ? 'stop' : 'mrna',
            }),
          ),
          ...[
            'AUG',
            'ACC',
            'GGU',
            'UGC',
            'AAA',
            'GCU',
            'UUC',
            'GAA',
            'UGG',
            'CAU',
            'UAA',
            'GCA',
          ].map((c, i) =>
            text(19.5 + i * 30, 211, c, {
              size: 8.5,
              bold: true,
              part: i === 0 ? 'start' : i === 10 ? 'stop' : 'mrna',
            }),
          ),
          text(4, 232, '5′', {
            anchor: 'start',
            size: 10,
            bold: true,
            fill: '#7c3aed',
            part: 'mrna',
          }),
          text(396, 232, '3′', {
            anchor: 'end',
            size: 10,
            bold: true,
            fill: '#7c3aed',
            part: 'mrna',
          }),
          ...[
            [170, 'CGA', 'etrna', '#e2e8f0'],
            [200, 'AAG', 'ptrna', '#fde68a'],
            [230, 'CUU', 'atrna', '#bbf7d0'],
          ].flatMap(([x, ac, part, fill]) => [
            path(
              `M${(x as number) - 11} 124 L${(x as number) + 11} 124 L${(x as number) + 11} 176 Q${x} 184 ${(x as number) - 11} 176 Z`,
              {
                fill: fill as string,
                stroke: '#475569',
                strokeWidth: 1.5,
                part: part as string,
              },
            ),
            text(x as number, 190, ac as string, {
              size: 8,
              bold: true,
              fill: '#be123c',
              part: part as string,
            }),
          ]),
          circle(230, 110, 9, '#4ade80', { stroke: '#15803d', part: 'atrna' }),
          text(230, 113, 'Glu', { size: 7, bold: true, part: 'atrna' }),
          ...['Phe', 'Ala', 'Lys', 'Cys', 'Gly', 'Thr', 'Met']
            .map((aa, i) => [
              circle(200 - i * 17, 110 - i * 13, 9, i === 6 ? '#fbbf24' : '#fca5a5', {
                stroke: '#b91c1c',
                part: 'peptide',
              }),
              text(200 - i * 17, 113 - i * 13, aa, { size: 7, bold: true, part: 'peptide' }),
            ])
            .flat(),
          path('M209 110 L221 110', {
            stroke: '#b91c1c',
            strokeWidth: 2,
            dash: true,
            part: 'peptide',
          }),
          ...['E', 'P', 'A'].map((s, i) =>
            text(170 + i * 30, 248, s, {
              size: 12,
              bold: true,
              fill: '#1d4ed8',
              part: ['etrna', 'ptrna', 'atrna'][i],
            }),
          ),
          arrow([300, 30], [360, 30], { stroke: '#475569', strokeWidth: 2 }),
          text(330, 22, 'ribosome moves 5′→3′', { size: 8.5, fill: '#475569' }),
        ],
        [
          [
            'mrna',
            'mRNA codons',
            [340, 186],
            'Read three bases at a time, in one reading frame set by the start codon.',
          ],
          [
            'start',
            'Start codon (AUG)',
            [20, 180],
            'Codes for methionine and sets the reading frame. Every protein starts with Met (often removed later).',
          ],
          [
            'small',
            'Small subunit',
            [96, 230],
            'Binds the mRNA and checks that codon and anticodon match.',
          ],
          [
            'large',
            'Large subunit',
            [300, 92],
            'Holds the A, P and E sites; its rRNA catalyzes peptide bond formation (it is a ribozyme).',
          ],
          [
            'atrna',
            'A site: incoming tRNA',
            [256, 142],
            'A tRNA with anticodon CUU pairs with codon GAA and delivers glutamic acid.',
          ],
          [
            'ptrna',
            'P site: tRNA holding the chain',
            [200, 140],
            'The growing polypeptide is transferred to the new amino acid in the A site, then the ribosome shifts one codon.',
          ],
          [
            'etrna',
            'E site: empty tRNA exits',
            [144, 142],
            'After giving up its amino acid, the tRNA leaves and is recharged by an enzyme.',
          ],
          [
            'peptide',
            'Growing polypeptide',
            [96, 62],
            'Amino acids joined by peptide bonds, from the N-terminus (Met) outward.',
          ],
          [
            'stop',
            'Stop codon (UAA)',
            [320, 230],
            'No tRNA matches. A release factor binds and the finished chain is released.',
          ],
        ],
      ),
      diagram(
        'From gene to protein: a worked example',
        'Follow four codons from DNA to amino acids. Each row is complementary to the one above it.',
        [
          ...[
            ['dna', 'DNA template', '3′-', ['TAC', 'CGA', 'AAG', 'ATT'], '-5′', '#dbeafe'],
            ['mrna', 'mRNA', '5′-', ['AUG', 'GCU', 'UUC', 'UAA'], '-3′', '#ede9fe'],
            ['anticodon', 'tRNA anticodons', '', ['UAC', 'CGA', 'AAG', '—'], '', '#fee2e2'],
            ['protein', 'Amino acids', '', ['Met', 'Ala', 'Phe', 'STOP'], '', '#dcfce7'],
          ].flatMap(([part, name, pre, codons, post, fill], row) => [
            text(12, 46 + row * 56, name as string, {
              anchor: 'start',
              size: 10,
              bold: true,
              part: part as string,
            }),
            text(126, 46 + row * 56, pre as string, {
              anchor: 'end',
              size: 10,
              bold: true,
              fill: '#64748b',
              part: part as string,
            }),
            ...(codons as string[]).flatMap((c, i) => [
              rect(
                130 + i * 60,
                30 + row * 56,
                54,
                24,
                c === 'STOP' ? '#fecaca' : (fill as string),
                { r: 6, stroke: '#cbd5e1', part: part as string },
              ),
              text(157 + i * 60, 46 + row * 56, c, {
                size: 11,
                bold: true,
                fill: c === 'STOP' ? '#b91c1c' : '#1e293b',
                part: part as string,
              }),
            ]),
            text(372, 46 + row * 56, post as string, {
              anchor: 'start',
              size: 10,
              bold: true,
              fill: '#64748b',
              part: part as string,
            }),
          ]),
          arrow([60, 58], [60, 84], { stroke: '#2563eb', strokeWidth: 2 }),
          text(68, 76, 'transcription', {
            anchor: 'start',
            size: 8,
            fill: '#2563eb',
            part: 'mrna',
          }),
          arrow([60, 170], [60, 196], { stroke: '#16a34a', strokeWidth: 2 }),
          text(68, 188, 'translation', {
            anchor: 'start',
            size: 8,
            fill: '#16a34a',
            part: 'protein',
          }),
        ],
        [
          [
            'dna',
            'DNA template strand',
            [118, 22],
            'Read 3′→5′ by RNA polymerase. (The coding strand would read 5′-ATG GCT TTC TAA-3′.)',
          ],
          [
            'mrna',
            'mRNA',
            [118, 78],
            'Complementary to the template, with U in place of T. Divided into codons: AUG GCU UUC UAA.',
          ],
          [
            'anticodon',
            'tRNA anticodons',
            [118, 134],
            'Each tRNA’s anticodon pairs with a codon, so tRNA anticodons match the DNA template (with U for T).',
          ],
          [
            'protein',
            'Polypeptide',
            [118, 190],
            'Using a codon table: AUG = Met, GCU = Ala, UUC = Phe, UAA = stop. The result: Met–Ala–Phe.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Codon', 'A three-base mRNA sequence that codes for one amino acid or stop.'],
      ['Anticodon', 'The three tRNA bases that pair with a codon.'],
      ['tRNA', 'Transfer RNA: carries an amino acid to the ribosome.'],
      ['Ribosome', 'rRNA–protein machine that translates mRNA into a polypeptide.'],
      ['Peptide bond', 'Covalent bond joining amino acids in a chain.'],
      ['Reading frame', 'The way a sequence is divided into codons, set by the start codon.'],
    ],
    goDeeper:
      'The genetic code is nearly universal: bacteria, plants and humans read the same codons as the same amino acids. That is strong evidence for common ancestry, and it is what makes genetic engineering possible; a human insulin gene placed in bacteria is translated into human insulin.\n\nThe code is redundant: 64 codons code for 20 amino acids and 3 stops, so most amino acids have several codons. They usually differ in the third base, where tRNAs can tolerate a mismatch (“wobble”). This buffers the effect of many mutations.\n\nIn reality, it’s a bit more complicated: many ribosomes can translate the same mRNA at once (a polysome), and proteins destined for secretion are made by ribosomes that dock on the rough ER and feed the chain straight into it.',
    quiz: [
      mc(
        'An mRNA codon is GCU. What is the tRNA anticodon that pairs with it?',
        ['CGA', 'GCU', 'CGT', 'GCA'],
        0,
        'Pair each base: G–C, C–G, U–A. Anticodons are written complementary and antiparallel to the codon.',
      ),
      predict(
        'A mutation changes the mRNA codon UGG (tryptophan) to UGA in the middle of a gene.',
        'What happens to the protein?',
        [
          'It is cut short, because UGA is a stop codon',
          'One amino acid is changed',
          'It becomes longer',
          'Nothing changes',
        ],
        0,
        'UGA is a stop codon, so this is a nonsense mutation and translation ends early, usually giving a non-functional protein.',
      ),
      label(
        'Match each molecule to its role in protein synthesis.',
        [
          ['mRNA', 'Carries the gene’s message to the ribosome'],
          ['tRNA', 'Brings a specific amino acid'],
          ['rRNA', 'Forms the ribosome and catalyzes peptide bonds'],
          ['RNA polymerase', 'Builds mRNA from the DNA template'],
        ],
        'Three kinds of RNA work together to make proteins.',
      ),
    ],
  }),

  hs({
    base: 'mutations',
    unit: 'dna',
    summary:
      'A mutation is a change in the DNA sequence. Point mutations may be silent, missense or nonsense; insertions and deletions can shift the reading frame. Larger chromosomal mutations rearrange whole sections. Mutations can be harmful, neutral or occasionally helpful, and they are the source of new alleles.',
    steps: [
      [
        'Causes of mutation',
        'Mutations arise from replication errors that escape proofreading, or from mutagens: UV light (which fuses neighboring thymines), X-rays, and chemicals like those in tobacco smoke. Only mutations in gametes are passed to offspring.',
      ],
      [
        'Silent mutations',
        'A base substitution that doesn’t change the amino acid, because several codons code for the same one (GAA and GAG both code for glutamic acid). The protein is unchanged.',
      ],
      [
        'Missense and nonsense',
        'A missense mutation swaps one amino acid for another; the effect depends on where it is and how different the new amino acid is. A nonsense mutation creates a premature stop codon, usually producing a short, non-functional protein.',
      ],
      [
        'Frameshift mutations',
        'Inserting or deleting bases (not in multiples of three) shifts the reading frame, so every codon after the change is read differently. This usually wrecks the protein and often creates an early stop codon.',
      ],
    ],
    diagrams: [
      diagram(
        'Types of point mutation',
        'One normal mRNA sequence and four kinds of mutation. Changed codons are highlighted.',
        [
          ...[
            [
              'normal',
              'Normal',
              ['AUG', 'GAA', 'UGG', 'CAU'],
              ['Met', 'Glu', 'Trp', 'His'],
              -1,
              'normal protein',
            ],
            [
              'silent',
              'Silent',
              ['AUG', 'GAG', 'UGG', 'CAU'],
              ['Met', 'Glu', 'Trp', 'His'],
              1,
              'no change',
            ],
            [
              'missense',
              'Missense',
              ['AUG', 'GUA', 'UGG', 'CAU'],
              ['Met', 'Val', 'Trp', 'His'],
              1,
              'one amino acid changed',
            ],
            [
              'nonsense',
              'Nonsense',
              ['AUG', 'GAA', 'UGA', 'CAU'],
              ['Met', 'Glu', 'STOP', ''],
              2,
              'protein cut short',
            ],
            [
              'frameshift',
              'Frameshift',
              ['AUG', 'CGA', 'AUG', 'GCA'],
              ['Met', 'Arg', 'Met', 'Ala'],
              1,
              'all later codons change',
            ],
          ].flatMap(([part, name, codons, aminos, changed, effect], row) => [
            text(12, 28 + row * 48, name as string, {
              anchor: 'start',
              size: 10,
              bold: true,
              part: part as string,
            }),
            ...codonRow(
              96,
              14 + row * 48,
              codons as string[],
              aminos as string[],
              part as string,
              changed as number,
            ),
            ...(part === 'frameshift'
              ? [
                  rect(140, 12 + row * 48, 138, 24, 'none', {
                    r: 4,
                    stroke: '#d97706',
                    strokeWidth: 2,
                    dash: true,
                    part,
                  }),
                ]
              : []),
            text(290, 28 + row * 48, effect as string, {
              anchor: 'start',
              size: 9,
              fill: '#475569',
              part: part as string,
            }),
          ]),
          text(164, 203, 'C inserted ↓', {
            size: 8.5,
            bold: true,
            fill: '#b45309',
            part: 'frameshift',
          }),
        ],
        [
          ['normal', 'Normal sequence', [86, 28], 'The original gene: Met–Glu–Trp–His…'],
          [
            'silent',
            'Silent',
            [86, 76],
            'GAA → GAG: still glutamic acid. The redundancy of the code hides the change.',
          ],
          [
            'missense',
            'Missense',
            [86, 124],
            'GAA → GUA: glutamic acid becomes valine. The same kind of change (GAG → GUG) causes sickle cell disease.',
          ],
          [
            'nonsense',
            'Nonsense',
            [86, 172],
            'UGG → UGA: a stop codon, so the protein ends after two amino acids.',
          ],
          [
            'frameshift',
            'Frameshift (insertion)',
            [86, 220],
            'An extra C after AUG shifts every later codon: AUG CGA AUG GCA… a completely different protein.',
          ],
        ],
      ),
      diagram(
        'Chromosomal mutations',
        'Larger changes affect whole segments of a chromosome, often many genes at once. Letters stand for gene regions.',
        [
          ...[
            ['original', 'Original', ['A', 'B', 'C', 'D', 'E', 'F']],
            ['deletion', 'Deletion', ['A', 'B', 'D', 'E', 'F']],
            ['duplication', 'Duplication', ['A', 'B', 'C', 'C', 'D', 'E', 'F']],
            ['inversion', 'Inversion', ['A', 'D', 'C', 'B', 'E', 'F']],
            ['translocation', 'Translocation', ['A', 'B', 'C', 'D', 'M', 'N']],
          ].flatMap(([part, name, genes], row) => [
            text(12, 32 + row * 46, name as string, {
              anchor: 'start',
              size: 10,
              bold: true,
              part: part as string,
            }),
            ...(genes as string[]).flatMap((g, i) => {
              const colors: Record<string, string> = {
                A: '#fca5a5',
                B: '#fdba74',
                C: '#fde047',
                D: '#86efac',
                E: '#7dd3fc',
                F: '#c4b5fd',
                M: '#94a3b8',
                N: '#cbd5e1',
              };
              const highlight =
                (part === 'duplication' && i === 3) ||
                (part === 'inversion' && i >= 1 && i <= 3) ||
                (part === 'translocation' && i >= 4);
              return [
                rect(110 + i * 34, 18 + row * 46, 32, 22, colors[g], {
                  r: i === 0 ? 10 : 3,
                  stroke: highlight ? '#b45309' : '#64748b',
                  strokeWidth: highlight ? 2.5 : 1,
                  part: part as string,
                }),
                text(126 + i * 34, 33 + row * 46, g, { bold: true, part: part as string }),
              ];
            }),
            ...(part === 'deletion'
              ? [
                  path(
                    `M${110 + 2 * 34 - 1} ${14 + row * 46} L${110 + 2 * 34 - 1} ${44 + row * 46}`,
                    { stroke: '#dc2626', strokeWidth: 2, dash: true, part },
                  ),
                ]
              : []),
          ]),
          circle(177, 29, 5, '#334155', { part: 'original' }),
        ],
        [
          [
            'original',
            'Original chromosome',
            [356, 29],
            'Gene regions A–F in order; the dot marks the centromere.',
          ],
          [
            'deletion',
            'Deletion',
            [356, 75],
            'Segment C is lost. Missing genes are often severe; for example, cri-du-chat syndrome is a deletion on chromosome 5.',
          ],
          [
            'duplication',
            'Duplication',
            [356, 121],
            'A segment is repeated. Duplicated genes are free to mutate and can evolve new functions.',
          ],
          [
            'inversion',
            'Inversion',
            [356, 167],
            'A segment is flipped end to end. Genes are all present but may be disrupted where breaks occurred.',
          ],
          [
            'translocation',
            'Translocation',
            [356, 213],
            'A segment moves to a different (non-homologous) chromosome. One example, between chromosomes 9 and 22, causes a type of leukemia.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Mutation', 'A permanent change in a DNA sequence.'],
      ['Point mutation', 'A change in a single base.'],
      ['Missense', 'A substitution that changes one amino acid.'],
      ['Nonsense', 'A substitution that creates a stop codon.'],
      ['Frameshift', 'An insertion or deletion that shifts the reading frame.'],
      ['Mutagen', 'An agent that increases the mutation rate, like UV light.'],
    ],
    goDeeper:
      'Most mutations are neutral, falling in non-coding DNA or making silent changes. Some are harmful, and a few are beneficial in a particular environment: a lactase-persistence mutation lets many adults digest milk, and a mutation in the CCR5 gene protects against some HIV strains. Mutations are the ultimate source of all genetic variation that natural selection acts on.\n\nCells have repair systems. Mismatch repair fixes replication errors; nucleotide excision repair cuts out UV damage. People with xeroderma pigmentosum lack one repair pathway and are extremely sensitive to sunlight, which shows how important these systems are.\n\nIn reality, it’s a bit more complicated: a deletion of exactly three bases removes one amino acid without a frameshift. The most common cystic fibrosis mutation (ΔF508) is exactly this kind of in-frame deletion.',
    quiz: [
      predict(
        'One base is deleted near the start of a gene’s coding sequence.',
        'What is the most likely effect on the protein?',
        [
          'It is badly changed or cut short, because every codon after the deletion shifts',
          'Only one amino acid changes',
          'No effect, because the code is redundant',
          'The protein becomes one amino acid shorter',
        ],
        0,
        'Deleting one base is a frameshift: all downstream codons are read in a new frame, usually hitting a stop codon soon.',
      ),
      mc(
        'Why are many substitutions in the third base of a codon silent?',
        [
          'Several codons for the same amino acid differ only in the third base',
          'The third base is never read',
          'Ribosomes correct third-base errors',
          'The third base is always a stop signal',
        ],
        0,
        'The code is redundant (degenerate), mostly in the third position, so a change there often keeps the same amino acid.',
      ),
      label(
        'Match each mutation to its effect.',
        [
          ['Silent', 'Same amino acid'],
          ['Missense', 'Different amino acid'],
          ['Nonsense', 'Premature stop codon'],
          ['Frameshift', 'All later codons change'],
        ],
        'The effect of a mutation depends on how it changes the codons that are read.',
      ),
    ],
  }),
];
