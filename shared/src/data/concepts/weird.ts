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
  zoom,
} from './helpers';

export const weird: Concept[] = [
  {
    id: 'tardigrades',
    title: 'Tardigrade Cryptobiosis',
    category: 'weird',
    tags: ['water bears', 'extremophiles', 'survival', 'tun state', 'dehydration'],
    aliases: ['water bears', 'moss piglets', 'tun state', 'cryptobiosis'],
    difficulty: 2,
    rarity: 'obscure',
    summary:
      'Tardigrades survive drying out, freezing and even space by shutting down into a lifeless-looking “tun.”',
    steps: steps(
      ['Tiny bears', 'Tardigrades are half-millimeter animals with eight stubby legs.'],
      ['Shut down', 'When their home dries up, they curl into a dry ball called a tun.'],
      ['Nearly lifeless', 'Their metabolism drops to almost nothing — they can wait for years.'],
      ['Just add water', 'Add water and they wake up and walk away.'],
    ),
    interaction: slider({
      prompt:
        'Expose a tardigrade to harsh conditions. Compare an active tardigrade with one curled into a tun.',
      inputs: [
        { id: 'water', label: 'Water in its body', unit: '%', min: 2, max: 85, step: 1, start: 85 },
        {
          id: 'cold',
          label: 'How harsh it gets (cold, radiation, vacuum)',
          unit: '%',
          min: 0,
          max: 100,
          step: 5,
          start: 50,
        },
      ],
      output: {
        label: 'Chance of surviving',
        unit: '%',
        max: 100,
        expr: '100 * (1 - (cold / 100) * sig(water, 25, 6))',
      },
      readouts: [{ label: 'State (1 = tun, 0 = active)', expr: 'step(20 - water, 1, 0)' }],
      graphInput: 'cold',
      visual: { kind: 'growth', emoji: '🐻' },
      challenges: [
        {
          prompt:
            'An active, water-filled tardigrade in extreme conditions: show its survival dropping under 10%.',
          target: { max: 10 },
          explain: 'Active tardigrades are tough, but not invincible.',
        },
        {
          prompt: 'Dry it into a tun and survive extreme conditions (over 90%).',
          target: { min: 90 },
          explain:
            'With almost no water, damaging reactions stop. Tuns can survive extreme cold, radiation and even space.',
        },
      ],
    }),
    goDeeper:
      'Tardigrades enter anhydrobiosis by losing over 95% of their water and contracting into a tun. Protective molecules — intrinsically disordered proteins (CAHS proteins) that form a glass-like gel, plus antioxidants and a DNA-protecting protein called Dsup — help preserve their cells. In tun form, they have survived temperatures near absolute zero, high doses of radiation, and 10 days in open space (FOTON-M3 mission, 2007).\n\nIn reality, it’s a bit more complicated: the slider makes survival depend on a single “harshness” dial, but each stress has its own limits. Tardigrades are extremely tough survivors, not extremophiles that thrive in extreme places — they live in ordinary moss, and active tardigrades are much more fragile.',
    quiz: [
      mc(
        'What is a tardigrade’s “tun”?',
        ['Its food', 'A dried-out, curled-up survival state', 'Its shell', 'A type of egg'],
        1,
        'In the tun state, metabolism nearly stops.',
      ),
      predict(
        'A dried tardigrade tun is stored for years, then placed in water.',
        'What can happen?',
        [
          'It stays dead',
          'It rehydrates and becomes active again',
          'It turns into moss',
          'It dissolves',
        ],
        1,
        'Tardigrades can revive after long periods.',
      ),
      mc(
        'Where do tardigrades usually live?',
        [
          'Only in volcanoes',
          'In ordinary places like moss and lichen',
          'Only in space',
          'Inside humans',
        ],
        1,
        'They’re common in damp moss everywhere.',
      ),
    ],
    relatedConcepts: ['extremophiles', 'bdelloid-rotifers', 'protein-folding'],
    funFact:
      'Tardigrades survived 10 days exposed to outer space in 2007, and some still had babies afterward.',
  },
  {
    id: 'bioluminescence',
    title: 'Bioluminescence',
    category: 'weird',
    tags: ['glowing animals', 'luciferin', 'fireflies', 'deep sea', 'light'],
    aliases: ['glowing animals', 'living light', 'luciferin and luciferase'],
    difficulty: 2,
    rarity: 'obscure',
    summary:
      'Fireflies, jellyfish and deep-sea fish make their own light with a chemical reaction.',
    steps: steps(
      [
        'Cold light',
        'A molecule called luciferin reacts with oxygen, helped by an enzyme (luciferase), giving off light.',
      ],
      ['Mostly ocean', 'Most glowing creatures live in the sea, especially the deep, dark ocean.'],
      ['Many uses', 'Light helps animals hunt, hide, find mates and scare predators.'],
    ),
    interaction: sorting(
      'Why does each creature glow?',
      [
        ['Lure prey', '🎣', 'Light as bait'],
        ['Find a mate', '💞', 'Light as a love signal'],
        ['Hide (counter-illumination)', '🫥', 'Glowing belly matches light from above'],
        ['Scare or distract predators', '😱', 'Light as an alarm or decoy'],
      ],
      [
        ['Anglerfish', '🐟', 0, 'Its glowing lure attracts curious prey to its jaws.'],
        ['Firefly', '🪲', 1, 'Each firefly species flashes its own pattern to attract mates.'],
        [
          'Hawaiian bobtail squid',
          '🦑',
          2,
          'Glowing bacteria light its underside so it casts no shadow in moonlight.',
        ],
        [
          'Hatchetfish',
          '🐠',
          2,
          'Light organs on its belly blend in with the faint light from above.',
        ],
        [
          'Glowing ocean plankton (dinoflagellates)',
          '🌊',
          3,
          'Flashing when disturbed can startle grazers and attract bigger predators to eat them — a “burglar alarm.”',
        ],
        ['Vampire squid', '🧛', 3, 'It ejects a cloud of glowing mucus to confuse attackers.'],
      ],
    ),
    goDeeper:
      'Bioluminescence evolved independently dozens of times (estimates exceed 90 origins). The general reaction is luciferin + O₂ → oxyluciferin + light, catalyzed by luciferase; fireflies also need ATP, and some jellyfish use photoproteins like aequorin triggered by calcium. Most ocean bioluminescence is blue-green, which travels farthest in seawater; dragonfish make red light that most prey can’t see. An estimated 75% of deep-sea animals produce light.\n\nIn reality, it’s a bit more complicated: some animals make their own luciferin while others get it from their diet or host glowing bacteria. Green fluorescent protein (GFP) from jellyfish doesn’t make light itself — it converts blue light into green — but it became one of biology’s most important research tools (Nobel Prize 2008).',
    quiz: [
      mc(
        'What reaction makes most living light?',
        [
          'Luciferin reacting with oxygen, helped by luciferase',
          'Burning sugar with fire',
          'Electricity from nerves',
          'Reflecting moonlight',
        ],
        0,
        'A chemical reaction releases energy as light.',
      ),
      mc(
        'Where do most bioluminescent animals live?',
        ['Deserts', 'The ocean', 'Mountains', 'Cities'],
        1,
        'Most glowing species are marine.',
      ),
      predict(
        'A squid swimming at night lights up its underside to match the moonlight above.',
        'Why?',
        [
          'To attract mates',
          'To erase its shadow so predators below can’t see it',
          'To keep warm',
          'To find food',
        ],
        1,
        'This is counter-illumination camouflage.',
      ),
    ],
    relatedConcepts: ['quorum-sensing', 'enzymes', 'hydrothermal-vents'],
    funFact:
      'Some synchronous fireflies in the Great Smoky Mountains flash in unison across whole forests.',
  },
  {
    id: 'immortal-jellyfish',
    title: 'The Immortal Jellyfish',
    category: 'weird',
    tags: ['Turritopsis', 'aging', 'transdifferentiation', 'life cycle', 'jellyfish'],
    aliases: [
      'Turritopsis dohrnii',
      'biologically immortal jellyfish',
      'jellyfish that ages backwards',
    ],
    difficulty: 3,
    rarity: 'obscure',
    prerequisites: ['stem-cells'],
    summary:
      'When stressed, this tiny jellyfish can turn back into a baby polyp and start life over.',
    steps: steps(
      ['Normal life', 'Jellyfish start as polyps stuck to rocks, then bud off swimming medusas.'],
      ['Trouble', 'Most medusas die after reproducing, or when injured or starving.'],
      ['Reverse!', 'Turritopsis dohrnii can shrink back into a blob and become a polyp again.'],
      ['Again and again', 'In theory it could repeat this cycle indefinitely.'],
    ),
    interaction: timeline(
      'Follow the immortal jellyfish through its life — and back again.',
      [
        [
          'Polyp',
          'A polyp attached to a rock, like a tiny sea anemone.',
          [em('j', '🪸', 50, 65, 2)],
          'Start',
        ],
        [
          'Medusa buds off',
          'The polyp buds off a tiny swimming jellyfish (medusa).',
          [em('rock', '🪸', 40, 70, 1.6), em('j', '🪼', 60, 40, 1.2)],
        ],
        [
          'Adult medusa',
          'The medusa grows and can reproduce. About 4–5 mm across.',
          [em('j', '🪼', 50, 40, 2)],
        ],
        [
          'Stressed',
          'Starvation or injury: instead of dying, it sinks to the bottom.',
          [em('j', '🪼', 50, 70, 1.6, { rotate: 180, opacity: 0.7 })],
        ],
        [
          'Blob (cyst)',
          'Its body reabsorbs into a blob. Cells transdifferentiate — switch to new cell types.',
          [sh('j', 'blob', '#fca5a5', 50, 75, 1)],
        ],
        [
          'Polyp again',
          'A new polyp colony grows. The cycle can begin again!',
          [em('j', '🪸', 50, 65, 2), em('star', '♻️', 70, 35, 1)],
        ],
      ],
      [
        ['Stop when it’s an adult swimming medusa.', 2],
        ['Stop when it has turned back into a polyp.', 5],
      ],
      '#eff6ff',
    ),
    goDeeper:
      'Turritopsis dohrnii can undergo reverse development: the medusa degenerates into a cyst-like mass whose cells transdifferentiate (convert directly from one specialized type to another) to form a stolon and new polyps. This “life-cycle reversal” was described in the 1990s. Genome studies (2022) found expanded and modified genes for DNA repair, telomere maintenance and stem cell function.\n\nIn reality, it’s a bit more complicated: “immortal” means it can avoid death from old age, not from everything — most are eaten or killed by disease. Some other hydrozoans and a few other animals show partial reverse development too.',
    quiz: [
      mc(
        'What can Turritopsis dohrnii do that most animals can’t?',
        ['Fly', 'Revert from adult back to a young polyp stage', 'Live on land', 'Photosynthesize'],
        1,
        'It can reverse its life cycle.',
      ),
      mc(
        'What is transdifferentiation?',
        [
          'Cells dying',
          'A specialized cell changing directly into another type',
          'Cells copying DNA',
          'Cells eating bacteria',
        ],
        1,
        'The jellyfish’s cells change identity.',
      ),
      predict(
        'An immortal jellyfish is eaten by a fish.',
        'Does its “immortality” save it?',
        [
          'Yes',
          'No — it can avoid aging, not being eaten',
          'It turns into a fish',
          'It becomes a polyp inside the fish',
        ],
        1,
        'Biological immortality isn’t invincibility.',
      ),
    ],
    relatedConcepts: ['stem-cells', 'regeneration', 'telomeres', 'metamorphosis'],
    funFact:
      'Adult immortal jellyfish are smaller than a pinky fingernail — about 4–5 millimeters across.',
  },
  {
    id: 'bdelloid-rotifers',
    title: 'Bdelloid Rotifers',
    category: 'weird',
    tags: [
      'asexual reproduction',
      'horizontal gene transfer',
      'desiccation',
      'microscopic animals',
    ],
    aliases: ['bdelloids', 'animals without males', 'rotifers'],
    difficulty: 4,
    rarity: 'obscure',
    prerequisites: ['horizontal-gene-transfer'],
    summary:
      'Tiny animals with no males for millions of years — that patch their DNA with genes from other species.',
    steps: steps(
      ['All female', 'No male bdelloid rotifer has ever been found.'],
      ['Dry out, revive', 'They survive drying out completely, then revive with water.'],
      ['Broken DNA', 'Drying shatters their DNA, which they repair when they rehydrate.'],
      [
        'Borrowed genes',
        'During repair, they seem to pick up genes from bacteria, fungi and plants.',
      ],
    ),
    interaction: cascade(
      'Follow a bdelloid rotifer through drying out and recovery. Then break a step.',
      ['The puddle dries up', '☀️'],
      [
        [
          'Dries out completely',
          '🏜️',
          'The rotifer loses almost all its water and becomes dormant.',
        ],
        ['DNA breaks', '💔', 'Drying causes many breaks in its DNA.'],
        ['Water returns', '💧', 'Rain refills the puddle and the rotifer rehydrates.'],
        [
          'DNA repaired',
          '🧵',
          'Powerful repair systems stitch the broken DNA back together.',
          'Without strong DNA repair, the rotifer can’t recover from the breaks and dies.',
        ],
        [
          'Foreign genes slip in',
          '🧬',
          'Pieces of DNA from other organisms nearby may get stitched in during repair.',
          'Without borrowing genes, this lineage would have fewer sources of new variation without sex.',
        ],
        [
          'Reproduces without males',
          '👩‍👧',
          'It lays eggs that hatch into genetically near-identical daughters.',
        ],
      ],
      'Survived — and possibly gained a new gene from a completely different kingdom of life.',
    ),
    goDeeper:
      'Bdelloid rotifers are microscopic freshwater animals (about 0.1–1 mm) that reproduce parthenogenetically; no males or meiosis have ever been observed, and they have persisted for tens of millions of years, diversifying into hundreds of species — a puzzle because most asexual lineages die out quickly. Their genomes contain an unusually high fraction of genes acquired by horizontal gene transfer (roughly 8–10% of genes), and they survive desiccation and high radiation by repairing double-strand DNA breaks.\n\nIn reality, it’s a bit more complicated: the link between drying, DNA repair and gene uptake is a leading hypothesis, not fully proven. Some studies suggest bdelloids may occasionally exchange DNA between individuals in ways that partly substitute for sex.',
    quiz: [
      mc(
        'What is unusual about bdelloid rotifer reproduction?',
        [
          'They have three sexes',
          'No males have ever been found; females reproduce alone',
          'They reproduce by splitting in half',
          'They need two males',
        ],
        1,
        'They are fully asexual.',
      ),
      mc(
        'Where do some bdelloid genes come from?',
        [
          'Only their mothers',
          'Other organisms, like bacteria and fungi, through horizontal gene transfer',
          'Viruses only',
          'Nowhere',
        ],
        1,
        'They have many foreign genes.',
      ),
      predict(
        'A bdelloid rotifer dries out for months, then gets wet.',
        'What happens?',
        [
          'It stays dead',
          'It revives and repairs its broken DNA',
          'It becomes male',
          'It turns into a plant',
        ],
        1,
        'They are champions of drying out and recovering.',
      ),
    ],
    relatedConcepts: ['horizontal-gene-transfer', 'tardigrades', 'red-queen'],
    funFact:
      'Bdelloid rotifers revived from 24,000-year-old Siberian permafrost started reproducing again.',
  },
  {
    id: 'electric-eels',
    title: 'Electric Eels',
    category: 'weird',
    tags: ['electrocytes', 'voltage', 'electric fish', 'batteries in series', 'hunting'],
    aliases: ['electric eel', 'electrocytes', 'electric fish'],
    difficulty: 3,
    rarity: 'obscure',
    prerequisites: ['action-potential'],
    summary:
      'Electric eels stack thousands of tiny cell “batteries” to make a shock of hundreds of volts.',
    steps: steps(
      ['Not really eels', 'Electric eels are actually a kind of knifefish.'],
      ['Living batteries', 'Special cells called electrocytes each make a small voltage.'],
      ['Stacked in a row', 'Thousands of them fire at once, lined up like batteries in series.'],
      ['Zap!', 'The voltages add up to shocks of 600+ volts.'],
    ),
    interaction: slider({
      prompt: 'Stack electrocytes in series. How many does it take to stun a fish?',
      inputs: [
        {
          id: 'cells',
          label: 'Electrocytes firing in a row',
          min: 0,
          max: 6000,
          step: 100,
          start: 500,
        },
      ],
      output: { label: 'Shock voltage', unit: 'V', max: 900, expr: 'cells * 0.15' },
      readouts: [
        { label: 'AA batteries in a row for the same voltage', expr: 'cells * 0.15 / 1.5' },
      ],
      graphInput: 'cells',
      visual: { kind: 'particles', emoji: '⚡' },
      challenges: [
        {
          prompt: 'Make a gentle sensing pulse under 20 V.',
          target: { max: 20 },
          explain: 'Eels also use weak pulses to sense their surroundings.',
        },
        {
          prompt: 'Make a stunning 600+ volt shock.',
          target: { min: 600 },
          explain:
            'About 4,000+ electrocytes in series. Each adds about 0.15 V, like batteries stacked end to end.',
        },
      ],
    }),
    goDeeper:
      'Electric eels (genus Electrophorus) have three electric organs made of electrocytes, modified muscle cells. When signaled, each electrocyte generates about 0.15 V by opening sodium channels on one face only; because thousands are arranged in series, their voltages add (series) while columns side by side add current (parallel). Eels use high-voltage shocks to stun prey and defend themselves, and weak discharges for electrolocation. In 2019, Electrophorus voltai was described, producing up to about 860 V.\n\nIn reality, it’s a bit more complicated: an eel’s maximum voltage also depends on its size, the water and how many electrocytes fire. Eels can curl their bodies to bring both ends of the electric organ around prey, concentrating the shock — and some leap out of water to shock threats directly.',
    quiz: [
      mc(
        'Why do electric eels produce such high voltages?',
        [
          'They eat batteries',
          'Thousands of electrocytes fire together, stacked in series',
          'They use lightning',
          'Their blood is metal',
        ],
        1,
        'Voltages add up like batteries in a row.',
      ),
      mc(
        'What are electrocytes?',
        ['Blood cells', 'Modified muscle cells that generate voltage', 'Nerve fibers', 'Fat cells'],
        1,
        'They evolved from muscle cells.',
      ),
      predict(
        'An eel uses only a few hundred electrocytes at once.',
        'What kind of discharge is that?',
        [
          'A huge 800-volt shock',
          'A weak pulse, like those used for sensing',
          'No electricity at all',
          'Light',
        ],
        1,
        'Fewer cells in series means lower voltage.',
      ),
    ],
    relatedConcepts: ['action-potential', 'muscle-contraction', 'echolocation'],
    funFact:
      'Electric eels can leap out of the water to deliver shocks directly to a threat, as Alexander von Humboldt described in 1800.',
  },
  {
    id: 'echolocation',
    title: 'Echolocation',
    category: 'weird',
    tags: ['bats', 'dolphins', 'sound', 'echoes', 'senses'],
    aliases: ['biosonar', 'how bats see with sound', 'sonar animals'],
    difficulty: 2,
    rarity: 'obscure',
    summary: 'Bats and dolphins “see” with sound by listening to the echoes of their own calls.',
    steps: steps(
      ['Shout', 'A bat sends out a high-pitched call, too high for most humans to hear.'],
      ['Echo', 'The sound bounces off objects and comes back.'],
      ['Measure', 'The time until the echo returns tells the bat how far away something is.'],
      ['Close in', 'As it closes in on a moth, it calls faster and faster — a “feeding buzz.”'],
    ),
    interaction: slider({
      prompt: 'A bat calls and waits for the echo from a moth. How long does the echo take?',
      inputs: [
        {
          id: 'dist',
          label: 'Distance to the moth',
          unit: 'm',
          min: 0.1,
          max: 20,
          step: 0.1,
          start: 5,
        },
      ],
      output: { label: 'Echo delay', unit: 'ms', max: 120, expr: '2 * dist / 343 * 1000' },
      readouts: [
        {
          label: 'Calls per second the bat could make',
          expr: 'min(200, 1000 / (2 * dist / 343 * 1000 + 3))',
        },
      ],
      graphInput: 'dist',
      visual: { kind: 'bubbles', emoji: '🦇' },
      challenges: [
        {
          prompt: 'The moth is far: make the echo take over 100 ms.',
          target: { min: 100 },
          explain: 'Sound travels about 343 m/s; a moth 17+ m away takes 100+ ms to echo back.',
        },
        {
          prompt: 'Close in for the catch: echo under 2 ms.',
          target: { max: 2 },
          explain:
            'Up close, echoes return in a millisecond or two, so bats can call up to 200 times a second.',
        },
      ],
    }),
    goDeeper:
      'Echolocating bats emit calls (often 20–120 kHz) through their mouth or nose and analyze echo delay (distance), Doppler shift (relative speed), intensity and spectral changes (size, texture). The “feeding buzz” before capture can exceed 150–200 calls per second, supported by some of the fastest muscles known in mammals. Toothed whales (dolphins, sperm whales) echolocate with clicks produced in their nasal passages and focused by the melon. Some moths fight back by hearing bat calls, jamming them with clicks or having sound-absorbing scales.\n\nIn reality, it’s a bit more complicated: the slider uses the speed of sound in air; underwater, sound travels about 4.4 times faster, so dolphins’ echoes return sooner. Some blind people have learned to echolocate using tongue clicks.',
    quiz: [
      mc(
        'How does echolocation tell an animal how far away something is?',
        [
          'By the color of the echo',
          'By how long the echo takes to return',
          'By smell',
          'By the temperature',
        ],
        1,
        'Longer delay = farther away.',
      ),
      predict(
        'A bat is chasing a moth and getting very close.',
        'What happens to its calls?',
        [
          'They stop',
          'They get faster and faster (a feeding buzz)',
          'They get slower',
          'They turn into light',
        ],
        1,
        'Short echo delays let it call much faster.',
      ),
      label(
        'Match each animal to how it echolocates.',
        [
          ['Bat', 'High-pitched calls through mouth or nose'],
          ['Dolphin', 'Clicks focused by its forehead “melon”'],
          ['Tiger moth', 'Jams bat sonar with its own clicks'],
        ],
        'An evolutionary sound battle.',
      ),
    ],
    relatedConcepts: ['senses', 'convergent-evolution', 'coevolution'],
    funFact:
      'Some bats’ calls are as loud as a smoke alarm — over 120 decibels — but too high-pitched for us to hear.',
  },
  {
    id: 'magnetoreception',
    title: 'Magnetoreception',
    category: 'weird',
    tags: ['magnetic sense', 'migration', 'robins', 'sea turtles', 'cryptochrome'],
    aliases: ['magnetic sense', 'how birds navigate', 'animal compass'],
    difficulty: 4,
    rarity: 'obscure',
    summary: 'Many animals can sense Earth’s magnetic field — and robins may literally “see” it.',
    steps: steps(
      [
        'Built-in compass',
        'Birds, turtles, salmon and others use Earth’s magnetic field to navigate.',
      ],
      [
        'A light-powered sensor',
        'In robins, a protein in the eye called cryptochrome may react to the field.',
      ],
      [
        'Quantum effects',
        'Light creates pairs of reactive molecules whose behavior depends on magnetic direction.',
      ],
      ['Easily disrupted', 'Even weak radio noise can confuse the compass.'],
    ),
    interaction: cascade(
      'Follow the leading theory of how a robin senses magnetic north. Then add radio noise.',
      ['Blue light enters a robin’s eye', '🔵'],
      [
        [
          'Light hits cryptochrome',
          '👁️',
          'Blue light excites cryptochrome proteins in the retina.',
        ],
        [
          'Radical pair forms',
          '⚛️',
          'An electron jumps, creating a pair of reactive molecules with linked electron spins.',
        ],
        [
          'Magnetic field tilts the spins',
          '🧲',
          'Earth’s field nudges how the spins flip, depending on direction.',
          'Weak radio-frequency noise (like from electronics) scrambles the spins — robins in experiments lost their bearings.',
        ],
        [
          'Signal strength changes',
          '📶',
          'The amount of signaling product varies with the bird’s heading.',
        ],
        [
          'Brain reads the pattern',
          '🧠',
          'Brain areas process the signal, possibly as a pattern overlaid on vision.',
        ],
        ['Fly the right way', '🐦', 'The robin orients for its migration.'],
      ],
      'The robin heads south for winter, guided by a quantum compass in its eye.',
    ),
    goDeeper:
      'Two main mechanisms are proposed. The radical-pair mechanism, involving cryptochrome 4 in bird retinas, is light-dependent and works as an inclination compass (sensing the angle of field lines, not north vs south polarity). The magnetite hypothesis proposes iron oxide particles act like tiny compass needles, possibly in some fish and turtles. Sea turtles and salmon appear to imprint on the magnetic “signature” of their home coast. A 2014 study showed that weak broadband electromagnetic noise in a city disrupted European robins’ orientation.\n\nIn reality, it’s a bit more complicated: magnetoreception is still one of the least understood senses — no magnetoreceptor cell has been conclusively identified in any vertebrate, and the cascade here describes a leading hypothesis.',
    quiz: [
      mc(
        'Which protein is thought to help birds sense magnetism?',
        ['Hemoglobin', 'Cryptochrome', 'Insulin', 'Keratin'],
        1,
        'Cryptochrome in the eye may form magnetically sensitive radical pairs.',
      ),
      predict(
        'Robins are placed near weak radio-frequency electrical noise.',
        'What happens to their navigation?',
        ['It improves', 'They become disoriented', 'They fly faster', 'Nothing'],
        1,
        'Experiments showed noise disrupted their magnetic compass.',
      ),
      mc(
        'Which animals use magnetic fields to navigate?',
        [
          'Only humans',
          'Birds, sea turtles and salmon, among others',
          'No animals',
          'Only bacteria',
        ],
        1,
        'Many migrating animals sense magnetism.',
      ),
    ],
    relatedConcepts: ['senses', 'echolocation', 'circadian-rhythms'],
    funFact:
      'Some bacteria contain chains of magnetite crystals and line up with Earth’s magnetic field like tiny compass needles.',
  },
  {
    id: 'octopus-brains',
    title: 'The Octopus’s Distributed Brain',
    category: 'weird',
    tags: ['octopus', 'cephalopods', 'neurons', 'intelligence', 'arms'],
    aliases: ['octopus intelligence', 'octopus arms that think', 'cephalopod brains'],
    difficulty: 3,
    rarity: 'obscure',
    summary:
      'Most of an octopus’s neurons are in its arms — each arm can taste, feel and make decisions.',
    steps: steps(
      ['Lots of neurons', 'An octopus has about 500 million neurons — similar to a dog.'],
      ['Arms that think', 'About two-thirds of them are in its eight arms.'],
      ['Local control', 'Each arm can taste with its suckers and react on its own.'],
      ['Team leader', 'The central brain gives big-picture goals; the arms handle details.'],
    ),
    interaction: zoom({
      prompt: 'Zoom into an octopus to see where its “thinking” happens.',
      levels: [
        {
          id: 'octo',
          label: 'Octopus',
          scale: '60 cm',
          background: '#e0f2fe',
          description: 'Eight flexible arms, a central brain and three hearts.',
          elements: [em('o', '🐙', 50, 50, 6)],
          hotspots: [
            {
              id: 'brain',
              x: 50,
              y: 22,
              label: 'Central brain',
              text: 'A doughnut-shaped brain wrapped around the esophagus — only about a third of all neurons.',
            },
            {
              id: 'arm',
              x: 78,
              y: 75,
              label: 'An arm',
              text: 'Together, the eight arms hold roughly 350 million neurons — about twice as many as the central brain.',
              zoomTo: 'arm',
            },
          ],
        },
        {
          id: 'arm',
          label: 'Arm',
          scale: '10 cm',
          background: '#fdf4ff',
          description: 'A muscular arm lined with suckers and a thick nerve cord.',
          elements: [
            sh('arm', 'rod', '#f472b6', 50, 50, 7, { rotate: 0 }),
            ...[20, 35, 50, 65, 80].map((x, i) => sh(`s${i}`, 'circle', '#fbcfe8', x, 62, 0.5)),
          ],
          hotspots: [
            {
              id: 'cord',
              x: 50,
              y: 38,
              label: 'Nerve cord',
              text: 'A thick nerve cord runs down the arm, with clusters of neurons (ganglia) for each sucker.',
            },
            {
              id: 'sucker',
              x: 35,
              y: 78,
              label: 'Sucker',
              text: 'Each sucker has thousands of chemical and touch receptors — octopuses taste what they touch.',
              zoomTo: 'sucker',
            },
          ],
        },
        {
          id: 'sucker',
          label: 'Sucker',
          scale: '1 cm',
          background: '#fff7ed',
          description: 'Up close, a sucker is a muscular cup packed with sensors.',
          elements: [
            sh('cup', 'ring', '#fb923c', 50, 50, 5),
            ...[
              [40, 40],
              [60, 42],
              [45, 60],
              [58, 58],
            ].map(([x, y], i) => sh(`r${i}`, 'circle', '#a855f7', x, y, 0.35)),
          ],
          hotspots: [
            {
              id: 'taste',
              x: 60,
              y: 30,
              label: 'Taste receptors',
              text: 'Special “taste-by-touch” receptors help an arm decide whether to grab something — without asking the brain.',
            },
          ],
        },
      ],
    }),
    goDeeper:
      'The common octopus (Octopus vulgaris) has roughly 500 million neurons, with about 350 million in the arms’ nerve cords and ganglia. Severed arms can still reach and grasp in response to stimuli. In 2020, researchers identified chemotactile receptors in octopus suckers that respond to touch-detected chemicals. Octopuses solve puzzles, open jars, escape tanks and recognize individual humans. Cephalopod intelligence evolved independently from vertebrate intelligence — our last common ancestor was a simple worm-like animal over 500 million years ago.\n\nIn reality, it’s a bit more complicated: “each arm has its own brain” is a simplification — arms coordinate with the central brain and with each other through a ring of nerves. Octopuses also edit their RNA extensively, possibly helping their nervous systems adapt to temperature.',
    quiz: [
      mc(
        'Where are most of an octopus’s neurons?',
        ['In its central brain', 'In its arms', 'In its hearts', 'In its eyes'],
        1,
        'About two-thirds are in the arms.',
      ),
      mc(
        'How can an octopus taste?',
        ['Only with its mouth', 'With receptors in its suckers', 'It can’t taste', 'With its eyes'],
        1,
        'Octopuses taste by touch.',
      ),
      predict(
        'An octopus arm touches a crab hidden in a crevice the octopus can’t see.',
        'What can the arm do?',
        [
          'Nothing until the brain sees it',
          'Sense and grab the crab largely on its own',
          'Change into a fin',
          'Fall off',
        ],
        1,
        'Arms can sense and act locally.',
      ),
    ],
    relatedConcepts: ['action-potential', 'convergent-evolution', 'neuroplasticity'],
    funFact:
      'Octopuses have three hearts — and the main one stops beating while the octopus swims, which is why they prefer crawling.',
  },
  {
    id: 'naked-mole-rats',
    title: 'Naked Mole-Rats',
    category: 'weird',
    tags: ['longevity', 'cancer resistance', 'eusocial mammals', 'low oxygen', 'aging'],
    aliases: ['naked mole rat', 'animals that don’t age', 'cancer-resistant rodent'],
    difficulty: 3,
    rarity: 'obscure',
    summary:
      'A wrinkly underground rodent that lives 30+ years, rarely gets cancer, and lives in colonies with a queen.',
    steps: steps(
      ['Strange mammal', 'Naked mole-rats live in underground tunnels in East Africa.'],
      ['Long life', 'They can live over 30 years — about 10 times longer than a mouse.'],
      ['Cancer-resistant', 'Cancer is extremely rare in them.'],
      ['A colony with a queen', 'Like bees, only one female breeds; the rest are workers.'],
    ),
    interaction: sorting(
      'Is each trait true of naked mole-rats, or of a typical mouse?',
      [
        ['Naked mole-rat', '🐀', 'The weird one'],
        ['Typical mouse', '🐭', 'A normal small rodent'],
      ],
      [
        ['Lives 30+ years', '🎂', 0, 'Naked mole-rats can live over three decades.'],
        ['Rarely gets cancer', '🛡️', 0, 'Cancer is extremely rare in them.'],
        [
          'Survives 18 minutes without oxygen',
          '🫁',
          0,
          'They switch to using fructose for fuel when oxygen runs out.',
        ],
        [
          'Colony with one breeding queen',
          '👑',
          0,
          'They are one of the very few eusocial mammals.',
        ],
        [
          'Feels little pain from acid',
          '🧪',
          0,
          'Changes in their pain nerves make them insensitive to acid burns.',
        ],
        ['Lives about 2–3 years', '⏳', 1, 'Mice age fast.'],
        ['Often develops cancer with age', '📈', 1, 'Lab mice frequently develop tumors.'],
      ],
    ),
    goDeeper:
      'Naked mole-rats (Heterocephalus glaber) show negligible senescence: their mortality rate doesn’t rise with age the way it does in most mammals. Proposed anticancer mechanisms include very-high-molecular-mass hyaluronan (which triggers early contact inhibition of cell growth), efficient protein quality control and DNA repair. In low oxygen, they slow their metabolism and can use fructose for energy (shown in a 2017 study). They live in colonies of up to ~300 with a single breeding queen, a division of labor rarely seen in mammals.\n\nIn reality, it’s a bit more complicated: they are not completely cancer-proof — a few tumors have been found in captive animals — and their underground, low-oxygen lifestyle shapes many of their unusual traits.',
    quiz: [
      mc(
        'About how long can naked mole-rats live?',
        ['2 years', 'Over 30 years', '6 months', '100 years'],
        1,
        'Very long for a rodent their size.',
      ),
      mc(
        'What social system do naked mole-rats have?',
        [
          'Solitary',
          'A colony with one breeding queen, like bees',
          'Pairs only',
          'Herds led by males',
        ],
        1,
        'They are eusocial.',
      ),
      predict(
        'A naked mole-rat colony’s tunnel runs low on oxygen.',
        'What can they do?',
        [
          'Nothing — they die quickly',
          'Slow their metabolism and switch to fructose for fuel',
          'Start photosynthesizing',
          'Hold their breath forever',
        ],
        1,
        'This helps them survive minutes without oxygen.',
      ),
    ],
    relatedConcepts: ['telomeres', 'kin-selection', 'apoptosis'],
    funFact:
      'Naked mole-rats can run backward through their tunnels almost as fast as they run forward.',
  },
  {
    id: 'hydrothermal-vents',
    title: 'Hydrothermal Vent Chemosynthesis',
    category: 'weird',
    tags: ['deep sea', 'chemosynthesis', 'tube worms', 'black smokers', 'food chains'],
    aliases: ['deep-sea vents', 'chemosynthesis', 'black smokers', 'life without sunlight'],
    difficulty: 3,
    rarity: 'obscure',
    prerequisites: ['food-chains', 'photosynthesis'],
    summary: 'In the pitch-dark deep sea, whole ecosystems run on chemicals instead of sunlight.',
    steps: steps(
      ['No sunlight', 'Sunlight can’t reach the deep ocean floor.'],
      ['Chemical energy', 'Hot vents spew hydrogen sulfide and minerals.'],
      ['Chemosynthesis', 'Bacteria use energy from these chemicals to make food.'],
      ['A whole ecosystem', 'Tube worms, clams, crabs and fish all depend on those bacteria.'],
    ),
    interaction: assembly(
      'Build a food chain that runs on volcanic chemicals instead of sunlight.',
      [
        [
          'Vent chemicals (H₂S)',
          '🌋',
          'Hot water from the vent carries hydrogen sulfide and minerals.',
        ],
        [
          'Chemosynthetic bacteria',
          '🦠',
          'Bacteria oxidize the sulfide to get energy and turn CO₂ into food.',
        ],
        [
          'Giant tube worms',
          '🪱',
          'Tube worms have no mouth or gut — bacteria living inside them make their food.',
        ],
        ['Vent crabs', '🦀', 'Crabs graze on bacteria and nibble tube worms.'],
        ['Vent octopus', '🐙', 'A predator at the top of the vent food chain.'],
      ],
      'A food chain without sunlight! Discovered in 1977, it changed ideas about where life can exist.',
      {
        distractors: [
          ['Sunlight', '☀️', 'Sunlight doesn’t reach the vents, more than 2 km below the surface.'],
          ['Seaweed', '🌿', 'Seaweed needs sunlight — it can’t grow in the deep dark.'],
        ],
      },
    ),
    goDeeper:
      'Hydrothermal vents form where seawater seeps into the crust near mid-ocean ridges, is heated by magma, and returns rich in reduced chemicals (H₂S, H₂, CH₄, iron). Chemosynthetic bacteria and archaea oxidize these compounds and fix carbon (e.g., via the Calvin cycle). Giant tube worms (Riftia pachyptila) lack a digestive system; red plumes full of a special hemoglobin carry sulfide and oxygen to symbiotic bacteria in an organ called the trophosome. Vents were discovered at the Galápagos Rift in 1977 by the submersible Alvin.\n\nIn reality, it’s a bit more complicated: vent ecosystems aren’t fully independent of the Sun, because the oxygen many vent microbes use was made by photosynthesis. Vents are a leading candidate for where life on Earth began, and similar environments may exist on moons like Enceladus and Europa.',
    quiz: [
      mc(
        'What powers food chains at hydrothermal vents?',
        ['Sunlight', 'Chemical energy from compounds like hydrogen sulfide', 'Electricity', 'Wind'],
        1,
        'Bacteria use chemosynthesis.',
      ),
      mc(
        'How do giant tube worms get food without a mouth?',
        [
          'They absorb sunlight',
          'Bacteria living inside them make food from vent chemicals',
          'They eat rocks',
          'They don’t need food',
        ],
        1,
        'It’s a symbiosis with chemosynthetic bacteria.',
      ),
      predict(
        'A vent stops releasing hot chemical-rich water.',
        'What happens to the community around it?',
        [
          'It thrives',
          'It dies off or moves, since its energy source is gone',
          'It switches to photosynthesis',
          'Nothing',
        ],
        1,
        'Without chemicals, the bacteria can’t make food.',
      ),
    ],
    relatedConcepts: ['extremophiles', 'food-chains', 'symbiosis', 'photosynthesis'],
    funFact:
      'Giant tube worms can grow over 2 meters long — among the fastest-growing invertebrates.',
  },
  {
    id: 'extremophiles',
    title: 'Extremophiles',
    category: 'weird',
    tags: ['archaea', 'hot springs', 'acid', 'salt', 'astrobiology'],
    aliases: ['life in extreme places', 'thermophiles', 'halophiles', 'acidophiles'],
    difficulty: 2,
    rarity: 'obscure',
    summary:
      'Some microbes thrive in boiling water, acid, salt crusts or deep ice — places that would kill us.',
    steps: steps(
      ['Extreme lovers', 'Extremophiles don’t just survive harsh places — they need them.'],
      [
        'Many kinds',
        'There are heat lovers, acid lovers, salt lovers, cold lovers and pressure lovers.',
      ],
      ['Useful tools', 'Their heat-proof enzymes power technologies like PCR.'],
      ['Life elsewhere?', 'They show where life might exist on other planets and moons.'],
    ),
    interaction: sorting(
      'Match each extremophile to the extreme it loves.',
      [
        ['Heat (thermophile)', '🔥', 'Hot springs and vents'],
        ['Salt (halophile)', '🧂', 'Super-salty water'],
        ['Acid (acidophile)', '🍋', 'Very low pH'],
        ['Cold (psychrophile)', '🧊', 'Ice and polar seas'],
      ],
      [
        [
          'Thermus aquaticus (Yellowstone hot springs)',
          '♨️',
          0,
          'Its heat-stable enzyme Taq polymerase is used in PCR.',
        ],
        [
          'Strain 121 (deep-sea vent archaeon)',
          '🌋',
          0,
          'Grew at 121 °C — the temperature used to sterilize medical equipment.',
        ],
        ['Pink archaea in salt ponds', '🩷', 1, 'Halobacteria color salt ponds pink.'],
        ['Dead Sea microbes', '🌊', 1, 'Some archaea thrive in water saturated with salt.'],
        ['Acid mine drainage microbes', '⛏️', 2, 'Some live at pH near 0.'],
        [
          'Rio Tinto river microbes',
          '🔴',
          2,
          'Spain’s red, acidic river is full of acid-loving life.',
        ],
        ['Antarctic sea-ice algae', '🐧', 3, 'They grow in brine channels inside sea ice.'],
      ],
    ),
    goDeeper:
      'Many extremophiles are archaea, though bacteria and some eukaryotes qualify too. Adaptations include heat-stable proteins with extra salt bridges and tightly packed cores; membrane lipids with ether bonds (archaea); high internal potassium (halophiles); antifreeze proteins and flexible enzymes (psychrophiles); and pressure-tolerant membranes (piezophiles). Methanopyrus kandleri strain 116 has grown at 122 °C under high pressure. Extremophile enzymes (“extremozymes”) are used in PCR, laundry detergents and biofuel production.\n\nIn reality, it’s a bit more complicated: “extreme” is from a human point of view — for these organisms, our comfortable conditions would be deadly. Polyextremophiles like Deinococcus radiodurans tolerate several extremes, including radiation thousands of times stronger than what kills a human.',
    quiz: [
      mc(
        'What is an extremophile?',
        [
          'An animal that is very fast',
          'An organism that thrives in extreme conditions',
          'A type of virus',
          'A tall plant',
        ],
        1,
        'They thrive where most life can’t.',
      ),
      mc(
        'Why are thermophile enzymes useful in PCR?',
        [
          'They glow',
          'They don’t fall apart at high temperatures',
          'They are cheap sugar',
          'They copy proteins',
        ],
        1,
        'Taq polymerase survives the 95 °C steps.',
      ),
      predict(
        'Scientists find microbes living in salty, cold water under the ice of a moon like Europa might have.',
        'Why does studying Earth’s extremophiles help?',
        [
          'It doesn’t',
          'They show life can survive in such conditions, guiding the search',
          'They live on Europa',
          'They make the ice',
        ],
        1,
        'Extremophiles expand where we think life could exist.',
      ),
    ],
    relatedConcepts: ['hydrothermal-vents', 'tardigrades', 'pcr', 'enzymes'],
    funFact:
      'Deinococcus radiodurans, nicknamed “Conan the Bacterium,” survives radiation doses about 1,000 times higher than what would kill a person.',
  },
];
