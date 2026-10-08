import type { Concept } from '../../types';

export const genetics: Concept[] = [
  {
    id: 'translation',
    title: 'From DNA to Protein',
    category: 'genetics',
    flagship: true,
    tags: [
      'transcription',
      'translation',
      'mRNA',
      'tRNA',
      'ribosome',
      'codons',
      'protein synthesis',
      'central dogma',
    ],
    aliases: [
      'protein synthesis',
      'central dogma',
      'gene expression',
      'dna to rna to protein',
      'sickle cell mutation',
    ],
    difficulty: 3,
    rarity: 'common',
    summary:
      'Your DNA is a recipe book. Cells copy one recipe to RNA, then a ribosome cooks up a protein.',
    steps: [
      {
        title: 'The recipe',
        text: 'A gene is a stretch of DNA that holds the instructions for one protein.',
      },
      {
        title: 'Copy it (transcription)',
        text: 'In the nucleus, RNA polymerase builds an mRNA copy. A pairs with U, T with A, G with C.',
      },
      {
        title: 'Read it (translation)',
        text: 'A ribosome reads the mRNA three letters at a time. Each three-letter word is a codon.',
      },
      {
        title: 'Deliveries',
        text: 'tRNAs carry amino acids. Each tRNA’s anticodon pairs with one codon, so the right amino acid is added.',
      },
      {
        title: 'Stop and fold',
        text: 'A stop codon ends the chain. The protein folds into a shape that lets it do its job.',
      },
      {
        title: 'One letter matters',
        text: 'Changing a single DNA letter can swap one amino acid — sometimes with big effects.',
      },
    ],
    interaction: { template: 'flagship', config: { component: 'translation' } },
    goDeeper:
      'The “central dogma” describes information flowing from DNA to RNA (transcription) to protein (translation). RNA polymerase reads the template strand 3′→5′ and builds mRNA 5′→3′, so the mRNA matches the coding strand except that it has U instead of T. In eukaryotes, the pre-mRNA is capped, spliced to remove introns, and given a poly-A tail before it leaves the nucleus. Ribosomes read codons 5′→3′; 61 codons specify the 20 standard amino acids and 3 are stop codons, so the code is redundant (several codons can mean the same amino acid).\n\nIn reality, it’s a bit more complicated: the sequence in the lesson is the real start of the β-globin gene (Met-His-Leu-Thr-Pro-Glu-Glu…), shortened so the glutamic acid comes third. The real sickle-cell mutation changes the 6th amino acid (Glu → Val), which makes hemoglobin molecules stick together into long fibers when oxygen is low, bending red blood cells into sickle shapes. Also, the first methionine is removed from mature hemoglobin, and real tRNAs can sometimes pair loosely at the third codon letter (“wobble”).',
    quiz: [
      {
        kind: 'mc',
        prompt: 'In RNA, which base pairs with A on the DNA template?',
        options: ['T', 'U', 'G', 'C'],
        answer: 1,
        explain: 'RNA uses uracil (U) instead of thymine (T).',
      },
      {
        kind: 'label',
        prompt: 'Match each molecule to its job.',
        pairs: [
          { term: 'mRNA', definition: 'A working copy of a gene' },
          { term: 'tRNA', definition: 'Carries an amino acid to the ribosome' },
          { term: 'Ribosome', definition: 'Reads codons and links amino acids' },
        ],
        explain: 'mRNA is the message, tRNA the delivery truck, the ribosome the factory.',
      },
      {
        kind: 'predict',
        scenario:
          'One DNA letter changes so a codon goes from GAG (glutamic acid) to GUG (valine).',
        prompt: 'What happens to the protein?',
        options: [
          'Nothing — one letter can’t matter',
          'One amino acid is swapped, which can change how the protein behaves',
          'The whole protein becomes DNA',
          'The protein gets twice as long',
        ],
        answer: 1,
        explain:
          'A single swap can change the protein’s properties — this is what causes sickle-cell disease.',
      },
    ],
    relatedConcepts: ['incomplete-dominance', 'meiosis'],
    funFact:
      'A ribosome adds about 15–20 amino acids per second in bacteria, and a few per second in your cells.',
  },
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
