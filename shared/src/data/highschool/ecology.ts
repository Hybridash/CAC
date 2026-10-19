import type { Concept, DiagramShape } from '../../types';
import { label, mc, predict } from '../concepts/helpers';
import { arrow, circle, diagram, ellipse, hs, path, rect, text } from './build';

const LEVEL_FILL: Record<string, [string, string]> = {
  producer: ['#bbf7d0', '#15803d'],
  primary: ['#fef08a', '#a16207'],
  secondary: ['#fed7aa', '#c2410c'],
  tertiary: ['#fecaca', '#b91c1c'],
  decomposer: ['#e7e5e4', '#57534e'],
};

/** An organism in the food web: a labeled pill colored by trophic level. */
function organism(
  x: number,
  y: number,
  name: string,
  level: string,
  part = level,
  w = 62,
): DiagramShape[] {
  const [fill, stroke] = LEVEL_FILL[level];
  return [
    rect(x - w / 2, y - 10, w, 20, fill, { r: 10, stroke, strokeWidth: 1.5, part }),
    text(x, y + 4, name, { size: 9, bold: true, part }),
  ];
}

/** Energy-flow arrow from prey (below) to predator (above). */
const eats = (from: [number, number], to: [number, number], part = 'energy') =>
  arrow([from[0], from[1] - 11], [to[0], to[1] + 12], {
    stroke: '#64748b',
    strokeWidth: 1.3,
    part,
  });

/** A smooth line through points, for graphs. */
const curve = (pts: [number, number][]) =>
  'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L');

export const ecology: Concept[] = [
  hs({
    base: 'food-chains',
    unit: 'ecology',
    summary:
      'Energy flows one way through an ecosystem, from sunlight to producers to consumers, and is lost as heat at each step. Matter cycles. Food webs show who eats whom, and organisms are grouped into trophic levels according to their position in the web.',
    steps: [
      [
        'Energy flows, matter cycles',
        'Almost all ecosystems run on sunlight. Energy enters as light, is passed along as chemical energy in food, and eventually leaves as heat; it can’t be recycled. Matter (carbon, nitrogen, water) is used again and again.',
      ],
      [
        'Producers (autotrophs)',
        'Plants, algae and cyanobacteria capture light energy by photosynthesis and build organic molecules: the first trophic level. The rate they store energy as biomass is net primary productivity. In deep-sea vents, chemosynthetic bacteria are the producers.',
      ],
      [
        'Consumers (heterotrophs)',
        'Primary consumers (herbivores) eat producers, secondary consumers eat herbivores, and tertiary consumers eat secondary consumers. Omnivores feed at more than one level, and so do many predators.',
      ],
      [
        'Food webs',
        'A food chain is one pathway; a food web shows all the overlapping chains in an ecosystem. Arrows point from the organism eaten to the eater, showing the direction energy flows.',
      ],
      [
        'Energy loss at each level',
        'Only about 10% of the energy at one trophic level ends up stored in the next. The rest is used in respiration (released as heat), lost in waste, or never eaten. This limits how many levels a food chain can have.',
      ],
      [
        'Interdependence',
        'Because species are linked, changes ripple through the web. Removing a predator can let herbivores overgraze plants (a trophic cascade). Persistent toxins like DDT become more concentrated at each level (biomagnification), harming top predators most.',
      ],
      [
        'Decomposers and detritivores',
        'Bacteria and fungi (decomposers) and detritivores like earthworms break down dead organisms and wastes, releasing nutrients such as nitrates and phosphates back to the soil for producers. Without them, nutrients would stay locked in dead matter.',
      ],
    ],
    diagrams: [
      diagram(
        'A woodland food web',
        'Arrows point from the organism that is eaten to the one that eats it, showing the direction of energy flow. Colors mark trophic levels.',
        [
          eats([60, 210], [40, 156]),
          eats([60, 210], [130, 156]),
          eats([180, 210], [130, 156]),
          eats([180, 210], [310, 156]),
          eats([300, 210], [310, 156]),
          eats([300, 210], [220, 156]),
          eats([60, 210], [220, 156]),
          eats([40, 156], [60, 98]),
          eats([220, 156], [170, 98]),
          arrow([92, 98], [136, 98], { stroke: '#64748b', strokeWidth: 1.3, part: 'energy' }),
          eats([130, 156], [280, 98]),
          eats([220, 156], [280, 98]),
          eats([180, 210], [280, 98], 'omnivore'),
          eats([170, 98], [190, 40]),
          eats([130, 156], [190, 40]),
          eats([220, 156], [190, 40]),
          path('M300 220 Q310 236 290 244 M280 108 Q370 140 344 238', {
            stroke: '#78716c',
            strokeWidth: 1.3,
            dash: true,
            part: 'decomposer',
          }),
          ...organism(60, 210, 'Grass', 'producer'),
          ...organism(180, 210, 'Shrubs', 'producer'),
          ...organism(300, 210, 'Oak tree', 'producer'),
          ...organism(40, 156, 'Grasshopper', 'primary', 'primary', 68),
          ...organism(130, 156, 'Rabbit', 'primary'),
          ...organism(220, 156, 'Mouse', 'primary'),
          ...organism(310, 156, 'Deer', 'primary'),
          ...organism(60, 98, 'Frog', 'secondary'),
          ...organism(170, 98, 'Snake', 'secondary'),
          ...organism(280, 98, 'Fox', 'secondary', 'omnivore'),
          ...organism(190, 40, 'Hawk', 'tertiary'),
          ...organism(300, 248, 'Fungi & bacteria', 'decomposer', 'decomposer', 96),
          text(398, 214, 'producers', {
            anchor: 'end',
            size: 8,
            fill: '#15803d',
            part: 'producer',
          }),
          text(398, 160, '1° consumers', {
            anchor: 'end',
            size: 8,
            fill: '#a16207',
            part: 'primary',
          }),
          text(398, 102, '2° consumers', {
            anchor: 'end',
            size: 8,
            fill: '#c2410c',
            part: 'secondary',
          }),
          text(398, 44, '3° consumer', {
            anchor: 'end',
            size: 8,
            fill: '#b91c1c',
            part: 'tertiary',
          }),
        ],
        [
          [
            'producer',
            'Producers',
            [18, 230],
            'Capture sunlight by photosynthesis. Every other organism here depends on them.',
          ],
          [
            'primary',
            'Primary consumers',
            [100, 136],
            'Herbivores that eat producers: the second trophic level.',
          ],
          [
            'secondary',
            'Secondary consumers',
            [94, 78],
            'Eat herbivores. The snake also eats frogs, so it sometimes feeds at the fourth level.',
          ],
          [
            'tertiary',
            'Tertiary consumer',
            [232, 30],
            'The hawk is a top predator: nothing here eats it. It feeds at several levels.',
          ],
          [
            'omnivore',
            'Omnivore',
            [322, 84],
            'The fox eats rabbits and mice, and also berries from shrubs, so it feeds at more than one level.',
          ],
          [
            'decomposer',
            'Decomposers',
            [360, 232],
            'Break down dead matter and waste from every level, returning nutrients to the soil.',
          ],
          [
            'energy',
            'Arrows = energy flow',
            [100, 186],
            'Each arrow points from food to feeder. Follow any path from a producer to the hawk to trace a food chain.',
          ],
        ],
      ),
      diagram(
        'Where a consumer’s energy goes',
        'Of the energy in the food a rabbit eats (100 units), only about 10 units end up as new rabbit tissue that a predator could eat.',
        [
          rect(140, 80, 120, 80, '#fef08a', {
            r: 16,
            stroke: '#a16207',
            strokeWidth: 2,
            part: 'consumer',
          }),
          text(200, 116, 'Rabbit', { size: 12, bold: true, part: 'consumer' }),
          text(200, 132, '(primary consumer)', { size: 9, fill: '#475569', part: 'consumer' }),
          arrow([20, 120], [136, 120], { stroke: '#15803d', strokeWidth: 10, part: 'eaten' }),
          text(70, 104, '100 units', { size: 10, bold: true, fill: '#15803d', part: 'eaten' }),
          text(70, 146, 'plants eaten', { size: 9, fill: '#475569', part: 'eaten' }),
          arrow([210, 78], [260, 22], { stroke: '#dc2626', strokeWidth: 7, part: 'heat' }),
          text(272, 22, '~60 units', {
            anchor: 'start',
            size: 10,
            bold: true,
            fill: '#dc2626',
            part: 'heat',
          }),
          text(272, 36, 'respiration → heat', {
            anchor: 'start',
            size: 9,
            fill: '#475569',
            part: 'heat',
          }),
          arrow([200, 162], [200, 226], { stroke: '#78716c', strokeWidth: 6, part: 'waste' }),
          text(212, 216, '~30 units', {
            anchor: 'start',
            size: 10,
            bold: true,
            fill: '#57534e',
            part: 'waste',
          }),
          text(212, 230, 'feces & urine → decomposers', {
            anchor: 'start',
            size: 9,
            fill: '#475569',
            part: 'waste',
          }),
          arrow([262, 120], [366, 120], { stroke: '#c2410c', strokeWidth: 3, part: 'growth' }),
          text(316, 104, '~10 units', { size: 10, bold: true, fill: '#c2410c', part: 'growth' }),
          text(316, 146, 'growth: available', { size: 9, fill: '#475569', part: 'growth' }),
          text(316, 158, 'to the next level', { size: 9, fill: '#475569', part: 'growth' }),
        ],
        [
          ['eaten', 'Energy eaten', [26, 96], 'Chemical energy in the plants the rabbit consumes.'],
          [
            'heat',
            'Respiration (heat)',
            [240, 66],
            'Most energy is used to stay warm, move and keep cells running. Cellular respiration releases it as heat, which leaves the ecosystem.',
          ],
          [
            'waste',
            'Waste',
            [184, 196],
            'Cellulose and other parts the rabbit can’t digest pass out as feces; this energy goes to decomposers.',
          ],
          [
            'growth',
            'Growth and reproduction',
            [370, 96],
            'Energy stored in new tissue: the only part a fox can eat. This is roughly 10%.',
          ],
          [
            'consumer',
            'The consumer',
            [128, 170],
            'Endotherms (warm-blooded animals) like rabbits lose more to heat than ectotherms like insects, so they pass on even less.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Producer (autotroph)', 'Organism that makes its own food, usually by photosynthesis.'],
      ['Consumer (heterotroph)', 'Organism that gets energy by eating other organisms.'],
      ['Trophic level', 'An organism’s feeding position in a food chain.'],
      ['Food web', 'All the interconnected food chains in an ecosystem.'],
      [
        'Decomposer',
        'Organism (bacteria, fungi) that breaks down dead matter and recycles nutrients.',
      ],
      ['Biomagnification', 'Increasing concentration of a toxin at higher trophic levels.'],
    ],
    goDeeper:
      'DDT, a pesticide widely used in the 1950s–60s, shows biomagnification. It is fat-soluble and isn’t broken down, so it builds up in each organism and concentrates up the food chain: from parts per trillion in water to parts per million in top predators like ospreys and bald eagles. It thinned their eggshells, crashing populations until it was banned in the US in 1972. Mercury in large fish like tuna is a modern example.\n\nKeystone species have effects far larger than their numbers suggest. When sea otters were hunted out of kelp forests, sea urchins exploded and grazed the kelp into barren “urchin deserts”; returning otters restored the forests.\n\nIn reality, it’s a bit more complicated: “10%” is an average. Efficiency between levels ranges from about 5% to 20% depending on the organisms, and many organisms feed at several levels at once.',
    quiz: [
      mc(
        'In a food web, what do the arrows represent?',
        [
          'The direction energy flows, from food to the organism eating it',
          'Which animal hunts which, pointing at the prey',
          'The movement of decomposers',
          'The direction of migration',
        ],
        0,
        'Arrows point from the organism eaten to the eater, following energy.',
      ),
      predict(
        'A disease wipes out most of the rabbits in the woodland food web above.',
        'Which is the most likely short-term effect?',
        [
          'Shrubs and grass increase, and foxes and hawks eat more mice',
          'Hawks increase because they have less competition',
          'Nothing changes because foxes are omnivores',
          'Grass decreases because rabbits fertilize it',
        ],
        0,
        'Less grazing lets plants grow; predators switch to other prey like mice, so mouse numbers may fall too: changes ripple through the web.',
      ),
      label(
        'Match each organism to its role.',
        [
          ['Oak tree', 'Producer'],
          ['Deer', 'Primary consumer'],
          ['Snake', 'Secondary consumer'],
          ['Fungi', 'Decomposer'],
        ],
        'Roles describe how an organism gets its energy.',
      ),
    ],
  }),

  hs({
    base: 'energy-pyramids',
    unit: 'ecology',
    summary:
      'An energy pyramid shows how much energy is stored at each trophic level. Because roughly 90% is lost between levels, each level holds about a tenth of the one below, which is why food chains are short and top predators are rare. Pyramids of numbers and biomass can sometimes be inverted, but energy pyramids never are.',
    steps: [
      [
        'Primary productivity',
        'Producers capture only about 1% of the sunlight reaching them. Gross primary productivity (GPP) is the total energy they fix; net primary productivity (NPP) is what remains after their own respiration, and it is the energy available to consumers.',
      ],
      [
        'Where energy goes',
        'At each level, energy is used for respiration (lost as heat), passed out in waste, or stays in organisms that die uneaten (going to decomposers). Only energy stored in new biomass can be passed up.',
      ],
      [
        'The 10% rule',
        'On average about 10% of energy passes from one level to the next (actual efficiency ranges from about 5% to 20%). Starting with 10,000 kJ in producers leaves about 1,000 kJ for herbivores, 100 kJ for carnivores and 10 kJ for top carnivores.',
      ],
      [
        'Short chains and few top predators',
        'With so little energy left after 4–5 levels, there isn’t enough to support another level. Top predators are rare and need large territories. It also means more people can be fed by eating plants directly than by feeding plants to livestock.',
      ],
    ],
    diagrams: [
      diagram(
        'An energy pyramid',
        'Energy available at each trophic level (kJ per m² per year, example values). Each level gets about 10% of the one below; the rest is lost, mostly as heat.',
        [
          path('M60 210 L340 210 L320 168 L80 168 Z', {
            fill: '#bbf7d0',
            stroke: '#15803d',
            strokeWidth: 2,
            part: 'producers',
          }),
          path('M84 162 L316 162 L294 120 L106 120 Z', {
            fill: '#fef08a',
            stroke: '#a16207',
            strokeWidth: 2,
            part: 'primary',
          }),
          path('M110 114 L290 114 L266 72 L134 72 Z', {
            fill: '#fed7aa',
            stroke: '#c2410c',
            strokeWidth: 2,
            part: 'secondary',
          }),
          path('M138 66 L262 66 L236 26 L164 26 Z', {
            fill: '#fecaca',
            stroke: '#b91c1c',
            strokeWidth: 2,
            part: 'tertiary',
          }),
          text(200, 186, 'Producers', { size: 10, bold: true, part: 'producers' }),
          text(200, 200, '10,000 kJ', { size: 9.5, part: 'producers' }),
          text(200, 138, 'Primary consumers', { size: 10, bold: true, part: 'primary' }),
          text(200, 152, '1,000 kJ', { size: 9.5, part: 'primary' }),
          text(200, 90, 'Secondary', { size: 10, bold: true, part: 'secondary' }),
          text(200, 104, '100 kJ', { size: 9.5, part: 'secondary' }),
          text(200, 44, 'Tertiary', { size: 10, bold: true, part: 'tertiary' }),
          text(200, 58, '10 kJ', { size: 9.5, part: 'tertiary' }),
          ...[189, 141, 93, 47].map((y, i) =>
            arrow([[332, 306, 280, 252][i], y], [[384, 366, 352, 330][i], y - 10], {
              stroke: '#dc2626',
              strokeWidth: 2,
              part: 'heat',
            }),
          ),
          text(370, 236, '~90% lost', { size: 9.5, bold: true, fill: '#dc2626', part: 'heat' }),
          text(370, 248, 'at each step', { size: 9, fill: '#dc2626', part: 'heat' }),
          circle(28, 186, 15, '#fde047', { stroke: '#ca8a04', part: 'sun' }),
          arrow([44, 186], [70, 190], { stroke: '#ca8a04', strokeWidth: 2, part: 'sun' }),
          text(28, 216, 'sunlight', { size: 8.5, fill: '#a16207', part: 'sun' }),
        ],
        [
          [
            'sun',
            'Sunlight',
            [14, 162],
            'Producers capture only about 1% of the light energy that reaches them.',
          ],
          [
            'producers',
            'Producers: 10,000 kJ',
            [52, 220],
            'The base of the pyramid always holds the most energy.',
          ],
          [
            'primary',
            'Primary consumers: 1,000 kJ',
            [76, 140],
            'About 10% of the producers’ energy ends up in herbivore tissue.',
          ],
          [
            'secondary',
            'Secondary consumers: 100 kJ',
            [102, 92],
            '10% of 1,000 kJ. Carnivores must catch many herbivores to get enough energy.',
          ],
          [
            'tertiary',
            'Tertiary consumers: 10 kJ',
            [130, 30],
            'Only 0.1% of the original producer energy. There isn’t enough for another full level.',
          ],
          [
            'heat',
            'Energy lost',
            [392, 160],
            'Mostly respiration (heat), plus waste and uneaten remains. Lost energy can’t be recycled.',
          ],
        ],
      ),
      diagram(
        'Three kinds of ecological pyramid',
        'Numbers and biomass pyramids can be inverted in some ecosystems. Energy pyramids are always upright, because energy is always lost moving up.',
        [
          text(66, 100, 'Numbers', { size: 11, bold: true, part: 'numbers' }),
          text(66, 114, '(one oak tree)', { size: 8.5, fill: '#475569', part: 'numbers' }),
          rect(56, 188, 20, 20, '#bbf7d0', { stroke: '#15803d', part: 'numbers' }),
          rect(16, 160, 100, 24, '#fef08a', { stroke: '#a16207', part: 'numbers' }),
          rect(40, 132, 52, 24, '#fed7aa', { stroke: '#c2410c', part: 'numbers' }),
          text(66, 202, '1 tree', { size: 7.5, part: 'numbers' }),
          text(66, 176, '5,000 caterpillars', { size: 7.5, part: 'numbers' }),
          text(66, 148, '30 birds', { size: 7.5, part: 'numbers' }),
          text(66, 232, 'can be inverted', {
            size: 9,
            fill: '#b45309',
            bold: true,
            part: 'numbers',
          }),
          text(200, 100, 'Biomass', { size: 11, bold: true, part: 'biomass' }),
          text(200, 114, '(open ocean)', { size: 8.5, fill: '#475569', part: 'biomass' }),
          rect(176, 188, 48, 20, '#bbf7d0', { stroke: '#15803d', part: 'biomass' }),
          rect(150, 160, 100, 24, '#fef08a', { stroke: '#a16207', part: 'biomass' }),
          text(200, 202, 'phytoplankton', { size: 7.5, part: 'biomass' }),
          text(200, 176, 'zooplankton', { size: 7.5, part: 'biomass' }),
          text(200, 232, 'can be inverted', {
            size: 9,
            fill: '#b45309',
            bold: true,
            part: 'biomass',
          }),
          text(334, 100, 'Energy', { size: 11, bold: true, part: 'energy' }),
          text(334, 114, '(any ecosystem)', { size: 8.5, fill: '#475569', part: 'energy' }),
          rect(274, 188, 120, 20, '#bbf7d0', { stroke: '#15803d', part: 'energy' }),
          rect(304, 164, 60, 20, '#fef08a', { stroke: '#a16207', part: 'energy' }),
          rect(322, 140, 24, 20, '#fed7aa', { stroke: '#c2410c', part: 'energy' }),
          rect(330, 120, 8, 16, '#fecaca', { stroke: '#b91c1c', part: 'energy' }),
          text(334, 232, 'always upright', {
            size: 9,
            fill: '#15803d',
            bold: true,
            part: 'energy',
          }),
        ],
        [
          [
            'numbers',
            'Pyramid of numbers',
            [20, 96],
            'Counts individuals. One huge oak can feed thousands of caterpillars, so the pyramid narrows at its base.',
          ],
          [
            'biomass',
            'Pyramid of biomass',
            [152, 96],
            'Measures the mass of living material at one moment. Phytoplankton reproduce so fast that a small standing biomass supports a larger zooplankton biomass.',
          ],
          [
            'energy',
            'Pyramid of energy',
            [288, 96],
            'Measures energy flow over time. It can never be inverted: no level can receive more energy than the one below provides.',
          ],
        ],
      ),
    ],
    keyTerms: [
      [
        'Trophic efficiency',
        'Percentage of energy passed from one trophic level to the next (≈10%).',
      ],
      ['Biomass', 'The total mass of living organisms at a trophic level.'],
      ['Gross primary productivity', 'Total energy fixed by producers.'],
      [
        'Net primary productivity',
        'Energy left after producers’ own respiration; available to consumers.',
      ],
      ['Energy pyramid', 'A diagram of energy available at each trophic level.'],
    ],
    goDeeper:
      'The 10% rule has big consequences for food. About 77% of the world’s farmland is used for livestock and their feed, yet it provides only about 18% of the world’s calories. Eating lower on the food chain means less energy is lost along the way, so the same land can feed more people.\n\nEcosystems differ hugely in productivity. Tropical rainforests, coral reefs and estuaries have very high NPP per square meter; deserts and the open ocean have low NPP per area. But because the ocean is so vast, it accounts for nearly half of Earth’s total primary production.\n\nIn reality, it’s a bit more complicated: some energy enters food webs through detritus (dead material) rather than living plants, and in many ecosystems most of the energy flows through decomposers.',
    quiz: [
      mc(
        'A grassland’s producers contain 50,000 kJ of energy. About how much energy reaches the secondary consumers?',
        ['500 kJ', '5,000 kJ', '50 kJ', '45,000 kJ'],
        0,
        '50,000 → 5,000 (primary) → 500 (secondary), losing about 90% at each transfer.',
      ),
      predict(
        'Ecologists measure a pyramid of numbers in an oak woodland: 1 tree, 5,000 caterpillars, 30 birds.',
        'What would the energy pyramid for the same woodland look like?',
        [
          'Upright: the tree level has the most energy',
          'Inverted, like the numbers pyramid',
          'All levels have equal energy',
          'The caterpillar level has the most energy',
        ],
        0,
        'Energy pyramids are always upright: the caterpillars can only receive a fraction of the energy the tree captured.',
      ),
      label(
        'Match each term to its meaning.',
        [
          ['10% rule', 'About a tenth of energy passes to the next level'],
          ['Respiration', 'Main way energy is lost as heat'],
          ['Net primary productivity', 'Producer energy available to consumers'],
          ['Top predator', 'Few individuals because little energy remains'],
        ],
        'Energy losses shape the structure of every ecosystem.',
      ),
    ],
  }),

  hs({
    base: 'carbon-cycle',
    unit: 'ecology',
    summary:
      'Carbon cycles between the atmosphere, living things, the oceans and long-term stores like fossil fuels and rocks. Photosynthesis removes CO₂ from the air; respiration, decomposition and combustion return it. Burning fossil fuels moves ancient carbon into the atmosphere far faster than natural processes remove it.',
    steps: [
      [
        'Carbon fixation',
        'Producers take in CO₂ and use photosynthesis to build it into glucose and other organic molecules. Oceans also absorb CO₂ directly; phytoplankton fix carbon there, and some becomes shells made of calcium carbonate.',
      ],
      [
        'Through the food web',
        'Carbon moves from producers to consumers as they eat, forming the carbohydrates, proteins, fats and DNA in their bodies. Carbon in dead matter and wastes passes to decomposers.',
      ],
      [
        'Return to the atmosphere',
        'Cellular respiration by every organism (including decomposers) releases CO₂. Combustion of wood and fossil fuels releases it too. In a balanced cycle, photosynthesis and respiration roughly cancel out.',
      ],
      [
        'Long-term stores',
        'Some carbon is locked away for millions of years: buried remains form coal, oil and natural gas, and marine shells form limestone. Burning fossil fuels has raised atmospheric CO₂ from about 280 ppm before the Industrial Revolution to over 420 ppm today, strengthening the greenhouse effect.',
      ],
    ],
    diagrams: [
      diagram(
        'The carbon cycle',
        'Boxes are carbon stores (reservoirs); arrows are processes that move carbon between them.',
        [
          rect(120, 8, 160, 34, '#e0f2fe', {
            r: 17,
            stroke: '#0284c7',
            strokeWidth: 2,
            part: 'air',
          }),
          text(200, 30, 'CO₂ in the atmosphere', {
            size: 10,
            bold: true,
            fill: '#0369a1',
            part: 'air',
          }),
          path('M30 196 L60 120 L90 196 Z', { fill: '#4ade80', stroke: '#15803d', part: 'photo' }),
          rect(56, 196, 8, 18, '#92400e', { part: 'photo' }),
          text(60, 230, 'Plants', { size: 9.5, bold: true, part: 'photo' }),
          ellipse(170, 186, 26, 14, '#fde68a', { stroke: '#a16207', part: 'feeding' }),
          circle(194, 176, 8, '#fde68a', { stroke: '#a16207', part: 'feeding' }),
          text(136, 206, 'Animals', { anchor: 'end', size: 9.5, bold: true, part: 'feeding' }),
          rect(110, 226, 180, 30, '#d6d3d1', { r: 6, stroke: '#78716c', part: 'decomp' }),
          text(200, 245, 'Dead matter & soil (decomposers)', {
            size: 9,
            bold: true,
            part: 'decomp',
          }),
          rect(306, 150, 90, 50, '#bfdbfe', { r: 8, stroke: '#2563eb', part: 'ocean' }),
          text(351, 172, 'Ocean', { size: 10, bold: true, fill: '#1d4ed8', part: 'ocean' }),
          text(351, 186, 'dissolved CO₂', { size: 8.5, fill: '#1d4ed8', part: 'ocean' }),
          rect(300, 222, 96, 34, '#292524', { r: 6, part: 'fossil' }),
          text(348, 243, 'Fossil fuels', { size: 9.5, bold: true, fill: '#fff', part: 'fossil' }),
          rect(222, 98, 44, 30, '#e5e7eb', { r: 3, stroke: '#4b5563', part: 'combustion' }),
          rect(250, 74, 10, 26, '#6b7280', { part: 'combustion' }),
          arrow([140, 30], [64, 116], { stroke: '#16a34a', strokeWidth: 3, part: 'photo' }),
          text(64, 70, 'photosynthesis', { size: 9, bold: true, fill: '#15803d', part: 'photo' }),
          arrow([78, 140], [150, 44], { stroke: '#dc2626', strokeWidth: 2, part: 'resp' }),
          arrow([172, 170], [186, 44], { stroke: '#dc2626', strokeWidth: 2, part: 'resp' }),
          text(146, 96, 'respiration', { size: 9, bold: true, fill: '#dc2626', part: 'resp' }),
          arrow([90, 170], [142, 182], { stroke: '#a16207', strokeWidth: 2, part: 'feeding' }),
          text(112, 166, 'eating', { size: 8.5, fill: '#a16207', part: 'feeding' }),
          arrow([70, 214], [120, 230], { stroke: '#78716c', strokeWidth: 1.8, part: 'death' }),
          arrow([178, 200], [190, 226], { stroke: '#78716c', strokeWidth: 1.8, part: 'death' }),
          arrow([210, 226], [210, 44], {
            stroke: '#dc2626',
            strokeWidth: 2,
            dash: true,
            part: 'decomp',
          }),
          text(214, 210, 'decomposition', {
            anchor: 'start',
            size: 8.5,
            bold: true,
            fill: '#b91c1c',
            part: 'decomp',
          }),
          arrow([290, 240], [300, 240], { stroke: '#57534e', strokeWidth: 2, part: 'fossil' }),
          arrow([330, 222], [262, 120], {
            stroke: '#1f2937',
            strokeWidth: 2.5,
            part: 'combustion',
          }),
          arrow([248, 72], [258, 44], { stroke: '#1f2937', strokeWidth: 3, part: 'combustion' }),
          text(246, 146, 'combustion', {
            size: 9,
            bold: true,
            fill: '#1f2937',
            part: 'combustion',
          }),
          arrow([290, 30], [344, 146], {
            bend: 14,
            stroke: '#2563eb',
            strokeWidth: 2,
            part: 'ocean',
          }),
          arrow([370, 146], [300, 36], {
            bend: 14,
            stroke: '#2563eb',
            strokeWidth: 2,
            part: 'ocean',
          }),
        ],
        [
          [
            'air',
            'Atmospheric CO₂',
            [292, 14],
            'A small but crucial store (~0.04% of air). It traps heat, so its size controls Earth’s temperature.',
          ],
          [
            'photo',
            'Photosynthesis',
            [34, 52],
            'Producers remove CO₂ from the air and fix it into organic molecules.',
          ],
          [
            'resp',
            'Cellular respiration',
            [166, 112],
            'All organisms break down organic molecules for energy, releasing CO₂.',
          ],
          [
            'feeding',
            'Feeding',
            [104, 150],
            'Carbon passes up the food web in the molecules consumers eat.',
          ],
          [
            'death',
            'Death and waste',
            [96, 230],
            'Dead organisms and wastes carry carbon to the soil.',
          ],
          [
            'decomp',
            'Decomposition',
            [226, 186],
            'Decomposers respire, releasing the carbon in dead matter as CO₂.',
          ],
          [
            'ocean',
            'Ocean exchange',
            [384, 132],
            'CO₂ dissolves into seawater and comes back out. The oceans have absorbed about a quarter of human emissions, making seawater more acidic.',
          ],
          [
            'fossil',
            'Fossil fuels',
            [314, 216],
            'Remains buried for millions of years form coal, oil and gas: a long-term carbon store.',
          ],
          [
            'combustion',
            'Combustion',
            [274, 70],
            'Burning fuel rapidly returns long-stored carbon to the air, adding about 37 billion tonnes of CO₂ a year.',
          ],
        ],
      ),
      diagram(
        'Rising CO₂: the Keeling Curve',
        'Atmospheric CO₂ measured at Mauna Loa, Hawaii, since 1958 (simplified). The yearly zigzag comes from plant growth in the Northern Hemisphere.',
        [
          path('M50 20 L50 210 L384 210', { strokeWidth: 1.5 }),
          ...[320, 360, 400, 420].map((ppm) => {
            const y = 210 - ((ppm - 310) / 120) * 190;
            return text(44, y + 3, String(ppm), { anchor: 'end', size: 8.5, fill: '#64748b' });
          }),
          text(44, 14, 'ppm', { anchor: 'end', size: 8.5, fill: '#64748b' }),
          ...[1960, 1980, 2000, 2020].map((yr) =>
            text(50 + ((yr - 1958) / 66) * 330, 226, String(yr), { size: 8.5, fill: '#64748b' }),
          ),
          path(
            curve(
              Array.from({ length: 265 }, (_, i) => {
                const yr = 1958 + i / 4;
                const ppm =
                  315 +
                  0.75 * (yr - 1958) +
                  0.0128 * (yr - 1958) ** 2 +
                  3 * Math.sin((i * Math.PI) / 2);
                return [50 + ((yr - 1958) / 66) * 330, 210 - ((ppm - 310) / 120) * 190];
              }),
            ),
            { stroke: '#dc2626', strokeWidth: 1.8, part: 'curve' },
          ),
          circle(54, 197, 4, '#0f172a', { part: 'start' }),
          text(60, 176, '~315 ppm (1958)', {
            anchor: 'start',
            size: 8.5,
            bold: true,
            part: 'start',
          }),
          circle(376, 37, 4, '#0f172a', { part: 'now' }),
          text(368, 32, '~424 ppm (2024)', { anchor: 'end', size: 8.5, bold: true, part: 'now' }),
          text(220, 248, 'Pre-industrial level was ~280 ppm (below this chart).', {
            size: 9,
            fill: '#475569',
            part: 'pre',
          }),
        ],
        [
          [
            'curve',
            'Rising trend',
            [200, 120],
            'CO₂ has risen every year, and the rise is speeding up, tracking fossil fuel use.',
          ],
          [
            'seasonal',
            'Seasonal zigzag',
            [250, 200],
            'CO₂ dips each Northern summer as forests photosynthesize, and rises each winter as decomposition dominates.',
          ],
          [
            'start',
            '1958: ~315 ppm',
            [140, 172],
            'When Charles David Keeling began precise measurements.',
          ],
          [
            'now',
            'Today: over 420 ppm',
            [390, 50],
            'Higher than at any time in at least 800,000 years, based on air bubbles trapped in Antarctic ice.',
          ],
          [
            'pre',
            'Pre-industrial baseline',
            [26, 248],
            'About 280 ppm in 1750; CO₂ has risen by roughly 50% since.',
          ],
        ],
      ),
    ],
    keyTerms: [
      [
        'Carbon reservoir (sink)',
        'A store of carbon, like the atmosphere, oceans or fossil fuels.',
      ],
      ['Carbon fixation', 'Turning CO₂ into organic molecules, mainly by photosynthesis.'],
      ['Combustion', 'Burning, which releases stored carbon as CO₂.'],
      ['Greenhouse effect', 'Warming caused by gases like CO₂ trapping heat in the atmosphere.'],
      ['Ocean acidification', 'Lowering of seawater pH as it absorbs CO₂.'],
    ],
    goDeeper:
      'CO₂ is a greenhouse gas: it lets sunlight through but absorbs infrared (heat) radiating from Earth’s surface and re-emits some of it back down. Some greenhouse effect keeps Earth habitable, but adding CO₂ (and methane) intensifies it. Earth’s average temperature has risen by about 1.2 °C since pre-industrial times, driving sea-level rise, more extreme weather and shifts in where species can live.\n\nThe ocean absorbs CO₂, which forms carbonic acid and lowers pH. Surface ocean pH has fallen from about 8.2 to 8.1, a roughly 26% increase in H⁺ because the scale is logarithmic. This makes it harder for corals, shellfish and some plankton to build calcium carbonate shells.\n\nIn reality, it’s a bit more complicated: deforestation also adds CO₂, both by burning and by removing trees that would have absorbed it, while forests, soils and oceans currently absorb about half of human emissions each year.',
    quiz: [
      mc(
        'Which process removes CO₂ from the atmosphere?',
        ['Photosynthesis', 'Cellular respiration', 'Combustion', 'Decomposition'],
        0,
        'Photosynthesis fixes CO₂ into organic molecules. The other three release CO₂.',
      ),
      predict(
        'A large area of rainforest is cleared and burned to make farmland.',
        'What happens to atmospheric CO₂?',
        [
          'It increases: burning releases carbon, and fewer trees remain to absorb it',
          'It decreases, because new crops photosynthesize faster',
          'It doesn’t change; the carbon cycle is balanced',
          'It increases only if the farmland is plowed',
        ],
        0,
        'Deforestation adds CO₂ two ways: combustion and decomposition release stored carbon, and photosynthetic uptake is reduced.',
      ),
      label(
        'Match each store to how carbon leaves it.',
        [
          ['Fossil fuels', 'Combustion'],
          ['Living organisms', 'Respiration'],
          ['Dead matter', 'Decomposition'],
          ['Atmosphere', 'Photosynthesis'],
        ],
        'Each process moves carbon from one reservoir to another.',
      ),
    ],
  }),

  hs({
    base: 'nitrogen-cycle',
    unit: 'ecology',
    summary:
      'Nitrogen is essential for proteins and nucleic acids, but most organisms can’t use the N₂ that makes up 78% of air. Bacteria drive the nitrogen cycle: they fix N₂ into ammonia, convert ammonium to nitrate for plants, recycle nitrogen from dead matter, and return it to the air.',
    steps: [
      [
        'Why nitrogen matters',
        'Nitrogen is in every amino acid and every nucleotide. Air is 78% nitrogen gas, but its triple bond (N≡N) is so strong that plants and animals can’t use it directly. Nitrogen is often the nutrient that limits plant growth.',
      ],
      [
        'Nitrogen fixation',
        'Nitrogen-fixing bacteria convert N₂ into ammonia (NH₃), which becomes ammonium (NH₄⁺) in soil. Some live free in soil; Rhizobium lives in root nodules of legumes (peas, beans, clover) in a mutualism. Lightning fixes a little, and the industrial Haber–Bosch process makes fertilizer.',
      ],
      [
        'Nitrification and assimilation',
        'Nitrifying bacteria convert ammonium to nitrite (NO₂⁻, by Nitrosomonas) and then to nitrate (NO₃⁻, by Nitrobacter). Plants absorb nitrate and ammonium through their roots (assimilation) to build proteins and DNA; animals get nitrogen by eating plants or other animals.',
      ],
      [
        'Ammonification and denitrification',
        'Decomposers break down dead organisms and wastes (like urea), releasing ammonium (ammonification). In waterlogged, low-oxygen soils, denitrifying bacteria convert nitrate back to N₂ gas, completing the cycle.',
      ],
    ],
    diagrams: [
      diagram(
        'The nitrogen cycle',
        'Bacteria carry out almost every step. Follow nitrogen from the air, into soil, through living things and back again.',
        [
          rect(110, 6, 180, 30, '#e0f2fe', {
            r: 15,
            stroke: '#0284c7',
            strokeWidth: 2,
            part: 'air',
          }),
          text(200, 26, 'N₂ gas in the atmosphere (78%)', {
            size: 9.5,
            bold: true,
            fill: '#0369a1',
            part: 'air',
          }),
          path('M20 130 L400 130', { stroke: '#a16207', strokeWidth: 2 }),
          rect(0, 130, 400, 130, '#fef3c7', { opacity: 0.5 }),
          path('M60 128 L50 70 M60 128 L70 74 M60 128 L60 64', {
            stroke: '#15803d',
            strokeWidth: 3,
            part: 'fixation',
          }),
          path('M60 132 L54 170 M60 132 L68 168', {
            stroke: '#a16207',
            strokeWidth: 2,
            part: 'fixation',
          }),
          circle(54, 170, 5, '#f472b6', { stroke: '#be185d', part: 'fixation' }),
          circle(68, 168, 5, '#f472b6', { stroke: '#be185d', part: 'fixation' }),
          text(60, 58, 'legume', { size: 8.5, fill: '#15803d', part: 'fixation' }),
          text(60, 188, 'root nodules', { size: 8, fill: '#be185d', part: 'fixation' }),
          arrow([128, 34], [72, 150], { stroke: '#7c3aed', strokeWidth: 2.5, part: 'fixation' }),
          text(108, 120, 'fixation', {
            anchor: 'start',
            size: 9,
            bold: true,
            fill: '#6d28d9',
            part: 'fixation',
          }),
          path('M150 42 L140 66 L152 66 L142 90', {
            stroke: '#eab308',
            strokeWidth: 3,
            part: 'lightning',
          }),
          rect(100, 200, 82, 26, '#ede9fe', { r: 8, stroke: '#7c3aed', part: 'ammonium' }),
          text(141, 217, 'NH₄⁺ ammonium', { size: 8.5, bold: true, part: 'ammonium' }),
          arrow([76, 176], [100, 204], { stroke: '#7c3aed', strokeWidth: 2, part: 'fixation' }),
          rect(196, 232, 70, 24, '#fce7f3', { r: 8, stroke: '#db2777', part: 'nitrification' }),
          text(231, 248, 'NO₂⁻ nitrite', { size: 8.5, bold: true, part: 'nitrification' }),
          rect(282, 196, 80, 26, '#dcfce7', { r: 8, stroke: '#16a34a', part: 'nitrate' }),
          text(322, 213, 'NO₃⁻ nitrate', { size: 8.5, bold: true, part: 'nitrate' }),
          arrow([170, 226], [200, 238], {
            stroke: '#db2777',
            strokeWidth: 2,
            part: 'nitrification',
          }),
          arrow([266, 238], [290, 222], {
            stroke: '#db2777',
            strokeWidth: 2,
            part: 'nitrification',
          }),
          text(232, 222, 'nitrification', {
            size: 8.5,
            bold: true,
            fill: '#be185d',
            part: 'nitrification',
          }),
          path('M280 128 L268 80 M280 128 L290 76 M280 128 L280 66', {
            stroke: '#15803d',
            strokeWidth: 3,
            part: 'assimilation',
          }),
          arrow([316, 194], [286, 136], {
            stroke: '#16a34a',
            strokeWidth: 2.5,
            part: 'assimilation',
          }),
          text(300, 176, 'assimilation', {
            anchor: 'end',
            size: 8.5,
            bold: true,
            fill: '#15803d',
            part: 'assimilation',
          }),
          ellipse(210, 98, 22, 12, '#fde68a', { stroke: '#a16207', part: 'animals' }),
          circle(230, 90, 7, '#fde68a', { stroke: '#a16207', part: 'animals' }),
          arrow([268, 92], [236, 92], { stroke: '#a16207', strokeWidth: 1.8, part: 'animals' }),
          text(210, 74, 'animals eat plants', { size: 8, fill: '#a16207', part: 'animals' }),
          arrow([200, 112], [150, 196], {
            stroke: '#78716c',
            strokeWidth: 2,
            dash: true,
            part: 'ammonification',
          }),
          text(158, 154, 'decomposers', {
            anchor: 'end',
            size: 8.5,
            bold: true,
            fill: '#57534e',
            part: 'ammonification',
          }),
          arrow([352, 194], [276, 36], {
            bend: -30,
            stroke: '#0284c7',
            strokeWidth: 2.5,
            part: 'denitrification',
          }),
          text(392, 100, 'denitrification', {
            anchor: 'end',
            size: 9,
            bold: true,
            fill: '#0369a1',
            part: 'denitrification',
          }),
        ],
        [
          [
            'air',
            'Atmospheric N₂',
            [102, 14],
            'The largest nitrogen store, but unusable by most life because of its strong triple bond.',
          ],
          [
            'fixation',
            'Nitrogen fixation',
            [26, 110],
            'Rhizobium bacteria in legume root nodules (and free-living bacteria) convert N₂ to ammonia using the enzyme nitrogenase. The plant gives the bacteria sugars in return.',
          ],
          [
            'lightning',
            'Lightning',
            [168, 52],
            'Lightning’s energy splits N₂, forming nitrogen oxides that rain into the soil, a small natural source.',
          ],
          [
            'ammonium',
            'Ammonium (NH₄⁺)',
            [96, 238],
            'Produced by fixation and decomposition. Some plants absorb it directly.',
          ],
          [
            'nitrification',
            'Nitrification',
            [230, 192],
            'Two groups of soil bacteria oxidize ammonium to nitrite and then to nitrate, gaining energy as they do.',
          ],
          [
            'nitrate',
            'Nitrate (NO₃⁻)',
            [374, 214],
            'The main form of nitrogen absorbed by plant roots. It dissolves easily, so it can wash out of soil.',
          ],
          [
            'assimilation',
            'Assimilation',
            [300, 60],
            'Plants use absorbed nitrogen to build amino acids, proteins and nucleic acids.',
          ],
          [
            'animals',
            'Consumers',
            [186, 82],
            'Animals get all their nitrogen from food and excrete excess as urea or ammonia.',
          ],
          [
            'ammonification',
            'Ammonification',
            [136, 136],
            'Decomposers break down proteins in dead matter and waste, releasing ammonium back into the soil.',
          ],
          [
            'denitrification',
            'Denitrification',
            [380, 72],
            'In low-oxygen soils, bacteria convert nitrate back to N₂ gas, returning it to the atmosphere.',
          ],
        ],
      ),
      diagram(
        'When nitrogen runs off: eutrophication',
        'Excess fertilizer washing into lakes and coastal waters can create low-oxygen “dead zones.”',
        [
          ...[
            ['runoff', 'Fertilizer runoff', 'nitrates & phosphates wash in', '#dcfce7', '#16a34a'],
            ['bloom', 'Algal bloom', 'algae grow out of control', '#bbf7d0', '#15803d'],
            ['shade', 'Algae die', 'block light; plants below die', '#fef9c3', '#a16207'],
            ['decay', 'Decomposers boom', 'bacteria respire, using up O₂', '#e7e5e4', '#57534e'],
            ['deadzone', 'Dead zone', 'fish suffocate or leave', '#fee2e2', '#b91c1c'],
          ].flatMap(([part, title, desc, fill, stroke], i) => [
            rect(14 + (i % 3) * 128, 20 + Math.floor(i / 3) * 118, 116, 74, fill, {
              r: 12,
              stroke,
              strokeWidth: 2,
              part,
            }),
            text(72 + (i % 3) * 128, 50 + Math.floor(i / 3) * 118, title, {
              size: 10.5,
              bold: true,
              part,
            }),
            text(72 + (i % 3) * 128, 68 + Math.floor(i / 3) * 118, desc, {
              size: 8,
              fill: '#475569',
              part,
            }),
          ]),
          arrow([130, 57], [142, 57], { strokeWidth: 2.5 }),
          arrow([258, 57], [270, 57], { strokeWidth: 2.5 }),
          arrow([328, 96], [100, 136], { bend: -20, strokeWidth: 2.5 }),
          arrow([130, 175], [142, 175], { strokeWidth: 2.5 }),
          rect(270, 138, 116, 74, '#f1f5f9', { r: 12, stroke: '#94a3b8', part: 'example' }),
          text(328, 162, 'Real example', { size: 10, bold: true, part: 'example' }),
          text(328, 180, 'Gulf of Mexico dead zone,', {
            size: 8,
            fill: '#475569',
            part: 'example',
          }),
          text(328, 194, 'fed by Mississippi farmland', {
            size: 8,
            fill: '#475569',
            part: 'example',
          }),
        ],
        [
          [
            'runoff',
            'Fertilizer runoff',
            [20, 14],
            'Nitrogen not taken up by crops dissolves in rainwater and drains into rivers and lakes.',
          ],
          [
            'bloom',
            'Algal bloom',
            [148, 14],
            'Algae, no longer limited by nitrogen, multiply rapidly and turn the water green.',
          ],
          [
            'shade',
            'Algae die off',
            [276, 14],
            'Dense algae shade out underwater plants, and short-lived algae die in huge numbers.',
          ],
          [
            'decay',
            'Oxygen used up',
            [20, 132],
            'Aerobic bacteria decomposing the dead algae use up dissolved oxygen (high biological oxygen demand).',
          ],
          [
            'deadzone',
            'Hypoxic dead zone',
            [148, 132],
            'Too little O₂ remains for fish and other animals. Many die or leave.',
          ],
          [
            'example',
            'Gulf of Mexico',
            [376, 132],
            'Each summer a dead zone of up to ~20,000 km² forms where the Mississippi River delivers farm runoff.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Nitrogen fixation', 'Converting N₂ gas into ammonia.'],
      ['Nitrification', 'Bacteria converting ammonium to nitrite, then nitrate.'],
      ['Denitrification', 'Bacteria converting nitrate back to N₂ gas.'],
      ['Ammonification', 'Decomposers releasing ammonium from dead matter.'],
      ['Assimilation', 'Plants absorbing nitrogen to build organic molecules.'],
      ['Eutrophication', 'Nutrient enrichment of water that causes algal blooms and oxygen loss.'],
    ],
    goDeeper:
      'The Haber–Bosch process, developed in the early 1900s, combines N₂ and H₂ at high temperature and pressure to make ammonia for fertilizer. It now fixes about as much nitrogen as all natural processes combined and is estimated to support food production for around half the world’s population, but it uses about 1–2% of global energy and much of its nitrogen ends up as pollution.\n\nFarmers have long used crop rotation with legumes (like clover or soybeans) to restore soil nitrogen naturally, because Rhizobium in their root nodules adds fixed nitrogen to the soil when the plants decompose.\n\nIn reality, it’s a bit more complicated: nitrogenase, the enzyme that fixes N₂, is destroyed by oxygen. Legume nodules contain leghemoglobin, a plant version of hemoglobin, which keeps oxygen levels low; it is what makes active nodules look pink inside.',
    quiz: [
      mc(
        'Why can’t most organisms use nitrogen directly from the air?',
        [
          'The triple bond in N₂ is very hard to break',
          'Air contains very little nitrogen',
          'Nitrogen gas is toxic',
          'Nitrogen is only found in rocks',
        ],
        0,
        'Only a few prokaryotes have nitrogenase, the enzyme that can break the N≡N triple bond.',
      ),
      predict(
        'A field is waterlogged for weeks, and its soil becomes low in oxygen.',
        'What happens to the soil nitrate?',
        [
          'It falls, because denitrifying bacteria convert it to N₂ gas',
          'It rises, because nitrification speeds up',
          'It stays the same',
          'It turns into ammonia in plant leaves',
        ],
        0,
        'Denitrifying bacteria thrive without oxygen and remove nitrate as N₂, reducing soil fertility.',
      ),
      label(
        'Match each process to the organisms that carry it out.',
        [
          ['Nitrogen fixation', 'Rhizobium in root nodules'],
          ['Nitrification', 'Nitrosomonas and Nitrobacter'],
          ['Ammonification', 'Decomposers'],
          ['Assimilation', 'Plants'],
        ],
        'Bacteria are involved in almost every step of the nitrogen cycle.',
      ),
    ],
  }),

  hs({
    base: 'predator-prey',
    unit: 'ecology',
    summary:
      'Predator and prey populations often rise and fall in linked cycles, with predator peaks lagging behind prey peaks. These cycles are an example of density-dependent regulation: as populations grow, limiting factors like food and predation push them back toward the environment’s carrying capacity.',
    steps: [
      [
        'More prey, more predators',
        'When prey are abundant, predators catch food easily, survive better and raise more young. The predator population starts to grow, but only after a delay, because it takes time to reproduce.',
      ],
      [
        'Predation pressure',
        'As predators multiply, they kill prey faster than prey can reproduce. Predation is a density-dependent factor: its effect grows as populations get denser.',
      ],
      [
        'The crash',
        'Prey numbers fall. With less food, predators starve or fail to breed, and their numbers fall too. Other limiting factors (disease, competition for food, shelter) also tighten when populations are dense.',
      ],
      [
        'The cycle repeats',
        'With few predators left, prey recover and the cycle starts again. The classic data come from Hudson’s Bay Company fur records of Canada lynx and snowshoe hares, which cycle about every 10 years. Hare food supply also plays a role.',
      ],
    ],
    diagrams: [
      diagram(
        'Predator–prey cycles',
        'Simplified population cycles of snowshoe hares (prey) and Canada lynx (predators). Lynx peaks follow hare peaks by a year or two.',
        [
          path('M40 20 L40 210 L388 210', { strokeWidth: 1.5 }),
          text(46, 16, 'population size', { anchor: 'start', size: 9, fill: '#64748b' }),
          text(388, 226, 'time (years) →', { anchor: 'end', size: 9, fill: '#64748b' }),
          path(
            curve(
              Array.from({ length: 175 }, (_, i) => [
                42 + i * 2,
                128 - 82 * Math.sin((i * 2 * 2 * Math.PI) / 130),
              ]),
            ),
            { stroke: '#a16207', strokeWidth: 3, part: 'prey' },
          ),
          path(
            curve(
              Array.from({ length: 175 }, (_, i) => [
                42 + i * 2,
                168 - 34 * Math.sin(((i * 2 - 26) * 2 * Math.PI) / 130),
              ]),
            ),
            { stroke: '#dc2626', strokeWidth: 3, part: 'predator' },
          ),
          path('M74 44 L74 210', { stroke: '#a16207', strokeWidth: 1, dash: true, part: 'lag' }),
          path('M100 132 L100 210', { stroke: '#dc2626', strokeWidth: 1, dash: true, part: 'lag' }),
          arrow([76, 200], [98, 200], { stroke: '#475569', strokeWidth: 1.5, part: 'lag' }),
          text(87, 194, 'lag', { size: 8.5, bold: true, part: 'lag' }),
          text(108, 40, 'snowshoe hares', {
            anchor: 'start',
            size: 9.5,
            bold: true,
            fill: '#a16207',
            part: 'prey',
          }),
          text(50, 168, 'lynx', {
            anchor: 'start',
            size: 9.5,
            bold: true,
            fill: '#dc2626',
            part: 'predator',
          }),
          text(140, 244, 'About one full cycle every ~10 years', {
            size: 9,
            fill: '#475569',
            part: 'period',
          }),
          path('M74 234 L204 234', { stroke: '#475569', strokeWidth: 1.5, part: 'period' }),
        ],
        [
          [
            'prey',
            'Prey population (hares)',
            [56, 34],
            'Rises when predators are few and food is plentiful; crashes when predators are many.',
          ],
          [
            'predator',
            'Predator population (lynx)',
            [90, 162],
            'Always smaller than the prey population, because of energy loss between trophic levels.',
          ],
          [
            'lag',
            'Time lag',
            [112, 186],
            'Predators respond after prey do: it takes time for good hunting to turn into more young lynx, and for starvation to take effect.',
          ],
          [
            'period',
            'Cycle length',
            [222, 234],
            'Hare–lynx cycles in Canada last roughly 8–11 years.',
          ],
        ],
      ),
      diagram(
        'Exponential vs logistic growth',
        'Without limits, populations grow exponentially (J-curve). Real populations level off at the carrying capacity (K) as resources run short (S-curve).',
        [
          path('M40 20 L40 210 L388 210', { strokeWidth: 1.5 }),
          text(46, 16, 'population size (N)', { anchor: 'start', size: 9, fill: '#64748b' }),
          text(388, 226, 'time →', { anchor: 'end', size: 9, fill: '#64748b' }),
          path(
            curve(
              Array.from({ length: 61 }, (_, i): [number, number] => [
                40 + i * 3.6,
                206 - 4 * Math.exp(i * 0.066),
              ]).filter(([, y]) => y >= 22),
            ),
            {
              stroke: '#7c3aed',
              strokeWidth: 3,
              dash: true,
              part: 'exponential',
            },
          ),
          path(
            curve(
              Array.from({ length: 95 }, (_, i) => [
                40 + i * 3.6,
                206 - 140 / (1 + 34 * Math.exp(-i * 0.11)),
              ]),
            ),
            { stroke: '#16a34a', strokeWidth: 3.5, part: 'logistic' },
          ),
          path('M40 66 L388 66', { stroke: '#dc2626', strokeWidth: 1.5, dash: true, part: 'k' }),
          text(386, 60, 'carrying capacity (K)', {
            anchor: 'end',
            size: 9,
            bold: true,
            fill: '#dc2626',
            part: 'k',
          }),
          text(196, 34, 'J-curve: exponential', {
            anchor: 'end',
            size: 9,
            bold: true,
            fill: '#6d28d9',
            part: 'exponential',
          }),
          text(300, 92, 'S-curve: logistic', {
            size: 9,
            bold: true,
            fill: '#15803d',
            part: 'logistic',
          }),
          text(300, 186, 'growth slows as', { size: 8.5, fill: '#475569', part: 'slowing' }),
          text(300, 198, 'resources run short', { size: 8.5, fill: '#475569', part: 'slowing' }),
        ],
        [
          [
            'exponential',
            'Exponential growth',
            [210, 52],
            'With unlimited resources, each generation adds more individuals than the last. Bacteria in fresh culture and invasive species at first.',
          ],
          [
            'logistic',
            'Logistic growth',
            [160, 104],
            'Growth is fastest at about half of K, then slows and levels off.',
          ],
          [
            'k',
            'Carrying capacity (K)',
            [60, 52],
            'The maximum population an environment can support long-term with its food, water, space and shelter.',
          ],
          [
            'slowing',
            'Limiting factors',
            [240, 192],
            'Density-dependent factors (competition, predation, disease) increase as the population grows; density-independent factors (storms, droughts) hit regardless of size.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Carrying capacity (K)', 'The largest population an environment can support long-term.'],
      ['Limiting factor', 'A factor that restricts population growth, like food or predators.'],
      [
        'Density-dependent factor',
        'A limiting factor whose effect increases with population density.',
      ],
      [
        'Density-independent factor',
        'A limiting factor that affects populations regardless of density, like weather.',
      ],
      ['Logistic growth', 'Growth that slows and levels off near carrying capacity.'],
    ],
    goDeeper:
      'Mathematicians Alfred Lotka and Vito Volterra independently modeled predator–prey cycles in the 1920s. Their equations predict endless linked oscillations: prey grow exponentially without predators, and predators decline without prey. Real systems are messier, but the model captures the time lag.\n\nIn the hare–lynx system, experiments in the Yukon showed that hare cycles are driven by both predators and food. Adding food or excluding predators alone only partly reduced the crash; doing both prevented it. Stress from high predation also lowers hare birth rates.\n\nIn reality, it’s a bit more complicated: logistic growth is a simplification. Many populations overshoot K and then crash, or fluctuate around it, and K itself changes with seasons, climate and human activity.',
    quiz: [
      mc(
        'In a predator–prey cycle, why do predator peaks come after prey peaks?',
        [
          'Predators need time to reproduce after food becomes plentiful',
          'Predators only hunt when prey are rare',
          'Prey reproduce more slowly than predators',
          'Predators migrate away when prey are common',
        ],
        0,
        'Abundant prey first improves predator survival and breeding; the population increase shows up later.',
      ),
      predict(
        'A deer population is growing near its carrying capacity. A harsh winter kills 20% of the deer regardless of how crowded they are.',
        'What kind of limiting factor is the winter?',
        [
          'Density-independent',
          'Density-dependent',
          'A predator–prey interaction',
          'Not a limiting factor',
        ],
        0,
        'Weather events affect a population whatever its density. Competition for food, by contrast, worsens as density rises.',
      ),
      label(
        'Match each term to its description.',
        [
          ['Exponential growth', 'J-shaped curve with unlimited resources'],
          ['Logistic growth', 'S-shaped curve that levels off'],
          ['Carrying capacity', 'Maximum population the environment can support'],
          ['Disease spreading in crowded herds', 'Density-dependent factor'],
        ],
        'Limiting factors determine how and where population growth slows.',
      ),
    ],
  }),
];
