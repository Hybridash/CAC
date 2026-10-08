import type { Concept } from '../../types';

export const ecology: Concept[] = [
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
