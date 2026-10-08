import type { Concept } from '../../types';
import {
  assembly,
  cascade,
  em,
  label,
  lockKey,
  mc,
  predict,
  sh,
  slider,
  sorting,
  steps,
  timeline,
  zoom,
} from './helpers';

export const cellLibrary: Concept[] = [
  {
    id: 'cell-membrane',
    title: 'Cell Membrane & Diffusion',
    category: 'cell',
    tags: ['membrane', 'diffusion', 'phospholipids', 'concentration gradient', 'transport'],
    aliases: ['plasma membrane', 'diffusion', 'how things get into cells', 'phospholipid bilayer'],
    difficulty: 2,
    rarity: 'common',
    summary:
      'Every cell is wrapped in an oily skin that lets some things slip through and keeps others out.',
    steps: steps(
      [
        'An oily bubble',
        'The membrane is a double layer of fat-like molecules (phospholipids) with proteins floating in it.',
      ],
      [
        'Spreading out',
        'Molecules naturally move from crowded areas to less crowded ones. This is diffusion.',
      ],
      [
        'Faster or slower',
        'A bigger difference in concentration, more heat, and smaller molecules all make diffusion faster.',
      ],
      [
        'Picky gates',
        'Small molecules like oxygen slip straight through; bigger or charged ones need protein doorways.',
      ],
    ),
    interaction: slider({
      prompt:
        'Change the concentration difference, temperature and molecule size. How fast does stuff diffuse across?',
      inputs: [
        {
          id: 'diff',
          label: 'Concentration difference',
          unit: '%',
          min: 0,
          max: 100,
          step: 5,
          start: 30,
        },
        { id: 'temp', label: 'Temperature', unit: '°C', min: 0, max: 50, step: 1, start: 20 },
        { id: 'size', label: 'Molecule size', unit: '× O₂', min: 1, max: 10, step: 1, start: 1 },
      ],
      output: {
        label: 'Diffusion rate',
        unit: '%',
        max: 100,
        expr: '100 * (diff / 100) * (0.5 + temp / 100) / sqrt(size) / 1.0',
      },
      graphInput: 'diff',
      visual: { kind: 'particles', emoji: '🔵' },
      challenges: [
        {
          prompt: 'Make diffusion really fast (over 80%).',
          target: { min: 80 },
          explain: 'A steep gradient, warm temperature and tiny molecules: perfect conditions.',
        },
        {
          prompt: 'Stop diffusion completely (under 2%) — without touching molecule size.',
          target: { max: 2 },
          explain:
            'With no concentration difference, molecules still move but there is no NET movement either way. That is equilibrium.',
        },
      ],
    }),
    goDeeper:
      'The phospholipid bilayer has hydrophilic (water-loving) heads facing outward and hydrophobic (water-fearing) tails tucked inside. Small nonpolar molecules (O₂, CO₂) diffuse straight through; water crosses slowly on its own and quickly through aquaporins; ions and larger polar molecules need channel or carrier proteins (facilitated diffusion). Fick’s law says the rate rises with surface area and concentration gradient and falls with membrane thickness.\n\nIn reality, it’s a bit more complicated: the slider formula is a teaching approximation. Diffusion speed scales roughly with the square root of temperature (in kelvin) and inversely with molecular radius, and real membranes are packed with cholesterol and proteins that change how “fluid” they are (the fluid mosaic model).',
    quiz: [
      mc(
        'In diffusion, molecules move…',
        [
          'From low concentration to high',
          'From high concentration to low',
          'Only when the cell uses energy',
          'Only through protein pumps',
        ],
        1,
        'Diffusion is the net movement from crowded to less crowded areas, with no energy needed.',
      ),
      predict(
        'You put a drop of food coloring into hot water and another into ice water.',
        'Which spreads out faster?',
        ['The ice water', 'The hot water', 'They spread at the same speed', 'Neither spreads'],
        1,
        'Heat makes molecules move faster, so diffusion speeds up.',
      ),
      label(
        'Match each part to its description.',
        [
          ['Phospholipid bilayer', 'Double layer of oily molecules'],
          ['Channel protein', 'Doorway for ions and charged molecules'],
          ['Diffusion', 'Spreading from crowded to less crowded'],
        ],
        'The membrane is a selective barrier.',
      ),
    ],
    relatedConcepts: ['osmosis', 'active-transport', 'cell-signaling'],
    funFact:
      'If you could spread out all the cell membranes in your body, they would cover several square kilometers.',
  },
  {
    id: 'osmosis',
    title: 'Osmosis',
    category: 'cell',
    tags: ['water', 'membrane', 'salt', 'hypertonic', 'hypotonic', 'isotonic'],
    aliases: ['water movement', 'why salt dries things', 'tonicity'],
    difficulty: 2,
    rarity: 'common',
    prerequisites: ['cell-membrane'],
    summary: 'Water sneaks across membranes toward wherever things are saltier.',
    steps: steps(
      ['Water moves too', 'Osmosis is the diffusion of water across a membrane.'],
      [
        'Toward the salt',
        'Water flows toward the side with more dissolved stuff (solutes), trying to even things out.',
      ],
      [
        'Swell or shrivel',
        'In pure water, cells swell. In salty water, they shrivel. In just-right water, they stay the same.',
      ],
    ),
    interaction: slider({
      prompt:
        'Change how salty the water around a red blood cell is. Watch the cell swell or shrink.',
      inputs: [
        {
          id: 'salt',
          label: 'Salt outside the cell',
          unit: '%',
          min: 0,
          max: 3,
          step: 0.1,
          start: 0.9,
        },
      ],
      output: {
        label: 'Cell size',
        unit: '% of normal',
        max: 160,
        expr: 'clamp(100 * (0.9 + 0.35) / (salt + 0.35), 40, 160)',
      },
      readouts: [{ label: 'Net water flow (+ into cell, − out)', expr: '(0.9 - salt) * 10' }],
      graphInput: 'salt',
      visual: { kind: 'growth', emoji: '🔴' },
      challenges: [
        {
          prompt: 'Find the “just right” saltiness where the cell stays normal size (95–105%).',
          target: { min: 95, max: 105 },
          explain:
            'About 0.9% salt matches the inside of the cell (isotonic), so water flows in and out equally.',
        },
        {
          prompt: 'Make the cell swell dangerously (over 140%).',
          target: { min: 140 },
          explain: 'In fresh water (hypotonic), water rushes in. Red blood cells can even burst!',
        },
        {
          prompt: 'Make the cell shrivel (under 60%).',
          target: { max: 60 },
          explain: 'In very salty water (hypertonic), water leaves the cell and it crinkles up.',
        },
      ],
    }),
    goDeeper:
      'Water moves from regions of low solute concentration (high water potential) to high solute concentration across a selectively permeable membrane, largely through aquaporin channels. Solutions are hypotonic (cells gain water), isotonic (no net change) or hypertonic (cells lose water). Plant cells don’t burst in fresh water because their rigid cell wall pushes back (turgor pressure), which keeps plants upright.\n\nIn reality, it’s a bit more complicated: what matters is the total number of dissolved particles (osmolarity), not only salt, and the curve here is simplified. Medical IV drips use 0.9% saline because it is isotonic with blood. Freshwater fish constantly pump out extra water, while saltwater fish drink seawater and excrete salt.',
    quiz: [
      mc(
        'Which way does water move in osmosis?',
        [
          'Toward the side with fewer dissolved particles',
          'Toward the side with more dissolved particles',
          'It never crosses membranes',
          'Only into plant cells',
        ],
        1,
        'Water moves toward the saltier (more concentrated) side.',
      ),
      predict(
        'A slug is sprinkled with salt.',
        'What happens to the slug’s cells?',
        [
          'They gain water and swell',
          'They lose water and shrivel',
          'Nothing happens',
          'They turn into salt',
        ],
        1,
        'The salt outside is hypertonic, pulling water out of the slug’s cells.',
      ),
      mc(
        'Why don’t plant cells burst in pure water?',
        [
          'They have no membrane',
          'Their cell wall pushes back',
          'They pump all the water out instantly',
          'Water can’t reach them',
        ],
        1,
        'The cell wall resists swelling, creating turgor pressure that keeps plants firm.',
      ),
    ],
    relatedConcepts: ['cell-membrane', 'kidneys', 'transpiration'],
    funFact: 'Wilted lettuce perks up in cold water because osmosis refills its cells.',
  },
  {
    id: 'active-transport',
    title: 'Active Transport: the Sodium–Potassium Pump',
    category: 'cell',
    tags: ['sodium', 'potassium', 'ATP', 'pump', 'membrane', 'neurons'],
    aliases: [
      'sodium potassium pump',
      'Na K pump',
      'Na+/K+ ATPase',
      'pumping against the gradient',
    ],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['cell-membrane', 'atp'],
    summary: 'Cells spend energy to push molecules uphill — the opposite of diffusion.',
    steps: steps(
      [
        'Uphill work',
        'Active transport moves things from low concentration to high, which takes energy.',
      ],
      ['A protein pump', 'The sodium–potassium pump grabs 3 sodium ions inside the cell.'],
      [
        'Powered by ATP',
        'ATP gives the pump a phosphate, changing its shape so it opens to the outside.',
      ],
      [
        'Swap and reset',
        'It drops sodium outside, grabs 2 potassium ions, then flips back to release them inside.',
      ],
    ),
    interaction: assembly(
      'Put the steps of one pump cycle in order. It repeats over and over!',
      [
        ['3 Na⁺ bind inside', '🟠', 'Three sodium ions from inside the cell slot into the pump.'],
        [
          'ATP adds a phosphate',
          '⚡',
          'ATP is split and its phosphate attaches to the pump, providing the energy.',
        ],
        [
          'Pump flips outward',
          '🔄',
          'The pump changes shape, opening to the outside and releasing the 3 Na⁺.',
        ],
        ['2 K⁺ bind outside', '🟣', 'Two potassium ions from outside the cell bind to the pump.'],
        [
          'Phosphate leaves',
          '💨',
          'The phosphate falls off and the pump flips back to face inside.',
        ],
        [
          '2 K⁺ released inside',
          '🏠',
          'Potassium is released into the cell. Ready for the next cycle!',
        ],
      ],
      'Cycle complete: 3 Na⁺ out, 2 K⁺ in, 1 ATP spent. Your neurons run this pump constantly.',
      {
        layout: 'cycle',
        distractors: [['Glucose enters', '🍬', 'Glucose uses other transporters — not this pump.']],
      },
    ),
    goDeeper:
      'Na⁺/K⁺-ATPase is a P-type ATPase. Each cycle uses one ATP to export 3 Na⁺ and import 2 K⁺, so it is electrogenic: it moves net positive charge out and helps keep the inside of cells negative. The sodium gradient it builds powers secondary active transport, such as glucose uptake in the gut and kidney (SGLT co-transporters).\n\nIn reality, it’s a bit more complicated: the pump’s shapes are called E1 (facing in, high affinity for Na⁺) and E2 (facing out, high affinity for K⁺), and the order of binding and release is more overlapping than the tidy six steps here. The pump uses a large share of the brain’s energy budget, and the heart drug digoxin works by partly blocking it.',
    quiz: [
      mc(
        'How is active transport different from diffusion?',
        [
          'It is faster',
          'It moves molecules against their gradient using energy',
          'It only moves water',
          'It needs no proteins',
        ],
        1,
        'Active transport goes “uphill” and needs energy, usually from ATP.',
      ),
      mc(
        'Each cycle of the sodium–potassium pump moves…',
        ['2 Na⁺ out, 3 K⁺ in', '3 Na⁺ out, 2 K⁺ in', '1 Na⁺ in, 1 K⁺ out', 'Only water'],
        1,
        'Three sodium out, two potassium in, for one ATP.',
      ),
      predict(
        'A poison stops cells from making ATP.',
        'What happens to the sodium–potassium pump?',
        [
          'It speeds up',
          'It stops, and the ion gradients slowly run down',
          'It reverses and makes ATP',
          'Nothing changes',
        ],
        1,
        'No ATP, no pumping. Gradients fade and nerves stop working properly.',
      ),
    ],
    relatedConcepts: ['cell-membrane', 'action-potential', 'atp'],
    funFact:
      'The sodium–potassium pump may use about a fifth or more of all the energy your body burns at rest.',
  },
  {
    id: 'mitochondria',
    title: 'Mitochondria & Cellular Respiration',
    category: 'cell',
    tags: ['powerhouse', 'ATP', 'respiration', 'glucose', 'oxygen', 'energy'],
    aliases: [
      'powerhouse of the cell',
      'cellular respiration',
      'how cells get energy',
      'aerobic respiration',
    ],
    difficulty: 2,
    rarity: 'common',
    summary: 'Mitochondria burn food with oxygen to make ATP, the energy coins your cells spend.',
    steps: steps(
      ['Fuel in', 'Glucose from food and oxygen from your lungs are delivered to every cell.'],
      [
        'Into the powerhouse',
        'Glucose is split in the cytoplasm, then the pieces go into mitochondria.',
      ],
      [
        'Folded factory',
        'The inner membrane is folded into cristae, giving lots of space for ATP-making machines.',
      ],
      ['Exhaust', 'Carbon dioxide and water are the leftovers. You breathe out the CO₂.'],
    ),
    interaction: zoom({
      prompt: 'Zoom from a muscle into a mitochondrion. Tap the hotspots.',
      levels: [
        {
          id: 'muscle',
          label: 'Muscle',
          scale: '10 cm',
          background: '#fff1f2',
          description: 'Leg muscles are packed with mitochondria to power movement.',
          elements: [
            em('leg', '🦵', 50, 50, 5),
            sh('fiber', 'rod', '#fb7185', 70, 40, 2.5, { rotate: 20, opacity: 0.6 }),
          ],
          hotspots: [
            {
              id: 'fiber',
              x: 70,
              y: 32,
              label: 'Muscle fiber',
              text: 'Each muscle fiber is one long cell with many nuclei — and thousands of mitochondria.',
              zoomTo: 'cell',
            },
          ],
        },
        {
          id: 'cell',
          label: 'Muscle cell',
          scale: '100 µm',
          background: '#fce7f3',
          description: 'Inside a muscle cell, mitochondria sit between the contracting fibers.',
          elements: [
            sh('c', 'rect', '#fbcfe8', 50, 50, 6, { opacity: 0.8 }),
            ...[20, 40, 60, 80].map((x, i) =>
              sh(`m${i}`, 'bean', '#fb923c', x, i % 2 ? 35 : 65, 1),
            ),
          ],
          hotspots: [
            {
              id: 'mito',
              x: 40,
              y: 22,
              label: 'Mitochondrion',
              text: 'About 1–2 µm long, shaped like a bean. Busy cells can have thousands.',
              zoomTo: 'mito',
            },
            {
              id: 'glu',
              x: 75,
              y: 85,
              label: 'Glucose arrives',
              text: 'Glucose is first split into two pyruvate molecules in the cytoplasm (glycolysis).',
            },
          ],
        },
        {
          id: 'mito',
          label: 'Mitochondrion',
          scale: '2 µm',
          background: '#ffedd5',
          description: 'Two membranes: a smooth outer one and a folded inner one (cristae).',
          elements: [
            sh('outer', 'bean', '#fdba74', 50, 50, 6.5),
            sh('cristae', 'wave', '#9a3412', 50, 50, 4.5),
          ],
          hotspots: [
            {
              id: 'cr',
              x: 50,
              y: 30,
              label: 'Cristae',
              text: 'The folds hold the electron transport chain and ATP synthase — the ATP factory floor.',
            },
            {
              id: 'matrix',
              x: 30,
              y: 62,
              label: 'Matrix',
              text: 'The Krebs cycle runs here, stripping electrons from fuel and releasing CO₂.',
            },
            {
              id: 'dna',
              x: 70,
              y: 66,
              label: 'Its own DNA',
              text: 'Mitochondria have a small circle of DNA, a clue that they were once bacteria.',
            },
          ],
        },
      ],
    }),
    goDeeper:
      'Aerobic cellular respiration: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy (≈30–32 ATP per glucose). It has four stages: glycolysis (cytoplasm, 2 ATP), pyruvate oxidation and the Krebs (citric acid) cycle (matrix, making NADH and FADH₂ and releasing CO₂), and oxidative phosphorylation (inner membrane, where most ATP is made by the electron transport chain and ATP synthase).\n\nIn reality, it’s a bit more complicated: “powerhouse” undersells mitochondria — they also help control cell death (apoptosis), store calcium and make heat. Older textbooks say 36–38 ATP per glucose; modern estimates are lower because moving molecules across membranes costs energy.',
    quiz: [
      mc(
        'What are the main products of cellular respiration?',
        [
          'Glucose and oxygen',
          'ATP, carbon dioxide and water',
          'Sunlight and sugar',
          'Protein and DNA',
        ],
        1,
        'Cells release energy (as ATP) plus CO₂ and water.',
      ),
      mc(
        'Why is the inner membrane of a mitochondrion folded?',
        [
          'To store DNA',
          'To give more surface for ATP-making machinery',
          'To keep oxygen out',
          'To help it swim',
        ],
        1,
        'More folds, more room for the electron transport chain and ATP synthase.',
      ),
      predict(
        'A runner sprints and their muscles can’t get oxygen fast enough.',
        'How do the muscles keep making some ATP?',
        [
          'They stop completely',
          'They switch partly to fermentation, making lactate',
          'They make more mitochondria instantly',
          'They use carbon dioxide',
        ],
        1,
        'Without enough oxygen, cells fall back on glycolysis plus fermentation, which makes much less ATP.',
      ),
    ],
    relatedConcepts: ['atp', 'electron-transport-chain', 'endosymbiosis', 'glycolysis'],
    funFact: 'A single liver cell can contain around 1,000–2,000 mitochondria.',
  },
  {
    id: 'atp',
    title: 'ATP: The Energy Currency',
    category: 'cell',
    tags: ['energy', 'adenosine triphosphate', 'phosphate', 'metabolism', 'muscles'],
    aliases: ['adenosine triphosphate', 'energy currency', 'cell energy'],
    difficulty: 2,
    rarity: 'common',
    summary: 'ATP is like a rechargeable battery that powers almost everything a cell does.',
    steps: steps(
      [
        'A charged battery',
        'ATP has three phosphate groups. Snapping off the last one releases usable energy.',
      ],
      ['Spend it', 'Muscles, pumps and builders spend ATP, turning it into ADP.'],
      ['Recharge it', 'Respiration re-attaches the phosphate, turning ADP back into ATP.'],
    ),
    interaction: {
      template: 'feed-and-observe',
      config: {
        prompt: 'Make this muscle cell work, then watch it recharge its ATP. Try the sprint!',
        subject: { emoji: '💪', label: 'Muscle cell' },
        meters: [
          {
            id: 'atp',
            label: 'ATP stock',
            unit: '%',
            min: 0,
            max: 100,
            start: 80,
            healthy: [40, 100],
            color: '#f59e0b',
          },
        ],
        items: [
          {
            id: 'lift',
            label: 'Lift a weight',
            emoji: '🏋️',
            note: 'Each muscle twitch spends ATP to make myosin pull on actin.',
            effects: [{ meter: 'atp', amount: -25, seconds: 3 }],
          },
          {
            id: 'sprint',
            label: 'Sprint!',
            emoji: '🏃',
            note: 'Sprinting burns ATP faster than respiration can refill it.',
            effects: [{ meter: 'atp', amount: -55, seconds: 4 }],
          },
          {
            id: 'walk',
            label: 'Gentle walk',
            emoji: '🚶',
            note: 'A gentle pace uses ATP slowly; respiration easily keeps up.',
            effects: [{ meter: 'atp', amount: -10, seconds: 6 }],
          },
          {
            id: 'rest',
            label: 'Rest',
            emoji: '🛋️',
            note: 'At rest, cells still spend ATP on pumps and repairs — just less.',
            effects: [{ meter: 'atp', amount: -2, seconds: 3 }],
          },
        ],
        responses: [
          {
            id: 'creatine',
            label: 'Creatine phosphate burst',
            emoji: '⚡',
            when: { meter: 'atp', below: 45 },
            effect: { meter: 'atp', perSecond: 6 },
            message: 'Emergency reserve! Creatine phosphate quickly hands its phosphate to ADP.',
          },
          {
            id: 'resp',
            label: 'Respiration recharging',
            emoji: '🔋',
            when: { meter: 'atp', below: 85 },
            effect: { meter: 'atp', perSecond: 3 },
            message: 'Mitochondria recharge ADP back into ATP using food and oxygen.',
          },
        ],
        modes: [
          {
            id: 'normal',
            label: 'Plenty of oxygen',
            description: 'Normal: mitochondria recharge ATP steadily.',
          },
          {
            id: 'cyanide',
            label: 'Mitochondria blocked',
            description: 'Mitochondria poisoned: almost no recharging. ATP runs out fast!',
            responseScale: { resp: 0.1 },
          },
        ],
        goal: { feeds: 4, tryAllModes: true },
      },
    },
    goDeeper:
      'Adenosine triphosphate is made of adenine, ribose and three phosphate groups. Hydrolysis of the terminal phosphate (ATP → ADP + Pᵢ) releases about 30 kJ/mol under standard conditions (more in cells), and enzymes couple this to energy-requiring work: muscle contraction, active transport, and building molecules. Cells regenerate ATP mainly through oxidative phosphorylation, plus glycolysis and the creatine phosphate system in muscles.\n\nIn reality, it’s a bit more complicated: the energy isn’t stored in a single “high-energy bond” that snaps like a spring — it comes from the whole reaction being favorable (the products are more stable). Cells keep only a few seconds’ worth of ATP at a time, so they recycle each ATP molecule hundreds to thousands of times a day.',
    quiz: [
      mc(
        'What does a cell do to release energy from ATP?',
        [
          'Adds a phosphate',
          'Removes a phosphate, making ADP',
          'Turns it into glucose',
          'Freezes it',
        ],
        1,
        'Removing the third phosphate releases energy and leaves ADP.',
      ),
      predict(
        'A sprinter’s muscles use ATP much faster than respiration can make it.',
        'What helps for the first few seconds?',
        [
          'Photosynthesis',
          'Creatine phosphate quickly recharges ADP',
          'The muscles stop needing energy',
          'Digestion speeds up',
        ],
        1,
        'Creatine phosphate is a fast emergency reserve in muscles.',
      ),
      mc(
        'Why is ATP called the cell’s “energy currency”?',
        [
          'It is made of gold',
          'Cells earn it from food and spend it on work',
          'It is stored for years',
          'Only the brain uses it',
        ],
        1,
        'Like money, ATP is made in one place and spent in many others.',
      ),
    ],
    relatedConcepts: ['mitochondria', 'active-transport', 'muscle-contraction'],
    funFact:
      'You recycle roughly your own body weight in ATP every day, though only about 50 grams exist at any moment.',
  },
  {
    id: 'ribosomes',
    title: 'Ribosomes: Protein Factories',
    category: 'cell',
    tags: ['protein synthesis', 'rough ER', 'translation', 'rRNA', 'organelles'],
    aliases: ['protein factories', 'free and bound ribosomes', 'rough ER ribosomes'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['translation'],
    summary: 'Ribosomes build every protein — and where they sit decides where the protein goes.',
    steps: steps(
      [
        'Tiny machines',
        'Ribosomes are made of RNA and protein, and they link amino acids into chains.',
      ],
      ['Two neighborhoods', 'Some float freely in the cytoplasm. Others stick to the rough ER.'],
      [
        'Shipping address',
        'Proteins made on the rough ER are exported or put into membranes. Free ribosomes make proteins that stay in the cytoplasm.',
      ],
    ),
    interaction: sorting(
      'Which ribosomes make each protein? Sort them!',
      [
        ['Free ribosome', '🫧', 'Proteins that stay in the cytoplasm'],
        ['Rough ER ribosome', '🏭', 'Proteins that are exported or go into membranes'],
      ],
      [
        [
          'Hemoglobin',
          '🩸',
          0,
          'Hemoglobin stays inside red blood cells, so free ribosomes make it.',
        ],
        ['Insulin', '🔑', 1, 'Insulin is shipped out of the cell, so it is made on the rough ER.'],
        ['Antibodies', '🛡️', 1, 'Antibodies are secreted into the blood: rough ER.'],
        ['Glycolysis enzymes', '⚙️', 0, 'These enzymes work in the cytoplasm: free ribosomes.'],
        [
          'Insulin receptor',
          '📡',
          1,
          'Membrane proteins are threaded into the ER membrane as they are made.',
        ],
        [
          'Actin (cell skeleton)',
          '🦴',
          0,
          'Actin works in the cytoplasm, so free ribosomes make it.',
        ],
        ['Digestive enzymes', '🧪', 1, 'Pancreatic enzymes are exported into the gut: rough ER.'],
      ],
    ),
    goDeeper:
      'Eukaryotic ribosomes (80S) have a large 60S and a small 40S subunit built from ribosomal RNA and proteins; bacterial ribosomes are smaller (70S), which is why some antibiotics can target them selectively. All translation starts on free ribosomes. If the growing protein begins with an ER signal sequence, a signal recognition particle pauses translation and docks the ribosome on the ER, and the protein is threaded into the ER as it is made.\n\nIn reality, it’s a bit more complicated: “free” and “bound” ribosomes are the same kind of ribosome — they move between the two states depending on the protein they are making. The catalytic core that links amino acids is RNA, so the ribosome is a ribozyme, a clue that RNA came before proteins in early life.',
    quiz: [
      mc(
        'Where are proteins that will be exported from the cell made?',
        ['Free ribosomes', 'Ribosomes on the rough ER', 'The nucleus', 'The cell wall'],
        1,
        'Secreted and membrane proteins are made by ribosomes on the rough ER.',
      ),
      mc(
        'What are ribosomes made of?',
        ['Fat', 'RNA and protein', 'Sugar', 'DNA only'],
        1,
        'Ribosomes are built from ribosomal RNA and proteins.',
      ),
      predict(
        'An antibiotic blocks bacterial (70S) ribosomes but not human (80S) ones.',
        'Why can it be used as a medicine?',
        [
          'It kills both equally',
          'It stops bacteria making proteins while sparing human cells',
          'It helps bacteria grow',
          'It only works on viruses',
        ],
        1,
        'Differences between bacterial and human ribosomes let some antibiotics target bacteria selectively.',
      ),
    ],
    relatedConcepts: ['translation', 'er-golgi', 'antibiotic-resistance'],
    funFact: 'A fast-growing mammalian cell can have around 10 million ribosomes.',
  },
  {
    id: 'er-golgi',
    title: 'The ER & Golgi Shipping System',
    category: 'cell',
    tags: ['endoplasmic reticulum', 'Golgi apparatus', 'vesicles', 'secretion', 'proteins'],
    aliases: ['endoplasmic reticulum', 'Golgi apparatus', 'protein shipping', 'secretory pathway'],
    difficulty: 2,
    rarity: 'common',
    prerequisites: ['ribosomes'],
    summary: 'Cells have their own post office: proteins are built, packed, labeled and shipped.',
    steps: steps(
      ['Built on the ER', 'Ribosomes on the rough ER thread new proteins inside, where they fold.'],
      ['Bubble mail', 'Finished proteins bud off in little bubbles called vesicles.'],
      ['Sorting office', 'The Golgi adds sugar labels and sorts proteins to the right address.'],
      [
        'Out the door',
        'Vesicles fuse with the cell membrane and release their cargo outside (exocytosis).',
      ],
    ),
    interaction: assembly(
      'Ship a hormone out of the cell: put the stops on its route in order.',
      [
        ['Rough ER ribosome', '🏭', 'The protein is made and threaded into the ER.'],
        [
          'Folding in the ER',
          '🧶',
          'Inside the ER, the protein folds and gets its first sugar tags.',
        ],
        ['Transport vesicle', '🫧', 'A bubble of membrane carries it to the Golgi.'],
        [
          'Golgi apparatus',
          '🏤',
          'The Golgi trims and labels it, then sorts it into a new vesicle.',
        ],
        ['Secretory vesicle', '📦', 'The package travels to the edge of the cell.'],
        [
          'Cell membrane (exocytosis)',
          '🚪',
          'The vesicle fuses with the membrane and the hormone is released.',
        ],
      ],
      'Delivered! Insulin, antibodies and digestive enzymes all leave cells by this route.',
      {
        distractors: [
          ['Nucleus pore', '🕳️', 'Proteins for export don’t go back into the nucleus.'],
        ],
      },
    ),
    goDeeper:
      'The endomembrane system includes the nuclear envelope, endoplasmic reticulum, Golgi apparatus, lysosomes, vesicles and plasma membrane. The rough ER (studded with ribosomes) folds and modifies secretory and membrane proteins; the smooth ER makes lipids, detoxifies drugs and stores calcium. The Golgi has a receiving (cis) face and shipping (trans) face; it modifies glycosylation patterns that act as sorting signals, such as mannose-6-phosphate tags that send enzymes to lysosomes.\n\nIn reality, it’s a bit more complicated: scientists still debate whether cargo moves through the Golgi in vesicles or whether the Golgi stacks themselves mature and move (cisternal maturation). Misfolded proteins are held in the ER and destroyed, and when too many pile up, cells trigger a stress response.',
    quiz: [
      mc(
        'What does the Golgi apparatus mainly do?',
        ['Makes ATP', 'Modifies, labels and sorts proteins', 'Stores DNA', 'Digests bacteria'],
        1,
        'The Golgi is the cell’s sorting and packaging center.',
      ),
      label(
        'Match each part to its job.',
        [
          ['Rough ER', 'Where secreted proteins are built and folded'],
          ['Vesicle', 'Membrane bubble that carries cargo'],
          ['Golgi', 'Adds labels and sorts proteins'],
        ],
        'Build, ship, sort.',
      ),
      predict(
        'A mutation stops vesicles from fusing with the cell membrane.',
        'What happens to a hormone the cell makes?',
        [
          'It is released faster',
          'It gets stuck inside the cell',
          'It turns into DNA',
          'It leaks out through the nucleus',
        ],
        1,
        'Without fusion (exocytosis), packaged proteins can’t leave the cell.',
      ),
    ],
    relatedConcepts: ['ribosomes', 'lysosomes', 'insulin'],
    funFact:
      'The Golgi apparatus was discovered in 1898 by Camillo Golgi using a silver stain he invented.',
  },
  {
    id: 'lysosomes',
    title: 'Lysosomes: The Recycling Centers',
    category: 'cell',
    tags: ['digestion', 'enzymes', 'recycling', 'phagocytosis', 'organelles'],
    aliases: ['cell stomach', 'recycling center', 'lysosomal storage disease'],
    difficulty: 2,
    rarity: 'common',
    prerequisites: ['er-golgi'],
    summary: 'Lysosomes are acid-filled bubbles that digest germs, junk and worn-out parts.',
    steps: steps(
      ['A tiny stomach', 'Lysosomes are bubbles full of digestive enzymes that work best in acid.'],
      [
        'Eating germs',
        'When a white blood cell swallows a bacterium, lysosomes fuse with it and digest it.',
      ],
      ['Recycling', 'The building blocks released are reused to make new things.'],
    ),
    interaction: cascade(
      'A white blood cell gobbles a bacterium. Watch it get digested, then break a step.',
      ['Swallow the bacterium', '🦠'],
      [
        [
          'Engulfed in a bubble',
          '🫧',
          'The cell wraps its membrane around the bacterium, trapping it in a phagosome.',
        ],
        [
          'Lysosome arrives',
          '🟣',
          'A lysosome fuses with the bubble.',
          'If lysosomes can’t fuse, the germ survives inside the cell. Some bacteria, like tuberculosis, use this trick.',
        ],
        [
          'Acid & enzymes',
          '🧪',
          'Acid and over 50 kinds of enzymes chop the bacterium apart.',
          'A missing enzyme means one kind of molecule can’t be broken down and builds up — a lysosomal storage disease like Tay-Sachs.',
        ],
        ['Building blocks recycled', '♻️', 'Amino acids, sugars and fats are released and reused.'],
      ],
      'Germ destroyed and recycled. Nothing goes to waste!',
    ),
    goDeeper:
      'Lysosomes maintain a pH of about 4.5–5 using proton pumps, and contain acid hydrolases (proteases, nucleases, lipases, glycosidases) that work poorly at the cytoplasm’s neutral pH — a safety feature if a lysosome leaks. They digest material from outside the cell (endocytosis and phagocytosis) and from inside (autophagy).\n\nIn reality, it’s a bit more complicated: lysosomes are also signaling hubs that sense nutrients and help decide whether a cell grows or recycles itself. Over 50 lysosomal storage diseases are known; in Tay-Sachs disease, missing hexosaminidase A causes fatty molecules (GM2 gangliosides) to build up in neurons.',
    quiz: [
      mc(
        'Why do lysosome enzymes work poorly in the rest of the cell?',
        [
          'The cytoplasm is too cold',
          'They need an acidic environment',
          'They need sunlight',
          'They are made of DNA',
        ],
        1,
        'Lysosomal enzymes work best at acidic pH, which protects the cell if one leaks.',
      ),
      predict(
        'A child is missing one lysosomal enzyme from birth.',
        'What happens over time?',
        [
          'Nothing',
          'The molecule that enzyme digests builds up inside cells',
          'The cell grows extra lysosomes that fix it instantly',
          'The lysosome turns into a mitochondrion',
        ],
        1,
        'Undigested material accumulates — a lysosomal storage disease.',
      ),
      mc(
        'Which is NOT a job of lysosomes?',
        [
          'Digesting bacteria',
          'Breaking down worn-out organelles',
          'Making proteins from mRNA',
          'Recycling building blocks',
        ],
        2,
        'Ribosomes make proteins; lysosomes break things down.',
      ),
    ],
    relatedConcepts: ['autophagy', 'white-blood-cells', 'er-golgi'],
    funFact:
      'Christian de Duve discovered lysosomes in 1955 partly by accident, when stored cell extracts seemed more active.',
  },
  {
    id: 'cytoskeleton',
    title: 'The Cytoskeleton',
    category: 'cell',
    tags: ['microtubules', 'actin', 'intermediate filaments', 'cell shape', 'motor proteins'],
    aliases: ['cell skeleton', 'microtubules', 'actin filaments'],
    difficulty: 3,
    rarity: 'common',
    summary:
      'Cells have a skeleton of protein ropes and tubes that shapes them, moves them and carries cargo.',
    steps: steps(
      [
        'Not just a bag',
        'Cells are filled with a network of protein fibers called the cytoskeleton.',
      ],
      [
        'Three types',
        'Thin actin filaments, rope-like intermediate filaments and hollow microtubules.',
      ],
      ['Highways', 'Motor proteins walk along microtubules carrying cargo, like trucks on roads.'],
    ),
    interaction: sorting(
      'Sort each job to the cytoskeleton fiber that does it.',
      [
        ['Actin filaments', '🧵', 'Thinnest; help cells crawl, pinch and contract'],
        ['Intermediate filaments', '🪢', 'Tough ropes that resist pulling'],
        ['Microtubules', '🚇', 'Hollow tubes; highways and the spindle'],
      ],
      [
        ['Muscle contraction', '💪', 0, 'Myosin pulls on actin filaments to contract muscle.'],
        [
          'Pinching a dividing cell in two',
          '✂️',
          0,
          'A ring of actin squeezes the cell during cytokinesis.',
        ],
        [
          'Hair and nails (keratin)',
          '💅',
          1,
          'Keratin is an intermediate filament — tough and stretch-resistant.',
        ],
        [
          'Holding skin cells together',
          '🧱',
          1,
          'Intermediate filaments anchor cell junctions so skin doesn’t tear.',
        ],
        ['Pulling chromosomes apart', '🧬', 2, 'The mitotic spindle is made of microtubules.'],
        [
          'Carrying cargo down a neuron',
          '🚚',
          2,
          'Kinesin and dynein motors walk along microtubules.',
        ],
        ['Beating cilia', '🌊', 2, 'Cilia and flagella have a core of microtubules.'],
      ],
    ),
    goDeeper:
      'Microfilaments (actin, ~7 nm) support cell shape, cell crawling, microvilli and cytokinesis. Intermediate filaments (~10 nm; keratins, vimentin, lamins in the nucleus, neurofilaments) give mechanical strength. Microtubules (~25 nm, tubulin dimers) organize from centrosomes, form the mitotic spindle and the core of cilia and flagella, and act as tracks for kinesin (usually outward) and dynein (usually inward) motors.\n\nIn reality, it’s a bit more complicated: the cytoskeleton is constantly built and torn down — microtubules show “dynamic instability”, growing and shrinking within seconds. Drugs such as taxol (which freezes microtubules) are used in chemotherapy because dividing cancer cells depend on a working spindle.',
    quiz: [
      mc(
        'Which fibers form the spindle that separates chromosomes?',
        ['Actin filaments', 'Intermediate filaments', 'Microtubules', 'Collagen'],
        2,
        'The mitotic spindle is built from microtubules.',
      ),
      mc(
        'What do motor proteins like kinesin do?',
        ['Make ATP', 'Carry cargo along microtubules', 'Copy DNA', 'Digest food'],
        1,
        'Motor proteins walk along microtubule highways carrying vesicles.',
      ),
      predict(
        'A cancer drug stops microtubules from shrinking or growing.',
        'Why might this stop tumors?',
        [
          'It feeds the cells',
          'Cells can’t build a working spindle, so they can’t divide',
          'It makes cells bigger',
          'It removes their DNA',
        ],
        1,
        'Without a working spindle, dividing cells get stuck.',
      ),
    ],
    relatedConcepts: ['mitosis', 'cilia-flagella', 'muscle-contraction'],
    funFact:
      'Kinesin motor proteins take “steps” of 8 nanometers and can walk about 100 steps every second.',
  },
  {
    id: 'apoptosis',
    title: 'Apoptosis: Programmed Cell Death',
    category: 'cell',
    tags: ['cell death', 'caspases', 'p53', 'cancer', 'development'],
    aliases: ['programmed cell death', 'cell suicide', 'caspase cascade'],
    difficulty: 3,
    rarity: 'common',
    summary: 'Sometimes the best thing a cell can do for the body is quietly self-destruct.',
    steps: steps(
      ['A tidy ending', 'Apoptosis is a planned, neat cell death that doesn’t harm neighbors.'],
      [
        'When it’s needed',
        'Damaged, infected or unneeded cells (like the webbing between baby fingers) are removed.',
      ],
      [
        'The cascade',
        'Signals switch on caspase enzymes that take the cell apart from the inside.',
      ],
      ['Clean-up', 'The cell breaks into neat packages that immune cells eat.'],
    ),
    interaction: cascade(
      'A cell’s DNA is badly damaged. Trigger the self-destruct sequence, then break a link.',
      ['Damage the DNA', '☢️'],
      [
        ['Damage detected', '🔍', 'Sensors notice DNA damage too severe to repair.'],
        [
          'p53 switches on',
          '🚨',
          'The guardian protein p53 builds up and orders the cell to die.',
          'With broken p53, the damaged cell ignores the order and keeps dividing — a step toward cancer.',
        ],
        [
          'Mitochondria release cytochrome c',
          '🔋',
          'Holes open in mitochondria and cytochrome c spills out — a point of no return.',
        ],
        [
          'Caspases activate',
          '✂️',
          'A chain of caspase enzymes switches on, each activating the next.',
          'If caspases are blocked, the cell can’t finish dying and may linger in a damaged state.',
        ],
        [
          'Cell packs itself up',
          '📦',
          'DNA is chopped, the cell shrinks and breaks into tidy membrane bubbles.',
        ],
        [
          'Eaten by macrophages',
          '🍽️',
          'Immune cells eat the packages without causing inflammation.',
        ],
      ],
      'Clean removal. The damaged cell is gone before it can cause trouble.',
    ),
    goDeeper:
      'Apoptosis can be triggered from inside (intrinsic pathway: DNA damage or stress → p53 → BAX/BAK pores in mitochondria → cytochrome c → apoptosome → caspase-9 → executioner caspases-3/7) or outside (extrinsic pathway: death receptors such as Fas → caspase-8). Dying cells flip phosphatidylserine to their outer surface as an “eat me” signal. Unlike necrosis, apoptosis doesn’t spill contents or cause inflammation.\n\nIn reality, it’s a bit more complicated: several other programmed death pathways exist (necroptosis, pyroptosis, ferroptosis), and the BCL-2 protein family carefully balances pro- and anti-death signals. Billions of your cells undergo apoptosis every day; too little contributes to cancer, too much to neurodegenerative disease.',
    quiz: [
      mc(
        'How is apoptosis different from cell death caused by injury?',
        [
          'It is messy and causes inflammation',
          'It is planned and tidy, without harming neighbors',
          'It only happens in plants',
          'It makes the cell divide',
        ],
        1,
        'Apoptosis is orderly; injury-caused necrosis spills contents and inflames tissue.',
      ),
      predict(
        'A cell has a broken p53 gene and then gets serious DNA damage.',
        'What is the risk?',
        [
          'It dies faster',
          'It keeps dividing with damaged DNA, which can lead to cancer',
          'It becomes a neuron',
          'Nothing',
        ],
        1,
        'p53 normally orders damaged cells to die; without it, they survive and divide.',
      ),
      mc(
        'Which is an example of apoptosis helping development?',
        [
          'Removing the webbing between fingers',
          'Growing taller',
          'Digesting food',
          'Making antibodies',
        ],
        0,
        'Cells between developing fingers die by apoptosis to separate them.',
      ),
    ],
    relatedConcepts: ['mitosis', 'telomeres', 'autophagy'],
    funFact: 'Your body removes roughly 50–70 billion cells by apoptosis every day.',
  },
  {
    id: 'autophagy',
    title: 'Autophagy: Self-Eating',
    category: 'cell',
    tags: ['recycling', 'fasting', 'lysosomes', 'cell cleanup', 'nutrients'],
    aliases: ['self eating', 'cellular recycling', 'autophagosome'],
    difficulty: 3,
    rarity: 'obscure',
    prerequisites: ['lysosomes'],
    summary: 'When food runs low, cells eat their own worn-out parts to survive — and clean house.',
    steps: steps(
      [
        'Housekeeping',
        'Cells wrap old or broken parts in a membrane bubble called an autophagosome.',
      ],
      [
        'Digest and reuse',
        'The bubble fuses with a lysosome, and the parts are broken down and reused.',
      ],
      ['Switched on by hunger', 'Low nutrients turn autophagy up; plenty of food turns it down.'],
    ),
    interaction: {
      template: 'feed-and-observe',
      config: {
        prompt:
          'Feed or starve the cell and watch autophagy clean up junk. Then try a cell with broken autophagy genes.',
        subject: { emoji: '🫧', label: 'Liver cell' },
        meters: [
          {
            id: 'food',
            label: 'Nutrients',
            unit: '%',
            min: 0,
            max: 100,
            start: 70,
            healthy: [30, 100],
            color: '#22c55e',
          },
          {
            id: 'junk',
            label: 'Damaged parts',
            unit: '%',
            min: 0,
            max: 100,
            start: 40,
            healthy: [0, 50],
            color: '#a855f7',
          },
        ],
        items: [
          {
            id: 'meal',
            label: 'Big meal',
            emoji: '🍝',
            note: 'Lots of nutrients: the cell turns autophagy down.',
            effects: [{ meter: 'food', amount: 40, seconds: 4 }],
          },
          {
            id: 'fast',
            label: 'Skip meals',
            emoji: '⏳',
            note: 'Nutrients drop. The cell starts looking for things to recycle.',
            effects: [{ meter: 'food', amount: -50, seconds: 5 }],
          },
          {
            id: 'stress',
            label: 'Toxins & stress',
            emoji: '☣️',
            note: 'Damaged proteins and broken mitochondria pile up.',
            effects: [{ meter: 'junk', amount: 35, seconds: 4 }],
          },
        ],
        responses: [
          {
            id: 'auto',
            label: 'Autophagy',
            emoji: '♻️',
            when: { meter: 'food', below: 40 },
            effect: { meter: 'junk', perSecond: -6 },
            message: 'Autophagy on! Junk is wrapped up and digested by lysosomes.',
          },
          {
            id: 'refuel',
            label: 'Recycled fuel',
            emoji: '🔋',
            when: { meter: 'food', below: 40 },
            effect: { meter: 'food', perSecond: 2 },
            message: 'Recycled building blocks become fuel to keep the cell alive.',
          },
        ],
        modes: [
          { id: 'normal', label: 'Healthy cell', description: 'Autophagy works normally.' },
          {
            id: 'broken',
            label: 'Autophagy genes broken',
            description:
              'Without autophagy genes, junk can’t be cleared and fasting can’t be survived for long.',
            responseScale: { auto: 0, refuel: 0 },
          },
        ],
        goal: { feeds: 4, tryAllModes: true },
      },
    },
    goDeeper:
      'In macroautophagy, a double-membraned phagophore engulfs cytoplasm and organelles to form an autophagosome, which fuses with a lysosome. The process is regulated by nutrient sensors: mTOR (active when nutrients are plentiful) blocks autophagy, while AMPK (active when energy is low) promotes it. Selective forms remove specific targets, such as damaged mitochondria (mitophagy). Yoshinori Ohsumi won the 2016 Nobel Prize for discovering autophagy genes in yeast.\n\nIn reality, it’s a bit more complicated: autophagy runs at a low level all the time, not only during fasting. It is linked to neurodegeneration, infection and cancer, but in cancer it can cut both ways — it prevents tumors early on, yet some established tumors use it to survive. Claims that particular diets “maximize autophagy” in humans are not well proven.',
    quiz: [
      mc(
        'What does “autophagy” literally mean?',
        ['Self-eating', 'Cell division', 'Light making', 'Water moving'],
        0,
        'From Greek: auto (self) + phagy (eating).',
      ),
      predict(
        'A cell runs low on nutrients.',
        'What happens to autophagy?',
        [
          'It switches off',
          'It increases, recycling parts for fuel',
          'The cell starts photosynthesis',
          'Nothing changes',
        ],
        1,
        'Low nutrients activate autophagy so the cell can survive.',
      ),
      mc(
        'Which organelle finally digests what autophagy collects?',
        ['Ribosome', 'Lysosome', 'Golgi', 'Nucleus'],
        1,
        'Autophagosomes fuse with lysosomes for digestion.',
      ),
    ],
    relatedConcepts: ['lysosomes', 'apoptosis', 'mitochondria'],
    funFact:
      'Yeast with broken autophagy genes die quickly when starved — that’s how the genes were first found.',
  },
  {
    id: 'endosymbiosis',
    title: 'Endosymbiotic Theory',
    category: 'cell',
    tags: ['mitochondria', 'chloroplasts', 'evolution', 'eukaryotes', 'bacteria'],
    aliases: ['endosymbiosis', 'origin of mitochondria', 'Lynn Margulis'],
    difficulty: 3,
    rarity: 'common',
    summary: 'Your mitochondria were once free-living bacteria that moved in and never left.',
    steps: steps(
      ['A bigger cell', 'Long ago, a larger cell (an archaeon) lived near oxygen-using bacteria.'],
      [
        'Swallowed, not digested',
        'It engulfed one, but instead of digesting it, the two began to cooperate.',
      ],
      ['A permanent team', 'Over generations, the bacterium became the mitochondrion.'],
      ['Twice!', 'Later, some cells swallowed photosynthetic bacteria, which became chloroplasts.'],
    ),
    interaction: timeline(
      'Scrub through about 2 billion years of teamwork.',
      [
        [
          'Two neighbors',
          'A large host cell lives alongside small bacteria that can use oxygen to make lots of energy.',
          [sh('host', 'blob', '#c4b5fd', 35, 50, 3.5), sh('bact', 'rod', '#fb923c', 75, 45, 0.9)],
          '~2 billion years ago',
        ],
        [
          'Engulfed',
          'The host wraps around a bacterium. Normally it would be digested…',
          [sh('host', 'blob', '#c4b5fd', 45, 50, 3.8), sh('bact', 'rod', '#fb923c', 55, 48, 0.9)],
        ],
        [
          'Living together',
          'The bacterium survives inside, sharing energy. The host offers food and shelter.',
          [
            sh('host', 'blob', '#c4b5fd', 50, 50, 4),
            sh('bact', 'bean', '#fb923c', 50, 50, 0.9),
            sh('nuc', 'circle', '#7c3aed', 35, 40, 1, { opacity: 0.7 }),
          ],
        ],
        [
          'Mitochondrion',
          'Over many generations, the partner loses genes and becomes a mitochondrion. Animal and fungus cells come from this line.',
          [
            sh('host', 'blob', '#c4b5fd', 50, 50, 4),
            sh('bact', 'bean', '#f97316', 60, 55, 0.8, { label: 'mitochondrion' }),
            sh('nuc', 'circle', '#7c3aed', 38, 40, 1),
          ],
        ],
        [
          'Second swallow',
          'Some of these cells engulfed photosynthetic cyanobacteria too.',
          [
            sh('host', 'blob', '#c4b5fd', 50, 50, 4),
            sh('bact', 'bean', '#f97316', 60, 58, 0.8),
            sh('nuc', 'circle', '#7c3aed', 38, 40, 1),
            sh('cyano', 'circle', '#22c55e', 70, 35, 0.8),
          ],
        ],
        [
          'Chloroplast',
          'The cyanobacteria became chloroplasts. This line led to algae and plants.',
          [
            sh('host', 'blob', '#bbf7d0', 50, 50, 4),
            sh('bact', 'bean', '#f97316', 60, 62, 0.8),
            sh('nuc', 'circle', '#7c3aed', 38, 40, 1),
            sh('cyano', 'bean', '#16a34a', 55, 38, 0.9, { label: 'chloroplast' }),
          ],
        ],
      ],
      [
        ['Stop when the bacterium is first swallowed.', 1],
        ['Stop when the partner has become a mitochondrion.', 3],
        ['Stop when chloroplasts appear.', 5],
      ],
      '#f5f3ff',
    ),
    goDeeper:
      'Evidence that mitochondria and chloroplasts descend from bacteria: they have two membranes; their own circular DNA; bacteria-like 70S ribosomes; they divide by binary fission; and their genes are most closely related to alphaproteobacteria (mitochondria) and cyanobacteria (chloroplasts). Lynn Margulis championed the theory in 1967 when it was widely doubted.\n\nIn reality, it’s a bit more complicated: most original bacterial genes moved into the host nucleus over time, so mitochondria now depend on proteins imported from the cell. The host was probably an archaeon related to today’s Asgard archaea. Some algae later swallowed other algae, giving chloroplasts with three or four membranes (secondary endosymbiosis).',
    quiz: [
      mc(
        'Which organelles came from engulfed bacteria?',
        [
          'Nucleus and Golgi',
          'Mitochondria and chloroplasts',
          'Ribosomes and lysosomes',
          'Cell wall and membrane',
        ],
        1,
        'Both mitochondria and chloroplasts are former bacteria.',
      ),
      mc(
        'Which clue supports endosymbiotic theory?',
        [
          'Mitochondria have their own circular DNA',
          'Mitochondria are found in bacteria',
          'Mitochondria make glucose',
          'Mitochondria have no membranes',
        ],
        0,
        'Circular DNA and bacteria-like ribosomes point to a bacterial origin.',
      ),
      predict(
        'Scientists compare mitochondrial genes to many bacteria.',
        'What would the theory predict?',
        [
          'They match no bacteria',
          'They are most similar to a particular group of bacteria',
          'They match viruses',
          'They match plant genes',
        ],
        1,
        'Mitochondrial genes are closest to alphaproteobacteria.',
      ),
    ],
    relatedConcepts: ['mitochondria', 'photosynthesis', 'horizontal-gene-transfer'],
    funFact:
      'Lynn Margulis’s endosymbiosis paper was rejected by about 15 journals before it was published.',
  },
  {
    id: 'cilia-flagella',
    title: 'Cilia & Flagella',
    category: 'cell',
    tags: ['movement', 'microtubules', 'sperm', 'airway', 'bacteria'],
    aliases: ['cilia', 'flagella', 'cell tails', 'how cells swim'],
    difficulty: 2,
    rarity: 'obscure',
    prerequisites: ['cytoskeleton'],
    summary: 'Some cells row with hundreds of tiny hairs; others whip a single long tail.',
    steps: steps(
      ['Tiny oars', 'Cilia are short hair-like structures that beat together like oars.'],
      ['Long whips', 'Flagella are long tails that whip or spin to push a cell along.'],
      ['Moving fluid', 'Cilia can also move fluid past a cell, like mucus up your airway.'],
    ),
    interaction: sorting(
      'Does each example use cilia or a flagellum?',
      [
        ['Cilia', '〰️', 'Many short beating hairs'],
        ['Flagellum', '➰', 'One (or a few) long tails'],
      ],
      [
        ['Sperm cell', '🏊', 1, 'Human sperm swim with a single whip-like flagellum.'],
        ['Airway lining', '🫁', 0, 'Cilia sweep mucus and trapped dust up out of your lungs.'],
        ['Paramecium', '🦠', 0, 'Paramecium is covered in cilia that row it through pond water.'],
        [
          'E. coli bacterium',
          '🧫',
          1,
          'Bacteria spin flagella like propellers (built very differently from ours!).',
        ],
        ['Fallopian tube lining', '🥚', 0, 'Cilia gently move the egg toward the uterus.'],
        ['Euglena', '🌿', 1, 'Euglena pulls itself along with a flagellum.'],
      ],
    ),
    goDeeper:
      'Eukaryotic cilia and flagella share a “9+2” arrangement of microtubules (the axoneme), with dynein motors that make neighboring microtubule pairs slide and bend. Primary cilia, found on most human cells, don’t beat — they act as antennae for signals. Defects cause ciliopathies; in primary ciliary dyskinesia, people get frequent lung infections, and some have their organs mirror-reversed because cilia set up left–right asymmetry in the embryo.\n\nIn reality, it’s a bit more complicated: bacterial flagella are completely different machines from eukaryotic ones — they are rigid corkscrews spun by a rotary motor powered by ion flow, not whips bent by dynein. Smoking paralyzes airway cilia, which is one reason smokers cough up mucus.',
    quiz: [
      mc(
        'What do cilia in your airway do?',
        ['Make oxygen', 'Sweep mucus and dust upward', 'Digest food', 'Send nerve signals'],
        1,
        'They act like a conveyor belt clearing your lungs.',
      ),
      mc(
        'What powers the bending of eukaryotic cilia?',
        ['Dynein motors on microtubules', 'Sunlight', 'Actin rings', 'Water pressure'],
        0,
        'Dynein makes microtubule pairs slide, bending the cilium.',
      ),
      predict(
        'A person’s cilia don’t beat properly from birth.',
        'What problem is likely?',
        ['Frequent lung infections', 'Extra-strong bones', 'Better eyesight', 'No problems at all'],
        0,
        'Without working cilia, mucus and germs aren’t cleared from the lungs.',
      ),
    ],
    relatedConcepts: ['cytoskeleton', 'bacteria-vs-viruses', 'fertilization'],
    funFact: 'A bacterial flagellum motor can spin over 100,000 revolutions per minute.',
  },
  {
    id: 'cell-signaling',
    title: 'Cell Signaling',
    category: 'cell',
    tags: ['receptors', 'hormones', 'ligands', 'communication', 'drugs'],
    aliases: ['cell communication', 'receptors and ligands', 'signal transduction'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['cell-membrane'],
    summary: 'Cells talk by sending molecules that fit receptors like keys in locks.',
    steps: steps(
      [
        'Messages',
        'Cells release signal molecules: hormones, neurotransmitters and growth factors.',
      ],
      ['Receptors', 'Only cells with the matching receptor “hear” the message.'],
      ['Relay inside', 'A bound receptor triggers a chain of reactions inside the cell.'],
      ['Blocking', 'Many medicines work by blocking receptors so the real signal can’t bind.'],
    ),
    interaction: lockKey(
      'Deliver each signal to the receptor it fits. Watch out for the drug that blocks!',
      [
        ['Adrenaline receptor', 'triangle', '#ef4444', 'On heart cells'],
        ['Insulin receptor', 'square', '#f59e0b', 'On muscle and fat cells'],
        ['Acetylcholine receptor', 'circle', '#3b82f6', 'On muscle fibers'],
        ['Estrogen receptor', 'star', '#ec4899', 'Inside many cells'],
      ],
      [
        ['Adrenaline', 'triangle', '#ef4444', 0, 'Heart rate speeds up — fight or flight!'],
        ['Insulin', 'square', '#f59e0b', 1, 'Glucose doors open and sugar flows in.'],
        ['Acetylcholine', 'circle', '#3b82f6', 2, 'The muscle fiber contracts.'],
        [
          'Estrogen',
          'star',
          '#ec4899',
          3,
          'Estrogen slips through the membrane and switches genes on inside the cell.',
        ],
        [
          'Glucagon',
          'hexagon',
          '#a855f7',
          null,
          'Glucagon needs its own receptor (on liver cells) — none of these fit.',
        ],
      ],
    ),
    goDeeper:
      'Signaling can be endocrine (hormones through blood), paracrine (to nearby cells), autocrine (to itself) or synaptic. Water-soluble signals bind membrane receptors — G-protein-coupled receptors, receptor tyrosine kinases (like the insulin receptor) or ion channels (like the acetylcholine receptor) — and trigger second messengers such as cAMP and calcium. Lipid-soluble signals like steroid hormones cross the membrane and bind intracellular receptors that act as transcription factors.\n\nIn reality, it’s a bit more complicated: “lock and key” captures specificity, but binding is about strength (affinity), and one signal can have different effects in different cells. Drugs that bind and activate a receptor are agonists; ones that block it are antagonists (beta-blockers, for example, block adrenaline receptors on the heart).',
    quiz: [
      mc(
        'Why does adrenaline affect the heart but not every cell?',
        [
          'It only travels to the heart',
          'Only cells with the right receptor respond',
          'Other cells are asleep',
          'It is too big for other cells',
        ],
        1,
        'Cells respond only if they have the matching receptor.',
      ),
      predict(
        'A drug fits into the adrenaline receptor but doesn’t activate it.',
        'What happens when adrenaline arrives?',
        [
          'The heart speeds up more',
          'Adrenaline can’t bind, so its effect is reduced',
          'The drug turns into adrenaline',
          'Nothing can be predicted',
        ],
        1,
        'This is how beta-blockers work: they block the receptor.',
      ),
      mc(
        'How do steroid hormones like estrogen reach their receptors?',
        [
          'They pass through the membrane to receptors inside',
          'They stay outside the cell',
          'They are carried by red blood cells into the nucleus',
          'They are digested first',
        ],
        0,
        'Lipid-soluble hormones cross the membrane and bind receptors inside the cell.',
      ),
    ],
    relatedConcepts: ['insulin', 'synapses', 'hormones-feedback'],
    funFact:
      'About a third of all approved drugs target one family of receptors: G-protein-coupled receptors.',
  },
  {
    id: 'stem-cells',
    title: 'Stem Cells',
    category: 'cell',
    tags: ['differentiation', 'embryo', 'regeneration', 'pluripotent', 'medicine'],
    aliases: ['stem cell', 'pluripotent cells', 'cell differentiation', 'iPS cells'],
    difficulty: 2,
    rarity: 'common',
    summary: 'Stem cells are blank-slate cells that can become many other kinds of cells.',
    steps: steps(
      ['Unspecialized', 'Most cells have one job. Stem cells haven’t chosen yet.'],
      ['Two talents', 'They can copy themselves AND turn into specialized cells.'],
      ['Levels of power', 'Some can become anything; others only a few related types.'],
    ),
    interaction: sorting(
      'Sort each cell by how many cell types it can become.',
      [
        ['Totipotent', '🌟', 'Can make everything, even the placenta'],
        ['Pluripotent', '✨', 'Can make any body cell'],
        ['Multipotent', '🔆', 'Can make a family of related cells'],
        ['Specialized', '🎯', 'Already has its job'],
      ],
      [
        [
          'Fertilized egg (zygote)',
          '🥚',
          0,
          'The zygote can build an entire organism plus the placenta.',
        ],
        [
          'Embryonic stem cell',
          '🧫',
          1,
          'Cells from an early embryo can become any cell in the body.',
        ],
        [
          'Induced stem cell (iPS)',
          '🔬',
          1,
          'Adult skin cells can be reprogrammed to behave like embryonic stem cells.',
        ],
        [
          'Blood stem cell',
          '🩸',
          2,
          'In bone marrow, these make all blood cell types — but not neurons.',
        ],
        ['Neural stem cell', '🧠', 2, 'These make neurons and glial cells.'],
        [
          'Red blood cell',
          '🔴',
          3,
          'Red blood cells are fully specialized (they don’t even have a nucleus).',
        ],
        ['Neuron', '⚡', 3, 'Most neurons never divide again.'],
      ],
    ),
    goDeeper:
      'Stem cells self-renew and differentiate. Potency decreases during development: totipotent (zygote and very early cells) → pluripotent (inner cell mass, embryonic stem cells) → multipotent (adult tissue stem cells such as hematopoietic stem cells) → unipotent → terminally differentiated. In 2006, Shinya Yamanaka showed that four transcription factors can reprogram adult cells into induced pluripotent stem cells (Nobel Prize 2012).\n\nIn reality, it’s a bit more complicated: the boundaries between categories are blurry, and some “specialized” cells can switch identities under the right conditions. Bone marrow transplants are a long-established stem cell therapy, but many clinics selling unproven stem cell treatments make claims with no scientific support.',
    quiz: [
      mc(
        'What two things can stem cells do?',
        [
          'Photosynthesize and divide',
          'Copy themselves and become specialized cells',
          'Make antibodies and hormones',
          'Carry oxygen and fight germs',
        ],
        1,
        'Self-renewal and differentiation are the two hallmarks of stem cells.',
      ),
      mc(
        'Which is a multipotent stem cell?',
        ['Zygote', 'Blood stem cell in bone marrow', 'Red blood cell', 'Mature neuron'],
        1,
        'Blood stem cells make all blood cell types, but only blood cells.',
      ),
      predict(
        'Scientists add four special genes to a person’s skin cell.',
        'What can it become?',
        ['Nothing — it stays skin', 'An induced pluripotent stem cell', 'A bacterium', 'A virus'],
        1,
        'Yamanaka factors reprogram adult cells into iPS cells.',
      ),
    ],
    relatedConcepts: ['regeneration', 'embryo-development', 'mitosis'],
    funFact: 'Your bone marrow makes about 2 million new red blood cells every second.',
  },
  {
    id: 'telomeres',
    title: 'Telomeres & Aging',
    category: 'cell',
    tags: ['chromosomes', 'aging', 'telomerase', 'cell division', 'cancer'],
    aliases: ['telomerase', 'Hayflick limit', 'chromosome caps', 'why cells age'],
    difficulty: 3,
    rarity: 'obscure',
    prerequisites: ['dna-replication'],
    summary:
      'Chromosome tips get a little shorter every time a cell divides — a built-in countdown.',
    steps: steps(
      [
        'Protective caps',
        'Telomeres are repeating DNA (TTAGGG…) at the ends of chromosomes, like plastic tips on shoelaces.',
      ],
      [
        'Shrinking',
        'Copying machinery can’t copy the very end, so telomeres shorten with each division.',
      ],
      ['Time’s up', 'When they get too short, the cell stops dividing — the Hayflick limit.'],
      ['Telomerase', 'Stem cells and most cancer cells use telomerase to rebuild their telomeres.'],
    ),
    interaction: slider({
      prompt: 'Divide a cell many times. Can telomerase keep its telomeres long?',
      inputs: [
        { id: 'divisions', label: 'Number of divisions', min: 0, max: 80, step: 1, start: 10 },
        {
          id: 'telomerase',
          label: 'Telomerase activity',
          unit: '%',
          min: 0,
          max: 100,
          step: 5,
          start: 0,
        },
      ],
      output: {
        label: 'Telomere length',
        unit: '% of original',
        max: 100,
        expr: 'clamp(100 - divisions * 1.6 * (1 - telomerase / 100), 0, 100)',
      },
      readouts: [
        {
          label: 'Can still divide?',
          unit: '(1 = yes, 0 = no)',
          expr: 'step(100 - divisions * 1.6 * (1 - telomerase / 100) - 20, 1, 0)',
        },
      ],
      graphInput: 'divisions',
      visual: { kind: 'growth', emoji: '🧬' },
      challenges: [
        {
          prompt: 'With no telomerase, divide until telomeres are critically short (under 20%).',
          target: { max: 20 },
          explain:
            'That’s around 50 divisions — close to the real Hayflick limit for human cells in a dish.',
        },
        {
          prompt: 'Now keep telomeres long (over 90%) even after 60+ divisions.',
          target: { min: 90 },
          explain:
            'Plenty of telomerase rebuilds the tips. Stem cells do this — and so do most cancer cells.',
        },
      ],
    }),
    goDeeper:
      'Because DNA polymerase needs a primer and only builds 5′→3′, the lagging strand can’t be fully copied at chromosome ends (the end-replication problem). Human telomeres are thousands of TTAGGG repeats, protected by a protein complex called shelterin. Telomerase is a reverse transcriptase that carries its own RNA template to add repeats. Leonard Hayflick showed in 1961 that normal human cells divide only about 40–60 times in culture.\n\nIn reality, it’s a bit more complicated: the slider makes shortening steady, but real loss per division varies, and stress and oxidative damage can speed it up. Short telomeres are linked to aging, but they are one factor among many; and simply boosting telomerase isn’t a fountain of youth, because unlimited division is also a hallmark of cancer.',
    quiz: [
      mc(
        'Why do telomeres shorten each time a cell divides?',
        [
          'The cell eats them',
          'Copying machinery can’t copy the very ends of chromosomes',
          'Sunlight destroys them',
          'They are cut off on purpose by ribosomes',
        ],
        1,
        'This is the end-replication problem.',
      ),
      predict(
        'A normal human skin cell is grown in a dish for many months.',
        'What eventually happens?',
        [
          'It divides forever',
          'It stops dividing after roughly 50 divisions',
          'It becomes a stem cell',
          'It turns into a bacterium',
        ],
        1,
        'Short telomeres trigger the Hayflick limit.',
      ),
      mc(
        'Why do many cancer cells switch telomerase back on?',
        [
          'To slow down',
          'So they can keep dividing without hitting the limit',
          'To make ATP',
          'To attract immune cells',
        ],
        1,
        'Telomerase lets cancer cells avoid the division countdown.',
      ),
    ],
    relatedConcepts: ['dna-replication', 'apoptosis', 'stem-cells'],
    funFact:
      'Elizabeth Blackburn, Carol Greider and Jack Szostak won the 2009 Nobel Prize for discovering how telomerase protects chromosomes.',
  },
];
