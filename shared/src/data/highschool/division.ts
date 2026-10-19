import type { Concept, DiagramShape } from '../../types';
import { label, mc, predict } from '../concepts/helpers';
import { arrow, circle, diagram, ellipse, hs, path, rect, text } from './build';

const RED = '#e11d48';
const BLUE = '#2563eb';

/** A donut-chart segment from angle a0 to a1 (degrees, 0 = top, clockwise). */
function segment(cx: number, cy: number, r1: number, r2: number, a0: number, a1: number) {
  const pt = (r: number, a: number) => {
    const t = ((a - 90) * Math.PI) / 180;
    return `${(cx + r * Math.cos(t)).toFixed(1)} ${(cy + r * Math.sin(t)).toFixed(1)}`;
  };
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${pt(r2, a0)} A${r2} ${r2} 0 ${large} 1 ${pt(r2, a1)} L${pt(r1, a1)} A${r1} ${r1} 0 ${large} 0 ${pt(r1, a0)} Z`;
}

/**
 * A chromosome: one chromatid, or two sister chromatids joined at a centromere.
 * `tip` recolors the lower end of the right chromatid to show a crossover.
 */
function chromosome(
  x: number,
  y: number,
  color: string,
  o: { half?: number; single?: boolean; tip?: string; part?: string } = {},
): DiagramShape[] {
  const h = o.half ?? 8;
  const line = (dx: number, c: string, y0 = y - h, y1 = y + h) =>
    path(`M${x + dx} ${y0} L${x + dx} ${y1}`, { stroke: c, strokeWidth: 4, part: o.part });
  if (o.single) return [line(0, color)];
  const out = [line(-2.5, color), line(2.5, color)];
  if (o.tip) out.push(line(2.5, o.tip, y + h * 0.35, y + h));
  out.push(circle(x, y, 2.2, '#0f172a', { part: o.part }));
  return out;
}

export const division: Concept[] = [
  hs({
    base: 'mitosis',
    unit: 'division',
    summary:
      'The cell cycle alternates growth and DNA copying (interphase) with division (mitosis and cytokinesis). Mitosis gives two genetically identical diploid cells, and checkpoints stop damaged cells from dividing; when they fail, cancer can result.',
    steps: [
      [
        'Interphase: G₁, S, G₂',
        'Most of a cell’s life is interphase. In G₁ it grows and does its job; in S phase it replicates its DNA, so each chromosome becomes two identical sister chromatids joined at a centromere; in G₂ it makes proteins and organelles needed for division.',
      ],
      [
        'Prophase',
        'Chromatin condenses into visible chromosomes. The nuclear envelope breaks down, the nucleolus disappears, and the spindle (made of microtubules) grows from the centrosomes as they move to opposite poles.',
      ],
      [
        'Metaphase',
        'Spindle fibers attach to the kinetochore at each centromere and line the chromosomes up along the cell’s equator (the metaphase plate). A checkpoint waits until every chromosome is attached to both poles.',
      ],
      [
        'Anaphase',
        'The centromeres split and sister chromatids are pulled to opposite poles as the spindle fibers shorten. Each separated chromatid now counts as a chromosome. The cell elongates.',
      ],
      [
        'Telophase & cytokinesis',
        'Nuclear envelopes re-form around each set of chromosomes, which decondense. Cytokinesis divides the cytoplasm: animal cells pinch in with a cleavage furrow, while plant cells build a cell plate that becomes a new wall.',
      ],
      [
        'Two identical diploid cells',
        'Each daughter cell gets an identical, complete set of chromosomes (2n → 2n in humans: 46 → 46). Mitosis is used for growth, repair, replacing cells and asexual reproduction.',
      ],
      [
        'Checkpoints and cancer',
        'Cyclins and cyclin-dependent kinases (CDKs) drive the cycle; checkpoints at G₁, G₂ and metaphase check for DNA damage and proper attachment. Tumor-suppressor proteins like p53 can halt the cycle or trigger apoptosis. Mutations in these genes (and in proto-oncogenes) let cells divide uncontrollably and form tumors.',
      ],
    ],
    diagrams: [
      diagram(
        'The cell cycle',
        'One full turn of the cycle. Interphase (G₁, S, G₂) takes about 90% of the time; mitosis and cytokinesis (M) are quick. Red bars mark checkpoints.',
        [
          path(segment(130, 130, 56, 104, 0, 150), {
            fill: '#bbf7d0',
            stroke: '#fff',
            strokeWidth: 2,
            part: 'g1',
          }),
          path(segment(130, 130, 56, 104, 150, 255), {
            fill: '#bfdbfe',
            stroke: '#fff',
            strokeWidth: 2,
            part: 's',
          }),
          path(segment(130, 130, 56, 104, 255, 315), {
            fill: '#fde68a',
            stroke: '#fff',
            strokeWidth: 2,
            part: 'g2',
          }),
          path(segment(130, 130, 56, 104, 315, 360), {
            fill: '#fecaca',
            stroke: '#fff',
            strokeWidth: 2,
            part: 'm',
          }),
          text(200, 116, 'G₁', { size: 14, bold: true, fill: '#166534', part: 'g1' }),
          text(200, 132, 'growth', { size: 9, fill: '#166534', part: 'g1' }),
          text(96, 196, 'S', { size: 14, bold: true, fill: '#1e40af', part: 's' }),
          text(96, 210, 'DNA copied', { size: 9, fill: '#1e40af', part: 's' }),
          text(52, 92, 'G₂', { size: 14, bold: true, fill: '#92400e', part: 'g2' }),
          text(100, 52, 'M', { size: 14, bold: true, fill: '#9f1239', part: 'm' }),
          text(130, 126, 'Interphase', {
            size: 10,
            bold: true,
            fill: '#475569',
            part: 'interphase',
          }),
          text(130, 140, '(G₁ + S + G₂)', { size: 8.5, fill: '#475569', part: 'interphase' }),
          path('M182 220 L190 235', { stroke: '#dc2626', strokeWidth: 5, part: 'checkpoints' }),
          path('M56 56 L44 44', { stroke: '#dc2626', strokeWidth: 5, part: 'checkpoints' }),
          path('M89 34 L83 19', { stroke: '#dc2626', strokeWidth: 5, part: 'checkpoints' }),
          arrow([232, 96], [300, 60], { stroke: '#64748b', dash: true, part: 'g0' }),
          rect(298, 34, 92, 44, '#f1f5f9', { r: 10, stroke: '#94a3b8', part: 'g0' }),
          text(344, 52, 'G₀', { size: 12, bold: true, fill: '#475569', part: 'g0' }),
          text(344, 67, 'resting, not dividing', { size: 8, fill: '#475569', part: 'g0' }),
          rect(258, 140, 136, 100, '#fff1f2', { r: 10, stroke: '#fecdd3', part: 'm' }),
          text(326, 158, 'M phase', { size: 10, bold: true, fill: '#9f1239', part: 'm' }),
          text(266, 176, 'Prophase', { anchor: 'start', size: 9, part: 'm' }),
          text(266, 190, 'Metaphase', { anchor: 'start', size: 9, part: 'm' }),
          text(266, 204, 'Anaphase', { anchor: 'start', size: 9, part: 'm' }),
          text(266, 218, 'Telophase', { anchor: 'start', size: 9, part: 'm' }),
          text(266, 232, '+ Cytokinesis', { anchor: 'start', size: 9, bold: true, part: 'm' }),
        ],
        [
          [
            'g1',
            'G₁ phase',
            [190, 26],
            'The cell grows, makes proteins and organelles, and carries out its normal functions. The longest and most variable phase.',
          ],
          [
            's',
            'S phase (synthesis)',
            [40, 200],
            'DNA replication: every chromosome is copied into two sister chromatids. DNA content doubles, but chromosome number does not.',
          ],
          [
            'g2',
            'G₂ phase',
            [20, 62],
            'More growth and preparation: the cell makes spindle proteins and checks its copied DNA for errors.',
          ],
          [
            'm',
            'M phase (mitosis + cytokinesis)',
            [380, 156],
            'Division of the nucleus (prophase → telophase), then of the cytoplasm.',
          ],
          [
            'interphase',
            'Interphase',
            [130, 160],
            'G₁ + S + G₂: everything between divisions. Not a “resting” phase: the cell is very busy.',
          ],
          [
            'checkpoints',
            'Checkpoints',
            [208, 242],
            'Control points (G₁/S, G₂/M and metaphase) where the cell checks size, DNA damage and spindle attachment before continuing.',
          ],
          [
            'g0',
            'G₀ (exit)',
            [290, 26],
            'Cells that stop dividing, like most mature neurons and muscle cells, leave the cycle into G₀.',
          ],
        ],
      ),
      diagram(
        'The stages of mitosis',
        'A cell with 4 chromosomes (2n = 4): red ones from one parent, blue from the other. Each X is a replicated chromosome made of two sister chromatids.',
        [
          ...[55, 152, 249].map((cx, i) =>
            i === 2
              ? ellipse(cx, 95, 46, 38, '#f8fafc', { stroke: '#64748b', strokeWidth: 2 })
              : circle(cx, 95, 42, '#f8fafc', { stroke: '#64748b', strokeWidth: 2 }),
          ),
          path(
            'M346 57 C330 52 304 56 302 95 C304 134 330 138 346 133 C362 138 388 134 390 95 C388 56 362 52 346 57 Z',
            { fill: '#f8fafc', stroke: '#64748b', strokeWidth: 2, part: 'telophase' },
          ),
          path('M346 57 L346 66 M346 124 L346 133', {
            stroke: '#64748b',
            strokeWidth: 2,
            part: 'telophase',
          }),
          // Prophase
          circle(55, 95, 28, 'none', { stroke: '#94a3b8', dash: true, part: 'prophase' }),
          ...chromosome(44, 86, RED, { half: 9, part: 'prophase' }),
          ...chromosome(64, 84, BLUE, { half: 9, part: 'prophase' }),
          ...chromosome(48, 108, RED, { half: 6, part: 'prophase' }),
          ...chromosome(66, 106, BLUE, { half: 6, part: 'prophase' }),
          circle(22, 72, 3, '#16a34a', { part: 'spindle' }),
          circle(88, 118, 3, '#16a34a', { part: 'spindle' }),
          // Metaphase
          ...[-27, -9, 9, 27].flatMap((dy) => [
            path(`M118 95 L149.5 ${95 + dy}`, {
              stroke: '#16a34a',
              strokeWidth: 1,
              part: 'spindle',
            }),
            path(`M186 95 L154.5 ${95 + dy}`, {
              stroke: '#16a34a',
              strokeWidth: 1,
              part: 'spindle',
            }),
          ]),
          circle(118, 95, 3, '#16a34a', { part: 'spindle' }),
          circle(186, 95, 3, '#16a34a', { part: 'spindle' }),
          ...chromosome(152, 68, RED, { half: 7, part: 'metaphase' }),
          ...chromosome(152, 86, BLUE, { half: 7, part: 'metaphase' }),
          ...chromosome(152, 104, RED, { half: 5, part: 'metaphase' }),
          ...chromosome(152, 122, BLUE, { half: 5, part: 'metaphase' }),
          path('M152 54 L152 136', {
            stroke: '#94a3b8',
            strokeWidth: 1,
            dash: true,
            part: 'metaphase',
          }),
          // Anaphase
          ...[-22, -8, 8, 22].flatMap((dy, i) => [
            ...chromosome(229, 95 + dy, i % 2 ? BLUE : RED, {
              single: true,
              half: i < 2 ? 6 : 4,
              part: 'anaphase',
            }),
            ...chromosome(269, 95 + dy, i % 2 ? BLUE : RED, {
              single: true,
              half: i < 2 ? 6 : 4,
              part: 'anaphase',
            }),
            path(`M209 95 L229 ${95 + dy}`, { stroke: '#16a34a', strokeWidth: 1, part: 'spindle' }),
            path(`M289 95 L269 ${95 + dy}`, { stroke: '#16a34a', strokeWidth: 1, part: 'spindle' }),
          ]),
          arrow([238, 140], [214, 140], { stroke: '#64748b', strokeWidth: 1.5, part: 'anaphase' }),
          arrow([260, 140], [284, 140], { stroke: '#64748b', strokeWidth: 1.5, part: 'anaphase' }),
          // Telophase
          circle(324, 95, 16, '#f1f5f9', { stroke: '#94a3b8', dash: true, part: 'telophase' }),
          circle(368, 95, 16, '#f1f5f9', { stroke: '#94a3b8', dash: true, part: 'telophase' }),
          path('M316 88 Q322 84 326 92 Q330 100 334 96 M316 102 Q322 98 330 104', {
            stroke: RED,
            strokeWidth: 2,
            part: 'telophase',
          }),
          path('M360 88 Q366 84 370 92 Q374 100 378 96 M360 102 Q366 98 374 104', {
            stroke: BLUE,
            strokeWidth: 2,
            part: 'telophase',
          }),
          ...['Prophase', 'Metaphase', 'Anaphase', 'Telophase'].map((t, i) =>
            text(55 + i * 97, 162, t, {
              bold: true,
              part: ['prophase', 'metaphase', 'anaphase', 'telophase'][i],
            }),
          ),
          ...[
            'chromosomes condense',
            'line up at the middle',
            'chromatids pulled apart',
            'two nuclei, cell splits',
          ].map((t, i) =>
            text(55 + i * 97, 176, t, {
              size: 8,
              fill: '#475569',
              part: ['prophase', 'metaphase', 'anaphase', 'telophase'][i],
            }),
          ),
          ...chromosome(40, 222, RED, { half: 12, part: 'chromatids' }),
          path('M48 222 L70 222', { stroke: '#94a3b8', strokeWidth: 1 }),
          text(74, 218, 'sister chromatids', { anchor: 'start', size: 9, part: 'chromatids' }),
          text(74, 230, 'joined at the centromere', {
            anchor: 'start',
            size: 9,
            part: 'chromatids',
          }),
          path('M220 214 L244 214', { stroke: '#16a34a', strokeWidth: 1.5, part: 'spindle' }),
          circle(220, 214, 3, '#16a34a', { part: 'spindle' }),
          text(250, 218, 'spindle fibers', { anchor: 'start', size: 9, part: 'spindle' }),
          text(250, 230, 'from a centrosome', { anchor: 'start', size: 9, part: 'spindle' }),
        ],
        [
          [
            'prophase',
            'Prophase',
            [22, 46],
            'Chromosomes condense, the nuclear envelope (dashed) breaks down and centrosomes move apart, growing the spindle.',
          ],
          [
            'metaphase',
            'Metaphase',
            [176, 46],
            'Chromosomes line up single file on the metaphase plate (dotted line), each attached to fibers from both poles.',
          ],
          [
            'anaphase',
            'Anaphase',
            [282, 46],
            'Sister chromatids separate and are pulled to opposite poles, so each side gets one copy of every chromosome.',
          ],
          [
            'telophase',
            'Telophase & cytokinesis',
            [386, 46],
            'New nuclear envelopes form and the cleavage furrow pinches the cell in two.',
          ],
          [
            'chromatids',
            'Sister chromatids',
            [20, 200],
            'Identical copies of one chromosome made in S phase, held together at the centromere until anaphase.',
          ],
          [
            'spindle',
            'Spindle',
            [204, 200],
            'Microtubules that grow from centrosomes, attach at kinetochores and pull chromatids apart.',
          ],
        ],
      ),
    ],
    keyTerms: [
      [
        'Sister chromatids',
        'Two identical copies of a replicated chromosome, joined at the centromere.',
      ],
      [
        'Centromere',
        'The region where sister chromatids are held together; the kinetochore forms here.',
      ],
      ['Spindle', 'Microtubule fibers that move chromosomes during division.'],
      ['Cytokinesis', 'Division of the cytoplasm into two cells.'],
      ['Diploid (2n)', 'Having two sets of chromosomes, one from each parent.'],
      ['Tumor suppressor', 'A gene (like p53) that slows or stops cell division.'],
    ],
    goDeeper:
      'Cancer usually needs several mutations. Proto-oncogenes normally promote division (like an accelerator); a mutation can turn one into an oncogene that is stuck “on.” Tumor-suppressor genes normally brake the cycle; both copies usually need to be lost before the brake fails. This is why cancer risk rises with age and with exposure to mutagens like UV light and tobacco smoke.\n\nMany chemotherapy drugs target dividing cells. Taxol stops spindle microtubules from disassembling and vinblastine stops them from forming; either way, cells stall at metaphase. Because hair follicles, gut lining and bone marrow also divide fast, these drugs cause side effects like hair loss.\n\nIn reality, it’s a bit more complicated: prophase is often split into prophase and prometaphase, and in many cells the boundaries between phases are blurry; they are stages of one continuous process.',
    quiz: [
      mc(
        'A human skin cell has 46 chromosomes. How many chromosomes does each daughter cell have after mitosis?',
        ['46', '23', '92', '12'],
        0,
        'Mitosis produces genetically identical diploid cells with the same chromosome number as the parent.',
      ),
      predict(
        'A drug prevents spindle fibers from forming in dividing cells.',
        'At which stage will the cells get stuck?',
        ['Metaphase: chromosomes can’t attach and line up', 'G₁', 'S phase', 'Cytokinesis only'],
        0,
        'The metaphase (spindle) checkpoint won’t let anaphase begin until every chromosome is attached, so cells arrest.',
      ),
      label(
        'Match each phase to what happens in it.',
        [
          ['S phase', 'DNA is replicated'],
          ['Prophase', 'Chromosomes condense; nuclear envelope breaks down'],
          ['Metaphase', 'Chromosomes line up at the equator'],
          ['Anaphase', 'Sister chromatids move to opposite poles'],
          ['Telophase', 'Nuclear envelopes re-form'],
        ],
        'Remember the order with “PMAT,” after S phase copies the DNA.',
      ),
    ],
  }),

  hs({
    base: 'meiosis',
    unit: 'division',
    summary:
      'Meiosis is two divisions that turn one diploid cell into four haploid gametes. Crossing over and independent assortment make every gamete genetically different, which, together with random fertilization, creates huge genetic variation.',
    steps: [
      [
        'Interphase: DNA replication',
        'As in mitosis, DNA is copied in S phase, so each chromosome has two sister chromatids. A human cell going into meiosis has 46 chromosomes in 23 homologous pairs: one of each pair from each parent.',
      ],
      [
        'Prophase I: synapsis and crossing over',
        'Homologous chromosomes pair up (synapsis) to form tetrads. Non-sister chromatids swap matching segments at chiasmata (crossing over), creating new combinations of alleles on each chromosome.',
      ],
      [
        'Meiosis I: homologs separate',
        'Homologous pairs line up at the equator and are pulled apart, one of each pair to each pole. How each pair faces is random (independent assortment), giving 2²³ (≈8.4 million) combinations in humans. The result is two haploid cells (n).',
      ],
      [
        'Meiosis II: chromatids separate',
        'Without copying DNA again, each cell divides like mitosis: sister chromatids separate. The result is four haploid cells, each genetically unique. In humans these become sperm (all four) or one egg (plus small polar bodies).',
      ],
    ],
    diagrams: [
      diagram(
        'Meiosis: one diploid cell to four haploid cells',
        'A cell with two homologous pairs (2n = 4). Red chromosomes came from one parent, blue from the other. Notice the swapped tips from crossing over.',
        [
          circle(48, 130, 40, '#f8fafc', { stroke: '#64748b', strokeWidth: 2, part: 'start' }),
          ...chromosome(36, 116, RED, { half: 12, tip: BLUE, part: 'crossing' }),
          ...chromosome(52, 116, BLUE, { half: 12, tip: RED, part: 'crossing' }),
          ...chromosome(38, 150, RED, { half: 7, part: 'start' }),
          ...chromosome(54, 150, BLUE, { half: 7, part: 'start' }),
          text(48, 190, '2n = 4', { bold: true, part: 'start' }),
          text(48, 203, 'replicated', { size: 8.5, fill: '#475569', part: 'start' }),
          arrow([92, 112], [130, 82], { strokeWidth: 2, part: 'mei1' }),
          arrow([92, 150], [130, 180], { strokeWidth: 2, part: 'mei1' }),
          text(104, 234, 'Meiosis I', { bold: true, fill: '#7c3aed', part: 'mei1' }),
          text(104, 247, 'homologs separate', { size: 8.5, fill: '#7c3aed', part: 'mei1' }),
          circle(166, 72, 32, '#f8fafc', { stroke: '#64748b', strokeWidth: 2, part: 'mei1' }),
          ...chromosome(156, 70, RED, { half: 12, tip: BLUE, part: 'mei1' }),
          ...chromosome(178, 74, BLUE, { half: 7, part: 'assort' }),
          circle(166, 188, 32, '#f8fafc', { stroke: '#64748b', strokeWidth: 2, part: 'mei1' }),
          ...chromosome(156, 186, BLUE, { half: 12, tip: RED, part: 'mei1' }),
          ...chromosome(178, 190, RED, { half: 7, part: 'assort' }),
          text(214, 76, 'n = 2', { size: 9, bold: true, part: 'mei1' }),
          text(214, 192, 'n = 2', { size: 9, bold: true, part: 'mei1' }),
          arrow([200, 56], [270, 34], { strokeWidth: 2, part: 'mei2' }),
          arrow([200, 86], [270, 96], { strokeWidth: 2, part: 'mei2' }),
          arrow([200, 176], [270, 164], { strokeWidth: 2, part: 'mei2' }),
          arrow([200, 204], [270, 226], { strokeWidth: 2, part: 'mei2' }),
          text(244, 132, 'Meiosis II', { bold: true, fill: '#db2777', part: 'mei2' }),
          text(244, 145, 'chromatids separate', { size: 8.5, fill: '#db2777', part: 'mei2' }),
          ...[
            [34, RED, BLUE, RED],
            [96, RED, BLUE, BLUE],
            [164, BLUE, RED, RED],
            [226, BLUE, RED, BLUE],
          ].flatMap(([y, long, short, tip]) => [
            circle(296, y as number, 24, '#f8fafc', {
              stroke: '#64748b',
              strokeWidth: 2,
              part: 'gametes',
            }),
            ...chromosome(290, y as number, long as string, {
              half: 11,
              single: true,
              part: 'gametes',
            }),
            ...(tip !== long
              ? [
                  path(`M290 ${(y as number) + 4} L290 ${(y as number) + 11}`, {
                    stroke: tip as string,
                    strokeWidth: 4,
                    part: 'gametes',
                  }),
                ]
              : []),
            ...chromosome(303, y as number, short as string, {
              half: 6,
              single: true,
              part: 'gametes',
            }),
          ]),
          text(362, 112, '4 haploid', { size: 10, bold: true, part: 'gametes' }),
          text(362, 126, 'cells (n = 2),', { size: 10, bold: true, part: 'gametes' }),
          text(362, 140, 'all genetically', { size: 10, part: 'gametes' }),
          text(362, 154, 'different', { size: 10, part: 'gametes' }),
        ],
        [
          [
            'start',
            'Diploid cell after S phase',
            [12, 92],
            'Two homologous pairs, each chromosome already copied into two sister chromatids.',
          ],
          [
            'crossing',
            'Crossing over (prophase I)',
            [80, 96],
            'Homologs pair up and non-sister chromatids exchange segments. Each chromosome now carries a new mix of maternal and paternal alleles.',
          ],
          [
            'mei1',
            'Meiosis I',
            [140, 30],
            'Homologous pairs are separated, halving the chromosome number. Each cell gets one of each pair.',
          ],
          [
            'assort',
            'Independent assortment',
            [204, 210],
            'Whether the red or blue member of each pair goes to a given cell is random, so the short chromosomes here could have sorted the other way.',
          ],
          [
            'mei2',
            'Meiosis II',
            [244, 108],
            'Sister chromatids separate, as in mitosis, with no DNA replication beforehand.',
          ],
          [
            'gametes',
            'Four unique haploid cells',
            [384, 80],
            'Each has one chromosome from each pair, and no two are identical. Fertilization restores the diploid number.',
          ],
        ],
      ),
      diagram(
        'Mitosis vs meiosis',
        'Both start with DNA replication, but they differ in the number of divisions, the cells produced and their genetic makeup.',
        [
          rect(8, 10, 384, 30, '#e2e8f0', { r: 8 }),
          text(220, 30, 'Mitosis', { size: 11, bold: true, fill: '#0369a1' }),
          text(330, 30, 'Meiosis', { size: 11, bold: true, fill: '#be185d' }),
          ...[
            ['divisions', 'Divisions', 'One', 'Two (I and II)'],
            ['cells', 'Daughter cells', '2', '4'],
            ['number', 'Chromosome number', '2n → 2n', '2n → n'],
            ['genetics', 'Genetically…', 'identical', 'all different'],
            ['crossing', 'Crossing over?', 'No', 'Yes, prophase I'],
            ['purpose', 'Used for', 'growth, repair', 'making gametes'],
          ].flatMap(([id, row, a, b], i) => [
            rect(8, 44 + i * 35, 384, 31, i % 2 ? '#fff' : '#f8fafc', {
              r: 6,
              stroke: '#e2e8f0',
              part: id,
            }),
            text(18, 64 + i * 35, row, { anchor: 'start', size: 10, bold: true, part: id }),
            text(220, 64 + i * 35, a, { size: 10, part: id }),
            text(330, 64 + i * 35, b, { size: 10, part: id }),
          ]),
        ],
        [
          [
            'divisions',
            'Number of divisions',
            [160, 59],
            'Meiosis divides twice after copying DNA once, which is how it halves the chromosome number.',
          ],
          [
            'cells',
            'Number of cells',
            [160, 94],
            'Mitosis: 2 cells. Meiosis: 4 cells (in females, 1 egg + polar bodies).',
          ],
          [
            'number',
            'Chromosome number',
            [160, 129],
            'Mitosis keeps it the same (46 → 46); meiosis halves it (46 → 23).',
          ],
          [
            'genetics',
            'Genetic makeup',
            [160, 164],
            'Mitosis makes clones; meiosis makes variety through crossing over and independent assortment.',
          ],
          [
            'crossing',
            'Crossing over',
            [160, 199],
            'Only meiosis pairs up homologous chromosomes, so only meiosis has crossing over.',
          ],
          [
            'purpose',
            'Purpose',
            [160, 234],
            'Mitosis: growth, repair, asexual reproduction. Meiosis: sexual reproduction.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Homologous chromosomes', 'A matching pair, one from each parent, carrying the same genes.'],
      ['Haploid (n)', 'Having one set of chromosomes, like a gamete.'],
      ['Crossing over', 'Exchange of segments between non-sister chromatids in prophase I.'],
      ['Independent assortment', 'Random orientation of homologous pairs in metaphase I.'],
      [
        'Nondisjunction',
        'Failure of chromosomes to separate properly, giving gametes the wrong number.',
      ],
    ],
    goDeeper:
      'Nondisjunction is when homologs (in meiosis I) or sister chromatids (in meiosis II) fail to separate. A gamete then has an extra or missing chromosome, and fertilization produces trisomy or monosomy. Trisomy 21 causes Down syndrome; Turner syndrome (XO) and Klinefelter syndrome (XXY) involve sex chromosomes. The risk of nondisjunction in eggs rises with maternal age, partly because eggs pause in prophase I from before birth until ovulation.\n\nVariation from meiosis is enormous. Independent assortment alone gives 2²³ ≈ 8.4 million chromosome combinations per parent; random fertilization multiplies these (≈70 trillion), and crossing over adds even more. This variation is the raw material for natural selection.\n\nIn reality, it’s a bit more complicated: crossing over is not random along chromosomes; it happens more often at “hotspots,” and each chromosome pair usually has at least one crossover to help it separate correctly.',
    quiz: [
      mc(
        'In which phase do homologous chromosomes separate?',
        ['Anaphase I', 'Anaphase II', 'Prophase I', 'Mitotic anaphase'],
        0,
        'Meiosis I separates homologs; meiosis II separates sister chromatids.',
      ),
      predict(
        'During meiosis I, chromosome 21’s homologs fail to separate (nondisjunction). A resulting egg is fertilized by a normal sperm.',
        'How many copies of chromosome 21 will the zygote have?',
        ['3 (trisomy 21)', '2', '1', '4'],
        0,
        'The egg carries 2 copies; the sperm adds 1, making 3 copies, which causes Down syndrome.',
      ),
      label(
        'Match each source of variation to its cause.',
        [
          ['Crossing over', 'Swapping segments between homologs'],
          ['Independent assortment', 'Random orientation of pairs at metaphase I'],
          ['Random fertilization', 'Any sperm can fertilize any egg'],
        ],
        'Together these make each offspring genetically unique (except identical twins).',
      ),
    ],
  }),

  hs({
    base: 'stem-cells',
    unit: 'division',
    summary:
      'Stem cells are unspecialized cells that can divide to renew themselves and differentiate into specialized cells. Their potency ranges from totipotent (any cell, even placenta) to multipotent (a family of related cells). Differentiation happens by switching genes on and off.',
    steps: [
      [
        'Unspecialized cells',
        'Every cell in your body has the same DNA, but a neuron and a muscle cell use different genes. Differentiation means expressing a particular set of genes to become specialized. Stem cells haven’t committed yet.',
      ],
      [
        'Self-renewal and differentiation',
        'When a stem cell divides by mitosis, one daughter can stay a stem cell (self-renewal) while the other differentiates. Signals from neighboring cells and the environment decide which genes switch on.',
      ],
      [
        'Potency',
        'Totipotent cells (the zygote and first few divisions) can form any cell, including the placenta. Pluripotent embryonic stem cells can form any body cell. Multipotent adult stem cells, like those in bone marrow, form only related types. iPS cells are adult cells reprogrammed back to pluripotency.',
      ],
    ],
    diagrams: [
      diagram(
        'From zygote to specialized cells',
        'Potency narrows as development goes on. Adult stem cells keep dividing to replace cells throughout life.',
        [
          circle(60, 40, 18, '#fde68a', { stroke: '#d97706', strokeWidth: 2, part: 'toti' }),
          text(60, 72, 'Zygote', { size: 10, bold: true, part: 'toti' }),
          text(60, 84, 'totipotent', { size: 8.5, fill: '#92400e', part: 'toti' }),
          arrow([80, 40], [124, 40], { strokeWidth: 2 }),
          circle(160, 40, 26, '#e0f2fe', { stroke: '#0284c7', strokeWidth: 2, part: 'pluri' }),
          path('M140 36 C146 22 166 22 172 34 C168 50 148 50 140 36 Z', {
            fill: '#7dd3fc',
            stroke: '#0284c7',
            part: 'pluri',
          }),
          text(194, 18, 'Blastocyst (inner cell mass)', {
            anchor: 'start',
            size: 9.5,
            bold: true,
            part: 'pluri',
          }),
          text(194, 30, 'pluripotent', {
            anchor: 'start',
            size: 8.5,
            fill: '#0369a1',
            part: 'pluri',
          }),
          arrow([180, 60], [226, 104], { strokeWidth: 2 }),
          arrow([142, 62], [94, 104], { strokeWidth: 2 }),
          circle(80, 122, 16, '#ede9fe', { stroke: '#7c3aed', strokeWidth: 2, part: 'multi' }),
          text(80, 152, 'Neural stem cell', { size: 9, bold: true, part: 'multi' }),
          circle(240, 122, 16, '#fee2e2', { stroke: '#dc2626', strokeWidth: 2, part: 'multi' }),
          text(240, 152, 'Blood stem cell', { size: 9, bold: true, part: 'multi' }),
          text(240, 164, 'multipotent', { size: 8.5, fill: '#b91c1c', part: 'multi' }),
          arrow([256, 112], [256, 132], {
            bend: -22,
            stroke: '#16a34a',
            strokeWidth: 2,
            part: 'renew',
          }),
          text(276, 125, 'self-renewal', {
            anchor: 'start',
            size: 8.5,
            bold: true,
            fill: '#15803d',
            part: 'renew',
          }),
          arrow([228, 172], [182, 204], { strokeWidth: 1.5, part: 'diff' }),
          arrow([240, 172], [240, 204], { strokeWidth: 1.5, part: 'diff' }),
          arrow([252, 172], [300, 204], { strokeWidth: 1.5, part: 'diff' }),
          ellipse(176, 220, 13, 8, '#f87171', { stroke: '#b91c1c', part: 'diff' }),
          circle(240, 220, 10, '#e0e7ff', { stroke: '#4338ca', part: 'diff' }),
          circle(237, 220, 4, '#6366f1', { part: 'diff' }),
          ...[
            [298, 216],
            [306, 224],
            [312, 214],
          ].map(([x, y]) =>
            circle(x, y, 3, '#fbbf24', { stroke: '#b45309', strokeWidth: 1, part: 'diff' }),
          ),
          text(176, 244, 'red cell', { size: 8, part: 'diff' }),
          text(240, 244, 'white cell', { size: 8, part: 'diff' }),
          text(306, 244, 'platelets', { size: 8, part: 'diff' }),
          arrow([70, 172], [46, 204], { strokeWidth: 1.5, part: 'diff' }),
          arrow([90, 172], [116, 204], { strokeWidth: 1.5, part: 'diff' }),
          path(
            'M30 222 L44 214 L52 222 L44 230 Z M44 214 L44 202 M52 222 L62 222 M30 222 L22 216',
            {
              stroke: '#7c3aed',
              fill: '#ddd6fe',
              part: 'diff',
            },
          ),
          text(44, 246, 'neuron', { size: 8, part: 'diff' }),
          circle(122, 222, 9, '#fef3c7', { stroke: '#b45309', part: 'diff' }),
          text(122, 246, 'glial cell', { size: 8, part: 'diff' }),
          rect(316, 44, 78, 58, '#ecfccb', { r: 10, stroke: '#65a30d', part: 'ips' }),
          text(355, 62, 'Skin cell', { size: 9, bold: true, part: 'ips' }),
          text(355, 76, '+ 4 genes', { size: 8.5, part: 'ips' }),
          text(355, 90, '→ iPS cell', { size: 9, bold: true, fill: '#3f6212', part: 'ips' }),
          arrow([314, 70], [190, 50], {
            bend: 12,
            stroke: '#65a30d',
            strokeWidth: 2,
            dash: true,
            part: 'ips',
          }),
        ],
        [
          [
            'toti',
            'Totipotent',
            [32, 18],
            'The fertilized egg and its first few divisions: can become any cell, including the placenta and membranes.',
          ],
          [
            'pluri',
            'Pluripotent',
            [128, 14],
            'Embryonic stem cells from the inner cell mass of a blastocyst (~5 days). They can become any of the ~200 body cell types, but not the placenta.',
          ],
          [
            'multi',
            'Multipotent',
            [110, 110],
            'Adult (tissue) stem cells, like those in bone marrow or the brain, produce only the cell types of their tissue.',
          ],
          [
            'renew',
            'Self-renewal',
            [330, 104],
            'One daughter stays a stem cell, so the supply never runs out. Bone marrow makes ~2 million red blood cells a second.',
          ],
          [
            'diff',
            'Differentiated cells',
            [154, 210],
            'Specialized cells with a fixed job. Most can no longer divide, and they express only the genes needed for their role.',
          ],
          [
            'ips',
            'Induced pluripotent stem (iPS) cells',
            [384, 112],
            'In 2006, Shinya Yamanaka showed that switching on four genes turns adult cells back into pluripotent cells, avoiding the use of embryos.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Differentiation', 'The process by which a cell becomes specialized.'],
      ['Potency', 'The range of cell types a stem cell can become.'],
      ['Pluripotent', 'Able to become any type of body cell.'],
      ['Multipotent', 'Able to become several related cell types.'],
      ['Gene expression', 'Turning a gene’s instructions into a protein (switching it “on”).'],
    ],
    goDeeper:
      'Bone marrow (hematopoietic stem cell) transplants are the most established stem cell therapy, used for leukemia and other blood disorders. Donor stem cells repopulate the patient’s marrow, which is why tissue matching matters: the new immune system must not attack its host.\n\nEmbryonic stem cell research raises ethical questions because collecting the cells destroys a blastocyst. iPS cells sidestep that and can be made from a patient’s own cells (avoiding rejection), but reprogramming can introduce mutations, and some early methods raised cancer risk. Researchers use iPS cells to grow “mini-organs” (organoids) to study diseases and test drugs.\n\nIn reality, it’s a bit more complicated: differentiation is controlled by transcription factors and epigenetic marks such as DNA methylation, which lock genes on or off and are copied when cells divide.',
    quiz: [
      mc(
        'What makes a stem cell different from a specialized cell?',
        [
          'It can self-renew and differentiate into other cell types',
          'It has more chromosomes',
          'It has different DNA',
          'It cannot divide',
        ],
        0,
        'All body cells share the same DNA; stem cells are unspecialized and can both renew themselves and give rise to specialized cells.',
      ),
      predict(
        'A patient’s bone marrow is destroyed by radiation treatment for leukemia, and they receive a transplant of donor hematopoietic stem cells.',
        'What can the transplanted cells produce?',
        [
          'All types of blood cells',
          'Any cell in the body, including neurons',
          'Only red blood cells',
          'Placenta cells',
        ],
        0,
        'Hematopoietic stem cells are multipotent: they make red cells, white cells and platelets, but not other tissues.',
      ),
      label(
        'Match each potency level to its example.',
        [
          ['Totipotent', 'Zygote'],
          ['Pluripotent', 'Embryonic stem cell'],
          ['Multipotent', 'Bone marrow stem cell'],
          ['Differentiated', 'Neuron'],
        ],
        'Potency narrows as development proceeds.',
      ),
    ],
  }),
];
