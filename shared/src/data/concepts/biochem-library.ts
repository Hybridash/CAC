import type { Concept } from '../../types';
import { assembly, label, lockKey, mc, predict, slider, sorting, steps } from './helpers';

export const biochemLibrary: Concept[] = [
  {
    id: 'enzyme-inhibition',
    title: 'Enzyme Inhibition',
    category: 'biochem',
    tags: ['inhibitors', 'competitive', 'noncompetitive', 'allosteric', 'drugs', 'active site'],
    aliases: [
      'competitive inhibition',
      'noncompetitive inhibition',
      'allosteric inhibition',
      'how drugs block enzymes',
    ],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['enzymes'],
    summary:
      'Many medicines and poisons work by jamming an enzyme — either plugging its keyhole or bending it out of shape.',
    steps: steps(
      ['The keyhole', 'An enzyme’s active site fits its substrate like a key in a lock.'],
      [
        'Competitive inhibitors',
        'Look-alike molecules sit in the active site and block the real substrate.',
      ],
      [
        'Noncompetitive inhibitors',
        'Others bind somewhere else (an allosteric site) and warp the enzyme’s shape.',
      ],
      ['Useful jams', 'Aspirin, penicillin and many other drugs are enzyme inhibitors.'],
    ),
    interaction: lockKey(
      'Two enzymes, three binding sites. Which molecules react, and which jam the works?',
      [
        ['Enzyme A active site', 'circle', '#22c55e', 'Normally breaks down its substrate'],
        ['Enzyme B active site', 'star', '#3b82f6', 'Its keyhole'],
        ['Enzyme B allosteric site', 'hexagon', '#a855f7', 'A side pocket'],
      ],
      [
        [
          'Substrate A',
          'circle',
          '#22c55e',
          0,
          'Perfect fit — reaction! Products are released and the enzyme is ready again.',
        ],
        [
          'Competitive inhibitor',
          'star',
          '#ef4444',
          1,
          'It fits the active site but doesn’t react, so the real substrate can’t get in. Adding lots of substrate can outcompete it.',
          'block',
        ],
        [
          'Noncompetitive inhibitor',
          'hexagon',
          '#f97316',
          2,
          'It binds the side pocket and bends the enzyme, so the active site no longer fits. More substrate won’t help.',
          'block',
        ],
        [
          'Wrong substrate',
          'triangle',
          '#64748b',
          null,
          'Doesn’t fit any site — enzymes are picky.',
        ],
      ],
    ),
    goDeeper:
      'Reversible inhibitors bind non-covalently. Competitive inhibitors resemble the substrate and compete for the active site: they raise the apparent Km but Vmax is unchanged (enough substrate wins). Noncompetitive inhibitors bind elsewhere and lower Vmax. Irreversible inhibitors bond covalently — aspirin acetylates cyclooxygenase, penicillin blocks the transpeptidase that builds bacterial cell walls, and nerve agents block acetylcholinesterase. Cells use allosteric feedback inhibition to regulate pathways: the end product inhibits an early enzyme.\n\nIn reality, it’s a bit more complicated: there are also uncompetitive and mixed inhibitors, and allosteric binding can activate enzymes as well as inhibit them. The shapes in the game stand in for the 3D fit and chemical interactions between molecules.',
    quiz: [
      mc(
        'Where does a competitive inhibitor bind?',
        ['The active site', 'The DNA', 'An allosteric site', 'The cell wall'],
        0,
        'It competes with the substrate for the active site.',
      ),
      predict(
        'You add a huge amount of substrate to an enzyme blocked by a competitive inhibitor.',
        'What happens?',
        [
          'The reaction speeds back up',
          'Nothing changes',
          'The enzyme is destroyed',
          'The inhibitor turns into substrate',
        ],
        0,
        'Lots of substrate can outcompete the inhibitor for the active site.',
      ),
      label(
        'Match each inhibitor to how it works.',
        [
          ['Competitive', 'Blocks the active site'],
          ['Noncompetitive', 'Binds elsewhere and changes the enzyme’s shape'],
          ['Irreversible', 'Bonds permanently to the enzyme'],
        ],
        'Different ways to jam an enzyme.',
      ),
    ],
    relatedConcepts: ['enzymes', 'antibiotic-resistance', 'electron-transport-chain'],
    funFact:
      'Penicillin works by inhibiting an enzyme bacteria need to build their cell walls, so they burst.',
  },
  {
    id: 'protein-folding',
    title: 'Protein Folding',
    category: 'biochem',
    tags: ['proteins', 'amino acids', 'alpha helix', 'beta sheet', 'structure', 'chaperones'],
    aliases: ['protein structure', 'primary secondary tertiary quaternary', 'how proteins fold'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['translation'],
    summary:
      'A protein is a long chain that folds itself into a precise 3D shape — and shape is everything.',
    steps: steps(
      ['A chain of beads', 'Proteins start as a chain of amino acids (the primary structure).'],
      ['Local twists', 'Parts coil into helices or zigzag into sheets (secondary structure).'],
      ['The full fold', 'The whole chain folds into a 3D shape (tertiary structure).'],
      [
        'Teamwork',
        'Some proteins join several chains together (quaternary structure), like hemoglobin.',
      ],
    ),
    interaction: assembly(
      'Fold a hemoglobin protein: put the levels of structure in order.',
      [
        ['Primary: amino acid chain', '📿', 'The exact order of amino acids, set by the gene.'],
        [
          'Secondary: helices & sheets',
          '🌀',
          'Hydrogen bonds coil the backbone into α-helices or β-sheets.',
        ],
        [
          'Tertiary: 3D fold',
          '🧶',
          'The helices and sheets pack into a compact shape, hiding oily parts inside.',
        ],
        [
          'Quaternary: chains join',
          '🧩',
          'Four folded chains assemble into one hemoglobin molecule.',
        ],
      ],
      'Folded! Hemoglobin’s shape lets it grab oxygen in the lungs and release it in tissues.',
      {
        distractors: [
          ['Double helix', '🧬', 'That’s DNA’s structure, not a protein folding level.'],
        ],
      },
    ),
    goDeeper:
      'Anfinsen showed in the 1950s–60s that a protein’s sequence contains the information for its fold. Folding is driven largely by the hydrophobic effect (oily side chains bury themselves away from water), plus hydrogen bonds, ionic interactions and disulfide bridges. Chaperone proteins help many proteins fold correctly and prevent clumping. Misfolding underlies diseases such as Alzheimer’s, Parkinson’s and prion diseases. AlphaFold, an AI system, now predicts most protein structures from sequence (Nobel Prize in Chemistry 2024).\n\nIn reality, it’s a bit more complicated: folding isn’t strictly step-by-step — secondary and tertiary structure often form together in a fraction of a second, and some proteins (intrinsically disordered proteins) never settle into one fixed shape.',
    quiz: [
      mc(
        'What determines how a protein folds?',
        [
          'Its amino acid sequence',
          'The size of the cell',
          'The color of the cell',
          'Random chance only',
        ],
        0,
        'The sequence holds the folding instructions.',
      ),
      label(
        'Match each level of structure.',
        [
          ['Primary', 'Order of amino acids'],
          ['Secondary', 'Helices and sheets'],
          ['Quaternary', 'Several chains together'],
        ],
        'Four levels build up the final protein.',
      ),
      predict(
        'A high fever unfolds some of a protein’s helices.',
        'What happens to the protein’s job?',
        [
          'It works better',
          'It may stop working because its shape changed',
          'It becomes DNA',
          'Nothing',
        ],
        1,
        'Shape determines function, so unfolding (denaturing) disrupts it.',
      ),
    ],
    relatedConcepts: ['translation', 'prions', 'enzymes'],
    funFact:
      'If a protein tried every possible shape at random, folding would take longer than the age of the universe — yet most fold in milliseconds.',
  },
  {
    id: 'ph-buffers',
    title: 'pH & Buffers',
    category: 'biochem',
    tags: ['acid', 'base', 'blood pH', 'bicarbonate', 'homeostasis'],
    aliases: ['acids and bases', 'blood pH', 'buffer systems', 'acidosis'],
    difficulty: 3,
    rarity: 'common',
    summary:
      'Your blood stays at almost exactly pH 7.4, thanks to chemical sponges called buffers.',
    steps: steps(
      ['The pH scale', 'pH measures acidity: low is acidic, high is basic, 7 is neutral.'],
      ['A narrow window', 'Blood must stay between about 7.35 and 7.45.'],
      ['Chemical sponges', 'Buffers soak up extra acid or base to keep pH steady.'],
      ['Backup systems', 'Your lungs (breathing out CO₂) and kidneys adjust pH too.'],
    ),
    interaction: {
      template: 'feed-and-observe',
      config: {
        prompt:
          'Add acids and bases to the blood and watch the buffers fight back. Then use up the buffer!',
        subject: { emoji: '🩸', label: 'Blood' },
        meters: [
          {
            id: 'ph',
            label: 'Blood pH',
            min: 6.8,
            max: 8,
            start: 7.4,
            healthy: [7.35, 7.45],
            color: '#06b6d4',
          },
        ],
        items: [
          {
            id: 'sprint',
            label: 'Hard sprint',
            emoji: '🏃',
            note: 'Working muscles release acid (lactate and CO₂).',
            effects: [{ meter: 'ph', amount: -0.3, seconds: 4 }],
          },
          {
            id: 'hold',
            label: 'Hold your breath',
            emoji: '😶',
            note: 'CO₂ builds up and forms carbonic acid.',
            effects: [{ meter: 'ph', amount: -0.2, seconds: 4 }],
          },
          {
            id: 'hyper',
            label: 'Breathe very fast',
            emoji: '😮‍💨',
            note: 'Breathing out lots of CO₂ removes acid, so pH rises.',
            effects: [{ meter: 'ph', amount: 0.25, seconds: 4 }],
          },
          {
            id: 'antacid',
            label: 'Too many antacids',
            emoji: '💊',
            note: 'Excess base pushes pH up.',
            effects: [{ meter: 'ph', amount: 0.3, seconds: 5 }],
          },
        ],
        responses: [
          {
            id: 'bicarb',
            label: 'Bicarbonate soaks up acid',
            emoji: '🧽',
            when: { meter: 'ph', below: 7.38 },
            effect: { meter: 'ph', perSecond: 0.06 },
            message: 'Bicarbonate (HCO₃⁻) grabs extra H⁺ ions, pulling pH back up.',
          },
          {
            id: 'acidbuf',
            label: 'Buffer releases H⁺',
            emoji: '💧',
            when: { meter: 'ph', above: 7.42 },
            effect: { meter: 'ph', perSecond: -0.06 },
            message: 'Carbonic acid releases H⁺ to bring pH back down.',
          },
          {
            id: 'breath',
            label: 'Breathing speeds up',
            emoji: '🫁',
            when: { meter: 'ph', below: 7.3 },
            effect: { meter: 'ph', perSecond: 0.04 },
            message: 'Your brain makes you breathe faster to blow off acid-forming CO₂.',
          },
        ],
        modes: [
          {
            id: 'normal',
            label: 'Healthy buffers',
            description: 'Buffers and breathing keep pH steady.',
          },
          {
            id: 'used',
            label: 'Buffer used up',
            description:
              'If the bicarbonate buffer runs low (as in severe illness), pH swings wildly.',
            responseScale: { bicarb: 0.1, acidbuf: 0.1 },
          },
        ],
        goal: { feeds: 4, tryAllModes: true },
      },
    },
    goDeeper:
      'pH = −log[H⁺], so each pH unit is a tenfold change in hydrogen ion concentration. The main blood buffer is the bicarbonate system: CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻. Lungs control CO₂ within minutes; kidneys excrete H⁺ and reclaim bicarbonate over hours to days. Proteins (including hemoglobin) and phosphate also buffer. Acidosis (pH < 7.35) and alkalosis (pH > 7.45) can be respiratory or metabolic in origin.\n\nIn reality, it’s a bit more complicated: the simulation speeds everything up, and real buffering happens almost instantly while breathing and kidney responses take minutes to days. Stomach acid (pH ~1.5–3.5) and other body compartments have very different pH values from blood.',
    quiz: [
      mc(
        'What is the normal pH of human blood?',
        ['About 2', 'About 7.4', 'About 10', 'Exactly 7.0'],
        1,
        'Blood is slightly basic, around 7.35–7.45.',
      ),
      predict(
        'Someone holds their breath for a long time.',
        'What happens to their blood pH at first?',
        ['It rises', 'It falls (more acidic) as CO₂ builds up', 'Nothing', 'It becomes 14'],
        1,
        'Extra CO₂ forms carbonic acid, lowering pH.',
      ),
      mc(
        'What does a buffer do?',
        [
          'Speeds up reactions',
          'Resists changes in pH',
          'Makes pH exactly 7',
          'Turns acids into water instantly',
        ],
        1,
        'Buffers absorb added acid or base, keeping pH stable.',
      ),
    ],
    relatedConcepts: ['enzymes', 'breathing', 'kidneys'],
    funFact: 'A blood pH below about 6.8 or above about 7.8 is usually not survivable.',
  },
  {
    id: 'c4-cam',
    title: 'C4 & CAM Photosynthesis',
    category: 'biochem',
    tags: ['photosynthesis', 'desert plants', 'corn', 'cactus', 'Rubisco', 'water saving'],
    aliases: ['C4 plants', 'CAM plants', 'photorespiration', 'desert photosynthesis'],
    difficulty: 4,
    rarity: 'obscure',
    prerequisites: ['photosynthesis'],
    summary: 'Hot, dry places pushed some plants to invent clever photosynthesis tricks.',
    steps: steps(
      [
        'The problem',
        'In heat, the CO₂-grabbing enzyme Rubisco often grabs oxygen by mistake, wasting energy.',
      ],
      [
        'C4 trick',
        'Corn and sugarcane first capture CO₂ in one cell type, then pump it to Rubisco in another.',
      ],
      [
        'CAM trick',
        'Cacti and pineapples open their pores only at night, storing CO₂ for daytime.',
      ],
      ['C3 plants', 'Most plants (wheat, rice, trees) use the ordinary way.'],
    ),
    interaction: sorting(
      'Sort each plant by its photosynthesis strategy.',
      [
        ['C3 (standard)', '🌳', 'Most plants; best in cool, moist places'],
        ['C4 (split between cells)', '🌽', 'Hot, sunny grasslands'],
        ['CAM (night shift)', '🌵', 'Deserts; opens pores at night'],
      ],
      [
        ['Wheat', '🌾', 0, 'Wheat is a C3 plant.'],
        [
          'Rice',
          '🍚',
          0,
          'Rice is C3 — scientists are trying to engineer C4 rice for higher yields.',
        ],
        ['Oak tree', '🌳', 0, 'Nearly all trees are C3.'],
        ['Corn (maize)', '🌽', 1, 'Corn concentrates CO₂ around Rubisco using C4 photosynthesis.'],
        ['Sugarcane', '🎋', 1, 'Sugarcane is a highly productive C4 grass.'],
        ['Pineapple', '🍍', 2, 'Pineapples are CAM plants.'],
        ['Cactus', '🌵', 2, 'Cacti store CO₂ at night as acids, then use it by day.'],
        ['Aloe vera', '🪴', 2, 'Aloe is a CAM succulent.'],
      ],
    ),
    goDeeper:
      'Rubisco can fix O₂ instead of CO₂, triggering photorespiration, which wastes carbon and energy — especially when it is hot and stomata are closed to save water. C4 plants fix CO₂ first with PEP carboxylase (which ignores O₂) in mesophyll cells into four-carbon acids, then release CO₂ around Rubisco in bundle-sheath cells (Kranz anatomy). CAM plants separate the steps in time: they open stomata at night, store CO₂ as malic acid in vacuoles, and run the Calvin cycle by day with stomata closed.\n\nIn reality, it’s a bit more complicated: C4 has evolved independently more than 60 times, and some plants can switch between C3 and CAM depending on drought. C4 plants make up only a few percent of plant species but about a quarter of land photosynthesis.',
    quiz: [
      mc(
        'Why do CAM plants open their pores at night?',
        [
          'To catch moonlight',
          'To take in CO₂ while losing less water',
          'To release oxygen',
          'To sleep',
        ],
        1,
        'Cooler night air means less water lost through open stomata.',
      ),
      mc(
        'Which plant is a C4 plant?',
        ['Wheat', 'Corn', 'Oak', 'Rice'],
        1,
        'Corn uses C4 photosynthesis.',
      ),
      predict(
        'A hot, dry summer stresses a field of wheat (C3) next to a field of corn (C4).',
        'Which is likely to photosynthesize more efficiently?',
        ['Wheat', 'Corn', 'Both the same', 'Neither photosynthesizes in summer'],
        1,
        'C4 plants avoid much of the photorespiration that slows C3 plants in heat.',
      ),
    ],
    relatedConcepts: ['photosynthesis', 'transpiration', 'enzymes'],
    funFact:
      'CAM is named after the stonecrop family (Crassulaceae), where the night-time acid buildup was first noticed — the leaves taste sour in the morning.',
  },
  {
    id: 'fermentation',
    title: 'Fermentation',
    category: 'biochem',
    tags: ['yeast', 'bread', 'anaerobic', 'lactic acid', 'ethanol', 'CO2'],
    aliases: [
      'anaerobic respiration',
      'how bread rises',
      'yeast fermentation',
      'lactic acid fermentation',
    ],
    difficulty: 2,
    rarity: 'common',
    summary:
      'Without oxygen, yeast and muscles still squeeze a little energy from sugar — with bubbly or sour leftovers.',
    steps: steps(
      ['No oxygen needed', 'Fermentation gets energy from sugar without using oxygen.'],
      ['Yeast makes bubbles', 'Yeast turns sugar into carbon dioxide (bubbles) and alcohol.'],
      ['Muscles make lactate', 'Your muscles turn sugar into lactate when oxygen runs short.'],
      ['Less energy', 'It makes far less ATP than respiration with oxygen.'],
    ),
    interaction: slider({
      prompt: 'Make bread dough rise! Change the sugar and the temperature for the yeast.',
      inputs: [
        { id: 'sugar', label: 'Sugar', unit: 'spoons', min: 0, max: 5, step: 0.5, start: 1 },
        { id: 'temp', label: 'Dough temperature', unit: '°C', min: 0, max: 70, step: 1, start: 15 },
      ],
      output: {
        label: 'CO₂ bubbles (dough rising)',
        unit: '%',
        max: 100,
        expr: '100 * sat(sugar + 0.3, 1) / sat(5.3, 1) * gauss(temp, 35, 9) * (1 - sig(temp, 50, 2))',
      },
      graphInput: 'temp',
      visual: { kind: 'bubbles', emoji: '🫧' },
      challenges: [
        {
          prompt: 'Get the dough rising fast (over 75%).',
          target: { min: 75 },
          explain: 'Warm (about 30–38 °C) with enough sugar: yeast ferment happily.',
        },
        {
          prompt: 'Make the yeast stop completely by getting it too hot (under 3%).',
          target: { max: 3 },
          explain: 'Above about 50–60 °C, yeast die. That’s why bread stops rising in the oven.',
        },
      ],
    }),
    goDeeper:
      'Glycolysis makes 2 ATP and 2 NADH per glucose. Without oxygen, cells must recycle NADH back to NAD⁺ to keep glycolysis going. Alcoholic fermentation (yeast) converts pyruvate to ethanol and CO₂; lactic acid fermentation (muscle, many bacteria) converts pyruvate to lactate. Fermentation makes yogurt, cheese, sauerkraut, kimchi, bread, beer and soy sauce.\n\nIn reality, it’s a bit more complicated: “lactic acid causes muscle soreness the next day” is a myth — lactate is cleared within an hour and is even used as fuel; next-day soreness comes from muscle micro-damage. The alcohol in bread dough mostly evaporates during baking. The slider’s curve is a simplified yeast activity model.',
    quiz: [
      mc(
        'What makes bread dough rise?',
        [
          'Oxygen from yeast',
          'Carbon dioxide from yeast fermentation',
          'Steam from flour',
          'Lactic acid',
        ],
        1,
        'Yeast release CO₂ bubbles that get trapped in the dough.',
      ),
      mc(
        'Why does fermentation make less ATP than aerobic respiration?',
        [
          'It uses more sugar',
          'It stops after glycolysis without using the mitochondria’s full process',
          'It needs light',
          'It makes proteins instead',
        ],
        1,
        'Only glycolysis produces ATP in fermentation (2 per glucose vs ~30).',
      ),
      predict(
        'You put dough in a 90 °C oven.',
        'What happens to fermentation?',
        [
          'It speeds up forever',
          'The yeast die and fermentation stops',
          'The yeast start photosynthesis',
          'The dough makes oxygen',
        ],
        1,
        'High heat kills yeast.',
      ),
    ],
    relatedConcepts: ['glycolysis', 'mitochondria', 'fungi'],
    funFact:
      'Humans have been fermenting foods for at least 9,000 years — chemical traces of fermented drinks were found in ancient Chinese pottery.',
  },
  {
    id: 'glycolysis',
    title: 'Glycolysis',
    category: 'biochem',
    tags: ['glucose', 'pyruvate', 'ATP', 'NADH', 'respiration', 'metabolism'],
    aliases: ['sugar splitting', 'first step of respiration', 'glucose breakdown'],
    difficulty: 4,
    rarity: 'common',
    prerequisites: ['atp'],
    summary: 'The ancient first step of using sugar: split glucose in two and pocket a little ATP.',
    steps: steps(
      ['Spend to earn', 'The cell invests 2 ATP to energize glucose.'],
      ['Split', 'The 6-carbon sugar is split into two 3-carbon pieces.'],
      ['Harvest', 'Each piece gives up electrons (to NADH) and makes 2 ATP.'],
      ['Net gain', 'Overall: 2 ATP, 2 NADH and 2 pyruvate per glucose.'],
    ),
    interaction: assembly(
      'Run glycolysis: put its stages in order.',
      [
        ['Glucose enters', '🍬', 'A 6-carbon glucose molecule arrives in the cytoplasm.'],
        [
          'Invest 2 ATP',
          '💸',
          'Two phosphates from ATP are added, making the sugar more reactive.',
        ],
        ['Split in two', '✂️', 'The 6-carbon sugar splits into two 3-carbon molecules (G3P).'],
        [
          'Harvest NADH',
          '🔋',
          'Each 3-carbon piece hands high-energy electrons to NAD⁺, making NADH.',
        ],
        ['Make 4 ATP', '💰', 'Phosphates are moved onto ADP: 4 ATP made (2 net).'],
        [
          '2 Pyruvate',
          '🏁',
          'Two pyruvate molecules are left — ready for mitochondria or fermentation.',
        ],
      ],
      'Done! Net: 2 ATP + 2 NADH + 2 pyruvate. No oxygen needed.',
      {
        distractors: [
          [
            'Release CO₂',
            '💨',
            'Glycolysis releases no CO₂ — that happens later, in the mitochondria.',
          ],
        ],
      },
    ),
    goDeeper:
      'Glycolysis is ten enzyme-catalyzed steps in the cytoplasm. The investment phase uses 2 ATP (hexokinase and phosphofructokinase-1, the main control point). Aldolase splits fructose-1,6-bisphosphate into two three-carbon sugars. The payoff phase makes 2 NADH (glyceraldehyde-3-phosphate dehydrogenase) and 4 ATP by substrate-level phosphorylation (phosphoglycerate kinase and pyruvate kinase).\n\nIn reality, it’s a bit more complicated: glycolysis is ancient and nearly universal, which suggests it evolved before oxygen was common on Earth. Cancer cells often run glycolysis fast even with oxygen present (the Warburg effect), and PET scans use a radioactive glucose analog to spot tissues using lots of sugar.',
    quiz: [
      mc(
        'Where does glycolysis happen?',
        ['In the nucleus', 'In the cytoplasm', 'In the mitochondria', 'In the chloroplast'],
        1,
        'Glycolysis runs in the cytoplasm.',
      ),
      mc(
        'What is the net ATP gain from glycolysis per glucose?',
        ['0', '2', '4', '36'],
        1,
        '4 ATP made − 2 invested = 2 net.',
      ),
      predict(
        'A cell has no oxygen at all.',
        'Can it still do glycolysis?',
        [
          'No',
          'Yes — glycolysis doesn’t need oxygen',
          'Only in the dark',
          'Only if it has chloroplasts',
        ],
        1,
        'Glycolysis is anaerobic; fermentation recycles NADH so it can continue.',
      ),
    ],
    relatedConcepts: ['krebs-cycle', 'fermentation', 'mitochondria'],
    funFact:
      'Glycolysis is found in nearly every living thing on Earth, from bacteria to blue whales.',
  },
  {
    id: 'krebs-cycle',
    title: 'The Krebs Cycle',
    category: 'biochem',
    tags: ['citric acid cycle', 'TCA cycle', 'mitochondria', 'NADH', 'CO2', 'acetyl-CoA'],
    aliases: ['citric acid cycle', 'TCA cycle', 'tricarboxylic acid cycle'],
    difficulty: 4,
    rarity: 'common',
    prerequisites: ['glycolysis'],
    summary:
      'A spinning wheel of reactions in your mitochondria that strips fuel down to CO₂ and collects its electrons.',
    steps: steps(
      ['Fuel arrives', 'Pyruvate becomes acetyl-CoA, a 2-carbon fuel unit.'],
      ['Join the wheel', 'Acetyl-CoA joins a 4-carbon molecule to make citrate (6 carbons).'],
      ['Strip it down', 'Two carbons leave as CO₂ — the CO₂ you breathe out.'],
      [
        'Collect electrons',
        'Energy is captured as NADH, FADH₂ and a little ATP, and the wheel resets.',
      ],
    ),
    interaction: assembly(
      'Spin the Krebs cycle: place each stage around the wheel in order.',
      [
        [
          'Acetyl-CoA joins',
          '🚪',
          'The 2-carbon acetyl group joins oxaloacetate (4C) to make citrate (6C).',
        ],
        ['Citrate rearranges', '🔄', 'Citrate is reshaped into isocitrate.'],
        ['First CO₂ out + NADH', '💨', 'One carbon leaves as CO₂ and NADH is made.'],
        ['Second CO₂ out + NADH', '💨', 'Another CO₂ leaves; another NADH is made.'],
        ['ATP (GTP) made', '💰', 'One ATP-equivalent is made directly.'],
        ['FADH₂ and NADH made', '🔋', 'More electrons are captured as oxaloacetate is rebuilt.'],
      ],
      'One turn: 2 CO₂, 3 NADH, 1 FADH₂, 1 ATP. Each glucose spins the wheel twice.',
      {
        layout: 'cycle',
        distractors: [
          ['Make glucose', '🍬', 'The Krebs cycle breaks fuel down — it doesn’t build glucose.'],
        ],
      },
    ),
    goDeeper:
      'In the mitochondrial matrix, pyruvate dehydrogenase converts pyruvate to acetyl-CoA (releasing one CO₂ and one NADH). The cycle (citrate synthase, aconitase, isocitrate dehydrogenase, α-ketoglutarate dehydrogenase, succinyl-CoA synthetase, succinate dehydrogenase, fumarase, malate dehydrogenase) yields per acetyl-CoA: 3 NADH, 1 FADH₂, 1 GTP/ATP and 2 CO₂. Hans Krebs described it in 1937 (Nobel Prize 1953). Fats and proteins also feed into the cycle.\n\nIn reality, it’s a bit more complicated: the lesson merges some of the eight steps. The cycle is also a hub for building molecules — cells siphon off intermediates to make amino acids and other compounds. Its NADH and FADH₂ carry electrons to the electron transport chain, where most ATP is made.',
    quiz: [
      mc(
        'Where does the Krebs cycle take place?',
        ['Cytoplasm', 'Mitochondrial matrix', 'Nucleus', 'Cell membrane'],
        1,
        'It runs inside the mitochondrial matrix.',
      ),
      mc(
        'What waste gas does the Krebs cycle release?',
        ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Methane'],
        1,
        'Carbons from fuel leave as CO₂, which you exhale.',
      ),
      predict(
        'The electron transport chain stops (no oxygen), so NADH can’t be recycled to NAD⁺.',
        'What happens to the Krebs cycle?',
        [
          'It speeds up',
          'It slows and stops for lack of NAD⁺',
          'It makes glucose instead',
          'Nothing',
        ],
        1,
        'The cycle needs NAD⁺ to accept electrons; without it, the wheel jams.',
      ),
    ],
    relatedConcepts: ['glycolysis', 'electron-transport-chain', 'mitochondria'],
    funFact:
      'Hans Krebs’s famous paper describing the cycle was rejected by the journal Nature in 1937.',
  },
  {
    id: 'chirality',
    title: 'Chirality: Left- and Right-Handed Molecules',
    category: 'biochem',
    tags: [
      'mirror images',
      'enantiomers',
      'thalidomide',
      'carvone',
      'amino acids',
      'stereochemistry',
    ],
    aliases: ['handedness of molecules', 'mirror image molecules', 'enantiomers', 'stereoisomers'],
    difficulty: 4,
    rarity: 'obscure',
    prerequisites: ['enzymes'],
    summary:
      'Some molecules come in left- and right-handed versions — and your body can tell them apart.',
    steps: steps(
      [
        'Mirror twins',
        'Like your hands, some molecules are mirror images that can’t be stacked on top of each other.',
      ],
      [
        'Life picks a side',
        'Life uses almost only “left-handed” amino acids and “right-handed” sugars.',
      ],
      [
        'Receptors notice',
        'Smell receptors and enzymes are themselves handed, so they react differently to each twin.',
      ],
    ),
    interaction: lockKey(
      'Your body’s receptors are “handed.” Fit each molecule to the receptor that recognizes it.',
      [
        ['Spearmint smell receptor', 'wave', '#10b981', 'In your nose'],
        ['Caraway smell receptor', 'notch', '#a16207', 'In your nose'],
        ['Enzyme for L-amino acids', 'triangle', '#6366f1', 'Builds proteins'],
      ],
      [
        ['(R)-carvone', 'wave', '#10b981', 0, 'You smell spearmint!'],
        [
          '(S)-carvone',
          'notch',
          '#a16207',
          1,
          'Same atoms, mirror shape — you smell caraway (rye bread) instead!',
        ],
        ['L-alanine', 'triangle', '#6366f1', 2, 'Life’s proteins are built from L-amino acids.'],
        [
          'D-alanine',
          'triangle',
          '#f43f5e',
          null,
          'The mirror twin looks almost the same but doesn’t fit — your protein-building machinery rejects it.',
        ],
      ],
    ),
    goDeeper:
      'A chiral molecule lacks an internal mirror plane, often because a carbon has four different groups attached. The two mirror forms (enantiomers) have identical physical properties except how they rotate polarized light and how they interact with other chiral molecules — like enzymes and receptors. Thalidomide in the 1950s–60s caused severe birth defects; one enantiomer is linked to the harm, and because the forms interconvert in the body, giving only the “safe” one wouldn’t have prevented it.\n\nIn reality, it’s a bit more complicated: why life chose L-amino acids and D-sugars (homochirality) is still an open question. Some bacteria do use D-amino acids in their cell walls, and many modern drugs are sold as single enantiomers because the other form is inactive or causes side effects.',
    quiz: [
      mc(
        'What are enantiomers?',
        [
          'Molecules with different atoms',
          'Mirror-image versions of the same molecule',
          'Two copies of DNA',
          'Types of enzymes',
        ],
        1,
        'They have the same atoms arranged as mirror images.',
      ),
      predict(
        'You smell (R)-carvone and (S)-carvone, mirror-image twins.',
        'What do you notice?',
        [
          'They smell identical',
          'They smell different — spearmint vs caraway',
          'Neither has a smell',
          'Only one is a gas',
        ],
        1,
        'Chiral smell receptors respond differently to each twin.',
      ),
      mc(
        'Which amino acids does life mostly use to build proteins?',
        ['D-amino acids', 'L-amino acids', 'A random mix', 'None'],
        1,
        'Proteins are built from L-amino acids.',
      ),
    ],
    relatedConcepts: ['enzymes', 'cell-signaling', 'protein-folding'],
    funFact:
      'Louis Pasteur discovered molecular handedness in 1848 by separating tiny tartaric acid crystals with tweezers.',
  },
];
