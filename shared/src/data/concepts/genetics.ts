import type { Concept } from '../../types';

export const genetics: Concept[] = [
  {
    id: 'incomplete-dominance',
    title: 'Incomplete Dominance & Codominance',
    category: 'genetics',
    tags: ['alleles', 'snapdragons', 'blood type', 'inheritance', 'heterozygous', 'Punnett'],
    aliases: ['codominance', 'blending traits', 'pink snapdragons', 'AB blood'],
    difficulty: 2,
    rarity: 'common',
    summary:
      'Sometimes neither version of a gene wins — and you get something in between, or both at once.',
    steps: [
      { title: 'Two copies', text: 'You get one version (allele) of each gene from each parent.' },
      {
        title: 'In-between',
        text: 'With incomplete dominance, one red and one white allele make a pink snapdragon.',
      },
      {
        title: 'Both show',
        text: 'With codominance, both alleles show fully, like AB blood type.',
      },
      {
        title: 'Not really blending',
        text: 'Two pink parents can still have red or white babies. The alleles never actually mixed!',
      },
    ],
    interaction: {
      template: 'punnett',
      config: {
        prompt: 'Cross snapdragons with red (R) and white (W) alleles. Pink means one of each.',
        gene: {
          name: 'Flower color',
          alleles: ['R', 'W'],
          inheritance: 'incomplete',
          phenotypes: {
            RR: { label: 'Red', color: '#fca5a5', emoji: '🌺' },
            RW: { label: 'Pink', color: '#fbcfe8', emoji: '🌸' },
            WW: { label: 'White', color: '#f8fafc', emoji: '🤍' },
          },
        },
        mothers: ['RR', 'RW', 'WW'],
        fathers: ['RR', 'RW', 'WW'],
        challenges: [
          {
            prompt: 'Make every baby pink (100%).',
            phenotype: 'Pink',
            probability: 1,
            explain: 'Red × White: every baby gets one R and one W, so all are pink.',
          },
          {
            prompt: 'Get a 25% chance of white flowers.',
            phenotype: 'White',
            probability: 0.25,
            explain:
              'Pink × Pink gives 1 red : 2 pink : 1 white. The white allele was hiding in the pink parents!',
          },
          {
            prompt: 'Get exactly half pink, half red.',
            phenotype: 'Red',
            probability: 0.5,
            explain:
              'Pink × Red: each baby gets R from the red parent and either R or W from the pink one.',
          },
        ],
      },
    },
    goDeeper:
      'In complete dominance, one functional allele is enough to produce the full trait. In incomplete dominance, the heterozygote has an intermediate phenotype, often because one working allele makes only half as much pigment (a dosage effect). In codominance, both alleles are fully expressed: in ABO blood types, IA and IB each add a different sugar to red blood cells, so an IAIB person shows both A and B antigens (type AB).\n\nIn reality, it’s a bit more complicated: dominance describes how alleles show up in a phenotype, not a property of the allele itself. The same gene can look dominant at one level and incomplete at another (for example, sickle-cell trait carriers have some sickle-shaped cells under low oxygen). Many traits, such as height or skin color, are controlled by many genes plus the environment.',
    quiz: [
      {
        kind: 'mc',
        prompt:
          'A red snapdragon (RR) is crossed with a white one (WW). What do the babies look like?',
        options: ['All red', 'All white', 'All pink', 'Half red, half white'],
        answer: 2,
        explain: 'Every baby is RW, which is pink with incomplete dominance.',
      },
      {
        kind: 'predict',
        scenario: 'Two pink snapdragons (RW × RW) are crossed.',
        prompt: 'What colors can the babies be?',
        options: ['Only pink', 'Red, pink and white', 'Only red and white', 'Purple'],
        answer: 1,
        explain: '1 RR : 2 RW : 1 WW, so red, pink and white all appear.',
      },
      {
        kind: 'mc',
        prompt: 'A person with AB blood type shows both A and B markers. This is an example of…',
        options: ['Incomplete dominance', 'Codominance', 'A mutation', 'Complete dominance'],
        answer: 1,
        explain: 'In codominance, both alleles are fully expressed.',
      },
    ],
    relatedConcepts: [],
    funFact:
      'Roan cattle have both red and white hairs mixed together — a classic example of codominance.',
  },
];
