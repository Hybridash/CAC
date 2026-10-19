import type { Concept, DiagramShape } from '../../types';
import { label, mc, predict } from '../concepts/helpers';
import { arrow, circle, diagram, ellipse, hs, path, rect, text } from './build';

/** A row of carbon atoms (with optional phosphate groups at the ends) for pathway diagrams. */
function carbons(
  x: number,
  y: number,
  n: number,
  part: string,
  phosphates: ('start' | 'end')[] = [],
) {
  const out: DiagramShape[] = [];
  out.push(
    path(`M${x} ${y} L${x + (n - 1) * 12} ${y}`, { stroke: '#334155', strokeWidth: 2, part }),
  );
  for (let i = 0; i < n; i++) out.push(circle(x + i * 12, y, 5, '#334155', { part }));
  for (const p of phosphates) {
    const px = p === 'start' ? x - 14 : x + (n - 1) * 12 + 14;
    out.push(
      circle(px, y, 6, '#fca5a5', { stroke: '#b91c1c', strokeWidth: 1, part }),
      text(px, y + 3.5, 'P', { size: 8, bold: true, part }),
    );
  }
  return out;
}

/** Inner-membrane folds (cristae) of the mitochondrion diagram. */
function crista(x: number, y: number, down: boolean): DiagramShape {
  const d = down ? 1 : -1;
  return path(
    `M${x - 6} ${y - 3 * d} L${x - 6} ${y + 56 * d} Q${x} ${y + 66 * d} ${x + 6} ${y + 56 * d} L${x + 6} ${y - 3 * d}`,
    { fill: '#ffedd5', stroke: '#c2410c', strokeWidth: 2, part: 'cristae' },
  );
}

export const energy: Concept[] = [
  hs({
    base: 'photosynthesis',
    unit: 'energy',
    summary:
      'Photosynthesis converts light energy into chemical energy in two linked stages: the light-dependent reactions in the thylakoids make ATP and NADPH and release O₂, and the Calvin cycle in the stroma uses them to fix CO₂ into sugar.',
    steps: [
      [
        'Autotrophs and the equation',
        'Plants, algae and cyanobacteria are autotrophs: they make their own organic molecules. Overall: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. Light energy ends up stored in the chemical bonds of glucose.',
      ],
      [
        'Getting the reactants',
        'CO₂ diffuses into the leaf through stomata and into mesophyll cells. Water arrives from the roots through xylem. Light is captured in chloroplasts, which are concentrated in the palisade layer near the top of the leaf.',
      ],
      [
        'Pigments and photosystems',
        'Chlorophyll a, chlorophyll b and carotenoids sit in clusters called photosystems in the thylakoid membranes. Chlorophyll absorbs mainly blue (~430 nm) and red (~660 nm) light and reflects green, which is why leaves look green.',
      ],
      [
        'Light-dependent reactions',
        'Light excites electrons in chlorophyll. They pass down an electron transport chain, pumping H⁺ into the thylakoid space; ATP synthase uses that gradient to make ATP, and the electrons end up on NADPH. Water is split (photolysis) to replace the lost electrons, releasing O₂.',
      ],
      [
        'The Calvin cycle',
        'In the stroma, the enzyme rubisco attaches CO₂ to a 5-carbon sugar, RuBP (carbon fixation). ATP and NADPH from the light reactions reduce the products to G3P, a 3-carbon sugar. Most G3P regenerates RuBP; for every 3 CO₂ fixed, one G3P leaves to build glucose, sucrose or starch.',
      ],
      [
        'Limiting factors',
        'The rate is set by whichever factor is in shortest supply: light intensity, CO₂ concentration or temperature (which affects enzymes like rubisco). On a graph, the rate rises then levels off when a different factor becomes limiting. Greenhouses add heat, light and CO₂ to boost yield.',
      ],
    ],
    diagrams: [
      diagram(
        'Inside the chloroplast',
        'The two stages of photosynthesis are linked by energy carriers: the light reactions charge up ATP and NADPH, and the Calvin cycle spends them to turn CO₂ into sugar.',
        [
          ellipse(205, 142, 150, 96, '#dcfce7', {
            stroke: '#15803d',
            strokeWidth: 3,
            part: 'envelope',
          }),
          ...[0, 1, 2, 3, 4].map((i) =>
            rect(80, 96 + i * 12, 40, 9, '#4ade80', {
              r: 4,
              stroke: '#15803d',
              strokeWidth: 1,
              part: 'thylakoid',
            }),
          ),
          ...[0, 1, 2, 3, 4].map((i) =>
            rect(124, 118 + i * 12, 40, 9, '#4ade80', {
              r: 4,
              stroke: '#15803d',
              strokeWidth: 1,
              part: 'thylakoid',
            }),
          ),
          text(122, 86, 'Light reactions', {
            size: 9,
            bold: true,
            fill: '#166534',
            part: 'thylakoid',
          }),
          text(122, 196, 'thylakoids', { size: 8.5, fill: '#166534', part: 'thylakoid' }),
          circle(28, 30, 15, '#fde047', { stroke: '#ca8a04', part: 'light' }),
          arrow([44, 46], [82, 90], { stroke: '#ca8a04', strokeWidth: 2.5, part: 'light' }),
          text(64, 50, 'light', { anchor: 'start', size: 9, fill: '#a16207', part: 'light' }),
          arrow([14, 146], [74, 136], { stroke: '#0284c7', strokeWidth: 2, part: 'water' }),
          text(16, 136, 'H₂O', {
            anchor: 'start',
            size: 10,
            bold: true,
            fill: '#0369a1',
            part: 'water',
          }),
          arrow([104, 92], [104, 24], { stroke: '#0284c7', strokeWidth: 2, part: 'oxygen' }),
          text(114, 24, 'O₂', {
            anchor: 'start',
            size: 10,
            bold: true,
            fill: '#0369a1',
            part: 'oxygen',
          }),
          arrow([166, 126], [228, 126], { stroke: '#dc2626', strokeWidth: 2.5, part: 'carriers' }),
          text(197, 118, 'ATP, NADPH', {
            size: 8.5,
            bold: true,
            fill: '#dc2626',
            part: 'carriers',
          }),
          arrow([228, 164], [168, 164], { stroke: '#64748b', strokeWidth: 2, part: 'carriers' }),
          text(198, 178, 'ADP, NADP⁺', { size: 8.5, fill: '#475569', part: 'carriers' }),
          arrow([280, 100], [324, 144], {
            bend: -18,
            stroke: '#15803d',
            strokeWidth: 2.5,
            part: 'calvin',
          }),
          arrow([324, 146], [280, 190], {
            bend: -18,
            stroke: '#15803d',
            strokeWidth: 2.5,
            part: 'calvin',
          }),
          arrow([278, 190], [234, 146], {
            bend: -18,
            stroke: '#15803d',
            strokeWidth: 2.5,
            part: 'calvin',
          }),
          arrow([234, 144], [278, 100], {
            bend: -18,
            stroke: '#15803d',
            strokeWidth: 2.5,
            part: 'calvin',
          }),
          text(279, 142, 'Calvin', { size: 10, bold: true, fill: '#166534', part: 'calvin' }),
          text(279, 155, 'cycle', { size: 10, bold: true, fill: '#166534', part: 'calvin' }),
          text(279, 92, 'RuBP', { size: 8, fill: '#166534', part: 'calvin' }),
          arrow([388, 74], [318, 108], { stroke: '#475569', strokeWidth: 2, part: 'co2' }),
          text(392, 66, 'CO₂', { anchor: 'end', size: 10, bold: true, part: 'co2' }),
          arrow([314, 184], [370, 224], { stroke: '#b45309', strokeWidth: 2.5, part: 'sugar' }),
          text(396, 246, 'G3P → glucose', {
            anchor: 'end',
            size: 10,
            bold: true,
            fill: '#b45309',
            part: 'sugar',
          }),
          text(320, 218, 'stroma', { size: 9, fill: '#166534', part: 'calvin' }),
        ],
        [
          [
            'envelope',
            'Chloroplast envelope',
            [62, 196],
            'A double membrane surrounding the chloroplast, a clue that chloroplasts evolved from engulfed cyanobacteria.',
          ],
          [
            'light',
            'Light energy',
            [56, 22],
            'Photons are absorbed by chlorophyll in photosystems, exciting electrons to a higher energy level.',
          ],
          [
            'thylakoid',
            'Thylakoids (light-dependent reactions)',
            [174, 96],
            'Flattened membrane sacs stacked into grana. Their membranes hold photosystems, an electron transport chain and ATP synthase.',
          ],
          [
            'water',
            'Photolysis of water',
            [22, 168],
            'Water is split (2H₂O → 4H⁺ + 4e⁻ + O₂) to replace electrons lost from chlorophyll. All the O₂ comes from water, not CO₂.',
          ],
          [
            'oxygen',
            'Oxygen released',
            [86, 22],
            'O₂ is a by-product. It diffuses out of the leaf through the stomata.',
          ],
          [
            'carriers',
            'ATP and NADPH',
            [198, 146],
            'Energy carriers made in the light reactions. They shuttle energy and electrons to the Calvin cycle, then return as ADP and NADP⁺ to be recharged.',
          ],
          [
            'calvin',
            'Calvin cycle (stroma)',
            [338, 112],
            'Rubisco fixes CO₂ onto RuBP; ATP and NADPH turn the products into G3P; most G3P is recycled to regenerate RuBP.',
          ],
          [
            'co2',
            'Carbon dioxide',
            [372, 96],
            'Enters through stomata and is fixed by rubisco, the most abundant enzyme on Earth.',
          ],
          [
            'sugar',
            'G3P → sugars',
            [296, 230],
            'Two G3P molecules make one glucose. Plants convert sugar into sucrose for transport, starch for storage and cellulose for walls.',
          ],
        ],
      ),
      diagram(
        'Limiting factors',
        'Rate of photosynthesis as light intensity increases, under three conditions. Where a curve rises, light is limiting; where it flattens, something else is.',
        [
          path('M50 20 L50 220 L385 220', { strokeWidth: 2 }),
          text(56, 16, 'Rate of photosynthesis', { anchor: 'start', size: 10 }),
          text(385, 240, 'Light intensity →', { anchor: 'end', size: 10 }),
          path('M50 220 L106 164 Q120 150 150 150 L380 150', {
            stroke: '#22c55e',
            strokeWidth: 3,
            part: 'co2low',
          }),
          path('M50 220 L144 126 Q168 102 200 100 L380 100', {
            stroke: '#0ea5e9',
            strokeWidth: 3,
            part: 'co2high',
          }),
          path('M50 220 L184 86 Q210 60 246 58 L380 58', {
            stroke: '#f97316',
            strokeWidth: 3,
            part: 'temp',
          }),
          text(380, 144, '0.04% CO₂, 20 °C', {
            anchor: 'end',
            size: 9.5,
            fill: '#15803d',
            part: 'co2low',
          }),
          text(380, 94, '0.1% CO₂, 20 °C', {
            anchor: 'end',
            size: 9.5,
            fill: '#0369a1',
            part: 'co2high',
          }),
          text(380, 52, '0.1% CO₂, 30 °C', {
            anchor: 'end',
            size: 9.5,
            fill: '#c2410c',
            part: 'temp',
          }),
          rect(52, 168, 52, 50, '#fef9c3', { opacity: 0.7, part: 'lightlim' }),
          text(78, 196, 'light', { size: 9, bold: true, fill: '#a16207', part: 'lightlim' }),
          text(78, 208, 'limits', { size: 9, bold: true, fill: '#a16207', part: 'lightlim' }),
        ],
        [
          [
            'lightlim',
            'Light is the limiting factor',
            [118, 200],
            'On the steep part, all three curves overlap: adding light speeds things up, so light is what is holding the rate back.',
          ],
          [
            'co2low',
            'Plateau: CO₂ limits',
            [260, 164],
            'At normal air CO₂ (0.04%), extra light no longer helps. The Calvin cycle can’t fix CO₂ any faster.',
          ],
          [
            'co2high',
            'More CO₂, higher plateau',
            [260, 114],
            'Raising CO₂ lifts the plateau, which proves CO₂ was limiting on the lower curve.',
          ],
          [
            'temp',
            'Warmer, higher still',
            [260, 72],
            'At high CO₂, temperature becomes limiting: warming speeds up enzyme-controlled reactions (up to the optimum, after which rubisco and other enzymes denature).',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Chlorophyll', 'Green pigment that absorbs red and blue light.'],
      ['Thylakoid', 'Membrane sac in the chloroplast where the light reactions happen.'],
      ['Stroma', 'Fluid of the chloroplast where the Calvin cycle happens.'],
      ['Photolysis', 'Splitting water using light energy, which releases O₂.'],
      ['Rubisco', 'The enzyme that fixes CO₂ in the Calvin cycle.'],
      ['Limiting factor', 'The factor in shortest supply that restricts the rate of a process.'],
    ],
    goDeeper:
      'There are two photosystems, numbered in the order they were discovered. Photosystem II comes first: it absorbs light, splits water and passes excited electrons down a chain that pumps H⁺ into the thylakoid space. Photosystem I re-energizes the electrons with a second photon so they can reduce NADP⁺ to NADPH. The H⁺ gradient powers ATP synthase, the same chemiosmosis used in mitochondria.\n\nRubisco is surprisingly sloppy: in hot, dry conditions, when stomata close to save water, it grabs O₂ instead of CO₂ (photorespiration), wasting energy. C₄ plants such as corn and CAM plants such as cacti have evolved ways to concentrate CO₂ around rubisco to avoid this.\n\nIn reality, it’s a bit more complicated: the direct product of the Calvin cycle is G3P, not glucose; writing “glucose” in the summary equation is a convenient shorthand.',
    quiz: [
      mc(
        'Where does the oxygen released by photosynthesis come from?',
        [
          'Water, split in the light reactions',
          'Carbon dioxide, split in the Calvin cycle',
          'Glucose',
          'RuBP',
        ],
        0,
        'Experiments with heavy-oxygen isotopes showed that O₂ comes from H₂O during photolysis.',
      ),
      predict(
        'A plant is moved from bright light into darkness. Its Calvin cycle has plenty of CO₂.',
        'What happens to the Calvin cycle over the next few minutes?',
        [
          'It slows and stops, because ATP and NADPH run out',
          'It speeds up, because it is “light-independent”',
          'It switches to using O₂',
          'Nothing changes as long as CO₂ is available',
        ],
        0,
        'The Calvin cycle doesn’t use light directly, but it depends on ATP and NADPH from the light reactions.',
      ),
      label(
        'Match each stage or part to what it produces or does.',
        [
          ['Light-dependent reactions', 'Make ATP and NADPH, release O₂'],
          ['Calvin cycle', 'Fixes CO₂ into G3P'],
          ['Rubisco', 'Enzyme that attaches CO₂ to RuBP'],
          ['Stomata', 'Pores that let CO₂ into the leaf'],
        ],
        'The two stages are linked by ATP/NADPH going one way and ADP/NADP⁺ coming back.',
      ),
    ],
  }),

  hs({
    base: 'mitochondria',
    unit: 'energy',
    summary:
      'Aerobic cellular respiration releases the energy in glucose in three stages (glycolysis, the Krebs cycle and the electron transport chain), producing around 30 ATP per glucose. Most ATP is made in the folded inner membrane of the mitochondrion.',
    steps: [
      [
        'The overall equation',
        'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy (about 30–32 ATP). It is roughly the reverse of photosynthesis. The energy is released in small steps so it can be captured as ATP instead of lost as heat.',
      ],
      [
        'Glycolysis, then the matrix',
        'Glycolysis in the cytoplasm splits glucose into 2 pyruvate, making 2 ATP and 2 NADH. Pyruvate enters the mitochondrial matrix, loses a CO₂ (the link reaction) to form acetyl-CoA, which enters the Krebs (citric acid) cycle, releasing more CO₂ and loading NADH and FADH₂.',
      ],
      [
        'Cristae and the electron transport chain',
        'NADH and FADH₂ hand electrons to a chain of proteins in the inner membrane. Their energy pumps H⁺ into the intermembrane space. H⁺ flows back through ATP synthase, which spins and makes most of the cell’s ATP (chemiosmosis). Cristae give a huge surface area for this.',
      ],
      [
        'Products: CO₂ and water',
        'CO₂ from the link reaction and Krebs cycle diffuses into the blood and is exhaled. Oxygen is the final electron acceptor at the end of the chain: it combines with electrons and H⁺ to form water. Without O₂ the chain stops and cells fall back on fermentation.',
      ],
    ],
    diagrams: [
      diagram(
        'Structure of a mitochondrion',
        'A double-membrane organelle. The inner membrane is folded into cristae; the space it encloses is the matrix.',
        [
          ellipse(200, 130, 182, 104, '#ffedd5', {
            stroke: '#ea580c',
            strokeWidth: 3,
            part: 'outer',
          }),
          ellipse(200, 130, 166, 86, '#fef3c7', {
            stroke: '#c2410c',
            strokeWidth: 2,
            part: 'cristae',
          }),
          crista(90, 66, true),
          crista(170, 46, true),
          crista(250, 48, true),
          crista(330, 77, true),
          crista(130, 208, false),
          crista(210, 216, false),
          crista(290, 202, false),
          circle(225, 128, 10, 'none', { stroke: '#7c3aed', strokeWidth: 2, part: 'dna' }),
          ...[
            [190, 124],
            [194, 140],
            [246, 136],
            [150, 120],
          ].map(([x, y]) => circle(x, y, 2.2, '#1e293b', { part: 'dna' })),
          path('M256 104 L264 104', { stroke: '#7c3aed', strokeWidth: 2.5, part: 'synthase' }),
          circle(270, 104, 5, '#a78bfa', { stroke: '#6d28d9', part: 'synthase' }),
          path('M84 116 L76 116', { stroke: '#7c3aed', strokeWidth: 2.5, part: 'synthase' }),
          circle(71, 116, 5, '#a78bfa', { stroke: '#6d28d9', part: 'synthase' }),
          text(310, 124, 'matrix', { size: 10, bold: true, fill: '#92400e', part: 'matrix' }),
        ],
        [
          [
            'outer',
            'Outer membrane',
            [52, 52],
            'Smooth and fairly permeable; it encloses the whole organelle.',
          ],
          [
            'ims',
            'Intermembrane space',
            [27, 130],
            'The narrow gap between the membranes (and inside each crista). H⁺ is pumped in here, building a high concentration.',
          ],
          [
            'cristae',
            'Inner membrane & cristae',
            [176, 22],
            'Folds that greatly increase surface area. They hold the electron transport chain and ATP synthase. Very active cells, like heart muscle, have more cristae.',
          ],
          [
            'matrix',
            'Matrix',
            [334, 148],
            'Gel-like interior where the link reaction and Krebs cycle happen. Contains enzymes, ribosomes and DNA.',
          ],
          [
            'synthase',
            'ATP synthase',
            [282, 96],
            'A molecular turbine. H⁺ flowing down its gradient from the intermembrane space into the matrix spins it, joining ADP and Pᵢ into ATP.',
          ],
          [
            'dna',
            'Mitochondrial DNA & ribosomes',
            [226, 150],
            'A small circular chromosome and bacteria-like ribosomes. Evidence for endosymbiosis; mtDNA is inherited from the mother.',
          ],
        ],
      ),
      diagram(
        'The three stages of aerobic respiration',
        'Where each stage happens, what goes in and what comes out, for one glucose molecule.',
        [
          rect(8, 80, 112, 62, '#e0f2fe', { r: 12, stroke: '#0284c7', part: 'glyco' }),
          text(64, 106, 'Glycolysis', { bold: true, part: 'glyco' }),
          text(64, 122, 'cytoplasm', { size: 9, fill: '#475569', part: 'glyco' }),
          rect(144, 80, 112, 62, '#fef3c7', { r: 12, stroke: '#d97706', part: 'krebs' }),
          text(200, 102, 'Link reaction +', { size: 10, bold: true, part: 'krebs' }),
          text(200, 116, 'Krebs cycle', { bold: true, part: 'krebs' }),
          text(200, 131, 'matrix', { size: 9, fill: '#475569', part: 'krebs' }),
          rect(280, 80, 112, 62, '#fce7f3', { r: 12, stroke: '#db2777', part: 'etc' }),
          text(336, 102, 'Electron', { size: 10, bold: true, part: 'etc' }),
          text(336, 116, 'transport chain', { size: 10, bold: true, part: 'etc' }),
          text(336, 131, 'inner membrane', { size: 9, fill: '#475569', part: 'etc' }),
          arrow([120, 111], [142, 111], { strokeWidth: 2.5 }),
          text(132, 72, '2 pyruvate', { size: 8.5, fill: '#475569', part: 'glyco' }),
          arrow([256, 111], [278, 111], { strokeWidth: 2.5, part: 'carriers' }),
          text(268, 66, 'NADH,', { size: 8.5, bold: true, fill: '#7c3aed', part: 'carriers' }),
          text(268, 77, 'FADH₂', { size: 8.5, bold: true, fill: '#7c3aed', part: 'carriers' }),
          arrow([64, 30], [64, 76], { strokeWidth: 2, part: 'glyco' }),
          text(64, 24, 'glucose (C₆H₁₂O₆)', { size: 9.5, bold: true, part: 'glyco' }),
          arrow([336, 30], [336, 76], { strokeWidth: 2, stroke: '#0284c7', part: 'oxygen' }),
          text(336, 24, '6 O₂', { size: 10, bold: true, fill: '#0369a1', part: 'oxygen' }),
          arrow([64, 146], [64, 178], { stroke: '#dc2626', strokeWidth: 2 }),
          text(64, 194, '2 ATP', { size: 11, bold: true, fill: '#dc2626', part: 'glyco' }),
          arrow([200, 146], [200, 178], { stroke: '#dc2626', strokeWidth: 2 }),
          text(200, 194, '2 ATP', { size: 11, bold: true, fill: '#dc2626', part: 'krebs' }),
          text(200, 208, '+ 6 CO₂ (exhaled)', { size: 9, fill: '#475569', part: 'krebs' }),
          arrow([336, 146], [336, 178], { stroke: '#dc2626', strokeWidth: 2 }),
          text(336, 194, '~26–28 ATP', { size: 11, bold: true, fill: '#dc2626', part: 'etc' }),
          text(336, 208, '+ 6 H₂O', { size: 9, fill: '#0369a1', part: 'oxygen' }),
          rect(70, 224, 260, 26, '#f1f5f9', { r: 8, part: 'total' }),
          text(200, 241, 'Total ≈ 30–32 ATP per glucose', {
            size: 10.5,
            bold: true,
            part: 'total',
          }),
        ],
        [
          [
            'glyco',
            'Glycolysis',
            [18, 64],
            'Glucose (6C) → 2 pyruvate (3C) in the cytoplasm. Net 2 ATP and 2 NADH. Needs no oxygen.',
          ],
          [
            'krebs',
            'Link reaction & Krebs cycle',
            [246, 152],
            'Each pyruvate becomes acetyl-CoA, which the Krebs cycle oxidizes completely. All of glucose’s carbon leaves as CO₂.',
          ],
          [
            'carriers',
            'NADH and FADH₂',
            [292, 60],
            'Electron carriers loaded in the earlier stages. They deliver high-energy electrons to the chain.',
          ],
          [
            'etc',
            'Electron transport chain',
            [384, 152],
            'Electrons pass along proteins, pumping H⁺ across the inner membrane; ATP synthase uses the gradient. This makes about 90% of the ATP.',
          ],
          [
            'oxygen',
            'Oxygen: final electron acceptor',
            [366, 36],
            'O₂ accepts electrons at the end of the chain, forming water. No O₂ means the chain backs up and stops.',
          ],
          [
            'total',
            'Total yield',
            [346, 237],
            'Modern estimates are about 30–32 ATP per glucose; older textbooks say 36–38, assuming perfect efficiency.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Aerobic respiration', 'Releasing energy from glucose using oxygen.'],
      [
        'Krebs cycle',
        'A cycle in the matrix that oxidizes acetyl-CoA, releasing CO₂ and loading carriers.',
      ],
      ['NADH / FADH₂', 'Electron carriers that deliver electrons to the transport chain.'],
      ['Chemiosmosis', 'Making ATP using the flow of H⁺ through ATP synthase.'],
      ['Cristae', 'Folds of the inner mitochondrial membrane.'],
    ],
    goDeeper:
      'Cyanide is deadly because it blocks the last protein of the electron transport chain (cytochrome c oxidase), so oxygen can’t accept electrons. The chain stops, the H⁺ gradient collapses and ATP production plummets, even though the blood is full of oxygen.\n\nRespiration isn’t only for glucose. Fats are broken into fatty acids that enter the Krebs cycle as acetyl-CoA (one reason fats store more energy per gram), and amino acids can enter at several points after their nitrogen is removed as urea.\n\nIn reality, it’s a bit more complicated: the ATP yield isn’t a fixed whole number, because some of the H⁺ gradient leaks and is used to transport other molecules. Brown fat deliberately lets H⁺ leak through a protein called UCP1 to generate heat instead of ATP.',
    quiz: [
      mc(
        'Which stage of aerobic respiration produces the most ATP?',
        ['The electron transport chain', 'Glycolysis', 'The Krebs cycle', 'The link reaction'],
        0,
        'Chemiosmosis at the inner membrane makes about 26–28 of the ~30 ATP per glucose.',
      ),
      predict(
        'A drug makes the inner mitochondrial membrane leaky to H⁺.',
        'What happens?',
        [
          'ATP production falls and more energy is released as heat',
          'ATP production rises',
          'Glycolysis stops completely',
          'The cell stops using oxygen',
        ],
        0,
        'Without a gradient, ATP synthase can’t make ATP, but the chain keeps running and its energy is lost as heat, which is what brown fat does on purpose.',
      ),
      label(
        'Match each stage to where it happens.',
        [
          ['Glycolysis', 'Cytoplasm'],
          ['Krebs cycle', 'Mitochondrial matrix'],
          ['Electron transport chain', 'Inner mitochondrial membrane'],
        ],
        'Only glycolysis happens outside the mitochondrion.',
      ),
    ],
  }),

  hs({
    base: 'glycolysis',
    unit: 'energy',
    summary:
      'Glycolysis is a 10-step pathway in the cytoplasm that splits glucose into two pyruvate. It invests 2 ATP, then makes 4 ATP and 2 NADH, for a net gain of 2 ATP, without needing oxygen.',
    steps: [
      [
        'Energy investment',
        'Glucose is phosphorylated twice, using 2 ATP. The phosphates trap glucose inside the cell and destabilize it, producing fructose-1,6-bisphosphate, a 6-carbon sugar with a phosphate on each end.',
      ],
      [
        'Splitting the sugar',
        'An enzyme splits the 6-carbon sugar into two 3-carbon molecules of glyceraldehyde-3-phosphate (G3P). From here on, every step happens twice per glucose.',
      ],
      [
        'Energy payoff',
        'Each G3P is oxidized: its electrons and H⁺ reduce NAD⁺ to NADH. Phosphate groups are then transferred directly from the sugars to ADP, making 2 ATP per G3P (substrate-level phosphorylation).',
      ],
      [
        'Net yield',
        'Per glucose: 4 ATP made − 2 ATP invested = 2 ATP net, plus 2 NADH and 2 pyruvate. With oxygen, pyruvate goes on into the mitochondria; without it, fermentation recycles the NADH back to NAD⁺.',
      ],
    ],
    diagrams: [
      diagram(
        'Glycolysis at a glance',
        'Black dots are carbon atoms. Glucose (6C) is primed with two phosphates, split into two 3C sugars, and each is oxidized to pyruvate.',
        [
          ...carbons(18, 70, 6, 'glucose'),
          text(48, 52, 'Glucose', { bold: true, part: 'glucose' }),
          arrow([88, 70], [130, 70], { strokeWidth: 2.5, part: 'invest' }),
          text(109, 92, '2 ATP', { size: 9, bold: true, fill: '#dc2626', part: 'invest' }),
          text(109, 104, '→ 2 ADP', { size: 9, fill: '#475569', part: 'invest' }),
          ...carbons(158, 70, 6, 'invest', ['start', 'end']),
          text(188, 52, 'Fructose-1,6-bisphosphate', { size: 9, bold: true, part: 'invest' }),
          arrow([238, 70], [262, 40], { strokeWidth: 2, part: 'split' }),
          arrow([238, 70], [262, 100], { strokeWidth: 2, part: 'split' }),
          ...carbons(270, 40, 3, 'split', ['end']),
          ...carbons(270, 100, 3, 'split', ['end']),
          text(288, 24, 'G3P', { size: 9, bold: true, part: 'split' }),
          text(288, 124, 'G3P', { size: 9, bold: true, part: 'split' }),
          arrow([318, 40], [346, 40], { strokeWidth: 2, part: 'payoff' }),
          arrow([318, 100], [346, 100], { strokeWidth: 2, part: 'payoff' }),
          ...carbons(352, 40, 3, 'pyruvate'),
          ...carbons(352, 100, 3, 'pyruvate'),
          text(364, 24, 'Pyruvate', { size: 9, bold: true, part: 'pyruvate' }),
          text(364, 124, 'Pyruvate', { size: 9, bold: true, part: 'pyruvate' }),
          text(332, 62, 'NADH, 2 ATP', { size: 8, bold: true, fill: '#dc2626', part: 'payoff' }),
          text(332, 86, 'NADH, 2 ATP', { size: 8, bold: true, fill: '#dc2626', part: 'payoff' }),
          path('M14 150 L14 158 L234 158 L234 150', { stroke: '#94a3b8', strokeWidth: 1.5 }),
          text(124, 174, 'Energy investment phase', {
            size: 10,
            bold: true,
            fill: '#475569',
            part: 'invest',
          }),
          path('M246 150 L246 158 L392 158 L392 150', { stroke: '#94a3b8', strokeWidth: 1.5 }),
          text(319, 174, 'Energy payoff phase', {
            size: 10,
            bold: true,
            fill: '#475569',
            part: 'payoff',
          }),
          rect(40, 196, 320, 50, '#f1f5f9', { r: 10, stroke: '#cbd5e1', part: 'net' }),
          text(200, 216, 'Net per glucose: 2 ATP · 2 NADH · 2 pyruvate', {
            size: 11,
            bold: true,
            part: 'net',
          }),
          text(200, 234, '(4 ATP made − 2 ATP spent; no O₂ needed; in the cytoplasm)', {
            size: 9,
            fill: '#475569',
            part: 'net',
          }),
        ],
        [
          [
            'glucose',
            'Glucose (6 carbons)',
            [18, 40],
            'The starting fuel, absorbed from the blood. Its 6 carbons end up in two 3-carbon pyruvates.',
          ],
          [
            'invest',
            'Phosphorylation (investment)',
            [112, 124],
            'Two ATP each donate a phosphate. This “activation” makes the sugar unstable enough to split and keeps it from leaking out of the cell.',
          ],
          [
            'split',
            'Splitting into two G3P',
            [236, 112],
            'The 6C sugar breaks into two 3C phosphorylated sugars, which both continue down the pathway.',
          ],
          [
            'payoff',
            'Oxidation & ATP payoff',
            [332, 136],
            'Each G3P gives up electrons to NAD⁺ (making NADH) and transfers two phosphates to ADP (making 2 ATP by substrate-level phosphorylation).',
          ],
          [
            'pyruvate',
            'Pyruvate (3 carbons)',
            [392, 70],
            'The end product. With O₂ it enters the mitochondrion; without O₂ it is fermented.',
          ],
          [
            'net',
            'Net yield',
            [372, 196],
            'Glycolysis captures only about 2% of glucose’s energy; most is still locked in pyruvate.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Glycolysis', 'Splitting glucose into 2 pyruvate in the cytoplasm.'],
      [
        'Substrate-level phosphorylation',
        'Making ATP by moving a phosphate directly from a molecule to ADP.',
      ],
      ['NAD⁺ / NADH', 'An electron carrier, oxidized (NAD⁺) and reduced (NADH).'],
      ['Pyruvate', 'The 3-carbon end product of glycolysis.'],
      ['Oxidation', 'Loss of electrons (often with H⁺).'],
    ],
    goDeeper:
      'Glycolysis is probably the oldest energy pathway on Earth. It is found in almost every organism, happens in the cytoplasm, and needs no oxygen: all signs that it evolved before the atmosphere had much O₂ and before mitochondria existed.\n\nThe pathway is tightly regulated. The enzyme phosphofructokinase (the third step) is the main control point: high ATP inhibits it (the cell has enough energy), while high AMP (a sign of low energy) activates it. This is a classic example of allosteric feedback inhibition.\n\nIn reality, it’s a bit more complicated: there are 10 separate enzyme-catalyzed steps, each with its own intermediate. Many cancer cells rely heavily on glycolysis even when oxygen is available (the Warburg effect), which is used in PET scans to spot tumors.',
    quiz: [
      mc(
        'Why is the net ATP yield of glycolysis 2 rather than 4?',
        [
          'Two ATP are invested at the start',
          'Two ATP are lost as heat',
          'Two ATP are used to make NADH',
          'Only half the glucose is used',
        ],
        0,
        'The investment phase uses 2 ATP; the payoff phase makes 4, giving a net of 2.',
      ),
      predict(
        'A cell has plenty of glucose but runs out of NAD⁺ (all of it is stuck as NADH).',
        'What happens to glycolysis?',
        [
          'It stops at the G3P oxidation step',
          'It speeds up',
          'It continues, but makes no ATP',
          'It switches to making glucose',
        ],
        0,
        'Oxidizing G3P requires NAD⁺. Regenerating NAD⁺ is exactly why cells ferment when oxygen is scarce.',
      ),
      label(
        'Match each molecule to its role in glycolysis.',
        [
          ['Glucose', 'Starting 6-carbon fuel'],
          ['ATP (early steps)', 'Invested to phosphorylate the sugar'],
          ['NAD⁺', 'Accepts electrons when G3P is oxidized'],
          ['Pyruvate', '3-carbon end product'],
        ],
        'Glycolysis = investment, split, payoff.',
      ),
    ],
  }),

  hs({
    base: 'fermentation',
    unit: 'energy',
    summary:
      'Without oxygen, cells can still make ATP by glycolysis if they regenerate NAD⁺. Fermentation does this by passing NADH’s electrons to pyruvate, producing lactate (in animals) or ethanol and CO₂ (in yeast), for only 2 ATP per glucose.',
    steps: [
      [
        'Anaerobic respiration',
        'When O₂ is missing, the electron transport chain stops and NADH can’t unload there. Glycolysis would halt for lack of NAD⁺. Fermentation keeps it running by recycling NADH back to NAD⁺, with no extra ATP made.',
      ],
      [
        'Alcoholic fermentation',
        'Yeast and some bacteria remove CO₂ from pyruvate (making acetaldehyde), then reduce it to ethanol with NADH. The CO₂ makes bread rise; the ethanol is the alcohol in brewing.',
      ],
      [
        'Lactic acid fermentation',
        'Muscle cells working faster than their O₂ supply, and bacteria that make yogurt, reduce pyruvate directly to lactate using NADH. No CO₂ is produced. Lactate goes to the liver, which can turn it back into glucose.',
      ],
      [
        'Efficiency',
        'Fermentation makes only the 2 ATP from glycolysis, versus about 30 with oxygen, because most of glucose’s energy stays locked in lactate or ethanol. After hard exercise you keep breathing heavily to repay the “oxygen debt.”',
      ],
    ],
    diagrams: [
      diagram(
        'Two fermentation pathways',
        'Both start with glycolysis and both exist to turn NADH back into NAD⁺ so glycolysis can keep making ATP.',
        [
          text(64, 42, 'Glucose', { bold: true, part: 'glyco' }),
          arrow([92, 38], [146, 38], { strokeWidth: 2 }),
          rect(150, 18, 100, 40, '#e0f2fe', { r: 10, stroke: '#0284c7', part: 'glyco' }),
          text(200, 36, 'Glycolysis', { bold: true, part: 'glyco' }),
          text(200, 50, '+2 ATP', { size: 9, bold: true, fill: '#dc2626', part: 'glyco' }),
          arrow([200, 60], [200, 86], { strokeWidth: 2 }),
          rect(160, 88, 80, 28, '#fef3c7', { r: 10, stroke: '#d97706', part: 'pyruvate' }),
          text(200, 106, '2 Pyruvate', { size: 10, bold: true, part: 'pyruvate' }),
          arrow([172, 118], [110, 152], { strokeWidth: 2, part: 'alcohol' }),
          arrow([228, 118], [290, 152], { strokeWidth: 2, part: 'lactic' }),
          text(200, 140, 'each path uses 2 NADH', {
            size: 8.5,
            bold: true,
            fill: '#7c3aed',
            part: 'nad',
          }),
          rect(30, 154, 130, 34, '#fae8ff', { r: 10, stroke: '#a21caf', part: 'alcohol' }),
          text(95, 176, '2 Ethanol + 2 CO₂', { size: 10, bold: true, part: 'alcohol' }),
          text(95, 202, 'Alcoholic: yeast', { size: 9, fill: '#475569', part: 'alcohol' }),
          rect(240, 154, 130, 34, '#fee2e2', { r: 10, stroke: '#dc2626', part: 'lactic' }),
          text(305, 176, '2 Lactate', { size: 10, bold: true, part: 'lactic' }),
          text(305, 202, 'Lactic acid: muscles', { size: 9, fill: '#475569', part: 'lactic' }),
          arrow([30, 160], [148, 30], {
            bend: 70,
            stroke: '#7c3aed',
            strokeWidth: 2,
            dash: true,
            part: 'nad',
          }),
          arrow([370, 160], [252, 30], {
            bend: -70,
            stroke: '#7c3aed',
            strokeWidth: 2,
            dash: true,
            part: 'nad',
          }),
          text(28, 84, '2 NAD⁺', { size: 9, bold: true, fill: '#7c3aed', part: 'nad' }),
          text(372, 84, '2 NAD⁺', { size: 9, bold: true, fill: '#7c3aed', part: 'nad' }),
          text(14, 230, 'ATP per glucose', {
            anchor: 'start',
            size: 9,
            bold: true,
            fill: '#475569',
            part: 'yield',
          }),
          rect(110, 222, 8, 10, '#ef4444', { part: 'yield' }),
          text(122, 231, 'fermentation: 2', { anchor: 'start', size: 8.5, part: 'yield' }),
          rect(110, 238, 120, 10, '#22c55e', { part: 'yield' }),
          text(234, 247, 'aerobic: ~30', { anchor: 'start', size: 8.5, part: 'yield' }),
        ],
        [
          [
            'glyco',
            'Glycolysis',
            [262, 20],
            'The only ATP-making step in fermentation: 2 ATP per glucose, which requires a supply of NAD⁺.',
          ],
          [
            'pyruvate',
            'Pyruvate',
            [252, 102],
            'Without oxygen, pyruvate stays in the cytoplasm instead of entering the mitochondrion.',
          ],
          [
            'alcohol',
            'Alcoholic fermentation',
            [20, 186],
            'Pyruvate loses CO₂, then NADH reduces it to ethanol. Used in baking and brewing. Yeast dies when ethanol levels get too high.',
          ],
          [
            'lactic',
            'Lactic acid fermentation',
            [382, 186],
            'NADH reduces pyruvate straight to lactate. Happens in muscles during sprints and in bacteria that make yogurt and sauerkraut.',
          ],
          [
            'nad',
            'NAD⁺ regenerated',
            [56, 100],
            'The whole point: NADH hands its electrons to the pyruvate-derived molecule, freeing NAD⁺ to be reused in glycolysis.',
          ],
          [
            'yield',
            'Low ATP yield',
            [382, 236],
            'Fermentation gets about 2 ATP per glucose versus about 30 with oxygen, roughly 15× less.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Anaerobic', 'Without oxygen.'],
      ['Fermentation', 'Regenerating NAD⁺ by reducing pyruvate, so glycolysis can continue.'],
      ['Lactate', 'Product of lactic acid fermentation in animals and some bacteria.'],
      ['Ethanol', 'Alcohol produced by yeast during alcoholic fermentation.'],
      [
        'Oxygen debt (EPOC)',
        'Extra oxygen used after exercise to deal with lactate and restore ATP.',
      ],
    ],
    goDeeper:
      'Organisms differ in how they handle oxygen. Obligate aerobes (like humans overall) need O₂. Obligate anaerobes (like the bacteria that cause botulism and tetanus) are poisoned by it. Facultative anaerobes (like yeast and E. coli) respire aerobically when O₂ is present and switch to fermentation when it isn’t.\n\nThe burn you feel in sprinting muscles was long blamed on lactic acid, but lactate itself is now known to be a useful fuel: the heart and liver take it up, and the liver converts it back to glucose (the Cori cycle). Muscle fatigue has several causes, including H⁺ build-up and changes in calcium handling.\n\nIn reality, it’s a bit more complicated: “anaerobic respiration” strictly means using an electron transport chain with a final acceptor other than O₂ (like sulfate or nitrate, used by some bacteria). Fermentation uses no electron transport chain at all.',
    quiz: [
      mc(
        'What is the main purpose of fermentation?',
        [
          'To regenerate NAD⁺ so glycolysis can continue',
          'To make large amounts of ATP',
          'To produce oxygen',
          'To break down lactate',
        ],
        0,
        'Fermentation itself makes no ATP; it recycles NAD⁺ so glycolysis can keep making its 2 ATP.',
      ),
      predict(
        'Bread dough with yeast is left in a warm, sealed container.',
        'Which products build up?',
        ['Carbon dioxide and ethanol', 'Lactate only', 'Oxygen and glucose', 'Water and ATP only'],
        0,
        'Yeast performs alcoholic fermentation: the CO₂ makes the dough rise and the ethanol evaporates during baking.',
      ),
      label(
        'Match each organism or tissue to its fermentation product.',
        [
          ['Yeast', 'Ethanol and CO₂'],
          ['Sprinting muscle', 'Lactate'],
          ['Yogurt bacteria', 'Lactate (lactic acid)'],
        ],
        'Only alcoholic fermentation releases CO₂.',
      ),
    ],
  }),
];
