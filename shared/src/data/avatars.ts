import type { Avatar, AvatarRarity, CategoryId } from '../types';

type Def = [id: string, name: string, art: Avatar['art'], fact: string];

const pack = (rarity: AvatarRarity, defs: Def[]): Avatar[] =>
  defs.map(([id, name, art, fact]) => ({
    id,
    name,
    art,
    fact,
    rarity,
    source: { kind: 'pack' },
    animated: rarity === 'legendary',
  }));

const a = (
  body: Avatar['art']['body'],
  color: string,
  accent: string,
  accessory: Avatar['art']['accessory'] = 'none',
) => ({ body, color, accent, accessory });

export const AVATARS: Avatar[] = [
  ...pack('common', [
    [
      'cellby',
      'Cellby',
      a('cell', '#86efac', '#15803d'),
      'Your body has roughly 30 trillion human cells — and about as many bacteria.',
    ],
    [
      'rbc-courier',
      'Red Blood Cell Courier',
      a('rbc', '#ef4444', '#991b1b', 'cap'),
      'Red blood cells have no nucleus, leaving more room for oxygen-carrying hemoglobin.',
    ],
    [
      'patch-platelet',
      'Patch the Platelet',
      a('cell', '#c4b5fd', '#6d28d9'),
      'Platelets are cell fragments that start plugging a cut within seconds.',
    ],
    [
      'e-cole',
      'E. Cole',
      a('bacterium', '#93c5fd', '#1d4ed8'),
      'Most strains of E. coli are harmless residents of your gut.',
    ],
    [
      'lacto',
      'Lacto',
      a('bacterium', '#fde68a', '#a16207', 'bowtie'),
      'Lactobacillus bacteria turn milk into yogurt by making lactic acid.',
    ],
    [
      'sprouty',
      'Sprouty',
      a('plant', '#4ade80', '#a16207'),
      'Some seeds can wait for years before sprouting when conditions are right.',
    ],
    [
      'leafy',
      'Leafy',
      a('leaf', '#22c55e', '#166534'),
      'Leaves have tiny pores called stomata that open and close to swap gases.',
    ],
    [
      'shroom',
      'Shroom',
      a('mushroom', '#f87171', '#fef3c7'),
      'A mushroom is just the fruit — most of the fungus lives underground as mycelium.',
    ],
    [
      'eggbert',
      'Eggbert',
      a('egg', '#fef3c7', '#d97706'),
      'A chicken eggshell has thousands of tiny pores that let the growing chick breathe.',
    ],
    [
      'wiggles',
      'Wiggles',
      a('worm', '#f9a8d4', '#be185d'),
      'Earthworms breathe through their skin, which has to stay moist.',
    ],
    [
      'lady-dot',
      'Lady Dot',
      a('beetle', '#ef4444', '#1e1b2e'),
      'A single ladybug can eat thousands of aphids in its lifetime.',
    ],
    [
      'boney',
      'Boney',
      a('bone', '#f5f5f4', '#a8a29e'),
      'Your skeleton is constantly remodeled — most of it is replaced about every 10 years.',
    ],
    [
      'chompy',
      'Chompy',
      a('tooth', '#ffffff', '#93c5fd'),
      'Tooth enamel is the hardest substance in the human body.',
    ],
    [
      'ticker',
      'Ticker',
      a('heart', '#fb7185', '#9f1239'),
      'Your heart beats about 100,000 times a day.',
    ],
    [
      'goldie',
      'Goldie',
      a('fish', '#fb923c', '#c2410c'),
      'Goldfish can remember things for months — the “3-second memory” is a myth.',
    ],
    [
      'chirp',
      'Chirp',
      a('bird', '#93c5fd', '#f59e0b'),
      'Birds are living dinosaurs, descended from feathered theropods.',
    ],
    [
      'petal',
      'Petal',
      a('flower', '#f472b6', '#facc15'),
      'Many flowers have ultraviolet patterns, invisible to us, that guide bees to nectar.',
    ],
    [
      'helixa',
      'Helixa',
      a('helix', '#a78bfa', '#f472b6'),
      'The DNA in just one of your cells would stretch about 2 meters if unwound.',
    ],
  ]),
  ...pack('uncommon', [
    [
      'powerhouse',
      'The Powerhouse',
      a('mitochondrion', '#fb923c', '#7c2d12', 'sunglasses'),
      'Mitochondria have their own DNA, which you inherit only from your mother.',
    ],
    [
      'chef-ribo',
      'Chef Ribo',
      a('ribosome', '#fbbf24', '#92400e', 'chef-hat'),
      'Ribosomes link amino acids into proteins at several per second.',
    ],
    [
      'sparky',
      'Sparky the Neuron',
      a('neuron', '#a5b4fc', '#4338ca', 'lightning'),
      'Some neurons can fire signals hundreds of times per second.',
    ],
    [
      'insulin-key',
      'Insulin Key',
      a('key', '#facc15', '#a16207'),
      'Insulin was first used to treat diabetes in January 1922.',
    ],
    [
      'helix-dancer',
      'DNA Double-Helix Dancer',
      a('helix', '#38bdf8', '#f43f5e', 'bowtie'),
      'The double helix was published in 1953, built on Rosalind Franklin’s X-ray images.',
    ],
    [
      'flu-ey',
      'Flu-ey',
      a('virus', '#67e8f9', '#0e7490', 'scarf'),
      'Flu viruses change their surface proteins so often that vaccines are updated every year.',
    ],
    [
      'echo',
      'Echo the Bat',
      a('bat', '#6b7280', '#f9a8d4', 'headphones'),
      'Some bats can detect wires as thin as a human hair using echolocation.',
    ],
    [
      'inky',
      'Inky',
      a('octopus', '#f472b6', '#9d174d'),
      'Octopuses have three hearts and blue, copper-based blood.',
    ],
    [
      'thinky',
      'Thinky',
      a('brain', '#f9a8d4', '#be185d', 'monocle'),
      'Your brain uses about 20% of your body’s energy.',
    ],
    [
      'moon-jelly',
      'Moon Jelly',
      a('jellyfish', '#c7d2fe', '#818cf8'),
      'Jellyfish have no brain, heart or bones and are about 95% water.',
    ],
    [
      'bumble',
      'Bumble',
      a('beetle', '#facc15', '#1e1b2e', 'goggles'),
      'Bumblebees “buzz pollinate”, shaking pollen loose by vibrating their flight muscles.',
    ],
    [
      'bifido',
      'Bifido',
      a('bacterium', '#86efac', '#166534', 'headphones'),
      'Bifidobacteria are among the first microbes to settle in a baby’s gut.',
    ],
    [
      'mudskipper',
      'Mudskipper',
      a('fish', '#a3a3a3', '#57534e', 'goggles'),
      'Mudskippers are fish that hop on land and absorb oxygen through their skin.',
    ],
    [
      'cactus-jack',
      'Cactus Jack',
      a('plant', '#16a34a', '#f472b6', 'flower'),
      'Cacti use CAM photosynthesis, opening their pores only at night to save water.',
    ],
  ]),
  ...pack('rare', [
    [
      'wbc-knight',
      'White Blood Cell Knight',
      a('cell', '#f8fafc', '#64748b', 'shield'),
      'A single neutrophil can swallow many bacteria before it dies in the fight.',
    ],
    [
      'phage-bot',
      'Bacteriophage Bot',
      a('phage', '#cbd5e1', '#475569', 'goggles'),
      'Bacteriophages inject their DNA into bacteria like tiny syringes.',
    ],
    [
      'axolotl',
      'Axolotl',
      a('axolotl', '#f9a8d4', '#db2777'),
      'Axolotls can regrow limbs, parts of their heart, and even parts of their brain.',
    ],
    [
      'captain-y',
      'Captain Y',
      a('antibody', '#60a5fa', '#1d4ed8', 'cape'),
      'Your body can make billions of different antibodies.',
    ],
    [
      'flytrap',
      'Venus Flytrap',
      a('flytrap', '#4ade80', '#dc2626'),
      'A Venus flytrap only snaps shut if its trigger hairs are touched twice within about 20 seconds.',
    ],
    [
      'mole-rat',
      'Naked Mole-Rat',
      a('molerat', '#fda4af', '#e11d48'),
      'Naked mole-rats can live over 30 years and very rarely get cancer.',
    ],
    [
      'zap-eel',
      'Electric Eel',
      a('eel', '#65a30d', '#facc15', 'lightning'),
      'Electric eels can deliver shocks of up to about 860 volts.',
    ],
    [
      'anglerfish',
      'Bioluminescent Anglerfish',
      a('fish', '#334155', '#a3e635'),
      'The anglerfish’s glowing lure is lit by bioluminescent bacteria living inside it.',
    ],
    [
      'myco-wizard',
      'Mycelium Wizard',
      a('mushroom', '#a78bfa', '#fef3c7', 'wizard-hat'),
      'Fungal networks connect tree roots and can move carbon and nutrients between plants.',
    ],
    [
      'chloro',
      'Chloro',
      a('mitochondrion', '#4ade80', '#14532d'),
      'Chloroplasts were once free-living bacteria swallowed by an ancient cell.',
    ],
  ]),
  ...pack('epic', [
    [
      'prof-octo',
      'Professor Octo',
      a('octopus', '#c084fc', '#6b21a8', 'monocle'),
      'About two-thirds of an octopus’s neurons are in its arms.',
    ],
    [
      'bdelloid',
      'Bdelloid Rotifer',
      a('worm', '#fde68a', '#b45309', 'halo'),
      'Bdelloid rotifers have no males and have picked up genes from bacteria, fungi and plants.',
    ],
    [
      'robin-compass',
      'Robin Compass',
      a('bird', '#f97316', '#78350f', 'goggles'),
      'European robins may sense Earth’s magnetic field with a light-sensitive protein in their eyes.',
    ],
    [
      'crispr-cutter',
      'CRISPR Cutter',
      a('helix', '#34d399', '#065f46', 'goggles'),
      'CRISPR started as a bacterial immune system that remembers viruses.',
    ],
    [
      'stem-sam',
      'Stem Cell Sam',
      a('cell', '#fef08a', '#ca8a04', 'halo'),
      'Stem cells can divide and turn into many other kinds of cells.',
    ],
    [
      'prion-twist',
      'Prion Twister',
      a('cell', '#e879f9', '#86198f', 'scarf'),
      'Prions are misfolded proteins that make normal proteins misfold too.',
    ],
    [
      'glowworm',
      'Glowworm',
      a('worm', '#bef264', '#0ea5e9', 'headphones'),
      'New Zealand glowworms are gnat larvae that use light to lure insects into sticky threads.',
    ],
  ]),
  ...pack('legendary', [
    [
      'tardi-astronaut',
      'Tardigrade Astronaut',
      a('tardigrade', '#d6d3d1', '#78716c', 'helmet'),
      'In 2007, tardigrades survived exposure to open space on a satellite mission.',
    ],
    [
      'immortal-jelly',
      'Immortal Jellyfish',
      a('jellyfish', '#fca5a5', '#dc2626', 'halo'),
      'Turritopsis dohrnii can revert to a young polyp stage, restarting its life cycle.',
    ],
    [
      'mito-eve',
      'Mitochondrial Eve',
      a('mitochondrion', '#fcd34d', '#b45309', 'crown'),
      'All living humans share a maternal ancestor who lived in Africa about 150,000–200,000 years ago.',
    ],
    [
      'planarian-prime',
      'Planarian Prime',
      a('worm', '#fdba74', '#9a3412', 'crown'),
      'A planarian cut into pieces can regrow every piece into a complete worm.',
    ],
    [
      'vent-archaeon',
      'Vent Archaeon',
      a('bacterium', '#f87171', '#7f1d1d', 'helmet'),
      'Some archaea at deep-sea hydrothermal vents grow at over 120 °C.',
    ],
  ]),
];

const CATEGORY_AVATARS: [CategoryId, string, string, Avatar['art'], AvatarRarity, string][] = [
  [
    'cell',
    'golgi-post',
    'Golgi Postmaster',
    a('cell', '#fde68a', '#b45309', 'cap'),
    'epic',
    'The Golgi apparatus adds sugar “shipping labels” that send proteins to the right place.',
  ],
  [
    'genetics',
    'mendel-pea',
    'Mendel’s Pea',
    a('egg', '#86efac', '#166534', 'monocle'),
    'epic',
    'Gregor Mendel grew tens of thousands of pea plants to discover the rules of inheritance.',
  ],
  [
    'biochem',
    'turbo-synthase',
    'Turbo Synthase',
    a('ribosome', '#5eead4', '#0f766e', 'helmet'),
    'epic',
    'ATP synthase is a rotary motor that can spin over 100 times per second.',
  ],
  [
    'physiology',
    'heart-hero',
    'Heart Hero',
    a('heart', '#f43f5e', '#881337', 'cape'),
    'epic',
    'Your heart pumps around 7,000 liters of blood every day.',
  ],
  [
    'neuro',
    'dopamine-diva',
    'Dopamine Diva',
    a('brain', '#c4b5fd', '#5b21b6', 'headphones'),
    'epic',
    'Dopamine is more about wanting and anticipating rewards than enjoying them.',
  ],
  [
    'immunology',
    't-cell-sensei',
    'T-Cell Sensei',
    a('cell', '#bae6fd', '#0369a1', 'wizard-hat'),
    'epic',
    'Only a small fraction of young T cells pass their training in the thymus.',
  ],
  [
    'microbes',
    'zombie-ant',
    'Zombie Ant',
    a('beetle', '#78350f', '#fbbf24'),
    'epic',
    'Ophiocordyceps fungus steers infected ants to bite onto leaves before sprouting from their heads.',
  ],
  [
    'plants',
    'wood-wide-webber',
    'Wood Wide Webber',
    a('mushroom', '#d6d3d1', '#57534e', 'scarf'),
    'epic',
    'Most land plants partner with mycorrhizal fungi that trade nutrients for sugar.',
  ],
  [
    'evolution',
    'darwins-finch',
    'Darwin’s Finch',
    a('bird', '#a8a29e', '#f59e0b', 'monocle'),
    'epic',
    'Galápagos finch beaks measurably changed after a single drought year in 1977.',
  ],
  [
    'ecology',
    'yellowstone-wolf',
    'Yellowstone Wolf',
    a('wolf', '#9ca3af', '#4b5563'),
    'epic',
    'After wolves returned to Yellowstone in 1995, changes rippled through elk, willows and beavers.',
  ],
  [
    'development',
    'hox-fly',
    'Hox Fly',
    a('beetle', '#fca5a5', '#7f1d1d', 'crown'),
    'epic',
    'Hox genes are so similar across animals that a mouse Hox gene can work in a fruit fly.',
  ],
  [
    'weird',
    'vampire-squid',
    'Vampire Squid',
    a('octopus', '#7f1d1d', '#f87171', 'cape'),
    'legendary',
    'The vampire squid lives in oxygen-poor deep water and can flip its webbed arms over its body like a cloak.',
  ],
];

const MYSTERY_AVATARS: [string, string, Avatar['art'], AvatarRarity, string][] = [
  [
    'detective-phage',
    'Detective Phage',
    a('phage', '#e2e8f0', '#334155', 'monocle'),
    'epic',
    'Phages helped prove that DNA is the genetic material (the Hershey–Chase experiment, 1952).',
  ],
  [
    'inspector-insulin',
    'Inspector Insulin',
    a('key', '#fde047', '#854d0e', 'cap'),
    'epic',
    'Before lab tests, doctors noticed that the urine of people with diabetes tasted sweet.',
  ],
  [
    'agent-macro',
    'Agent Macrophage',
    a('cell', '#fecdd3', '#9f1239', 'sunglasses'),
    'epic',
    'Some tissue macrophages live for months or years, patrolling for invaders.',
  ],
  [
    'inspector-mole',
    'Inspector Mole',
    a('molerat', '#fecaca', '#991b1b', 'monocle'),
    'legendary',
    'Naked mole-rats survived 18 minutes without oxygen in lab experiments by switching fuels.',
  ],
  [
    'doctor-leech',
    'Doctor Leech',
    a('worm', '#57534e', '#a8a29e', 'stethoscope'),
    'epic',
    'Medicinal leeches are still used after some surgeries to restore blood flow.',
  ],
  [
    'lab-tardigrade',
    'Lab Tardigrade',
    a('tardigrade', '#e7e5e4', '#57534e', 'goggles'),
    'legendary',
    'Tardigrades survive drying out by curling into a “tun”, losing almost all their water.',
  ],
];

AVATARS.push(
  ...CATEGORY_AVATARS.map(([category, id, name, art, rarity, fact]) => ({
    id,
    name,
    art,
    fact,
    rarity,
    source: { kind: 'category' as const, category },
    animated: true,
  })),
  ...MYSTERY_AVATARS.map(([id, name, art, rarity, fact]) => ({
    id,
    name,
    art,
    fact,
    rarity,
    source: { kind: 'mystery' as const },
    animated: true,
  })),
);

export const AVATAR_BY_ID: Record<string, Avatar> = Object.fromEntries(
  AVATARS.map((x) => [x.id, x]),
);

/** Every new player starts with this one equipped. */
export const STARTER_AVATAR = 'cellby';

export const categoryAvatar = (category: CategoryId) =>
  AVATARS.find((x) => x.source.kind === 'category' && x.source.category === category);
