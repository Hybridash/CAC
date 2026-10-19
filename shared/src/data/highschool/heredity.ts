import type { Concept, DiagramShape } from '../../types';
import { label, mc, predict } from '../concepts/helpers';
import { arrow, circle, diagram, hs, path, rect, text } from './build';

/** A Punnett square: gametes along the top and left, offspring genotypes in the cells. */
function punnett(
  x: number,
  y: number,
  size: number,
  top: string[],
  left: string[],
  cell: (a: string, b: string) => { label: string; fill: string; part: string },
  gametePart?: string,
): DiagramShape[] {
  const out: DiagramShape[] = [];
  top.forEach((g, i) =>
    out.push(
      text(x + i * size + size / 2, y - 8, g, {
        bold: true,
        size: 11,
        fill: '#7c3aed',
        part: gametePart,
      }),
    ),
  );
  left.forEach((g, j) =>
    out.push(
      text(x - 10, y + j * size + size / 2 + 4, g, {
        anchor: 'end',
        bold: true,
        size: 11,
        fill: '#7c3aed',
        part: gametePart,
      }),
    ),
  );
  left.forEach((b, j) =>
    top.forEach((a, i) => {
      const c = cell(a, b);
      out.push(
        rect(x + i * size, y + j * size, size, size, c.fill, {
          stroke: '#64748b',
          strokeWidth: 1.5,
          part: c.part,
        }),
        text(x + i * size + size / 2, y + j * size + size / 2 + 4, c.label, {
          bold: true,
          size: size > 50 ? 12 : 9,
          part: c.part,
        }),
      );
    }),
  );
  return out;
}

const sortAlleles = (a: string, b: string) => [a, b].sort().join('');

/** Pedigree symbols: male square or female circle, shaded if affected, dotted if a carrier. */
function person(
  x: number,
  y: number,
  sex: 'm' | 'f',
  state: 'normal' | 'affected' | 'carrier',
  part: string,
): DiagramShape[] {
  const fill = state === 'affected' ? '#334155' : '#fff';
  const shape =
    sex === 'm'
      ? rect(x - 11, y - 11, 22, 22, fill, { stroke: '#334155', strokeWidth: 2, part })
      : circle(x, y, 11.5, fill, { stroke: '#334155', strokeWidth: 2, part });
  return state === 'carrier' ? [shape, circle(x, y, 3.5, '#334155', { part })] : [shape];
}

export const heredity: Concept[] = [
  hs({
    base: 'mendelian-inheritance',
    unit: 'heredity',
    summary:
      'Gregor Mendel’s pea experiments showed that traits are inherited as discrete units (genes) that come in versions (alleles). Each parent passes on one allele per gene (the law of segregation), and different genes are inherited independently (the law of independent assortment).',
    steps: [
      [
        'Genes, alleles and genotypes',
        'A gene sits at a locus on a chromosome; its versions are alleles. Diploid organisms have two alleles per gene, one from each parent. The pair is the genotype (e.g. Pp); the trait you see is the phenotype (purple flowers). Homozygous = two identical alleles (PP or pp); heterozygous = two different (Pp).',
      ],
      [
        'Dominant alleles',
        'A dominant allele (capital letter) determines the phenotype even when only one copy is present, so PP and Pp plants look the same. Dominant doesn’t mean “more common” or “better”; it only describes how alleles interact.',
      ],
      [
        'Recessive alleles',
        'A recessive allele (lowercase) only shows in the phenotype when homozygous (pp). Heterozygotes carry it hidden. That is why two purple parents can have a white-flowered offspring.',
      ],
      [
        'The law of segregation',
        'The two alleles of a gene separate during meiosis, so each gamete gets just one. In a Pp × Pp cross, the Punnett square predicts 1 PP : 2 Pp : 1 pp genotypes and a 3 purple : 1 white phenotype ratio. These are probabilities: each offspring has a 1/4 chance of being white.',
      ],
    ],
    diagrams: [
      diagram(
        'A monohybrid cross: Pp × Pp',
        'Two heterozygous purple-flowered pea plants are crossed. Each parent makes P and p gametes in equal numbers.',
        [
          text(200, 18, 'Parents:  Pp (purple)  ×  Pp (purple)', {
            bold: true,
            size: 11,
            part: 'parents',
          }),
          ...punnett(
            130,
            56,
            66,
            ['P', 'p'],
            ['P', 'p'],
            (a, b) => {
              const g = sortAlleles(a, b);
              return {
                label: g,
                fill: g === 'pp' ? '#f8fafc' : g === 'PP' ? '#ddd6fe' : '#ede9fe',
                part: g === 'PP' ? 'homodom' : g === 'pp' ? 'homorec' : 'hetero',
              };
            },
            'gametes',
          ),
          ...[
            [163, 105, '#7c3aed'],
            [229, 105, '#7c3aed'],
            [163, 171, '#7c3aed'],
            [229, 171, '#fff'],
          ].map(([x, y, c]) =>
            circle(x as number, (y as number) + 6, 7, c as string, {
              stroke: '#6d28d9',
              strokeWidth: 1.5,
            }),
          ),
          text(66, 72, 'Gametes', { size: 9, fill: '#7c3aed', part: 'gametes' }),
          text(66, 84, 'from one', { size: 9, fill: '#7c3aed', part: 'gametes' }),
          text(66, 96, 'parent', { size: 9, fill: '#7c3aed', part: 'gametes' }),
          rect(286, 60, 108, 124, '#f8fafc', { r: 10, stroke: '#e2e8f0', part: 'ratio' }),
          text(340, 80, 'Genotypes', { size: 10, bold: true, part: 'ratio' }),
          text(340, 96, '1 PP : 2 Pp : 1 pp', { size: 9.5, part: 'ratio' }),
          text(340, 126, 'Phenotypes', { size: 10, bold: true, part: 'ratio' }),
          text(340, 142, '3 purple : 1 white', { size: 9.5, part: 'ratio' }),
          text(340, 168, '75% : 25%', { size: 9.5, fill: '#475569', part: 'ratio' }),
          text(200, 228, 'Each square is one possible offspring, each with a ¼ chance.', {
            size: 9,
            fill: '#475569',
            part: 'ratio',
          }),
        ],
        [
          [
            'parents',
            'Heterozygous parents',
            [34, 18],
            'Both look purple but each carries a hidden recessive p allele.',
          ],
          [
            'gametes',
            'Gametes (segregation)',
            [130, 34],
            'Each gamete gets only one allele per gene; half carry P and half carry p.',
          ],
          [
            'homodom',
            'Homozygous dominant (PP)',
            [118, 66],
            'Two dominant alleles: purple. 1 in 4 offspring.',
          ],
          [
            'hetero',
            'Heterozygous (Pp)',
            [252, 84],
            'One of each allele: purple, because P is dominant. 2 in 4 offspring, carriers of p.',
          ],
          [
            'homorec',
            'Homozygous recessive (pp)',
            [252, 196],
            'The only genotype that shows the recessive trait: white. 1 in 4 offspring.',
          ],
          [
            'ratio',
            'Expected ratios',
            [382, 52],
            'Ratios predict probabilities, not exact counts. Mendel got 705 purple : 224 white, close to 3:1.',
          ],
        ],
      ),
      diagram(
        'A dihybrid cross: RrYy × RrYy',
        'Seed shape (R round, r wrinkled) and color (Y yellow, y green) are on different chromosomes, so they assort independently into 4 kinds of gamete.',
        [
          ...punnett(
            100,
            56,
            40,
            ['RY', 'Ry', 'rY', 'ry'],
            ['RY', 'Ry', 'rY', 'ry'],
            (a, b) => {
              const g = sortAlleles(a[0], b[0]) + sortAlleles(a[1], b[1]);
              const round = g.includes('R');
              const yellow = g.includes('Y');
              const part = round && yellow ? 'ry1' : round ? 'ry2' : yellow ? 'ry3' : 'ry4';
              const fill =
                round && yellow ? '#fde047' : round ? '#86efac' : yellow ? '#fef3c7' : '#dcfce7';
              return { label: g, fill, part };
            },
            'assort',
          ),
          ...[
            ['ry1', '#fde047', 'Round, yellow', '9'],
            ['ry2', '#86efac', 'Round, green', '3'],
            ['ry3', '#fef3c7', 'Wrinkled, yellow', '3'],
            ['ry4', '#dcfce7', 'Wrinkled, green', '1'],
          ].flatMap(([part, fill, name, n], i) => [
            rect(290, 68 + i * 34, 16, 16, fill, { stroke: '#64748b', part }),
            text(312, 80 + i * 34, name, { anchor: 'start', size: 9, part }),
            text(312, 92 + i * 34, `${n} / 16`, { anchor: 'start', size: 9, bold: true, part }),
          ]),
          text(200, 248, 'Phenotype ratio 9 : 3 : 3 : 1', { size: 11, bold: true, part: 'ratio' }),
        ],
        [
          [
            'assort',
            'Four kinds of gamete',
            [78, 36],
            'Independent assortment: which shape allele a gamete gets doesn’t affect which color allele it gets, so RY, Ry, rY and ry are equally likely.',
          ],
          [
            'ry1',
            'Dominant for both',
            [278, 76],
            'At least one R and one Y: round and yellow. 9 of 16 squares.',
          ],
          ['ry2', 'Round, green', [278, 110], 'At least one R, but yy. 3 of 16.'],
          ['ry3', 'Wrinkled, yellow', [278, 144], 'rr with at least one Y. 3 of 16.'],
          [
            'ry4',
            'Double recessive (rryy)',
            [278, 178],
            'Only 1 of 16 offspring shows both recessive traits.',
          ],
          [
            'ratio',
            '9:3:3:1',
            [92, 248],
            'The classic dihybrid ratio. It equals (3:1) × (3:1), because the two genes behave independently.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Allele', 'One version of a gene.'],
      ['Genotype', 'The alleles an organism has (e.g. Pp).'],
      ['Phenotype', 'The observable trait (e.g. purple flowers).'],
      ['Homozygous', 'Having two identical alleles for a gene.'],
      ['Heterozygous', 'Having two different alleles for a gene.'],
      ['Test cross', 'Crossing with a homozygous recessive to reveal an unknown genotype.'],
    ],
    goDeeper:
      'A test cross reveals a hidden genotype. Cross a purple plant of unknown genotype with a white (pp) plant: if any offspring are white, the purple parent must be Pp; if all of many offspring are purple, it is very likely PP.\n\nIndependent assortment only applies to genes on different chromosomes (or far apart on the same one). Genes close together on one chromosome are linked: they tend to be inherited together, and only crossing over separates them. How often crossing over splits two genes is used to map their distance apart.\n\nIn reality, it’s a bit more complicated: most human traits, like height and skin color, are polygenic (controlled by many genes) and influenced by environment, so they show continuous variation rather than neat Mendelian ratios.',
    quiz: [
      mc(
        'In a cross Pp × pp, what fraction of offspring are expected to have white (pp) flowers?',
        ['1/2', '1/4', '3/4', '0'],
        0,
        'Pp makes P and p gametes; pp makes only p. Offspring: half Pp (purple), half pp (white).',
      ),
      predict(
        'Two purple-flowered plants have 400 offspring: 302 purple and 98 white.',
        'What are the parents’ genotypes most likely to be?',
        ['Both Pp', 'PP and pp', 'Both PP', 'PP and Pp'],
        0,
        '302:98 is about 3:1, the ratio expected from crossing two heterozygotes.',
      ),
      label(
        'Match each term to an example.',
        [
          ['Homozygous recessive', 'pp'],
          ['Heterozygous', 'Pp'],
          ['Phenotype', 'Purple flowers'],
          ['Genotype', 'PP'],
        ],
        'Genotype = the letters; phenotype = what you observe.',
      ),
    ],
  }),

  hs({
    base: 'incomplete-dominance',
    unit: 'heredity',
    summary:
      'Not all alleles follow simple dominance. In incomplete dominance the heterozygote has an intermediate phenotype; in codominance both alleles are fully expressed. Many genes also have more than two alleles, like the ABO blood group gene.',
    steps: [
      [
        'Beyond dominant and recessive',
        'Mendel’s pea traits showed complete dominance. Many genes don’t: the way two alleles interact depends on what their proteins do. Notation changes too, often using superscripts like Cᴿ and Cᵂ instead of capital/lowercase letters.',
      ],
      [
        'Incomplete dominance',
        'In snapdragons, red (CᴿCᴿ) × white (CᵂCᵂ) gives all pink (CᴿCᵂ) offspring. One red allele makes only enough pigment for pink. Crossing two pinks gives 1 red : 2 pink : 1 white, so the phenotype ratio matches the genotype ratio.',
      ],
      [
        'Codominance and multiple alleles',
        'In codominance, both alleles show fully. The ABO gene has three alleles: Iᴬ and Iᴮ are codominant (Iᴬ Iᴮ gives type AB, with both A and B antigens on red blood cells), and both are dominant over i (type O, no antigen).',
      ],
      [
        'The alleles don’t blend',
        'Pink snapdragons look “blended,” but the alleles stay separate: crossing two pinks brings back pure red and white. This disproved the old blending theory and supports Mendel’s idea of particulate inheritance.',
      ],
    ],
    diagrams: [
      diagram(
        'Incomplete dominance in snapdragons',
        'Pink (heterozygous) × pink gives red, pink and white offspring in a 1 : 2 : 1 ratio.',
        [
          text(200, 18, 'Pink (CᴿCᵂ)  ×  Pink (CᴿCᵂ)', { bold: true, size: 11, part: 'parents' }),
          ...punnett(140, 56, 66, ['Cᴿ', 'Cᵂ'], ['Cᴿ', 'Cᵂ'], (a, b) => {
            const g = [a, b].sort((x, y) => (x === 'Cᴿ' ? -1 : y === 'Cᴿ' ? 1 : 0)).join('');
            const red = g === 'CᴿCᴿ';
            const white = g === 'CᵂCᵂ';
            return {
              label: g,
              fill: red ? '#fecaca' : white ? '#f8fafc' : '#fce7f3',
              part: red ? 'red' : white ? 'white' : 'pink',
            };
          }),
          ...[
            [173, '#dc2626'],
            [239, '#f472b6'],
          ].map(([x, c]) =>
            circle(x as number, 108, 7, c as string, { stroke: '#9f1239', strokeWidth: 1 }),
          ),
          ...[
            [173, '#f472b6'],
            [239, '#fff'],
          ].map(([x, c]) =>
            circle(x as number, 174, 7, c as string, { stroke: '#9f1239', strokeWidth: 1 }),
          ),
          rect(292, 66, 102, 112, '#f8fafc', { r: 10, stroke: '#e2e8f0', part: 'ratio' }),
          text(343, 86, 'Genotypes', { size: 10, bold: true, part: 'ratio' }),
          text(343, 102, '1 : 2 : 1', { size: 10, part: 'ratio' }),
          text(343, 132, 'Phenotypes', { size: 10, bold: true, part: 'ratio' }),
          text(343, 148, '1 red : 2 pink', { size: 9.5, part: 'ratio' }),
          text(343, 162, ': 1 white', { size: 9.5, part: 'ratio' }),
          text(
            200,
            232,
            'Every genotype has its own phenotype, so you can tell genotypes apart by looking.',
            { size: 9, fill: '#475569', part: 'ratio' },
          ),
        ],
        [
          [
            'parents',
            'Heterozygous pink parents',
            [44, 18],
            'Each carries one red and one white allele.',
          ],
          [
            'red',
            'CᴿCᴿ: red',
            [118, 70],
            'Two copies of the pigment-making allele: full red color.',
          ],
          [
            'pink',
            'CᴿCᵂ: pink',
            [282, 92],
            'One working copy makes about half the pigment: an intermediate pink. 2 in 4 offspring.',
          ],
          ['white', 'CᵂCᵂ: white', [282, 192], 'No working pigment allele: white.'],
          [
            'ratio',
            'Ratio 1 : 2 : 1',
            [384, 58],
            'Phenotype and genotype ratios are the same with incomplete dominance.',
          ],
        ],
      ),
      diagram(
        'Codominance: ABO blood groups',
        'Three alleles (Iᴬ, Iᴮ, i) give six genotypes and four blood types. Triangles are A antigens and circles are B antigens on red blood cells.',
        [
          ...[
            ['typeA', 'Type A', 'IᴬIᴬ or Iᴬi', ['A']],
            ['typeB', 'Type B', 'IᴮIᴮ or Iᴮi', ['B']],
            ['typeAB', 'Type AB', 'IᴬIᴮ', ['A', 'B']],
            ['typeO', 'Type O', 'ii', []],
          ].flatMap(([part, name, genos, antigens], i) => {
            const cx = 52 + i * 98;
            const shapes: DiagramShape[] = [
              circle(cx, 92, 36, '#fca5a5', {
                stroke: '#b91c1c',
                strokeWidth: 2,
                part: part as string,
              }),
              circle(cx, 92, 15, '#fecaca', { part: part as string }),
              text(cx, 152, name as string, { bold: true, size: 12, part: part as string }),
              text(cx, 168, genos as string, { size: 9.5, fill: '#475569', part: part as string }),
            ];
            const spots = [
              [0, -44],
              [38, -22],
              [38, 22],
              [0, 44],
              [-38, 22],
              [-38, -22],
            ];
            spots.forEach(([dx, dy], k) => {
              const kind = (antigens as string[])[k % Math.max(1, (antigens as string[]).length)];
              if (!kind) return;
              shapes.push(
                kind === 'A'
                  ? path(
                      `M${cx + dx} ${92 + dy - 6} L${cx + dx + 6} ${92 + dy + 5} L${cx + dx - 6} ${92 + dy + 5} Z`,
                      {
                        fill: '#2563eb',
                        stroke: '#1e3a8a',
                        strokeWidth: 1,
                        part: part as string,
                      },
                    )
                  : circle(cx + dx, 92 + dy, 5, '#16a34a', {
                      stroke: '#14532d',
                      strokeWidth: 1,
                      part: part as string,
                    }),
              );
            });
            return shapes;
          }),
          rect(16, 190, 368, 54, '#f8fafc', { r: 10, stroke: '#e2e8f0', part: 'alleles' }),
          text(28, 210, 'Iᴬ and Iᴮ are codominant: both are expressed in type AB.', {
            anchor: 'start',
            size: 9.5,
            part: 'alleles',
          }),
          text(28, 228, 'Both are dominant over i, which makes no antigen.', {
            anchor: 'start',
            size: 9.5,
            part: 'alleles',
          }),
        ],
        [
          [
            'typeA',
            'Type A',
            [24, 52],
            'At least one Iᴬ allele and no Iᴮ: only A antigens on the cells.',
          ],
          ['typeB', 'Type B', [122, 52], 'At least one Iᴮ and no Iᴬ: only B antigens.'],
          [
            'typeAB',
            'Type AB (codominance)',
            [220, 52],
            'Iᴬ and Iᴮ are both fully expressed, so the cells carry both antigens.',
          ],
          [
            'typeO',
            'Type O',
            [318, 52],
            'Two recessive i alleles: no A or B antigen. Type O blood can be given to people of any ABO type.',
          ],
          [
            'alleles',
            'Multiple alleles',
            [384, 186],
            'A population can have many alleles of a gene, though each person carries only two.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Incomplete dominance', 'Heterozygote shows a phenotype in between the two homozygotes.'],
      ['Codominance', 'Both alleles are fully expressed in the heterozygote.'],
      ['Multiple alleles', 'More than two alleles exist for a gene in a population.'],
      ['Antigen', 'A marker molecule that the immune system can recognize.'],
      ['Particulate inheritance', 'The idea that alleles stay distinct rather than blending.'],
    ],
    goDeeper:
      'Blood type matters for transfusions because the immune system makes antibodies against antigens it doesn’t have. Type A blood contains anti-B antibodies, so giving type B blood to a type A person makes the donated cells clump (agglutinate). Type O has no A or B antigens, which makes it the “universal donor” for red cells; type AB has neither antibody, making it the “universal recipient.” The separate Rh factor (+ or −) also has to match.\n\nSickle cell shows how dominance depends on the level you look at. For the disease, the allele is recessive (only HbS HbS is sick). At the level of the protein, the alleles are codominant: carriers make both normal and sickle hemoglobin. Under low oxygen, carriers can show mild sickling.\n\nIn reality, it’s a bit more complicated: genes also interact with each other (epistasis). In Labrador retrievers, one gene sets black vs brown pigment, but a second gene decides whether any pigment is deposited at all, giving yellow labs.',
    quiz: [
      predict(
        'A pink snapdragon is crossed with a white snapdragon.',
        'What offspring are expected?',
        ['1 pink : 1 white', 'All pink', '1 red : 2 pink : 1 white', 'All white'],
        0,
        'CᴿCᵂ × CᵂCᵂ gives half CᴿCᵂ (pink) and half CᵂCᵂ (white).',
      ),
      mc(
        'A type A mother (Iᴬi) and a type B father (Iᴮi) have a child. Which blood types are possible?',
        ['A, B, AB and O', 'Only AB', 'Only A or B', 'A and B only'],
        0,
        'Gametes Iᴬ/i × Iᴮ/i give IᴬIᴮ (AB), Iᴬi (A), Iᴮi (B) and ii (O), each with probability ¼.',
      ),
      label(
        'Match each pattern to its example.',
        [
          ['Complete dominance', 'Pp pea plants are purple'],
          ['Incomplete dominance', 'Red × white snapdragons give pink'],
          ['Codominance', 'Type AB blood'],
        ],
        'The heterozygote reveals which pattern is at work.',
      ),
    ],
  }),

  hs({
    base: 'sex-linked-traits',
    unit: 'heredity',
    summary:
      'Genes on the X chromosome are inherited differently in males and females. Males (XY) have only one X, so a single recessive X-linked allele causes the trait. That is why conditions like red–green color blindness and hemophilia are much more common in males, and carrier mothers pass them to half their sons.',
    steps: [
      [
        'Sex chromosomes',
        'Humans have 22 pairs of autosomes plus one pair of sex chromosomes: XX in most females, XY in most males. The X carries about 800 protein-coding genes; the much smaller Y carries few, including SRY, which triggers male development.',
      ],
      [
        'Hemizygous males',
        'A male has one copy of each X-linked gene (hemizygous), inherited from his mother. There’s no second allele to mask a recessive one, so XʰY males are affected. Females need two copies (XʰXʰ) to be affected, which is much rarer.',
      ],
      [
        'Carriers and patterns',
        'A carrier mother (XᴴXʰ) passes the allele to half her sons (affected) and half her daughters (carriers). An affected father passes his X to every daughter (all carriers) and his Y to every son, so father-to-son transmission never happens for X-linked traits.',
      ],
    ],
    diagrams: [
      diagram(
        'Carrier mother × unaffected father',
        'H = normal clotting allele, h = hemophilia allele, carried on the X chromosome. The Y carries no allele for this gene.',
        [
          text(200, 18, 'Mother XᴴXʰ (carrier)  ×  Father XᴴY', {
            bold: true,
            size: 11,
            part: 'parents',
          }),
          ...punnett(140, 56, 66, ['Xᴴ', 'Xʰ'], ['Xᴴ', 'Y'], (a, b) => {
            if (b === 'Y')
              return {
                label: `${a}Y`,
                fill: a === 'Xʰ' ? '#cbd5e1' : '#e0f2fe',
                part: a === 'Xʰ' ? 'affected' : 'son',
              };
            return {
              label: `Xᴴ${a}`,
              fill: a === 'Xʰ' ? '#fef3c7' : '#fce7f3',
              part: a === 'Xʰ' ? 'carrier' : 'daughter',
            };
          }),
          text(76, 120, 'father’s', { size: 8.5, fill: '#64748b' }),
          text(76, 132, 'sperm', { size: 8.5, fill: '#64748b' }),
          text(206, 34, 'mother’s eggs', { size: 8.5, fill: '#64748b' }),
          rect(286, 60, 108, 132, '#f8fafc', { r: 10, stroke: '#e2e8f0', part: 'ratio' }),
          text(340, 80, 'Daughters', { size: 10, bold: true, part: 'ratio' }),
          text(340, 96, '½ normal', { size: 9.5, part: 'ratio' }),
          text(340, 110, '½ carriers', { size: 9.5, part: 'ratio' }),
          text(340, 140, 'Sons', { size: 10, bold: true, part: 'ratio' }),
          text(340, 156, '½ normal', { size: 9.5, part: 'ratio' }),
          text(340, 170, '½ hemophilia', { size: 9.5, bold: true, fill: '#b91c1c', part: 'ratio' }),
          text(200, 232, 'No daughters are affected, but each son has a ½ chance.', {
            size: 9,
            fill: '#475569',
            part: 'ratio',
          }),
        ],
        [
          [
            'parents',
            'Parents',
            [40, 18],
            'The mother looks unaffected but carries one recessive allele; the father is unaffected.',
          ],
          [
            'daughter',
            'XᴴXᴴ daughter',
            [118, 70],
            'Two normal alleles: unaffected and not a carrier.',
          ],
          [
            'carrier',
            'XᴴXʰ daughter (carrier)',
            [282, 70],
            'The normal allele from her father masks the recessive allele. She can pass it on.',
          ],
          ['son', 'XᴴY son', [118, 136], 'Received his mother’s normal X: unaffected.'],
          [
            'affected',
            'XʰY son (affected)',
            [282, 136],
            'Received his mother’s Xʰ, and the Y has no allele to mask it.',
          ],
          [
            'ratio',
            'Outcome by sex',
            [384, 52],
            'The probabilities differ for sons and daughters, a key sign of sex linkage.',
          ],
        ],
      ),
      diagram(
        'Reading a pedigree',
        'A family tree for an X-linked recessive trait. Squares are males, circles females; shaded = affected, dot = carrier.',
        [
          ...person(150, 34, 'm', 'normal', 'gen1'),
          ...person(250, 34, 'f', 'carrier', 'gen1'),
          path('M162 34 L238 34 M200 34 L200 64 M90 64 L350 64', {
            stroke: '#334155',
            strokeWidth: 2,
          }),
          ...[90, 170, 290, 350].map((x) =>
            path(`M${x} 64 L${x} 84`, { stroke: '#334155', strokeWidth: 2 }),
          ),
          ...person(90, 96, 'm', 'affected', 'affectedson'),
          ...person(170, 96, 'f', 'carrier', 'carrierdaughter'),
          ...person(290, 96, 'm', 'normal', 'gen2'),
          ...person(350, 96, 'f', 'normal', 'gen2'),
          ...person(36, 96, 'f', 'normal', 'gen2'),
          path('M47 96 L78 96 M62 96 L62 140 M30 140 L100 140', {
            stroke: '#334155',
            strokeWidth: 2,
          }),
          path('M30 140 L30 158 M100 140 L100 158', { stroke: '#334155', strokeWidth: 2 }),
          ...person(30, 170, 'm', 'normal', 'fatherson'),
          ...person(100, 170, 'f', 'carrier', 'fatherson'),
          ...person(226, 96, 'm', 'normal', 'gen2'),
          path('M181 96 L214 96 M198 96 L198 150 M160 150 L240 150', {
            stroke: '#334155',
            strokeWidth: 2,
          }),
          path('M160 150 L160 158 M240 150 L240 158', { stroke: '#334155', strokeWidth: 2 }),
          ...person(160, 170, 'm', 'affected', 'gen3'),
          ...person(240, 170, 'f', 'normal', 'gen3'),
          text(14, 38, 'I', { anchor: 'start', size: 11, bold: true, fill: '#64748b' }),
          text(14, 100, 'II', { anchor: 'start', size: 11, bold: true, fill: '#64748b' }),
          text(14, 174, 'III', { anchor: 'start', size: 11, bold: true, fill: '#64748b' }),
          rect(286, 140, 108, 102, '#f8fafc', { r: 10, stroke: '#e2e8f0' }),
          ...person(302, 156, 'm', 'normal', 'key'),
          text(320, 160, 'male', { anchor: 'start', size: 9, part: 'key' }),
          ...person(302, 180, 'f', 'normal', 'key'),
          text(320, 184, 'female', { anchor: 'start', size: 9, part: 'key' }),
          ...person(302, 204, 'm', 'affected', 'key'),
          text(320, 208, 'affected', { anchor: 'start', size: 9, part: 'key' }),
          ...person(302, 228, 'f', 'carrier', 'key'),
          text(320, 232, 'carrier', { anchor: 'start', size: 9, part: 'key' }),
        ],
        [
          [
            'gen1',
            'Generation I',
            [276, 22],
            'An unaffected father and a carrier mother, as in the Punnett square.',
          ],
          [
            'affectedson',
            'Affected son',
            [66, 72],
            'Inherited the recessive allele on the X from his carrier mother.',
          ],
          [
            'carrierdaughter',
            'Carrier daughter',
            [196, 80],
            'Got her mother’s recessive allele and her father’s normal X.',
          ],
          [
            'fatherson',
            'Affected father’s children',
            [54, 196],
            'His son is unaffected (he got his father’s Y), but his daughter is a carrier (she got his only X). No father-to-son transmission.',
          ],
          [
            'gen3',
            'Skipped generation',
            [190, 196],
            'The carrier daughter passes the trait to her son: X-linked recessive traits often appear to “skip” generations through carrier females.',
          ],
          [
            'gen2',
            'Unaffected relatives',
            [320, 84],
            'Unaffected males can’t carry an X-linked recessive allele (one X, nowhere to hide it).',
          ],
          [
            'key',
            'Symbol key',
            [386, 132],
            'Standard pedigree symbols used by genetic counselors.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['Sex-linked (X-linked) gene', 'A gene located on the X chromosome.'],
      ['Hemizygous', 'Having only one copy of a gene, as males do for X-linked genes.'],
      ['Carrier', 'A heterozygote who carries a recessive allele without showing the trait.'],
      ['Pedigree', 'A family-tree diagram that tracks a trait through generations.'],
      ['Autosome', 'Any chromosome other than the sex chromosomes.'],
    ],
    goDeeper:
      'X-inactivation evens out gene dosage between the sexes. Early in development, one X in each female cell is randomly switched off and packed into a dense Barr body. Females are therefore mosaics: in calico cats, an X-linked coat-color gene makes patches of orange and black depending on which X is active in each skin region.\n\nHemophilia A, caused by a faulty clotting factor VIII gene, was known as the “royal disease” because Queen Victoria was a carrier and passed it into several European royal families. Other X-linked recessive conditions include Duchenne muscular dystrophy and red–green color blindness, which affects about 8% of males of Northern European ancestry but under 1% of females.\n\nIn reality, it’s a bit more complicated: some X-linked conditions are dominant, sex determination doesn’t always match the XX/XY pattern, and a few genes are shared between the tips of the X and Y chromosomes (the pseudoautosomal regions).',
    quiz: [
      predict(
        'A color-blind man (XᵇY) and a woman with two normal alleles (XᴮXᴮ) have children.',
        'What is the chance their son is color-blind?',
        ['0%', '50%', '25%', '100%'],
        0,
        'Sons get their X from their mother, who only has normal alleles. All daughters will be carriers.',
      ),
      mc(
        'Why are X-linked recessive traits more common in males?',
        [
          'Males have only one X, so one recessive allele is enough to show the trait',
          'The Y chromosome carries the recessive allele',
          'Males inherit two X chromosomes',
          'Recessive alleles are dominant in males',
        ],
        0,
        'Males are hemizygous for X-linked genes; there’s no second X to carry a masking dominant allele.',
      ),
      label(
        'Match each genotype to its phenotype.',
        [
          ['XᴴXʰ', 'Carrier female'],
          ['XʰY', 'Affected male'],
          ['XᴴY', 'Unaffected male'],
          ['XʰXʰ', 'Affected female'],
        ],
        'One recessive allele is enough in males; females need two.',
      ),
    ],
  }),

  hs({
    base: 'crispr',
    unit: 'heredity',
    summary:
      'CRISPR-Cas9 is a gene-editing tool adapted from a bacterial immune system. A guide RNA leads the Cas9 enzyme to a matching DNA sequence, where it cuts both strands. The cell’s repair systems then either disrupt the gene or paste in a new sequence from a template.',
    steps: [
      [
        'A bacterial immune system',
        'When a virus attacks, some bacteria store a snippet of its DNA as a “spacer” in their CRISPR array. Transcribed spacers become guide RNAs that steer Cas proteins to cut matching viral DNA if the virus returns: an immune memory.',
      ],
      [
        'Guide RNA + Cas9',
        'Scientists design a guide RNA with about 20 bases complementary to the target gene. Cas9 carries the guide and scans DNA for a short PAM sequence (NGG); where the guide matches the DNA next to a PAM, Cas9 locks on.',
      ],
      [
        'A double-strand cut',
        'Cas9’s two cutting domains each slice one strand, making a clean double-strand break about 3 bases from the PAM. Because the guide is easy to redesign, almost any gene can be targeted.',
      ],
      [
        'Repair makes the edit',
        'Non-homologous end joining glues the ends back together, often adding or deleting a few bases. That frameshift knocks out the gene. If a DNA template is supplied, homology-directed repair copies it, inserting a precise change. In 2023 the first CRISPR therapy was approved, for sickle cell disease.',
      ],
    ],
    diagrams: [
      diagram(
        'How Cas9 finds and cuts DNA',
        'The guide RNA (purple) pairs with the target DNA sequence, next to a PAM. Cas9 then cuts both strands.',
        [
          path('M14 150 L386 150', { stroke: '#2563eb', strokeWidth: 4, part: 'dna' }),
          path('M14 176 L386 176', { stroke: '#2563eb', strokeWidth: 4, part: 'dna' }),
          ...Array.from({ length: 23 }, (_, i) =>
            path(`M${22 + i * 16} 152 L${22 + i * 16} 174`, {
              stroke: '#cbd5e1',
              strokeWidth: 3,
              part: 'dna',
            }),
          ),
          path(
            'M120 112 C130 70 300 56 312 120 C318 168 300 206 220 210 C130 214 108 170 120 112 Z',
            {
              fill: '#93c5fd',
              stroke: '#1d4ed8',
              strokeWidth: 2,
              opacity: 0.5,
              part: 'cas9',
            },
          ),
          rect(138, 138, 128, 10, '#d8b4fe', { r: 3, stroke: '#7e22ce', part: 'guide' }),
          path('M138 143 Q112 120 128 96 Q150 80 170 98 Q182 112 168 124', {
            stroke: '#7e22ce',
            strokeWidth: 4,
            part: 'guide',
          }),
          rect(270, 146, 40, 34, '#fde68a', { r: 4, opacity: 0.85, part: 'pam' }),
          text(290, 196, 'PAM', { size: 9, bold: true, fill: '#a16207', part: 'pam' }),
          text(290, 168, 'NGG', { size: 8, bold: true, part: 'pam' }),
          rect(138, 156, 128, 16, '#ede9fe', { opacity: 0.6, part: 'target' }),
          text(202, 230, 'target sequence (20 bases)', {
            size: 9,
            fill: '#6d28d9',
            part: 'target',
          }),
          path('M252 132 L262 144 L252 156 M252 168 L262 180 L252 192', {
            stroke: '#dc2626',
            strokeWidth: 2.5,
            part: 'cut',
          }),
          text(336, 36, 'Cas9', { size: 12, bold: true, fill: '#1d4ed8', part: 'cas9' }),
          arrow([332, 44], [298, 80], { stroke: '#1d4ed8', strokeWidth: 1.5, part: 'cas9' }),
        ],
        [
          [
            'cas9',
            'Cas9 protein',
            [372, 32],
            'An enzyme (nuclease) that holds the guide RNA, unzips DNA to check the match and cuts both strands.',
          ],
          [
            'guide',
            'Guide RNA',
            [110, 84],
            'A short RNA whose first ~20 bases are designed to be complementary to the target. Change the guide and you change the target.',
          ],
          [
            'target',
            'Target DNA',
            [128, 196],
            'The gene sequence to be edited. The guide pairs with one strand by complementary base pairing.',
          ],
          [
            'pam',
            'PAM site',
            [326, 162],
            'A short sequence (NGG) Cas9 must find before it checks for a match. It stops Cas9 cutting the bacterium’s own CRISPR array.',
          ],
          [
            'cut',
            'Double-strand break',
            [270, 120],
            'Cas9 cuts both strands about 3 bases upstream of the PAM.',
          ],
          [
            'dna',
            'Genomic DNA',
            [30, 190],
            'Cas9 scans billions of bases, binding briefly at each PAM until the guide matches.',
          ],
        ],
      ),
      diagram(
        'Two ways a cut gets repaired',
        'After the cut, the cell repairs the break. Which pathway it uses decides what kind of edit you get.',
        [
          path('M20 34 L170 34 M230 34 L380 34', { stroke: '#2563eb', strokeWidth: 5 }),
          text(200, 38, '✂', { size: 16, fill: '#dc2626' }),
          text(200, 18, 'cut gene', { size: 10, bold: true, fill: '#dc2626' }),
          arrow([150, 50], [100, 86], { strokeWidth: 2 }),
          arrow([250, 50], [300, 86], { strokeWidth: 2 }),
          rect(8, 92, 186, 156, '#fef2f2', { r: 12, stroke: '#fecaca', part: 'nhej' }),
          text(101, 112, 'End joining (NHEJ)', {
            size: 10.5,
            bold: true,
            fill: '#b91c1c',
            part: 'nhej',
          }),
          path('M22 140 L92 140 M110 140 L180 140', {
            stroke: '#2563eb',
            strokeWidth: 5,
            part: 'nhej',
          }),
          rect(92, 134, 18, 12, '#f97316', { r: 2, part: 'indel' }),
          text(101, 160, '+/− a few bases', { size: 9, fill: '#c2410c', part: 'indel' }),
          text(101, 190, 'frameshift', { size: 10, bold: true, part: 'nhej' }),
          text(101, 206, '→ gene knocked out', { size: 10, bold: true, part: 'nhej' }),
          text(101, 232, 'fast, error-prone', { size: 9, fill: '#64748b', part: 'nhej' }),
          rect(206, 92, 186, 156, '#f0fdf4', { r: 12, stroke: '#bbf7d0', part: 'hdr' }),
          text(299, 112, 'Template repair (HDR)', {
            size: 10.5,
            bold: true,
            fill: '#15803d',
            part: 'hdr',
          }),
          path('M226 130 L276 130 M316 130 L372 130', {
            stroke: '#94a3b8',
            strokeWidth: 3,
            dash: true,
            part: 'template',
          }),
          rect(276, 125, 40, 10, '#22c55e', { r: 2, part: 'template' }),
          text(299, 122, 'donor template', { size: 8, fill: '#15803d', part: 'template' }),
          path('M220 160 L276 160 M316 160 L378 160', {
            stroke: '#2563eb',
            strokeWidth: 5,
            part: 'hdr',
          }),
          rect(276, 154, 40, 12, '#22c55e', { r: 2, part: 'hdr' }),
          text(299, 190, 'precise new sequence', { size: 10, bold: true, part: 'hdr' }),
          text(299, 206, '→ gene corrected/added', { size: 10, bold: true, part: 'hdr' }),
          text(299, 232, 'precise, needs a template', { size: 9, fill: '#64748b', part: 'hdr' }),
        ],
        [
          [
            'nhej',
            'Non-homologous end joining',
            [22, 92],
            'The cell glues the cut ends straight back together. Quick, but often adds or deletes bases.',
          ],
          [
            'indel',
            'Insertion/deletion (indel)',
            [60, 162],
            'A small indel usually shifts the reading frame, so the gene no longer makes a working protein: a “knockout.”',
          ],
          [
            'hdr',
            'Homology-directed repair',
            [380, 92],
            'The cell copies a matching template to fix the break, so the new sequence is written in exactly.',
          ],
          [
            'template',
            'Donor template',
            [382, 132],
            'DNA supplied by scientists, matching the sequences on both sides of the cut, carrying the desired change.',
          ],
        ],
      ),
    ],
    keyTerms: [
      ['CRISPR', 'Clustered repeats in bacterial DNA that store memories of past viruses.'],
      ['Cas9', 'A bacterial enzyme that cuts DNA where a guide RNA directs it.'],
      ['Guide RNA', 'RNA that matches the target sequence and leads Cas9 there.'],
      ['PAM', 'Short DNA sequence next to the target that Cas9 requires.'],
      ['Knockout', 'Disabling a gene so it no longer works.'],
      ['Germline editing', 'Editing eggs, sperm or embryos, so changes are inherited.'],
    ],
    goDeeper:
      'Casgevy, approved in the UK and US in late 2023, treats sickle cell disease and β-thalassemia. Doctors remove a patient’s blood stem cells and use CRISPR to disrupt BCL11A, a gene that switches off fetal hemoglobin after birth. Fetal hemoglobin doesn’t sickle, so once the edited cells are returned, patients make healthy red blood cells.\n\nEditing body (somatic) cells affects only the patient. Editing the germline (embryos, eggs or sperm) would pass changes to future generations, which raises serious ethical concerns about safety, consent and “designer babies.” In 2018, a scientist who edited human embryos was widely condemned and imprisoned. Most countries prohibit germline editing for reproduction.\n\nIn reality, it’s a bit more complicated: Cas9 sometimes cuts “off-target” sites that partly match the guide. Newer tools reduce this: base editors swap a single letter, and prime editors write short edits, both without cutting both strands.',
    quiz: [
      mc(
        'What determines where Cas9 cuts?',
        [
          'The guide RNA’s sequence, next to a PAM',
          'The size of the gene',
          'Cas9 always cuts at the start of a gene',
          'The number of chromosomes',
        ],
        0,
        'The guide RNA pairs with a complementary DNA sequence, and Cas9 only cuts where that match sits beside a PAM.',
      ),
      predict(
        'Scientists cut a gene with CRISPR but don’t provide any template DNA.',
        'What is the most likely outcome?',
        [
          'Small insertions or deletions that knock the gene out',
          'A precise correction of the gene',
          'The whole chromosome is deleted',
          'The cut is never repaired',
        ],
        0,
        'Without a template, the cell uses error-prone end joining, which usually causes a frameshift.',
      ),
      label(
        'Match each component to its role.',
        [
          ['Guide RNA', 'Finds the target by base pairing'],
          ['Cas9', 'Cuts both DNA strands'],
          ['PAM', 'Required sequence beside the target'],
          ['Donor template', 'Provides the new sequence for precise repair'],
        ],
        'CRISPR is programmable because only the guide needs to change.',
      ),
    ],
  }),
];
