import type { Concept } from '../../types';

export const physiology: Concept[] = [
  {
    id: 'insulin',
    title: 'How Insulin Works',
    category: 'physiology',
    flagship: true,
    tags: ['hormones', 'blood sugar', 'pancreas', 'diabetes', 'glucose', 'glucagon', 'liver'],
    aliases: [
      'blood sugar regulation',
      'glucose homeostasis',
      'insulin and glucagon',
      'type 1 diabetes',
      'type 2 diabetes',
    ],
    difficulty: 3,
    rarity: 'common',
    summary: 'Insulin is a key that lets sugar out of your blood and into your cells.',
    steps: [
      {
        title: 'Meet the body',
        text: 'Your cells run on glucose, a sugar carried in your blood. Too little or too much is a problem.',
      },
      {
        title: 'Food becomes glucose',
        text: 'Your gut breaks food down into glucose, which enters your blood. Sugary foods get there fastest.',
      },
      {
        title: 'The pancreas notices',
        text: 'Beta cells in the pancreas sense the rising sugar and release insulin into the blood.',
      },
      {
        title: 'Keys unlock doors',
        text: 'Insulin works like a key. It tells muscle and fat cells to open glucose doors, so sugar moves in.',
      },
      {
        title: 'The liver stores extra',
        text: 'Insulin also tells the liver to pack spare glucose away as glycogen, a pantry for later.',
      },
      {
        title: 'Balance restored',
        text: 'As blood sugar falls back to normal, the pancreas slows down. This is negative feedback.',
      },
      {
        title: 'Too low? Glucagon!',
        text: 'If sugar drops too low, alpha cells release glucagon. The liver unpacks glycogen back into the blood.',
      },
      {
        title: 'When it goes wrong',
        text: 'In Type 1 diabetes no insulin is made. In Type 2, cells ignore insulin. Either way, sugar stays high.',
      },
    ],
    interaction: { template: 'flagship', config: { component: 'insulin' } },
    goDeeper:
      'Insulin is a small protein hormone made by beta cells in the islets of Langerhans in the pancreas. When blood glucose rises, glucose enters beta cells, their ATP rises, potassium channels close, the cell depolarizes, calcium floods in, and vesicles of insulin are released.\n\nIn reality, it’s a bit more complicated than a key in a door. Insulin does not plug into the glucose door itself. It binds to an insulin receptor on the cell surface, which sets off a chain of signals inside the cell. Those signals move GLUT4 transporters (the “doors”) from storage bubbles inside the cell up to the membrane. Only muscle and fat cells rely on GLUT4 this way; the brain takes in glucose mostly without insulin, and the liver uses a different transporter (GLUT2), although insulin still tells the liver to store glycogen and stop releasing glucose. Exercise can also move GLUT4 to the surface without insulin, which is why activity helps lower blood sugar.\n\nType 1 diabetes is an autoimmune disease: the immune system destroys beta cells, so people need insulin injections or pumps. Type 2 diabetes starts with insulin resistance (cells respond weakly), and over time the beta cells may struggle to keep up. Above roughly 180 mg/dL the kidneys can no longer reabsorb all filtered glucose, so sugar spills into urine and pulls water with it, causing thirst. Glucagon from alpha cells raises blood sugar by triggering glycogen breakdown and making new glucose (gluconeogenesis).\n\nThe simulation speeds time up (1 second ≈ 3 minutes) and uses simplified numbers. It is for learning, not for medical decisions.',
    quiz: [
      {
        kind: 'mc',
        prompt: 'Which food causes the fastest blood sugar spike?',
        options: ['Steak', 'Salad', 'Soda', 'Oatmeal'],
        answer: 2,
        explain:
          'Liquid sugar needs almost no digestion, so it reaches the blood fastest. Fiber (oatmeal) slows things down; steak and salad barely raise blood sugar.',
      },
      {
        kind: 'mc',
        prompt: 'What does insulin act like?',
        options: [
          'Fuel that cells burn',
          'A key that unlocks cells so glucose can get in',
          'A wall that keeps sugar in the stomach',
          'A sponge that soaks up sugar in the blood',
        ],
        answer: 1,
        explain:
          'Insulin signals cells to open glucose doors (GLUT4), letting sugar leave the blood.',
      },
      {
        kind: 'predict',
        scenario: 'Someone with untreated Type 1 diabetes eats a candy bar.',
        prompt: 'What happens to their blood sugar?',
        options: [
          'It rises and stays high, because no insulin is made',
          'It never rises at all',
          'It rises, then drops back to normal quickly',
          'It falls dangerously low right away',
        ],
        answer: 0,
        explain:
          'Without insulin, glucose can’t get into muscle and fat cells, so it builds up in the blood while the cells go hungry.',
      },
    ],
    relatedConcepts: ['thermoregulation'],
    funFact:
      'Before insulin was discovered in 1921, Type 1 diabetes was almost always fatal. The first patient, 14-year-old Leonard Thompson, was treated in January 1922.',
  },
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
