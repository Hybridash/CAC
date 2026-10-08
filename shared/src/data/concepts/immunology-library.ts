import type { Concept } from '../../types';
import { cascade, label, lockKey, mc, predict, slider, sorting, steps } from './helpers';

export const immunologyLibrary: Concept[] = [
  {
    id: 'innate-vs-adaptive',
    title: 'Innate vs Adaptive Immunity',
    category: 'immunology',
    tags: ['immune system', 'first responders', 'memory', 'B cells', 'T cells', 'macrophages'],
    aliases: ['innate immune system', 'adaptive immune system', 'two parts of immunity'],
    difficulty: 2,
    rarity: 'common',
    summary: 'Your immune system has fast general guards and slower expert snipers that remember.',
    steps: steps(
      [
        'Innate: always ready',
        'Skin, mucus, fever and eating cells attack anything foreign within minutes to hours.',
      ],
      [
        'Adaptive: the experts',
        'B and T cells learn the exact shape of a specific germ — it takes days.',
      ],
      ['Memory', 'Only adaptive immunity remembers, so the next attack is beaten faster.'],
    ),
    interaction: sorting(
      'Sort each defense into innate or adaptive immunity.',
      [
        ['Innate', '🧱', 'Fast, general, no memory'],
        ['Adaptive', '🎯', 'Slower at first, specific, remembers'],
      ],
      [
        ['Skin barrier', '🧴', 0, 'Skin blocks most germs — the first line of innate defense.'],
        ['Stomach acid', '🧪', 0, 'Acid kills many swallowed microbes.'],
        ['Neutrophils', '⚪', 0, 'These first-responder white cells eat any bacteria they find.'],
        ['Fever', '🌡️', 0, 'A general response that makes the body less friendly to germs.'],
        ['Antibodies', '🔱', 1, 'Each antibody targets one specific antigen.'],
        ['Memory B cells', '🧠', 1, 'They remember a past infection for years.'],
        ['Killer T cells', '🗡️', 1, 'They recognize and kill cells infected by one specific germ.'],
      ],
    ),
    goDeeper:
      'Innate immunity includes physical barriers, antimicrobial chemicals, complement, phagocytes (neutrophils, macrophages, dendritic cells), natural killer cells and inflammation. It recognizes broad danger patterns (PAMPs such as bacterial LPS) through receptors like Toll-like receptors. Adaptive immunity (B and T lymphocytes) relies on enormous receptor diversity, clonal expansion and memory. The two systems talk constantly: dendritic cells (innate) present antigens to T cells to start adaptive responses.\n\nIn reality, it’s a bit more complicated: some innate cells show a form of short-term “trained immunity,” and some cell types (like NK T cells) sit between the two categories.',
    quiz: [
      mc(
        'Which part of the immune system has memory?',
        ['Innate', 'Adaptive', 'Both equally', 'Neither'],
        1,
        'Memory B and T cells are part of adaptive immunity.',
      ),
      mc(
        'Which is an innate defense?',
        ['Antibodies', 'Killer T cells', 'Skin', 'Memory B cells'],
        2,
        'Skin is a general barrier.',
      ),
      predict(
        'A brand-new germ you’ve never met gets through a cut.',
        'Which defense acts first?',
        [
          'Antibodies made for it',
          'Innate defenses like neutrophils and inflammation',
          'Memory cells',
          'Vaccines',
        ],
        1,
        'Innate defenses respond immediately; adaptive takes days the first time.',
      ),
    ],
    relatedConcepts: ['white-blood-cells', 'antibodies', 'vaccines', 'inflammation'],
    funFact:
      'Neutrophils arrive at an infection within minutes and make up most of the pus in a wound.',
  },
  {
    id: 'white-blood-cells',
    title: 'White Blood Cell Types',
    category: 'immunology',
    tags: ['leukocytes', 'neutrophils', 'macrophages', 'lymphocytes', 'T cells', 'B cells'],
    aliases: ['leukocytes', 'immune cells', 'types of white blood cells'],
    difficulty: 2,
    rarity: 'common',
    summary:
      'White blood cells are a team of specialists: eaters, antibody factories, assassins and generals.',
    steps: steps(
      ['A diverse team', 'There are several kinds of white blood cells, each with its own job.'],
      ['Eaters', 'Neutrophils and macrophages swallow germs whole.'],
      ['Specialists', 'B cells make antibodies; T cells coordinate and kill infected cells.'],
    ),
    interaction: sorting(
      'Sort each job to the white blood cell that does it.',
      [
        ['Neutrophil', '⚪', 'First responder'],
        ['Macrophage', '🟤', 'Big eater & messenger'],
        ['B cell', '🔱', 'Antibody maker'],
        ['T cell', '🗡️', 'Coordinator & assassin'],
      ],
      [
        ['First to arrive at an infection', '🚑', 0, 'Neutrophils rush in within minutes.'],
        ['Main ingredient of pus', '🤢', 0, 'Pus is mostly dead neutrophils.'],
        [
          'Eats germs and shows pieces to T cells',
          '📢',
          1,
          'Macrophages present antigens to activate the adaptive response.',
        ],
        [
          'Cleans up dead cells for months',
          '🧹',
          1,
          'Macrophages can live a long time in tissues.',
        ],
        [
          'Becomes a plasma cell making antibodies',
          '🏭',
          2,
          'Activated B cells turn into antibody factories.',
        ],
        [
          'Kills virus-infected body cells',
          '🎯',
          3,
          'Cytotoxic (killer) T cells destroy infected cells.',
        ],
        [
          'Directs the whole immune response',
          '🎖️',
          3,
          'Helper T cells release signals that coordinate other cells.',
        ],
      ],
    ),
    goDeeper:
      'Leukocytes include granulocytes (neutrophils ~50–70% of white cells, eosinophils for parasites and allergies, basophils), monocytes (which become macrophages and dendritic cells), and lymphocytes (B cells, T cells and natural killer cells). Helper T cells (CD4⁺) coordinate responses; cytotoxic T cells (CD8⁺) kill infected and cancerous cells. HIV infects CD4⁺ helper T cells, which is why untreated HIV cripples the whole immune system.\n\nIn reality, it’s a bit more complicated: each type has many subtypes (regulatory T cells, for example, calm responses down), and cells change behavior depending on signals around them. A normal white blood cell count is about 4,000–11,000 per microliter of blood.',
    quiz: [
      mc(
        'Which white blood cells make antibodies?',
        ['Neutrophils', 'B cells (as plasma cells)', 'Red blood cells', 'Platelets'],
        1,
        'Activated B cells become plasma cells that secrete antibodies.',
      ),
      predict(
        'A virus destroys helper T cells (as HIV does).',
        'What happens to the immune system?',
        [
          'It gets stronger',
          'It struggles, because helper T cells coordinate the others',
          'Only neutrophils are affected',
          'Nothing changes',
        ],
        1,
        'Losing the “generals” weakens the whole response.',
      ),
      label(
        'Match each cell to its job.',
        [
          ['Neutrophil', 'First responder that eats bacteria'],
          ['Killer T cell', 'Destroys infected body cells'],
          ['Macrophage', 'Big eater that alerts T cells'],
        ],
        'A team of specialists.',
      ),
    ],
    relatedConcepts: ['innate-vs-adaptive', 'antibodies', 'lysosomes', 'thymus-training'],
    funFact:
      'A single drop of blood holds thousands of white blood cells — and millions of red ones.',
  },
  {
    id: 'inflammation',
    title: 'Inflammation',
    category: 'immunology',
    tags: ['swelling', 'redness', 'histamine', 'healing', 'immune response'],
    aliases: ['why cuts get red and swollen', 'inflammatory response', 'swelling'],
    difficulty: 2,
    rarity: 'common',
    summary:
      'Redness, heat and swelling after an injury are your body opening the road for immune cells.',
    steps: steps(
      ['Alarm', 'Damaged cells and mast cells release alarm chemicals like histamine.'],
      ['Wider roads', 'Blood vessels widen — the area turns red and warm.'],
      [
        'Leaky walls',
        'Vessels become leaky so fluid and white cells pour into the tissue — swelling.',
      ],
      ['Clean-up', 'White cells destroy germs and clear debris, then healing begins.'],
    ),
    interaction: cascade(
      'Get a splinter and watch inflammation unfold. Then block a step.',
      ['Ouch! A dirty splinter', '🪵'],
      [
        [
          'Mast cells release histamine',
          '🚨',
          'Damaged tissue and mast cells release histamine and other signals.',
          'An antihistamine blocks this signal: less redness and swelling — but also a slower immune response.',
        ],
        ['Blood vessels widen', '🔴', 'More blood flows in: redness and heat.'],
        ['Vessels get leaky', '💧', 'Fluid seeps into the tissue: swelling and some pain.'],
        [
          'White blood cells arrive',
          '⚪',
          'Neutrophils squeeze through vessel walls toward the germs.',
          'Without white cells arriving, bacteria in the wound multiply unchecked.',
        ],
        ['Germs destroyed & healing', '🩹', 'Germs are eaten, debris cleared, and repair begins.'],
      ],
      'Inflammation did its job: the infection is cleared and healing starts.',
    ),
    goDeeper:
      'The classic signs of acute inflammation are redness (rubor), heat (calor), swelling (tumor), pain (dolor) and loss of function. Mediators include histamine, prostaglandins, bradykinin and cytokines; they cause vasodilation and increased vascular permeability. Neutrophils follow chemical gradients (chemotaxis) out of vessels. NSAIDs like ibuprofen reduce inflammation by blocking prostaglandin production.\n\nIn reality, it’s a bit more complicated: acute inflammation is helpful, but chronic low-grade inflammation contributes to diseases such as arthritis, atherosclerosis and type 2 diabetes. Inflammation must also be actively switched off; failure to resolve it can damage tissue.',
    quiz: [
      mc(
        'Why does an injured area turn red and warm?',
        [
          'Germs are hot',
          'Blood vessels widen and bring more blood',
          'Skin cells glow',
          'Muscles contract',
        ],
        1,
        'Vasodilation increases blood flow.',
      ),
      mc(
        'What causes swelling during inflammation?',
        [
          'Air bubbles',
          'Fluid leaking from blood vessels into tissue',
          'Bone growth',
          'Fat storage',
        ],
        1,
        'Leaky vessels let fluid and cells into the tissue.',
      ),
      predict(
        'Someone takes a strong antihistamine before getting a bug bite.',
        'What happens to the bite?',
        [
          'It swells much more',
          'Less redness, swelling and itching',
          'It turns blue',
          'Nothing at all',
        ],
        1,
        'Blocking histamine reduces these symptoms.',
      ),
    ],
    relatedConcepts: ['innate-vs-adaptive', 'allergies', 'fever', 'cytokine-storm'],
    funFact:
      'The Roman writer Celsus described the four classic signs of inflammation about 2,000 years ago.',
  },
  {
    id: 'fever',
    title: 'Fever',
    category: 'immunology',
    tags: ['body temperature', 'infection', 'pyrogens', 'hypothalamus', 'immune response'],
    aliases: ['why we get fevers', 'high temperature', 'pyrogens'],
    difficulty: 2,
    rarity: 'common',
    prerequisites: ['thermoregulation'],
    summary:
      'A fever is your body turning up the thermostat on purpose to make life harder for germs.',
    steps: steps(
      ['A new set point', 'Immune signals tell the brain’s thermostat to aim higher.'],
      ['Chills', 'You shiver and feel cold while your temperature climbs to the new target.'],
      ['Germs suffer', 'Many germs grow slower in the heat, while some immune cells work faster.'],
      ['Too much', 'Very high fevers can be dangerous, so they need care.'],
    ),
    interaction: slider({
      prompt:
        'Raise body temperature during an infection. When do bacteria struggle the most — safely?',
      inputs: [
        {
          id: 'temp',
          label: 'Body temperature',
          unit: '°C',
          min: 36,
          max: 42,
          step: 0.1,
          start: 37,
        },
      ],
      output: {
        label: 'Bacterial growth',
        unit: '%',
        max: 100,
        expr: '100 * gauss(temp, 37, 1.6)',
      },
      readouts: [
        {
          label: 'Immune cell speed',
          unit: '%',
          expr: '100 * min(1, 0.6 + 0.12 * (temp - 37)) * (1 - sig(temp, 41.3, 0.3))',
        },
        { label: 'Danger to the body', unit: '%', expr: '100 * sig(temp, 40.8, 0.35)' },
      ],
      graphInput: 'temp',
      visual: { kind: 'particles', emoji: '🦠' },
      challenges: [
        {
          prompt: 'Find a fever where bacteria grow at under half speed (under 50%).',
          target: { max: 50 },
          explain:
            'Around 39 °C, many bacteria slow down while immune cells speed up. Check the danger readout too!',
        },
        {
          prompt: 'Return to normal temperature, where bacteria thrive (over 95%).',
          target: { min: 95 },
          explain:
            'Many germs that infect us are adapted to grow best at our normal body temperature.',
        },
      ],
    }),
    goDeeper:
      'Pyrogens — bacterial products and cytokines such as IL-1, IL-6 and TNF — trigger prostaglandin E2 production in the hypothalamus, raising the temperature set point. The body then conserves and generates heat (vasoconstriction, shivering), causing chills, until body temperature reaches the new set point. Fever can slow some pathogens and enhances aspects of immunity, such as lymphocyte movement. Fever reducers like paracetamol (acetaminophen) and ibuprofen block prostaglandin production.\n\nIn reality, it’s a bit more complicated: the bacterial growth curve is illustrative; different microbes have different temperature preferences, and the evidence that fever speeds recovery in humans is mixed. Fevers above about 40 °C, fevers in young babies, or fevers with other warning signs need medical attention.',
    quiz: [
      mc(
        'Why do you feel cold and shiver at the start of a fever?',
        [
          'You’re losing heat fast',
          'Your brain’s set point is higher, so your normal temperature feels too cold',
          'The germs are cold',
          'You are dehydrated',
        ],
        1,
        'The thermostat moved up, so your body works to warm up.',
      ),
      mc(
        'What triggers a fever?',
        [
          'Eating too much',
          'Immune signals (pyrogens) acting on the hypothalamus',
          'Sunburn only',
          'Drinking cold water',
        ],
        1,
        'Pyrogens reset the hypothalamic thermostat.',
      ),
      predict(
        'A fever rises to 42 °C.',
        'Why is this dangerous?',
        [
          'It isn’t',
          'Very high temperatures can damage the body’s own proteins and cells',
          'It makes germs stronger',
          'It freezes the brain',
        ],
        1,
        'Extreme heat harms the body too.',
      ),
    ],
    relatedConcepts: ['thermoregulation', 'inflammation', 'innate-vs-adaptive'],
    funFact: 'Lizards “give themselves” fevers by moving to warmer spots when they are infected.',
  },
  {
    id: 'allergies',
    title: 'Allergies',
    category: 'immunology',
    tags: ['IgE', 'histamine', 'pollen', 'mast cells', 'anaphylaxis', 'hay fever'],
    aliases: ['allergic reaction', 'hay fever', 'anaphylaxis', 'why pollen makes you sneeze'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['antibodies'],
    summary: 'An allergy is your immune system overreacting to something harmless, like pollen.',
    steps: steps(
      [
        'A false alarm',
        'The immune system mistakes a harmless substance (an allergen) for a threat.',
      ],
      ['Primed', 'The first time, it makes IgE antibodies that coat mast cells, setting a trap.'],
      ['Trigger', 'Next time, the allergen springs the trap: mast cells burst open.'],
      ['Histamine', 'Histamine causes sneezing, itching, hives — or in severe cases, anaphylaxis.'],
    ),
    interaction: cascade(
      'Pollen season! Follow an allergic reaction, then block a step.',
      ['Breathe in pollen (again)', '🌼'],
      [
        [
          'Pollen meets IgE',
          '🔱',
          'Pollen proteins bind IgE antibodies already sitting on mast cells (from earlier sensitization).',
        ],
        [
          'Mast cells burst',
          '💥',
          'Cross-linked IgE triggers mast cells to release their granules.',
          'Mast cell stabilizers (like cromolyn) keep mast cells from bursting, preventing symptoms before they start.',
        ],
        ['Histamine floods out', '🌊', 'Histamine and other chemicals pour into the tissue.'],
        [
          'Histamine hits receptors',
          '🎯',
          'It binds receptors on blood vessels and nerves.',
          'Antihistamines block these receptors: fewer sneezes and itchy eyes.',
        ],
        ['Sneezing, itching, runny nose', '🤧', 'Vessels leak, nerves itch, mucus pours out.'],
      ],
      'Classic hay fever — a powerful defense aimed at a harmless target.',
    ),
    goDeeper:
      'In type I hypersensitivity, initial exposure leads B cells (helped by Th2 cells) to make allergen-specific IgE, which binds Fc receptors on mast cells and basophils (sensitization). On re-exposure, allergen cross-links the IgE, triggering degranulation: histamine, leukotrienes and prostaglandins cause vasodilation, smooth muscle contraction and mucus. Anaphylaxis is a severe body-wide reaction treated with epinephrine (adrenaline) injection.\n\nIn reality, it’s a bit more complicated: allergies have increased in many countries, possibly related to reduced microbial exposure early in life (the “hygiene” or “old friends” hypothesis), though causes are debated. Early, carefully guided introduction of peanut to infants greatly lowers the risk of peanut allergy.',
    quiz: [
      mc(
        'Which antibody type is central to allergies?',
        ['IgA', 'IgE', 'IgG', 'IgM'],
        1,
        'IgE arms mast cells for allergic reactions.',
      ),
      mc(
        'What do antihistamines do?',
        [
          'Kill pollen',
          'Block histamine from binding its receptors',
          'Make more IgE',
          'Cure allergies permanently',
        ],
        1,
        'They block histamine’s effects.',
      ),
      predict(
        'Someone with a severe peanut allergy accidentally eats peanuts and has trouble breathing.',
        'What is the emergency treatment?',
        [
          'An antibiotic',
          'An epinephrine (adrenaline) auto-injector and emergency help',
          'A glass of milk',
          'Waiting it out',
        ],
        1,
        'Epinephrine reverses anaphylaxis quickly.',
      ),
    ],
    relatedConcepts: ['inflammation', 'antibodies', 'autoimmune-disease'],
    funFact:
      'Some people are allergic to the cold — their skin breaks out in hives after touching ice.',
  },
  {
    id: 'autoimmune-disease',
    title: 'Autoimmune Disease',
    category: 'immunology',
    tags: [
      'self-tolerance',
      'type 1 diabetes',
      'multiple sclerosis',
      'rheumatoid arthritis',
      'lupus',
    ],
    aliases: ['autoimmunity', 'immune system attacking itself'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['innate-vs-adaptive'],
    summary: 'Sometimes the immune system mistakes the body’s own cells for invaders.',
    steps: steps(
      ['Self vs not-self', 'Normally immune cells learn to ignore the body’s own molecules.'],
      ['Tolerance breaks', 'In autoimmune disease, some immune cells start attacking “self.”'],
      ['Different targets', 'Which disease you get depends on which tissue is attacked.'],
    ),
    interaction: lockKey(
      'These immune cells have gone rogue. Match each one to the body tissue it mistakenly attacks.',
      [
        ['Pancreas beta cells', 'triangle', '#f59e0b', 'Make insulin'],
        ['Myelin on nerves', 'wave', '#6366f1', 'Insulates neurons'],
        ['Joint lining', 'square', '#ef4444', 'Cushions joints'],
        ['Thyroid gland', 'hexagon', '#0ea5e9', 'Makes thyroid hormone'],
      ],
      [
        [
          'Type 1 diabetes T cells',
          'triangle',
          '#f59e0b',
          0,
          'They destroy the insulin-making cells. No insulin is made.',
        ],
        [
          'Multiple sclerosis T cells',
          'wave',
          '#6366f1',
          1,
          'They strip myelin, slowing nerve signals.',
        ],
        [
          'Rheumatoid arthritis cells',
          'square',
          '#ef4444',
          2,
          'They inflame joint linings, causing pain and swelling.',
        ],
        [
          'Hashimoto’s antibodies',
          'hexagon',
          '#0ea5e9',
          3,
          'They damage the thyroid, causing an underactive thyroid.',
        ],
        [
          'Normal T cell',
          'star',
          '#22c55e',
          null,
          'A healthy T cell ignores the body’s own tissues — it was trained not to attack self.',
        ],
      ],
    ),
    goDeeper:
      'Central tolerance deletes most self-reactive lymphocytes in the thymus and bone marrow; peripheral tolerance (regulatory T cells, anergy) restrains those that escape. Autoimmunity arises from a mix of genetic risk (especially certain HLA types), environmental triggers (infections, smoking, possibly microbiome changes) and chance. Examples: type 1 diabetes, multiple sclerosis, rheumatoid arthritis, lupus, celiac disease, Graves’ and Hashimoto’s thyroid diseases. About 80% of people with autoimmune diseases are women.\n\nIn reality, it’s a bit more complicated: many autoimmune diseases involve both T cells and antibodies, and some (like lupus) attack many tissues at once. Treatments range from replacing what’s lost (insulin, thyroid hormone) to drugs that calm specific parts of the immune system.',
    quiz: [
      mc(
        'What happens in an autoimmune disease?',
        [
          'Germs attack the immune system',
          'The immune system attacks the body’s own tissues',
          'Antibodies disappear',
          'The body makes too few white cells',
        ],
        1,
        'Self-tolerance breaks down.',
      ),
      mc(
        'Type 1 diabetes is caused by immune attack on…',
        ['The liver', 'Insulin-making beta cells in the pancreas', 'The kidneys', 'Muscle cells'],
        1,
        'The beta cells are destroyed, so no insulin is made.',
      ),
      predict(
        'A person’s immune cells attack the myelin around their nerves.',
        'What might they experience?',
        [
          'Better reflexes',
          'Problems with movement, vision or sensation as signals slow',
          'Faster growth',
          'More energy',
        ],
        1,
        'This is multiple sclerosis.',
      ),
    ],
    relatedConcepts: ['thymus-training', 'insulin', 'myelin', 'allergies'],
    funFact: 'There are more than 80 known autoimmune diseases.',
  },
  {
    id: 'herd-immunity',
    title: 'Herd Immunity',
    category: 'immunology',
    tags: ['vaccination', 'R0', 'outbreaks', 'public health', 'epidemics'],
    aliases: ['community immunity', 'herd protection', 'vaccination threshold'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['vaccines'],
    summary:
      'When enough people are immune, a disease can’t spread — protecting even those who can’t be vaccinated.',
    steps: steps(
      ['Chains of infection', 'Diseases spread from person to person in chains.'],
      ['Broken links', 'Each immune person is a broken link in the chain.'],
      ['The threshold', 'When enough links are broken, outbreaks fizzle out.'],
      ['Protecting others', 'This shields babies and people who can’t get vaccines.'],
    ),
    interaction: slider({
      prompt:
        'Set how contagious a disease is (R₀) and how many people are vaccinated. Can you stop the outbreak?',
      inputs: [
        {
          id: 'r0',
          label: 'R₀ (people infected by one sick person)',
          min: 1,
          max: 18,
          step: 0.5,
          start: 3,
        },
        { id: 'vax', label: 'Vaccinated', unit: '%', min: 0, max: 100, step: 1, start: 30 },
      ],
      output: {
        label: 'Population infected in an outbreak',
        unit: '%',
        max: 100,
        expr: 'clamp(100 * (1 - exp(-1.6 * (r0 * (1 - vax / 100) - 1))), 0, 100) * (1 - vax / 100)',
      },
      readouts: [
        { label: 'Effective R', expr: 'r0 * (1 - vax / 100)' },
        { label: 'Herd immunity threshold', unit: '% vaccinated', expr: '100 * (1 - 1 / r0)' },
      ],
      graphInput: 'vax',
      visual: { kind: 'particles', emoji: '🤒' },
      challenges: [
        {
          prompt:
            'Measles (set R₀ to about 15): find a vaccination rate that stops the outbreak (under 1% infected).',
          target: { max: 1 },
          explain: 'Measles needs about 93–95% immunity because it is so contagious.',
        },
        {
          prompt: 'Let a big outbreak happen (over 60% infected).',
          target: { min: 60 },
          explain: 'With few people immune, a contagious disease sweeps through the population.',
        },
      ],
    }),
    goDeeper:
      'The basic reproduction number R₀ is the average number of new infections from one case in a fully susceptible population. The effective reproduction number is R = R₀ × (fraction susceptible). If R < 1, outbreaks die out. The herd immunity threshold is approximately 1 − 1/R₀: about 93–95% for measles (R₀ 12–18), about 80% for polio, lower for flu. Smallpox was eradicated in 1980 through vaccination.\n\nIn reality, it’s a bit more complicated: the outbreak-size formula here is an approximation of the classic final-size relation, and real populations aren’t evenly mixed — pockets of low vaccination can sustain outbreaks even when the national average is high. Vaccine effectiveness, waning immunity and new variants also shift the threshold.',
    quiz: [
      mc(
        'What is herd immunity?',
        [
          'When animals get vaccines',
          'When enough people are immune that a disease can’t spread easily',
          'When everyone gets sick at once',
          'A type of antibody',
        ],
        1,
        'Immune people break transmission chains.',
      ),
      predict(
        'A disease has R₀ = 4. About what fraction must be immune to stop it?',
        'Choose the closest:',
        ['25%', '50%', '75%', '100%'],
        2,
        '1 − 1/4 = 0.75, so about 75%.',
      ),
      mc(
        'Why does herd immunity protect newborn babies?',
        [
          'Babies are born immune to everything',
          'Fewer infected people around means fewer chances for the baby to catch it',
          'Babies can’t catch diseases',
          'Vaccines are given before birth to everyone',
        ],
        1,
        'The disease can’t reach them through the immune people around them.',
      ),
    ],
    relatedConcepts: ['vaccines', 'pandemics-r0', 'antibodies'],
    funFact:
      'Smallpox, which killed hundreds of millions of people, was declared eradicated in 1980 — the first human disease wiped out by vaccination.',
  },
  {
    id: 'thymus-training',
    title: 'T-Cell Training in the Thymus',
    category: 'immunology',
    tags: ['thymus', 'T cells', 'positive selection', 'negative selection', 'self-tolerance'],
    aliases: ['thymus', 'T cell education', 'positive and negative selection'],
    difficulty: 4,
    rarity: 'obscure',
    prerequisites: ['white-blood-cells'],
    summary: 'Young T cells go to boot camp in the thymus, and most of them fail.',
    steps: steps(
      [
        'Random receptors',
        'Each new T cell builds a random receptor that could recognize almost anything.',
      ],
      [
        'Test 1: can you see?',
        'T cells must recognize the body’s MHC “display stands” — or they die.',
      ],
      [
        'Test 2: don’t attack home',
        'T cells that react strongly to the body’s own proteins are destroyed.',
      ],
      ['Graduation', 'Only a small fraction pass both tests and leave to patrol the body.'],
    ),
    interaction: sorting(
      'You’re the thymus examiner. Decide each young T cell’s fate.',
      [
        ['Graduates', '🎓', 'Sees MHC, ignores self'],
        ['Fails: can’t see MHC', '🙈', 'Useless — dies by neglect'],
        ['Fails: attacks self', '⚠️', 'Dangerous — deleted'],
      ],
      [
        [
          'Binds MHC weakly with self proteins',
          '👍',
          0,
          'Just right: it can work with MHC but won’t attack the body.',
        ],
        [
          'Doesn’t bind MHC at all',
          '🫥',
          1,
          'It could never recognize infected cells, so it dies by neglect (failed positive selection).',
        ],
        [
          'Binds strongly to insulin on MHC',
          '🚫',
          2,
          'It would attack the body’s own cells — deleted (negative selection).',
        ],
        [
          'Binds strongly to a muscle protein on MHC',
          '💪',
          2,
          'Self-reactive: removed to prevent autoimmunity.',
        ],
        [
          'Binds MHC weakly, strongly to a flu protein later',
          '🦠',
          0,
          'Perfect — it graduates and can later fight flu.',
        ],
        ['Receptor that doesn’t fold right', '🧩', 1, 'Can’t recognize anything, so it fails.'],
      ],
    ),
    goDeeper:
      'T cell precursors from bone marrow mature in the thymus. Positive selection in the cortex keeps T cells whose receptors bind self-MHC with low-to-moderate affinity (MHC restriction). Negative selection in the medulla deletes those that bind self-peptide–MHC strongly; the AIRE protein lets thymic cells display proteins from all over the body (even insulin) to test against. Only a few percent of thymocytes survive. Some self-reactive cells become regulatory T cells instead of being deleted.\n\nIn reality, it’s a bit more complicated: the thymus shrinks after puberty and is largely replaced by fat in older adults, though it keeps some function. Mutations in AIRE cause a rare syndrome where many organs are attacked by the immune system.',
    quiz: [
      mc(
        'What happens to T cells that strongly attack the body’s own proteins?',
        [
          'They graduate',
          'They are deleted',
          'They become red blood cells',
          'They make antibodies',
        ],
        1,
        'Negative selection removes self-reactive T cells.',
      ),
      mc(
        'Roughly how many young T cells pass thymus training?',
        ['Almost all', 'About half', 'Only a small percentage', 'None'],
        2,
        'Most fail one test or the other.',
      ),
      predict(
        'A mutation lets self-reactive T cells escape the thymus.',
        'What risk increases?',
        [
          'Allergies to pollen only',
          'Autoimmune disease',
          'Bacterial resistance',
          'Faster healing',
        ],
        1,
        'Self-reactive T cells can attack body tissues.',
      ),
    ],
    relatedConcepts: ['autoimmune-disease', 'white-blood-cells', 'innate-vs-adaptive'],
    funFact: 'The thymus is largest during childhood and slowly shrinks after puberty.',
  },
  {
    id: 'cytokine-storm',
    title: 'Cytokine Storms',
    category: 'immunology',
    tags: ['cytokines', 'positive feedback', 'inflammation', 'sepsis', 'immune overreaction'],
    aliases: ['cytokine release syndrome', 'immune overreaction', 'hypercytokinemia'],
    difficulty: 4,
    rarity: 'obscure',
    prerequisites: ['inflammation'],
    summary:
      'Immune signals can spiral out of control, causing more harm than the infection itself.',
    steps: steps(
      ['Chemical alarms', 'Immune cells shout to each other using cytokines.'],
      ['Positive feedback', 'Cytokines recruit more cells, which release more cytokines.'],
      ['Brakes', 'Normally, calming signals keep the response in check.'],
      [
        'Storm',
        'If the brakes fail, cytokines flood the body, causing high fever and organ damage.',
      ],
    ),
    interaction: {
      template: 'feed-and-observe',
      config: {
        prompt: 'Trigger an immune response and watch the cytokine level. Then remove the brakes.',
        subject: { emoji: '🛡️', label: 'Immune system' },
        meters: [
          {
            id: 'cyto',
            label: 'Cytokine level',
            unit: '%',
            min: 0,
            max: 100,
            start: 10,
            healthy: [0, 55],
            color: '#ef4444',
          },
        ],
        items: [
          {
            id: 'infection',
            label: 'Viral infection',
            emoji: '🦠',
            note: 'Infected cells sound the alarm.',
            effects: [{ meter: 'cyto', amount: 25, seconds: 4 }],
          },
          {
            id: 'severe',
            label: 'Severe infection',
            emoji: '☣️',
            note: 'A big infection triggers a big alarm.',
            effects: [{ meter: 'cyto', amount: 40, seconds: 4 }],
          },
          {
            id: 'treat',
            label: 'Anti-inflammatory drug',
            emoji: '💊',
            note: 'Doctors can block key cytokines (like IL-6).',
            effects: [{ meter: 'cyto', amount: -30, seconds: 4 }],
          },
        ],
        responses: [
          {
            id: 'amplify',
            label: 'More cells recruited (positive feedback)',
            emoji: '📢',
            when: { meter: 'cyto', above: 30 },
            effect: { meter: 'cyto', perSecond: 3 },
            message: 'Cytokines call in more immune cells, which release even more cytokines…',
          },
          {
            id: 'brake',
            label: 'Regulatory brakes',
            emoji: '🛑',
            when: { meter: 'cyto', above: 20 },
            effect: { meter: 'cyto', perSecond: -5 },
            message:
              'Regulatory T cells and calming cytokines (like IL-10) pull the response back down.',
          },
        ],
        modes: [
          {
            id: 'normal',
            label: 'Healthy regulation',
            description:
              'Brakes are stronger than the feedback loop: the response stays controlled.',
          },
          {
            id: 'storm',
            label: 'Brakes failing',
            description: 'Weak brakes: the feedback loop runs away into a storm!',
            responseScale: { brake: 0.3 },
          },
        ],
        goal: { feeds: 3, tryAllModes: true },
      },
    },
    goDeeper:
      'Cytokines (interleukins, interferons, TNF and chemokines) coordinate immune responses. In a cytokine storm (cytokine release syndrome), positive feedback between activated immune cells floods the body with cytokines such as IL-6, IL-1 and TNF-α, causing high fever, leaky blood vessels, low blood pressure and organ failure. It can occur in severe infections (some influenza strains, severe COVID-19, sepsis), after CAR-T cancer therapy, and in rare genetic conditions. Treatments include IL-6 receptor blockers (tocilizumab) and corticosteroids.\n\nIn reality, it’s a bit more complicated: the term is used loosely, and researchers debate how much of severe disease is caused by cytokine levels versus other factors. Immune responses balance on a knife edge — too weak and the infection wins, too strong and the response itself causes harm.',
    quiz: [
      mc(
        'What makes a cytokine storm spiral out of control?',
        [
          'Negative feedback',
          'Positive feedback between immune cells and cytokines',
          'Too few white blood cells',
          'Cold temperatures',
        ],
        1,
        'More cytokines recruit more cells that release more cytokines.',
      ),
      predict(
        'A patient’s regulatory “brakes” on inflammation aren’t working during a severe flu.',
        'What is the risk?',
        [
          'A milder infection',
          'A runaway immune reaction that damages organs',
          'Faster vaccine response',
          'No fever',
        ],
        1,
        'Unchecked cytokines can harm the body.',
      ),
      mc(
        'Why can an immune response be harmful?',
        [
          'It never is',
          'An overreaction can damage the body’s own tissues',
          'It always makes germs stronger',
          'Immune cells eat food',
        ],
        1,
        'Balance matters: too much response causes damage.',
      ),
    ],
    relatedConcepts: ['inflammation', 'fever', 'hormones-feedback'],
    funFact:
      'Some deaths in the 1918 flu pandemic, which hit young adults hard, may have involved cytokine storms.',
  },
  {
    id: 'complement-system',
    title: 'The Complement System',
    category: 'immunology',
    tags: ['complement', 'membrane attack complex', 'opsonization', 'innate immunity', 'cascade'],
    aliases: ['complement cascade', 'membrane attack complex', 'MAC', 'C3'],
    difficulty: 5,
    rarity: 'obscure',
    prerequisites: ['innate-vs-adaptive', 'blood-clotting'],
    summary: 'A cascade of blood proteins that tags germs for eating and punches holes in them.',
    steps: steps(
      ['Proteins on patrol', 'About 30 complement proteins float in your blood, switched off.'],
      ['Domino effect', 'When one finds a microbe, it activates the next, and so on — a cascade.'],
      ['Tag and attract', 'Pieces coat the germ (“eat me!”) and call in white blood cells.'],
      ['Punch holes', 'The final proteins assemble a pore that pokes holes in the germ.'],
    ),
    interaction: cascade(
      'A bacterium is in the blood. Start the complement cascade, then break a link.',
      ['Bacterium enters the blood', '🦠'],
      [
        [
          'C3 sticks to the bacterium',
          '📌',
          'C3 splits and its piece C3b sticks to the bacterium’s surface.',
          'With C3 missing (a rare deficiency), almost nothing downstream works — people get repeated severe infections.',
        ],
        [
          'Tagged for eating (opsonization)',
          '🍽️',
          'C3b coats the germ, making it easy for macrophages and neutrophils to grab.',
        ],
        ['C5 convertase forms', '⚙️', 'Enzyme complexes build up, amplifying the cascade.'],
        [
          'Alarm signals released',
          '📢',
          'Fragments C3a and C5a attract white blood cells and boost inflammation.',
        ],
        [
          'Membrane attack complex',
          '🕳️',
          'C5b–C9 assemble into a ring that punches a hole in the bacterium.',
          'Without C9 or the attack complex, some bacteria (like Neisseria) slip through, causing serious infections.',
        ],
        ['Bacterium bursts', '💥', 'Water rushes in through the pore and the bacterium dies.'],
      ],
      'Destroyed! Complement tagged, attracted and punctured — all within minutes.',
    ),
    goDeeper:
      'Complement can be activated by three pathways: classical (antibody–antigen complexes binding C1q), lectin (mannose-binding lectin on microbial sugars) and alternative (spontaneous C3 activation on unprotected surfaces). All converge on C3 convertase, which generates C3b (opsonin) and C3a, then C5 convertase, which produces C5a (a potent chemoattractant) and C5b, initiating the membrane attack complex (C5b-9). Host cells protect themselves with regulators like CD55 and CD59.\n\nIn reality, it’s a bit more complicated: the steps happen as an amplifying network, not a single line, and complement is also involved in clearing immune complexes and even pruning synapses in the developing brain. Overactive complement contributes to diseases such as some kidney disorders and age-related macular degeneration.',
    quiz: [
      mc(
        'What does the membrane attack complex do?',
        ['Makes antibodies', 'Punches holes in microbes', 'Carries oxygen', 'Copies DNA'],
        1,
        'It forms a pore that bursts the microbe.',
      ),
      mc(
        'What is opsonization?',
        [
          'Coating a germ so phagocytes can eat it easily',
          'Making a fever',
          'Killing viruses with acid',
          'Building a blood clot',
        ],
        0,
        'C3b “tags” germs for eating.',
      ),
      predict(
        'A person is born without C3.',
        'What problem are they likely to have?',
        [
          'Too many red blood cells',
          'Frequent serious bacterial infections',
          'Extra-strong bones',
          'No problems',
        ],
        1,
        'C3 is central to all complement pathways.',
      ),
    ],
    relatedConcepts: ['innate-vs-adaptive', 'antibodies', 'blood-clotting', 'inflammation'],
    funFact:
      'Complement got its name because it “complements” the bacteria-killing power of antibodies.',
  },
];
