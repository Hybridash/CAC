import type { Concept } from '../../types';
import {
  assembly,
  cascade,
  em,
  label,
  mc,
  predict,
  sh,
  slider,
  sorting,
  steps,
  timeline,
} from './helpers';

export const plants: Concept[] = [
  {
    id: 'plant-cell',
    title: 'Plant Cell Structure',
    category: 'plants',
    tags: ['cell wall', 'chloroplast', 'vacuole', 'organelles', 'animal cell'],
    aliases: ['plant vs animal cell', 'cell wall', 'central vacuole'],
    difficulty: 1,
    rarity: 'common',
    summary:
      'Plant cells have a few extras animal cells don’t: a tough wall, chloroplasts and a giant water bag.',
    steps: steps(
      [
        'Shared parts',
        'Plant and animal cells both have a nucleus, membrane, mitochondria and ribosomes.',
      ],
      [
        'Plant extras',
        'Plants add a cell wall, chloroplasts for photosynthesis and a big central vacuole.',
      ],
      ['Standing tall', 'The water-filled vacuole pushes against the wall, keeping plants firm.'],
    ),
    interaction: sorting(
      'Sort each part: plant cells only, animal cells only, or both?',
      [
        ['Plant cells only', '🌿', 'Plant extras'],
        ['Animal cells only', '🐾', 'Found in animal cells, not plants'],
        ['Both', '🤝', 'Shared by both'],
      ],
      [
        ['Cell wall', '🧱', 0, 'A rigid cellulose wall surrounds plant cells.'],
        ['Chloroplast', '🟢', 0, 'Chloroplasts capture light for photosynthesis.'],
        ['Large central vacuole', '💧', 0, 'It can fill up to 90% of a plant cell.'],
        ['Centrioles', '✳️', 1, 'Most plant cells build their spindle without centrioles.'],
        ['Nucleus', '🟣', 2, 'Both store DNA in a nucleus.'],
        [
          'Mitochondria',
          '🔋',
          2,
          'Plants have mitochondria too — they respire as well as photosynthesize!',
        ],
        ['Cell membrane', '🫧', 2, 'Both have a membrane (in plants, it’s just inside the wall).'],
      ],
    ),
    goDeeper:
      'Plant cells are eukaryotic with a cellulose cell wall (plus a middle lamella of pectin gluing neighbors together), chloroplasts and other plastids, and a large central vacuole surrounded by the tonoplast membrane. Plasmodesmata are channels through cell walls connecting neighboring cells’ cytoplasm. Turgor pressure from the vacuole keeps non-woody plants upright.\n\nIn reality, it’s a bit more complicated: not every plant cell has chloroplasts (root cells usually don’t), and some animal cells lack features like mitochondria (mature red blood cells). Plants do have small vacuoles in some cells and lysosome-like functions in their vacuoles.',
    quiz: [
      mc(
        'Which structure do plant cells have but animal cells don’t?',
        ['Nucleus', 'Cell wall', 'Mitochondria', 'Ribosomes'],
        1,
        'The cellulose cell wall is a plant feature.',
      ),
      mc(
        'Do plant cells have mitochondria?',
        [
          'No — they have chloroplasts instead',
          'Yes — they respire too',
          'Only at night',
          'Only in flowers',
        ],
        1,
        'Plants need mitochondria to release energy from sugar.',
      ),
      predict(
        'A plant isn’t watered for a week.',
        'What happens to the central vacuoles?',
        [
          'They grow bigger',
          'They shrink, so the plant wilts',
          'They turn into chloroplasts',
          'Nothing',
        ],
        1,
        'Less water means less turgor pressure.',
      ),
    ],
    relatedConcepts: ['photosynthesis', 'osmosis', 'transpiration', 'endosymbiosis'],
    funFact:
      'Robert Hooke coined the word “cell” in 1665 after seeing cork’s empty cell walls, which reminded him of monks’ rooms.',
  },
  {
    id: 'transpiration',
    title: 'Transpiration',
    category: 'plants',
    tags: ['water transport', 'xylem', 'stomata', 'evaporation', 'leaves'],
    aliases: ['how water moves up plants', 'water transport in plants', 'stomata'],
    difficulty: 2,
    rarity: 'common',
    summary:
      'Plants drink through their roots and “sweat” through their leaves, pulling water up like a straw.',
    steps: steps(
      ['Leaky leaves', 'Water evaporates from tiny pores (stomata) on leaves.'],
      [
        'Pulling a chain',
        'Water molecules stick together, so evaporation pulls a chain of water up the stem.',
      ],
      ['Faster or slower', 'Heat, wind, light and dry air speed it up; humidity slows it down.'],
    ),
    interaction: slider({
      prompt: 'Change the weather around a plant. How fast does it lose water through its leaves?',
      inputs: [
        { id: 'temp', label: 'Temperature', unit: '°C', min: 5, max: 40, step: 1, start: 20 },
        { id: 'humidity', label: 'Humidity', unit: '%', min: 10, max: 100, step: 5, start: 50 },
        { id: 'wind', label: 'Wind', unit: 'km/h', min: 0, max: 40, step: 2, start: 5 },
      ],
      output: {
        label: 'Transpiration rate',
        unit: '%',
        max: 100,
        expr: 'clamp(100 * (temp / 40) * (1 - humidity / 100) * (0.5 + wind / 40) * 1.6, 0, 100)',
      },
      graphInput: 'humidity',
      visual: { kind: 'bubbles', emoji: '💧' },
      challenges: [
        {
          prompt: 'Create a hot, dry, windy day: over 80% water loss.',
          target: { min: 80 },
          explain: 'Heat, dry air and wind all speed evaporation from the leaves.',
        },
        {
          prompt: 'Make it nearly stop (under 5%).',
          target: { max: 5 },
          explain: 'Very humid air means water can barely evaporate from the leaves.',
        },
      ],
    }),
    goDeeper:
      'Water moves from soil into roots by osmosis, up the xylem and out through stomata. The cohesion–tension theory explains the ascent: evaporation from mesophyll cell walls creates negative pressure (tension), pulling a continuous column of water held together by hydrogen bonding (cohesion) and adhering to xylem walls (adhesion). Guard cells open and close stomata, balancing CO₂ uptake for photosynthesis against water loss. A large tree can transpire hundreds of liters a day.\n\nIn reality, it’s a bit more complicated: the slider multiplies factors simply; real transpiration also depends on light (which opens stomata), leaf size and the plant’s water status. Over 90% of water a plant absorbs is lost by transpiration, which also cools the leaves.',
    quiz: [
      mc(
        'Through which structures do leaves lose water?',
        ['Roots', 'Stomata', 'Flowers', 'Bark'],
        1,
        'Stomata are pores on the leaf surface.',
      ),
      predict(
        'It’s a very humid, still morning.',
        'What happens to transpiration?',
        [
          'It speeds up',
          'It slows down',
          'It stops photosynthesis permanently',
          'It reverses so leaves absorb lots of water',
        ],
        1,
        'Humid air reduces evaporation from leaves.',
      ),
      label(
        'Match each part to its role.',
        [
          ['Xylem', 'Tubes carrying water up the plant'],
          ['Stomata', 'Pores where water vapor escapes'],
          ['Guard cells', 'Open and close the pores'],
        ],
        'Water travels from roots to leaves to air.',
      ),
    ],
    relatedConcepts: ['osmosis', 'plant-cell', 'c4-cam', 'photosynthesis'],
    funFact: 'A large oak tree can transpire over 150,000 liters of water in a year.',
  },
  {
    id: 'tropisms',
    title: 'Phototropism & Gravitropism',
    category: 'plants',
    tags: ['plant growth', 'light', 'gravity', 'auxin', 'bending'],
    aliases: ['plants growing toward light', 'gravitropism', 'phototropism', 'plant movement'],
    difficulty: 2,
    rarity: 'common',
    summary: 'Plants can’t walk, but they can grow toward light and send roots down with gravity.',
    steps: steps(
      ['Growing toward light', 'Stems bend toward light — phototropism.'],
      ['Gravity sensing', 'Roots grow down and shoots grow up — gravitropism.'],
      ['Uneven growth', 'Bending happens because one side grows faster than the other.'],
    ),
    interaction: timeline(
      'A seedling sits by a window with light from the right. Watch it over two days.',
      [
        [
          'Straight up',
          'The seedling grows straight up while light is all around.',
          [
            sh('pot', 'rect', '#b45309', 40, 85, 1.6),
            sh('stem', 'rod', '#22c55e', 40, 58, 1.8, { rotate: 90 }),
            em('sun', '☀️', 88, 20, 1.6),
          ],
          '0 h',
        ],
        [
          'Light from one side',
          'Now light comes only from the window on the right.',
          [
            sh('pot', 'rect', '#b45309', 40, 85, 1.6),
            sh('stem', 'rod', '#22c55e', 41, 58, 1.8, { rotate: 80 }),
            em('sun', '☀️', 88, 20, 1.6),
          ],
          '6 h',
        ],
        [
          'Bending',
          'The shady side grows faster, so the stem curves toward the light.',
          [
            sh('pot', 'rect', '#b45309', 40, 85, 1.6),
            sh('stem', 'rod', '#22c55e', 45, 58, 1.8, { rotate: 60 }),
            em('sun', '☀️', 88, 20, 1.6),
          ],
          '24 h',
        ],
        [
          'Reaching',
          'The seedling leans strongly toward the window.',
          [
            sh('pot', 'rect', '#b45309', 40, 85, 1.6),
            sh('stem', 'rod', '#16a34a', 50, 56, 2, { rotate: 45 }),
            em('leaf', '🌱', 62, 38, 1),
            em('sun', '☀️', 88, 20, 1.6),
          ],
          '48 h',
        ],
        [
          'Tipped over',
          'If the pot is laid on its side, gravity sensing makes the shoot curve back up.',
          [
            sh('pot', 'rect', '#b45309', 25, 70, 1.6, { rotate: 90 }),
            sh('stem', 'rod', '#16a34a', 45, 60, 2, { rotate: -30 }),
            em('leaf', '🌱', 60, 45, 1),
          ],
          '+24 h',
        ],
      ],
      [
        ['Stop when the stem first starts curving toward the light.', 2],
        ['Stop when gravity makes the shoot turn upward.', 4],
      ],
      '#f0fdf4',
    ),
    goDeeper:
      'Phototropism is mainly driven by blue light sensed by phototropin proteins in the shoot tip. The hormone auxin is redistributed to the shaded side, where it stimulates cell elongation (via acid growth), bending the shoot toward light. In gravitropism, dense starch-filled amyloplasts (statoliths) settle to the bottom of root cap cells; auxin then gathers on the lower side — which promotes growth in shoots (bending up) but inhibits it in roots (bending down).\n\nIn reality, it’s a bit more complicated: the timeline is sped up, and plants also show thigmotropism (response to touch, like vine tendrils) and hydrotropism (roots growing toward water). Charles and Francis Darwin first showed in 1880 that the tip of a grass seedling senses light.',
    quiz: [
      mc(
        'What is phototropism?',
        ['Growing toward light', 'Growing toward water', 'Making food', 'Dropping leaves'],
        0,
        'Photo = light, tropism = turning.',
      ),
      mc(
        'Why does a stem bend toward light?',
        [
          'The lit side grows faster',
          'The shaded side grows faster',
          'The stem breaks',
          'Roots push it',
        ],
        1,
        'Auxin on the shady side makes those cells elongate more.',
      ),
      predict(
        'A potted plant is laid on its side in the dark.',
        'What does the shoot do?',
        [
          'Grows sideways forever',
          'Curves upward (gravitropism)',
          'Stops growing',
          'Grows downward',
        ],
        1,
        'Shoots grow against gravity even without light.',
      ),
    ],
    relatedConcepts: ['auxin', 'seed-germination', 'photosynthesis'],
    funFact:
      'Sunflower buds track the Sun across the sky each day, then most mature flowers face east.',
  },
  {
    id: 'auxin',
    title: 'Plant Hormones: Auxin',
    category: 'plants',
    tags: ['plant hormones', 'auxin', 'growth', 'Darwin', 'phototropism'],
    aliases: ['plant hormones', 'IAA', 'how plants bend'],
    difficulty: 3,
    rarity: 'obscure',
    prerequisites: ['tropisms'],
    summary: 'Auxin is a plant hormone that tells cells where to grow — and moves away from light.',
    steps: steps(
      ['Made at the tip', 'Auxin is made in growing shoot tips.'],
      ['Moves to the shade', 'Light from one side pushes auxin to the shaded side.'],
      ['Stretch!', 'Auxin makes cells on the shady side stretch longer.'],
      ['Bend', 'Longer cells on one side bend the shoot toward the light.'],
    ),
    interaction: cascade(
      'Shine light on one side of a seedling. Then try Darwin’s experiment: cover the tip!',
      ['Light from the left', '💡'],
      [
        [
          'Tip senses light',
          '👁️',
          'Light receptors in the very tip detect which side is brighter.',
          'With the tip covered by a cap (Darwin’s 1880 experiment), the seedling can’t tell where the light is — and grows straight.',
        ],
        ['Auxin moves to shaded side', '➡️', 'Transport proteins shift auxin to the darker side.'],
        ['Auxin flows down the stem', '⬇️', 'Auxin travels down from the tip to the growing zone.'],
        [
          'Shaded cells stretch',
          '↕️',
          'Auxin loosens cell walls so shaded-side cells elongate.',
          'Block auxin’s action and cells don’t stretch unevenly — no bend.',
        ],
        [
          'Shoot bends toward light',
          '🌱',
          'Longer cells on the shady side curve the shoot toward the light.',
        ],
      ],
      'The seedling bends toward the light — a hormone signal turned into movement.',
    ),
    goDeeper:
      'Auxin (mostly indole-3-acetic acid, IAA) is made in shoot tips and young leaves and moves by polar transport via PIN efflux carrier proteins. It promotes cell elongation (acid growth: auxin activates proton pumps, acidifying the cell wall and activating expansins), apical dominance (suppressing side buds), root initiation and fruit development. The Darwins showed (1880) that the coleoptile tip senses light; Frits Went isolated the growth substance in 1926–28 using agar blocks.\n\nIn reality, it’s a bit more complicated: plants have many hormones working together — gibberellins (stem growth), cytokinins (cell division), ethylene (ripening), abscisic acid (stress, dormancy) — and auxin’s effects depend on concentration and tissue. Synthetic auxins are used as weedkillers and rooting powders.',
    quiz: [
      mc(
        'Where is auxin mainly made?',
        ['Roots', 'Shoot tips', 'Flowers only', 'Seeds only'],
        1,
        'Growing shoot tips produce auxin.',
      ),
      predict(
        'Darwin covers the tip of a seedling with a tiny cap and shines light from one side.',
        'What happens?',
        [
          'It bends toward the light',
          'It grows straight — the tip can’t sense the light',
          'It dies',
          'It bends away from light',
        ],
        1,
        'The tip is where light is sensed.',
      ),
      mc(
        'What does auxin do on the shaded side of a stem?',
        ['Kills the cells', 'Makes cells stretch longer', 'Turns cells green', 'Stops water flow'],
        1,
        'Elongation on one side causes bending.',
      ),
    ],
    relatedConcepts: ['tropisms', 'cell-signaling', 'seed-germination'],
    funFact:
      'Gardeners pinch off shoot tips to make plants bushier — removing the auxin source lets side buds grow.',
  },
  {
    id: 'pollination',
    title: 'Pollination',
    category: 'plants',
    tags: ['flowers', 'bees', 'pollen', 'seeds', 'fertilization'],
    aliases: ['how flowers make seeds', 'pollinators', 'bees and flowers'],
    difficulty: 1,
    rarity: 'common',
    summary: 'Flowers bribe animals with nectar to carry their pollen to other flowers.',
    steps: steps(
      ['Pollen', 'Pollen carries the plant’s male sex cells.'],
      ['Delivery service', 'Bees, birds, bats and wind carry pollen between flowers.'],
      ['Seeds', 'When pollen reaches the right flower, it can fertilize an egg and make a seed.'],
    ),
    interaction: assembly(
      'Help a bee pollinate an apple blossom: put the steps in order.',
      [
        ['Bee visits flower A', '🐝', 'The bee lands for nectar, a sugary reward.'],
        [
          'Pollen sticks to the bee',
          '✨',
          'Sticky pollen from the anthers clings to the bee’s hairy body.',
        ],
        ['Bee flies to flower B', '🌸', 'The bee visits another flower of the same kind.'],
        ['Pollen lands on the stigma', '🎯', 'Some pollen rubs onto the sticky stigma.'],
        ['Pollen tube grows', '🌱', 'The pollen grain grows a tube down to the ovary.'],
        [
          'Fertilization → seed',
          '🍎',
          'Sperm meets an egg; the ovule becomes a seed and the ovary becomes fruit.',
        ],
      ],
      'Pollinated! About a third of the food crops we eat depend on animal pollinators.',
      {
        distractors: [
          [
            'Bee eats the seed',
            '🌰',
            'Bees drink nectar and collect pollen — they don’t eat seeds.',
          ],
        ],
      },
    ),
    goDeeper:
      'Pollination is the transfer of pollen from an anther to a stigma. Cross-pollination between different plants increases genetic variation. Flowers have coevolved with pollinators: bee-pollinated flowers are often blue or yellow with ultraviolet nectar guides; bird-pollinated flowers are often red, tubular and scentless; bat-pollinated flowers open at night and are pale and musky; wind-pollinated plants (grasses, many trees) have small, plain flowers and huge amounts of light pollen. After pollination, a pollen tube delivers sperm cells for double fertilization in flowering plants.\n\nIn reality, it’s a bit more complicated: some plants can self-pollinate, and many crops (like wheat and rice) are wind- or self-pollinated. Bee declines from habitat loss, pesticides and disease are a serious concern for food production.',
    quiz: [
      mc(
        'What does a bee get from flowers?',
        ['Seeds', 'Nectar and pollen', 'Water', 'Leaves'],
        1,
        'Nectar is food; pollen is protein for the colony.',
      ),
      mc(
        'Where must pollen land for fertilization?',
        ['On the petals', 'On the stigma', 'On the roots', 'On the leaves'],
        1,
        'The stigma is the receiving part.',
      ),
      predict(
        'All the bees disappear from an apple orchard.',
        'What happens to the apple harvest?',
        [
          'It grows larger',
          'It drops sharply, because fewer flowers are pollinated',
          'Nothing changes',
          'Apples turn into flowers',
        ],
        1,
        'Apples depend heavily on insect pollination.',
      ),
    ],
    relatedConcepts: ['coevolution', 'seed-germination', 'symbiosis'],
    funFact: 'Some orchids trick male bees into mating with them by mimicking female bees.',
  },
  {
    id: 'seed-germination',
    title: 'Seed Germination',
    category: 'plants',
    tags: ['seeds', 'sprouting', 'water', 'temperature', 'dormancy'],
    aliases: ['how seeds sprout', 'germination', 'seed dormancy'],
    difficulty: 1,
    rarity: 'common',
    summary: 'A seed is a baby plant in a lunchbox, waiting for the right moment to wake up.',
    steps: steps(
      ['A packed lunch', 'Each seed holds a tiny plant (embryo) and stored food.'],
      ['Wake-up call', 'Water soaks in and wakes the seed up.'],
      ['Just right', 'Seeds also need the right temperature and oxygen.'],
      ['Root first', 'The root pokes out first, then the shoot grows up toward light.'],
    ),
    interaction: slider({
      prompt: 'Set the water and temperature. How many bean seeds sprout?',
      inputs: [
        { id: 'water', label: 'Water', unit: '%', min: 0, max: 100, step: 5, start: 10 },
        { id: 'temp', label: 'Temperature', unit: '°C', min: 0, max: 45, step: 1, start: 10 },
      ],
      output: {
        label: 'Seeds sprouting',
        unit: '%',
        max: 100,
        expr: '100 * gauss(water, 60, 22) * gauss(temp, 25, 7)',
      },
      graphInput: 'temp',
      visual: { kind: 'growth', emoji: '🌱' },
      challenges: [
        {
          prompt: 'Get almost all seeds to sprout (over 90%).',
          target: { min: 90 },
          explain: 'Moist (not flooded) soil at a warm temperature: perfect.',
        },
        {
          prompt: 'Flood them with water. What happens? (Under 30% sprouting at 25 °C.)',
          target: { max: 30 },
          explain: 'Too much water pushes out oxygen, and seeds can’t respire — they rot instead.',
        },
      ],
    }),
    goDeeper:
      'Germination begins with imbibition (water uptake), which rehydrates the seed and activates enzymes. Gibberellins signal the aleurone layer (in cereals) to make amylase, breaking stored starch into sugars for the embryo. The radicle (embryonic root) emerges first, then the shoot (hypocotyl/epicotyl or coleoptile). Requirements: water, oxygen (for respiration) and a suitable temperature; some seeds also need light, cold periods (stratification), fire or passing through an animal’s gut to break dormancy.\n\nIn reality, it’s a bit more complicated: the slider’s second challenge can be met by other settings too, but its point is that too much water starves seeds of oxygen. A 2,000-year-old date palm seed from Masada was successfully germinated in 2005.',
    quiz: [
      mc(
        'What usually comes out of a germinating seed first?',
        ['A leaf', 'The root', 'A flower', 'A fruit'],
        1,
        'The radicle (root) emerges first.',
      ),
      mc(
        'Why do seeds need oxygen to germinate?',
        [
          'To photosynthesize',
          'To respire and release energy from stored food',
          'To make pollen',
          'To smell',
        ],
        1,
        'Germination is powered by respiration.',
      ),
      predict(
        'Seeds are kept dry in a packet for a year.',
        'What happens?',
        [
          'They germinate in the packet',
          'They stay dormant until watered',
          'They turn into soil',
          'They grow leaves',
        ],
        1,
        'Without water, seeds stay dormant.',
      ),
    ],
    relatedConcepts: ['plant-cell', 'tropisms', 'pollination'],
    funFact:
      'A date palm grown from a 2,000-year-old seed found at Masada was nicknamed “Methuselah.”',
  },
  {
    id: 'mycorrhizal-networks',
    title: 'The Wood Wide Web',
    category: 'plants',
    tags: ['mycorrhizae', 'fungi', 'trees', 'symbiosis', 'nutrients', 'forests'],
    aliases: ['wood wide web', 'mycorrhizal networks', 'tree communication', 'fungal networks'],
    difficulty: 3,
    rarity: 'obscure',
    prerequisites: ['fungi'],
    summary:
      'Under the forest floor, fungal threads connect tree roots and trade sugar for nutrients.',
    steps: steps(
      ['Root partners', 'Most plants team up with fungi that wrap around or enter their roots.'],
      [
        'A fair trade',
        'Plants give the fungi sugar; fungi give back water, phosphorus and nitrogen.',
      ],
      ['A network', 'One fungus can connect many trees, linking them underground.'],
    ),
    interaction: cascade(
      'Follow nutrients and sugar through a forest’s fungal network. Then cut a link.',
      ['Spring in the forest', '🌲'],
      [
        ['Big tree photosynthesizes', '🌳', 'A tall tree in full sun makes plenty of sugar.'],
        [
          'Sugar flows to the fungus',
          '🍬',
          'The tree pays its fungal partner with sugar through its roots.',
        ],
        [
          'Fungal threads spread',
          '🕸️',
          'Thin hyphae spread through the soil, far finer and longer than roots.',
          'If the soil is plowed or treated with fungicide, the network is cut and seedlings lose this lifeline.',
        ],
        [
          'Nutrients delivered',
          '🧪',
          'The fungus mines phosphorus and nitrogen from the soil and passes them to connected trees.',
        ],
        [
          'Shaded seedlings helped',
          '🌱',
          'Some carbon may move through the network to seedlings growing in deep shade.',
        ],
      ],
      'The forest is connected: trees and fungi trade resources through a shared underground web.',
    ),
    goDeeper:
      'Mycorrhizae are mutualisms between fungi and plant roots, found in roughly 80–90% of land plant species. Arbuscular mycorrhizal fungi penetrate root cells; ectomycorrhizal fungi (common in many forest trees) form sheaths around roots. Hyphae vastly increase absorptive surface area. Common mycorrhizal networks can link multiple plants, and experiments with isotopes have shown some carbon and nutrients moving between connected plants.\n\nIn reality, it’s a bit more complicated: popular claims that “mother trees” deliberately nourish their offspring or that trees “talk” via the network are debated, and a 2023 review argued field evidence for large-scale resource sharing is weaker than often presented. What is well established is that mycorrhizae are vital to plant nutrition and soil health.',
    quiz: [
      mc(
        'What do plants give their mycorrhizal fungi?',
        ['Water', 'Sugar from photosynthesis', 'Oxygen', 'Pollen'],
        1,
        'Plants pay fungi with carbon.',
      ),
      mc(
        'What do the fungi give the plants?',
        ['Sunlight', 'Water and nutrients like phosphorus', 'Seeds', 'Leaves'],
        1,
        'Fungal threads reach nutrients roots can’t.',
      ),
      predict(
        'A farmer’s soil is repeatedly treated with strong fungicides.',
        'What might happen to the crops?',
        [
          'They grow better',
          'They may absorb fewer nutrients without fungal partners',
          'Nothing',
          'They turn into fungi',
        ],
        1,
        'Disrupting mycorrhizae can weaken plants.',
      ),
    ],
    relatedConcepts: ['fungi', 'symbiosis', 'nitrogen-fixation'],
    funFact: 'A teaspoon of healthy forest soil can contain several kilometers of fungal threads.',
  },
  {
    id: 'carnivorous-plants',
    title: 'Carnivorous Plants',
    category: 'plants',
    tags: ['Venus flytrap', 'pitcher plant', 'sundew', 'nutrients', 'electrical signals'],
    aliases: ['Venus flytrap', 'meat-eating plants', 'pitcher plants', 'sundews'],
    difficulty: 2,
    rarity: 'obscure',
    summary: 'In poor soil, some plants get their nitrogen by trapping and digesting insects.',
    steps: steps(
      ['Hungry soil', 'Carnivorous plants live in bogs with very few nutrients.'],
      ['Trigger hairs', 'A Venus flytrap has trigger hairs inside its leaves.'],
      ['Counting touches', 'Two touches within about 20 seconds snap the trap shut.'],
      ['Digest', 'More touches tell the trap to seal tight and release digestive juices.'],
    ),
    interaction: cascade(
      'A fly lands on a Venus flytrap. Watch the trap count. Then break a step.',
      ['A fly lands', '🪰'],
      [
        [
          'First trigger hair touched',
          '☝️',
          'An electrical signal fires, and the trap “remembers” it for about 20 seconds.',
        ],
        [
          'Second touch in time',
          '✌️',
          'A second touch within ~20 seconds triggers the snap.',
          'Only one touch? The trap stays open — so a raindrop or falling leaf doesn’t waste energy.',
        ],
        ['Trap snaps shut', '🫢', 'The leaf lobes flip shape in about a tenth of a second.'],
        [
          'More touches: seal tight',
          '🔒',
          'The struggling fly triggers more signals; the trap seals tighter.',
        ],
        [
          'Digestive enzymes',
          '🧪',
          'After about five touches, glands release enzymes that digest the insect.',
          'Without enzymes, the plant traps prey but can’t get the nutrients out.',
        ],
        [
          'Nutrients absorbed',
          '🌿',
          'Over days, the plant absorbs nitrogen and phosphorus, then reopens.',
        ],
      ],
      'Dinner! The flytrap gets nutrients its boggy soil can’t provide.',
    ),
    goDeeper:
      'Venus flytraps (Dionaea muscipula) are native only to wetlands around Wilmington, North Carolina. Touching trigger hairs generates action potentials; two within about 20–30 seconds close the trap, which snaps by rapidly changing curvature (a snap-buckling instability). Continued stimulation (around five signals) triggers the hormone jasmonic acid and digestive gland activity. Other carnivorous plants use pitfalls (pitcher plants), sticky glands (sundews, butterworts) or suction bladders (bladderworts, among the fastest plant movements).\n\nIn reality, it’s a bit more complicated: carnivorous plants still photosynthesize for energy — insects are a nutrient supplement, like plant fertilizer, not their main food. Some pitcher plants have partnerships, such as one in Borneo that serves as a toilet for tree shrews.',
    quiz: [
      mc(
        'Why do carnivorous plants catch insects?',
        [
          'For energy instead of photosynthesis',
          'To get nutrients like nitrogen missing from their soil',
          'To scare animals',
          'To spread seeds',
        ],
        1,
        'They live in nutrient-poor bogs.',
      ),
      predict(
        'A single raindrop hits one trigger hair once.',
        'What does the Venus flytrap do?',
        [
          'Snaps shut',
          'Stays open — it needs a second touch soon after',
          'Releases enzymes',
          'Dies',
        ],
        1,
        'The double-touch rule prevents false alarms.',
      ),
      mc(
        'Do carnivorous plants still photosynthesize?',
        ['No', 'Yes — insects are just a nutrient supplement', 'Only at night', 'Only when young'],
        1,
        'Sunlight still provides their energy.',
      ),
    ],
    relatedConcepts: ['action-potential', 'nitrogen-fixation', 'plant-defenses'],
    funFact:
      'Venus flytraps grow naturally only within about 120 km of Wilmington, North Carolina.',
  },
  {
    id: 'plant-defenses',
    title: 'Plant Defense Chemicals',
    category: 'plants',
    tags: ['toxins', 'caffeine', 'thorns', 'herbivores', 'chemical ecology'],
    aliases: ['how plants protect themselves', 'plant toxins', 'secondary metabolites'],
    difficulty: 2,
    rarity: 'common',
    summary:
      'Plants can’t run, so they fight back with spikes, poisons — and by calling in bodyguards.',
    steps: steps(
      ['Can’t run away', 'Plants are rooted, so they defend themselves where they stand.'],
      ['Physical armor', 'Thorns, spines, tough leaves and stinging hairs.'],
      [
        'Chemical weapons',
        'Many plants make toxins or bad-tasting chemicals — some we enjoy, like caffeine.',
      ],
      [
        'Calling for help',
        'Some release scents that attract predators of the insects eating them.',
      ],
    ),
    interaction: sorting(
      'Sort each plant defense by type.',
      [
        ['Physical armor', '🛡️', 'Thorns, spines, hairs'],
        ['Chemical weapon', '🧪', 'Toxins and irritants'],
        ['Calling for help', '📣', 'Recruiting other animals'],
      ],
      [
        ['Rose thorns', '🌹', 0, 'Sharp outgrowths deter browsing animals.'],
        ['Cactus spines', '🌵', 0, 'Spines are modified leaves.'],
        ['Stinging nettle hairs', '🌿', 0, 'Tiny glass-like hairs inject irritating chemicals.'],
        ['Caffeine in coffee leaves', '☕', 1, 'Caffeine is toxic to many insects.'],
        [
          'Capsaicin in chili peppers',
          '🌶️',
          1,
          'It deters mammals — but birds, which spread the seeds, don’t feel the burn.',
        ],
        ['Nicotine in tobacco', '🚬', 1, 'Nicotine is a powerful natural insecticide.'],
        [
          'Corn smell that attracts wasps',
          '🐝',
          2,
          'Caterpillar-damaged corn releases scents that attract parasitic wasps.',
        ],
        [
          'Acacia homes for ants',
          '🐜',
          2,
          'Some acacias house and feed ants that attack herbivores.',
        ],
      ],
    ),
    goDeeper:
      'Plants make thousands of secondary metabolites — alkaloids (caffeine, nicotine, morphine), terpenoids, phenolics (tannins) and cyanogenic glycosides — many of which deter herbivores and microbes. Defenses can be constitutive (always present) or induced after attack, often via the hormone jasmonic acid. Damaged plants release volatile organic compounds that can attract predators and parasitoids and may prime neighboring plants.\n\nIn reality, it’s a bit more complicated: herbivores evolve counter-defenses (monarch caterpillars store milkweed toxins to become poisonous themselves), driving an evolutionary arms race. Many medicines, from aspirin (inspired by willow bark) to the cancer drug paclitaxel (from yew trees), come from plant defense chemicals.',
    quiz: [
      mc(
        'Why do chili peppers make capsaicin?',
        [
          'To attract mammals',
          'To deter mammals while birds spread the seeds',
          'To photosynthesize',
          'To attract bees',
        ],
        1,
        'Birds can’t taste capsaicin, so they eat the fruit and spread seeds.',
      ),
      mc(
        'Which is a chemical defense?',
        ['Rose thorns', 'Cactus spines', 'Nicotine', 'Thick bark'],
        2,
        'Nicotine is a toxic chemical.',
      ),
      predict(
        'Caterpillars start chewing corn leaves.',
        'How might the corn get help?',
        [
          'It runs away',
          'It releases scents that attract parasitic wasps',
          'It grows legs',
          'It turns blue',
        ],
        1,
        'Plants can call in bodyguards with chemical signals.',
      ),
    ],
    relatedConcepts: ['coevolution', 'carnivorous-plants', 'chirality'],
    funFact:
      'The willow-bark chemical salicin inspired aspirin, one of the most widely used medicines in history.',
  },
  {
    id: 'nitrogen-fixation',
    title: 'Nitrogen Fixation',
    category: 'plants',
    tags: ['rhizobia', 'legumes', 'root nodules', 'nitrogenase', 'fertilizer'],
    aliases: ['root nodules', 'rhizobia', 'how plants get nitrogen', 'legumes and bacteria'],
    difficulty: 3,
    rarity: 'common',
    summary: 'Bacteria living in bean roots turn nitrogen from the air into plant food.',
    steps: steps(
      [
        'Nitrogen everywhere, unusable',
        'Air is 78% nitrogen gas, but plants can’t use it directly.',
      ],
      ['Bacterial chemists', 'Rhizobia bacteria have an enzyme that converts N₂ into ammonia.'],
      ['Root nodules', 'Beans and peas grow little bumps on their roots to house the bacteria.'],
      ['A trade', 'The plant gives sugar; the bacteria give usable nitrogen.'],
    ),
    interaction: cascade(
      'A pea plant teams up with nitrogen-fixing bacteria. Then break a step.',
      ['Pea seed sprouts in soil', '🌱'],
      [
        ['Root sends signals', '📡', 'Roots release chemicals (flavonoids) that attract rhizobia.'],
        [
          'Bacteria enter the root',
          '🦠',
          'Rhizobia curl a root hair and move inside through an infection thread.',
        ],
        ['Nodules form', '🟤', 'The root builds pink nodules to house the bacteria.'],
        [
          'Oxygen kept low',
          '🩸',
          'Leghemoglobin (a plant hemoglobin) keeps oxygen low, protecting the enzyme.',
          'Too much oxygen destroys nitrogenase, so nitrogen fixation stops.',
        ],
        [
          'Nitrogenase makes ammonia',
          '⚗️',
          'The enzyme nitrogenase converts N₂ gas into ammonia.',
          'Without nitrogenase, bacteria live in the nodules but can’t fix nitrogen.',
        ],
        [
          'Plant builds proteins',
          '💪',
          'The plant uses the nitrogen to build proteins and DNA; it pays the bacteria in sugar.',
        ],
      ],
      'Fixed! Legumes can enrich the soil with nitrogen for future crops.',
    ),
    goDeeper:
      'Biological nitrogen fixation converts N₂ to NH₃ using nitrogenase, an oxygen-sensitive enzyme that uses about 16 ATP per N₂. Symbiotic fixers include Rhizobium in legumes and Frankia in alder; free-living fixers include cyanobacteria and Azotobacter. Legume nodules are pink because of leghemoglobin, which binds oxygen tightly. Crop rotation with legumes has been used for millennia to restore soil fertility. Industrially, the Haber–Bosch process fixes nitrogen into fertilizer and now supports food production for roughly half the world’s population.\n\nIn reality, it’s a bit more complicated: excess fertilizer runoff causes water pollution and algal blooms, which is one reason scientists are trying to engineer nitrogen fixation into cereal crops like corn and rice.',
    quiz: [
      mc(
        'Why can’t plants use nitrogen from the air directly?',
        [
          'It’s poisonous',
          'N₂ gas is very stable and plants lack the enzyme to break it',
          'It’s too hot',
          'There isn’t any',
        ],
        1,
        'Only certain bacteria have nitrogenase.',
      ),
      mc(
        'Which plants host nitrogen-fixing bacteria in root nodules?',
        ['Grasses', 'Legumes like peas and beans', 'Cacti', 'Mosses'],
        1,
        'Legumes form nodules with rhizobia.',
      ),
      predict(
        'A farmer grows beans one year and wheat the next.',
        'Why might the wheat do better?',
        [
          'Beans leave nitrogen in the soil',
          'Beans remove all nutrients',
          'Wheat likes the shade',
          'There’s no reason',
        ],
        0,
        'Crop rotation uses legumes to enrich soil.',
      ),
    ],
    relatedConcepts: ['nitrogen-cycle', 'symbiosis', 'mycorrhizal-networks'],
    funFact:
      'Scientists estimate that roughly half the nitrogen atoms in your body passed through the Haber–Bosch fertilizer process.',
  },
];
