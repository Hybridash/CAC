import type { Concept } from '../../types';

export const neuro: Concept[] = [
  {
    id: 'action-potential',
    title: 'Neurons & Action Potentials',
    category: 'neuro',
    flagship: true,
    tags: ['neurons', 'nerve impulse', 'sodium', 'potassium', 'myelin', 'threshold', 'voltage'],
    aliases: ['nerve signals', 'how nerves work', 'nerve impulse', 'spike', 'all or none'],
    difficulty: 3,
    rarity: 'common',
    summary: 'Neurons send messages as tiny electric spikes that are all-or-nothing.',
    steps: [
      {
        title: 'A charged cell',
        text: 'A resting neuron is slightly negative inside: about −70 millivolts (mV).',
      },
      {
        title: 'A small push',
        text: 'Signals from other cells nudge the voltage up. Small nudges just fade away.',
      },
      {
        title: 'Threshold!',
        text: 'If the voltage reaches about −55 mV, sodium channels open and Na⁺ floods in. The inside turns positive.',
      },
      {
        title: 'Reset',
        text: 'Then sodium channels close and potassium channels open. K⁺ rushes out and the voltage drops back.',
      },
      {
        title: 'Can’t fire yet',
        text: 'It briefly dips below −70 mV. During this refractory period, the neuron can’t fire again.',
      },
      {
        title: 'Down the wire',
        text: 'Each patch of axon triggers the next, so the spike travels to the end and releases chemical messengers.',
      },
      {
        title: 'Speed and sabotage',
        text: 'Myelin insulation makes the spike jump gap to gap. Toxins that block sodium channels stop it completely.',
      },
    ],
    interaction: { template: 'flagship', config: { component: 'action-potential' } },
    goDeeper:
      'The resting potential (about −70 mV) comes from the sodium–potassium pump (3 Na⁺ out, 2 K⁺ in per ATP) and from the membrane being more permeable to K⁺ than Na⁺ at rest. When a stimulus depolarizes the axon hillock to threshold, voltage-gated Na⁺ channels open in a positive-feedback loop, driving the membrane toward the sodium equilibrium potential (about +40 to +60 mV). Within about a millisecond, Na⁺ channels inactivate and slower voltage-gated K⁺ channels open, repolarizing the cell and causing a brief hyperpolarization. The absolute refractory period (Na⁺ channels inactivated) makes spikes travel one way.\n\nIn reality, it’s a bit more complicated: only a tiny fraction of ions actually cross the membrane during one spike — the concentrations barely change, and the pump restores them over time. In myelinated axons, spikes regenerate only at the nodes of Ranvier (saltatory conduction), reaching speeds over 100 m/s, versus about 1 m/s in thin unmyelinated fibers. Tetrodotoxin (TTX) from pufferfish blocks voltage-gated Na⁺ channels; local anesthetics like lidocaine block them too, which is how they stop pain signals. In the simulation, “zap strength” is a stand-in for the summed input a neuron receives from many synapses.',
    quiz: [
      {
        kind: 'mc',
        prompt: 'What happens when a neuron reaches threshold?',
        options: [
          'Potassium floods in',
          'Sodium channels open and Na⁺ rushes in',
          'The neuron shuts down',
          'The cell divides',
        ],
        answer: 1,
        explain: 'At about −55 mV, voltage-gated Na⁺ channels open and positive ions rush in.',
      },
      {
        kind: 'predict',
        scenario:
          'You zap a resting neuron twice: once at exactly threshold, and once three times harder.',
        prompt: 'How do the two spikes compare?',
        options: [
          'The harder zap makes a spike 3× taller',
          'Both spikes are the same height',
          'Only the weak zap fires',
          'The hard zap makes the neuron negative',
        ],
        answer: 1,
        explain:
          'Action potentials are all-or-none. Stronger stimuli make neurons fire more often, not make bigger spikes.',
      },
      {
        kind: 'label',
        prompt: 'Match each part to its job.',
        pairs: [
          { term: 'Na⁺ channels', definition: 'Let sodium in to make the inside positive' },
          { term: 'K⁺ channels', definition: 'Let potassium out to reset the voltage' },
          { term: 'Myelin', definition: 'Insulation that makes signals jump faster' },
        ],
        explain: 'Sodium in, potassium out, and myelin for speed.',
      },
    ],
    relatedConcepts: [],
    funFact: 'The fastest nerve signals in your body travel at about 120 m/s — over 400 km/h.',
  },
];
