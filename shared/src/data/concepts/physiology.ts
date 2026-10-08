import type { Concept } from '../../types';

export const physiology: Concept[] = [
  {
    id: 'digestion',
    title: 'Digestion',
    category: 'physiology',
    tags: ['stomach', 'intestines', 'enzymes', 'food', 'nutrients', 'gut'],
    aliases: ['digestive system', 'how food is broken down', 'alimentary canal'],
    difficulty: 1,
    rarity: 'common',
    summary: 'Your body is a food-processing tube about 9 meters long.',
    steps: [
      { title: 'Chop and soak', text: 'Teeth crush food and saliva starts breaking down starch.' },
      {
        title: 'Acid bath',
        text: 'The stomach churns food with strong acid and enzymes into a soupy mix.',
      },
      {
        title: 'Absorb',
        text: 'The small intestine finishes digestion and soaks nutrients into the blood.',
      },
      {
        title: 'Water and waste',
        text: 'The large intestine takes back water. What is left leaves as waste.',
      },
    ],
    interaction: {
      template: 'assembly-line',
      config: {
        prompt:
          'Build the digestive tract: drag each organ into the order food travels through it.',
        layout: 'line',
        parts: [
          {
            id: 'mouth',
            label: 'Mouth',
            emoji: '👄',
            description: 'Teeth chew; saliva’s amylase starts digesting starch.',
          },
          {
            id: 'esophagus',
            label: 'Esophagus',
            emoji: '⬇️',
            description: 'A muscular tube that squeezes food down in waves (peristalsis).',
          },
          {
            id: 'stomach',
            label: 'Stomach',
            emoji: '🫃',
            description: 'Acid and pepsin start breaking proteins apart while muscles churn.',
          },
          {
            id: 'small',
            label: 'Small intestine',
            emoji: '🌀',
            description:
              'Most digestion and nutrient absorption happens here, across millions of tiny villi.',
          },
          {
            id: 'large',
            label: 'Large intestine',
            emoji: '💧',
            description: 'Reabsorbs water; trillions of gut bacteria ferment leftover fiber.',
          },
          {
            id: 'rectum',
            label: 'Rectum',
            emoji: '🚽',
            description: 'Stores waste until it leaves the body.',
          },
        ],
        distractors: [
          {
            id: 'lungs',
            label: 'Lungs',
            emoji: '🫁',
            description:
              'Lungs are for breathing — food never goes there (that’s why choking is dangerous).',
          },
        ],
        successMessage: 'Complete! Food’s journey takes roughly 1–3 days from mouth to exit.',
      },
    },
    goDeeper:
      'Digestion is both mechanical (chewing, churning) and chemical (enzymes). Salivary amylase begins starch digestion; pepsin in the acidic stomach starts protein digestion; the pancreas releases enzymes (amylase, lipase, proteases) and bicarbonate into the small intestine, and bile from the liver emulsifies fats. Nutrients cross the intestinal lining through villi and microvilli, which give the small intestine a surface area of roughly 30 square meters.\n\nIn reality, it’s a bit more complicated: the liver, gallbladder and pancreas are accessory organs that food never passes through, but digestion could not happen without them. The “9 meters” figure is for a relaxed tract; in a living person muscle tone makes it shorter.',
    quiz: [
      {
        kind: 'mc',
        prompt: 'Where are most nutrients absorbed into the blood?',
        options: ['Stomach', 'Small intestine', 'Large intestine', 'Esophagus'],
        answer: 1,
        explain: 'The small intestine’s villi give it a huge surface for absorbing nutrients.',
      },
      {
        kind: 'predict',
        scenario:
          'A disease flattens the villi lining the small intestine (this happens in celiac disease).',
        prompt: 'What is the most likely effect?',
        options: [
          'Food moves faster down the esophagus',
          'Fewer nutrients are absorbed',
          'The stomach makes no acid',
          'Breathing becomes harder',
        ],
        answer: 1,
        explain: 'Flattened villi mean far less surface area, so nutrients are absorbed poorly.',
      },
      {
        kind: 'label',
        prompt: 'Match each organ to its main job.',
        pairs: [
          { term: 'Stomach', definition: 'Acid and churning break food into a soupy mix' },
          { term: 'Small intestine', definition: 'Absorbs most nutrients' },
          { term: 'Large intestine', definition: 'Takes back water' },
        ],
        explain: 'Each section of the tube has a specialty.',
      },
    ],
    relatedConcepts: ['insulin'],
    funFact:
      'Your stomach lining replaces itself every few days so its own acid doesn’t digest it.',
  },
  {
    id: 'kidneys',
    title: 'Kidneys & Filtration',
    category: 'physiology',
    tags: ['urine', 'nephron', 'filtration', 'blood', 'water balance', 'excretion'],
    aliases: ['kidney function', 'nephrons', 'how pee is made', 'renal system'],
    difficulty: 3,
    rarity: 'common',
    summary:
      'Your kidneys filter all of your blood dozens of times a day — and keep almost all of it.',
    steps: [
      {
        title: 'Two bean-shaped filters',
        text: 'Kidneys sit near your lower back and get about a fifth of the blood your heart pumps.',
      },
      {
        title: 'A million tiny units',
        text: 'Each kidney holds about a million nephrons, the actual filtering machines.',
      },
      {
        title: 'Filter first, sort later',
        text: 'Blood is pushed through a tiny filter. Then useful things like sugar and water are taken back.',
      },
      {
        title: 'What is left becomes urine',
        text: 'Extra water, salts and wastes like urea drain to the bladder.',
      },
    ],
    interaction: {
      template: 'zoom-explorer',
      config: {
        prompt: 'Zoom from the whole body down into a single filter. Tap the glowing hotspots.',
        levels: [
          {
            id: 'body',
            label: 'Body',
            scale: '1 m',
            background: '#fff1f2',
            description: 'The urinary system: two kidneys, two ureters, a bladder.',
            elements: [
              { id: 'person', emoji: '🧍', x: 50, y: 50, size: 6, opacity: 0.3 },
              { id: 'k1', shape: 'bean', color: '#9f1239', x: 47, y: 47, size: 0.55, rotate: 90 },
              { id: 'k2', shape: 'bean', color: '#9f1239', x: 53, y: 47, size: 0.55, rotate: 90 },
              {
                id: 'bladder',
                shape: 'drop',
                color: '#fde047',
                x: 50,
                y: 62,
                size: 0.5,
                rotate: 180,
              },
            ],
            hotspots: [
              {
                id: 'kid',
                x: 64,
                y: 44,
                label: 'Kidney',
                text: 'Fist-sized organs that filter about 180 liters of blood plasma a day.',
                zoomTo: 'kidney',
              },
              {
                id: 'bl',
                x: 36,
                y: 64,
                label: 'Bladder',
                text: 'A stretchy bag that stores urine; it can hold about half a liter.',
              },
            ],
          },
          {
            id: 'kidney',
            label: 'Kidney',
            scale: '12 cm',
            background: '#ffe4e6',
            description:
              'A kidney sliced in half: outer cortex, inner medulla, and a collecting area.',
            elements: [
              { id: 'k1', shape: 'bean', color: '#be123c', x: 50, y: 50, size: 6, rotate: 90 },
              { id: 'artery', shape: 'rod', color: '#dc2626', x: 22, y: 45, size: 1.4 },
              { id: 'ureter', shape: 'rod', color: '#facc15', x: 30, y: 62, size: 1.2, rotate: 30 },
            ],
            hotspots: [
              {
                id: 'cortex',
                x: 64,
                y: 30,
                label: 'Cortex',
                text: 'The outer layer, packed with the filtering ends of nephrons.',
                zoomTo: 'nephron',
              },
              {
                id: 'art',
                x: 18,
                y: 36,
                label: 'Renal artery',
                text: 'Brings blood in at high pressure — about 1.2 liters every minute.',
              },
              {
                id: 'ur',
                x: 28,
                y: 74,
                label: 'Ureter',
                text: 'Carries urine down to the bladder.',
              },
            ],
          },
          {
            id: 'nephron',
            label: 'Nephron',
            scale: '3 cm long',
            background: '#fef3c7',
            description: 'One nephron: a filter (glomerulus) attached to a long twisting tube.',
            elements: [
              { id: 'glom', shape: 'blob', color: '#ef4444', x: 22, y: 30, size: 1.6 },
              { id: 'tube', shape: 'wave', color: '#f59e0b', x: 50, y: 35, size: 3 },
              { id: 'loop', shape: 'rod', color: '#f59e0b', x: 72, y: 62, size: 2.2, rotate: 90 },
              { id: 'collect', shape: 'rod', color: '#eab308', x: 88, y: 55, size: 3, rotate: 90 },
            ],
            hotspots: [
              {
                id: 'gl',
                x: 22,
                y: 18,
                label: 'Glomerulus',
                text: 'A ball of leaky capillaries where filtering happens.',
                zoomTo: 'filter',
              },
              {
                id: 'tub',
                x: 50,
                y: 22,
                label: 'Tubule',
                text: 'Takes back nearly all the glucose, most salt, and most water from the filtered fluid.',
              },
              {
                id: 'lp',
                x: 66,
                y: 82,
                label: 'Loop of Henle',
                text: 'Builds a salty gradient so the kidney can make concentrated urine and save water.',
              },
            ],
          },
          {
            id: 'filter',
            label: 'Filter',
            scale: '0.2 mm',
            background: '#e0f2fe',
            description:
              'Inside the glomerulus: small molecules squeeze through; big ones stay in the blood.',
            elements: [
              {
                id: 'wall',
                shape: 'rect',
                color: '#93c5fd',
                x: 50,
                y: 50,
                size: 1.2,
                opacity: 0.7,
              },
              {
                id: 'rbc',
                shape: 'circle',
                color: '#ef4444',
                x: 25,
                y: 35,
                size: 1.2,
                label: 'red blood cell',
              },
              {
                id: 'prot',
                shape: 'blob',
                color: '#a855f7',
                x: 25,
                y: 68,
                size: 1,
                label: 'protein',
              },
              {
                id: 'water',
                shape: 'drop',
                color: '#38bdf8',
                x: 75,
                y: 30,
                size: 0.6,
                label: 'water',
              },
              {
                id: 'glu',
                shape: 'star',
                color: '#fbbf24',
                x: 75,
                y: 52,
                size: 0.5,
                label: 'glucose',
              },
              {
                id: 'urea',
                shape: 'triangle',
                color: '#84cc16',
                x: 75,
                y: 74,
                size: 0.5,
                label: 'urea',
              },
            ],
            hotspots: [
              {
                id: 'big',
                x: 25,
                y: 52,
                label: 'Too big',
                text: 'Cells and proteins are too large to pass. Protein in urine can be a sign of kidney damage.',
              },
              {
                id: 'small',
                x: 75,
                y: 88,
                label: 'Small enough',
                text: 'Water, glucose, salts and urea pass into the tubule. The tubule then reclaims what the body needs.',
              },
            ],
          },
        ],
      },
    },
    goDeeper:
      'Each kidney contains roughly a million nephrons. Blood pressure pushes plasma through the glomerular capillaries into Bowman’s capsule, forming about 180 liters of filtrate per day, of which only around 1–2 liters end up as urine. The proximal tubule reabsorbs essentially all glucose and amino acids and about two-thirds of salt and water; the loop of Henle creates a concentration gradient in the medulla (countercurrent multiplication); and hormones such as ADH (antidiuretic hormone) and aldosterone fine-tune water and sodium in the collecting duct.\n\nIn reality, it’s a bit more complicated: the glomerular filter separates mainly by size and electric charge, and tubules also actively secrete some substances (like certain drugs and hydrogen ions) into the urine rather than only filtering. Kidneys also make hormones, including erythropoietin (which tells bone marrow to make red blood cells) and the active form of vitamin D.',
    quiz: [
      {
        kind: 'mc',
        prompt: 'What is the kidney’s basic filtering unit called?',
        options: ['Neuron', 'Nephron', 'Alveolus', 'Villus'],
        answer: 1,
        explain: 'Each kidney holds about a million nephrons.',
      },
      {
        kind: 'predict',
        scenario: 'Blood sugar is so high that the tubules can’t take all the glucose back.',
        prompt: 'What shows up?',
        options: [
          'Glucose in the urine',
          'Red blood cells in the urine',
          'Less urine than normal',
          'No change',
        ],
        answer: 0,
        explain:
          'When glucose exceeds what the tubules can reclaim (around 180 mg/dL in blood), it spills into urine — a classic sign of diabetes.',
      },
      {
        kind: 'mc',
        prompt: 'Why don’t red blood cells normally end up in urine?',
        options: [
          'They are too big to pass the filter',
          'They dissolve in the kidney',
          'The bladder eats them',
          'They are reabsorbed by the ureter',
        ],
        answer: 0,
        explain: 'The glomerular filter holds back cells and large proteins.',
      },
    ],
    relatedConcepts: ['insulin', 'thermoregulation'],
    funFact: 'Your kidneys filter your entire blood plasma about 60 times a day.',
  },
  {
    id: 'blood-clotting',
    title: 'The Blood Clotting Cascade',
    category: 'physiology',
    tags: ['platelets', 'fibrin', 'thrombin', 'hemophilia', 'scab', 'coagulation'],
    aliases: ['coagulation cascade', 'how blood clots', 'scabs', 'hemostasis'],
    difficulty: 4,
    rarity: 'common',
    summary:
      'A cut starts a chain reaction where each step switches on the next, ending in a sticky net.',
    steps: [
      {
        title: 'Ouch!',
        text: 'A cut breaks a blood vessel and exposes material under its lining.',
      },
      {
        title: 'Platelet plug',
        text: 'Platelets stick to the damage and to each other, forming a quick, loose plug.',
      },
      {
        title: 'The cascade',
        text: 'Clotting factors switch each other on, one after another, multiplying the signal.',
      },
      {
        title: 'Fibrin net',
        text: 'Thrombin turns fibrinogen into fibrin threads that weave the plug into a solid clot.',
      },
    ],
    interaction: {
      template: 'cause-effect',
      config: {
        prompt: 'Cut the finger and watch the cascade. Then break a link to see what goes wrong.',
        trigger: { label: 'Cut the finger', emoji: '🔪' },
        nodes: [
          {
            id: 'injury',
            label: 'Vessel wall damaged',
            emoji: '🩸',
            text: 'Collagen and tissue factor under the vessel lining are exposed to blood.',
          },
          {
            id: 'platelets',
            label: 'Platelets stick',
            emoji: '🟣',
            text: 'Platelets grab the exposed collagen and pile up into a soft plug.',
            brokenText:
              'With too few platelets, no plug forms. Even small bumps cause bruises and bleeding gums.',
          },
          {
            id: 'factors',
            label: 'Clotting factors activate',
            emoji: '⛓️',
            text: 'Factor after factor switches on the next — each one activates many more, amplifying the signal.',
            brokenText:
              'Missing factor VIII (hemophilia A): the cascade fizzles. Bleeding goes on much longer.',
          },
          {
            id: 'thrombin',
            label: 'Thrombin is made',
            emoji: '✂️',
            text: 'The cascade produces thrombin, the master enzyme of clotting.',
          },
          {
            id: 'fibrin',
            label: 'Fibrin net forms',
            emoji: '🕸️',
            text: 'Thrombin snips fibrinogen into fibrin threads that weave through the plug.',
            brokenText: 'Without working fibrinogen, the plug never gets its net and falls apart.',
          },
          {
            id: 'clot',
            label: 'Bleeding stops',
            emoji: '🩹',
            text: 'A firm clot seals the cut. Later, it is dissolved as the tissue heals.',
          },
        ],
        breakable: ['platelets', 'factors', 'fibrin'],
        normalOutcome:
          'Bleeding stops in a few minutes. The cascade turned one small signal into a huge response.',
      },
    },
    goDeeper:
      'Hemostasis has three phases: vascular spasm (the vessel narrows), primary hemostasis (platelets adhere via von Willebrand factor and aggregate), and secondary hemostasis (the coagulation cascade). In the cascade, inactive enzymes called zymogens activate one another in sequence (e.g. factor X → Xa), which amplifies the signal enormously. Thrombin converts soluble fibrinogen into insoluble fibrin, which is then cross-linked by factor XIIIa.\n\nIn reality, it’s a bit more complicated: textbooks often split the cascade into “intrinsic” and “extrinsic” pathways, but the modern cell-based model shows it happens on platelet surfaces in overlapping phases (initiation, amplification, propagation), and thrombin itself feeds back to boost earlier steps. Built-in brakes (antithrombin, protein C) keep clots from spreading, and plasmin later dissolves the clot. Hemophilia A (factor VIII) and B (factor IX) are X-linked, so they mostly affect males.',
    quiz: [
      {
        kind: 'mc',
        prompt: 'What forms the “net” that holds a clot together?',
        options: ['Collagen', 'Fibrin', 'Red blood cells', 'Plasma'],
        answer: 1,
        explain: 'Thrombin turns fibrinogen into fibrin threads.',
      },
      {
        kind: 'predict',
        scenario: 'A person is born unable to make clotting factor VIII.',
        prompt: 'What happens after a small cut?',
        options: [
          'It bleeds much longer than usual',
          'It never bleeds',
          'It clots faster than usual',
          'Platelets stop working',
        ],
        answer: 0,
        explain: 'This is hemophilia A: the cascade can’t amplify, so clotting is slow.',
      },
      {
        kind: 'mc',
        prompt: 'Why is it called a “cascade”?',
        options: [
          'Blood flows like a waterfall',
          'Each step switches on the next and multiplies the signal',
          'It only happens in the legs',
          'Clots fall off quickly',
        ],
        answer: 1,
        explain:
          'One activated factor activates many copies of the next factor, like a growing waterfall.',
      },
    ],
    relatedConcepts: ['kidneys'],
    funFact:
      'Several royal families of Europe carried hemophilia, passed down from Queen Victoria.',
  },
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
