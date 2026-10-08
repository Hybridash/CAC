import type { Concept } from '../../types';

export const biochem: Concept[] = [
  {
    id: 'enzymes',
    title: 'Enzymes & Activation Energy',
    category: 'biochem',
    tags: ['catalyst', 'active site', 'temperature', 'pH', 'denature', 'reaction rate'],
    aliases: ['how enzymes work', 'biological catalysts', 'activation energy'],
    difficulty: 2,
    rarity: 'common',
    summary: 'Enzymes are tiny machines that make reactions happen millions of times faster.',
    steps: [
      {
        title: 'The energy hill',
        text: 'Every reaction needs a push to get started, called activation energy.',
      },
      {
        title: 'A shortcut',
        text: 'Enzymes lower that hill, so reactions happen fast even at body temperature.',
      },
      {
        title: 'Warmer is faster… to a point',
        text: 'Heat speeds molecules up, but too much heat bends the enzyme out of shape.',
      },
      {
        title: 'Shape is everything',
        text: 'Wrong pH or high heat can denature an enzyme. Its active site no longer fits, so it stops working.',
      },
    ],
    interaction: {
      template: 'slider-sim',
      config: {
        prompt: 'Adjust temperature and pH to see how fast this human enzyme works.',
        inputs: [
          { id: 'temp', label: 'Temperature', unit: '°C', min: 0, max: 70, step: 1, start: 20 },
          { id: 'ph', label: 'pH', min: 1, max: 13, step: 0.1, start: 7 },
        ],
        output: {
          label: 'Reaction rate',
          unit: '%',
          max: 100,
          expr: '104 * exp((temp - 37) / 20) * (1 - sig(temp, 45, 2.5)) * gauss(ph, 7.4, 1.6)',
        },
        readouts: [
          { label: 'Enzymes not heat-damaged', unit: '%', expr: '100 * (1 - sig(temp, 45, 2.5))' },
        ],
        graphInput: 'temp',
        visual: { kind: 'particles', emoji: '✂️' },
        challenges: [
          {
            prompt: 'Find the temperature where the enzyme works fastest (over 90%).',
            target: { min: 90 },
            explain: 'Human enzymes usually work best near body temperature, about 37–40 °C.',
          },
          {
            prompt:
              'Make the enzyme almost stop working (under 10%). Hint: cold alone won’t do it — try heat!',
            target: { max: 10 },
            explain:
              'Denatured! Too much heat (or extreme pH) unravels the enzyme’s shape, so the active site no longer fits.',
          },
          {
            prompt:
              'Cool back to 37 °C, then change the pH until the rate drops to about half (40–60%).',
            target: { min: 40, max: 60 },
            explain:
              'Acid or base changes the charges in the active site, so fewer molecules fit and react.',
          },
        ],
      },
    },
    goDeeper:
      'Enzymes are biological catalysts, usually proteins. They bind substrates in an active site and stabilize the transition state, lowering the activation energy (ΔG‡) without changing the overall energy difference between reactants and products. Rates follow Michaelis–Menten kinetics: they rise with substrate concentration and level off when every enzyme is busy (Vmax).\n\nIn reality, it’s a bit more complicated: the “lock and key” picture is a simplification; most enzymes change shape slightly when the substrate binds (induced fit). Optimal conditions differ a lot: pepsin in the stomach works best near pH 2, and enzymes from hot-spring microbes (like Taq polymerase) work above 70 °C. Cold slows enzymes because molecules move and collide less, but it doesn’t destroy them: warming them up brings activity back, unlike denaturing.',
    quiz: [
      {
        kind: 'mc',
        prompt: 'What does an enzyme lower?',
        options: ['The temperature', 'The activation energy', 'The amount of product', 'The pH'],
        answer: 1,
        explain: 'Enzymes lower the activation energy “hill”, so reactions start more easily.',
      },
      {
        kind: 'predict',
        scenario: 'You boil an enzyme solution for 10 minutes, then cool it back to 37 °C.',
        prompt: 'How fast will the enzyme work now?',
        options: [
          'Faster than before',
          'The same as before',
          'Barely at all — it was denatured',
          'It works only at high pH',
        ],
        answer: 2,
        explain: 'Boiling unfolds the enzyme; for most enzymes this damage is permanent.',
      },
      {
        kind: 'label',
        prompt: 'Match each term to its meaning.',
        pairs: [
          { term: 'Active site', definition: 'The pocket where the substrate binds' },
          { term: 'Substrate', definition: 'The molecule the enzyme works on' },
          { term: 'Denature', definition: 'Lose shape and stop working' },
        ],
        explain: 'Enzyme function depends on its 3D shape.',
      },
    ],
    relatedConcepts: ['digestion'],
    funFact:
      'Carbonic anhydrase, in your red blood cells, can handle about a million reactions per second.',
  },
];
