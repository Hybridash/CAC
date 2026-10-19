import type { Concept } from '../../types';
import { label, mc, predict } from '../concepts/helpers';
import { arrow, circle, diagram, ellipse, hs, path, rect, text } from './build';

const INK = '#334155';

export const chemistry: Concept[] = [
  hs({
    base: 'enzymes',
    unit: 'chemistry',
    summary:
      'Enzymes are protein catalysts that lower a reaction’s activation energy by stabilizing its transition state. They speed reactions up without being used up or changing the overall energy released.',
    steps: [
      [
        'Activation energy (Eₐ)',
        'Every reaction passes through an unstable, high-energy transition state. The energy needed to reach it is the activation energy, Eₐ. Even a reaction that releases energy overall (ΔG < 0) can be extremely slow if Eₐ is large.',
      ],
      [
        'Catalysis: a lower path',
        'An enzyme binds its substrate at the active site and stabilizes the transition state, lowering Eₐ. It does not change ΔG or the final equilibrium. It only gets there faster, and the enzyme comes out unchanged, ready for the next substrate.',
      ],
      [
        'Temperature and rate',
        'Heat raises kinetic energy, so substrates and enzymes collide more often and rate climbs, up to the optimum (about 37 °C for most human enzymes). Past it, the weak bonds holding the enzyme’s 3D shape break and the rate crashes.',
      ],
      [
        'Denaturation and pH',
        'Each enzyme has an optimum pH: pepsin works near pH 2 in the stomach, trypsin near pH 8 in the small intestine. Extreme pH changes the charges on amino acid R-groups, the active site loses its shape, and the substrate no longer fits. This is denaturation.',
      ],
    ],
    diagrams: [
      diagram(
        'Energy profile of a reaction',
        'Free energy as reactants turn into products, with (solid) and without (dashed) an enzyme. The enzyme lowers the peak but leaves the start and end levels unchanged.',
        [
          path('M40 20 L40 230 L385 230', { strokeWidth: 2 }),
          text(46, 16, 'Free energy', { anchor: 'start', size: 10 }),
          text(384, 248, 'Reaction progress →', { anchor: 'end', size: 10 }),
          path('M45 150 L110 150 C150 150 160 40 200 40 C240 40 250 190 290 190 L380 190', {
            stroke: '#ef4444',
            strokeWidth: 3,
            dash: true,
            part: 'uncat',
          }),
          path('M45 150 L110 150 C150 150 165 105 200 105 C235 105 250 190 290 190 L380 190', {
            stroke: '#7c3aed',
            strokeWidth: 3,
            part: 'cat',
          }),
          path('M110 150 L240 150', { stroke: '#94a3b8', strokeWidth: 1, dash: true }),
          path('M290 150 L345 150', { stroke: '#94a3b8', strokeWidth: 1, dash: true }),
          arrow([192, 148], [192, 44], { stroke: '#ef4444', part: 'uncat' }),
          arrow([206, 148], [206, 109], { stroke: '#7c3aed', part: 'cat' }),
          arrow([340, 152], [340, 186], { stroke: '#0f766e', part: 'dg' }),
          text(184, 84, 'Eₐ', { anchor: 'end', fill: '#ef4444', bold: true, part: 'uncat' }),
          text(213, 142, 'Eₐ', { anchor: 'start', fill: '#7c3aed', bold: true, part: 'cat' }),
          text(348, 173, 'ΔG', { anchor: 'start', fill: '#0f766e', bold: true, part: 'dg' }),
          text(72, 142, 'Reactants', { part: 'reactants' }),
          text(330, 205, 'Products', { part: 'products' }),
          rect(250, 22, 132, 40, '#f8fafc', { r: 6, stroke: '#e2e8f0' }),
          path('M258 34 L280 34', { stroke: '#ef4444', strokeWidth: 3, dash: true }),
          text(286, 37, 'no enzyme', { anchor: 'start', size: 10 }),
          path('M258 52 L280 52', { stroke: '#7c3aed', strokeWidth: 3 }),
          text(286, 55, 'with enzyme', { anchor: 'start', size: 10 }),
        ],
        [
          [
            'reactants',
            'Reactants (substrates)',
            [72, 165],
            'The starting molecules and their free energy. An enzyme does not change this level.',
          ],
          [
            'uncat',
            'Transition state & Eₐ without enzyme',
            [160, 50],
            'The peak is the unstable transition state. The height from reactants to peak is the activation energy. Without a catalyst it is high, so few collisions have enough energy to react.',
          ],
          [
            'cat',
            'Eₐ with enzyme',
            [240, 98],
            'The enzyme binds the substrate in a way that stabilizes the transition state, so the peak is much lower and many more molecules can react each second.',
          ],
          [
            'dg',
            'ΔG (overall energy change)',
            [360, 150],
            'The difference between reactants and products. It is the same with or without an enzyme: catalysts change the rate, not how much energy is released.',
          ],
          [
            'products',
            'Products',
            [365, 205],
            'Lower in energy than the reactants here, so the reaction is exergonic (releases energy, ΔG < 0).',
          ],
        ],
      ),
      diagram(
        'Induced fit at the active site',
        'The substrate binds the active site, the enzyme shifts its shape to grip it tightly, the reaction happens, and the products are released. The enzyme is unchanged.',
        [
          ellipse(70, 160, 46, 34, '#c4b5fd', { stroke: '#6d28d9', part: 'enzyme' }),
          rect(56, 123, 28, 20, '#fff', { r: 4, part: 'site' }),
          rect(57, 60, 26, 18, '#4ade80', { r: 5, stroke: '#15803d', part: 'substrate' }),
          arrow([70, 82], [70, 118], { stroke: '#15803d', dash: true }),
          arrow([125, 160], [160, 160]),
          ellipse(205, 160, 44, 36, '#c4b5fd', { stroke: '#6d28d9', part: 'complex' }),
          path('M190 126 C190 140 220 140 220 126', {
            fill: '#fff',
            stroke: '#6d28d9',
            part: 'complex',
          }),
          rect(193, 120, 24, 16, '#4ade80', { r: 5, stroke: '#15803d', part: 'complex' }),
          arrow([258, 160], [293, 160]),
          ellipse(340, 160, 46, 34, '#c4b5fd', { stroke: '#6d28d9', part: 'enzyme' }),
          rect(326, 123, 28, 20, '#fff', { r: 4, part: 'site' }),
          rect(306, 72, 16, 14, '#86efac', { r: 4, stroke: '#15803d', part: 'products' }),
          rect(358, 64, 16, 14, '#86efac', { r: 4, stroke: '#15803d', part: 'products' }),
          arrow([330, 112], [318, 92], { stroke: '#15803d', dash: true }),
          arrow([350, 112], [362, 84], { stroke: '#15803d', dash: true }),
          text(70, 215, 'Enzyme + substrate', { size: 10 }),
          text(205, 218, 'Enzyme–substrate complex', { size: 10 }),
          text(340, 215, 'Enzyme + products', { size: 10 }),
          path('M70 232 C150 256 260 256 340 232', {
            stroke: '#94a3b8',
            strokeWidth: 1.5,
            dash: true,
          }),
          text(205, 250, 'enzyme is reused', { size: 9, fill: '#64748b' }),
        ],
        [
          [
            'substrate',
            'Substrate',
            [94, 58],
            'The reactant the enzyme acts on. Its shape and charges match the active site.',
          ],
          [
            'site',
            'Active site',
            [42, 128],
            'A pocket formed by a few amino acids whose R-groups bind the substrate and help break or form bonds.',
          ],
          [
            'enzyme',
            'Enzyme (protein)',
            [28, 182],
            'A folded chain of amino acids. Its exact 3D shape (tertiary structure) creates the active site.',
          ],
          [
            'complex',
            'Enzyme–substrate complex (induced fit)',
            [252, 128],
            'Binding makes the enzyme shift slightly to hug the substrate. This strains the substrate’s bonds toward the transition state, lowering Eₐ.',
          ],
          [
            'products',
            'Products released',
            [384, 64],
            'Products fit the active site poorly, so they drift away and the enzyme is free to bind another substrate.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Activation energy', 'The energy needed to reach a reaction’s transition state.'],
      [
        'Active site',
        'The region of an enzyme that binds the substrate and catalyzes the reaction.',
      ],
      ['Induced fit', 'The enzyme’s small shape change that grips the substrate once it binds.'],
      ['Denaturation', 'Loss of a protein’s 3D shape (and function) from heat, pH or chemicals.'],
      [
        'Cofactor',
        'A non-protein helper (e.g. Mg²⁺, Zn²⁺, or an organic coenzyme like NAD⁺) an enzyme needs.',
      ],
    ],
    goDeeper:
      'Rate depends on substrate concentration. At low concentrations, adding substrate speeds things up, but eventually every active site is busy: the enzyme is saturated and the rate levels off at its maximum (Vmax). Adding more enzyme, not more substrate, is the only way to go faster then.\n\nInhibitors regulate enzymes. A competitive inhibitor resembles the substrate and blocks the active site; flooding the system with substrate can out-compete it. A non-competitive (allosteric) inhibitor binds elsewhere and changes the enzyme’s shape, so extra substrate does not help. Cells use this for feedback inhibition, where the end product of a pathway switches off the first enzyme.\n\nIn reality, it’s a bit more complicated: some enzymes are RNA (ribozymes), many need cofactors, and the “lock and key” picture is an older model; induced fit better matches how flexible proteins actually are.',
    quiz: [
      mc(
        'What does an enzyme change about a reaction?',
        [
          'It lowers the activation energy',
          'It makes ΔG more negative',
          'It shifts the equilibrium toward products',
          'It is used up as a reactant',
        ],
        0,
        'Enzymes lower Eₐ by stabilizing the transition state. ΔG and the equilibrium position are unchanged, and the enzyme is regenerated.',
      ),
      predict(
        'An enzyme is working at its maximum rate because every active site is occupied. A student doubles the substrate concentration.',
        'What happens to the reaction rate?',
        [
          'It stays about the same: the enzyme is saturated',
          'It doubles',
          'It halves',
          'It drops to zero because of denaturation',
        ],
        0,
        'At saturation the enzyme is the limiting factor. Only adding more enzyme (or raising temperature toward the optimum) would increase the rate.',
      ),
      label(
        'Match each term to its description.',
        [
          ['Competitive inhibitor', 'Blocks the active site by resembling the substrate'],
          ['Allosteric inhibitor', 'Binds elsewhere and changes the active site’s shape'],
          ['Denaturation', 'Loss of 3D shape caused by extreme heat or pH'],
          ['Cofactor', 'A non-protein helper such as Mg²⁺'],
        ],
        'Competitive inhibition can be overcome with more substrate; allosteric inhibition cannot. Denaturation is usually permanent.',
      ),
    ],
  }),

  hs({
    base: 'ph-buffers',
    unit: 'chemistry',
    summary:
      'pH measures hydrogen ion concentration on a logarithmic scale. Buffers like the bicarbonate system, backed up by the lungs and kidneys, keep blood pH within a narrow 7.35–7.45 range.',
    steps: [
      [
        'A logarithmic scale',
        'pH = −log[H⁺]. Each whole step is a tenfold change in hydrogen ion concentration, so pH 3 is 10× more acidic than pH 4 and 1,000× more acidic than pH 6. Acids donate H⁺; bases accept H⁺ (or release OH⁻).',
      ],
      [
        'Homeostasis of blood pH',
        'Blood is kept between pH 7.35 and 7.45. Below 7.35 is acidosis; above 7.45 is alkalosis. Both alter the charges on proteins, disrupting enzymes and hemoglobin, so the range is tightly defended.',
      ],
      [
        'How a buffer works',
        'A buffer is a weak acid paired with its conjugate base. In blood: H₂CO₃ ⇌ H⁺ + HCO₃⁻. Extra H⁺ is soaked up by HCO₃⁻; extra OH⁻ is neutralized by H₂CO₃ releasing H⁺. The pH barely moves.',
      ],
      [
        'Lungs and kidneys',
        'Carbonic acid is linked to CO₂: CO₂ + H₂O ⇌ H₂CO₃. Breathing faster removes CO₂ and raises pH within minutes. Over hours to days, kidneys excrete H⁺ and reabsorb HCO₃⁻.',
      ],
    ],
    diagrams: [
      diagram(
        'The pH scale',
        'Each step on the scale is a tenfold change in H⁺ concentration. Body fluids sit at very different points, each matched to the enzymes working there.',
        [
          ...Array.from({ length: 15 }, (_, i) =>
            rect(20 + i * 24, 110, 24, 34, `hsl(${(i / 14) * 260}, 75%, ${i === 7 ? 85 : 62}%)`, {
              part: i < 7 ? 'acid' : i > 7 ? 'base' : 'neutral',
            }),
          ),
          ...Array.from({ length: 15 }, (_, i) =>
            text(32 + i * 24, 132, String(i), { size: 11, bold: true }),
          ),
          text(20, 100, '← more acidic (more H⁺)', { anchor: 'start', size: 10, part: 'acid' }),
          text(380, 100, 'more basic (less H⁺) →', { anchor: 'end', size: 10, part: 'base' }),
          arrow([68, 190], [68, 148], { part: 'stomach' }),
          text(62, 204, 'Stomach acid', { size: 10, part: 'stomach' }),
          text(62, 216, 'pH 1.5–2', { size: 9, fill: '#64748b', part: 'stomach' }),
          arrow([210, 66], [210, 106], { stroke: '#dc2626', part: 'blood' }),
          text(210, 46, 'Blood', { size: 10, bold: true, part: 'blood' }),
          text(210, 58, 'pH 7.35–7.45', { size: 9, fill: '#64748b', part: 'blood' }),
          arrow([224, 190], [224, 148], { part: 'intestine' }),
          text(250, 204, 'Small intestine', { size: 10, part: 'intestine' }),
          text(250, 216, 'pH 7–8.5', { size: 9, fill: '#64748b', part: 'intestine' }),
          text(200, 245, '[H⁺] at pH 2 is 100,000× higher than at pH 7', {
            size: 10,
            fill: '#475569',
            part: 'log',
          }),
        ],
        [
          [
            'acid',
            'Acidic range (pH < 7)',
            [70, 78],
            'More H⁺ than OH⁻. Acids donate hydrogen ions in water.',
          ],
          [
            'neutral',
            'Neutral (pH 7)',
            [188, 162],
            'Pure water: [H⁺] equals [OH⁻], 10⁻⁷ moles per liter each.',
          ],
          [
            'base',
            'Basic / alkaline range (pH > 7)',
            [372, 76],
            'Less H⁺ than OH⁻. Bases accept hydrogen ions.',
          ],
          [
            'stomach',
            'Stomach (pH ~2)',
            [90, 172],
            'HCl from stomach lining cells kills microbes and activates pepsin, an enzyme adapted to work in acid.',
          ],
          [
            'blood',
            'Blood (pH 7.35–7.45)',
            [258, 50],
            'Held in a narrow, slightly basic range by buffers, breathing and the kidneys.',
          ],
          [
            'intestine',
            'Small intestine (pH 7–8.5)',
            [290, 172],
            'Bicarbonate from the pancreas neutralizes stomach acid so intestinal enzymes like trypsin can work.',
          ],
          [
            'log',
            'Logarithmic scale',
            [30, 240],
            'pH = −log[H⁺]. Five pH units apart means a 10⁵ (100,000×) difference in hydrogen ion concentration.',
          ],
        ],
      ),
      diagram(
        'The bicarbonate buffer system',
        'Carbon dioxide, carbonic acid and bicarbonate are linked by reversible reactions. The lungs control the CO₂ end and the kidneys control the HCO₃⁻ end.',
        [
          rect(20, 95, 80, 46, '#e0f2fe', { r: 10, stroke: '#0284c7', part: 'co2' }),
          text(60, 116, 'CO₂ + H₂O', { bold: true, part: 'co2' }),
          text(60, 131, 'dissolved gas', { size: 9, fill: '#475569', part: 'co2' }),
          rect(150, 95, 90, 46, '#fef3c7', { r: 10, stroke: '#d97706', part: 'h2co3' }),
          text(195, 116, 'H₂CO₃', { bold: true, part: 'h2co3' }),
          text(195, 131, 'carbonic acid', { size: 9, fill: '#475569', part: 'h2co3' }),
          rect(290, 95, 95, 46, '#dcfce7', { r: 10, stroke: '#16a34a', part: 'hco3' }),
          text(337, 116, 'H⁺ + HCO₃⁻', { bold: true, part: 'hco3' }),
          text(337, 131, 'bicarbonate', { size: 9, fill: '#475569', part: 'hco3' }),
          arrow([102, 110], [147, 110], { part: 'ca' }),
          arrow([147, 126], [102, 126], { part: 'ca' }),
          arrow([242, 110], [287, 110]),
          arrow([287, 126], [242, 126]),
          text(125, 90, 'carbonic', { size: 8, fill: '#64748b', part: 'ca' }),
          text(125, 100, 'anhydrase', { size: 8, fill: '#64748b', part: 'ca' }),
          ellipse(60, 42, 34, 22, '#fecdd3', { stroke: '#e11d48', part: 'lungs' }),
          text(60, 46, 'Lungs', { bold: true, part: 'lungs' }),
          arrow([60, 92], [60, 66], { stroke: '#e11d48', part: 'lungs' }),
          text(68, 82, 'exhale CO₂', { anchor: 'start', size: 9, fill: '#e11d48', part: 'lungs' }),
          ellipse(320, 205, 40, 22, '#fde68a', { stroke: '#b45309', part: 'kidneys' }),
          text(320, 209, 'Kidneys', { bold: true, part: 'kidneys' }),
          arrow([302, 184], [302, 145], { stroke: '#b45309', part: 'kidneys' }),
          arrow([338, 145], [338, 184], { stroke: '#b45309', part: 'kidneys' }),
          text(294, 168, 'reabsorb HCO₃⁻', {
            anchor: 'end',
            size: 9,
            fill: '#b45309',
            part: 'kidneys',
          }),
          text(346, 168, 'excrete H⁺', {
            anchor: 'start',
            size: 9,
            fill: '#b45309',
            part: 'kidneys',
          }),
          rect(20, 175, 230, 64, '#f8fafc', { r: 8, stroke: '#e2e8f0', part: 'shift' }),
          text(30, 194, 'Acid added: H⁺ + HCO₃⁻ → H₂CO₃ → CO₂ out', {
            anchor: 'start',
            size: 9.5,
            part: 'shift',
          }),
          text(30, 212, 'Base added: H₂CO₃ → H⁺ + HCO₃⁻ (H⁺ neutralizes OH⁻)', {
            anchor: 'start',
            size: 9.5,
            part: 'shift',
          }),
          text(30, 230, 'Either way, the pH barely moves.', {
            anchor: 'start',
            size: 9.5,
            bold: true,
            part: 'shift',
          }),
        ],
        [
          [
            'co2',
            'CO₂ + H₂O',
            [20, 92],
            'Carbon dioxide from respiration dissolves in plasma. More CO₂ pushes the reactions right, making blood more acidic.',
          ],
          [
            'ca',
            'Carbonic anhydrase',
            [125, 140],
            'An enzyme in red blood cells that speeds the CO₂ + H₂O ⇌ H₂CO₃ reaction by about a million-fold.',
          ],
          [
            'h2co3',
            'Carbonic acid (weak acid)',
            [240, 92],
            'Only partly dissociates, which is what lets the pair act as a buffer.',
          ],
          [
            'hco3',
            'H⁺ + bicarbonate (conjugate base)',
            [385, 92],
            'Bicarbonate is the main base reserve of the blood; it mops up excess H⁺.',
          ],
          [
            'lungs',
            'Lungs (fast control)',
            [96, 30],
            'Faster, deeper breathing blows off CO₂, pulling the equilibrium left and raising pH within minutes.',
          ],
          [
            'kidneys',
            'Kidneys (slow control)',
            [366, 228],
            'Over hours to days, the kidneys excrete H⁺ in urine and reabsorb or make new HCO₃⁻.',
          ],
          [
            'shift',
            'Le Chatelier in action',
            [244, 180],
            'Adding a product or reactant shifts the reversible reactions to absorb the change.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['pH', '−log of the hydrogen ion concentration; lower pH means more H⁺.'],
      ['Buffer', 'A weak acid/conjugate base pair that resists changes in pH.'],
      ['Acidosis', 'Blood pH below 7.35.'],
      ['Alkalosis', 'Blood pH above 7.45.'],
      ['Conjugate base', 'What remains of an acid after it donates H⁺ (HCO₃⁻ for H₂CO₃).'],
    ],
    goDeeper:
      'Respiratory acidosis happens when CO₂ builds up (for example, with slow or blocked breathing); metabolic acidosis happens when acids accumulate (for example, lactic acid during extreme exercise or ketones in uncontrolled diabetes). The body compensates using the other system: in metabolic acidosis you breathe faster to blow off CO₂.\n\nBuffers work best near their pKa, the pH at which acid and conjugate base are equal. The bicarbonate pKa is about 6.1, below blood pH, yet it is the most important blood buffer because the lungs and kidneys can adjust both ends of the system independently. Phosphate buffers and proteins (including hemoglobin) also absorb H⁺.\n\nIn reality, it’s a bit more complicated: blood pH depends on the ratio of HCO₃⁻ to dissolved CO₂, described by the Henderson–Hasselbalch equation, not on either amount alone.',
    quiz: [
      mc(
        'Solution A has pH 3 and solution B has pH 6. How do their H⁺ concentrations compare?',
        ['A has 1,000× more H⁺', 'A has 3× more H⁺', 'A has 2× more H⁺', 'B has 1,000× more H⁺'],
        0,
        'Three pH units = 10 × 10 × 10 = 1,000-fold difference, and the lower pH has more H⁺.',
      ),
      predict(
        'A person hyperventilates (breathes very fast and deep) for a minute.',
        'What happens to their blood pH, and why?',
        [
          'It rises: CO₂ is blown off, so less carbonic acid forms',
          'It falls: more oxygen makes the blood acidic',
          'It falls: CO₂ builds up',
          'Nothing: buffers prevent any change at all',
        ],
        0,
        'Removing CO₂ pulls CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻ to the left, lowering [H⁺] and causing respiratory alkalosis.',
      ),
      label(
        'Match each part of the system to its role.',
        [
          ['HCO₃⁻', 'Absorbs excess H⁺'],
          ['Lungs', 'Adjust pH in minutes by removing CO₂'],
          ['Kidneys', 'Adjust pH over days by excreting H⁺'],
          ['Carbonic anhydrase', 'Enzyme that speeds CO₂ + H₂O ⇌ H₂CO₃'],
        ],
        'Buffers act instantly, the lungs within minutes, and the kidneys over hours to days.',
      ),
    ],
  }),

  hs({
    base: 'protein-folding',
    unit: 'chemistry',
    summary:
      'A protein’s amino acid sequence determines how it folds through four levels of structure. Its final shape determines its function, so a single changed amino acid can disable it.',
    steps: [
      [
        'Primary structure',
        'Amino acids are joined by peptide bonds (a dehydration reaction) into a polypeptide chain. The sequence, written from the N-terminus to the C-terminus, is the primary structure, and it is coded by a gene.',
      ],
      [
        'Secondary structure',
        'Hydrogen bonds between backbone C=O and N–H groups coil parts of the chain into α-helices or pleat them into β-sheets. These motifs don’t depend on which R-groups are present.',
      ],
      [
        'Tertiary structure',
        'R-group interactions fold the whole chain into a 3D shape: hydrophobic R-groups cluster in the middle away from water, while hydrogen bonds, ionic bonds and covalent disulfide bridges (between cysteines) lock it in place.',
      ],
      [
        'Quaternary structure',
        'Some proteins are built from several polypeptide subunits. Hemoglobin has four (two α and two β), each holding an iron-containing heme group that binds O₂.',
      ],
    ],
    diagrams: [
      diagram(
        'Four levels of protein structure',
        'Each level builds on the one before. The sequence (primary) contains all the information needed to reach the final shape.',
        [
          rect(8, 8, 186, 118, '#f8fafc', { r: 10, stroke: '#e2e8f0', part: 'primary' }),
          text(18, 26, '1 · Primary', { anchor: 'start', bold: true, part: 'primary' }),
          ...['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c'].map(
            (c, i) =>
              circle(32 + i * 23, 75, 10, c, { stroke: INK, strokeWidth: 1, part: 'primary' }),
          ),
          text(32, 100, 'N', { bold: true, size: 10, part: 'primary' }),
          text(170, 100, 'C', { bold: true, size: 10, part: 'primary' }),
          text(100, 118, 'peptide bonds join amino acids', {
            size: 9,
            fill: '#64748b',
            part: 'peptide',
          }),
          path('M42 75 L45 75 M65 75 L68 75', { stroke: INK, strokeWidth: 3, part: 'peptide' }),

          rect(206, 8, 186, 118, '#f8fafc', { r: 10, stroke: '#e2e8f0', part: 'secondary' }),
          text(216, 26, '2 · Secondary', { anchor: 'start', bold: true, part: 'secondary' }),
          path(
            'M222 95 C222 50 242 50 242 75 C242 100 262 100 262 75 C262 50 282 50 282 75 C282 100 296 100 296 60',
            { stroke: '#e11d48', strokeWidth: 4, part: 'helix' },
          ),
          path('M312 48 L380 48 M312 66 L380 66 M312 84 L380 84 M312 102 L380 102', {
            stroke: '#2563eb',
            strokeWidth: 5,
            part: 'sheet',
          }),
          path('M330 50 L330 64 M350 68 L350 82 M370 86 L370 100', {
            stroke: '#94a3b8',
            strokeWidth: 1.5,
            dash: true,
            part: 'sheet',
          }),
          text(258, 118, 'α-helix', { size: 9, fill: '#e11d48', part: 'helix' }),
          text(346, 118, 'β-pleated sheet', { size: 9, fill: '#2563eb', part: 'sheet' }),

          rect(8, 134, 186, 118, '#f8fafc', { r: 10, stroke: '#e2e8f0', part: 'tertiary' }),
          text(18, 152, '3 · Tertiary', { anchor: 'start', bold: true, part: 'tertiary' }),
          path(
            'M40 230 C30 180 70 165 95 180 C120 195 80 215 110 225 C145 238 170 200 150 175 C135 158 110 170 120 195',
            { stroke: '#7c3aed', strokeWidth: 5, part: 'tertiary' },
          ),
          circle(100, 205, 15, '#fde68a', { opacity: 0.8, part: 'core' }),
          path('M135 225 L148 212', { stroke: '#f59e0b', strokeWidth: 3, part: 'disulfide' }),
          text(162, 240, 'S–S', { size: 9, bold: true, fill: '#b45309', part: 'disulfide' }),

          rect(206, 134, 186, 118, '#f8fafc', { r: 10, stroke: '#e2e8f0', part: 'quaternary' }),
          text(216, 152, '4 · Quaternary', { anchor: 'start', bold: true, part: 'quaternary' }),
          circle(275, 185, 24, '#fca5a5', { stroke: '#b91c1c', part: 'quaternary' }),
          circle(323, 185, 24, '#93c5fd', { stroke: '#1d4ed8', part: 'quaternary' }),
          circle(275, 228, 22, '#93c5fd', { stroke: '#1d4ed8', part: 'quaternary' }),
          circle(323, 228, 22, '#fca5a5', { stroke: '#b91c1c', part: 'quaternary' }),
          ...[
            [275, 185],
            [323, 185],
            [275, 228],
            [323, 228],
          ].map(([x, y]) => rect(x - 5, y - 5, 10, 10, '#991b1b', { r: 2, part: 'heme' })),
          text(362, 196, 'α', { size: 10, bold: true, part: 'quaternary' }),
          text(362, 236, 'β', { size: 10, bold: true, part: 'quaternary' }),
        ],
        [
          [
            'primary',
            'Primary structure',
            [184, 40],
            'The exact order of the 20 kinds of amino acids, dictated by the gene’s codons.',
          ],
          [
            'peptide',
            'Peptide bond',
            [56, 52],
            'A covalent C–N bond formed between amino acids by dehydration synthesis (releasing H₂O).',
          ],
          [
            'secondary',
            'Secondary structure',
            [314, 22],
            'Local folding patterns held by hydrogen bonds between backbone atoms, not R-groups: α-helices and β-sheets.',
          ],
          [
            'helix',
            'α-helix',
            [226, 52],
            'A coil held by hydrogen bonds between backbone atoms four amino acids apart.',
          ],
          [
            'sheet',
            'β-pleated sheet',
            [386, 34],
            'Side-by-side strands linked by backbone hydrogen bonds (dashed lines).',
          ],
          [
            'tertiary',
            'Tertiary structure',
            [184, 166],
            'The overall 3D fold of one polypeptide, driven by interactions between R-groups.',
          ],
          [
            'core',
            'Hydrophobic core',
            [72, 196],
            'Non-polar R-groups cluster inside, away from water. This is the main force driving folding.',
          ],
          [
            'disulfide',
            'Disulfide bridge',
            [178, 228],
            'A strong covalent S–S bond between two cysteine R-groups that staples the fold together.',
          ],
          [
            'quaternary',
            'Quaternary structure',
            [384, 166],
            'Multiple polypeptide subunits fitting together; here, hemoglobin’s 2 α + 2 β chains.',
          ],
          [
            'heme',
            'Heme groups',
            [299, 206],
            'Iron-containing groups, one per hemoglobin subunit, that each bind one O₂ molecule.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Polypeptide', 'A chain of amino acids joined by peptide bonds.'],
      ['R-group', 'The variable side chain that gives each amino acid its chemical properties.'],
      ['Hydrophobic', 'Water-fearing; non-polar R-groups that pack into a protein’s core.'],
      ['Disulfide bridge', 'A covalent bond between two cysteine side chains.'],
      ['Chaperone', 'A protein that helps other proteins fold correctly.'],
    ],
    goDeeper:
      'Sickle cell disease shows why primary structure matters. One DNA base change swaps glutamic acid (charged, hydrophilic) for valine (non-polar) at position 6 of the β-globin chain. The new hydrophobic patch makes hemoglobin molecules stick together into long fibers when oxygen is low, bending red blood cells into sickle shapes.\n\nMany proteins get help folding from chaperones, which provide a protected space and prevent sticky hydrophobic regions from clumping. Misfolded proteins can aggregate into amyloid fibers, which are linked to Alzheimer’s disease, and prions are misfolded proteins that force normal copies to misfold too.\n\nIn reality, it’s a bit more complicated: some proteins never settle into one fixed shape (“intrinsically disordered” regions), and predicting a fold from sequence was a famous unsolved problem until AI models like AlphaFold made major progress.',
    quiz: [
      mc(
        'Which level of structure is held mainly by hydrogen bonds between backbone atoms, not R-groups?',
        ['Secondary', 'Primary', 'Tertiary', 'Quaternary'],
        0,
        'α-helices and β-sheets form from backbone C=O···H–N hydrogen bonds. Tertiary structure depends on R-group interactions.',
      ),
      predict(
        'A mutation replaces a hydrophobic amino acid deep in a protein’s core with a charged one.',
        'What is the most likely result?',
        [
          'The protein misfolds and may lose its function',
          'Nothing; only the active site matters',
          'The protein gains a new quaternary subunit',
          'The peptide bonds break',
        ],
        0,
        'A charged R-group is unstable in a water-free core, so the chain folds differently, which can destroy the active site or binding surface.',
      ),
      label(
        'Match each bond or force to the level it mainly stabilizes.',
        [
          ['Peptide bonds', 'Primary'],
          ['Backbone hydrogen bonds', 'Secondary'],
          ['R-group interactions & disulfides', 'Tertiary'],
          ['Contacts between separate chains', 'Quaternary'],
        ],
        'Each level is defined by a different kind of interaction.',
      ),
    ],
  }),

  hs({
    base: 'atp',
    unit: 'chemistry',
    summary:
      'ATP is a nucleotide whose last phosphate bond releases usable energy when hydrolyzed. Cells couple this energy-releasing reaction to energy-requiring work, then regenerate ATP through cellular respiration.',
    steps: [
      [
        'Structure of ATP',
        'Adenosine triphosphate = adenine (a nitrogenous base) + ribose (a 5-carbon sugar) + three phosphate groups. The negatively charged phosphates repel each other, so the bonds between them are easily broken.',
      ],
      [
        'Hydrolysis and coupling',
        'ATP + H₂O → ADP + Pᵢ releases about 30 kJ/mol. Enzymes couple this to endergonic work, often by transferring the phosphate to another molecule (phosphorylation), which changes its shape or makes it reactive.',
      ],
      [
        'The ATP cycle',
        'ADP + Pᵢ is turned back into ATP by ATP synthase, powered by cellular respiration (or photosynthesis in chloroplasts). Each ATP is recycled roughly 1,000 times a day; you turn over close to your body weight in ATP daily.',
      ],
    ],
    diagrams: [
      diagram(
        'ATP and the ATP–ADP cycle',
        'The top shows the parts of an ATP molecule. The bottom shows energy released by hydrolysis (cellular work) and stored again by phosphorylation (respiration).',
        [
          path('M55 56 L74 67 L74 89 L55 100 L36 89 L36 67 Z', {
            fill: '#bfdbfe',
            stroke: '#1d4ed8',
            part: 'adenine',
          }),
          path('M74 67 L95 60 L108 78 L95 96 L74 89', {
            fill: '#bfdbfe',
            stroke: '#1d4ed8',
            part: 'adenine',
          }),
          text(70, 118, 'Adenine', { size: 10, bold: true, part: 'adenine' }),
          path('M120 98 L150 78 L180 98 L170 128 L130 128 Z', {
            fill: '#fde68a',
            stroke: '#b45309',
            part: 'ribose',
          }),
          text(150, 110, 'Ribose', { size: 10, bold: true, part: 'ribose' }),
          path('M108 78 L128 96', { stroke: INK, strokeWidth: 2 }),
          path('M180 98 L204 98', { stroke: INK, strokeWidth: 2 }),
          ...[0, 1, 2].map((i) =>
            circle(222 + i * 50, 98, 18, '#fca5a5', {
              stroke: '#b91c1c',
              part: i === 2 ? 'gamma' : 'phosphates',
            }),
          ),
          ...[0, 1, 2].map((i) =>
            text(222 + i * 50, 102, 'P', { bold: true, part: i === 2 ? 'gamma' : 'phosphates' }),
          ),
          path('M240 98 L254 98', { stroke: INK, strokeWidth: 2.5 }),
          path('M290 98 L304 98', { stroke: '#dc2626', strokeWidth: 3.5, part: 'gamma' }),
          text(297, 82, '⚡', { size: 14, part: 'gamma' }),
          text(272, 130, 'three phosphate groups (−)', {
            size: 9,
            fill: '#64748b',
            part: 'phosphates',
          }),
          path('M24 40 L188 40', { stroke: '#94a3b8', strokeWidth: 1 }),
          text(106, 34, 'adenosine', { size: 9, fill: '#64748b' }),

          rect(150, 160, 100, 36, '#fecaca', { r: 18, stroke: '#b91c1c', part: 'atp' }),
          text(200, 183, 'ATP', { bold: true, size: 13, part: 'atp' }),
          rect(150, 218, 100, 34, '#e2e8f0', { r: 17, stroke: '#64748b', part: 'adp' }),
          text(200, 240, 'ADP + Pᵢ', { bold: true, size: 12, part: 'adp' }),
          arrow([252, 180], [252, 230], {
            bend: -40,
            stroke: '#dc2626',
            strokeWidth: 3,
            part: 'hydrolysis',
          }),
          arrow([148, 232], [148, 182], {
            bend: -40,
            stroke: '#16a34a',
            strokeWidth: 3,
            part: 'synthesis',
          }),
          text(282, 196, 'hydrolysis', {
            anchor: 'start',
            size: 10,
            bold: true,
            fill: '#dc2626',
            part: 'hydrolysis',
          }),
          text(282, 209, 'energy for work', {
            anchor: 'start',
            size: 9,
            fill: '#dc2626',
            part: 'hydrolysis',
          }),
          text(282, 222, 'muscle, pumps, synthesis', {
            size: 8.5,
            fill: '#64748b',
            anchor: 'start',
            part: 'hydrolysis',
          }),
          text(118, 196, 'phosphorylation', {
            anchor: 'end',
            size: 10,
            bold: true,
            fill: '#16a34a',
            part: 'synthesis',
          }),
          text(118, 209, 'energy from food', {
            anchor: 'end',
            size: 9,
            fill: '#16a34a',
            part: 'synthesis',
          }),
          text(118, 222, 'respiration (ATP synthase)', {
            size: 8.5,
            fill: '#64748b',
            anchor: 'end',
            part: 'synthesis',
          }),
        ],
        [
          [
            'adenine',
            'Adenine',
            [24, 50],
            'A nitrogen-containing base, the same A found in DNA and RNA.',
          ],
          [
            'ribose',
            'Ribose',
            [186, 128],
            'A five-carbon sugar. Adenine + ribose together are called adenosine.',
          ],
          [
            'phosphates',
            'Phosphate groups',
            [222, 70],
            'Three negatively charged phosphates. Their repulsion makes the chain unstable and energy-rich.',
          ],
          [
            'gamma',
            'Terminal phosphate bond',
            [330, 72],
            'Hydrolyzing the bond to the last phosphate releases ~30 kJ/mol. Often the phosphate is transferred to a protein, changing its shape.',
          ],
          [
            'atp',
            'ATP (charged)',
            [140, 160],
            'The cell’s short-term energy carrier. A working muscle cell uses millions per second.',
          ],
          [
            'hydrolysis',
            'Hydrolysis (exergonic)',
            [384, 192],
            'ATP + H₂O → ADP + Pᵢ. The released energy is coupled to work: contraction, active transport, building molecules.',
          ],
          [
            'adp',
            'ADP + Pᵢ (discharged)',
            [262, 246],
            'Adenosine diphosphate plus inorganic phosphate, ready to be recharged.',
          ],
          [
            'synthesis',
            'Phosphorylation (endergonic)',
            [22, 176],
            'Energy from breaking down glucose powers ATP synthase to reattach the phosphate.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['ATP', 'Adenosine triphosphate, the cell’s main energy-carrying molecule.'],
      ['Hydrolysis', 'Breaking a bond by adding water.'],
      ['Phosphorylation', 'Adding a phosphate group to a molecule.'],
      ['Energy coupling', 'Using an exergonic reaction to drive an endergonic one.'],
      ['ATP synthase', 'The enzyme that makes ATP from ADP and Pᵢ.'],
    ],
    goDeeper:
      'ATP is a good energy “currency” rather than a long-term store. Its energy is released in small, convenient packets, it is easily recharged, and it diffuses quickly through the cell. Long-term storage uses fats and glycogen, which hold far more energy per gram.\n\nThe sodium–potassium pump is a classic example of coupling. ATP phosphorylates the pump, changing its shape so it pushes 3 Na⁺ out and brings 2 K⁺ in, both against their gradients. In muscle, ATP binding releases myosin from actin and its hydrolysis re-cocks the myosin head for the next power stroke.\n\nIn reality, it’s a bit more complicated: the energy doesn’t sit “in” one bond. It comes from the products (ADP and Pᵢ) being much more stable than ATP, thanks to reduced charge repulsion and better stabilization by water.',
    quiz: [
      mc(
        'Which part of ATP is broken off to release usable energy?',
        [
          'The terminal (third) phosphate',
          'Adenine',
          'Ribose',
          'The first phosphate attached to ribose',
        ],
        0,
        'Hydrolysis usually removes the outermost phosphate, giving ADP + Pᵢ.',
      ),
      predict(
        'A poison blocks ATP synthase in a cell’s mitochondria.',
        'What happens first?',
        [
          'ATP runs out within seconds to minutes, and pumps and muscles stop',
          'The cell switches to storing more ATP',
          'ADP levels fall',
          'Nothing; cells keep a large reserve of ATP',
        ],
        0,
        'Cells hold only a few seconds’ worth of ATP and rely on constant recycling. Cyanide kills for a similar reason, by blocking the electron transport chain that powers ATP synthase.',
      ),
      label(
        'Match each term to its meaning.',
        [
          ['Hydrolysis', 'ATP + H₂O → ADP + Pᵢ'],
          ['Phosphorylation', 'Adding a phosphate to a molecule'],
          ['Exergonic', 'Releases energy'],
          ['Endergonic', 'Requires an input of energy'],
        ],
        'ATP hydrolysis is exergonic; making ATP is endergonic. Coupling links the two.',
      ),
    ],
  }),
];
