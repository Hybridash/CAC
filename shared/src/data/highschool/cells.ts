import type { DiagramShape } from '../../types';
import type { Concept } from '../../types';
import { label, mc, predict } from '../concepts/helpers';
import { arrow, circle, diagram, ellipse, hs, path, rect, text } from './build';

/** A phospholipid bilayer between y=top and y=top+80, skipping x ranges occupied by proteins. */
function bilayer(top: number, from: number, to: number, skip: [number, number][]): DiagramShape[] {
  const out: DiagramShape[] = [];
  for (let x = from; x <= to; x += 14) {
    if (skip.some(([a, b]) => x > a - 7 && x < b + 7)) continue;
    out.push(
      path(
        `M${x - 2} ${top + 6} L${x - 3} ${top + 36} M${x + 2} ${top + 6} L${x + 3} ${top + 36}`,
        {
          stroke: '#f59e0b',
          strokeWidth: 1.5,
          part: 'tails',
        },
      ),
      path(
        `M${x - 2} ${top + 74} L${x - 3} ${top + 44} M${x + 2} ${top + 74} L${x + 3} ${top + 44}`,
        {
          stroke: '#f59e0b',
          strokeWidth: 1.5,
          part: 'tails',
        },
      ),
      circle(x, top, 6, '#38bdf8', { stroke: '#0369a1', strokeWidth: 1, part: 'heads' }),
      circle(x, top + 80, 6, '#38bdf8', { stroke: '#0369a1', strokeWidth: 1, part: 'heads' }),
    );
  }
  return out;
}

/** A red blood cell seen from the side: normal, swollen or shriveled. */
function rbc(cx: number, cy: number, kind: 'normal' | 'swollen' | 'shriveled', part: string) {
  if (kind === 'swollen') return [circle(cx, cy, 30, '#f87171', { stroke: '#b91c1c', part })];
  if (kind === 'normal')
    return [
      ellipse(cx, cy, 30, 20, '#f87171', { stroke: '#b91c1c', part }),
      ellipse(cx, cy, 14, 7, '#fca5a5', { part }),
    ];
  return [
    path(
      `M${cx - 22} ${cy} L${cx - 16} ${cy - 12} L${cx - 8} ${cy - 8} L${cx} ${cy - 16} L${cx + 8} ${cy - 9} L${cx + 17} ${cy - 13} L${cx + 22} ${cy} L${cx + 16} ${cy + 12} L${cx + 7} ${cy + 9} L${cx} ${cy + 15} L${cx - 9} ${cy + 9} L${cx - 17} ${cy + 12} Z`,
      { fill: '#f87171', stroke: '#b91c1c', part },
    ),
  ];
}

export const cells: Concept[] = [
  hs({
    base: 'cell-membrane',
    unit: 'cells',
    summary:
      'The plasma membrane is a fluid mosaic of phospholipids, cholesterol and proteins. It is selectively permeable: small non-polar molecules diffuse straight through, while ions and polar molecules need transport proteins.',
    steps: [
      [
        'The fluid mosaic model',
        'Phospholipids have a hydrophilic (water-loving) phosphate head and two hydrophobic fatty acid tails. In water they form a bilayer, tails inward. Proteins float in it like tiles in a moving mosaic, and cholesterol keeps it from getting too fluid or too stiff.',
      ],
      [
        'Diffusion',
        'Particles move randomly, so there is a net movement from high to low concentration, down the concentration gradient, until they are evenly spread (dynamic equilibrium). No ATP is needed: it is passive transport.',
      ],
      [
        'What changes the rate',
        'Rate increases with a steeper concentration gradient, higher temperature, larger surface area and a thinner membrane, and decreases with molecule size. Cells are small partly to keep their surface area-to-volume ratio high.',
      ],
      [
        'Selective permeability',
        'O₂, CO₂ and other small non-polar molecules cross the hydrophobic core directly (simple diffusion). Ions, glucose and water mostly need channel or carrier proteins (facilitated diffusion), which are specific to what they carry.',
      ],
    ],
    diagrams: [
      diagram(
        'The fluid mosaic model',
        'A section of plasma membrane: a phospholipid bilayer with proteins, cholesterol and carbohydrate chains. Different substances cross it in different ways.',
        [
          text(12, 18, 'Outside the cell (extracellular fluid)', {
            anchor: 'start',
            size: 10,
            fill: '#475569',
          }),
          text(12, 252, 'Inside the cell (cytoplasm)', {
            anchor: 'start',
            size: 10,
            fill: '#475569',
          }),
          ...bilayer(95, 14, 392, [
            [148, 190],
            [252, 304],
          ]),
          rect(107, 120, 8, 30, '#fde047', { r: 3, stroke: '#a16207', part: 'cholesterol' }),
          rect(146, 82, 16, 106, '#c084fc', { r: 6, stroke: '#7e22ce', part: 'channel' }),
          rect(176, 82, 16, 106, '#c084fc', { r: 6, stroke: '#7e22ce', part: 'channel' }),
          circle(169, 58, 5, '#fb7185', { part: 'channel' }),
          circle(169, 130, 5, '#fb7185', { part: 'channel' }),
          arrow([169, 66], [169, 210], { stroke: '#e11d48', strokeWidth: 1.5, part: 'channel' }),
          text(186, 60, 'Na⁺', { anchor: 'start', size: 9, fill: '#e11d48', part: 'channel' }),
          path('M252 92 C252 76 304 76 304 92 L304 182 C304 198 252 198 252 182 Z', {
            fill: '#86efac',
            stroke: '#15803d',
            part: 'carrier',
          }),
          path('M272 46 L280 42 L288 46 L288 55 L280 59 L272 55 Z', {
            fill: '#fde68a',
            stroke: '#b45309',
            part: 'carrier',
          }),
          arrow([278, 198], [278, 228], { stroke: '#15803d', strokeWidth: 1.5, part: 'carrier' }),
          text(296, 52, 'glucose', { anchor: 'start', size: 9, fill: '#b45309', part: 'carrier' }),
          rect(52, 86, 24, 20, '#c4b5fd', { r: 6, stroke: '#6d28d9', part: 'glyco' }),
          path('M64 86 L64 70 L56 58 M64 70 L72 56 M56 58 L50 48 M72 56 L80 46', {
            stroke: '#db2777',
            strokeWidth: 2,
            part: 'glyco',
          }),
          ...[
            [64, 70],
            [56, 58],
            [72, 56],
            [50, 48],
            [80, 46],
          ].map(([x, y]) =>
            circle(x, y, 3.5, '#f9a8d4', { stroke: '#db2777', strokeWidth: 1, part: 'glyco' }),
          ),
          circle(352, 46, 5, '#e0f2fe', { stroke: '#0284c7', part: 'simple' }),
          circle(358, 52, 5, '#e0f2fe', { stroke: '#0284c7', part: 'simple' }),
          circle(355, 136, 5, '#e0f2fe', { stroke: '#0284c7', part: 'simple' }),
          circle(361, 142, 5, '#e0f2fe', { stroke: '#0284c7', part: 'simple' }),
          arrow([340, 40], [340, 228], {
            stroke: '#0284c7',
            strokeWidth: 1.5,
            dash: true,
            part: 'simple',
          }),
          text(372, 38, 'O₂', { size: 9, fill: '#0284c7', part: 'simple' }),
        ],
        [
          [
            'heads',
            'Hydrophilic phosphate heads',
            [24, 72],
            'Polar heads face the watery fluid on both sides of the membrane.',
          ],
          [
            'tails',
            'Hydrophobic fatty acid tails',
            [228, 135],
            'Non-polar tails point inward, forming an oily core that blocks ions and most polar molecules.',
          ],
          [
            'cholesterol',
            'Cholesterol',
            [100, 160],
            'Wedged between phospholipids in animal cells. It keeps the membrane fluid in the cold and stops it getting too runny when warm.',
          ],
          [
            'channel',
            'Channel protein',
            [200, 110],
            'Forms a water-filled pore that lets specific ions (here Na⁺) diffuse through quickly. Many channels open or close in response to signals (gated).',
          ],
          [
            'carrier',
            'Carrier protein',
            [318, 110],
            'Binds a specific molecule such as glucose, changes shape, and releases it on the other side. Used in facilitated diffusion and active transport.',
          ],
          [
            'glyco',
            'Glycoprotein (carbohydrate chain)',
            [92, 50],
            'Sugar chains on the outer surface act as ID tags for cell recognition, which the immune system uses to tell “self” from “non-self.”',
          ],
          [
            'simple',
            'Simple diffusion',
            [380, 190],
            'Small non-polar molecules like O₂ and CO₂ slip directly between phospholipids, from high to low concentration.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Selectively permeable', 'Lets some substances cross but not others.'],
      ['Concentration gradient', 'A difference in concentration between two regions.'],
      ['Passive transport', 'Movement down a gradient that needs no ATP.'],
      ['Facilitated diffusion', 'Passive transport through a channel or carrier protein.'],
      ['Amphipathic', 'Having both a hydrophilic and a hydrophobic part, like a phospholipid.'],
    ],
    goDeeper:
      'Surface area-to-volume ratio limits cell size. If a cube-shaped cell doubles its width, its surface area grows 4× but its volume grows 8×, so each unit of cytoplasm gets half as much membrane to supply it. That is why large organisms are made of many small cells, and why cells that absorb a lot (like intestinal cells) have microvilli.\n\nFick’s law sums up diffusion: rate ∝ (surface area × concentration difference) ÷ membrane thickness. The lungs’ alveoli maximize all three: a huge surface area, a steep gradient maintained by breathing and blood flow, and walls one cell thick.\n\nIn reality, it’s a bit more complicated: membranes contain “lipid rafts” rich in cholesterol, and water mostly crosses through aquaporin channel proteins rather than squeezing between phospholipids.',
    quiz: [
      mc(
        'Which molecule is most likely to cross a phospholipid bilayer without a transport protein?',
        ['Carbon dioxide (CO₂)', 'Sodium ion (Na⁺)', 'Glucose', 'A protein hormone'],
        0,
        'CO₂ is small and non-polar, so it dissolves through the hydrophobic core. Ions and large polar molecules need proteins.',
      ),
      predict(
        'A cell’s glucose carrier proteins are all busy (saturated). The glucose concentration outside is then doubled.',
        'What happens to the rate of facilitated diffusion?',
        [
          'It stays about the same, because the carriers are the limit',
          'It doubles',
          'It becomes active transport',
          'It drops to zero',
        ],
        0,
        'Unlike simple diffusion, facilitated diffusion has a maximum rate set by the number of transport proteins.',
      ),
      label(
        'Match each membrane component to its job.',
        [
          ['Phospholipid', 'Forms the bilayer barrier'],
          ['Channel protein', 'Pore that lets specific ions through'],
          ['Glycoprotein', 'Cell recognition tag'],
          ['Cholesterol', 'Stabilizes membrane fluidity'],
        ],
        'The membrane’s mixture of parts gives it both its barrier function and its selectivity.',
      ),
    ],
  }),

  hs({
    base: 'osmosis',
    unit: 'cells',
    summary:
      'Osmosis is the passive diffusion of water across a selectively permeable membrane toward the side with more solute. Whether a cell swells or shrinks depends on the tonicity of its surroundings.',
    steps: [
      [
        'Osmosis defined',
        'Osmosis is the net movement of water across a selectively permeable membrane, from a region of lower solute concentration (more free water) to higher solute concentration (less free water). Water mostly passes through aquaporin channels.',
      ],
      [
        'Tonicity',
        'Tonicity compares solute concentrations. A hypertonic solution has more solute than the cell, a hypotonic solution has less, and an isotonic solution has the same, so there is no net water movement.',
      ],
      [
        'Cells in different solutions',
        'In a hypotonic solution, animal cells swell and may burst (lysis), while plant cells become firm (turgid) because the cell wall pushes back. In a hypertonic solution, animal cells shrivel (crenate) and plant cell membranes pull away from the wall (plasmolysis).',
      ],
    ],
    diagrams: [
      diagram(
        'Red blood cells and tonicity',
        'The same cell placed in three solutions. Arrows show the net direction of water movement across the membrane.',
        [
          ...[0, 1, 2].map((i) =>
            path(
              `M${18 + i * 128} 40 L${18 + i * 128} 190 Q${18 + i * 128} 200 ${28 + i * 128} 200 L${118 + i * 128} 200 Q${128 + i * 128} 200 ${128 + i * 128} 190 L${128 + i * 128} 40`,
              {
                stroke: '#64748b',
                fill: ['#eff6ff', '#f1f5f9', '#fef9c3'][i],
                part: ['hypo', 'iso', 'hyper'][i],
              },
            ),
          ),
          ...rbc(73, 120, 'swollen', 'hypo'),
          arrow([30, 120], [41, 120], { stroke: '#2563eb', part: 'hypo' }),
          arrow([116, 120], [105, 120], { stroke: '#2563eb', part: 'hypo' }),
          arrow([73, 70], [73, 87], { stroke: '#2563eb', part: 'hypo' }),
          ...rbc(201, 120, 'normal', 'iso'),
          arrow([158, 112], [169, 112], { stroke: '#2563eb', part: 'iso' }),
          arrow([169, 128], [158, 128], { stroke: '#2563eb', part: 'iso' }),
          arrow([233, 112], [244, 112], { stroke: '#2563eb', part: 'iso' }),
          arrow([244, 128], [233, 128], { stroke: '#2563eb', part: 'iso' }),
          ...rbc(329, 120, 'shriveled', 'hyper'),
          arrow([305, 120], [290, 120], { stroke: '#2563eb', part: 'hyper' }),
          arrow([353, 120], [368, 120], { stroke: '#2563eb', part: 'hyper' }),
          arrow([329, 103], [329, 82], { stroke: '#2563eb', part: 'hyper' }),
          ...[
            [300, 60],
            [350, 170],
            [312, 180],
            [355, 70],
            [292, 160],
          ].map(([x, y]) => circle(x, y, 3, '#ca8a04', { part: 'hyper' })),
          circle(40, 175, 3, '#ca8a04', { part: 'hypo' }),
          ...[
            [150, 60],
            [250, 172],
            [180, 175],
          ].map(([x, y]) => circle(x, y, 3, '#ca8a04', { part: 'iso' })),
          text(73, 222, 'Hypotonic', { bold: true, part: 'hypo' }),
          text(73, 236, 'swells → may burst', { size: 9, fill: '#475569', part: 'hypo' }),
          text(201, 222, 'Isotonic', { bold: true, part: 'iso' }),
          text(201, 236, 'no net change', { size: 9, fill: '#475569', part: 'iso' }),
          text(329, 222, 'Hypertonic', { bold: true, part: 'hyper' }),
          text(329, 236, 'shrivels (crenation)', { size: 9, fill: '#475569', part: 'hyper' }),
          circle(150, 24, 3, '#ca8a04', { part: 'solute' }),
          text(158, 27, '= solute particle', {
            anchor: 'start',
            size: 9,
            fill: '#475569',
            part: 'solute',
          }),
          path('M262 24 L282 24', { stroke: '#2563eb', strokeWidth: 2, part: 'water' }),
          text(288, 27, '= net water flow', {
            anchor: 'start',
            size: 9,
            fill: '#475569',
            part: 'water',
          }),
        ],
        [
          [
            'hypo',
            'Hypotonic solution',
            [118, 52],
            'Fewer solutes outside than inside the cell, so water rushes in. Red blood cells swell and can burst (hemolysis) because they have no cell wall.',
          ],
          [
            'iso',
            'Isotonic solution',
            [246, 52],
            'Equal solute concentration: water moves in and out at the same rate. IV drips use isotonic saline (0.9% NaCl) for this reason.',
          ],
          [
            'hyper',
            'Hypertonic solution',
            [374, 52],
            'More solutes outside, so water leaves the cell and it shrivels. This is why drinking seawater dehydrates you.',
          ],
          [
            'solute',
            'Solute particles',
            [140, 14],
            'Dissolved substances such as salts and sugars that cannot cross the membrane freely.',
          ],
          [
            'water',
            'Net water movement',
            [254, 14],
            'Water always moves toward the side with the higher solute concentration.',
          ],
        ],
      ),
      diagram(
        'Plant cells: turgor and plasmolysis',
        'A cell wall changes the story. In fresh water a plant cell becomes turgid instead of bursting; in salty water its membrane pulls away from the wall.',
        [
          rect(40, 50, 130, 140, '#fff', {
            r: 10,
            stroke: '#65a30d',
            strokeWidth: 5,
            part: 'wall',
          }),
          rect(46, 56, 118, 128, '#bbf7d0', { r: 7, stroke: '#16a34a', part: 'turgid' }),
          rect(62, 72, 86, 96, '#bfdbfe', { r: 10, stroke: '#2563eb', part: 'vacuole' }),
          ...[
            [52, 120],
            [158, 100],
            [105, 62],
          ].map(([x, y]) => ellipse(x, y, 6, 4, '#22c55e', { part: 'turgid' })),
          arrow([12, 120], [36, 120], { stroke: '#2563eb', part: 'turgid' }),
          arrow([105, 18], [105, 44], { stroke: '#2563eb', part: 'turgid' }),
          text(105, 212, 'Turgid (in fresh water)', { bold: true, part: 'turgid' }),
          text(105, 226, 'vacuole full, presses on wall', {
            size: 9,
            fill: '#475569',
            part: 'turgid',
          }),
          rect(230, 50, 130, 140, '#fef9c3', {
            r: 10,
            stroke: '#65a30d',
            strokeWidth: 5,
            part: 'wall',
          }),
          path('M262 82 Q292 64 322 80 Q342 108 330 140 Q312 166 276 158 Q252 140 262 82 Z', {
            fill: '#bbf7d0',
            stroke: '#16a34a',
            part: 'plasmolyzed',
          }),
          ellipse(296, 118, 18, 14, '#bfdbfe', { stroke: '#2563eb', part: 'vacuole' }),
          arrow([352, 120], [384, 120], { stroke: '#2563eb', part: 'plasmolyzed' }),
          arrow([295, 54], [295, 22], { stroke: '#2563eb', part: 'plasmolyzed' }),
          text(295, 212, 'Plasmolyzed (in salt water)', { bold: true, part: 'plasmolyzed' }),
          text(295, 226, 'membrane pulls from wall', {
            size: 9,
            fill: '#475569',
            part: 'plasmolyzed',
          }),
        ],
        [
          [
            'wall',
            'Cell wall',
            [176, 40],
            'Rigid cellulose wall that resists expansion, so a plant cell can’t burst in pure water.',
          ],
          [
            'turgid',
            'Turgid cell',
            [20, 90],
            'Water enters by osmosis until the wall pushes back with equal pressure (turgor pressure). Turgor keeps leaves and stems firm.',
          ],
          [
            'vacuole',
            'Central vacuole',
            [150, 160],
            'Stores water and solutes. It swells in hypotonic surroundings and shrinks in hypertonic ones.',
          ],
          [
            'plasmolyzed',
            'Plasmolysis',
            [372, 160],
            'Water leaves, the vacuole shrinks and the membrane tears away from the wall. The plant wilts, and if it lasts too long the cell dies.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Osmosis', 'Diffusion of water across a selectively permeable membrane.'],
      ['Hypertonic', 'Having a higher solute concentration than the cell.'],
      ['Hypotonic', 'Having a lower solute concentration than the cell.'],
      ['Turgor pressure', 'Pressure of water pushing the membrane against a plant cell wall.'],
      ['Plasmolysis', 'Shrinking of a plant cell’s contents away from its wall.'],
      ['Aquaporin', 'A channel protein that lets water cross the membrane quickly.'],
    ],
    goDeeper:
      'Biologists often describe osmosis using water potential (Ψ, “psi”), measured in pressure units. Pure water at atmospheric pressure has Ψ = 0; adding solute makes Ψ negative, and pressure (like turgor) raises it. Water always flows from higher to lower water potential. This explains how water moves from soil into roots and up to leaves.\n\nFreshwater organisms face constant water gain. Paramecium uses contractile vacuoles to pump excess water out, and freshwater fish produce large amounts of dilute urine. Saltwater fish have the opposite problem: they drink seawater and actively pump out salt through their gills.\n\nIn reality, it’s a bit more complicated: “solute concentration” here means total dissolved particles (osmolarity), so 1 mole of NaCl counts about twice, because it splits into Na⁺ and Cl⁻.',
    quiz: [
      predict(
        'A slice of potato is placed in a strong salt solution for an hour.',
        'What happens to the potato slice?',
        [
          'It loses mass and becomes floppy as water leaves its cells',
          'It gains mass and becomes firm',
          'Its cells burst',
          'Nothing; potato cells have cell walls',
        ],
        0,
        'The salt solution is hypertonic, so water leaves the cells by osmosis and they plasmolyze.',
      ),
      mc(
        'Why don’t plant cells burst in pure water, while red blood cells do?',
        [
          'The cell wall resists expansion with turgor pressure',
          'Plant cells have no aquaporins',
          'Plant cells pump all water out with ATP',
          'Plant cells contain no solutes',
        ],
        0,
        'The rigid cell wall pushes back, so water stops entering once turgor pressure balances the solute difference.',
      ),
      label(
        'Match each solution to what happens to an animal cell placed in it.',
        [
          ['Hypotonic', 'Swells and may burst'],
          ['Isotonic', 'No net change in size'],
          ['Hypertonic', 'Shrivels'],
        ],
        'Water moves toward the higher solute concentration.',
      ),
    ],
  }),

  hs({
    base: 'active-transport',
    unit: 'cells',
    summary:
      'Active transport uses energy, usually from ATP, to move substances against their concentration gradient. The sodium–potassium pump is the classic example and powers nerve signals and other transport.',
    steps: [
      [
        'Against the gradient',
        'Active transport moves substances from low to high concentration, the opposite of diffusion. That takes energy, so cells that do a lot of it (like root hair and kidney cells) are packed with mitochondria.',
      ],
      [
        'Binding 3 Na⁺',
        'The Na⁺/K⁺-ATPase is a carrier protein. Open to the cytoplasm, it binds three sodium ions, which triggers it to split ATP.',
      ],
      [
        'Phosphorylation flips the pump',
        'The phosphate from ATP attaches to the pump (phosphorylation). This changes the protein’s shape so it opens to the outside and loses its grip on Na⁺, releasing them outside.',
      ],
      [
        'Binding 2 K⁺ and resetting',
        'Two potassium ions bind from outside, the phosphate is released, and the pump snaps back to its original shape, delivering K⁺ inside. Each cycle moves 3 Na⁺ out and 2 K⁺ in, leaving the inside more negative.',
      ],
    ],
    diagrams: [
      diagram(
        'The sodium–potassium pump',
        'One pump cycle: three sodium ions out, two potassium ions in, powered by one ATP. Both ions move against their gradients.',
        [
          rect(0, 88, 400, 74, '#fef3c7', { part: 'membrane' }),
          path('M0 88 L400 88 M0 162 L400 162', {
            stroke: '#f59e0b',
            strokeWidth: 2,
            part: 'membrane',
          }),
          text(10, 22, 'OUTSIDE: high Na⁺, low K⁺', {
            anchor: 'start',
            size: 10,
            bold: true,
            fill: '#475569',
            part: 'gradients',
          }),
          text(10, 250, 'INSIDE: low Na⁺, high K⁺', {
            anchor: 'start',
            size: 10,
            bold: true,
            fill: '#475569',
            part: 'gradients',
          }),
          path('M150 70 C150 58 250 58 250 70 L262 180 C262 196 138 196 138 180 Z', {
            fill: '#c4b5fd',
            stroke: '#6d28d9',
            part: 'pump',
          }),
          text(200, 130, 'Na⁺/K⁺ pump', { size: 9, bold: true, part: 'pump' }),
          ...[
            [168, 214],
            [184, 226],
            [200, 214],
          ].map(([x, y]) => circle(x, y, 7, '#fb7185', { stroke: '#be123c', part: 'na' })),
          arrow([160, 200], [160, 56], { stroke: '#be123c', strokeWidth: 2.5, part: 'na' }),
          ...[
            [160, 38],
            [176, 28],
            [184, 44],
          ].map(([x, y]) => circle(x, y, 7, '#fb7185', { stroke: '#be123c', part: 'na' })),
          text(130, 40, '3 Na⁺', { size: 10, bold: true, fill: '#be123c', part: 'na' }),
          ...[
            [222, 32],
            [238, 42],
          ].map(([x, y]) => circle(x, y, 8, '#93c5fd', { stroke: '#1d4ed8', part: 'k' })),
          arrow([242, 56], [242, 200], { stroke: '#1d4ed8', strokeWidth: 2.5, part: 'k' }),
          ...[
            [222, 216],
            [240, 222],
          ].map(([x, y]) => circle(x, y, 8, '#93c5fd', { stroke: '#1d4ed8', part: 'k' })),
          text(270, 40, '2 K⁺', { size: 10, bold: true, fill: '#1d4ed8', part: 'k' }),
          rect(292, 196, 50, 22, '#fecaca', { r: 11, stroke: '#b91c1c', part: 'atp' }),
          text(317, 211, 'ATP', { size: 10, bold: true, part: 'atp' }),
          arrow([292, 207], [262, 184], { stroke: '#b91c1c', part: 'atp' }),
          rect(330, 228, 64, 22, '#e2e8f0', { r: 11, stroke: '#64748b', part: 'atp' }),
          text(362, 243, 'ADP + Pᵢ', { size: 9, bold: true, part: 'atp' }),
          arrow([330, 214], [345, 226], { stroke: '#64748b', part: 'atp' }),
          text(334, 116, 'membrane', {
            anchor: 'start',
            size: 9,
            fill: '#92400e',
            part: 'membrane',
          }),
        ],
        [
          [
            'membrane',
            'Plasma membrane',
            [380, 100],
            'The bilayer blocks ions, so they can only cross through proteins like this pump.',
          ],
          [
            'pump',
            'Na⁺/K⁺-ATPase (carrier protein)',
            [124, 100],
            'A carrier that changes shape with each step of its cycle, working like an airlock.',
          ],
          [
            'na',
            '3 Na⁺ pumped out',
            [150, 214],
            'Sodium is already more concentrated outside, so pushing it out is uphill work.',
          ],
          [
            'k',
            '2 K⁺ pumped in',
            [258, 214],
            'Potassium is already more concentrated inside, so bringing it in is also uphill.',
          ],
          [
            'atp',
            'ATP hydrolysis',
            [372, 192],
            'One ATP per cycle phosphorylates the pump, providing the energy for the shape change.',
          ],
          [
            'gradients',
            'Concentration gradients',
            [200, 22],
            'The gradients the pump builds store energy, used by neurons for action potentials and by other carriers (like the Na⁺–glucose cotransporter) to move things.',
          ],
        ],
      ),
      diagram(
        'Passive vs active transport',
        'Three ways substances cross the membrane. Only active transport moves substances from low to high concentration, and only it needs ATP.',
        [
          rect(0, 100, 400, 50, '#fef3c7'),
          path('M0 100 L400 100 M0 150 L400 150', { stroke: '#f59e0b', strokeWidth: 2 }),
          text(200, 18, 'high concentration ↑ outside', { size: 10, fill: '#475569' }),
          text(126, 254, 'low concentration ↓ inside (for the first two)', {
            size: 9,
            fill: '#475569',
          }),
          ...[
            [40, 50],
            [60, 66],
            [76, 44],
            [52, 80],
          ].map(([x, y]) => circle(x, y, 4, '#38bdf8', { part: 'simple' })),
          arrow([60, 90], [60, 175], { stroke: '#0284c7', strokeWidth: 2.5, part: 'simple' }),
          circle(64, 200, 4, '#38bdf8', { part: 'simple' }),
          text(60, 228, 'Simple diffusion', { size: 10, bold: true, part: 'simple' }),
          rect(170, 94, 14, 62, '#c084fc', { r: 4, part: 'facilitated' }),
          rect(196, 94, 14, 62, '#c084fc', { r: 4, part: 'facilitated' }),
          ...[
            [176, 50],
            [196, 62],
            [210, 44],
            [184, 74],
          ].map(([x, y]) => circle(x, y, 4, '#fb7185', { part: 'facilitated' })),
          arrow([190, 84], [190, 178], {
            stroke: '#e11d48',
            strokeWidth: 2.5,
            part: 'facilitated',
          }),
          circle(194, 200, 4, '#fb7185', { part: 'facilitated' }),
          text(190, 228, 'Facilitated diffusion', { size: 10, bold: true, part: 'facilitated' }),
          path('M300 94 C300 86 352 86 352 94 L352 156 C352 164 300 164 300 156 Z', {
            fill: '#86efac',
            stroke: '#15803d',
            part: 'active',
          }),
          circle(318, 50, 4, '#a3e635', { stroke: '#4d7c0f', part: 'active' }),
          ...[
            [312, 186],
            [330, 196],
            [344, 182],
            [322, 206],
            [338, 214],
          ].map(([x, y]) => circle(x, y, 4, '#a3e635', { stroke: '#4d7c0f', part: 'active' })),
          arrow([326, 176], [326, 62], { stroke: '#15803d', strokeWidth: 2.5, part: 'active' }),
          rect(360, 112, 36, 20, '#fecaca', { r: 10, stroke: '#b91c1c', part: 'active' }),
          text(378, 126, 'ATP', { size: 9, bold: true, part: 'active' }),
          text(326, 234, 'Active transport', { size: 10, bold: true, part: 'active' }),
        ],
        [
          [
            'simple',
            'Simple diffusion',
            [96, 60],
            'Down the gradient, directly through the bilayer. Only small, non-polar molecules. No energy.',
          ],
          [
            'facilitated',
            'Facilitated diffusion',
            [228, 60],
            'Down the gradient, through a channel or carrier protein. For ions and polar molecules like glucose. No energy.',
          ],
          [
            'active',
            'Active transport',
            [376, 70],
            'Against the gradient, through a carrier pump, powered by ATP. Lets cells stockpile what they need, like a root hair absorbing scarce mineral ions.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Active transport', 'Movement against a concentration gradient using energy.'],
      ['Na⁺/K⁺-ATPase', 'The sodium–potassium pump: 3 Na⁺ out, 2 K⁺ in per ATP.'],
      [
        'Electrochemical gradient',
        'The combined concentration and charge difference across a membrane.',
      ],
      ['Cotransport', 'Using one substance’s gradient to drive another substance across.'],
      ['Endocytosis', 'Taking in large particles by wrapping them in membrane.'],
    ],
    goDeeper:
      'The sodium–potassium pump uses roughly a fifth to a quarter of a resting human’s ATP, and up to two-thirds in neurons. Because it moves three positive charges out for every two in, it is electrogenic: it helps make the inside of the cell negative (the resting potential of about −70 mV).\n\nSecondary active transport reuses the sodium gradient. In the small intestine and kidney, the SGLT1 cotransporter lets Na⁺ flow back in down its gradient and drags glucose in with it, even against glucose’s own gradient. Oral rehydration solutions (salt + sugar) work by exploiting this cotransporter.\n\nBulk transport moves things too big for proteins. Endocytosis wraps material in a pocket of membrane (phagocytosis for solids, pinocytosis for fluids), and exocytosis fuses vesicles with the membrane to release products like hormones and neurotransmitters. Both use ATP.',
    quiz: [
      mc(
        'What is the main difference between facilitated diffusion and active transport?',
        [
          'Active transport moves substances against their gradient using energy',
          'Only facilitated diffusion uses proteins',
          'Active transport only moves water',
          'Facilitated diffusion requires ATP',
        ],
        0,
        'Both use membrane proteins, but only active transport goes uphill and needs ATP.',
      ),
      predict(
        'A cell is treated with a poison that stops ATP production. Its Na⁺/K⁺ pumps stop.',
        'What happens to the Na⁺ concentration inside the cell over time?',
        [
          'It rises, as Na⁺ leaks in down its gradient and is no longer pumped out',
          'It falls to zero',
          'It stays the same forever',
          'It rises only if K⁺ also rises',
        ],
        0,
        'Leak channels keep letting Na⁺ in. Without the pump, the gradient runs down, and the cell swells as water follows.',
      ),
      label(
        'Match each process to its description.',
        [
          ['Exocytosis', 'Vesicle fuses with the membrane to release contents'],
          ['Phagocytosis', 'Cell engulfs a large solid particle'],
          ['Cotransport', 'One gradient drives another substance across'],
          ['Na⁺/K⁺ pump', '3 Na⁺ out, 2 K⁺ in, per ATP'],
        ],
        'All of these use energy, directly or indirectly.',
      ),
    ],
  }),

  hs({
    base: 'plant-cell',
    unit: 'cells',
    summary:
      'Plant and animal cells are both eukaryotic: they share a nucleus and membrane-bound organelles. Plants add a cellulose cell wall, chloroplasts and a large central vacuole, while animal cells have centrioles and lysosomes.',
    steps: [
      [
        'Shared eukaryotic organelles',
        'Both cell types have a nucleus (holding DNA), ribosomes (making proteins), rough and smooth ER, a Golgi apparatus, mitochondria (aerobic respiration) and a plasma membrane. Structure fits function: cells that secrete proteins have lots of rough ER and Golgi.',
      ],
      [
        'Plant-specific structures',
        'A cellulose cell wall gives strength and resists bursting. Chloroplasts carry out photosynthesis. A large central vacuole, surrounded by the tonoplast membrane, stores water, ions and pigments. Plasmodesmata are channels linking neighboring cells.',
      ],
      [
        'Support from turgor',
        'Water in the central vacuole presses outward against the wall, creating turgor pressure that keeps soft tissues upright. Animal cells instead rely on the cytoskeleton, and on skeletons at the organism level.',
      ],
    ],
    diagrams: [
      diagram(
        'A plant cell',
        'A typical leaf cell (mesophyll). The central vacuole takes up most of the volume, pushing the cytoplasm and organelles into a thin layer around the edge.',
        [
          rect(26, 16, 348, 228, '#ecfccb', {
            r: 16,
            stroke: '#65a30d',
            strokeWidth: 7,
            part: 'wall',
          }),
          rect(34, 24, 332, 212, '#f7fee7', {
            r: 11,
            stroke: '#16a34a',
            strokeWidth: 1.5,
            part: 'membrane',
          }),
          path('M366 92 L382 92 M366 98 L382 98 M366 150 L382 150 M366 156 L382 156', {
            stroke: '#3f6212',
            strokeWidth: 1.5,
            part: 'plasmo',
          }),
          rect(176, 44, 172, 150, '#dbeafe', {
            r: 26,
            stroke: '#3b82f6',
            strokeWidth: 2,
            part: 'vacuole',
          }),
          circle(100, 132, 34, '#e9d5ff', { stroke: '#7c3aed', strokeWidth: 2, part: 'nucleus' }),
          circle(106, 138, 11, '#7c3aed', { part: 'nucleolus' }),
          path('M140 104 Q154 132 140 160 M148 100 Q164 132 148 166 M156 98 Q174 132 156 168', {
            stroke: '#db2777',
            strokeWidth: 2,
            part: 'er',
          }),
          ...[
            [143, 110],
            [147, 124],
            [148, 140],
            [145, 154],
            [154, 108],
            [160, 126],
            [160, 142],
            [156, 158],
          ].map(([x, y]) => circle(x, y, 1.8, '#1e293b', { part: 'ribosomes' })),
          path('M60 196 Q86 184 112 196 M62 205 Q86 193 110 205 M64 214 Q86 202 108 214', {
            stroke: '#ea580c',
            strokeWidth: 3,
            part: 'golgi',
          }),
          circle(118, 190, 4, '#fdba74', { stroke: '#ea580c', strokeWidth: 1, part: 'golgi' }),
          ...[
            [80, 56],
            [216, 214],
            [310, 214],
          ].map(([x, y]) =>
            ellipse(x, y, 24, 11, '#86efac', {
              stroke: '#15803d',
              strokeWidth: 1.5,
              part: 'chloroplast',
            }),
          ),
          ...[
            [80, 56],
            [216, 214],
            [310, 214],
          ].map(([x, y]) =>
            path(
              `M${x - 12} ${y - 4} L${x - 12} ${y + 4} M${x - 4} ${y - 5} L${x - 4} ${y + 5} M${x + 4} ${y - 5} L${x + 4} ${y + 5} M${x + 12} ${y - 4} L${x + 12} ${y + 4}`,
              {
                stroke: '#15803d',
                strokeWidth: 2.5,
                part: 'chloroplast',
              },
            ),
          ),
          ...[
            [138, 44],
            [154, 214],
          ].map(([x, y]) =>
            ellipse(x, y, 15, 8, '#fdba74', { stroke: '#c2410c', strokeWidth: 1.5, part: 'mito' }),
          ),
          ...[
            [138, 44],
            [154, 214],
          ].map(([x, y]) =>
            path(
              `M${x - 10} ${y} L${x - 6} ${y - 4} L${x - 2} ${y + 4} L${x + 2} ${y - 4} L${x + 6} ${y + 4} L${x + 10} ${y}`,
              {
                stroke: '#c2410c',
                strokeWidth: 1,
                part: 'mito',
              },
            ),
          ),
          text(262, 124, 'central vacuole', { size: 10, fill: '#1d4ed8', part: 'vacuole' }),
        ],
        [
          [
            'wall',
            'Cell wall',
            [24, 92],
            'A tough layer of cellulose fibers outside the membrane. It gives shape and strength and stops the cell bursting.',
          ],
          [
            'membrane',
            'Plasma membrane',
            [44, 236],
            'Pressed against the wall; controls what enters and leaves the cell.',
          ],
          [
            'plasmo',
            'Plasmodesmata',
            [388, 124],
            'Narrow channels through the wall that connect the cytoplasm of neighboring cells, letting water and small molecules pass.',
          ],
          [
            'vacuole',
            'Central vacuole (tonoplast)',
            [340, 52],
            'A large sac of cell sap (water, ions, sugars, pigments). Its membrane, the tonoplast, controls what is stored. It maintains turgor.',
          ],
          [
            'nucleus',
            'Nucleus',
            [62, 104],
            'Contains the cell’s DNA as chromatin, surrounded by a double nuclear envelope with pores.',
          ],
          [
            'nucleolus',
            'Nucleolus',
            [106, 162],
            'A dense region of the nucleus where ribosome subunits are assembled.',
          ],
          [
            'er',
            'Rough endoplasmic reticulum',
            [172, 104],
            'Folded membranes studded with ribosomes. Proteins made here are folded and sent on to the Golgi.',
          ],
          [
            'ribosomes',
            'Ribosomes',
            [170, 160],
            'Tiny protein factories (made of rRNA and protein), free in the cytoplasm or attached to the ER.',
          ],
          [
            'golgi',
            'Golgi apparatus',
            [52, 186],
            'Modifies, sorts and packages proteins into vesicles; in plants it also makes materials for the cell wall.',
          ],
          [
            'chloroplast',
            'Chloroplasts',
            [242, 230],
            'Site of photosynthesis. Stacks of thylakoid membranes (grana) contain chlorophyll; the fluid around them is the stroma.',
          ],
          [
            'mito',
            'Mitochondria',
            [160, 30],
            'Site of aerobic respiration, making ATP. Plant cells have mitochondria as well as chloroplasts.',
          ],
        ],
      ),
      diagram(
        'An animal cell',
        'For comparison: no cell wall, no chloroplasts, and only small vacuoles, but animal cells have centrioles and many lysosomes.',
        [
          path(
            'M60 40 C140 6 300 10 350 60 C392 104 380 196 320 226 C250 258 110 250 60 210 C16 170 14 76 60 40 Z',
            {
              fill: '#fff1f2',
              stroke: '#e11d48',
              strokeWidth: 2.5,
              part: 'membrane',
            },
          ),
          circle(190, 128, 40, '#e9d5ff', { stroke: '#7c3aed', strokeWidth: 2, part: 'nucleus' }),
          circle(198, 134, 12, '#7c3aed', { part: 'nucleus' }),
          path('M238 96 Q256 128 238 160 M248 92 Q268 128 248 166', {
            stroke: '#db2777',
            strokeWidth: 2,
            part: 'er',
          }),
          ...[
            [241, 104],
            [246, 120],
            [246, 138],
            [243, 152],
            [253, 100],
            [259, 120],
            [259, 140],
            [254, 158],
          ].map(([x, y]) => circle(x, y, 1.8, '#1e293b', { part: 'er' })),
          path('M90 168 Q116 156 142 168 M92 177 Q116 165 140 177 M94 186 Q116 174 138 186', {
            stroke: '#ea580c',
            strokeWidth: 3,
            part: 'golgi',
          }),
          ...[
            [300, 100],
            [120, 70],
            [290, 190],
          ].map(([x, y]) =>
            ellipse(x, y, 18, 9, '#fdba74', { stroke: '#c2410c', strokeWidth: 1.5, part: 'mito' }),
          ),
          ...[
            [300, 100],
            [120, 70],
            [290, 190],
          ].map(([x, y]) =>
            path(
              `M${x - 12} ${y} L${x - 7} ${y - 5} L${x - 2} ${y + 5} L${x + 3} ${y - 5} L${x + 8} ${y + 5} L${x + 12} ${y}`,
              {
                stroke: '#c2410c',
                strokeWidth: 1,
                part: 'mito',
              },
            ),
          ),
          circle(320, 150, 9, '#a5b4fc', { stroke: '#4338ca', part: 'lysosome' }),
          circle(180, 212, 8, '#a5b4fc', { stroke: '#4338ca', part: 'lysosome' }),
          rect(76, 110, 16, 6, '#94a3b8', { r: 2, part: 'centrioles' }),
          rect(98, 104, 6, 16, '#94a3b8', { r: 2, part: 'centrioles' }),
          circle(150, 40, 6, '#bae6fd', { stroke: '#0284c7', part: 'vesicle' }),
          circle(240, 220, 6, '#bae6fd', { stroke: '#0284c7', part: 'vesicle' }),
        ],
        [
          [
            'membrane',
            'Plasma membrane (no wall)',
            [30, 120],
            'The only boundary. Without a wall, animal cells can change shape, move and engulf particles.',
          ],
          [
            'nucleus',
            'Nucleus',
            [190, 78],
            'Holds DNA; the nucleolus inside builds ribosome parts.',
          ],
          [
            'er',
            'Rough ER with ribosomes',
            [280, 128],
            'Makes and folds proteins for export or for membranes.',
          ],
          [
            'golgi',
            'Golgi apparatus',
            [80, 196],
            'Packages proteins into vesicles headed for the membrane or lysosomes.',
          ],
          [
            'mito',
            'Mitochondria',
            [330, 80],
            'Power aerobic respiration; numerous in active cells like muscle.',
          ],
          [
            'lysosome',
            'Lysosomes',
            [344, 160],
            'Vesicles of digestive enzymes that break down worn-out parts and engulfed microbes.',
          ],
          [
            'centrioles',
            'Centrioles',
            [64, 98],
            'A pair of microtubule cylinders that organize the spindle during cell division (mostly absent in plants).',
          ],
          [
            'vesicle',
            'Vesicles',
            [164, 30],
            'Small membrane bubbles that carry materials around the cell and to the surface for exocytosis.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Eukaryotic', 'Having a nucleus and membrane-bound organelles.'],
      ['Cellulose', 'The tough carbohydrate that makes up plant cell walls.'],
      ['Chloroplast', 'Organelle where photosynthesis takes place.'],
      ['Tonoplast', 'The membrane around the central vacuole.'],
      ['Plasmodesmata', 'Channels through cell walls that connect neighboring plant cells.'],
    ],
    goDeeper:
      'Prokaryotic cells (bacteria and archaea) are much smaller and simpler: no nucleus, DNA in a circular chromosome in the nucleoid region, often extra plasmids, smaller (70S) ribosomes, and usually a cell wall made of peptidoglycan rather than cellulose. All cells share a membrane, cytoplasm, ribosomes and DNA.\n\nFungi are eukaryotes with cell walls too, but theirs are made of chitin, the same material found in insect exoskeletons. That is one reason fungi are not plants.\n\nIn reality, it’s a bit more complicated: plant cells do have small vacuoles and some lysosome-like functions (the central vacuole contains digestive enzymes), and many cells in a plant have no chloroplasts at all, such as root cells, which live in the dark.',
    quiz: [
      mc(
        'Which structure is found in plant cells but NOT animal cells?',
        ['Cell wall', 'Mitochondria', 'Ribosomes', 'Golgi apparatus'],
        0,
        'Both cell types have mitochondria, ribosomes and Golgi. The cellulose cell wall is plant-only.',
      ),
      predict(
        'A cell is found to have a cell wall, a nucleus, mitochondria and no chloroplasts.',
        'Which could it be?',
        [
          'A plant root cell or a fungal cell',
          'A human muscle cell',
          'A bacterium',
          'A red blood cell',
        ],
        0,
        'A nucleus rules out bacteria; a wall rules out animal cells. Root cells (and fungi) lack chloroplasts.',
      ),
      label(
        'Match each organelle to its function.',
        [
          ['Chloroplast', 'Photosynthesis'],
          ['Mitochondrion', 'Aerobic respiration'],
          ['Golgi apparatus', 'Packages proteins into vesicles'],
          ['Central vacuole', 'Stores water and maintains turgor'],
        ],
        'Each organelle’s structure matches its function.',
      ),
    ],
  }),
];
