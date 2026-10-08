import type { Concept } from '../../types';
import {
  assembly,
  cascade,
  em,
  mc,
  predict,
  sh,
  slider,
  sorting,
  steps,
  timeline,
} from './helpers';

export const microbesLibrary: Concept[] = [
  {
    id: 'viral-replication',
    title: 'How Viruses Copy Themselves',
    category: 'microbes',
    tags: ['viruses', 'host cell', 'infection', 'replication cycle', 'flu'],
    aliases: ['viral life cycle', 'virus replication', 'how viruses infect cells'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['bacteria-vs-viruses'],
    summary: 'A virus is a hijacker: it breaks into a cell and turns it into a virus factory.',
    steps: steps(
      ['Find the right lock', 'A virus’s surface proteins must fit receptors on a host cell.'],
      ['Break in', 'The virus enters and releases its genes.'],
      ['Hijack', 'The cell’s own machinery copies viral genes and builds viral proteins.'],
      ['Burst out', 'New viruses assemble and leave to infect more cells.'],
    ),
    interaction: assembly(
      'Put the viral infection cycle in order. Then it starts again in the next cell!',
      [
        ['Attach', '🧲', 'Spike proteins bind a receptor on the cell surface.'],
        ['Enter', '🚪', 'The virus is taken in or fuses with the membrane.'],
        ['Release genes', '📜', 'The viral genome (DNA or RNA) is released inside.'],
        ['Copy & build', '🏭', 'The cell’s ribosomes and enzymes make viral genomes and proteins.'],
        ['Assemble', '🧩', 'New virus particles are put together.'],
        ['Exit', '💥', 'Viruses bud off or burst out, ready to infect new cells.'],
      ],
      'One infected cell can release hundreds to thousands of new viruses.',
      {
        layout: 'cycle',
        distractors: [
          [
            'Divide in two',
            '✂️',
            'Viruses never divide like bacteria — they are assembled from parts.',
          ],
        ],
      },
    ),
    goDeeper:
      'Viral replication cycles vary by virus type. Influenza binds sialic acid receptors, enters by endocytosis, and replicates its RNA in the nucleus; new virions bud from the membrane and use neuraminidase to escape (the target of oseltamivir/Tamiflu). Retroviruses like HIV reverse-transcribe RNA into DNA and integrate into the host genome. Coronaviruses use spike proteins to bind receptors such as ACE2.\n\nIn reality, it’s a bit more complicated: some viruses stay hidden for years (latency), like herpesviruses that cause cold sores. Antiviral drugs target specific steps — blocking entry, copying or exit — and because viruses mutate, combinations are sometimes needed.',
    quiz: [
      mc(
        'Why can’t a virus copy itself outside a cell?',
        [
          'It’s too cold',
          'It lacks its own machinery to make proteins and copy genes',
          'It needs sunlight',
          'It is too big',
        ],
        1,
        'Viruses depend on host cell machinery.',
      ),
      mc(
        'What decides which cells a virus can infect?',
        [
          'The color of the cell',
          'Whether its surface proteins fit the cell’s receptors',
          'The size of the person',
          'Random chance',
        ],
        1,
        'Like a key and lock, the virus must fit a receptor.',
      ),
      predict(
        'A drug blocks viruses from leaving infected cells.',
        'What happens to the infection?',
        [
          'It spreads faster',
          'It is slowed because new viruses can’t reach new cells',
          'The virus becomes a bacterium',
          'Nothing',
        ],
        1,
        'Blocking exit limits spread (this is how some flu drugs work).',
      ),
    ],
    relatedConcepts: ['bacteria-vs-viruses', 'bacteriophages', 'vaccines', 'pandemics-r0'],
    funFact: 'A single cell infected with influenza can release thousands of new viruses.',
  },
  {
    id: 'bacteriophages',
    title: 'Bacteriophages',
    category: 'microbes',
    tags: ['phages', 'viruses', 'bacteria', 'phage therapy', 'lytic cycle'],
    aliases: ['phages', 'bacteria-eating viruses', 'phage therapy'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['bacteria-vs-viruses'],
    summary: 'Phages are viruses that hunt bacteria — and they look like tiny lunar landers.',
    steps: steps(
      ['Bacteria hunters', 'Bacteriophages only infect bacteria.'],
      ['Landing', 'A phage lands on a bacterium using its tail fibers.'],
      ['Injection', 'It injects its DNA like a syringe.'],
      ['Burst', 'The bacterium builds new phages until it bursts open.'],
    ),
    interaction: timeline(
      'Watch a phage take over a bacterium.',
      [
        [
          'Approach',
          'A phage drifts toward a bacterium.',
          [sh('bact', 'rod', '#86efac', 50, 65, 4), em('phage', '🛸', 30, 20, 1)],
        ],
        [
          'Landing',
          'Tail fibers grip specific receptors on the bacterial surface.',
          [sh('bact', 'rod', '#86efac', 50, 65, 4), em('phage', '🛸', 48, 40, 1)],
        ],
        [
          'Injection',
          'The tail contracts and injects phage DNA into the cell.',
          [
            sh('bact', 'rod', '#86efac', 50, 65, 4),
            em('phage', '🛸', 48, 42, 1),
            sh('dna', 'wave', '#7c3aed', 50, 62, 0.8),
          ],
        ],
        [
          'Factory',
          'The bacterium’s machinery builds phage parts.',
          [
            sh('bact', 'rod', '#bbf7d0', 50, 65, 4),
            ...[
              [38, 62],
              [46, 68],
              [54, 60],
              [62, 68],
            ].map(([x, y], i) => em(`p${i}`, '🛸', x, y, 0.45)),
          ],
        ],
        [
          'Burst!',
          'The bacterium bursts (lysis), releasing about 100 new phages.',
          [
            sh('bact', 'rod', '#e5e7eb', 50, 65, 4, { opacity: 0.3 }),
            ...[
              [20, 30],
              [35, 20],
              [55, 15],
              [72, 25],
              [85, 45],
              [15, 55],
              [80, 75],
              [30, 85],
            ].map(([x, y], i) => em(`p${i}`, '🛸', x, y, 0.55)),
          ],
        ],
      ],
      [
        ['Stop when the phage injects its DNA.', 2],
        ['Stop when the bacterium bursts.', 4],
      ],
      '#f0fdf4',
    ),
    goDeeper:
      'Bacteriophages are the most abundant biological entities on Earth (an estimated 10³¹). Lytic phages (like T4) kill their host quickly; temperate phages (like lambda) can integrate into the bacterial chromosome (lysogeny) and lie dormant, sometimes carrying genes such as toxins. Phages were discovered by Frederick Twort (1915) and Félix d’Hérelle (1917). Phage therapy — using phages to treat bacterial infections — is being revived for antibiotic-resistant infections.\n\nIn reality, it’s a bit more complicated: the animation shows a tailed phage; many phages have other shapes. Bacteria evolved defenses against phages, including restriction enzymes and CRISPR, which scientists turned into biotechnology tools.',
    quiz: [
      mc(
        'What do bacteriophages infect?',
        ['Human cells', 'Bacteria', 'Plants', 'Fungi'],
        1,
        'Phages are viruses of bacteria.',
      ),
      mc(
        'What does a lytic phage do to its host at the end?',
        [
          'Helps it grow',
          'Bursts it open to release new phages',
          'Turns it into a plant',
          'Nothing',
        ],
        1,
        'Lysis releases the new phages.',
      ),
      predict(
        'A patient has an infection resistant to all antibiotics.',
        'How might phages help?',
        [
          'They can’t',
          'Doctors may use phages that specifically kill that bacterium',
          'Phages make antibiotics stronger',
          'Phages vaccinate the patient',
        ],
        1,
        'Phage therapy targets specific bacteria.',
      ),
    ],
    relatedConcepts: [
      'viral-replication',
      'crispr',
      'antibiotic-resistance',
      'horizontal-gene-transfer',
    ],
    funFact:
      'There are about 10 million times more phages on Earth than there are stars in the observable universe.',
  },
  {
    id: 'quorum-sensing',
    title: 'Quorum Sensing',
    category: 'microbes',
    tags: ['bacteria communication', 'bioluminescence', 'signaling molecules', 'Vibrio', 'squid'],
    aliases: ['bacterial communication', 'how bacteria count', 'bacterial chatter'],
    difficulty: 4,
    rarity: 'obscure',
    summary:
      'Bacteria count how many of their friends are around — and only act when there are enough.',
    steps: steps(
      ['Chemical chatter', 'Each bacterium releases a small signal molecule.'],
      ['Counting by smell', 'More bacteria means more signal.'],
      ['Threshold', 'When the signal passes a threshold, they all switch on new genes at once.'],
      [
        'Glowing squid',
        'Vibrio fischeri bacteria only glow when crowded inside a squid’s light organ.',
      ],
    ),
    interaction: slider({
      prompt:
        'Increase the number of Vibrio bacteria in a squid’s light organ. When do they start to glow?',
      inputs: [
        {
          id: 'density',
          label: 'Bacteria density',
          unit: 'million/mL',
          min: 0,
          max: 100,
          step: 1,
          start: 10,
        },
      ],
      output: {
        label: 'Glow (light produced)',
        unit: '%',
        max: 100,
        expr: '100 * sig(density, 55, 4)',
      },
      readouts: [{ label: 'Signal molecule level', unit: 'a.u.', expr: 'density * 1.0' }],
      graphInput: 'density',
      visual: { kind: 'glow', emoji: '🦑' },
      challenges: [
        {
          prompt: 'Keep the bacteria dark (under 5% glow) even though some are present.',
          target: { max: 5 },
          explain: 'Few bacteria = little signal. Glowing alone would waste energy.',
        },
        {
          prompt: 'Reach the quorum: make them glow brightly (over 90%).',
          target: { min: 90 },
          explain: 'Past the threshold, every bacterium switches on its light genes together.',
        },
      ],
    }),
    goDeeper:
      'In quorum sensing, bacteria produce autoinducers (e.g., acyl-homoserine lactones in Gram-negative bacteria, peptides in Gram-positive bacteria). As population density rises, autoinducer concentration crosses a threshold, binding receptors (LuxR-type) that switch on target genes — often with positive feedback, giving a sharp on/off switch. Vibrio fischeri lights the Hawaiian bobtail squid’s light organ, which cancels the squid’s shadow in moonlight (counter-illumination). Pathogens like Pseudomonas aeruginosa use quorum sensing to coordinate toxin release and biofilm formation, so blocking it (quorum quenching) is a possible therapy.\n\nIn reality, it’s a bit more complicated: many bacteria detect several signals at once, including ones from other species, so they can sense who else is around, not just how many of their own kind.',
    quiz: [
      mc(
        'What do bacteria use to “count” each other?',
        ['Eyes', 'Signal molecules that build up as numbers grow', 'Electric shocks', 'Sound'],
        1,
        'Autoinducer concentration reflects population density.',
      ),
      predict(
        'A few Vibrio fischeri bacteria are floating alone in the ocean.',
        'Do they glow?',
        [
          'Yes, brightly',
          'No — there isn’t enough signal to pass the threshold',
          'Only at noon',
          'They glow red',
        ],
        1,
        'Glowing only pays off when they’re crowded.',
      ),
      mc(
        'Why might blocking quorum sensing help treat infections?',
        [
          'It kills all bacteria instantly',
          'It stops bacteria coordinating attacks like toxin release',
          'It makes bacteria glow',
          'It feeds the immune system',
        ],
        1,
        'Disrupting their communication can disarm pathogens.',
      ),
    ],
    relatedConcepts: ['biofilms', 'bioluminescence', 'cell-signaling'],
    funFact:
      'The Hawaiian bobtail squid flushes out 95% of its glowing bacteria every morning and regrows them by night.',
  },
  {
    id: 'biofilms',
    title: 'Biofilms',
    category: 'microbes',
    tags: ['bacteria', 'slime', 'dental plaque', 'antibiotic tolerance', 'infections'],
    aliases: ['bacterial slime', 'plaque', 'microbial mats'],
    difficulty: 3,
    rarity: 'common',
    summary: 'Bacteria build slimy cities that protect them from antibiotics and immune cells.',
    steps: steps(
      ['Settling down', 'Free-swimming bacteria stick to a surface.'],
      ['Building slime', 'They make a sticky matrix of sugars, proteins and DNA.'],
      ['A city', 'The biofilm grows into towers with water channels.'],
      ['Hard to kill', 'The slime shields them, so biofilms can survive antibiotics.'],
    ),
    interaction: cascade(
      'Watch bacteria build a biofilm on a medical tube. Then break a step.',
      ['Bacteria reach a surface', '🦠'],
      [
        ['Attach', '🧷', 'Bacteria stick to the surface with hair-like pili.'],
        [
          'Talk (quorum sensing)',
          '📡',
          'As numbers grow, signal molecules tell them to build together.',
          'Without quorum sensing, bacteria don’t coordinate, and the biofilm stays thin and weak.',
        ],
        [
          'Build the slime matrix',
          '🫙',
          'They secrete sugars, proteins and DNA into a sticky protective matrix.',
          'No slime: bacteria stay exposed, and antibiotics and immune cells reach them easily.',
        ],
        [
          'Grow into towers',
          '🏙️',
          'Mushroom-shaped towers form with channels carrying water and nutrients.',
        ],
        ['Release new settlers', '🛫', 'Pieces break off to colonize new places.'],
      ],
      'A mature biofilm: up to 1,000 times more tolerant of antibiotics than free-floating bacteria.',
    ),
    goDeeper:
      'Biofilms form on teeth (dental plaque), catheters, artificial joints, heart valves and in the lungs of people with cystic fibrosis. The extracellular polymeric substance (EPS) slows antibiotic penetration, and many cells inside are slow-growing or dormant “persisters” that antibiotics can’t kill well. Biofilms also concentrate bacteria, encouraging gene sharing. Treatment often requires removing infected devices.\n\nIn reality, it’s a bit more complicated: biofilms are the normal way most bacteria live in nature, not just a disease problem — they cover river rocks, ship hulls and pipes, and help clean water in treatment plants.',
    quiz: [
      mc(
        'What is dental plaque?',
        ['Food stuck in teeth', 'A bacterial biofilm', 'Tooth enamel', 'Saliva'],
        1,
        'Plaque is a biofilm on your teeth.',
      ),
      mc(
        'Why are biofilm infections hard to treat?',
        [
          'The bacteria are bigger',
          'The slime matrix shields bacteria from antibiotics and immune cells',
          'Biofilms are viruses',
          'They only form in the lungs',
        ],
        1,
        'The matrix and slow-growing cells protect them.',
      ),
      predict(
        'Bacteria form a biofilm on an artificial hip joint.',
        'What do doctors often have to do?',
        [
          'Nothing',
          'Remove or replace the infected device',
          'Give vitamin C',
          'Wait for the biofilm to dissolve',
        ],
        1,
        'Antibiotics alone often can’t clear device biofilms.',
      ),
    ],
    relatedConcepts: ['quorum-sensing', 'antibiotic-resistance', 'horizontal-gene-transfer'],
    funFact: 'Brushing your teeth is a twice-daily attack on a biofilm that regrows within hours.',
  },
  {
    id: 'fungi',
    title: 'Fungi',
    category: 'microbes',
    tags: ['mushrooms', 'yeast', 'mold', 'decomposers', 'kingdom'],
    aliases: ['mushrooms', 'molds', 'yeasts', 'kingdom fungi'],
    difficulty: 1,
    rarity: 'common',
    summary:
      'Fungi aren’t plants — they’re closer relatives of animals, and they rule the world of decay.',
    steps: steps(
      ['Their own kingdom', 'Fungi aren’t plants or animals; they have their own kingdom.'],
      ['Outside digestion', 'They release enzymes onto food and absorb the nutrients.'],
      ['Hidden bodies', 'Most of a fungus is a web of threads (mycelium) hidden in soil or wood.'],
    ),
    interaction: sorting(
      'Is it a fungus?',
      [
        ['Fungus', '🍄', 'Absorbs food, cell walls of chitin'],
        ['Not a fungus', '🚫', 'Plant, alga, bacterium or animal'],
      ],
      [
        ['Baker’s yeast', '🍞', 0, 'Yeast is a single-celled fungus.'],
        ['Bread mold', '🟢', 0, 'Mold is a fungus spreading through food.'],
        ['Mushroom', '🍄', 0, 'Mushrooms are the fruiting bodies of fungi.'],
        ['Athlete’s foot', '🦶', 0, 'Caused by a fungus that eats skin.'],
        ['Moss', '🌿', 1, 'Moss is a plant — it photosynthesizes.'],
        ['Seaweed', '🌊', 1, 'Seaweed is algae, not fungus.'],
        ['E. coli', '🦠', 1, 'That’s a bacterium.'],
        ['Penicillium (penicillin mold)', '💊', 0, 'The first antibiotic came from this mold.'],
      ],
    ),
    goDeeper:
      'Fungi are eukaryotes with cell walls made of chitin (also found in insect exoskeletons) and are heterotrophs that digest food externally. They include yeasts (single-celled), molds and mushroom-forming fungi; mycelium is made of thread-like hyphae. Fungi are essential decomposers, form mycorrhizal partnerships with most plants, and give us bread, cheese, antibiotics and soy sauce. Genetic evidence shows fungi are more closely related to animals than to plants (both are opisthokonts).\n\nIn reality, it’s a bit more complicated: some fungi cause serious diseases (like Candida auris, an emerging drug-resistant yeast), and some “molds” such as water molds and slime molds aren’t true fungi at all.',
    quiz: [
      mc(
        'Fungi are more closely related to…',
        ['Plants', 'Animals', 'Bacteria', 'Viruses'],
        1,
        'DNA shows fungi and animals share a more recent common ancestor.',
      ),
      mc(
        'How do fungi get food?',
        [
          'Photosynthesis',
          'Releasing enzymes and absorbing nutrients',
          'Eating with a mouth',
          'From the air',
        ],
        1,
        'They digest food outside their bodies.',
      ),
      predict(
        'A log in a forest is covered in mushrooms.',
        'What is the fungus doing?',
        [
          'Making the log grow',
          'Decomposing the wood and recycling its nutrients',
          'Turning it into stone',
          'Protecting it forever',
        ],
        1,
        'Fungi are major decomposers of wood.',
      ),
    ],
    relatedConcepts: ['mycorrhizal-networks', 'zombie-fungus', 'fermentation'],
    funFact:
      'One honey fungus in Oregon spreads across nearly 10 square kilometers — among the largest organisms on Earth.',
  },
  {
    id: 'parasites',
    title: 'Parasites',
    category: 'microbes',
    tags: ['parasitism', 'tapeworm', 'ticks', 'malaria', 'host'],
    aliases: ['parasitic organisms', 'ectoparasites', 'endoparasites', 'parasitoids'],
    difficulty: 2,
    rarity: 'common',
    summary:
      'Parasites live on or in another organism and take what they need — usually without killing it quickly.',
    steps: steps(
      ['Freeloaders', 'A parasite benefits while its host is harmed.'],
      ['Outside or inside', 'Ectoparasites live on the outside; endoparasites live inside.'],
      ['Parasitoids', 'Some, like certain wasps, eventually kill their host.'],
    ),
    interaction: sorting(
      'Sort each organism by how it lives.',
      [
        ['Ectoparasite', '🦟', 'Lives on the outside of a host'],
        ['Endoparasite', '🪱', 'Lives inside a host'],
        ['Parasitoid', '🐝', 'Eventually kills its host'],
        ['Not a parasite', '🤝', 'Free-living or helpful'],
      ],
      [
        ['Head lice', '🪮', 0, 'Lice cling to hair and feed on blood.'],
        ['Tick', '🕷️', 0, 'Ticks attach to skin to drink blood.'],
        ['Tapeworm', '🪱', 1, 'Tapeworms live in the gut, absorbing digested food.'],
        [
          'Malaria parasite (Plasmodium)',
          '🦠',
          1,
          'It lives inside red blood cells and liver cells.',
        ],
        [
          'Parasitic wasp larvae inside a caterpillar',
          '🐛',
          2,
          'The larvae eat the caterpillar from inside, eventually killing it.',
        ],
        ['Honeybee', '🐝', 3, 'Honeybees are free-living pollinators.'],
        [
          'Gut bacteria that make vitamins',
          '🧫',
          3,
          'Many gut microbes are helpful partners (mutualists).',
        ],
      ],
    ),
    goDeeper:
      'Parasitism is a symbiosis where one partner benefits at the other’s expense. Parasites often have complex life cycles with multiple hosts: Plasmodium (malaria) alternates between Anopheles mosquitoes and humans; Toxoplasma reproduces sexually only in cats. Some parasites manipulate host behavior to complete their cycle. Parasites may be a huge share of all species, and they shape ecosystems and evolution (driving, for example, the evolution of sex according to the Red Queen hypothesis).\n\nIn reality, it’s a bit more complicated: the line between parasite and mutualist can shift with conditions, and some parasites (like certain worms) may even calm overactive immune systems, which researchers study for autoimmune diseases.',
    quiz: [
      mc(
        'How does a parasite differ from a predator?',
        [
          'Parasites are always bigger',
          'Parasites usually live on or in a host and harm it without killing it quickly',
          'Predators never eat meat',
          'There is no difference',
        ],
        1,
        'Parasites typically keep their host alive for a while.',
      ),
      mc(
        'Which is an endoparasite?',
        ['Tick', 'Head louse', 'Tapeworm', 'Mosquito'],
        2,
        'Tapeworms live inside the gut.',
      ),
      predict(
        'Mosquito populations are greatly reduced in a region.',
        'What happens to malaria cases?',
        [
          'They rise',
          'They fall, because the parasite needs mosquitoes to spread',
          'They stay the same',
          'Malaria becomes a virus',
        ],
        1,
        'Mosquitoes are essential to the malaria life cycle.',
      ),
    ],
    relatedConcepts: ['zombie-fungus', 'symbiosis', 'wolbachia', 'red-queen'],
    funFact:
      'A parasitic barnacle called Sacculina takes over a crab’s body and makes it care for the barnacle’s eggs as if they were its own.',
  },
  {
    id: 'prions',
    title: 'Prions',
    category: 'microbes',
    tags: ['misfolded proteins', 'mad cow disease', 'CJD', 'neurodegeneration', 'protein folding'],
    aliases: ['mad cow disease', 'Creutzfeldt-Jakob disease', 'infectious proteins', 'kuru'],
    difficulty: 4,
    rarity: 'obscure',
    prerequisites: ['protein-folding'],
    summary: 'Prions are misfolded proteins that bully normal proteins into misfolding too.',
    steps: steps(
      ['A normal protein', 'Your neurons make a harmless protein called PrP.'],
      ['A bad fold', 'Sometimes PrP folds the wrong way.'],
      ['Domino effect', 'The misfolded version forces normal PrP to misfold too.'],
      ['Clumps', 'Misfolded proteins clump and damage the brain, leaving holes like a sponge.'],
    ),
    interaction: timeline(
      'Watch one misfolded protein convert its neighbors.',
      [
        [
          'Healthy neuron',
          'Normal PrP proteins (green spirals) sit on the cell surface.',
          [
            sh('n', 'blob', '#e0e7ff', 50, 55, 5, { opacity: 0.6 }),
            ...[30, 45, 60, 75].map((x, i) => sh(`p${i}`, 'helix', '#22c55e', x, 35, 0.6)),
          ],
        ],
        [
          'Prion arrives',
          'One misfolded prion (red, flat sheet) appears.',
          [
            sh('n', 'blob', '#e0e7ff', 50, 55, 5, { opacity: 0.6 }),
            ...[30, 45, 60, 75].map((x, i) => sh(`p${i}`, 'helix', '#22c55e', x, 35, 0.6)),
            sh('bad', 'rect', '#ef4444', 18, 35, 0.5),
          ],
        ],
        [
          'Conversion',
          'It touches a normal protein and forces it into the bad shape.',
          [
            sh('n', 'blob', '#e0e7ff', 50, 55, 5, { opacity: 0.6 }),
            sh('p0', 'rect', '#ef4444', 30, 35, 0.5),
            ...[45, 60, 75].map((x, i) => sh(`p${i + 1}`, 'helix', '#22c55e', x, 35, 0.6)),
            sh('bad', 'rect', '#ef4444', 20, 35, 0.5),
          ],
        ],
        [
          'Chain reaction',
          'Each new prion converts more. The number doubles again and again.',
          [
            sh('n', 'blob', '#e0e7ff', 50, 55, 5, { opacity: 0.6 }),
            ...[30, 45, 60, 75].map((x, i) => sh(`p${i}`, 'rect', '#ef4444', x, 35, 0.5)),
            sh('bad', 'rect', '#ef4444', 20, 35, 0.5),
          ],
        ],
        [
          'Clumps & damage',
          'Prions stick together into clumps that kill neurons, leaving sponge-like holes.',
          [
            sh('n', 'blob', '#e5e7eb', 50, 55, 5, { opacity: 0.4 }),
            sh('clump', 'star', '#b91c1c', 48, 40, 1.6),
            ...[
              [30, 65],
              [55, 70],
              [68, 55],
            ].map(([x, y], i) => sh(`hole${i}`, 'circle', '#ffffff', x, y, 0.6)),
          ],
        ],
      ],
      [
        ['Stop when the first normal protein is converted.', 2],
        ['Stop when neurons are damaged.', 4],
      ],
      '#fef2f2',
    ),
    goDeeper:
      'Prions (“proteinaceous infectious particles”) were proposed by Stanley Prusiner (Nobel Prize 1997). The normal cellular prion protein PrPᶜ is mostly α-helical; the disease form PrPˢᶜ is rich in β-sheets, highly stable, resistant to heat and proteases, and acts as a template for converting PrPᶜ. Prion diseases (transmissible spongiform encephalopathies) include Creutzfeldt–Jakob disease, variant CJD (linked to “mad cow” BSE), kuru (spread by ritual funerary cannibalism in Papua New Guinea), scrapie in sheep and chronic wasting disease in deer.\n\nIn reality, it’s a bit more complicated: most CJD cases are sporadic (no known cause), some are inherited through PrP gene mutations, and only a few are acquired. Similar templated misfolding happens with proteins in Alzheimer’s and Parkinson’s diseases, though those aren’t considered infectious between people in normal circumstances.',
    quiz: [
      mc(
        'What is a prion?',
        [
          'A virus',
          'A misfolded protein that causes others to misfold',
          'A bacterium',
          'A type of DNA',
        ],
        1,
        'Prions are infectious proteins with no genes.',
      ),
      mc(
        'Why are prions so hard to destroy?',
        [
          'They are made of metal',
          'Their misfolded shape is extremely stable, resisting heat and enzymes',
          'They hide in bones',
          'They are too small to see',
        ],
        1,
        'Normal sterilization often fails against prions.',
      ),
      predict(
        'One prion enters a brain full of normal PrP protein.',
        'What happens over time?',
        [
          'It is quickly destroyed',
          'It converts more and more proteins in a chain reaction',
          'It turns into a virus',
          'Nothing',
        ],
        1,
        'Templated misfolding spreads exponentially.',
      ),
    ],
    relatedConcepts: ['protein-folding', 'bacteria-vs-viruses', 'enzymes'],
    funFact:
      'Prions survive normal hospital sterilization, so surgical tools used on suspected prion patients may be destroyed.',
  },
  {
    id: 'pandemics-r0',
    title: 'Pandemics & R₀',
    category: 'microbes',
    tags: ['epidemics', 'R0', 'exponential growth', 'social distancing', 'public health'],
    aliases: ['R naught', 'reproduction number', 'how pandemics spread', 'flattening the curve'],
    difficulty: 3,
    rarity: 'common',
    summary:
      'How fast a disease spreads depends on one key number: how many people each sick person infects.',
    steps: steps(
      ['R₀', 'R₀ is how many people one sick person infects in a population with no immunity.'],
      ['Exponential', 'If each person infects 2, cases double every generation: 1, 2, 4, 8, 16…'],
      ['Below 1', 'If R drops below 1, outbreaks shrink and fade.'],
      ['Lowering R', 'Masks, distancing, testing and vaccines lower the effective R.'],
    ),
    interaction: slider({
      prompt:
        'Set how contagious a new virus is and how much people reduce contact. How many cases after a month?',
      inputs: [
        { id: 'r0', label: 'R₀', min: 0.5, max: 4, step: 0.1, start: 2.5 },
        {
          id: 'distance',
          label: 'Contact reduction',
          unit: '%',
          min: 0,
          max: 90,
          step: 5,
          start: 0,
        },
      ],
      output: {
        label: 'New cases per day after a month (starting with 10)',
        max: 5000,
        expr: 'min(5000, 10 * (r0 * (1 - distance / 100)) ^ 6)',
      },
      readouts: [{ label: 'Effective R', expr: 'r0 * (1 - distance / 100)' }],
      graphInput: 'r0',
      visual: { kind: 'particles', emoji: '🤧' },
      challenges: [
        {
          prompt: 'Let it explode: over 2,000 new cases per day.',
          target: { min: 2000 },
          explain:
            'With R around 3, cases multiply ~3× every 5 days: 10 becomes thousands in a month.',
        },
        {
          prompt: 'Shrink the outbreak: fewer than 5 new cases per day.',
          target: { max: 5 },
          explain: 'Push the effective R below 1 and each generation is smaller than the last.',
        },
      ],
    }),
    goDeeper:
      'R₀ depends on the pathogen and on behavior: R₀ ≈ (contacts per day) × (transmission probability per contact) × (days infectious). The effective reproduction number Rₜ changes as people gain immunity or change behavior. This simple model assumes a 5-day generation time, so a month is about 6 generations and cases scale as R⁶. Estimates: seasonal flu R₀ ≈ 1.3, original SARS-CoV-2 ≈ 2–3, measles 12–18. Flattening the curve keeps hospital demand below capacity.\n\nIn reality, it’s a bit more complicated: real outbreaks don’t grow forever — they slow as susceptible people run out — and spread is uneven, with some “superspreading” events infecting many people while most cases infect few.',
    quiz: [
      mc(
        'What does R₀ = 3 mean?',
        [
          '3 people die',
          'Each sick person infects about 3 others on average',
          'The disease lasts 3 days',
          '3% of people are sick',
        ],
        1,
        'R₀ is the average number of new infections per case.',
      ),
      predict(
        'Effective R drops from 2 to 0.8 because of masks and vaccines.',
        'What happens to the outbreak?',
        [
          'It grows faster',
          'It shrinks over time',
          'It stays exactly the same',
          'It doubles every day',
        ],
        1,
        'Below 1, each generation of cases is smaller.',
      ),
      mc(
        'Why can doubling be so dangerous?',
        [
          'It’s slow',
          'Small numbers become huge surprisingly fast',
          'It only affects animals',
          'It stops automatically',
        ],
        1,
        'Exponential growth: 1 → 1,024 in ten doublings.',
      ),
    ],
    relatedConcepts: ['herd-immunity', 'vaccines', 'viral-replication'],
    funFact:
      'The word “quarantine” comes from the Italian for “forty days,” the time ships had to wait in 14th-century Venice.',
  },
  {
    id: 'zombie-fungus',
    title: 'The Zombie-Ant Fungus',
    category: 'microbes',
    tags: ['Ophiocordyceps', 'parasites', 'mind control', 'ants', 'fungi'],
    aliases: ['Ophiocordyceps', 'zombie ants', 'cordyceps', 'mind-controlling fungus'],
    difficulty: 3,
    rarity: 'obscure',
    prerequisites: ['fungi', 'parasites'],
    summary:
      'A fungus that infects carpenter ants, steers them to the perfect spot, and grows out of their heads.',
    steps: steps(
      ['Infection', 'A spore lands on an ant and bores through its armor.'],
      ['Takeover', 'The fungus spreads through the ant’s body, wrapping its muscles.'],
      ['The climb', 'The ant leaves its colony and climbs a plant at a precise height.'],
      [
        'Death grip',
        'It bites a leaf vein and locks on. The fungus then sprouts from its head and rains spores.',
      ],
    ),
    interaction: timeline(
      'Follow the zombie-ant fungus life cycle.',
      [
        [
          'Spore lands',
          'A sticky fungal spore lands on a foraging ant.',
          [
            em('ant', '🐜', 40, 80, 1.3),
            em('spore', '✨', 45, 70, 0.6),
            em('plant', '🌿', 75, 55, 3),
          ],
          'Day 0',
        ],
        [
          'Inside the ant',
          'The fungus grows inside, weaving through the ant’s muscles.',
          [
            em('ant', '🐜', 50, 80, 1.3),
            em('spore', '🍄', 50, 78, 0.4, { opacity: 0.6 }),
            em('plant', '🌿', 75, 55, 3),
          ],
          'Day 5',
        ],
        [
          'The climb',
          'The ant wanders off and climbs the plant to about 25 cm, where it’s humid and warm.',
          [em('ant', '🐜', 70, 55, 1.2, { rotate: -60 }), em('plant', '🌿', 75, 55, 3)],
          'Day 10',
        ],
        [
          'Death grip',
          'Around solar noon, it bites a leaf vein and its jaws lock. The ant dies.',
          [em('ant', '🐜', 75, 35, 1.2, { rotate: -30 }), em('plant', '🌿', 75, 55, 3)],
          'Day 11',
        ],
        [
          'Spore rain',
          'A stalk grows from the ant’s head and showers spores on the trail below.',
          [
            em('ant', '🐜', 75, 35, 1.2, { rotate: -30 }),
            em('stalk', '🍄', 78, 20, 1),
            em('plant', '🌿', 75, 55, 3),
            ...[
              [60, 70],
              [70, 80],
              [80, 75],
              [65, 88],
            ].map(([x, y], i) => em(`s${i}`, '✨', x, y, 0.5)),
          ],
          'Weeks later',
        ],
      ],
      [
        ['Stop when the ant locks its jaws on the leaf.', 3],
        ['Stop when the spores rain down.', 4],
      ],
      '#f0fdf4',
    ),
    goDeeper:
      'Ophiocordyceps unilateralis (a species complex) infects carpenter ants in tropical forests. Studies by David Hughes and others found fungal cells surrounding and invading the ant’s muscle fibers, while the brain itself appears largely intact — suggesting the fungus may control behavior partly through the muscles and secreted chemicals. Infected ants bite at a consistent height and time of day, positioning the fungus for spore dispersal onto the colony’s foraging trails. Healthy ants detect and carry away infected nestmates as a social defense.\n\nIn reality, it’s a bit more complicated: “mind control” is a catchy description, but exactly how the fungus changes behavior is still being researched. Ophiocordyceps species are specific to their insect hosts and do not infect humans.',
    quiz: [
      mc(
        'What does the zombie-ant fungus make infected ants do?',
        ['Dig deeper nests', 'Climb up and clamp onto a leaf', 'Swim', 'Fly away'],
        1,
        'The “death grip” positions the fungus to spread spores.',
      ),
      mc(
        'Why is the climb useful for the fungus?',
        [
          'It’s warmer at the top of trees',
          'From that height, spores rain down on other ants below',
          'It hides from birds',
          'It finds water',
        ],
        1,
        'Spores fall onto ant trails, infecting more ants.',
      ),
      predict(
        'Healthy ants notice an infected nestmate acting strangely.',
        'What might they do?',
        [
          'Ignore it',
          'Carry it away from the colony',
          'Become infected immediately',
          'Feed it more',
        ],
        1,
        'Social immunity: colonies remove sick members.',
      ),
    ],
    relatedConcepts: ['fungi', 'parasites', 'coevolution'],
    funFact:
      'Fossil leaves about 48 million years old show the same death-grip bite marks, so this behavior is ancient.',
  },
  {
    id: 'wolbachia',
    title: 'Wolbachia',
    category: 'microbes',
    tags: ['bacteria', 'mosquitoes', 'dengue', 'insects', 'symbiosis', 'disease control'],
    aliases: ['Wolbachia bacteria', 'World Mosquito Program', 'fighting dengue with bacteria'],
    difficulty: 4,
    rarity: 'obscure',
    prerequisites: ['parasites'],
    summary:
      'A bacterium that lives inside insects is now helping stop mosquitoes from spreading dengue.',
    steps: steps(
      ['Hidden passenger', 'Wolbachia lives inside the cells of many insects.'],
      ['Passed through eggs', 'Mothers pass it to their offspring.'],
      ['Blocks viruses', 'In mosquitoes, it makes it hard for dengue and Zika viruses to grow.'],
      ['Spreads itself', 'A reproductive trick helps it spread through wild mosquito populations.'],
    ),
    interaction: cascade(
      'Release Wolbachia mosquitoes into a city with dengue. Then break a link.',
      ['Release Wolbachia mosquitoes', '🦟'],
      [
        [
          'Wolbachia mosquitoes mate with wild ones',
          '💞',
          'Released mosquitoes carry Wolbachia in their cells.',
        ],
        [
          'Cytoplasmic incompatibility',
          '🥚',
          'Eggs from uninfected females fertilized by infected males fail to hatch, giving infected females an advantage.',
          'Without this trick, Wolbachia wouldn’t outcompete — it would fade out of the wild population.',
        ],
        ['Wolbachia spreads', '📈', 'Within months, most local mosquitoes carry Wolbachia.'],
        [
          'Viruses blocked',
          '🛡️',
          'Inside these mosquitoes, dengue virus can’t multiply well.',
          'If the virus-blocking effect fails, mosquitoes carry Wolbachia but still spread dengue.',
        ],
        ['Fewer dengue cases', '📉', 'Mosquitoes still bite, but they transmit far less dengue.'],
      ],
      'Dengue cases fall dramatically — without killing mosquitoes.',
    ),
    goDeeper:
      'Wolbachia pipientis is an intracellular bacterium found in an estimated 40–60% of insect species. It manipulates host reproduction: cytoplasmic incompatibility, killing males, feminizing males or inducing asexual reproduction, all of which favor its maternal transmission. Aedes aegypti doesn’t naturally carry Wolbachia; strains transferred from fruit flies (wMel) reduce dengue, Zika and chikungunya virus replication. A randomized trial in Yogyakarta, Indonesia (2020) found a 77% reduction in dengue cases in treated areas.\n\nIn reality, it’s a bit more complicated: virus-blocking may involve competition for resources and boosted mosquito immunity, and heat waves can reduce Wolbachia levels in mosquitoes. A different strategy releases only Wolbachia-carrying males to shrink mosquito populations.',
    quiz: [
      mc(
        'How is Wolbachia passed between generations?',
        ['Through the air', 'From mother to offspring in the egg', 'By bites', 'Through water'],
        1,
        'Wolbachia is maternally transmitted.',
      ),
      mc(
        'How does Wolbachia reduce dengue?',
        [
          'It kills all mosquitoes',
          'It makes it hard for the virus to grow inside mosquitoes',
          'It vaccinates people',
          'It makes mosquitoes bigger',
        ],
        1,
        'Mosquitoes with Wolbachia transmit dengue poorly.',
      ),
      predict(
        'Wolbachia mosquitoes are released in a city.',
        'What happens to dengue over a few years?',
        [
          'It rises',
          'It falls as Wolbachia spreads through local mosquitoes',
          'It stays the same',
          'It becomes airborne',
        ],
        1,
        'Trials showed large reductions in dengue.',
      ),
    ],
    relatedConcepts: ['parasites', 'symbiosis', 'viral-replication'],
    funFact:
      'Wolbachia may be the most common infection on Earth, living in a large fraction of all insect species.',
  },
];
