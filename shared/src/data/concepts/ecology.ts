import type { Concept } from '../../types';

export const ecology: Concept[] = [
  {
    id: 'food-chains',
    title: 'Food Chains & Webs',
    category: 'ecology',
    flagship: true,
    tags: ['producers', 'consumers', 'decomposers', 'energy flow', 'predators', 'herbivores'],
    aliases: ['food web', 'who eats who', 'producer consumer decomposer', 'trophic levels'],
    difficulty: 1,
    rarity: 'common',
    summary: 'Every living thing needs energy, and it all starts with the sun.',
    steps: [
      {
        title: 'Everyone needs energy',
        text: 'Living things need energy to move, grow and stay warm.',
      },
      {
        title: 'Producers',
        text: 'Plants are producers: they make their own food using sunlight.',
      },
      {
        title: 'Consumers',
        text: 'Animals are consumers: they get energy by eating plants or other animals.',
      },
      {
        title: 'Follow the arrows',
        text: 'Arrows in a food chain point from the thing that is eaten to the thing that eats it.',
      },
      {
        title: 'Energy gets lost',
        text: 'Only about 10% of energy passes up each step. The rest is used up or lost as heat.',
      },
      {
        title: 'Ripple effects',
        text: 'Remove one link and the effects ripple up and down the chain.',
      },
      {
        title: 'Recyclers',
        text: 'Decomposers like fungi and bacteria break down dead things and return nutrients to the soil.',
      },
    ],
    interaction: { template: 'flagship', config: { component: 'food-chains' } },
    goDeeper:
      'Organisms are grouped into trophic levels: producers (autotrophs), primary consumers (herbivores), secondary and tertiary consumers (carnivores and omnivores), and decomposers/detritivores, which process dead matter from every level. Because organisms use most of the energy they take in for respiration, movement and heat, only around 10% (often 5–20%) of energy is passed on as new biomass to the next level. This is why food chains rarely have more than 4–5 links, and why top predators are scarce.\n\nIn reality, it’s a bit more complicated: real ecosystems are food webs, not single chains. Frogs eat many insects, snakes eat mice as well as frogs, and hawks eat many prey. In a web, removing one species often has smaller or more surprising effects than in a single chain, because other links can take up the slack — or, as with keystone species, the effects can be bigger than expected.',
    quiz: [
      {
        kind: 'mc',
        prompt: 'In a food chain, what does an arrow mean?',
        options: [
          '“is bigger than”',
          '“is eaten by” (energy flows this way)',
          '“lives near”',
          '“is the parent of”',
        ],
        answer: 1,
        explain: 'Arrows point in the direction energy flows: from the food to the eater.',
      },
      {
        kind: 'predict',
        scenario: 'All the frogs in a meadow die from a disease.',
        prompt: 'What happens to the grasshoppers?',
        options: [
          'They decrease',
          'They increase, because fewer are eaten',
          'Nothing',
          'They turn into frogs',
        ],
        answer: 1,
        explain: 'With fewer predators, grasshopper numbers rise — and they eat more grass.',
      },
      {
        kind: 'label',
        prompt: 'Match each role to an example.',
        pairs: [
          { term: 'Producer', definition: 'Grass' },
          { term: 'Consumer', definition: 'Frog' },
          { term: 'Decomposer', definition: 'Mushroom' },
        ],
        explain: 'Producers make food, consumers eat, decomposers recycle.',
      },
    ],
    relatedConcepts: ['predator-prey'],
    funFact:
      'A single hawk might depend on millions of grass plants to support the food chain beneath it.',
  },
  {
    id: 'predator-prey',
    title: 'Predator–Prey Cycles',
    category: 'ecology',
    tags: ['populations', 'lynx', 'hare', 'Lotka-Volterra', 'food web', 'cycles'],
    aliases: ['lynx and hare', 'population cycles', 'boom and bust'],
    difficulty: 3,
    rarity: 'common',
    summary: 'More rabbits mean more foxes… which means fewer rabbits… which means fewer foxes.',
    steps: [
      {
        title: 'Plenty of food',
        text: 'When prey are common, predators eat well and raise more young.',
      },
      {
        title: 'Too many hunters',
        text: 'As predators multiply, they eat prey faster than prey can replace themselves.',
      },
      {
        title: 'The crash',
        text: 'Prey numbers fall, then predators starve, and their numbers fall too.',
      },
      {
        title: 'Round again',
        text: 'With few predators left, prey bounce back and the cycle repeats. Predator peaks lag behind prey peaks.',
      },
    ],
    interaction: {
      template: 'ecosystem',
      config: {
        prompt:
          'Watch the hares and lynx rise and fall. Then remove the lynx and see what the hares do.',
        species: [
          {
            id: 'hare',
            label: 'Hares',
            emoji: '🐇',
            color: '#b45309',
            start: 60,
            growth: 1,
            capacity: 1300,
          },
          {
            id: 'lynx',
            label: 'Lynx',
            emoji: '🐈',
            color: '#7c3aed',
            start: 10,
            death: 0.6,
            eats: [{ id: 'hare', rate: 0.02, efficiency: 0.3 }],
          },
        ],
        toggleable: ['lynx'],
        speed: 20,
        goal: { steps: 250, mustToggle: 'lynx' },
        insight:
          'Predator peaks follow prey peaks. Without predators, hares boom until food (the carrying capacity) limits them.',
      },
    },
    goDeeper:
      'The classic example is the Canada lynx and snowshoe hare: Hudson’s Bay Company fur records show roughly 10-year cycles in both. The Lotka–Volterra equations model this: prey grow on their own and are eaten in proportion to how often they meet predators; predators grow from what they eat and die off otherwise. The simulation uses this model with a carrying capacity for hares.\n\nIn reality, it’s a bit more complicated: hare cycles also depend on food quality, stress hormones that reduce breeding when predators are common, and other predators like owls and coyotes. Real populations are noisy, and very small populations can go extinct by chance instead of bouncing back.',
    quiz: [
      {
        kind: 'mc',
        prompt: 'In a predator–prey cycle, when does the predator population usually peak?',
        options: [
          'Before the prey peak',
          'Shortly after the prey peak',
          'At exactly the same time',
          'Never',
        ],
        answer: 1,
        explain:
          'Predators need time to breed after food becomes plentiful, so their peak lags behind.',
      },
      {
        kind: 'predict',
        scenario: 'All the lynx are removed from a forest full of hares.',
        prompt: 'What happens to the hares over the next few years?',
        options: [
          'They go extinct',
          'They boom, until food runs short',
          'They stay exactly the same',
          'They turn into predators',
        ],
        answer: 1,
        explain: 'Without predators, hares grow until their food supply limits them.',
      },
      {
        kind: 'mc',
        prompt: 'Why do predator numbers fall after prey numbers crash?',
        options: [
          'They migrate to the ocean',
          'They don’t have enough food to survive and breed',
          'Prey start eating them',
          'Predators live only one year',
        ],
        answer: 1,
        explain: 'Fewer prey means less food, so fewer predators survive and raise young.',
      },
    ],
    relatedConcepts: [],
    funFact:
      'Snowshoe hares turn white in winter — but with shorter snow seasons, brown-coated hares on white snow are now easy targets.',
  },
];
