import type { Concept } from '../../types';
import { assembly, em, mc, predict, sh, slider, sorting, steps, timeline } from './helpers';

export const development: Concept[] = [
  {
    id: 'fertilization',
    title: 'Fertilization',
    category: 'development',
    tags: ['sperm', 'egg', 'zygote', 'reproduction', 'conception'],
    aliases: ['conception', 'sperm meets egg', 'zygote formation'],
    difficulty: 1,
    rarity: 'common',
    prerequisites: ['meiosis'],
    summary:
      'One sperm and one egg combine their half-sets of chromosomes to start a brand-new life.',
    steps: steps(
      ['The race', 'Millions of sperm set off, but only a few hundred reach the egg.'],
      ['Breaking in', 'Sperm release enzymes to dig through the egg’s protective layers.'],
      ['One gets in', 'When one sperm fuses with the egg, the egg seals itself against others.'],
      ['A zygote', 'The two half-sets of chromosomes combine into one new cell: a zygote.'],
    ),
    interaction: assembly(
      'Put the steps of fertilization in order.',
      [
        [
          'Sperm swim to the egg',
          '🏊',
          'Sperm whip their tails to swim up the reproductive tract.',
        ],
        [
          'Reach the egg’s jelly coat',
          '🥚',
          'A few hundred arrive at the egg, surrounded by protective layers.',
        ],
        [
          'Release enzymes',
          '🧪',
          'Sperm release enzymes from their caps (acrosomes) to dig through.',
        ],
        ['One sperm fuses', '💥', 'The first sperm to reach the membrane fuses with the egg.'],
        ['Egg blocks the rest', '🛑', 'The egg changes its coat so no other sperm can enter.'],
        ['Nuclei combine', '🧬', 'Sperm and egg chromosomes join: a zygote with a full set.'],
      ],
      'A zygote! In about a day it will begin dividing.',
      { distractors: [['Cells photosynthesize', '☀️', 'Animal embryos don’t photosynthesize.']] },
    ),
    goDeeper:
      'In humans, fertilization usually happens in the fallopian tube. The sperm’s acrosome reaction releases enzymes to penetrate the zona pellucida; fusion triggers a calcium wave in the egg and the cortical reaction, which hardens the zona to block polyspermy. The haploid sperm and egg pronuclei combine their chromosomes (23 + 23 = 46). The sperm also delivers a centriole; the egg provides nearly all the cytoplasm, including mitochondria.\n\nIn reality, it’s a bit more complicated: sperm must first be “capacitated” by the female reproductive tract before they can fertilize, and chemical signals may guide them toward the egg. Many animals fertilize externally — frogs and most fish release eggs and sperm into water.',
    quiz: [
      mc(
        'What is a zygote?',
        [
          'A sperm cell',
          'The single cell formed when sperm and egg combine',
          'An unfertilized egg',
          'A type of organ',
        ],
        1,
        'The zygote is the first cell of a new organism.',
      ),
      mc(
        'How many chromosomes does a human zygote have?',
        ['23', '46', '92', '12'],
        1,
        '23 from each parent make 46.',
      ),
      predict(
        'Two sperm entered one egg at the same time.',
        'Why is this a problem?',
        [
          'It makes twins',
          'The cell would have too many chromosomes and usually can’t develop normally',
          'It makes the baby stronger',
          'Nothing happens',
        ],
        1,
        'The egg’s block to polyspermy prevents this.',
      ),
    ],
    relatedConcepts: ['meiosis', 'embryo-development', 'cilia-flagella'],
    funFact:
      'A human egg is one of the largest cells in the body — just about visible to the naked eye.',
  },
  {
    id: 'embryo-development',
    title: 'Embryo Development',
    category: 'development',
    tags: ['zygote', 'blastocyst', 'embryo', 'fetus', 'cleavage', 'implantation'],
    aliases: ['how a baby develops', 'early development', 'blastocyst'],
    difficulty: 2,
    rarity: 'common',
    prerequisites: ['fertilization'],
    summary:
      'From one cell to trillions: an embryo divides, folds and organizes itself into a body.',
    steps: steps(
      ['Splitting', 'The zygote divides again and again without growing — 2, 4, 8, 16 cells…'],
      ['A hollow ball', 'It becomes a blastocyst: a hollow ball with an inner clump of cells.'],
      ['Implantation', 'It burrows into the wall of the uterus.'],
      [
        'Building a body',
        'Cells organize into layers, then organs. By 8 weeks, all major organs have started.',
      ],
    ),
    interaction: timeline(
      'Scrub through the first weeks of human development.',
      [
        [
          'Zygote',
          'One cell with a full set of chromosomes.',
          [sh('c', 'circle', '#fbcfe8', 50, 50, 2.5)],
          'Day 0',
        ],
        [
          '2 cells',
          'The first division.',
          [sh('c', 'circle', '#fbcfe8', 43, 50, 1.6), sh('c2', 'circle', '#fbcfe8', 57, 50, 1.6)],
          'Day 1',
        ],
        [
          'Morula',
          'A solid ball of 16 or more cells, like a mulberry.',
          [
            ...[
              [42, 42],
              [58, 42],
              [42, 58],
              [58, 58],
              [50, 50],
            ].map(([x, y], i) => sh(i ? `m${i}` : 'c', 'circle', '#f9a8d4', x, y, 1.1)),
            sh('c2', 'circle', '#f9a8d4', 50, 36, 1),
          ],
          'Day 4',
        ],
        [
          'Blastocyst',
          'A hollow ball. The inner cell mass will become the baby; the outer layer forms the placenta.',
          [
            sh('c', 'ring', '#ec4899', 50, 50, 3.6),
            sh('c2', 'blob', '#be185d', 42, 40, 1.2, { label: 'inner cell mass' }),
          ],
          'Day 5–6',
        ],
        [
          'Implantation',
          'The blastocyst burrows into the uterus wall.',
          [
            sh('wall', 'rect', '#fecdd3', 50, 80, 6, { opacity: 0.7 }),
            sh('c', 'ring', '#ec4899', 50, 58, 2.8),
            sh('c2', 'blob', '#be185d', 44, 52, 1),
          ],
          'Week 1–2',
        ],
        [
          'Embryo',
          'The heart starts beating and limb buds, eyes and the brain begin forming.',
          [em('c', '🫘', 50, 50, 3), sh('heart', 'heart', '#ef4444', 52, 55, 0.4)],
          'Week 4–8',
        ],
      ],
      [
        ['Stop at the hollow-ball stage.', 3],
        ['Stop when the heart starts beating.', 5],
      ],
      '#fff1f2',
    ),
    goDeeper:
      'Cleavage divisions produce smaller and smaller cells (blastomeres) from the zygote’s cytoplasm. The morula compacts and forms a blastocyst with a trophoblast (outer layer → part of the placenta), inner cell mass (→ embryo) and fluid cavity (blastocoel). Implantation begins around day 6–7. Gastrulation (week 3) forms the three germ layers, and neurulation forms the neural tube. Organogenesis occurs from roughly weeks 3–8; after week 8, the embryo is called a fetus.\n\nIn reality, it’s a bit more complicated: the timeline compresses and simplifies many steps, and the emoji is just a placeholder for a curled embryo about 1–2 cm long at 8 weeks. Inner cell mass cells are the source of embryonic stem cells.',
    quiz: [
      mc(
        'What is a blastocyst?',
        [
          'A fully formed baby',
          'A hollow ball of cells formed early in development',
          'A type of sperm',
          'A blood cell',
        ],
        1,
        'It forms about 5 days after fertilization.',
      ),
      mc(
        'Which part of the blastocyst becomes the baby?',
        ['The outer layer', 'The inner cell mass', 'The fluid cavity', 'The jelly coat'],
        1,
        'The outer layer helps form the placenta.',
      ),
      predict(
        'During cleavage, the zygote divides many times.',
        'What happens to the overall size of the embryo?',
        [
          'It doubles each time',
          'It stays about the same — the cells just get smaller',
          'It shrinks to nothing',
          'It becomes a fetus instantly',
        ],
        1,
        'Early divisions split the existing cytoplasm.',
      ),
    ],
    relatedConcepts: ['fertilization', 'gastrulation', 'stem-cells', 'hox-genes'],
    funFact: 'A human embryo’s heart starts beating around 3–4 weeks after fertilization.',
  },
  {
    id: 'gastrulation',
    title: 'Gastrulation: The Three Germ Layers',
    category: 'development',
    tags: ['germ layers', 'ectoderm', 'mesoderm', 'endoderm', 'embryo'],
    aliases: ['germ layers', 'ectoderm mesoderm endoderm', 'gastrula'],
    difficulty: 3,
    rarity: 'obscure',
    prerequisites: ['embryo-development'],
    summary:
      'Early embryos fold into three layers, and every organ you have comes from one of them.',
    steps: steps(
      ['A big fold', 'Cells move inward through a groove, folding the embryo into layers.'],
      ['Outside layer: ectoderm', 'Becomes skin, hair and the entire nervous system.'],
      ['Middle layer: mesoderm', 'Becomes muscle, bone, heart, blood and kidneys.'],
      ['Inside layer: endoderm', 'Becomes the gut lining, lungs, liver and pancreas.'],
    ),
    interaction: sorting(
      'Which germ layer does each body part come from?',
      [
        ['Ectoderm (outer)', '🟦', 'Skin and nerves'],
        ['Mesoderm (middle)', '🟥', 'Muscle, bone, blood'],
        ['Endoderm (inner)', '🟨', 'Gut and its organs'],
      ],
      [
        ['Brain', '🧠', 0, 'The whole nervous system comes from ectoderm.'],
        ['Skin and hair', '🧑', 0, 'The outer skin layer is ectoderm.'],
        ['Heart', '🫀', 1, 'Heart muscle and blood vessels come from mesoderm.'],
        ['Bones', '🦴', 1, 'The skeleton is mesoderm.'],
        ['Blood', '🩸', 1, 'Blood cells are mesoderm.'],
        ['Lungs', '🫁', 2, 'The lining of the lungs grows out of the gut tube — endoderm.'],
        ['Liver', '🟤', 2, 'The liver buds from the gut tube.'],
        ['Stomach lining', '🫃', 2, 'The gut lining is endoderm.'],
      ],
    ),
    goDeeper:
      'During gastrulation (around week 3 in humans), cells of the epiblast migrate through the primitive streak to form endoderm and mesoderm, while remaining epiblast becomes ectoderm. Germ layer fates: ectoderm → epidermis, nervous system, neural crest (which forms pigment cells, facial cartilage and more); mesoderm → muscle, skeleton, dermis, heart, blood, kidneys, gonads; endoderm → epithelial lining of the digestive and respiratory tracts, liver, pancreas, thyroid. Biologist Lewis Wolpert said: “It is not birth, marriage, or death, but gastrulation which is truly the most important time in your life.”\n\nIn reality, it’s a bit more complicated: many organs are built from several layers (the gut has endoderm lining but mesoderm muscle), and neural crest cells are sometimes called a “fourth germ layer.” Sponges have no true germ layers, and jellyfish have only two.',
    quiz: [
      mc(
        'Which germ layer forms the brain?',
        ['Ectoderm', 'Mesoderm', 'Endoderm', 'None'],
        0,
        'The nervous system comes from ectoderm.',
      ),
      mc(
        'Which germ layer forms bones and muscles?',
        ['Ectoderm', 'Mesoderm', 'Endoderm', 'The placenta'],
        1,
        'Mesoderm is the middle layer.',
      ),
      predict(
        'A drug disrupts the endoderm in an early embryo.',
        'Which organs are most likely affected?',
        ['Skin and brain', 'Gut lining, lungs and liver', 'Bones only', 'Hair only'],
        1,
        'These organs come from endoderm.',
      ),
    ],
    relatedConcepts: ['embryo-development', 'hox-genes', 'morphogen-gradients'],
    funFact: 'Your brain and your skin come from the same embryonic layer.',
  },
  {
    id: 'hox-genes',
    title: 'Hox Genes',
    category: 'development',
    tags: ['body plan', 'fruit flies', 'homeotic genes', 'segments', 'evo-devo'],
    aliases: ['homeotic genes', 'body plan genes', 'Antennapedia', 'master control genes'],
    difficulty: 4,
    rarity: 'common',
    prerequisites: ['embryo-development'],
    summary:
      'Hox genes tell each part of a developing body what it should become — head, thorax or tail.',
    steps: steps(
      ['Address labels', 'Hox genes give each segment of the embryo its identity.'],
      ['In order', 'They sit on the chromosome in the same order as the body parts they control!'],
      ['Mix-ups', 'A Hox mutation can grow legs where antennae should be.'],
      ['Shared by animals', 'Flies, mice and humans all use Hox genes — they’re ancient.'],
    ),
    interaction: assembly(
      'Fruit fly Hox genes line up on the chromosome in head-to-tail order. Put them in order from head to tail.',
      [
        ['labial (lab)', '👄', 'Controls the back part of the head.'],
        ['Deformed (Dfd)', '🦷', 'Controls the mouthpart segments.'],
        [
          'Antennapedia (Antp)',
          '🦵',
          'Controls the middle thorax, where the second pair of legs grows.',
        ],
        [
          'Ultrabithorax (Ubx)',
          '🪽',
          'Controls the back thorax, turning hind wings into small balancers (halteres).',
        ],
        ['Abdominal-B (Abd-B)', '🐝', 'Controls the tail-end abdominal segments.'],
      ],
      'Head to tail! Hox genes follow the body’s order along the chromosome — a pattern called colinearity.',
      {
        distractors: [
          ['Insulin gene', '🔑', 'Insulin controls blood sugar, not body segment identity.'],
        ],
      },
    ),
    goDeeper:
      'Hox genes encode transcription factors containing a 60-amino-acid DNA-binding homeodomain. In Drosophila they are clustered in the Antennapedia and Bithorax complexes; mammals have four clusters (HoxA–D) with 39 genes. Spatial colinearity means genes at one end of a cluster act in anterior regions and those at the other end act posteriorly. Mutations cause homeotic transformations: Antennapedia gain-of-function puts legs on the head, and Ultrabithorax loss turns halteres into a second pair of wings (four-winged flies). Edward Lewis, Christiane Nüsslein-Volhard and Eric Wieschaus won the 1995 Nobel Prize for this work.\n\nIn reality, it’s a bit more complicated: the fly list here leaves out some Hox genes (like proboscipedia and Sex combs reduced), and Hox genes work in overlapping zones with many partner genes. Changes in Hox expression helped generate the diversity of animal body plans, such as snakes’ long bodies.',
    quiz: [
      mc(
        'What do Hox genes control?',
        [
          'Eye color',
          'The identity of body segments along the head-to-tail axis',
          'Blood sugar',
          'Hair length',
        ],
        1,
        'They assign segment identity.',
      ),
      predict(
        'A fly has a mutation that switches on Antennapedia in its head.',
        'What might grow where antennae should be?',
        ['Wings', 'Legs', 'Eyes', 'Nothing'],
        1,
        'Antennapedia tells cells to make a leg-bearing segment.',
      ),
      mc(
        'What is surprising about the order of Hox genes on the chromosome?',
        [
          'It’s random',
          'It matches the head-to-tail order of the body parts they control',
          'It’s reversed in every species',
          'They are on different chromosomes',
        ],
        1,
        'This is called colinearity.',
      ),
    ],
    relatedConcepts: [
      'embryo-development',
      'morphogen-gradients',
      'transcription',
      'phylogenetic-trees',
    ],
    funFact:
      'Hox genes are so similar across animals that a mouse Hox gene can partly replace the matching fly gene.',
  },
  {
    id: 'regeneration',
    title: 'Regeneration',
    category: 'development',
    tags: ['axolotl', 'planaria', 'starfish', 'stem cells', 'healing'],
    aliases: ['regrowing limbs', 'axolotl regeneration', 'planarian regeneration'],
    difficulty: 2,
    rarity: 'common',
    prerequisites: ['stem-cells'],
    summary: 'Some animals can regrow lost limbs — or even a whole body from a tiny piece.',
    steps: steps(
      ['Lose a part', 'An animal loses a limb, tail or more.'],
      ['A blastema', 'In regenerating animals, cells gather into a bud called a blastema.'],
      ['Rebuild', 'The blastema grows and rebuilds the missing part in the right pattern.'],
      ['Humans?', 'We can regrow some liver and fingertips in children — but not whole limbs.'],
    ),
    interaction: sorting(
      'How well can each one regrow?',
      [
        ['Regrows fully', '🦎', 'Complete regeneration'],
        ['Partly regrows', '🩹', 'Some regrowth or repair'],
        ['Can’t regrow', '🚫', 'Scar instead'],
      ],
      [
        ['Axolotl leg', '🦎', 0, 'Axolotls regrow complete legs, bones and all.'],
        ['Planarian (cut in half)', '🪱', 0, 'Each half regrows into a complete worm!'],
        ['Starfish arm', '⭐', 0, 'Starfish regrow lost arms.'],
        ['Zebrafish heart', '🐟', 0, 'Zebrafish can regrow damaged heart muscle.'],
        [
          'Human liver',
          '🟤',
          1,
          'The liver regrows lost mass, though not its original lobe shape.',
        ],
        ['Lizard tail', '🦖', 1, 'Lizards regrow tails, but with cartilage instead of bone.'],
        ['Human arm', '💪', 2, 'Humans form scars instead of regrowing limbs.'],
      ],
    ),
    goDeeper:
      'Regeneration strategies differ. Planarians use pluripotent stem cells called neoblasts spread throughout the body. Axolotls form a blastema from dedifferentiated and progenitor cells that “remember” their position, rebuilding the missing limb segments. Zebrafish regenerate heart muscle through division of existing cardiomyocytes. Mammals mostly heal with scarring, but the liver regrows through hepatocyte division, and young children can regrow fingertips.\n\nIn reality, it’s a bit more complicated: the sorting simplifies a spectrum — even “full” regeneration may differ in small details from the original. Researchers study these animals hoping to improve human wound healing and organ repair.',
    quiz: [
      mc(
        'What is a blastema?',
        [
          'A type of scar',
          'A bud of cells that rebuilds a lost body part',
          'A bone',
          'A blood vessel',
        ],
        1,
        'The blastema drives regeneration in salamanders.',
      ),
      mc(
        'What happens if you cut a planarian in half?',
        [
          'Both halves die',
          'Each half regrows into a complete worm',
          'Only the head survives',
          'It turns into two fish',
        ],
        1,
        'Planarians are regeneration champions.',
      ),
      predict(
        'A person has part of their liver removed in surgery.',
        'What happens over the next months?',
        [
          'Nothing grows back',
          'The liver regrows close to its original mass',
          'A new arm grows',
          'The liver turns into a kidney',
        ],
        1,
        'The liver is unusually good at regrowing.',
      ),
    ],
    relatedConcepts: ['stem-cells', 'immortal-jellyfish', 'liver'],
    funFact:
      'A planarian can regrow a whole body from a piece as small as 1/279th of the original worm.',
  },
  {
    id: 'metamorphosis',
    title: 'Metamorphosis',
    category: 'development',
    tags: ['caterpillar', 'butterfly', 'chrysalis', 'tadpole', 'insects'],
    aliases: ['caterpillar to butterfly', 'complete metamorphosis', 'tadpole to frog'],
    difficulty: 1,
    rarity: 'common',
    summary:
      'Some animals completely rebuild their bodies as they grow up — like a caterpillar becoming a butterfly.',
    steps: steps(
      ['Egg', 'A butterfly lays tiny eggs on a plant.'],
      ['Eating machine', 'The caterpillar hatches and eats and eats, growing fast.'],
      ['Chrysalis', 'Inside a chrysalis, much of its body breaks down and is rebuilt.'],
      ['Butterfly', 'An adult with wings emerges, ready to find a mate.'],
    ),
    interaction: timeline(
      'Scrub through a butterfly’s life cycle.',
      [
        [
          'Egg',
          'A tiny egg on a milkweed leaf.',
          [em('leaf', '🍃', 50, 60, 3), em('egg', '⚪', 52, 55, 0.4)],
          'Day 0',
        ],
        [
          'Caterpillar',
          'The larva hatches and eats non-stop, molting its skin several times as it grows.',
          [em('leaf', '🍃', 50, 60, 3), em('egg', '🐛', 52, 52, 1.2)],
          'Day 4–14',
        ],
        [
          'Chrysalis',
          'It hangs upside down and forms a chrysalis. Inside, most tissues dissolve; special cell clusters build the new body.',
          [em('leaf', '🍃', 50, 25, 2.2), em('egg', '🫛', 52, 55, 1.4, { rotate: 90 })],
          'Day 15–24',
        ],
        [
          'Butterfly',
          'An adult butterfly pumps up its wings and flies off.',
          [em('leaf', '🍃', 50, 25, 2.2), em('egg', '🦋', 55, 50, 1.8)],
          'Day 25',
        ],
      ],
      [
        ['Stop at the stage that eats the most.', 1],
        ['Stop when the body is being rebuilt.', 2],
      ],
      '#f0fdf4',
    ),
    goDeeper:
      'Holometabolous insects (butterflies, beetles, flies, bees) undergo complete metamorphosis: egg → larva → pupa → adult. Hormones control the timing: ecdysone triggers molting, while juvenile hormone keeps the insect in its larval form; when juvenile hormone drops, the next molt produces a pupa. Inside, larval tissues break down and imaginal discs — groups of cells set aside in the larva — grow into wings, legs and eyes. Hemimetabolous insects (grasshoppers, dragonflies) change gradually. Amphibians also metamorphose, triggered by thyroid hormone.\n\nIn reality, it’s a bit more complicated: the caterpillar doesn’t completely turn into soup — some organs, like parts of the nervous system, persist, and experiments suggest moths can even remember things learned as caterpillars.',
    quiz: [
      mc(
        'What is the order of complete metamorphosis?',
        [
          'Egg, adult, larva, pupa',
          'Egg, larva, pupa, adult',
          'Larva, egg, adult, pupa',
          'Pupa, egg, larva, adult',
        ],
        1,
        'Egg → caterpillar (larva) → chrysalis (pupa) → butterfly.',
      ),
      mc(
        'What happens inside a chrysalis?',
        [
          'The caterpillar sleeps unchanged',
          'Most tissues break down and the adult body is built',
          'It lays eggs',
          'It eats leaves',
        ],
        1,
        'The body is reorganized.',
      ),
      predict(
        'Scientists keep juvenile hormone high in a caterpillar.',
        'What happens at its next molt?',
        [
          'It becomes a butterfly early',
          'It molts into a bigger caterpillar instead of a pupa',
          'It dies instantly',
          'It becomes a frog',
        ],
        1,
        'Juvenile hormone keeps it in the larval form.',
      ),
    ],
    relatedConcepts: ['embryo-development', 'hormones-feedback', 'immortal-jellyfish'],
    funFact:
      'Moths trained to avoid a smell as caterpillars still avoided it as adults — some memories survive metamorphosis.',
  },
  {
    id: 'morphogen-gradients',
    title: 'Morphogen Gradients',
    category: 'development',
    tags: ['pattern formation', 'French flag model', 'positional information', 'Bicoid', 'signals'],
    aliases: ['French flag model', 'positional information', 'how cells know where they are'],
    difficulty: 4,
    rarity: 'obscure',
    prerequisites: ['embryo-development'],
    summary: 'Cells figure out where they are by measuring how much of a signal reaches them.',
    steps: steps(
      ['A signal source', 'Cells at one end of an embryo release a chemical called a morphogen.'],
      ['Fading signal', 'It spreads out and gets weaker with distance, forming a gradient.'],
      ['Reading the dose', 'Cells switch on different genes depending on how much they detect.'],
      [
        'The French flag',
        'High dose → blue, medium → white, low → red: three zones from one signal.',
      ],
    ),
    interaction: slider({
      prompt:
        'A row of cells reads a morphogen from a source on the left. Pick a cell and a source strength. Which zone is it in?',
      inputs: [
        {
          id: 'dist',
          label: 'Distance from the source',
          unit: 'cells',
          min: 0,
          max: 100,
          step: 1,
          start: 20,
        },
        {
          id: 'source',
          label: 'Source strength',
          unit: '%',
          min: 20,
          max: 100,
          step: 5,
          start: 100,
        },
      ],
      output: {
        label: 'Morphogen concentration',
        unit: '%',
        max: 100,
        expr: 'source * exp(-dist / 30)',
      },
      readouts: [
        {
          label: 'Zone (3 = blue, 2 = white, 1 = red)',
          expr: 'step(source * exp(-dist / 30) - 50, 3, step(source * exp(-dist / 30) - 20, 2, 1))',
        },
      ],
      graphInput: 'dist',
      visual: { kind: 'glow', emoji: '🏳️' },
      challenges: [
        {
          prompt: 'Find a cell in the blue zone (over 50% concentration).',
          target: { min: 50 },
          explain: 'Close to the source, cells get a high dose and become “blue” cells.',
        },
        {
          prompt: 'Find a white-zone cell (20–50%).',
          target: { min: 20, max: 50 },
          explain: 'Medium dose → the middle cell fate.',
        },
        {
          prompt: 'Find a red-zone cell (under 20%).',
          target: { max: 20 },
          explain: 'Far away, the signal is weak: the third cell fate.',
        },
      ],
    }),
    goDeeper:
      'Lewis Wolpert’s French flag model (1969) proposed that cells read positional information from a morphogen gradient and respond with discrete fates at concentration thresholds. In fruit fly embryos, Bicoid protein (from mRNA localized at the head end) forms a gradient that switches on genes such as hunchback in a dose-dependent way. Other morphogens include Sonic hedgehog (which patterns the neural tube and the thumb-to-pinky axis of the hand), BMPs and Wnts.\n\nIn reality, it’s a bit more complicated: gradients are shaped by diffusion, degradation and transport, cells also integrate how long they’re exposed, and feedback between neighbors sharpens boundaries. Notice that a weaker source shifts every boundary closer to it — a real effect seen in experiments.',
    quiz: [
      mc(
        'What is a morphogen?',
        [
          'A muscle',
          'A signaling molecule whose concentration tells cells their position',
          'A type of bone',
          'A virus',
        ],
        1,
        'Cells read morphogen levels to choose fates.',
      ),
      predict(
        'The morphogen source is made weaker.',
        'What happens to the zone boundaries?',
        [
          'They move away from the source',
          'They move closer to the source',
          'They disappear completely',
          'Nothing',
        ],
        1,
        'Each threshold is reached nearer the source.',
      ),
      mc(
        'In the French flag model, how many cell fates come from one gradient?',
        ['One', 'Three (using two thresholds)', 'Ten', 'None'],
        1,
        'Two thresholds split the gradient into three zones.',
      ),
    ],
    relatedConcepts: ['hox-genes', 'gastrulation', 'cell-signaling'],
    funFact: 'A morphogen called Sonic hedgehog was named after the video game character.',
  },
];
