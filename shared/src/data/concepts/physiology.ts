import type { Concept } from '../../types';

export const physiology: Concept[] = [
  {
    id: 'thermoregulation',
    title: 'Thermoregulation',
    category: 'physiology',
    tags: ['body temperature', 'sweat', 'shivering', 'hypothalamus', 'homeostasis', 'fever'],
    aliases: ['temperature control', 'keeping warm', 'staying cool'],
    difficulty: 2,
    rarity: 'common',
    summary: 'Your body has a built-in thermostat that keeps you at about 37 °C, rain or shine.',
    steps: [
      {
        title: 'A thermostat in your brain',
        text: 'A small brain area called the hypothalamus checks your blood temperature all the time.',
      },
      {
        title: 'Too hot?',
        text: 'You sweat, and blood vessels near your skin widen so heat can escape.',
      },
      {
        title: 'Too cold?',
        text: 'You shiver to make heat, and skin blood vessels narrow to keep warmth inside.',
      },
      {
        title: 'Back to normal',
        text: 'Once you are back near 37 °C, the responses switch off. This is called negative feedback.',
      },
    ],
    interaction: {
      template: 'feed-and-observe',
      config: {
        prompt: 'Drag hot and cold things onto the hiker. Watch the body fight to stay near 37 °C.',
        subject: { emoji: '🧍', label: 'Hiker' },
        meters: [
          {
            id: 'temp',
            label: 'Core temperature',
            unit: '°C',
            min: 33,
            max: 42,
            start: 37,
            healthy: [36.3, 37.7],
            color: '#f97316',
          },
        ],
        items: [
          {
            id: 'sun',
            label: 'Desert sun',
            emoji: '☀️',
            note: 'Blazing sun heats the skin and blood.',
            effects: [{ meter: 'temp', amount: 2.4, seconds: 6 }],
          },
          {
            id: 'run',
            label: 'Run a race',
            emoji: '🏃',
            note: 'Working muscles release lots of heat.',
            effects: [{ meter: 'temp', amount: 2, seconds: 5 }],
          },
          {
            id: 'jacket',
            label: 'Warm jacket',
            emoji: '🧥',
            note: 'A jacket traps body heat.',
            effects: [{ meter: 'temp', amount: 0.8, seconds: 4 }],
          },
          {
            id: 'snow',
            label: 'Snowstorm',
            emoji: '🌨️',
            note: 'Freezing wind pulls heat out of the body.',
            effects: [{ meter: 'temp', amount: -2.2, seconds: 5 }],
          },
          {
            id: 'ice',
            label: 'Ice bath',
            emoji: '🧊',
            note: 'Cold water steals heat very fast.',
            effects: [{ meter: 'temp', amount: -2.6, seconds: 4 }],
          },
          {
            id: 'drink',
            label: 'Icy drink',
            emoji: '🥤',
            note: 'A cold drink cools you a little from the inside.',
            effects: [{ meter: 'temp', amount: -0.6, seconds: 3 }],
          },
        ],
        responses: [
          {
            id: 'sweat',
            label: 'Sweating',
            emoji: '💦',
            when: { meter: 'temp', above: 37.4 },
            effect: { meter: 'temp', perSecond: -0.32 },
            message: 'Sweat glands switch on. As sweat evaporates, it carries heat away.',
          },
          {
            id: 'flush',
            label: 'Skin flushing',
            emoji: '😳',
            when: { meter: 'temp', above: 37.8 },
            effect: { meter: 'temp', perSecond: -0.18 },
            message:
              'Blood vessels near the skin widen, so heat leaves through the skin (you look red).',
          },
          {
            id: 'shiver',
            label: 'Shivering',
            emoji: '🥶',
            when: { meter: 'temp', below: 36.6 },
            effect: { meter: 'temp', perSecond: 0.32 },
            message: 'Shivering! Fast little muscle twitches make heat.',
          },
          {
            id: 'narrow',
            label: 'Skin vessels narrow',
            emoji: '🫥',
            when: { meter: 'temp', below: 36.3 },
            effect: { meter: 'temp', perSecond: 0.15 },
            message:
              'Skin blood vessels narrow to keep warm blood deep in your core. Fingers go pale.',
          },
        ],
        modes: [
          {
            id: 'normal',
            label: 'Healthy',
            description: 'A healthy thermostat responds to every change.',
          },
          {
            id: 'broken',
            label: 'Hypothalamus damaged',
            description:
              'With the thermostat damaged, nothing responds. Temperature just drifts. Dangerous!',
            responseScale: { sweat: 0, flush: 0, shiver: 0, narrow: 0 },
          },
          {
            id: 'dehydrated',
            label: 'Dehydrated',
            description: 'Without enough water, you sweat much less, so cooling is weak.',
            responseScale: { sweat: 0.25 },
          },
        ],
        goal: { feeds: 4, tryAllModes: true },
      },
    },
    goDeeper:
      'The hypothalamus compares core temperature to a set point (about 37 °C, varying a little through the day). Heat loss happens through evaporation (sweat), radiation and conduction from warm skin (helped by vasodilation), and convection. Heat gain comes from shivering thermogenesis, non-shivering thermogenesis in brown fat, and vasoconstriction to reduce loss.\n\nIn reality, it’s a bit more complicated: in the interaction, temperatures change in seconds, but real core temperature changes over minutes to hours, and an ice bath could not lower it by 2.6 °C almost instantly. A fever is different from overheating: during a fever the hypothalamus deliberately raises its set point, which is why you shiver while your temperature climbs.',
    quiz: [
      {
        kind: 'mc',
        prompt: 'Which part of the body acts as the temperature “thermostat”?',
        options: ['The heart', 'The hypothalamus', 'The stomach', 'The lungs'],
        answer: 1,
        explain:
          'The hypothalamus, deep in the brain, senses blood temperature and triggers responses.',
      },
      {
        kind: 'predict',
        scenario: 'A runner is overheating on a hot day and has not drunk water for hours.',
        prompt: 'What makes it harder for them to cool down?',
        options: [
          'They will shiver too much',
          'They can sweat less, so less heat is carried away',
          'Their hypothalamus switches off',
          'Their skin blood vessels narrow',
        ],
        answer: 1,
        explain: 'Dehydration reduces sweating, the body’s strongest cooling tool.',
      },
      {
        kind: 'label',
        prompt: 'Match each response to what it does.',
        pairs: [
          { term: 'Sweating', definition: 'Evaporation carries heat away' },
          { term: 'Shivering', definition: 'Muscle twitches make heat' },
          { term: 'Vasoconstriction', definition: 'Skin vessels narrow to keep heat in' },
        ],
        explain:
          'Sweating and flushing lose heat; shivering and vasoconstriction keep or make heat.',
      },
    ],
    relatedConcepts: [],
    funFact:
      'Your temperature is lowest around 4–5 a.m. and highest in the late afternoon, about a 0.5 °C swing each day.',
  },
];
