import type { Concept } from '../../types';

export const microbes: Concept[] = [
  {
    id: 'antibiotic-resistance',
    title: 'Antibiotic Resistance',
    category: 'microbes',
    flagship: true,
    tags: [
      'bacteria',
      'antibiotics',
      'superbugs',
      'evolution',
      'MRSA',
      'plasmids',
      'natural selection',
    ],
    aliases: [
      'superbugs',
      'drug resistance',
      'why finish antibiotics',
      'MRSA',
      'antimicrobial resistance',
    ],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['bacteria-vs-viruses', 'natural-selection'],
    summary:
      'Antibiotics don’t make bacteria stronger — they kill the weak ones and leave the tough ones to multiply.',
    steps: [
      {
        title: 'Not all the same',
        text: 'In any infection, a few bacteria happen to be tougher against a drug than the rest.',
      },
      {
        title: 'The first doses',
        text: 'Antibiotics kill the easy ones fast, so you feel better within days.',
      },
      {
        title: 'Feeling better ≠ cured',
        text: 'The bacteria left behind are the toughest. If you stop early, they survive.',
      },
      {
        title: 'The comeback',
        text: 'Survivors multiply. Their offspring inherit the toughness, so the next infection is harder to treat.',
      },
      {
        title: 'Resistance',
        text: 'Repeat this enough and the drug stops working. That’s natural selection in fast-forward.',
      },
      {
        title: 'Finish the course',
        text: 'Taking every dose (and only using antibiotics when needed) gives the tough ones less chance to win.',
      },
    ],
    interaction: { template: 'flagship', config: { component: 'antibiotic-resistance' } },
    goDeeper:
      'Resistance arises from random mutations (for example, a changed drug target or a pump that expels the drug) or from genes picked up from other bacteria by horizontal gene transfer — conjugation (plasmids), transformation (taking up free DNA) and transduction (via bacteriophages). Antibiotics then act as a selective pressure: susceptible cells die, resistant ones survive and multiply. Overuse and misuse of antibiotics in medicine and agriculture speed this up. MRSA (methicillin-resistant Staphylococcus aureus) and carbapenem-resistant Enterobacteriaceae are major threats.\n\nIn reality, it’s a bit more complicated: the guidance on “always finish the course” is being revisited — for some infections, shorter courses work just as well, so follow the prescriber’s instructions rather than a universal rule. The key principle is to use antibiotics only when needed and exactly as prescribed. The game also simplifies resistance into three levels; real resistance ranges continuously and can carry costs that make resistant bacteria grow slower when the drug is absent.',
    quiz: [
      {
        kind: 'mc',
        prompt: 'How does a population of bacteria become resistant to an antibiotic?',
        options: [
          'Each bacterium learns to resist',
          'The antibiotic kills susceptible bacteria and resistant ones survive and multiply',
          'Antibiotics turn into bacteria',
          'The patient becomes resistant',
        ],
        answer: 1,
        explain:
          'It’s natural selection: the drug removes the susceptible, leaving resistant survivors to multiply.',
      },
      {
        kind: 'predict',
        scenario: 'A patient stops their antibiotics on day 2 because they feel better.',
        prompt: 'What is the most likely result?',
        options: [
          'The tougher surviving bacteria multiply, and the infection may return harder to treat',
          'The bacteria all die anyway',
          'The patient becomes immune to bacteria',
          'The bacteria turn into viruses',
        ],
        answer: 0,
        explain:
          'The survivors are the least susceptible ones; their offspring inherit that toughness.',
      },
      {
        kind: 'mc',
        prompt: 'What are plasmids?',
        options: [
          'Antibiotic pills',
          'Small rings of DNA bacteria can share, sometimes carrying resistance genes',
          'White blood cells',
          'Bacterial cell walls',
        ],
        answer: 1,
        explain: 'Plasmids can spread resistance genes between bacteria, even between species.',
      },
    ],
    relatedConcepts: ['bacteria-vs-viruses', 'natural-selection'],
    funFact:
      'Penicillin was discovered by accident in 1928 when mold contaminated Alexander Fleming’s bacteria plates.',
  },
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
