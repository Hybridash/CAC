import type { Concept } from '../../types';

export const immunology: Concept[] = [
  {
    id: 'vaccines',
    title: 'How Vaccines Work',
    category: 'immunology',
    flagship: true,
    tags: ['immunity', 'memory cells', 'antibodies', 'booster', 'immunization', 'mRNA vaccine'],
    aliases: ['vaccination', 'immunization', 'shots', 'jabs', 'booster shots', 'immune memory'],
    difficulty: 3,
    rarity: 'common',
    summary:
      'A vaccine is a practice run that teaches your immune system to recognize a germ before it ever meets it.',
    steps: [
      {
        title: 'A learning system',
        text: 'Your immune system can learn the shape of a germ and remember it for years.',
      },
      {
        title: 'A practice run',
        text: 'A vaccine shows your body a harmless piece or weakened version of a germ — a “wanted poster”.',
      },
      {
        title: 'Memory is made',
        text: 'The first response is slow, but it leaves behind memory cells that know exactly what to look for.',
      },
      { title: 'The real thing', text: 'Later, the real germ shows up and starts copying itself.' },
      {
        title: 'Fast response',
        text: 'Memory cells spring into action within days, flooding the body with antibodies before the germ can spread.',
      },
      {
        title: 'Without a vaccine',
        text: 'An unvaccinated body must learn from scratch, which takes a week or more — long enough to get sick.',
      },
      {
        title: 'Boosters',
        text: 'A booster dose reminds the immune system and makes the memory even stronger.',
      },
    ],
    interaction: { template: 'flagship', config: { component: 'vaccines' } },
    goDeeper:
      'Vaccines train adaptive immunity. Antigen-presenting cells show vaccine antigens to helper T cells, which help B cells make antibodies and help cytotoxic T cells develop. Some B and T cells become long-lived memory cells. On re-exposure, the secondary (memory) response is faster, larger and produces better-binding antibodies thanks to affinity maturation. Vaccine types include live-attenuated (weakened), inactivated, subunit/protein, toxoid, viral-vector and mRNA vaccines; mRNA vaccines give cells temporary instructions to make one viral protein, and the mRNA is broken down within days.\n\nIn reality, it’s a bit more complicated: the model compresses everything into virus and antibody curves, but T cells matter a lot too, and protection can wane over time or be reduced when a virus mutates (which is why flu vaccines are updated yearly). Vaccines greatly lower the risk of illness but no vaccine is 100% effective — vaccinated people can sometimes still get mild infections. When enough people are immune, spread slows for everyone, which is called herd immunity.',
    quiz: [
      {
        kind: 'mc',
        prompt: 'What does a vaccine mainly create that protects you later?',
        options: ['Memory cells', 'Red blood cells', 'Extra stomach acid', 'New neurons'],
        answer: 0,
        explain: 'Memory cells remember the germ and trigger a fast response next time.',
      },
      {
        kind: 'predict',
        scenario:
          'A vaccinated person and an unvaccinated person catch the same virus on the same day.',
        prompt: 'What usually happens?',
        options: [
          'Both get equally sick',
          'The vaccinated person clears it faster and gets less sick',
          'The vaccinated person gets sicker',
          'Neither makes antibodies',
        ],
        answer: 1,
        explain: 'Memory cells start the antibody response in days instead of a week or more.',
      },
      {
        kind: 'mc',
        prompt: 'Why is a booster dose given?',
        options: [
          'To cure the disease',
          'To strengthen and refresh immune memory',
          'To replace your antibodies with new blood',
          'To make the virus weaker',
        ],
        answer: 1,
        explain: 'Boosters restimulate the immune system so memory is stronger and longer-lasting.',
      },
    ],
    relatedConcepts: ['antibodies'],
    funFact:
      'In 1796, Edward Jenner used cowpox to protect against smallpox — the word “vaccine” comes from vacca, Latin for cow.',
  },
  {
    id: 'antibodies',
    title: 'Antibodies',
    category: 'immunology',
    tags: ['B cells', 'antigen', 'immune system', 'proteins', 'specificity'],
    aliases: ['immunoglobulins', 'Y-shaped proteins', 'antigen binding'],
    difficulty: 2,
    rarity: 'common',
    summary:
      'Antibodies are Y-shaped tags that grab one specific invader and flag it for destruction.',
    steps: [
      {
        title: 'Made to measure',
        text: 'B cells make antibodies, and each B cell’s antibody fits just one shape.',
      },
      {
        title: 'Antigens',
        text: 'The shape an antibody grabs is called an antigen, often a protein on a germ’s surface.',
      },
      {
        title: 'Grab and tag',
        text: 'Antibodies stick to germs, block them, and mark them so other immune cells eat them.',
      },
      {
        title: 'Specific',
        text: 'An antibody for flu won’t grab measles. That’s why each disease needs its own defense.',
      },
    ],
    interaction: {
      template: 'lock-and-key',
      config: {
        prompt: 'Drag each antibody to the germ whose antigen matches its shape.',
        receptors: [
          {
            id: 'flu',
            label: 'Flu virus',
            shape: 'triangle',
            color: '#0ea5e9',
            description: 'Spike protein antigen',
          },
          {
            id: 'strep',
            label: 'Strep bacteria',
            shape: 'square',
            color: '#16a34a',
            description: 'Cell-wall antigen',
          },
          {
            id: 'measles',
            label: 'Measles virus',
            shape: 'star',
            color: '#e11d48',
            description: 'Surface antigen',
          },
          {
            id: 'tetanus',
            label: 'Tetanus toxin',
            shape: 'wave',
            color: '#a855f7',
            description: 'Poison made by bacteria',
          },
        ],
        molecules: [
          {
            id: 'ab-flu',
            label: 'Anti-flu',
            shape: 'triangle',
            color: '#0ea5e9',
            fits: 'flu',
            message: 'Locked on! Antibodies coat the flu virus so it can’t enter your cells.',
          },
          {
            id: 'ab-strep',
            label: 'Anti-strep',
            shape: 'square',
            color: '#16a34a',
            fits: 'strep',
            message: 'Tagged! White blood cells now see the bacteria as food.',
          },
          {
            id: 'ab-measles',
            label: 'Anti-measles',
            shape: 'star',
            color: '#e11d48',
            fits: 'measles',
            message: 'Got it! Neutralized measles virus can’t infect anything.',
          },
          {
            id: 'ab-tet',
            label: 'Anti-toxin',
            shape: 'wave',
            color: '#a855f7',
            fits: 'tetanus',
            message:
              'Antibodies can even grab poisons and neutralize them before they hurt nerves.',
          },
          {
            id: 'ab-pox',
            label: 'Anti-chickenpox',
            shape: 'hexagon',
            color: '#f59e0b',
            fits: null,
            message:
              'No chickenpox here! This antibody doesn’t match any of these antigens. Antibodies are very specific.',
          },
        ],
      },
    },
    goDeeper:
      'Antibodies (immunoglobulins) are made by B cells and plasma cells. Each is built from two heavy and two light chains; the tips of the “Y” (the variable regions) bind an epitope, a small part of an antigen. The stem (Fc region) is recognized by immune cells and complement proteins. Antibodies work by neutralizing (blocking), opsonizing (tagging for phagocytes), and activating complement. Humans have five classes: IgG, IgA, IgM, IgE and IgD.\n\nIn reality, it’s a bit more complicated: binding depends on shape and chemistry together (charges, hydrogen bonds, hydrophobic patches), not just a simple outline. Your body can make billions of different antibodies by shuffling gene segments (V(D)J recombination), and antibodies get better at binding during an infection through affinity maturation.',
    quiz: [
      {
        kind: 'mc',
        prompt: 'Which cells make antibodies?',
        options: ['Red blood cells', 'B cells', 'Platelets', 'Neurons'],
        answer: 1,
        explain: 'B cells (and plasma cells that come from them) make antibodies.',
      },
      {
        kind: 'predict',
        scenario:
          'You had chickenpox as a kid and made anti-chickenpox antibodies. Now you catch the flu.',
        prompt: 'Will your chickenpox antibodies stop the flu?',
        options: [
          'Yes, antibodies fight any germ',
          'No, they only fit chickenpox antigens',
          'Yes, but only if you have a fever',
          'They turn into flu antibodies',
        ],
        answer: 1,
        explain: 'Antibodies are specific to one antigen shape.',
      },
      {
        kind: 'label',
        prompt: 'Match each term to its meaning.',
        pairs: [
          { term: 'Antigen', definition: 'The shape an antibody recognizes' },
          { term: 'Antibody', definition: 'Y-shaped protein that binds one antigen' },
          { term: 'Neutralize', definition: 'Block a germ or toxin from doing harm' },
        ],
        explain: 'Antibodies bind antigens to neutralize and tag them.',
      },
    ],
    relatedConcepts: [],
    funFact:
      'Camels and llamas make unusually tiny antibodies, which scientists now use to build new medicines.',
  },
];
