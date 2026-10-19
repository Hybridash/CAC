import type { Concept, DiagramShape } from '../../types';
import { mulberry32 } from '../../packs';
import { label, mc, predict } from '../concepts/helpers';
import { arrow, circle, diagram, hs, path, rect, text } from './build';

/** A bell curve as an SVG path between x0 and x1, with its baseline at `base`. */
function bell(
  x0: number,
  x1: number,
  base: number,
  peaks: { mu: number; sd: number; h: number }[],
) {
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 2) {
    const y = peaks.reduce((s, p) => s + p.h * Math.exp(-((x - p.mu) ** 2) / (2 * p.sd ** 2)), 0);
    pts.push(`${x} ${(base - y).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
}

/** Wright–Fisher drift: allele frequency over generations for a population of n diploid individuals. */
function drift(n: number, generations: number, seed: number) {
  const rng = mulberry32(seed);
  const out = [0.5];
  let p = 0.5;
  for (let g = 0; g < generations; g++) {
    let copies = 0;
    for (let i = 0; i < 2 * n; i++) if (rng() < p) copies++;
    p = copies / (2 * n);
    out.push(p);
  }
  return out;
}

function driftPanel(x: number, n: number, seeds: number[], part: string): DiagramShape[] {
  const w = 170;
  const top = 44;
  const h = 150;
  const colors = ['#e11d48', '#2563eb', '#16a34a', '#d97706'];
  return [
    path(`M${x} ${top} L${x} ${top + h} L${x + w} ${top + h}`, { strokeWidth: 1.5, part }),
    path(`M${x} ${top + h / 2} L${x + w} ${top + h / 2}`, {
      stroke: '#cbd5e1',
      strokeWidth: 1,
      dash: true,
    }),
    text(x - 4, top + 4, '1', { anchor: 'end', size: 8, fill: '#64748b' }),
    text(x - 4, top + h / 2 + 3, '0.5', { anchor: 'end', size: 8, fill: '#64748b' }),
    text(x - 4, top + h + 3, '0', { anchor: 'end', size: 8, fill: '#64748b' }),
    ...seeds.map((seed, i) => {
      const freqs = drift(n, 40, seed);
      return path(
        'M' +
          freqs
            .map((f, g) => `${(x + (g / 40) * w).toFixed(1)} ${(top + h - f * h).toFixed(1)}`)
            .join(' L'),
        { stroke: colors[i], strokeWidth: 2, part },
      );
    }),
    text(x + w / 2, top + h + 16, 'generations →', { size: 8.5, fill: '#64748b' }),
  ];
}

export const evolution: Concept[] = [
  hs({
    base: 'natural-selection',
    unit: 'evolution',
    summary:
      'Natural selection happens when heritable variation affects survival and reproduction. Individuals with advantageous traits leave more offspring, so the alleles behind those traits become more common: the population adapts. Evolution is a change in allele frequencies over generations.',
    steps: [
      [
        'Heritable variation',
        'Individuals in a population differ, and some of those differences are genetic. New alleles come from mutation; meiosis and fertilization shuffle them into new combinations. Selection can only act on variation that already exists and can be inherited.',
      ],
      [
        'Selection pressure',
        'Environmental factors (predators, climate, disease, competition) mean some phenotypes survive better than others. Pale peppered moths resting on pale, lichen-covered bark were hidden from birds; dark ones were spotted and eaten.',
      ],
      [
        'Differential reproduction',
        'Populations produce more offspring than can survive. Individuals with advantageous traits reproduce more, passing on their alleles. Biologists call this reproductive success fitness. It has nothing to do with strength; it means leaving more offspring.',
      ],
      [
        'Allele frequencies change',
        'Over many generations, alleles for advantageous traits increase in frequency and others decrease. The population becomes better suited to its environment: an adaptation.',
      ],
      [
        'A changing environment',
        'In 19th-century industrial England, soot killed lichens and blackened tree trunks. The dark (carbonaria) form, once rare, rose to about 98% of moths near Manchester by 1895. After clean-air laws in the 1950s, trees lightened and pale moths became common again.',
      ],
      [
        'Populations evolve, individuals don’t',
        'No moth changed its color during its life. Selection acts on individuals’ phenotypes, but it is the population’s allele frequencies that change. Selection has no goal; it favors whatever works in the current environment.',
      ],
    ],
    diagrams: [
      diagram(
        'Three patterns of selection',
        'Each graph shows how a trait is spread across a population before (dashed) and after (solid) selection. Red arrows show which individuals are selected against.',
        [
          ...[0, 1, 2].flatMap((i) => {
            const x0 = 14 + i * 128;
            const mid = x0 + 56;
            const part = ['directional', 'stabilizing', 'disruptive'][i];
            const after =
              i === 0
                ? [{ mu: mid + 26, sd: 14, h: 100 }]
                : i === 1
                  ? [{ mu: mid, sd: 9, h: 130 }]
                  : [
                      { mu: mid - 30, sd: 10, h: 78 },
                      { mu: mid + 30, sd: 10, h: 78 },
                    ];
            return [
              path(`M${x0} 40 L${x0} 190 L${x0 + 116} 190`, { strokeWidth: 1.5 }),
              path(bell(x0 + 2, x0 + 114, 190, [{ mu: mid, sd: 18, h: 92 }]), {
                stroke: '#94a3b8',
                strokeWidth: 2,
                dash: true,
                part,
              }),
              path(bell(x0 + 2, x0 + 114, 190, after), { stroke: '#7c3aed', strokeWidth: 3, part }),
              text(x0 + 58, 212, ['Directional', 'Stabilizing', 'Disruptive'][i], {
                size: 11,
                bold: true,
                part,
              }),
              text(
                x0 + 58,
                226,
                ['one extreme favored', 'average favored', 'both extremes favored'][i],
                {
                  size: 8.5,
                  fill: '#475569',
                  part,
                },
              ),
              text(
                x0 + 58,
                240,
                ['e.g. dark moths', 'e.g. human birth weight', 'e.g. finch beak size'][i],
                {
                  size: 8.5,
                  fill: '#7c3aed',
                  part,
                },
              ),
            ];
          }),
          arrow([46, 132], [46, 168], { stroke: '#dc2626', strokeWidth: 2.5, part: 'directional' }),
          arrow([166, 150], [166, 180], {
            stroke: '#dc2626',
            strokeWidth: 2.5,
            part: 'stabilizing',
          }),
          arrow([230, 150], [230, 180], {
            stroke: '#dc2626',
            strokeWidth: 2.5,
            part: 'stabilizing',
          }),
          arrow([326, 90], [326, 130], { stroke: '#dc2626', strokeWidth: 2.5, part: 'disruptive' }),
          text(200, 22, 'number of individuals ↑   ·   trait value →', {
            size: 9,
            fill: '#64748b',
          }),
        ],
        [
          [
            'directional',
            'Directional selection',
            [120, 46],
            'One extreme is favored, so the average shifts. Examples: darker moths in sooty forests; antibiotic resistance.',
          ],
          [
            'stabilizing',
            'Stabilizing selection',
            [248, 46],
            'Intermediate values are favored and extremes are removed, so variation narrows. Very small and very large babies historically had lower survival.',
          ],
          [
            'disruptive',
            'Disruptive selection',
            [376, 46],
            'Both extremes do better than the average, which can split a population, a possible first step to speciation. Seed-cracker finches with small or large beaks outcompete medium ones.',
          ],
        ],
      ),
      diagram(
        'Peppered moths in industrial England',
        'Approximate frequency of the dark (carbonaria) form near Manchester. The pattern tracked air pollution, a classic case of directional selection that reversed.',
        [
          path('M56 30 L56 210 L384 210', { strokeWidth: 1.5 }),
          text(50, 34, '100%', { anchor: 'end', size: 8.5, fill: '#64748b' }),
          text(50, 124, '50%', { anchor: 'end', size: 8.5, fill: '#64748b' }),
          text(50, 213, '0%', { anchor: 'end', size: 8.5, fill: '#64748b' }),
          ...[1850, 1900, 1950, 2000].map((y) =>
            text(56 + ((y - 1850) / 160) * 328, 226, String(y), { size: 9, fill: '#64748b' }),
          ),
          rect(56, 30, 102, 180, '#fef3c7', { opacity: 0.6, part: 'industry' }),
          text(107, 190, 'industrial', { size: 9, bold: true, fill: '#92400e', part: 'industry' }),
          text(107, 202, 'revolution', { size: 9, bold: true, fill: '#92400e', part: 'industry' }),
          path(
            'M60 208 C90 205 110 120 150 50 C170 34 220 36 252 42 C276 46 290 70 310 130 C330 180 350 195 376 200',
            { stroke: '#1e293b', strokeWidth: 3.5, part: 'rise' },
          ),
          path('M269 30 L269 210', {
            stroke: '#16a34a',
            strokeWidth: 2,
            dash: true,
            part: 'cleanair',
          }),
          text(274, 70, 'Clean Air', {
            anchor: 'start',
            size: 9,
            bold: true,
            fill: '#15803d',
            part: 'cleanair',
          }),
          text(274, 82, 'Act 1956', {
            anchor: 'start',
            size: 9,
            bold: true,
            fill: '#15803d',
            part: 'cleanair',
          }),
          circle(150, 50, 5, '#1e293b', { part: 'rise' }),
          text(150, 42, '~98% (1895)', { size: 8.5, bold: true, part: 'rise' }),
          circle(360, 196, 5, '#1e293b', { part: 'decline' }),
          text(340, 184, '<10% (2000s)', { size: 8.5, bold: true, part: 'decline' }),
          text(220, 248, 'frequency of dark moths (approximate)', { size: 9, fill: '#64748b' }),
        ],
        [
          [
            'industry',
            'Soot darkens the trees',
            [90, 80],
            'Coal smoke killed pale lichens and blackened bark. Pale moths now stood out to birds.',
          ],
          [
            'rise',
            'Dark moths increase',
            [120, 120],
            'The dark allele, first recorded in 1848, rose to ~98% within about 50 generations (one per year).',
          ],
          [
            'cleanair',
            'Clean air laws',
            [286, 100],
            'Pollution controls let lichens regrow and trunks lighten, reversing the selection pressure.',
          ],
          [
            'decline',
            'Pale moths return',
            [380, 168],
            'The dark form became rare again. Kettlewell’s and later Majerus’s field experiments confirmed birds as the selective agent.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Natural selection', 'Differential survival and reproduction due to heritable traits.'],
      ['Fitness', 'An organism’s relative reproductive success.'],
      ['Adaptation', 'A heritable trait that improves survival or reproduction in an environment.'],
      ['Allele frequency', 'How common an allele is in a population’s gene pool.'],
      [
        'Selection pressure',
        'An environmental factor that affects which individuals survive and reproduce.',
      ],
    ],
    goDeeper:
      'Darwin and Wallace proposed natural selection independently, publishing together in 1858; Darwin’s On the Origin of Species followed in 1859. They knew nothing of genes. The “modern synthesis” of the 1930s–40s combined selection with Mendelian genetics and population genetics into today’s theory of evolution.\n\nThe Hardy–Weinberg principle describes a population that is NOT evolving: allele frequencies stay constant if there is no selection, no mutation, no migration (gene flow), a very large population (no drift) and random mating. Real populations break these conditions, and measuring how far they deviate shows which forces are acting. With allele frequencies p and q, genotype frequencies are p² + 2pq + q² = 1.\n\nIn reality, it’s a bit more complicated: selection acts on phenotypes, and many traits are influenced by many genes and the environment, so the link between a trait and allele frequency change can be indirect.',
    quiz: [
      mc(
        'Which statement about natural selection is correct?',
        [
          'Populations, not individuals, evolve over generations',
          'Individuals change their traits to survive',
          'Selection creates new alleles when they are needed',
          'The strongest individuals always have the highest fitness',
        ],
        0,
        'Selection changes allele frequencies in populations; individuals can’t evolve, and selection only acts on existing variation (mutation is random).',
      ),
      predict(
        'A bird population lives on an island where a drought leaves only large, hard seeds to eat for several years.',
        'What happens to the average beak size over the following generations?',
        [
          'It increases, because large-beaked birds survive and breed more',
          'It decreases',
          'It stays the same, because beaks can’t change',
          'Each bird grows a bigger beak during its life',
        ],
        0,
        'This is directional selection, observed by Peter and Rosemary Grant in Galápagos finches after a 1977 drought.',
      ),
      label(
        'Match each pattern of selection to an example.',
        [
          ['Directional', 'Bacteria become more antibiotic-resistant'],
          ['Stabilizing', 'Medium birth weight has the best survival'],
          ['Disruptive', 'Small and large beaks both beat medium beaks'],
        ],
        'The pattern depends on which phenotypes have the highest fitness.',
      ),
    ],
  }),

  hs({
    base: 'speciation',
    unit: 'evolution',
    summary:
      'Speciation is the formation of new species. Under the biological species concept, a species is a group that can interbreed to produce fertile offspring. When populations are separated, gene flow stops, they diverge through selection, mutation and drift, and reproductive isolation eventually makes them separate species.',
    steps: [
      [
        'What is a species?',
        'The biological species concept: a group of populations whose members can interbreed in nature and produce fertile offspring. Horses and donkeys can mate, but their offspring (mules) are sterile, so they are separate species.',
      ],
      [
        'Isolation stops gene flow',
        'In allopatric speciation, a geographic barrier (a river, mountain range or new island) splits a population. Alleles can no longer flow between the two groups. Sympatric speciation, without a physical barrier, can happen through behavior, habitat use or polyploidy in plants.',
      ],
      [
        'Divergence',
        'Each population faces different selection pressures and gets different mutations, and genetic drift acts on each separately. Over many generations, their allele frequencies, and then their traits, diverge.',
      ],
      [
        'Reproductive isolation',
        'Eventually the groups can’t interbreed even if they meet. Prezygotic barriers prevent mating or fertilization (different courtship, breeding seasons, habitats or incompatible gametes). Postzygotic barriers act after fertilization (hybrids die or are sterile).',
      ],
    ],
    diagrams: [
      diagram(
        'Allopatric speciation',
        'One population is split by a geographic barrier, diverges, and becomes two species that can no longer interbreed.',
        [
          ...[0, 1, 2, 3].flatMap((i) => [
            rect(8 + i * 98, 36, 90, 150, '#f0fdf4', {
              r: 10,
              stroke: '#bbf7d0',
              part: ['one', 'barrier', 'diverge', 'isolated'][i],
            }),
            text(
              53 + i * 98,
              26,
              ['1. One species', '2. Barrier', '3. Divergence', '4. Two species'][i],
              {
                size: 9.5,
                bold: true,
                part: ['one', 'barrier', 'diverge', 'isolated'][i],
              },
            ),
          ]),
          ...[
            [26, 60],
            [50, 80],
            [76, 66],
            [34, 110],
            [62, 132],
            [80, 150],
            [30, 162],
            [56, 100],
          ].map(([x, y]) => circle(x, y, 6, '#a78bfa', { stroke: '#6d28d9', part: 'one' })),
          path('M152 36 Q140 80 158 112 Q172 150 150 186', {
            stroke: '#38bdf8',
            strokeWidth: 9,
            part: 'barrier',
          }),
          ...[
            [124, 66],
            [130, 120],
            [120, 160],
            [180, 60],
            [176, 104],
            [184, 154],
          ].map(([x, y]) => circle(x, y, 6, '#a78bfa', { stroke: '#6d28d9', part: 'barrier' })),
          path('M250 36 Q238 80 256 112 Q270 150 248 186', {
            stroke: '#38bdf8',
            strokeWidth: 9,
            part: 'diverge',
          }),
          ...[
            [222, 66],
            [228, 120],
            [218, 160],
          ].map(([x, y]) => circle(x, y, 6, '#f472b6', { stroke: '#be185d', part: 'diverge' })),
          ...[
            [278, 60],
            [274, 104],
            [282, 154],
          ].map(([x, y]) =>
            rect(x - 6, y - 6, 12, 12, '#34d399', { r: 2, stroke: '#047857', part: 'diverge' }),
          ),
          ...[
            [324, 70],
            [340, 130],
            [328, 164],
          ].map(([x, y]) => circle(x, y, 6, '#f472b6', { stroke: '#be185d', part: 'isolated' })),
          ...[
            [368, 76],
            [372, 118],
            [360, 160],
          ].map(([x, y]) =>
            rect(x - 6, y - 6, 12, 12, '#34d399', { r: 2, stroke: '#047857', part: 'isolated' }),
          ),
          text(350, 104, '✕', { size: 16, bold: true, fill: '#dc2626', part: 'isolated' }),
          path('M10 210 L390 210', { stroke: '#94a3b8', strokeWidth: 1 }),
          arrow([20, 222], [384, 222], { stroke: '#64748b', strokeWidth: 1.5 }),
          text(200, 244, 'thousands to millions of years', { size: 9, fill: '#64748b' }),
        ],
        [
          [
            'one',
            'One interbreeding population',
            [92, 46],
            'Gene flow keeps the whole population genetically similar.',
          ],
          [
            'barrier',
            'Geographic barrier',
            [190, 46],
            'A river, canyon or sea level change splits the population, stopping gene flow.',
          ],
          [
            'diverge',
            'Independent evolution',
            [288, 46],
            'Different environments select for different traits; mutations and drift differ too. The groups slowly diverge.',
          ],
          [
            'isolated',
            'Reproductive isolation',
            [386, 46],
            'When they meet again, they no longer interbreed successfully: they are now separate species. Kaibab and Abert’s squirrels on either side of the Grand Canyon are an example in progress.',
          ],
        ],
      ),
      diagram(
        'Reproductive barriers',
        'Mechanisms that keep species apart, sorted by whether they act before or after a zygote forms.',
        [
          rect(8, 10, 384, 26, '#ede9fe', { r: 8, part: 'pre' }),
          text(200, 28, 'Prezygotic: prevent mating or fertilization', {
            size: 10,
            bold: true,
            fill: '#5b21b6',
            part: 'pre',
          }),
          ...[
            ['habitat', 'Habitat', 'live in different places'],
            ['temporal', 'Temporal', 'breed at different times'],
            ['behavioral', 'Behavioral', 'different courtship signals'],
            ['mechanical', 'Mechanical', 'reproductive parts don’t fit'],
            ['gametic', 'Gametic', 'sperm can’t fertilize egg'],
          ].flatMap(([part, name, desc], i) => [
            rect(8 + (i % 3) * 128, 44 + Math.floor(i / 3) * 52, 124, 46, '#f5f3ff', {
              r: 8,
              stroke: '#ddd6fe',
              part,
            }),
            text(70 + (i % 3) * 128, 62 + Math.floor(i / 3) * 52, name, {
              size: 10,
              bold: true,
              part,
            }),
            text(70 + (i % 3) * 128, 78 + Math.floor(i / 3) * 52, desc, {
              size: 8.5,
              fill: '#475569',
              part,
            }),
          ]),
          rect(8, 158, 384, 26, '#fee2e2', { r: 8, part: 'post' }),
          text(200, 176, 'Postzygotic: hybrids form but fail', {
            size: 10,
            bold: true,
            fill: '#991b1b',
            part: 'post',
          }),
          ...[
            ['inviable', 'Hybrid inviability', 'hybrid embryo dies'],
            ['sterile', 'Hybrid sterility', 'e.g. mules can’t breed'],
            ['breakdown', 'Hybrid breakdown', '2nd generation fails'],
          ].flatMap(([part, name, desc], i) => [
            rect(8 + i * 128, 192, 124, 52, '#fef2f2', { r: 8, stroke: '#fecaca', part }),
            text(70 + i * 128, 212, name, { size: 10, bold: true, part }),
            text(70 + i * 128, 228, desc, { size: 8.5, fill: '#475569', part }),
          ]),
        ],
        [
          [
            'pre',
            'Prezygotic barriers',
            [388, 23],
            'Stop mating or fertilization from happening at all, so no hybrid zygote ever forms. Most species are kept apart this way.',
          ],
          [
            'post',
            'Postzygotic barriers',
            [388, 171],
            'Act after fertilization: the hybrid is formed but dies, is sterile, or has weak offspring.',
          ],
          [
            'habitat',
            'Habitat isolation',
            [20, 50],
            'Two snake species in the same area, one in water and one on land, rarely meet.',
          ],
          [
            'temporal',
            'Temporal isolation',
            [148, 50],
            'Related skunk species breed in late winter vs late summer.',
          ],
          [
            'behavioral',
            'Behavioral isolation',
            [276, 50],
            'Fireflies use species-specific flash patterns; birds use specific songs and dances.',
          ],
          [
            'mechanical',
            'Mechanical isolation',
            [20, 102],
            'Shapes of flowers or genitalia only fit their own species (or pollinator).',
          ],
          [
            'gametic',
            'Gametic isolation',
            [148, 102],
            'In corals and sea urchins, which release gametes into the water, sperm and egg surface proteins must match.',
          ],
          [
            'sterile',
            'Hybrid sterility',
            [148, 198],
            'A horse (64 chromosomes) × donkey (62) gives a mule (63), which can’t make normal gametes because its chromosomes can’t pair in meiosis.',
          ],
          [
            'inviable',
            'Hybrid inviability',
            [20, 198],
            'Some hybrids, like many crosses between frog species, fail to develop.',
          ],
          [
            'breakdown',
            'Hybrid breakdown',
            [276, 198],
            'First-generation hybrids are fertile, but their offspring are weak or sterile.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Species', 'A group that can interbreed and produce fertile offspring.'],
      ['Gene flow', 'Movement of alleles between populations through migration and mating.'],
      ['Allopatric speciation', 'Speciation after geographic separation.'],
      ['Sympatric speciation', 'Speciation without a geographic barrier.'],
      [
        'Reproductive isolation',
        'Barriers that prevent two groups from producing fertile offspring.',
      ],
    ],
    goDeeper:
      'Sympatric speciation is common in plants through polyploidy. An error in meiosis can double the chromosome number; a tetraploid plant can’t produce fertile offspring with its diploid parents, making it a new species in one generation. Many crops, including wheat, cotton and strawberries, are polyploids.\n\nAdaptive radiation is rapid speciation from one ancestor into many species filling different niches, like Darwin’s finches on the Galápagos or the hundreds of cichlid fish species in Africa’s Lake Victoria. The pace of speciation varies: “punctuated equilibrium” describes long periods of little change interrupted by rapid bursts, while “gradualism” describes steady change.\n\nIn reality, it’s a bit more complicated: the biological species concept doesn’t work for organisms that reproduce asexually (like bacteria) or for fossils. Biologists then use other definitions, based on shape (morphological) or DNA (phylogenetic).',
    quiz: [
      mc(
        'Horses and donkeys can mate, but their offspring (mules) are sterile. Why are they considered separate species?',
        [
          'They can’t produce fertile offspring together',
          'They look different',
          'They live in different countries',
          'They can’t mate at all',
        ],
        0,
        'Under the biological species concept, the test is fertile offspring. Hybrid sterility is a postzygotic barrier.',
      ),
      predict(
        'A population of beetles is split by a new river. One side becomes much colder than the other.',
        'Over many generations, what is most likely?',
        [
          'The two groups diverge and may become separate species',
          'They stay identical because they started the same',
          'Both sides immediately become new species',
          'Gene flow increases between them',
        ],
        0,
        'With gene flow cut off and different selection pressures, the populations diverge; given enough time, reproductive isolation can evolve.',
      ),
      label(
        'Match each barrier to its example.',
        [
          ['Temporal', 'Two frog species breed in different months'],
          ['Behavioral', 'Different bird songs attract only their own species'],
          ['Hybrid sterility', 'Mules can’t reproduce'],
          ['Geographic', 'A mountain range separates two populations'],
        ],
        'Some barriers stop mating; others act after hybrids form.',
      ),
    ],
  }),

  hs({
    base: 'phylogenetic-trees',
    unit: 'evolution',
    summary:
      'A phylogenetic tree is a hypothesis about evolutionary relationships. Branch points (nodes) are common ancestors, and groups are defined by shared derived traits. DNA and protein comparisons now provide most of the evidence, and closely related species have more similar sequences.',
    steps: [
      [
        'Common ancestry',
        'All living things share a common ancestor. A phylogenetic tree shows how species are related through ancestors, based on evidence from anatomy, fossils and, most powerfully, DNA and protein sequences.',
      ],
      [
        'Reading the branches',
        'Each node is a common ancestor of everything beyond it. The root is the oldest ancestor shown. Two groups that share an immediate common ancestor are sister taxa. A clade is an ancestor plus all its descendants. Rotating branches around a node doesn’t change the relationships.',
      ],
      [
        'Shared derived traits',
        'A trait that first appears in an ancestor is shared by all its descendants. Mapping these shared derived characters (like jaws, four limbs, the amniotic egg and hair) onto a tree is how a cladogram is built: each trait marks a clade.',
      ],
    ],
    diagrams: [
      diagram(
        'A vertebrate cladogram',
        'Each tick on the main branch marks a new trait that evolved in a common ancestor and is shared by every group to the right of it.',
        [
          path('M30 230 L330 30', { stroke: '#334155', strokeWidth: 3, part: 'root' }),
          ...[
            [75, 200, 75, 40, 'Lamprey'],
            [135, 160, 135, 40, 'Shark'],
            [195, 120, 195, 40, 'Frog'],
            [255, 80, 255, 40, 'Lizard'],
          ].flatMap(([x1, y1, x2, y2, name]) => [
            path(`M${x1} ${y1} L${x2} ${y2}`, { stroke: '#334155', strokeWidth: 3 }),
            text(x2 as number, 28, name as string, { size: 10, bold: true }),
          ]),
          text(330, 22, 'Mouse', { size: 10, bold: true, part: 'clade' }),
          text(75, 14, 'outgroup', { size: 8, fill: '#64748b', part: 'outgroup' }),
          ...[
            [60, 210, 'vertebrae'],
            [105, 180, 'jaws'],
            [165, 140, 'four limbs'],
            [225, 100, 'amniotic egg'],
            [295, 54, 'hair, milk'],
          ].flatMap(([x, y, t]) => [
            path(
              `M${(x as number) - 7} ${(y as number) - 9} L${(x as number) + 7} ${(y as number) + 9}`,
              {
                stroke: '#dc2626',
                strokeWidth: 3,
                part: 'traits',
              },
            ),
            text((x as number) + 10, (y as number) + 14, t as string, {
              anchor: 'start',
              size: 9,
              bold: true,
              fill: '#b91c1c',
              part: 'traits',
            }),
          ]),
          circle(195, 120, 6, '#facc15', { stroke: '#a16207', strokeWidth: 2, part: 'node' }),
          path('M214 106 L240 34 L268 34 L345 12 L392 12 L392 50 L240 114 Z', {
            fill: '#a78bfa',
            opacity: 0.15,
            part: 'clade',
          }),
          path('M255 80 L255 40 M255 80 L330 30', {
            stroke: '#7c3aed',
            strokeWidth: 3,
            part: 'sister',
          }),
          circle(30, 230, 5, '#334155', { part: 'root' }),
        ],
        [
          [
            'root',
            'Root',
            [44, 240],
            'The common ancestor of everything on the tree; time runs from the root toward the tips.',
          ],
          [
            'outgroup',
            'Outgroup',
            [36, 14],
            'The most distantly related group (lamprey, which has no jaws), used to tell which traits are ancestral and which are new.',
          ],
          [
            'node',
            'Node (common ancestor)',
            [210, 132],
            'The common ancestor of frogs, lizards and mice: the first tetrapod with four limbs.',
          ],
          [
            'traits',
            'Shared derived traits',
            [150, 234],
            'Each red tick is a new trait, inherited by all descendants. Sharks have jaws but not limbs; frogs have limbs but no amniotic egg.',
          ],
          [
            'clade',
            'A clade: amniotes',
            [370, 74],
            'An ancestor and ALL its descendants. Lizards + mice (amniotes) form a clade; their ancestor evolved the amniotic egg.',
          ],
          [
            'sister',
            'Sister taxa',
            [280, 94],
            'Lizards and mice share a more recent common ancestor with each other than with frogs.',
          ],
        ],
      ),
      diagram(
        'Molecular evidence: DNA differences',
        'Approximate percentage difference in DNA sequence between humans and other primates. Fewer differences = a more recent common ancestor.',
        [
          path('M120 30 L120 210 L384 210', { strokeWidth: 1.5 }),
          ...[
            ['chimp', 'Chimpanzee', 1.2, '#7c3aed'],
            ['gorilla', 'Gorilla', 1.6, '#8b5cf6'],
            ['orangutan', 'Orangutan', 3.1, '#a78bfa'],
            ['macaque', 'Rhesus macaque', 7, '#c4b5fd'],
          ].flatMap(([part, name, pct, fill], i) => [
            text(112, 58 + i * 42, name as string, {
              anchor: 'end',
              size: 10,
              bold: true,
              part: part as string,
            }),
            rect(120, 44 + i * 42, ((pct as number) / 8) * 250, 22, fill as string, {
              r: 4,
              part: part as string,
            }),
            text(126 + ((pct as number) / 8) * 250, 59 + i * 42, `${pct}%`, {
              anchor: 'start',
              size: 10,
              bold: true,
              part: part as string,
            }),
          ]),
          ...[0, 2, 4, 6, 8].map((v) =>
            text(120 + (v / 8) * 250, 224, `${v}%`, { size: 8.5, fill: '#64748b' }),
          ),
          text(250, 244, 'DNA sequence difference from humans', { size: 9, fill: '#64748b' }),
        ],
        [
          [
            'chimp',
            'Chimpanzees',
            [380, 55],
            'Our closest living relatives: we share a common ancestor about 6–7 million years ago.',
          ],
          [
            'gorilla',
            'Gorillas',
            [380, 97],
            'Branched off slightly earlier, roughly 8–10 million years ago.',
          ],
          [
            'orangutan',
            'Orangutans',
            [380, 139],
            'The great ape lineage that split off earliest, about 12–16 million years ago.',
          ],
          [
            'macaque',
            'Macaques',
            [380, 181],
            'Old World monkeys, sharing an ancestor with apes about 25–30 million years ago.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Phylogenetic tree', 'A diagram of hypothesized evolutionary relationships.'],
      ['Node', 'A branch point representing a common ancestor.'],
      ['Clade', 'An ancestor and all of its descendants.'],
      ['Sister taxa', 'Two groups that share an immediate common ancestor.'],
      [
        'Shared derived character',
        'A trait that evolved in a group’s common ancestor and is shared by its descendants.',
      ],
      [
        'Homologous structure',
        'Similar structure inherited from a common ancestor, like the bones in a human arm and a bat wing.',
      ],
    ],
    goDeeper:
      'Similar traits aren’t always evidence of close relationship. Homologous structures (the same bones in a human arm, whale flipper and bat wing) come from a common ancestor. Analogous structures (bird wings and insect wings) evolved separately for similar jobs, an example of convergent evolution, and can mislead classification.\n\nThe molecular clock uses the steady accumulation of neutral mutations to estimate when lineages split, calibrated with dated fossils. Comparing many genes across many species has reshaped the tree of life: for example, birds are living dinosaurs, and fungi are more closely related to animals than to plants.\n\nIn reality, it’s a bit more complicated: “1.2% different” depends on how you count. Counting insertions and deletions as well as single-letter changes, humans and chimps differ by about 4% of their DNA.',
    quiz: [
      mc(
        'On a phylogenetic tree, what does a node represent?',
        [
          'A common ancestor',
          'A living species',
          'An extinct species with no descendants',
          'A mutation',
        ],
        0,
        'Each branch point is the most recent common ancestor of the groups that branch from it.',
      ),
      predict(
        'Species X and Y differ by 2% of their DNA; species X and Z differ by 15%.',
        'Which conclusion is best supported?',
        [
          'X shares a more recent common ancestor with Y than with Z',
          'Z is the ancestor of X',
          'Y evolved from X',
          'X and Z are the same species',
        ],
        0,
        'Fewer sequence differences mean less time for mutations to accumulate since the lineages split.',
      ),
      label(
        'Match each tree term to its meaning.',
        [
          ['Root', 'Common ancestor of all groups on the tree'],
          ['Clade', 'An ancestor and all its descendants'],
          ['Outgroup', 'Most distantly related group, used for comparison'],
          ['Sister taxa', 'Share an immediate common ancestor'],
        ],
        'Trees show relationships through ancestry, not a ladder of “higher” and “lower” organisms.',
      ),
    ],
  }),

  hs({
    base: 'genetic-drift',
    unit: 'evolution',
    summary:
      'Genetic drift is random change in allele frequencies from one generation to the next, caused by chance in who survives and reproduces. Its effects are strongest in small populations, where alleles can be lost or fixed quickly, and in bottlenecks and founder events.',
    steps: [
      [
        'Chance, not fitness',
        'In every generation, only some individuals reproduce, and only some gametes become offspring. Like flipping a coin a few times, the result can stray from 50:50 purely by luck. Drift changes allele frequencies without regard to whether alleles are helpful.',
      ],
      [
        'Small populations, big swings',
        'In a small population, random sampling error is large, so frequencies jump around and an allele can be lost (0%) or fixed (100%) within a few generations. Large populations are buffered. Drift reduces genetic variation over time.',
      ],
      [
        'Bottleneck effect',
        'A disaster or hunting sharply reduces a population. The survivors’ alleles are a random, often unrepresentative sample. Northern elephant seals were hunted down to perhaps 20–30 animals in the 1890s; today’s 200,000+ seals have extremely low genetic diversity.',
      ],
      [
        'Founder effect',
        'When a few individuals start a new population, it carries only their alleles. Rare alleles can become common: Ellis–van Creveld syndrome (extra fingers, short stature) is far more common among the Old Order Amish of Pennsylvania, descended from a few founders.',
      ],
    ],
    diagrams: [
      diagram(
        'Drift in small vs large populations',
        'Simulated allele frequency over 40 generations, starting at 0.5 in four separate populations each. No selection acts: every change is random.',
        [
          text(110, 28, 'Small populations (N = 10)', { size: 10, bold: true, part: 'small' }),
          ...driftPanel(26, 10, [3, 11, 21, 34], 'small'),
          text(310, 28, 'Large populations (N = 500)', { size: 10, bold: true, part: 'large' }),
          ...driftPanel(222, 500, [5, 8, 13, 21], 'large'),
        ],
        [
          [
            'small',
            'Small populations',
            [188, 24],
            'Frequencies swing wildly; some alleles are lost (hit 0) or fixed (hit 1), after which drift can no longer change them.',
          ],
          [
            'large',
            'Large populations',
            [390, 24],
            'Frequencies wander only slightly from 0.5. Larger samples mean less random error.',
          ],
          [
            'fixation',
            'Loss and fixation',
            [200, 112],
            'Once an allele reaches 0% or 100%, variation at that gene is gone unless a new mutation or migration brings it back.',
          ],
        ],
      ),
      diagram(
        'Bottlenecks and founders',
        'Two ways a small, random sample of a population can end up with very different allele frequencies from the original.',
        [
          path(
            'M30 60 L30 150 Q30 170 50 172 L74 172 L74 196 L98 196 L98 172 L122 172 Q142 170 142 150 L142 60 Z',
            {
              fill: '#f8fafc',
              stroke: '#475569',
              strokeWidth: 2,
              part: 'bottleneck',
            },
          ),
          ...[
            [44, 76, '#e11d48'],
            [64, 82, '#2563eb'],
            [86, 74, '#16a34a'],
            [108, 80, '#e11d48'],
            [126, 74, '#2563eb'],
            [50, 100, '#16a34a'],
            [72, 106, '#e11d48'],
            [94, 98, '#2563eb'],
            [116, 104, '#16a34a'],
            [44, 126, '#2563eb'],
            [66, 132, '#16a34a'],
            [90, 124, '#e11d48'],
            [112, 130, '#2563eb'],
            [130, 122, '#16a34a'],
            [60, 154, '#e11d48'],
            [100, 152, '#2563eb'],
          ].map(([x, y, c]) =>
            circle(x as number, y as number, 7, c as string, { part: 'original' }),
          ),
          circle(80, 186, 6, '#e11d48', { part: 'bottleneck' }),
          circle(92, 186, 6, '#e11d48', { part: 'bottleneck' }),
          ...[
            [60, 224],
            [76, 230],
            [92, 222],
            [108, 230],
            [124, 224],
          ].map(([x, y], i) =>
            circle(x, y, 7, i === 3 ? '#2563eb' : '#e11d48', { part: 'survivors' }),
          ),
          text(86, 36, 'Bottleneck', { size: 11, bold: true, part: 'bottleneck' }),
          text(86, 50, 'disaster shrinks population', {
            size: 8.5,
            fill: '#475569',
            part: 'bottleneck',
          }),
          rect(196, 60, 120, 100, '#ecfccb', {
            r: 30,
            stroke: '#65a30d',
            strokeWidth: 2,
            part: 'founder',
          }),
          ...[
            [212, 80, '#e11d48'],
            [236, 92, '#2563eb'],
            [260, 78, '#16a34a'],
            [284, 90, '#e11d48'],
            [300, 80, '#2563eb'],
            [216, 118, '#16a34a'],
            [242, 126, '#e11d48'],
            [266, 114, '#2563eb'],
            [290, 128, '#16a34a'],
          ].map(([x, y, c]) =>
            circle(x as number, y as number, 7, c as string, { part: 'founder' }),
          ),
          path('M300 168 Q340 196 352 214', {
            stroke: '#0284c7',
            strokeWidth: 2,
            dash: true,
            part: 'founder',
          }),
          rect(330, 202, 66, 46, '#fef9c3', {
            r: 20,
            stroke: '#ca8a04',
            strokeWidth: 2,
            part: 'island',
          }),
          circle(350, 224, 7, '#16a34a', { part: 'island' }),
          circle(366, 230, 7, '#16a34a', { part: 'island' }),
          circle(378, 218, 7, '#2563eb', { part: 'island' }),
          text(256, 36, 'Founder effect', { size: 11, bold: true, part: 'founder' }),
          text(256, 50, 'a few individuals colonize', {
            size: 8.5,
            fill: '#475569',
            part: 'founder',
          }),
          text(290, 240, 'new island', { size: 9, fill: '#a16207', part: 'island' }),
        ],
        [
          [
            'original',
            'Original population',
            [16, 70],
            'Three alleles (red, blue, green) at roughly equal frequencies.',
          ],
          [
            'bottleneck',
            'Bottleneck',
            [126, 186],
            'Most individuals die at random, not because of their alleles.',
          ],
          [
            'survivors',
            'Survivors’ population',
            [150, 228],
            'Regrows from mostly red alleles; green has been lost entirely. Diversity stays low for many generations.',
          ],
          [
            'founder',
            'Source population',
            [322, 70],
            'The mainland population keeps its full variety.',
          ],
          [
            'island',
            'Founders',
            [314, 200],
            'The few colonists carry only some alleles, at unusual frequencies (no red here). The new population inherits this skewed sample.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Genetic drift', 'Random change in allele frequencies between generations.'],
      ['Fixation', 'An allele reaching 100% frequency in a population.'],
      ['Bottleneck effect', 'Drift caused by a sharp, random reduction in population size.'],
      ['Founder effect', 'Drift caused by a few individuals starting a new population.'],
      ['Gene pool', 'All the alleles in a population.'],
    ],
    goDeeper:
      'Drift and selection act at the same time. In large populations selection usually dominates, but in small populations drift can overpower weak selection, so even slightly harmful alleles can become fixed by chance. This is a major concern for endangered species, whose low diversity leaves them less able to adapt to diseases and environmental change.\n\nConservation biologists fight drift by moving individuals between isolated populations (genetic rescue). The Florida panther population had shrunk to about 20–30 animals with heart defects and kinked tails from inbreeding; releasing eight female Texas pumas in 1995 restored diversity and the population grew.\n\nIn reality, it’s a bit more complicated: what matters is the “effective” population size, which counts only individuals that actually breed and is often far smaller than the total head count.',
    quiz: [
      mc(
        'Why does genetic drift have a bigger effect in small populations?',
        [
          'Random sampling errors are larger when there are fewer individuals',
          'Small populations have more mutations',
          'Selection is stronger in small populations',
          'Small populations can’t reproduce sexually',
        ],
        0,
        'With few individuals, chance events (who breeds, which gametes succeed) shift frequencies a lot, like getting 8 heads in 10 coin flips.',
      ),
      predict(
        'A storm randomly kills 95% of a large lizard population, regardless of their traits.',
        'What happens to the survivors’ gene pool?',
        [
          'It is likely to have less variation and different allele frequencies by chance',
          'It is better adapted to storms',
          'It has exactly the same allele frequencies',
          'It gains new alleles',
        ],
        0,
        'This is a bottleneck: the survivors are a random sample, so frequencies shift by chance and rare alleles are often lost.',
      ),
      label(
        'Match each mechanism to its description.',
        [
          ['Genetic drift', 'Random changes in allele frequency'],
          ['Natural selection', 'Non-random survival of advantageous traits'],
          ['Gene flow', 'Alleles moving between populations'],
          ['Mutation', 'Creates new alleles'],
        ],
        'These four mechanisms, plus non-random mating, are how populations evolve.',
      ),
    ],
  }),
];
