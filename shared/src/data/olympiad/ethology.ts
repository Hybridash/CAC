import type { OlyQuestion } from '../../olympiad';

/** Animal Behavior (ethology). Original questions. */
export const ETHOLOGY: OlyQuestion[] = [
  {
    id: 'ethology-1',
    topic: 'ethology',
    level: 1,
    skill: 'recall',
    format: 'single',
    stem: 'Ducklings hatched in an incubator follow the first large moving object they see during their first day or two, even a wheeled toy, and keep following it. What kind of learning is this?',
    options: [
      'Classical conditioning',
      'Operant conditioning',
      'Habituation',
      'Imprinting',
      'Insight learning',
    ],
    answer: 3,
    explain:
      'Imprinting is learning that happens only during a short sensitive (critical) period early in life and is hard to reverse. Normally the first moving object is the mother, so following it is adaptive.',
  },
  {
    id: 'ethology-2',
    topic: 'ethology',
    level: 1,
    skill: 'reasoning',
    format: 'single',
    stem: 'A sea slug withdraws its gill when its siphon is touched. After being touched gently many times with no harm following, it stops withdrawing, but it still withdraws normally if a different part of its body is touched. What is this?',
    options: [
      'Habituation',
      'Sensitization',
      'Muscle fatigue',
      'Imprinting',
      'Operant conditioning',
    ],
    answer: 0,
    explain:
      'Habituation is a decreasing response to a repeated, harmless stimulus. It is not fatigue: the gill muscles still work, as shown by the normal response to a new stimulus. Sensitization would be the opposite, an increased response after a strong or harmful stimulus.',
  },
  {
    id: 'ethology-3',
    topic: 'ethology',
    level: 2,
    skill: 'reasoning',
    format: 'single',
    stem: 'According to Hamilton’s rule (rB > C), when should a gene for helping a full sibling at a cost C to oneself spread, if the sibling gains a reproductive benefit B?',
    options: ['When B > C/2', 'When B > C', 'When B > 2C', 'When B > 4C', 'When B > 8C'],
    answer: 2,
    explain:
      'Full siblings share on average half of their genes by descent (r = 0.5). The rule becomes 0.5 × B > C, so B > 2C. For a cousin (r = 0.125) the benefit would have to be more than 8 times the cost.',
  },
  {
    id: 'ethology-4',
    topic: 'ethology',
    level: 2,
    skill: 'reasoning',
    format: 'single',
    stem: 'Inside a dark hive, a honeybee performs a waggle dance whose straight run points straight UP the vertical comb. Where is the food source?',
    options: [
      'Directly above the hive',
      'In the direction of the sun',
      'Directly away from the sun',
      'At 90° to the left of the sun',
      'Very close to the hive, in any direction',
    ],
    answer: 1,
    explain:
      'Bees translate the angle between the food and the sun into the angle between the waggle run and vertical (straight up = toward the sun). The duration of the waggle run indicates distance. Very close food is signalled by a round dance without direction.',
  },
  {
    id: 'ethology-5',
    topic: 'ethology',
    level: 2,
    skill: 'reasoning',
    format: 'single',
    stem: 'A male fish defending its territory attacks crude wooden models with a red underside but ignores a lifelike model of a male without red. Once an attack starts, it is completed even if the model is removed. Which pair of terms describes this?',
    options: [
      'A sign stimulus releasing a fixed action pattern',
      'Operant conditioning producing a learned response',
      'Habituation to a supernormal stimulus',
      'Imprinting on a mating partner',
      'Reciprocal altruism toward a rival',
    ],
    answer: 0,
    explain:
      'A simple cue (the red belly) acts as a sign stimulus that triggers an innate, stereotyped sequence (a fixed action pattern). Once begun, the sequence runs to completion. The response does not need learning and ignores the rest of the model’s appearance.',
  },
  {
    id: 'ethology-6',
    topic: 'ethology',
    level: 2,
    skill: 'data',
    format: 'single',
    stem: 'A crab feeding on mussels is offered mussels of different sizes. Assuming the crab maximizes energy gained per second of handling time, which size should it prefer?',
    table: {
      caption: 'Energy content and handling time of mussels',
      columns: ['Mussel size', 'Energy (J)', 'Handling time (s)'],
      rows: [
        ['Small', 100, 20],
        ['Medium', 300, 40],
        ['Large', 500, 125],
        ['Very large', 800, 400],
      ],
    },
    options: ['Small', 'Medium', 'Large', 'Very large', 'It should take sizes at random'],
    answer: 1,
    explain:
      'Energy per second: small 5 J/s, medium 7.5 J/s, large 4 J/s, very large 2 J/s. Optimal foraging theory predicts a preference for the medium mussels, even though large ones contain more energy, because large shells take much longer to open.',
  },
  {
    id: 'ethology-7',
    topic: 'ethology',
    level: 3,
    skill: 'recall',
    format: 'truefalse',
    stem: 'Judge each statement about animal behavior.',
    statements: [
      {
        text: 'In operant conditioning, an animal associates its own behavior with a consequence.',
        answer: true,
      },
      {
        text: 'In classical conditioning, the conditioned stimulus produces the response even before any training.',
        answer: false,
      },
      {
        text: 'Helping unrelated individuals can evolve if the same individuals interact repeatedly and help is returned.',
        answer: true,
      },
      { text: 'Sexual selection can never favor a trait that reduces survival.', answer: false },
    ],
    explain:
      'Operant conditioning links an action to a reward or punishment. In classical conditioning the conditioned stimulus (a bell) is at first neutral; it only triggers the response after being paired with an unconditioned stimulus (food). Reciprocal altruism can evolve among non-relatives who meet repeatedly. Sexual selection often favors costly traits, such as a peacock’s tail, if they raise mating success enough.',
  },
];
