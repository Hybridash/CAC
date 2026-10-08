import type { Concept } from '../../types';

export const evolution: Concept[] = [
  {
    id: 'natural-selection',
    title: 'Natural Selection',
    category: 'evolution',
    flagship: true,
    tags: [
      'evolution',
      'Darwin',
      'peppered moth',
      'camouflage',
      'variation',
      'survival of the fittest',
    ],
    aliases: ['survival of the fittest', 'peppered moths', 'how evolution works', 'Darwin'],
    difficulty: 2,
    rarity: 'common',
    summary: 'Living things that happen to fit their environment survive and pass on their traits.',
    steps: [
      {
        title: 'Everyone is different',
        text: 'Moths in a population vary a little in color, and color is passed from parents to babies.',
      },
      {
        title: 'Predators are picky',
        text: 'Birds eat the moths they can see. Moths that blend in are more likely to survive.',
      },
      {
        title: 'More babies',
        text: 'Survivors have babies that look like them, with tiny random differences.',
      },
      {
        title: 'Generation by generation',
        text: 'Over many generations, the well-camouflaged color becomes more common.',
      },
      {
        title: 'The world changes',
        text: 'When soot darkened English trees in the 1800s, pale moths suddenly stood out.',
      },
      {
        title: 'The population evolves',
        text: 'Dark moths became common. No moth changed itself; the population changed over time.',
      },
    ],
    interaction: { template: 'flagship', config: { component: 'natural-selection' } },
    goDeeper:
      'Natural selection needs three ingredients: variation in a trait, inheritance of that trait, and differences in survival or reproduction linked to the trait. When all three are present, the population’s average trait shifts over generations. The peppered moth (Biston betularia) is a classic example: a dark (carbonaria) form was rare before the Industrial Revolution, became over 90% of moths near Manchester by the late 1800s, and declined again after clean-air laws in the 20th century. In 2016, scientists traced the dark form to a transposon (jumping gene) inserted in the cortex gene.\n\nIn reality, it’s a bit more complicated: in the game, color is a smooth trait that blends, but real moth color is mainly controlled by a few gene versions (alleles) with dominance. Bird predation was confirmed by experiments in the 2000s after earlier studies were criticized, and other factors like migration also affect moth populations. Natural selection doesn’t plan ahead or give organisms what they “need” — it only favors variations that already exist.',
    quiz: [
      {
        kind: 'mc',
        prompt: 'Why did dark moths become common on sooty trees?',
        options: [
          'Moths painted themselves dark',
          'Dark moths were harder for birds to see, so more survived to breed',
          'Soot dyed the moths',
          'Birds preferred eating dark moths',
        ],
        answer: 1,
        explain: 'Camouflaged moths survived more often and passed on their dark color.',
      },
      {
        kind: 'predict',
        scenario: 'Clean-air laws remove the soot, and lichen grows back on the trees.',
        prompt: 'Over many generations, what happens to the moths?',
        options: [
          'They stay mostly dark forever',
          'Pale moths become common again',
          'All moths disappear',
          'Moths turn green',
        ],
        answer: 1,
        explain:
          'Now pale moths are better hidden, so selection favors them again — which really happened in Britain.',
      },
      {
        kind: 'mc',
        prompt: 'Which is NOT needed for natural selection?',
        options: [
          'Variation between individuals',
          'Traits that are inherited',
          'Some individuals surviving better than others',
          'Organisms deciding to change',
        ],
        answer: 3,
        explain: 'Selection acts on existing variation; individuals don’t choose to evolve.',
      },
    ],
    relatedConcepts: ['meiosis', 'mitosis'],
    funFact:
      'In 1848 the first dark peppered moth was recorded in Manchester. By 1895, about 98% of moths there were dark.',
  },
];
