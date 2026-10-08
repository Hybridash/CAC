import type { Concept } from '../../types';
import { assembly, em, label, mc, predict, slider, sorting, steps, timeline } from './helpers';

export const ecologyLibrary: Concept[] = [
  {
    id: 'energy-pyramids',
    title: 'Energy Pyramids',
    category: 'ecology',
    tags: ['trophic levels', '10% rule', 'energy flow', 'food chains', 'biomass'],
    aliases: ['10 percent rule', 'trophic pyramid', 'ecological pyramid'],
    difficulty: 2,
    rarity: 'common',
    prerequisites: ['food-chains'],
    summary:
      'Only about 10% of energy makes it up each step of a food chain — so the top is always small.',
    steps: steps(
      ['Energy in', 'Producers capture sunlight energy.'],
      ['Lost along the way', 'At each level, most energy is used for living or lost as heat.'],
      ['The 10% rule', 'Roughly 10% passes to the next level.'],
      ['Short chains', 'That’s why food chains rarely have more than 4–5 levels.'],
    ),
    interaction: slider({
      prompt:
        'Start with 10,000 units of plant energy. Change how many levels and how efficient each step is.',
      inputs: [
        { id: 'levels', label: 'Number of feeding levels', min: 1, max: 6, step: 1, start: 3 },
        { id: 'eff', label: 'Efficiency per step', unit: '%', min: 5, max: 20, step: 1, start: 10 },
      ],
      output: {
        label: 'Energy reaching the top level',
        unit: 'units',
        max: 10000,
        expr: '10000 * (eff / 100) ^ (levels - 1)',
      },
      graphInput: 'levels',
      visual: { kind: 'glow', emoji: '⚡' },
      challenges: [
        {
          prompt:
            'With the 10% rule, how little reaches a 5th-level predator? (Get under 2 units.)',
          target: { max: 2 },
          explain: '10,000 → 1,000 → 100 → 10 → 1. A top predator gets a tiny fraction.',
        },
        {
          prompt: 'Give a short chain plenty of energy at the top (over 500 units).',
          target: { min: 500 },
          explain:
            'Fewer steps mean less energy lost — eating lower on the food chain is more efficient.',
        },
      ],
    }),
    goDeeper:
      'Ecological efficiency (trophic transfer efficiency) is typically 5–20%, averaging about 10% (Lindeman’s 1942 work on Cedar Bog Lake). Energy is lost through respiration, movement, heat, and material that isn’t eaten or digested (which goes to decomposers). Energy pyramids are always upright; pyramids of numbers or biomass can sometimes be inverted (one tree supporting thousands of insects; ocean phytoplankton that reproduce fast but have little standing biomass).\n\nIn reality, it’s a bit more complicated: efficiencies differ between ecosystems and animals — warm-blooded animals use more energy keeping warm than cold-blooded ones, so they pass on less. This is one reason growing plants for people uses far less land than growing plants to feed livestock.',
    quiz: [
      mc(
        'About what fraction of energy passes from one level to the next?',
        ['90%', '50%', '10%', '0%'],
        2,
        'Roughly 10% on average.',
      ),
      predict(
        'A food chain has grass → mice → snakes → hawks.',
        'Which level has the least total energy?',
        ['Grass', 'Mice', 'Snakes', 'Hawks'],
        3,
        'Energy shrinks at every step.',
      ),
      mc(
        'Where does most of the “lost” energy go?',
        [
          'Back to the Sun',
          'Used for living and released as heat',
          'Into rocks',
          'Nowhere — it isn’t lost',
        ],
        1,
        'Respiration and heat account for most losses.',
      ),
    ],
    relatedConcepts: ['food-chains', 'biomagnification', 'photosynthesis'],
    funFact:
      'Great white sharks and orcas sit at the top of ocean energy pyramids — so they are naturally rare.',
  },
  {
    id: 'carbon-cycle',
    title: 'The Carbon Cycle',
    category: 'ecology',
    tags: ['carbon dioxide', 'photosynthesis', 'respiration', 'fossil fuels', 'climate'],
    aliases: ['carbon cycle', 'CO2 cycle', 'how carbon moves'],
    difficulty: 2,
    rarity: 'common',
    prerequisites: ['photosynthesis'],
    summary: 'Carbon atoms travel endlessly between air, plants, animals, oceans and rocks.',
    steps: steps(
      ['Into plants', 'Photosynthesis pulls CO₂ from the air into sugar.'],
      ['Up the food chain', 'Animals eat plants and take in their carbon.'],
      ['Back to the air', 'Respiration and decomposition release CO₂ again.'],
      [
        'Long-term storage',
        'Some carbon is buried for millions of years as coal, oil and gas — and burning them releases it fast.',
      ],
    ),
    interaction: assembly(
      'Follow one carbon atom around the cycle.',
      [
        ['CO₂ in the air', '💨', 'Our carbon atom floats in the atmosphere as carbon dioxide.'],
        ['Photosynthesis', '🌿', 'A leaf takes in CO₂ and builds it into sugar.'],
        [
          'Eaten by an animal',
          '🐇',
          'A rabbit eats the leaf; the carbon becomes part of the rabbit.',
        ],
        ['Respiration', '🫁', 'The rabbit breaks down sugar for energy and breathes out CO₂.'],
      ],
      'Back in the air! Carbon cycles over and over — some atoms in you were once in dinosaurs.',
      {
        layout: 'cycle',
        distractors: [
          [
            'Turns into nitrogen',
            '🧪',
            'Carbon stays carbon — atoms don’t change into other elements in living things.',
          ],
        ],
      },
    ),
    goDeeper:
      'Major carbon reservoirs: atmosphere (~870 billion tonnes of carbon), land plants and soils, oceans (by far the largest active store, mostly as dissolved inorganic carbon), and rocks and fossil fuels. Fluxes include photosynthesis, respiration, decomposition, ocean–atmosphere exchange, and very slow geological processes (weathering, volcanoes). Burning fossil fuels and deforestation add CO₂ faster than natural sinks absorb it; atmospheric CO₂ has risen from about 280 ppm before industrialization to over 420 ppm, warming the climate and acidifying the oceans.\n\nIn reality, it’s a bit more complicated: the lesson shows the fast biological loop. Oceans absorb about a quarter of human CO₂ emissions, which lowers seawater pH and makes it harder for corals and shellfish to build skeletons.',
    quiz: [
      mc(
        'Which process removes CO₂ from the air?',
        ['Respiration', 'Photosynthesis', 'Burning fuel', 'Decomposition'],
        1,
        'Plants and algae pull CO₂ in to make sugar.',
      ),
      predict(
        'Large areas of forest are cut down and burned.',
        'What happens to CO₂ in the air?',
        ['It decreases', 'It increases', 'It stays the same', 'It turns into oxygen'],
        1,
        'Burning releases carbon, and fewer trees absorb it.',
      ),
      label(
        'Match each process to its effect on air CO₂.',
        [
          ['Photosynthesis', 'Takes CO₂ out of the air'],
          ['Respiration', 'Puts CO₂ back into the air'],
          ['Burning fossil fuels', 'Releases ancient stored carbon'],
        ],
        'Some processes remove carbon, others release it.',
      ),
    ],
    relatedConcepts: ['photosynthesis', 'nitrogen-cycle', 'mitochondria'],
    funFact:
      'About 18% of your body’s mass is carbon — atoms that have cycled through countless living things.',
  },
  {
    id: 'nitrogen-cycle',
    title: 'The Nitrogen Cycle',
    category: 'ecology',
    tags: ['nitrogen fixation', 'nitrates', 'bacteria', 'decomposition', 'fertilizer'],
    aliases: ['nitrogen cycle', 'nitrification', 'denitrification'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['nitrogen-fixation'],
    summary:
      'Bacteria do most of the work moving nitrogen from the air into living things and back.',
    steps: steps(
      ['Locked in the air', 'Air is mostly nitrogen gas, which most life can’t use.'],
      ['Fixing it', 'Bacteria (and lightning) turn N₂ into ammonia.'],
      ['Converting it', 'Other bacteria turn ammonia into nitrates that plants can absorb.'],
      [
        'Returning it',
        'Decomposers recycle nitrogen, and some bacteria release it back as N₂ gas.',
      ],
    ),
    interaction: assembly(
      'Move a nitrogen atom through the cycle.',
      [
        ['N₂ gas in the air', '💨', 'Nitrogen gas makes up 78% of the air.'],
        [
          'Nitrogen fixation',
          '🦠',
          'Bacteria in soil or root nodules convert N₂ into ammonia (NH₃/NH₄⁺).',
        ],
        [
          'Nitrification',
          '🔄',
          'Soil bacteria convert ammonium into nitrites, then nitrates (NO₃⁻).',
        ],
        ['Absorbed by plants', '🌱', 'Plant roots take up nitrates to build proteins and DNA.'],
        [
          'Eaten & decomposed',
          '🍄',
          'Animals eat plants; wastes and dead bodies are broken down back into ammonium.',
        ],
        ['Denitrification', '🫧', 'Bacteria in waterlogged soil turn nitrates back into N₂ gas.'],
      ],
      'Full circle! Nearly every step depends on bacteria.',
      {
        layout: 'cycle',
        distractors: [['Photosynthesis', '☀️', 'Photosynthesis captures carbon, not nitrogen.']],
      },
    ),
    goDeeper:
      'Key steps: nitrogen fixation (nitrogenase in Rhizobium, cyanobacteria, Azotobacter; also lightning and the industrial Haber–Bosch process), ammonification (decomposers convert organic nitrogen to NH₄⁺), nitrification (Nitrosomonas: NH₄⁺ → NO₂⁻; Nitrobacter: NO₂⁻ → NO₃⁻), assimilation by plants, and denitrification (anaerobic bacteria: NO₃⁻ → N₂). Anammox bacteria also convert ammonium and nitrite directly to N₂.\n\nIn reality, it’s a bit more complicated: humans now fix more nitrogen than all natural land processes combined, mostly as fertilizer. Runoff of excess nitrates causes algal blooms and “dead zones” with low oxygen, such as in the Gulf of Mexico.',
    quiz: [
      mc(
        'Why can’t most organisms use nitrogen gas directly?',
        [
          'It is too rare',
          'The N₂ triple bond is very hard to break',
          'It is poisonous',
          'It is a liquid',
        ],
        1,
        'Only certain bacteria (and lightning, and factories) can break it.',
      ),
      mc(
        'What do denitrifying bacteria do?',
        ['Turn nitrates back into N₂ gas', 'Make sugar', 'Fix nitrogen into plants', 'Eat plants'],
        0,
        'They return nitrogen to the atmosphere.',
      ),
      predict(
        'Farm fertilizer full of nitrates washes into a lake.',
        'What often happens?',
        [
          'The lake gets clearer',
          'Algae bloom, then decay and use up oxygen, killing fish',
          'Nothing',
          'The lake freezes',
        ],
        1,
        'Excess nutrients fuel algal blooms and dead zones.',
      ),
    ],
    relatedConcepts: ['nitrogen-fixation', 'carbon-cycle', 'biomagnification'],
    funFact:
      'Lightning fixes nitrogen too — each bolt can turn some atmospheric nitrogen into nitrates that fall with rain.',
  },
  {
    id: 'symbiosis',
    title: 'Symbiosis',
    category: 'ecology',
    tags: ['mutualism', 'commensalism', 'parasitism', 'relationships', 'species interactions'],
    aliases: ['mutualism', 'commensalism', 'parasitism', 'species relationships'],
    difficulty: 2,
    rarity: 'common',
    summary:
      'Species living closely together can help each other, ignore each other, or exploit each other.',
    steps: steps(
      ['Mutualism', 'Both partners win (+/+).'],
      ['Commensalism', 'One wins; the other isn’t affected (+/0).'],
      ['Parasitism', 'One wins at the other’s expense (+/−).'],
    ),
    interaction: sorting(
      'Sort each partnership into the right kind of symbiosis.',
      [
        ['Mutualism (+/+)', '🤝', 'Both benefit'],
        ['Commensalism (+/0)', '🙂', 'One benefits, the other is unaffected'],
        ['Parasitism (+/−)', '🧛', 'One benefits, the other is harmed'],
      ],
      [
        [
          'Clownfish & sea anemone',
          '🐠',
          0,
          'The anemone protects the clownfish; the clownfish cleans and defends the anemone.',
        ],
        ['Bees & flowers', '🐝', 0, 'Bees get nectar; flowers get pollinated.'],
        [
          'Cows & gut microbes',
          '🐄',
          0,
          'Microbes digest grass for the cow and get a warm home with food.',
        ],
        [
          'Barnacles on a whale',
          '🐋',
          1,
          'Barnacles get a free ride; the whale is mostly unaffected.',
        ],
        [
          'Remora fish on a shark',
          '🦈',
          1,
          'Remoras hitchhike and eat scraps; sharks aren’t much bothered.',
        ],
        ['Tick on a dog', '🐕', 2, 'The tick drinks blood and can spread disease.'],
        ['Tapeworm in a human', '🪱', 2, 'The tapeworm steals nutrients from its host.'],
      ],
    ),
    goDeeper:
      'Symbiosis (“living together”) covers long-term close interactions. Mutualisms can be obligate (lichens: fungus plus alga or cyanobacterium; corals and their zooxanthellae; mitochondria themselves originated as mutualists) or facultative. Commensalism is hard to prove because subtle effects are common. Parasitism is extremely widespread.\n\nIn reality, it’s a bit more complicated: relationships can shift along a spectrum depending on conditions. Corals expel their algae when water gets too warm (coral bleaching), and some mycorrhizal fungi can act like parasites when soil is very fertile.',
    quiz: [
      mc(
        'Which is an example of mutualism?',
        ['Tick on a dog', 'Bees and flowers', 'Barnacle on a whale', 'Tapeworm in a person'],
        1,
        'Both bees and flowers benefit.',
      ),
      mc(
        'In commensalism…',
        [
          'Both partners are harmed',
          'One benefits and the other is unaffected',
          'Both benefit',
          'One is eaten',
        ],
        1,
        '+/0.',
      ),
      predict(
        'Ocean water warms and corals expel their algae partners.',
        'What happens to the corals?',
        [
          'They grow faster',
          'They bleach and may starve, since the algae fed them',
          'Nothing',
          'They turn into algae',
        ],
        1,
        'Corals depend on their algal mutualists for food.',
      ),
    ],
    relatedConcepts: ['parasites', 'gut-microbiome', 'mycorrhizal-networks', 'nitrogen-fixation'],
    funFact:
      'Lichens are partnerships so tight that scientists once thought they were single organisms.',
  },
  {
    id: 'keystone-species',
    title: 'Keystone Species',
    category: 'ecology',
    tags: ['sea otters', 'kelp forests', 'sea urchins', 'food webs', 'conservation'],
    aliases: ['keystone species', 'sea otters and kelp', 'ecosystem engineers'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['food-chains'],
    summary: 'Some species hold a whole ecosystem together — remove them and it collapses.',
    steps: steps(
      [
        'An arch’s keystone',
        'In an arch, the keystone holds everything up. Some species work the same way.',
      ],
      ['Sea otters', 'Sea otters eat sea urchins.'],
      ['Urchins eat kelp', 'Without otters, urchins multiply and mow down kelp forests.'],
      ['Big effects', 'A keystone species has an effect far bigger than its numbers.'],
    ),
    interaction: {
      template: 'ecosystem',
      config: {
        prompt:
          'Watch a kelp forest with sea otters. Then remove the otters and see what happens to the kelp.',
        species: [
          {
            id: 'kelp',
            label: 'Kelp',
            emoji: '🌿',
            color: '#16a34a',
            start: 80,
            growth: 0.6,
            capacity: 120,
          },
          {
            id: 'urchin',
            label: 'Sea urchins',
            emoji: '🟣',
            color: '#7c3aed',
            start: 30,
            death: 0.1,
            eats: [{ id: 'kelp', rate: 0.012, efficiency: 0.5 }],
          },
          {
            id: 'otter',
            label: 'Sea otters',
            emoji: '🦦',
            color: '#a16207',
            start: 6,
            death: 0.15,
            eats: [{ id: 'urchin', rate: 0.05, efficiency: 0.15 }],
          },
        ],
        toggleable: ['otter'],
        speed: 20,
        goal: { steps: 250, mustToggle: 'otter' },
        insight:
          'Without otters, urchins explode and kelp collapses into “urchin barrens.” A few otters protect the whole forest.',
      },
    },
    goDeeper:
      'Robert Paine coined “keystone species” in 1969 after removing Pisaster sea stars from tide pools: mussels took over and diversity plummeted. Sea otters along the North Pacific were hunted nearly to extinction for fur; where they vanished, urchins created barrens, and where they returned, kelp forests recovered — supporting fish, seals and carbon storage. Other keystones include beavers (ecosystem engineers), elephants and fig trees.\n\nIn reality, it’s a bit more complicated: the simulation shows a simple three-species chain; real kelp forests also depend on water temperature, storms and other urchin predators like sunflower sea stars, which were devastated by a wasting disease after 2013.',
    quiz: [
      mc(
        'What makes a species a “keystone”?',
        [
          'It is the most common',
          'Its effect on the ecosystem is much larger than its numbers suggest',
          'It is the biggest animal',
          'It eats only plants',
        ],
        1,
        'Removing it changes the whole system.',
      ),
      predict(
        'Sea otters return to a coast covered in urchin barrens.',
        'What happens over time?',
        [
          'Urchins increase',
          'Urchin numbers fall and kelp forests regrow',
          'Nothing',
          'Otters eat the kelp',
        ],
        1,
        'Otters control urchins, letting kelp recover.',
      ),
      mc(
        'What did Robert Paine remove in his famous experiment?',
        ['Sea stars', 'Whales', 'Trees', 'Bees'],
        0,
        'Removing Pisaster sea stars caused mussels to take over.',
      ),
    ],
    relatedConcepts: ['trophic-cascades', 'food-chains', 'predator-prey'],
    funFact:
      'Sea otters have the densest fur of any animal — up to about a million hairs per square inch.',
  },
  {
    id: 'succession',
    title: 'Ecological Succession',
    category: 'ecology',
    tags: ['pioneer species', 'lichens', 'forests', 'ecosystem change', 'recovery'],
    aliases: ['primary succession', 'secondary succession', 'pioneer species'],
    difficulty: 2,
    rarity: 'common',
    summary: 'Bare rock can become a forest, one community paving the way for the next.',
    steps: steps(
      ['Bare ground', 'After a volcano or glacier, there is only bare rock — no soil.'],
      ['Pioneers', 'Lichens and mosses settle first and slowly make soil.'],
      ['Taking turns', 'Grasses, then shrubs, then trees move in as the soil deepens.'],
      ['Climax', 'Eventually a stable, mature community forms — until the next disturbance.'],
    ),
    interaction: timeline(
      'Watch bare volcanic rock turn into a forest over hundreds of years.',
      [
        [
          'Bare rock',
          'Fresh lava rock: no soil, no life.',
          [em('rock', '🪨', 50, 65, 3)],
          'Year 0',
        ],
        [
          'Pioneers',
          'Lichens and mosses grip the rock and start breaking it into soil.',
          [
            em('rock', '🪨', 50, 65, 3),
            em('lichen', '🟢', 35, 55, 0.8),
            em('moss', '🌿', 62, 58, 0.8),
          ],
          '5 years',
        ],
        [
          'Grasses & flowers',
          'A thin soil lets grasses and wildflowers grow.',
          [
            em('rock', '🪨', 50, 75, 2, { opacity: 0.6 }),
            em('grass', '🌾', 30, 55, 1.2),
            em('flower', '🌼', 55, 55, 1),
            em('moss', '🌿', 70, 60, 0.8),
          ],
          '30 years',
        ],
        [
          'Shrubs',
          'Deeper soil supports shrubs and small trees.',
          [
            em('grass', '🌾', 25, 60, 1),
            em('shrub', '🌳', 50, 50, 1.6),
            em('flower', '🌼', 72, 62, 0.8),
          ],
          '100 years',
        ],
        [
          'Forest',
          'A mature forest — a climax community full of animals.',
          [
            em('tree1', '🌲', 30, 45, 2.2),
            em('tree2', '🌳', 55, 42, 2.4),
            em('tree3', '🌲', 78, 48, 2),
            em('deer', '🦌', 50, 75, 1),
          ],
          '200+ years',
        ],
      ],
      [
        ['Stop when the first pioneer species arrive.', 1],
        ['Stop at the mature forest.', 4],
      ],
      '#f0fdf4',
    ),
    goDeeper:
      'Primary succession starts on surfaces with no soil (lava, glacial till, new sand dunes); secondary succession follows disturbances that leave soil behind (fires, abandoned farms, floods) and is much faster. Pioneer species are hardy, fast-colonizing and often modify conditions (facilitation), for example by adding organic matter or fixing nitrogen. Studies after the 1980 Mount St. Helens eruption and on Surtsey, a volcanic island born in 1963, track succession in real time.\n\nIn reality, it’s a bit more complicated: the idea of a single fixed “climax” community is now seen as too simple — disturbances like fires and storms are normal, and many ecosystems are mosaics of different stages.',
    quiz: [
      mc(
        'What are often the first organisms on bare rock?',
        ['Oak trees', 'Lichens and mosses', 'Deer', 'Sunflowers'],
        1,
        'Lichens are classic pioneer species.',
      ),
      mc(
        'Why is secondary succession faster than primary succession?',
        [
          'There are more volcanoes',
          'Soil is already present',
          'It rains more',
          'Animals help less',
        ],
        1,
        'Soil and seeds often remain after the disturbance.',
      ),
      predict(
        'A farm field is abandoned and left alone for 100 years.',
        'What is it likely to become?',
        ['Bare rock', 'Grassland, then shrubs, then young forest', 'A desert', 'An ocean'],
        1,
        'Secondary succession reclaims the field.',
      ),
    ],
    relatedConcepts: ['invasive-species', 'keystone-species', 'symbiosis'],
    funFact:
      'Surtsey, an island that rose from the sea near Iceland in 1963, has been protected so scientists can watch life arrive naturally.',
  },
  {
    id: 'invasive-species',
    title: 'Invasive Species',
    category: 'ecology',
    tags: ['introduced species', 'competition', 'biodiversity', 'cane toads', 'native species'],
    aliases: ['non-native species', 'alien species', 'introduced species'],
    difficulty: 2,
    rarity: 'common',
    prerequisites: ['food-chains'],
    summary:
      'A species moved to a new place, with no natural enemies, can push native species out.',
    steps: steps(
      ['A long trip', 'People move species around — on purpose or by accident.'],
      [
        'No enemies',
        'In a new place, a species may have no predators or diseases to keep it in check.',
      ],
      ['Out-competing', 'It can eat the natives’ food faster and multiply quickly.'],
      ['Hard to undo', 'Once established, invasives are very hard to remove.'],
    ),
    interaction: {
      template: 'ecosystem',
      config: {
        prompt:
          'A meadow has native plants and native beetles. Release an invasive beetle and watch what happens.',
        species: [
          {
            id: 'plants',
            label: 'Native plants',
            emoji: '🌱',
            color: '#16a34a',
            start: 100,
            growth: 0.5,
            capacity: 150,
          },
          {
            id: 'native',
            label: 'Native beetles',
            emoji: '🐞',
            color: '#dc2626',
            start: 30,
            death: 0.15,
            eats: [{ id: 'plants', rate: 0.006, efficiency: 0.5 }],
          },
          {
            id: 'invader',
            label: 'Invasive beetles',
            emoji: '🪲',
            color: '#1e293b',
            start: 6,
            death: 0.06,
            eats: [{ id: 'plants', rate: 0.01, efficiency: 0.5 }],
            initiallyAbsent: true,
          },
        ],
        toggleable: ['invader'],
        speed: 20,
        goal: { steps: 300, mustToggle: 'invader' },
        insight:
          'The invader eats faster and dies less, so it grazes the plants down to a level the native beetles can’t survive on.',
      },
    },
    goDeeper:
      'Invasive species are non-native species that spread and cause ecological or economic harm. Traits that help: fast reproduction, broad diets, and escape from natural enemies in the new range (the enemy release hypothesis). Examples: cane toads in Australia, brown tree snakes on Guam (which wiped out most native forest birds), zebra mussels in the Great Lakes, kudzu in the southeastern US and rats on islands. Invasive species are a leading driver of extinctions, especially on islands.\n\nIn reality, it’s a bit more complicated: most introduced species never become invasive, and the simulation shows only competition for food. Prevention (checking cargo, cleaning boats and boots) is far cheaper than eradication.',
    quiz: [
      mc(
        'Why do invasive species often spread so fast?',
        [
          'They are bigger',
          'They often have no natural predators or diseases in the new place',
          'They are always poisonous',
          'They live longer',
        ],
        1,
        'Escape from natural enemies helps them multiply.',
      ),
      predict(
        'An invasive snake arrives on an island where birds evolved without snake predators.',
        'What is likely?',
        [
          'The birds easily escape',
          'Many bird species decline or go extinct',
          'The snake starves',
          'Nothing',
        ],
        1,
        'This happened on Guam with the brown tree snake.',
      ),
      mc(
        'What is the cheapest way to fight invasive species?',
        [
          'Removing them after they spread',
          'Preventing them from arriving in the first place',
          'Ignoring them',
          'Adding more invasive species',
        ],
        1,
        'Prevention is far easier than eradication.',
      ),
    ],
    relatedConcepts: ['island-rule', 'keystone-species', 'food-chains'],
    funFact:
      '102 cane toads were released in Australia in 1935 to eat beetles; there are now estimated to be over 200 million.',
  },
  {
    id: 'biomagnification',
    title: 'Biomagnification',
    category: 'ecology',
    tags: ['pollution', 'DDT', 'mercury', 'food chains', 'toxins'],
    aliases: ['bioaccumulation', 'biomagnification of toxins', 'DDT and eagles', 'mercury in fish'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['food-chains', 'energy-pyramids'],
    summary:
      'Some poisons get more concentrated at each step up the food chain, hitting top predators hardest.',
    steps: steps(
      [
        'Sticky poisons',
        'Some chemicals (like mercury and DDT) are stored in fat instead of being excreted.',
      ],
      ['Building up', 'Each animal stores what it eats over its lifetime.'],
      ['Multiplying', 'Predators eat many prey, so the poison concentrates at every level.'],
      ['Top predators suffer', 'Eagles, tuna and orcas can carry the highest levels.'],
    ),
    interaction: slider({
      prompt:
        'A lake has a trace of mercury in the water. Move up the food chain and watch it concentrate.',
      inputs: [
        { id: 'level', label: 'Food chain level (1 = algae)', min: 1, max: 5, step: 1, start: 1 },
        {
          id: 'water',
          label: 'Mercury in the water',
          unit: 'ppt',
          min: 1,
          max: 10,
          step: 1,
          start: 2,
        },
      ],
      output: {
        label: 'Mercury in the organism',
        unit: 'ppb',
        max: 10000,
        expr: 'min(10000, water * 10 ^ (level - 1) / 10)',
      },
      readouts: [
        { label: 'Times more concentrated than the water', expr: '10 ^ (level - 1) * 100' },
      ],
      graphInput: 'level',
      visual: { kind: 'glow', emoji: '🐟' },
      challenges: [
        {
          prompt: 'Find a top predator with a dangerous level (over 1,000 ppb).',
          target: { min: 1000 },
          explain:
            'At the top of the food chain, the poison can be millions of times more concentrated than in the water.',
        },
        {
          prompt: 'Keep it low: an organism under 2 ppb.',
          target: { max: 2 },
          explain: 'Organisms at the bottom of the chain carry the least.',
        },
      ],
    }),
    goDeeper:
      'Bioaccumulation is the buildup of a substance in one organism over time; biomagnification is the increase in concentration from one trophic level to the next. It affects persistent, fat-soluble compounds such as methylmercury, DDT, PCBs and PFAS. DDT caused eggshell thinning in bald eagles, peregrine falcons and brown pelicans; after the US banned DDT in 1972 (inspired partly by Rachel Carson’s Silent Spring, 1962), their populations recovered. Health agencies advise limiting large predatory fish (swordfish, shark, king mackerel) for pregnant people and young children because of mercury.\n\nIn reality, it’s a bit more complicated: the tenfold jump per level in the slider is a simplification — real factors vary by chemical and food web — and units here are illustrative. The exact amounts depend on the animal’s age, fat content and diet.',
    quiz: [
      mc(
        'Which animals usually have the highest levels of biomagnified toxins?',
        ['Algae', 'Small fish', 'Top predators', 'Plants'],
        2,
        'Top predators eat many prey that each carry the toxin.',
      ),
      mc(
        'Why do these toxins build up instead of leaving the body?',
        [
          'They are heavy',
          'They are stored in fat and not easily excreted',
          'They are alive',
          'They are made by the animal',
        ],
        1,
        'Fat-soluble, persistent chemicals accumulate.',
      ),
      predict(
        'DDT is sprayed near a lake with fish and fish-eating eagles.',
        'What happens to the eagles?',
        [
          'Nothing',
          'They build up high DDT levels, causing thin eggshells and fewer chicks',
          'They become immune',
          'They eat less fish',
        ],
        1,
        'This nearly wiped out bald eagles in the US.',
      ),
    ],
    relatedConcepts: ['food-chains', 'energy-pyramids', 'nitrogen-cycle'],
    funFact:
      'Bald eagles were down to about 400 nesting pairs in the lower 48 US states in 1963; after DDT was banned, they recovered to over 70,000 pairs.',
  },
  {
    id: 'trophic-cascades',
    title: 'Trophic Cascades: Wolves of Yellowstone',
    category: 'ecology',
    tags: ['wolves', 'Yellowstone', 'elk', 'top predators', 'rewilding'],
    aliases: ['wolves in Yellowstone', 'trophic cascade', 'top-down control', 'rewilding'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['food-chains', 'keystone-species'],
    summary: 'Bringing wolves back to Yellowstone changed elk, trees, beavers — even riverbanks.',
    steps: steps(
      ['Wolves gone', 'By the 1920s, wolves had been wiped out of Yellowstone.'],
      [
        'Elk everywhere',
        'Without predators, elk grew numerous and browsed young willows and aspens heavily.',
      ],
      ['Wolves return', 'In 1995–96, 31 wolves were brought back from Canada.'],
      ['A cascade', 'Fewer, warier elk let some willows recover, helping beavers and songbirds.'],
    ),
    interaction: {
      template: 'ecosystem',
      config: {
        prompt:
          'Yellowstone without wolves: lots of elk, few willows. Reintroduce the wolves and watch the cascade.',
        species: [
          {
            id: 'willow',
            label: 'Willows',
            emoji: '🌳',
            color: '#16a34a',
            start: 60,
            growth: 0.5,
            capacity: 120,
          },
          {
            id: 'elk',
            label: 'Elk',
            emoji: '🦌',
            color: '#a16207',
            start: 40,
            death: 0.08,
            eats: [{ id: 'willow', rate: 0.01, efficiency: 0.4 }],
          },
          {
            id: 'wolf',
            label: 'Wolves',
            emoji: '🐺',
            color: '#475569',
            start: 5,
            death: 0.12,
            eats: [{ id: 'elk', rate: 0.04, efficiency: 0.2 }],
            initiallyAbsent: true,
          },
        ],
        toggleable: ['wolf'],
        speed: 20,
        goal: { steps: 300, mustToggle: 'wolf' },
        insight:
          'Wolves control elk, and with less browsing, willows bounce back — an effect that cascades down the food chain.',
      },
    },
    goDeeper:
      'A trophic cascade occurs when predators indirectly benefit organisms two or more levels below them by controlling herbivores. After wolf reintroduction (1995–1996), elk numbers fell (also due to hunting, drought and other predators like bears and cougars), and willow and aspen growth increased in some areas. More willows supported beaver colonies, whose dams changed stream habitats. Behavior may also matter: elk avoiding risky spots (the “landscape of fear”), though how strong this effect is remains debated.\n\nIn reality, it’s a bit more complicated: the popular story (“wolves changed the rivers”) is partly overstated. Recovery is patchy, elk declines had several causes, and some streams changed little because years without beavers had already altered them. It’s still a powerful example of top predators shaping ecosystems.',
    quiz: [
      mc(
        'What is a trophic cascade?',
        [
          'A waterfall in a forest',
          'Effects of a predator rippling down through lower food chain levels',
          'Animals migrating',
          'Plants growing toward light',
        ],
        1,
        'Predator → herbivore → plants.',
      ),
      predict(
        'Wolves are removed from an ecosystem with elk and willows.',
        'What happens to the willows?',
        [
          'They thrive',
          'They decline as elk numbers rise and browse heavily',
          'Nothing',
          'They turn into grass',
        ],
        1,
        'More elk means more browsing pressure.',
      ),
      mc(
        'How did more willows help beavers in Yellowstone?',
        [
          'Beavers eat elk',
          'Beavers need willows for food and dam building',
          'Willows scare wolves',
          'They didn’t',
        ],
        1,
        'Willows are key beaver food and building material.',
      ),
    ],
    relatedConcepts: ['keystone-species', 'predator-prey', 'food-chains'],
    funFact:
      'Yellowstone went about 70 years without wolves before they were reintroduced in 1995.',
  },
];
