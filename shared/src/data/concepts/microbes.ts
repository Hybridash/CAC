import type { Concept } from '../../types';

export const microbes: Concept[] = [
  {
    id: 'bacteria-vs-viruses',
    title: 'Bacteria vs Viruses',
    category: 'microbes',
    tags: ['germs', 'infection', 'antibiotics', 'cells', 'microbes'],
    aliases: ['germs', 'difference between bacteria and viruses', 'are viruses alive'],
    difficulty: 1,
    rarity: 'common',
    summary: 'Both can make you sick, but they are completely different kinds of things.',
    steps: [
      {
        title: 'Bacteria are cells',
        text: 'A bacterium is a whole living cell that can eat, grow and divide on its own.',
      },
      {
        title: 'Viruses are not',
        text: 'A virus is just genes in a protein coat. It must hijack a cell to copy itself.',
      },
      {
        title: 'Size check',
        text: 'Most viruses are about 100 times smaller than a typical bacterium.',
      },
      {
        title: 'Different medicine',
        text: 'Antibiotics can kill bacteria, but they do nothing to viruses.',
      },
    ],
    interaction: {
      template: 'sorting',
      config: {
        prompt: 'Sort each fact or example: is it about bacteria, viruses, or both?',
        bins: [
          { id: 'bacteria', label: 'Bacteria', emoji: '🦠', description: 'Living single cells' },
          {
            id: 'virus',
            label: 'Viruses',
            emoji: '🧬',
            description: 'Genes in a coat, need a host cell',
          },
          { id: 'both', label: 'Both', emoji: '🤝', description: 'True for both' },
        ],
        items: [
          {
            id: 'ecoli',
            label: 'E. coli',
            emoji: '🧫',
            bin: 'bacteria',
            explain: 'E. coli is a bacterium; most strains live harmlessly in your gut.',
          },
          {
            id: 'flu',
            label: 'Influenza',
            emoji: '🤧',
            bin: 'virus',
            explain: 'The flu is caused by the influenza virus.',
          },
          {
            id: 'abx',
            label: 'Killed by antibiotics',
            emoji: '💊',
            bin: 'bacteria',
            explain: 'Antibiotics target bacterial parts like cell walls and ribosomes.',
          },
          {
            id: 'host',
            label: 'Can’t reproduce alone',
            emoji: '🔒',
            bin: 'virus',
            explain: 'Viruses must get inside a host cell to make copies.',
          },
          {
            id: 'dna',
            label: 'Carry genetic material',
            emoji: '📜',
            bin: 'both',
            explain: 'Both carry genes (DNA, or RNA for some viruses).',
          },
          {
            id: 'sick',
            label: 'Some cause disease',
            emoji: '🤒',
            bin: 'both',
            explain: 'Both include species that make us sick — and many that don’t.',
          },
          {
            id: 'yogurt',
            label: 'Help make yogurt',
            emoji: '🥛',
            bin: 'bacteria',
            explain: 'Lactobacillus bacteria ferment milk into yogurt.',
          },
          {
            id: 'cold',
            label: 'Common cold',
            emoji: '😷',
            bin: 'virus',
            explain: 'Colds are caused by viruses like rhinoviruses, so antibiotics don’t help.',
          },
          {
            id: 'ribo',
            label: 'Have their own ribosomes',
            emoji: '🏭',
            bin: 'bacteria',
            explain: 'Bacteria build their own proteins; viruses borrow the host’s ribosomes.',
          },
        ],
      },
    },
    goDeeper:
      'Bacteria are prokaryotes: single cells with a membrane, cytoplasm, ribosomes and a circular chromosome, but no nucleus. Most have a cell wall made of peptidoglycan, a common antibiotic target. Viruses are not cells: they are made of a nucleic acid genome (DNA or RNA) inside a protein capsid, sometimes wrapped in a lipid envelope stolen from a host cell. They have no metabolism of their own.\n\nIn reality, it’s a bit more complicated: whether viruses are “alive” is debated, and some giant viruses (like mimivirus) are bigger than small bacteria. Some bacteria (like Chlamydia) can only survive inside host cells, much like viruses. And viruses that infect bacteria — bacteriophages — are the most numerous biological entities on Earth.',
    quiz: [
      {
        kind: 'mc',
        prompt: 'Why don’t antibiotics cure a cold?',
        options: [
          'Colds are caused by viruses',
          'Colds are caused by bacteria that resist everything',
          'Antibiotics only work in summer',
          'Colds are not infections',
        ],
        answer: 0,
        explain: 'Antibiotics target bacterial structures. Viruses don’t have them.',
      },
      {
        kind: 'mc',
        prompt: 'Which is usually much smaller?',
        options: ['A bacterium', 'A virus', 'They are the same size', 'A red blood cell'],
        answer: 1,
        explain: 'Most viruses are tiny — about 100 times smaller than a typical bacterium.',
      },
      {
        kind: 'predict',
        scenario: 'A virus lands on a clean glass table with no cells around.',
        prompt: 'What happens to it?',
        options: [
          'It eats and grows',
          'It divides into two',
          'It can’t reproduce, and eventually breaks down',
          'It becomes a bacterium',
        ],
        answer: 2,
        explain: 'Without a host cell, a virus can’t copy itself.',
      },
    ],
    relatedConcepts: ['antibodies'],
    funFact:
      'There are about 10 million times more viruses on Earth than there are stars in the observable universe.',
  },
];
