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
  zoom,
} from './helpers';

export const physiologyLibrary: Concept[] = [
  {
    id: 'heart-circulation',
    title: 'The Heart & Circulation',
    category: 'physiology',
    tags: ['heart', 'blood vessels', 'arteries', 'veins', 'double circulation', 'oxygen'],
    aliases: ['circulatory system', 'how the heart works', 'blood flow', 'double circulation'],
    difficulty: 2,
    rarity: 'common',
    summary:
      'Your heart is two pumps side by side: one sends blood to the lungs, the other to everything else.',
    steps: steps(
      ['Four rooms', 'The heart has two atria (top) and two ventricles (bottom).'],
      [
        'Right side → lungs',
        'The right side pumps oxygen-poor blood to the lungs to pick up oxygen.',
      ],
      ['Left side → body', 'The left side pumps oxygen-rich blood out to the whole body.'],
      ['One-way valves', 'Valves stop blood flowing backward — they make the “lub-dub” sound.'],
    ),
    interaction: assembly(
      'Follow one red blood cell around the body: put the stops in order.',
      [
        ['Right atrium', '🫀', 'Oxygen-poor blood returns from the body.'],
        ['Right ventricle', '💪', 'Pumps blood to the lungs.'],
        ['Lungs', '🫁', 'Blood drops off CO₂ and picks up oxygen.'],
        ['Left atrium', '🫀', 'Oxygen-rich blood returns from the lungs.'],
        ['Left ventricle', '💪', 'The strongest chamber pumps blood out through the aorta.'],
        ['Body tissues', '🧍', 'Cells take oxygen and give back CO₂. Then back to the start!'],
      ],
      'One lap complete! A red blood cell makes this trip in about a minute when you’re resting.',
      {
        layout: 'cycle',
        distractors: [
          [
            'Stomach',
            '🫃',
            'Blood visits the stomach as part of the body loop, but it’s not a stop on the heart’s route.',
          ],
        ],
      },
    ),
    goDeeper:
      'Mammals have double circulation: the pulmonary circuit (right ventricle → pulmonary artery → lungs → pulmonary veins → left atrium) and the systemic circuit (left ventricle → aorta → body → venae cavae → right atrium). Arteries carry blood away from the heart under high pressure; veins return it at low pressure with valves; capillaries are where exchange happens. The heartbeat is set by the sinoatrial node, the heart’s natural pacemaker.\n\nIn reality, it’s a bit more complicated: “arteries carry oxygen-rich blood” is not always true — the pulmonary artery carries oxygen-poor blood to the lungs. Both sides of the heart beat at the same time; the steps here follow one cell, not the order of contractions.',
    quiz: [
      mc(
        'Which chamber pumps blood to the whole body?',
        ['Right atrium', 'Right ventricle', 'Left ventricle', 'Left atrium'],
        2,
        'The muscular left ventricle pumps blood into the aorta.',
      ),
      label(
        'Match each part of the heart to its job.',
        [
          ['Right ventricle', 'Pumps blood to the lungs'],
          ['Left ventricle', 'Pumps blood to the whole body'],
          ['Valves', 'Stop blood flowing backward'],
        ],
        'Two pumps plus one-way doors.',
      ),
      predict(
        'A heart valve doesn’t close properly.',
        'What happens?',
        [
          'Blood leaks backward, so the heart must work harder',
          'Blood flows faster with no problems',
          'The heart stops instantly',
          'Blood turns blue',
        ],
        0,
        'Leaky valves let blood slosh backward (a murmur).',
      ),
    ],
    relatedConcepts: ['breathing', 'blood-clotting', 'muscle-contraction'],
    funFact:
      'If you laid out all your blood vessels end to end, they would stretch about 100,000 km — over twice around the Earth.',
  },
  {
    id: 'breathing',
    title: 'Breathing & Gas Exchange',
    category: 'physiology',
    tags: ['lungs', 'alveoli', 'oxygen', 'carbon dioxide', 'diaphragm', 'respiration'],
    aliases: ['respiratory system', 'how lungs work', 'alveoli', 'gas exchange'],
    difficulty: 2,
    rarity: 'common',
    summary:
      'Your lungs are packed with millions of tiny balloons where oxygen and CO₂ swap places.',
    steps: steps(
      ['Breathe in', 'The diaphragm pulls down, the chest expands, and air rushes in.'],
      ['Branching tubes', 'Air travels down the trachea into ever-smaller branches.'],
      ['Tiny balloons', 'At the ends are alveoli, wrapped in capillaries.'],
      ['The swap', 'Oxygen diffuses into the blood; carbon dioxide diffuses out to be exhaled.'],
    ),
    interaction: zoom({
      prompt: 'Zoom from the chest down to where oxygen enters your blood.',
      levels: [
        {
          id: 'chest',
          label: 'Chest',
          scale: '30 cm',
          background: '#eff6ff',
          description: 'Two lungs fill most of your chest, with the heart nestled between them.',
          elements: [em('lungs', '🫁', 50, 50, 5.5)],
          hotspots: [
            {
              id: 'diaph',
              x: 50,
              y: 88,
              label: 'Diaphragm',
              text: 'This dome-shaped muscle flattens when you breathe in, pulling air into the lungs.',
            },
            {
              id: 'bronchi',
              x: 66,
              y: 40,
              label: 'Bronchi',
              text: 'The windpipe splits into two bronchi, then branches about 23 times.',
              zoomTo: 'alveoli',
            },
          ],
        },
        {
          id: 'alveoli',
          label: 'Alveoli',
          scale: '1 mm',
          background: '#fdf2f8',
          description: 'Bunches of tiny air sacs, like grapes, each wrapped in blood vessels.',
          elements: [
            ...[
              [35, 40],
              [50, 32],
              [65, 40],
              [42, 58],
              [58, 58],
            ].map(([x, y], i) => sh(`a${i}`, 'circle', '#fbcfe8', x, y, 1.6)),
            sh('cap', 'wave', '#ef4444', 50, 78, 5),
          ],
          hotspots: [
            {
              id: 'sac',
              x: 50,
              y: 22,
              label: 'Alveolus',
              text: 'You have about 300–500 million alveoli, giving a surface area roughly the size of a tennis court.',
              zoomTo: 'wall',
            },
            {
              id: 'cap',
              x: 78,
              y: 82,
              label: 'Capillaries',
              text: 'Blood vessels so narrow that red blood cells pass in single file.',
            },
          ],
        },
        {
          id: 'wall',
          label: 'The barrier',
          scale: '0.001 mm',
          background: '#fff7ed',
          description: 'The wall between air and blood is thinner than a soap bubble.',
          elements: [
            sh('air', 'rect', '#e0f2fe', 25, 50, 3.5, { opacity: 0.8, label: 'air' }),
            sh('blood', 'rect', '#fecaca', 75, 50, 3.5, { opacity: 0.8, label: 'blood' }),
            sh('o2', 'circle', '#3b82f6', 42, 38, 0.5, { label: 'O₂ →' }),
            sh('co2', 'circle', '#64748b', 58, 64, 0.5, { label: '← CO₂' }),
          ],
          hotspots: [
            {
              id: 'o2',
              x: 42,
              y: 26,
              label: 'Oxygen in',
              text: 'Oxygen is more concentrated in the air, so it diffuses into the blood and onto hemoglobin.',
            },
            {
              id: 'co2',
              x: 58,
              y: 80,
              label: 'CO₂ out',
              text: 'CO₂ is more concentrated in the blood, so it diffuses into the air to be breathed out.',
            },
          ],
        },
      ],
    }),
    goDeeper:
      'Inhalation is active: the diaphragm and external intercostal muscles enlarge the chest, lowering pressure so air flows in. Quiet exhalation is mostly passive recoil. Gas exchange happens by diffusion across the alveolar-capillary membrane (about 0.5 µm thick), driven by partial-pressure differences. Surfactant prevents alveoli from collapsing. Breathing rate is controlled mainly by CO₂ levels sensed in the brainstem, not oxygen.\n\nIn reality, it’s a bit more complicated: most CO₂ travels in blood as bicarbonate, not as dissolved gas, and is converted back to CO₂ in the lungs. The urge to breathe when you hold your breath comes from rising CO₂, which is why hyperventilating before diving is dangerous — it lowers CO₂ without adding much oxygen.',
    quiz: [
      mc(
        'Where does gas exchange happen in the lungs?',
        ['Trachea', 'Alveoli', 'Diaphragm', 'Nose'],
        1,
        'Alveoli are the tiny sacs where O₂ and CO₂ swap.',
      ),
      mc(
        'What makes you feel the urge to breathe?',
        ['Low oxygen only', 'Rising carbon dioxide', 'A full stomach', 'Bright light'],
        1,
        'CO₂ buildup is the main trigger.',
      ),
      predict(
        'A disease thickens the walls of the alveoli.',
        'What happens to oxygen getting into the blood?',
        [
          'It gets faster',
          'It slows, because diffusion through a thicker wall is harder',
          'Nothing',
          'The blood makes its own oxygen',
        ],
        1,
        'Diffusion slows across a thicker barrier.',
      ),
    ],
    relatedConcepts: ['heart-circulation', 'cell-membrane', 'ph-buffers'],
    funFact:
      'Your lungs’ alveoli spread out would cover roughly 50–75 square meters, about a third of a tennis court.',
  },
  {
    id: 'liver',
    title: 'The Liver',
    category: 'physiology',
    tags: ['detox', 'bile', 'glycogen', 'metabolism', 'organ', 'regeneration'],
    aliases: ['what the liver does', 'liver function', 'detoxification'],
    difficulty: 2,
    rarity: 'common',
    summary: 'Your liver is a chemical factory with hundreds of jobs — and it can regrow itself.',
    steps: steps(
      ['Biggest internal organ', 'The liver sits under your right ribs and weighs about 1.5 kg.'],
      [
        'Processing plant',
        'Blood from your gut goes to the liver first, so it can process nutrients and toxins.',
      ],
      [
        'Many jobs',
        'It stores sugar, makes bile and blood proteins, and breaks down drugs and alcohol.',
      ],
    ),
    interaction: sorting(
      'Is each job done by the liver, or by another organ?',
      [
        ['Liver’s job', '🟤', 'Done by the liver'],
        ['Another organ', '🔁', 'Not the liver'],
      ],
      [
        ['Make bile to digest fats', '🧴', 0, 'The liver makes bile; the gallbladder stores it.'],
        [
          'Store glycogen',
          '🍬',
          0,
          'The liver stores sugar as glycogen and releases it when blood sugar drops.',
        ],
        ['Break down alcohol and drugs', '🍷', 0, 'Liver enzymes detoxify many chemicals.'],
        ['Make clotting proteins', '🩹', 0, 'Most clotting factors are made in the liver.'],
        ['Make insulin', '🔑', 1, 'Insulin is made by the pancreas.'],
        ['Pump blood', '🫀', 1, 'That’s the heart.'],
        ['Filter blood into urine', '💧', 1, 'Kidneys make urine.'],
        [
          'Turn ammonia into urea',
          '♻️',
          0,
          'The liver converts toxic ammonia into urea, which the kidneys excrete.',
        ],
      ],
    ),
    goDeeper:
      'The liver receives about 25% of cardiac output, mostly via the hepatic portal vein carrying nutrient-rich blood from the intestines. Hepatocytes perform carbohydrate metabolism (glycogen storage, gluconeogenesis), lipid metabolism (cholesterol, lipoproteins), protein synthesis (albumin, clotting factors), detoxification (cytochrome P450 enzymes), bile production and the urea cycle. It can regenerate from as little as about 25–30% of its tissue, which makes living-donor liver transplants possible.\n\nIn reality, it’s a bit more complicated: “detox” products and cleanses aren’t needed — a healthy liver and kidneys already do this. Long-term heavy drinking, viral hepatitis and fatty liver disease can cause scarring (cirrhosis), which the liver cannot fully regenerate from.',
    quiz: [
      mc(
        'Which organ makes insulin?',
        ['The liver', 'The pancreas', 'The kidney', 'The heart'],
        1,
        'Insulin comes from the pancreas; the liver responds to it.',
      ),
      mc(
        'Why does blood from the intestines go to the liver first?',
        [
          'To get oxygen',
          'So the liver can process nutrients and toxins before they reach the body',
          'To be pumped',
          'To make urine',
        ],
        1,
        'The hepatic portal vein routes gut blood through the liver.',
      ),
      predict(
        'A surgeon removes half of a healthy donor’s liver for a transplant.',
        'What happens to the donor’s liver?',
        [
          'It stays half-sized forever',
          'It regrows close to full size within months',
          'It stops working',
          'It turns into a kidney',
        ],
        1,
        'The liver can regenerate lost tissue.',
      ),
    ],
    relatedConcepts: ['insulin', 'digestion', 'kidneys'],
    funFact:
      'The liver is the only internal organ that can regenerate itself — even from just a quarter of its original size.',
  },
  {
    id: 'hormones-feedback',
    title: 'Hormones & Feedback Loops',
    category: 'physiology',
    tags: ['endocrine system', 'negative feedback', 'thyroid', 'pituitary', 'hypothalamus'],
    aliases: ['negative feedback', 'endocrine system', 'thyroid hormone', 'homeostasis'],
    difficulty: 2,
    rarity: 'common',
    summary: 'Hormones are chemical messages, and feedback loops keep them from going overboard.',
    steps: steps(
      ['Chemical messages', 'Glands release hormones into the blood to deliver instructions.'],
      [
        'A chain of command',
        'The hypothalamus tells the pituitary, which tells other glands what to do.',
      ],
      [
        'Negative feedback',
        'When there’s enough hormone, it signals back to slow its own production — like a thermostat.',
      ],
    ),
    interaction: cascade(
      'Run the thyroid hormone chain of command. Then break a link to see a thyroid disorder.',
      ['Body needs more energy', '⚡'],
      [
        [
          'Hypothalamus releases TRH',
          '🧠',
          'The hypothalamus senses low thyroid hormone and sends TRH.',
        ],
        [
          'Pituitary releases TSH',
          '📣',
          'The pituitary gland responds by releasing TSH into the blood.',
        ],
        [
          'Thyroid makes T3/T4',
          '🦋',
          'The thyroid gland in your neck releases thyroid hormones.',
          'An underactive thyroid can’t respond: TSH climbs higher and higher while T3/T4 stay low (hypothyroidism) — tiredness, feeling cold.',
        ],
        ['Cells speed up', '🔥', 'Thyroid hormone raises metabolism in cells all over the body.'],
        [
          'Feedback: “enough!”',
          '🛑',
          'Rising thyroid hormone tells the hypothalamus and pituitary to ease off.',
          'Without feedback, hormone keeps rising out of control — like a thermostat that never turns the heater off.',
        ],
      ],
      'Balanced! Negative feedback keeps thyroid hormone in a healthy range.',
    ),
    goDeeper:
      'The endocrine system includes the hypothalamus, pituitary, thyroid, parathyroids, adrenals, pancreas, ovaries and testes. The hypothalamic-pituitary-thyroid axis is a classic negative feedback loop: TRH → TSH → T4/T3, with T3/T4 inhibiting TRH and TSH release. Doctors measure TSH to check thyroid function: high TSH with low T4 suggests hypothyroidism. Positive feedback loops also exist but are rarer — for example, oxytocin during childbirth intensifies contractions until the baby is born.\n\nIn reality, it’s a bit more complicated: most T4 is converted to the more active T3 inside tissues, and many hormones interact (cortisol, for instance, affects thyroid signaling). Iodine is essential for making thyroid hormone, which is why it’s added to table salt in many countries.',
    quiz: [
      mc(
        'What is negative feedback?',
        [
          'When a hormone boosts its own release forever',
          'When a result reduces the signal that caused it',
          'When hormones stop being made',
          'When the body ignores hormones',
        ],
        1,
        'Negative feedback keeps levels stable, like a thermostat.',
      ),
      predict(
        'A person’s thyroid gland stops responding to TSH.',
        'What happens to their TSH level?',
        [
          'It drops to zero',
          'It rises, because the brain keeps asking for more thyroid hormone',
          'It stays exactly the same',
          'It turns into insulin',
        ],
        1,
        'With no thyroid hormone to shut it off, TSH climbs.',
      ),
      mc(
        'Which is an example of POSITIVE feedback?',
        [
          'Body temperature control',
          'Blood sugar control',
          'Contractions during childbirth',
          'Thyroid hormone control',
        ],
        2,
        'Oxytocin boosts contractions, which release more oxytocin, until birth.',
      ),
    ],
    relatedConcepts: ['insulin', 'thermoregulation', 'cell-signaling'],
    funFact:
      'Adding iodine to salt in the 1920s almost eliminated goiter (a swollen thyroid) in many countries.',
  },
  {
    id: 'muscle-contraction',
    title: 'Muscle Contraction',
    category: 'physiology',
    tags: ['sliding filament', 'actin', 'myosin', 'calcium', 'ATP', 'rigor mortis'],
    aliases: ['sliding filament theory', 'how muscles work', 'actin and myosin', 'rigor mortis'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['atp'],
    summary:
      'Muscles contract when millions of tiny myosin “oars” pull actin ropes, powered by ATP.',
    steps: steps(
      ['Filaments', 'Muscle fibers contain thick myosin and thin actin filaments overlapping.'],
      ['The signal', 'A nerve signal releases calcium inside the muscle fiber.'],
      ['Grab and pull', 'Calcium uncovers binding sites; myosin heads grab actin and pull.'],
      ['Let go', 'ATP makes myosin let go and re-cock, ready for the next pull.'],
    ),
    interaction: cascade(
      'Send a nerve signal and watch the filaments slide. Then break a link.',
      ['Nerve signal arrives', '⚡'],
      [
        [
          'Acetylcholine released',
          '🧪',
          'The motor neuron releases acetylcholine onto the muscle fiber.',
        ],
        [
          'Calcium floods in',
          '🌊',
          'An electrical wave triggers the release of calcium from storage.',
          'If calcium isn’t released, binding sites stay covered and the muscle can’t contract at all.',
        ],
        [
          'Binding sites exposed',
          '🔓',
          'Calcium binds troponin, which shifts tropomyosin off the actin binding sites.',
        ],
        [
          'Myosin pulls (power stroke)',
          '🚣',
          'Myosin heads grab actin and pull it toward the center — the muscle shortens.',
        ],
        [
          'ATP releases myosin',
          '🔋',
          'A new ATP makes each myosin head let go and re-cock.',
          'No ATP: myosin can’t let go, so muscles lock rigid. This is rigor mortis after death.',
        ],
        ['Relax', '😌', 'When signals stop, calcium is pumped away and the muscle relaxes.'],
      ],
      'Contraction complete — repeated thousands of times per second across your muscles.',
    ),
    goDeeper:
      'Skeletal muscle is organized into sarcomeres, the repeating units between Z-discs. In the sliding filament model (Huxley and Huxley, 1954), filaments don’t shorten; they slide past each other. Excitation–contraction coupling: an action potential spreads along T-tubules, causing the sarcoplasmic reticulum to release Ca²⁺; Ca²⁺ binds troponin C, moving tropomyosin; myosin forms cross-bridges, performs the power stroke (releasing ADP + Pᵢ), and binds new ATP to detach.\n\nIn reality, it’s a bit more complicated: ATP is also needed to pump calcium back into storage so muscles can relax. Cardiac and smooth muscle use variations on the same theme — smooth muscle, for example, uses calmodulin rather than troponin to respond to calcium.',
    quiz: [
      mc(
        'What do myosin heads pull on?',
        ['Actin filaments', 'Bones directly', 'DNA', 'Blood vessels'],
        0,
        'Myosin pulls actin, sliding the filaments together.',
      ),
      predict(
        'After death, cells can no longer make ATP.',
        'What happens to the muscles?',
        [
          'They become floppy immediately',
          'They lock stiff because myosin can’t let go of actin',
          'They contract and relax forever',
          'They turn into fat',
        ],
        1,
        'Without ATP, cross-bridges can’t release — rigor mortis.',
      ),
      mc(
        'What triggers myosin to bind actin?',
        ['Sugar', 'Calcium exposing the binding sites', 'Oxygen', 'Water'],
        1,
        'Calcium moves the blockers off actin’s binding sites.',
      ),
    ],
    relatedConcepts: ['atp', 'action-potential', 'cytoskeleton'],
    funFact: 'Your heart muscle has contracted around 2.5 billion times by the time you are 70.',
  },
  {
    id: 'bone-remodeling',
    title: 'Bone Remodeling',
    category: 'physiology',
    tags: ['osteoblasts', 'osteoclasts', 'skeleton', 'calcium', 'osteoporosis', 'exercise'],
    aliases: ['bone growth', 'osteoporosis', 'how bones repair', 'osteoblasts and osteoclasts'],
    difficulty: 3,
    rarity: 'obscure',
    summary:
      'Your bones are alive, constantly being chewed away and rebuilt by two teams of cells.',
    steps: steps(
      ['Living tissue', 'Bone is full of cells, blood vessels and nerves.'],
      ['Demolition crew', 'Osteoclasts dissolve old bone.'],
      ['Builders', 'Osteoblasts lay down new bone.'],
      ['Balance', 'When the two teams balance, bone stays strong. More building = denser bone.'],
    ),
    interaction: slider({
      prompt:
        'Balance the bone builders and bone eaters. What happens to bone density over a year?',
      inputs: [
        {
          id: 'build',
          label: 'Osteoblast activity (builders)',
          unit: '%',
          min: 0,
          max: 100,
          step: 5,
          start: 50,
        },
        {
          id: 'eat',
          label: 'Osteoclast activity (eaters)',
          unit: '%',
          min: 0,
          max: 100,
          step: 5,
          start: 50,
        },
        {
          id: 'load',
          label: 'Exercise & gravity',
          unit: '%',
          min: 0,
          max: 100,
          step: 5,
          start: 50,
        },
      ],
      output: {
        label: 'Bone density after a year',
        unit: '%',
        max: 130,
        expr: 'clamp(100 + 0.25 * (build * (0.6 + load / 125) - eat), 60, 130)',
      },
      graphInput: 'load',
      visual: { kind: 'growth', emoji: '🦴' },
      challenges: [
        {
          prompt: 'Keep bone density steady (98–102%).',
          target: { min: 98, max: 102 },
          explain:
            'Balanced building and breakdown keeps bones healthy — this happens constantly in adults.',
        },
        {
          prompt: 'Simulate a long space mission: no gravity, eaters winning (under 85%).',
          target: { max: 85 },
          explain:
            'Astronauts can lose about 1–2% of hip bone density per month in space without exercise.',
        },
        {
          prompt: 'Build stronger bones (over 115%).',
          target: { min: 115 },
          explain:
            'Weight-bearing exercise signals osteoblasts to build — bones get denser where they’re loaded.',
        },
      ],
    }),
    goDeeper:
      'Bone is about 10% remodeled each year in adults. Osteoclasts (related to macrophages) resorb bone with acid and enzymes; osteoblasts deposit collagen and mineral (hydroxyapatite) and become osteocytes, which sense mechanical strain. Hormones regulate the balance: parathyroid hormone raises blood calcium, estrogen protects bone, and vitamin D helps absorb calcium. Wolff’s law states that bone adapts to the loads placed on it. Osteoporosis results when resorption outpaces formation.\n\nIn reality, it’s a bit more complicated: the slider is a toy model; real remodeling happens in small units over months, and osteoblasts and osteoclasts signal to each other (via RANKL and osteoprotegerin). Tennis players’ racket arms can have noticeably denser bones than their other arms.',
    quiz: [
      mc(
        'Which cells break down bone?',
        ['Osteoblasts', 'Osteoclasts', 'Neurons', 'Red blood cells'],
        1,
        'Osteoclasts resorb bone; osteoblasts build it.',
      ),
      predict(
        'An astronaut spends six months in space without exercising.',
        'What happens to their bones?',
        ['They get denser', 'They lose density', 'Nothing', 'They grow longer'],
        1,
        'Without loading, osteoclasts outpace osteoblasts.',
      ),
      mc(
        'Why does weight-bearing exercise strengthen bones?',
        [
          'It adds calcium directly',
          'Bone cells sense the strain and signal osteoblasts to build',
          'It makes bones lighter',
          'It kills osteoclasts',
        ],
        1,
        'Bones adapt to the loads placed on them.',
      ),
    ],
    relatedConcepts: ['hormones-feedback', 'stem-cells', 'muscle-contraction'],
    funFact: 'Your skeleton is almost entirely replaced roughly every 10 years.',
  },
  {
    id: 'lymphatic-system',
    title: 'The Lymphatic System',
    category: 'physiology',
    tags: ['lymph', 'lymph nodes', 'immune system', 'fluid balance', 'spleen'],
    aliases: ['lymph nodes', 'lymph', 'swollen glands'],
    difficulty: 2,
    rarity: 'obscure',
    summary:
      'A hidden second network of vessels drains fluid from your tissues and filters it for germs.',
    steps: steps(
      ['Leaky capillaries', 'Some fluid leaks out of blood vessels into tissues every day.'],
      ['A drain system', 'Lymph vessels collect this fluid (lymph) and return it to the blood.'],
      [
        'Checkpoints',
        'Lymph passes through lymph nodes, packed with immune cells that check for germs.',
      ],
      ['Swollen glands', 'When you’re sick, nodes swell as immune cells multiply.'],
    ),
    interaction: zoom({
      prompt: 'Explore your body’s drainage and germ-checking network.',
      levels: [
        {
          id: 'body',
          label: 'Body',
          scale: '1.7 m',
          background: '#f0fdf4',
          description: 'Lymph vessels run alongside blood vessels, with hundreds of lymph nodes.',
          elements: [
            em('person', '🧍', 50, 50, 6, { opacity: 0.35 }),
            ...[
              [44, 28],
              [56, 28],
              [42, 48],
              [58, 48],
              [46, 66],
              [54, 66],
            ].map(([x, y], i) => sh(`n${i}`, 'bean', '#22c55e', x, y, 0.45)),
          ],
          hotspots: [
            {
              id: 'neck',
              x: 60,
              y: 22,
              label: 'Neck nodes',
              text: 'The “glands” your doctor feels when you have a sore throat.',
              zoomTo: 'node',
            },
            {
              id: 'spleen',
              x: 38,
              y: 50,
              label: 'Spleen',
              text: 'The spleen filters blood, removes old red blood cells and stores immune cells.',
            },
          ],
        },
        {
          id: 'node',
          label: 'Lymph node',
          scale: '1 cm',
          background: '#ecfdf5',
          description: 'A bean-shaped filter. Lymph flows in, gets inspected, and flows out.',
          elements: [
            sh('node', 'bean', '#86efac', 50, 50, 6),
            ...[
              [35, 40],
              [55, 35],
              [62, 58],
              [40, 62],
            ].map(([x, y], i) => sh(`f${i}`, 'circle', '#16a34a', x, y, 0.8)),
          ],
          hotspots: [
            {
              id: 'follicle',
              x: 35,
              y: 30,
              label: 'B-cell follicles',
              text: 'B cells wait here; when they meet their matching germ, they multiply and make antibodies.',
            },
            {
              id: 'in',
              x: 15,
              y: 50,
              label: 'Lymph flows in',
              text: 'Lymph brings bits of germs from the tissues to be inspected.',
              zoomTo: 'vessel',
            },
          ],
        },
        {
          id: 'vessel',
          label: 'Lymph vessel',
          scale: '0.5 mm',
          background: '#f7fee7',
          description: 'Thin vessels with one-way valves; muscles squeeze lymph along.',
          elements: [
            sh('v', 'rod', '#bbf7d0', 50, 50, 7),
            sh('valve1', 'triangle', '#15803d', 35, 50, 0.6, { rotate: 90 }),
            sh('valve2', 'triangle', '#15803d', 65, 50, 0.6, { rotate: 90 }),
          ],
          hotspots: [
            {
              id: 'valve',
              x: 35,
              y: 34,
              label: 'One-way valves',
              text: 'There’s no heart for lymph — valves plus your moving muscles push it one way.',
            },
          ],
        },
      ],
    }),
    goDeeper:
      'About 20 liters of plasma filter out of capillaries each day; roughly 17 liters are reabsorbed and the rest returns as lymph, draining into the venous system near the collarbones (thoracic duct and right lymphatic duct). Lymph nodes are organized into B-cell follicles and T-cell zones; dendritic cells bring antigens there to start adaptive immune responses. Lymphatics in the gut (lacteals) absorb dietary fats.\n\nIn reality, it’s a bit more complicated: the brain was long thought to lack lymphatic vessels, but meningeal lymphatics were described in 2015, and the “glymphatic” system clears waste, especially during sleep. If lymph drainage is blocked (lymphedema), limbs can swell severely.',
    quiz: [
      mc(
        'What does the lymphatic system return to the blood?',
        ['Oxygen', 'Fluid that leaked into tissues', 'Bile', 'Urine'],
        1,
        'Lymph vessels return leaked fluid to the bloodstream.',
      ),
      mc(
        'Why do lymph nodes swell when you’re sick?',
        [
          'They fill with air',
          'Immune cells multiply there to fight the infection',
          'They stop working',
          'They store food',
        ],
        1,
        'Swelling reflects immune activity.',
      ),
      predict(
        'A person’s lymph vessels in one arm are damaged after surgery.',
        'What might happen?',
        ['The arm swells with fluid', 'The arm gets stronger', 'Nothing', 'The arm stops bleeding'],
        0,
        'Without drainage, fluid builds up (lymphedema).',
      ),
    ],
    relatedConcepts: ['white-blood-cells', 'innate-vs-adaptive', 'heart-circulation'],
    funFact: 'You have somewhere between 500 and 700 lymph nodes.',
  },
  {
    id: 'circadian-rhythms',
    title: 'Circadian Rhythms',
    category: 'physiology',
    tags: ['body clock', 'melatonin', 'sleep', 'light', 'jet lag'],
    aliases: ['body clock', 'jet lag', 'melatonin', 'sleep-wake cycle'],
    difficulty: 2,
    rarity: 'common',
    summary: 'You have a 24-hour clock in your brain, and light is how you set it.',
    steps: steps(
      ['A master clock', 'A tiny brain region (the SCN) keeps a roughly 24-hour rhythm.'],
      ['Light resets it', 'Light hitting your eyes tells the clock it’s daytime.'],
      ['Sleepy hormone', 'In darkness, the pineal gland releases melatonin, making you sleepy.'],
      ['Out of sync', 'Jet lag and screens at night confuse the clock.'],
    ),
    interaction: slider({
      prompt:
        'Pick a time of day and how bright it is. Watch your melatonin (sleepiness hormone) respond.',
      inputs: [
        { id: 'hour', label: 'Time of day', unit: 'h', min: 0, max: 24, step: 0.5, start: 14 },
        { id: 'light', label: 'Light exposure', unit: '%', min: 0, max: 100, step: 5, start: 80 },
      ],
      output: {
        label: 'Melatonin level',
        unit: '%',
        max: 100,
        expr: '100 * max(gauss(hour, 2, 3.5), gauss(hour, 26, 3.5)) * (1 - 0.85 * light / 100)',
      },
      graphInput: 'hour',
      visual: { kind: 'glow', emoji: '🌙' },
      challenges: [
        {
          prompt: 'Find peak sleepiness: high melatonin (over 85%).',
          target: { min: 85 },
          explain: 'Melatonin peaks in the middle of the night, in the dark.',
        },
        {
          prompt: 'It’s 11 pm. Use bright screens to suppress melatonin below 40%.',
          target: { max: 40 },
          explain:
            'Bright light at night (especially blue light) suppresses melatonin, delaying sleep.',
        },
      ],
    }),
    goDeeper:
      'The suprachiasmatic nucleus (SCN) in the hypothalamus is the master clock. Light detected by special melanopsin-containing retinal ganglion cells resets it each day. At the molecular level, clock genes (CLOCK, BMAL1, PER, CRY) form a feedback loop that takes about 24 hours to complete — discovered in fruit flies by Hall, Rosbash and Young (Nobel Prize 2017). Nearly every organ has its own peripheral clock synced to the SCN.\n\nIn reality, it’s a bit more complicated: the challenges treat the clock as fixed, but light can also shift it earlier or later. Night owls and early birds differ partly because of genes, and teenagers’ clocks naturally run later, which is why some schools have moved start times later.',
    quiz: [
      mc(
        'What mainly resets your body clock each day?',
        ['Food', 'Light', 'Noise', 'Temperature'],
        1,
        'Light reaching your eyes is the strongest time cue.',
      ),
      predict(
        'You use a bright phone in bed at midnight.',
        'What happens to your melatonin?',
        [
          'It rises',
          'It is suppressed, so you may feel less sleepy',
          'Nothing',
          'It turns into adrenaline',
        ],
        1,
        'Bright light at night suppresses melatonin.',
      ),
      mc(
        'Why does jet lag happen?',
        [
          'Airplane food',
          'Your body clock is out of sync with local daylight',
          'Low oxygen in planes',
          'Lack of exercise',
        ],
        1,
        'Your internal clock still runs on home time.',
      ),
    ],
    relatedConcepts: ['sleep-stages', 'hormones-feedback', 'thermoregulation'],
    funFact:
      'In cave experiments without daylight, people’s natural rhythm drifted to about 24.2 hours.',
  },
  {
    id: 'gut-microbiome',
    title: 'The Gut Microbiome',
    category: 'physiology',
    tags: ['bacteria', 'gut health', 'fiber', 'probiotics', 'antibiotics', 'digestion'],
    aliases: ['gut bacteria', 'microbiome', 'good bacteria', 'probiotics'],
    difficulty: 2,
    rarity: 'common',
    prerequisites: ['digestion'],
    summary:
      'Trillions of microbes live in your gut, digesting fiber and helping keep you healthy.',
    steps: steps(
      [
        'A crowded city',
        'Your large intestine hosts trillions of bacteria from hundreds of species.',
      ],
      ['Fiber eaters', 'They ferment fiber you can’t digest, making helpful fatty acids.'],
      ['Diversity matters', 'A varied community is more resilient, like a healthy rainforest.'],
      ['Disruptions', 'Antibiotics and low-fiber diets can knock the community off balance.'],
    ),
    interaction: {
      template: 'feed-and-observe',
      config: {
        prompt:
          'Feed your gut microbes and see how their diversity — and your gut health — respond.',
        subject: { emoji: '🦠', label: 'Gut microbes' },
        meters: [
          {
            id: 'diversity',
            label: 'Microbe diversity',
            unit: '%',
            min: 0,
            max: 100,
            start: 50,
            healthy: [55, 100],
            color: '#16a34a',
          },
          {
            id: 'health',
            label: 'Gut lining health',
            unit: '%',
            min: 0,
            max: 100,
            start: 60,
            healthy: [55, 100],
            color: '#0ea5e9',
          },
        ],
        items: [
          {
            id: 'veg',
            label: 'Veggies & beans',
            emoji: '🥦',
            note: 'Fiber! Many different microbes feast on it.',
            effects: [{ meter: 'diversity', amount: 15, seconds: 5 }],
          },
          {
            id: 'yogurt',
            label: 'Yogurt',
            emoji: '🥛',
            note: 'Fermented foods add some friendly microbes.',
            effects: [{ meter: 'diversity', amount: 6, seconds: 4 }],
          },
          {
            id: 'junk',
            label: 'Sugary snacks',
            emoji: '🍩',
            note: 'Little fiber reaches the microbes, so many starve.',
            effects: [{ meter: 'diversity', amount: -10, seconds: 5 }],
          },
          {
            id: 'abx',
            label: 'Antibiotics',
            emoji: '💊',
            note: 'Antibiotics kill harmful AND helpful bacteria.',
            effects: [{ meter: 'diversity', amount: -35, seconds: 4 }],
          },
        ],
        responses: [
          {
            id: 'scfa',
            label: 'Making short-chain fatty acids',
            emoji: '⚗️',
            when: { meter: 'diversity', above: 55 },
            effect: { meter: 'health', perSecond: 2.5 },
            message:
              'Fiber-fermenting microbes make butyrate, which feeds and strengthens your gut lining.',
          },
          {
            id: 'weak',
            label: 'Lining gets hungry',
            emoji: '😟',
            when: { meter: 'diversity', below: 35 },
            effect: { meter: 'health', perSecond: -2 },
            message: 'With few fiber-eaters, the gut lining loses its favorite fuel.',
          },
          {
            id: 'regrow',
            label: 'Microbes regrow',
            emoji: '🌱',
            when: { meter: 'diversity', below: 45 },
            effect: { meter: 'diversity', perSecond: 0.8 },
            message: 'Surviving microbes slowly regrow and recolonize.',
          },
        ],
        goal: { feeds: 5 },
      },
    },
    goDeeper:
      'The human gut microbiota contains roughly 38 trillion bacteria (about the same number as human cells) plus archaea, fungi and viruses, dominated by Bacteroidetes and Firmicutes. Microbes ferment dietary fiber into short-chain fatty acids (acetate, propionate, butyrate); butyrate is a key fuel for colon cells. Gut microbes also make vitamin K and some B vitamins, train the immune system, and crowd out pathogens. Fecal microbiota transplants treat recurrent Clostridioides difficile infections, which often follow antibiotics.\n\nIn reality, it’s a bit more complicated: what counts as a “healthy” microbiome varies between people, and many headline links (to mood, weight, and more) come from studies showing associations rather than proven cause and effect. Store-bought probiotics usually don’t settle in permanently.',
    quiz: [
      mc(
        'What do gut bacteria do with fiber you can’t digest?',
        [
          'Nothing',
          'Ferment it into helpful fatty acids',
          'Turn it into protein',
          'Send it to the lungs',
        ],
        1,
        'They make short-chain fatty acids like butyrate.',
      ),
      predict(
        'Someone takes strong antibiotics for two weeks.',
        'What happens to their gut microbiome?',
        [
          'It becomes more diverse',
          'Diversity drops as helpful bacteria are killed too',
          'Nothing',
          'It becomes all viruses',
        ],
        1,
        'Antibiotics don’t discriminate between harmful and helpful bacteria.',
      ),
      mc(
        'About how many bacteria live in your gut?',
        ['A few thousand', 'Tens of trillions', 'Exactly one million', 'None'],
        1,
        'Roughly 38 trillion — similar to the number of human cells.',
      ),
    ],
    relatedConcepts: ['digestion', 'bacteria-vs-viruses', 'symbiosis', 'antibiotic-resistance'],
    funFact:
      'Babies born by C-section start with a different gut microbiome than those born vaginally, though they become more similar over time.',
  },
  {
    id: 'vagus-nerve',
    title: 'The Vagus Nerve',
    category: 'physiology',
    tags: ['nervous system', 'parasympathetic', 'rest and digest', 'gut-brain axis', 'heart rate'],
    aliases: ['vagus', 'rest and digest', 'gut-brain axis', 'parasympathetic nervous system'],
    difficulty: 3,
    rarity: 'obscure',
    summary:
      'One long wandering nerve links your brain to your heart, lungs and gut — and calms them down.',
    steps: steps(
      ['The wanderer', '“Vagus” means wandering: it runs from the brainstem down to the abdomen.'],
      ['Rest and digest', 'It is the main nerve of the calming (parasympathetic) system.'],
      ['Two-way street', 'Most of its fibers carry signals UP from the organs to the brain.'],
    ),
    interaction: sorting(
      'Which of these does the vagus nerve handle?',
      [
        ['Vagus nerve job', '🌀', 'Calming, digesting, organ reports'],
        ['Not the vagus', '🚫', 'Other nerves handle it'],
      ],
      [
        ['Slowing the heart rate', '🫀', 0, 'Vagus signals slow the heart’s pacemaker.'],
        ['Speeding up digestion', '🍽️', 0, 'It boosts gut movement and digestive secretions.'],
        [
          'Telling the brain “I’m full”',
          '😋',
          0,
          'Stretch and nutrient sensors in the gut report upward via the vagus.',
        ],
        [
          'Triggering the gag reflex',
          '🤢',
          0,
          'The vagus helps control the throat and gag reflex.',
        ],
        ['Moving your legs', '🦵', 1, 'Leg muscles are controlled by spinal nerves.'],
        ['Seeing colors', '🌈', 1, 'That’s the optic nerve.'],
        [
          'Fight-or-flight speed-up',
          '🏃',
          1,
          'The sympathetic system speeds things up — the vagus does the opposite.',
        ],
      ],
    ),
    goDeeper:
      'The vagus nerve (cranial nerve X) is the longest cranial nerve, supplying the larynx, pharynx, heart, lungs and most of the digestive tract. About 80% of its fibers are afferent (sensory), carrying information from organs to the brainstem’s nucleus of the solitary tract. Its efferent fibers slow heart rate (vagal tone), constrict airways and stimulate digestion. Fainting from strong emotion or pain (vasovagal syncope) happens when vagal activity briefly drops heart rate and blood pressure.\n\nIn reality, it’s a bit more complicated: vagus nerve stimulators are approved for some epilepsy and depression cases, but many online claims about “hacking” your vagus nerve are overstated. Slow, deep breathing does modestly increase vagal effects on the heart.',
    quiz: [
      mc(
        'What does the vagus nerve do to the heart?',
        ['Speeds it up', 'Slows it down', 'Stops it permanently', 'Nothing'],
        1,
        'Vagal signals slow the heart rate.',
      ),
      mc(
        'Most vagus nerve fibers carry signals…',
        [
          'From the brain to the legs',
          'From the organs up to the brain',
          'From the eyes to the ears',
          'Only during sleep',
        ],
        1,
        'About 80% are sensory, reporting on organ status.',
      ),
      predict(
        'A person gets a sudden shock and their vagus nerve becomes very active.',
        'What might happen?',
        [
          'They feel stronger',
          'Their heart slows and blood pressure drops, and they may faint',
          'They digest food instantly',
          'Nothing',
        ],
        1,
        'This is a vasovagal faint.',
      ),
    ],
    relatedConcepts: ['heart-circulation', 'digestion', 'action-potential'],
    funFact:
      'The vagus nerve was named in the Roman era by the physician Galen, from the Latin for “wandering.”',
  },
  {
    id: 'brown-fat',
    title: 'Brown Fat',
    category: 'physiology',
    tags: ['thermogenesis', 'babies', 'UCP1', 'mitochondria', 'cold', 'metabolism'],
    aliases: ['brown adipose tissue', 'non-shivering thermogenesis', 'heat-making fat'],
    difficulty: 3,
    rarity: 'obscure',
    prerequisites: ['electron-transport-chain', 'thermoregulation'],
    summary: 'Brown fat burns fuel just to make heat — a built-in heater, especially for babies.',
    steps: steps(
      ['Not all fat is the same', 'White fat stores energy. Brown fat burns it.'],
      [
        'Packed with mitochondria',
        'Brown fat gets its color from huge numbers of iron-rich mitochondria.',
      ],
      [
        'Leaky on purpose',
        'A protein called UCP1 lets protons leak back, so energy becomes heat instead of ATP.',
      ],
      ['Babies especially', 'Newborns rely on brown fat because they can’t shiver well.'],
    ),
    interaction: {
      template: 'feed-and-observe',
      config: {
        prompt:
          'Expose the body to cold and see brown fat warm it up. Compare a newborn baby with an adult.',
        subject: { emoji: '👶', label: 'Body' },
        meters: [
          {
            id: 'temp',
            label: 'Core temperature',
            unit: '°C',
            min: 33,
            max: 40,
            start: 37,
            healthy: [36.4, 37.6],
            color: '#f97316',
          },
        ],
        items: [
          {
            id: 'cold',
            label: 'Chilly room',
            emoji: '🥶',
            note: 'Cold air steals body heat.',
            effects: [{ meter: 'temp', amount: -1.4, seconds: 5 }],
          },
          {
            id: 'snow',
            label: 'Winter walk',
            emoji: '❄️',
            note: 'A big chill!',
            effects: [{ meter: 'temp', amount: -2.2, seconds: 5 }],
          },
          {
            id: 'blanket',
            label: 'Warm blanket',
            emoji: '🧣',
            note: 'Insulation keeps heat in.',
            effects: [{ meter: 'temp', amount: 0.6, seconds: 4 }],
          },
        ],
        responses: [
          {
            id: 'brown',
            label: 'Brown fat burning',
            emoji: '🔥',
            when: { meter: 'temp', below: 36.8 },
            effect: { meter: 'temp', perSecond: 0.28 },
            message:
              'Brown fat switches on: UCP1 lets protons leak, turning fuel straight into heat.',
          },
          {
            id: 'shiver',
            label: 'Shivering',
            emoji: '🫨',
            when: { meter: 'temp', below: 36.2 },
            effect: { meter: 'temp', perSecond: 0.15 },
            message: 'Shivering muscles add extra heat.',
          },
        ],
        modes: [
          {
            id: 'baby',
            label: 'Newborn',
            description: 'Newborns have lots of brown fat but shiver poorly.',
            responseScale: { brown: 1.3, shiver: 0.2 },
          },
          {
            id: 'adult',
            label: 'Adult',
            description: 'Adults have less brown fat and rely more on shivering.',
            responseScale: { brown: 0.35, shiver: 1 },
          },
        ],
        goal: { feeds: 3, tryAllModes: true },
      },
    },
    goDeeper:
      'Brown adipocytes contain many small fat droplets and dense mitochondria rich in uncoupling protein 1 (UCP1, thermogenin). When activated by the sympathetic nervous system (norepinephrine) in the cold, UCP1 lets protons flow back across the inner mitochondrial membrane without making ATP, releasing the energy as heat — non-shivering thermogenesis. Newborns have brown fat between the shoulder blades; adults retain some around the neck, collarbones and spine, as revealed by PET scans.\n\nIn reality, it’s a bit more complicated: adults also have “beige” fat cells that can switch on heat production with cold exposure. Brown fat burns calories, but in most adults the amount is small, so it isn’t a shortcut for weight loss.',
    quiz: [
      mc(
        'What does brown fat mainly do?',
        ['Store energy long-term', 'Burn fuel to make heat', 'Make insulin', 'Build bones'],
        1,
        'Brown fat is specialized for heat production.',
      ),
      mc(
        'What protein makes brown fat’s mitochondria “leaky”?',
        ['Hemoglobin', 'UCP1', 'Insulin', 'Myosin'],
        1,
        'UCP1 lets protons leak back, releasing energy as heat.',
      ),
      predict(
        'A newborn baby is in a cool room.',
        'How does the baby mostly stay warm?',
        ['Shivering hard', 'Brown fat burning', 'Sweating', 'Digesting faster'],
        1,
        'Newborns rely on non-shivering thermogenesis from brown fat.',
      ),
    ],
    relatedConcepts: ['thermoregulation', 'electron-transport-chain', 'mitochondria'],
    funFact:
      'Hibernating animals use brown fat to rewarm their bodies when they wake up in spring.',
  },
];
