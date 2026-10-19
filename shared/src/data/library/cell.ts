import type { DiagramShape, LibraryUpgrade } from '../../types';
import { arrow, circle, diagram, ellipse, path, rect, text } from '../highschool/build';

const MEMBRANE = '#f59e0b';

/** A ribosome: a large and a small subunit. */
function ribosome(x: number, y: number, part: string, scale = 1): DiagramShape[] {
  return [
    ellipse(x, y - 7 * scale, 15 * scale, 10 * scale, '#a78bfa', { stroke: '#6d28d9', part }),
    ellipse(x, y + 6 * scale, 11 * scale, 6 * scale, '#c4b5fd', { stroke: '#6d28d9', part }),
  ];
}

/** A small rod-shaped bacterium. */
const bacterium = (x: number, y: number, part: string): DiagramShape =>
  rect(x - 16, y - 8, 32, 16, '#86efac', { r: 8, stroke: '#15803d', strokeWidth: 2, part });

export const cellUpgrades: Record<string, LibraryUpgrade> = {
  mitosis: {
    steps: [
      [
        'Interphase: copy',
        'Before dividing, the cell grows and makes an exact copy of every chromosome. Each copied chromosome looks like an X: two identical halves (sister chromatids) joined in the middle. It’s like photocopying a whole recipe book before handing a copy to a new kitchen.',
      ],
      [
        'Prophase: pack up',
        'The long, tangled DNA coils up tightly into short, thick chromosomes, so it can be moved without tangling, like winding up loose string before a move. The nucleus’s outer wall breaks down, and spindle fibers start growing from each end of the cell.',
      ],
      [
        'Metaphase: line up',
        'Spindle fibers grab each chromosome at its middle and pull from both sides until every chromosome lines up single-file across the center of the cell. The cell checks that every chromosome is attached before going on.',
      ],
      [
        'Anaphase: pull apart',
        'The two halves of each X are pulled apart and dragged to opposite ends of the cell. Because every X splits evenly, each end gets one complete copy of every chromosome.',
      ],
      [
        'Telophase: split',
        'A new nucleus forms around each set of chromosomes, and the chromosomes relax back into loose DNA. Then the cell pinches in the middle (cytokinesis) until it splits into two, like squeezing a balloon into two smaller ones.',
      ],
      [
        'Two identical cells',
        'The result is two daughter cells with exactly the same chromosomes as the original: in humans, 46 each. Mitosis is how you grow, heal a cut and replace worn-out cells, such as the billions of skin and gut cells you lose every day.',
      ],
      [
        'When control fails',
        'Checkpoints act like quality control, pausing division if DNA is damaged or chromosomes aren’t attached properly. If the genes that run these checkpoints are damaged, cells can keep dividing when they shouldn’t, forming a lump of cells called a tumor: cancer.',
      ],
    ],
    goDeeperMore:
      'Why it matters: different cells divide at very different speeds. Cells lining your gut are replaced every few days, skin cells every few weeks, while most nerve cells in your brain stop dividing altogether. Many cancer treatments target dividing cells, which is why they can also affect fast-dividing healthy cells like those in hair follicles.\n\nCommon mix-up: mitosis makes two identical cells with the full set of chromosomes; meiosis makes four different cells with half the chromosomes (for eggs and sperm). Also, chromosomes are copied before mitosis begins, during interphase, not during mitosis itself.',
  },
  meiosis: {
    steps: [
      [
        'Copy first',
        'Like mitosis, meiosis starts with a cell that has copied all its chromosomes, so each looks like an X of two identical halves. In humans, that is 46 chromosomes arranged in 23 matching pairs: one of each pair came from mom and one from dad.',
      ],
      [
        'Partners pair up',
        'Matching chromosomes (one from mom, one from dad) find each other and line up side by side. They swap matching chunks of DNA, called crossing over, like two decks of cards trading a few cards. Now each chromosome is a new mix of both parents.',
      ],
      [
        'Division 1',
        'The pairs are pulled apart into two cells. Which side each pair faces is random, like flipping a coin for each of the 23 pairs, so the two cells get different mixes of mom’s and dad’s chromosomes. Each cell now has half the number of chromosomes.',
      ],
      [
        'Division 2',
        'Without copying DNA again, each cell divides once more, this time splitting each X into its two halves. The result is four cells (eggs or sperm), each with 23 single chromosomes and each genetically different from the others.',
      ],
    ],
    goDeeperMore:
      'Why it matters: meiosis is why siblings (except identical twins) look different even with the same parents. Crossing over and the random sorting of pairs give each egg or sperm a unique set of genes: a single person can make over 8 million different combinations from chromosome sorting alone, before crossing over adds even more.\n\nCommon mix-up: the chromosome number halves in the first division, not the second. And meiosis only happens in the reproductive organs (ovaries and testes); every other cell in your body divides by mitosis.',
  },
  'cell-membrane': {
    steps: [
      [
        'An oily bubble',
        'Every cell is wrapped in a thin membrane made of two layers of phospholipids. Their heads like water and face outward; their oily tails hide in the middle, much like how oil and water don’t mix. Proteins float in this layer like boats on a lake.',
      ],
      [
        'Spreading out',
        'Molecules are always jiggling around, so they naturally spread from where they are crowded to where there are fewer, like a drop of food coloring spreading through water. This is diffusion, and it needs no energy from the cell.',
      ],
      [
        'Faster or slower',
        'Diffusion speeds up when the difference in concentration is bigger, when it’s warmer (molecules move faster), when the membrane is thinner and when the molecules are small. That’s why your lungs have huge surface areas and very thin walls.',
      ],
      [
        'Picky gates',
        'Small molecules like oxygen and carbon dioxide slip right through the oily middle. Bigger or electrically charged ones, like sugar and salt ions, can’t, so they need special protein doorways (channels and carriers) to get across. This makes the membrane selectively permeable.',
      ],
    ],
    goDeeperMore:
      'Why it matters: the membrane decides what enters and leaves every cell, so it keeps the inside of the cell very different from the outside. Many medicines must be designed to cross membranes, and some poisons work by punching holes in them.\n\nCommon mix-up: diffusion doesn’t stop when molecules are spread evenly; they keep moving, but the movement in each direction balances out (equilibrium). And “passive” just means no energy from the cell is needed, not that nothing is moving.',
  },
  osmosis: {
    steps: [
      [
        'Water moves too',
        'Osmosis is the diffusion of water across a membrane. Water molecules pass through the membrane (often through special protein channels called aquaporins), but many dissolved substances, like salt and sugar, can’t.',
      ],
      [
        'Toward the salt',
        'Water moves toward the side with more dissolved stuff (solutes), because there is relatively less free water there. Think of it as water “diluting” the saltier side. This keeps happening until the two sides are balanced, or until pressure stops it.',
      ],
      [
        'Swell or shrivel',
        'Put a cell in pure water and water rushes in: animal cells swell and can burst, while plant cells become firm. In salty water, water leaves and the cell shrivels. In a “just right” (isotonic) solution, water moves in and out equally.',
      ],
    ],
    goDeeperMore:
      'Why it matters: osmosis is why salted slugs shrivel, why wilted lettuce crisps up in cold water, and why hospitals use saline (salt water at the same concentration as blood) in IV drips instead of pure water, which would make red blood cells swell and burst.\n\nCommon mix-up: in osmosis it is water that moves, not salt. Students often say “salt moves into the cell,” but the membrane mostly stops salt; the water moves toward the salt instead.',
  },
  'active-transport': {
    steps: [
      [
        'Uphill work',
        'Sometimes cells need to move things from where there is little to where there is already a lot: the opposite of diffusion. That’s like pushing a ball uphill, so it costs energy, usually from ATP. This is active transport.',
      ],
      [
        'A protein pump',
        'The sodium–potassium pump is a protein built into the membrane. It starts open to the inside of the cell, where it grabs 3 sodium ions, even though there is already much more sodium outside.',
      ],
      [
        'Powered by ATP',
        'ATP hands the pump a phosphate group. This changes the pump’s shape, like a door swinging open to the other side, so it now faces the outside of the cell and lets go of the sodium there.',
      ],
      [
        'Swap and reset',
        'Facing outside, the pump picks up 2 potassium ions. Then it drops the phosphate, flips back to its original shape, and releases the potassium inside. Every cycle moves 3 sodium out and 2 potassium in, and it repeats hundreds of times per second.',
      ],
    ],
    goDeeperMore:
      'Why it matters: your body spends a huge amount of energy on active transport. The sodium–potassium pump alone uses around a fifth of a resting person’s energy, and much more in nerve cells, because the gradients it builds are what let nerves send signals. Plant roots also use active transport to absorb minerals from soil where they are scarce.\n\nCommon mix-up: active transport isn’t just “fast diffusion.” The defining feature is moving against a concentration gradient, which always needs energy.',
  },
  mitochondria: {
    steps: [
      [
        'Fuel in',
        'Your cells need a constant supply of energy. Food gives them glucose (sugar), and your lungs give them oxygen; your blood delivers both to every cell in your body.',
      ],
      [
        'Into the powerhouse',
        'First, glucose is split in half in the cytoplasm (glycolysis), which releases a little energy. The pieces then enter the mitochondria, where they are broken down completely, releasing much more energy.',
      ],
      [
        'Folded factory',
        'A mitochondrion has two membranes. The inner one is folded into many ridges called cristae, which pack in lots of surface area for the tiny machines that make ATP, like adding extra shelves to a small room.',
      ],
      [
        'Exhaust',
        'Breaking down glucose leaves carbon dioxide and water as waste. The carbon dioxide travels in your blood to your lungs, and you breathe it out, so every breath out carries away leftovers from your mitochondria.',
      ],
    ],
    goDeeperMore:
      'Why it matters: cells that use lots of energy, like muscle, heart and nerve cells, contain hundreds or thousands of mitochondria. Oxygen is needed at the very last step of making ATP, which is why you breathe harder when you exercise.\n\nCommon mix-up: mitochondria don’t “make energy.” Energy can’t be created; mitochondria transfer energy that was stored in food into ATP, which the cell can use right away.',
  },
  atp: {
    steps: [
      [
        'A charged battery',
        'ATP (adenosine triphosphate) is the cell’s energy currency. It carries three phosphate groups in a row. Breaking off the last one releases a burst of energy the cell can use, like spending a coin.',
      ],
      [
        'Spend it',
        'Almost every job in a cell is paid for with ATP: muscles contracting, pumps moving ions, and enzymes building proteins and DNA. When ATP is spent, it becomes ADP (adenosine diphosphate), with one phosphate fewer.',
      ],
      [
        'Recharge it',
        'Cells can’t store much ATP, so they recharge it constantly. Energy from breaking down food in respiration is used to stick the phosphate back onto ADP, making ATP again, like recharging a battery.',
      ],
    ],
    goDeeperMore:
      'Why it matters: you recycle roughly your own body weight in ATP every day, even though your body only holds about 250 grams of it at any moment. Each ATP molecule is spent and recharged hundreds or thousands of times a day.\n\nCommon mix-up: ATP is not a long-term energy store. Fats and starches (like glycogen) store energy for later; ATP is the quick “cash” that cells spend right now.',
  },
  ribosomes: {
    steps: [
      [
        'Tiny machines',
        'Ribosomes are the cell’s protein factories, made of RNA and protein in two parts (subunits). They read the instructions in messenger RNA and link amino acids together, one by one, into a protein chain.',
      ],
      [
        'Two neighborhoods',
        'Some ribosomes float freely in the cytoplasm. Others are stuck onto the rough endoplasmic reticulum (ER), which gives the rough ER its bumpy, “rough” look under a microscope.',
      ],
      [
        'Shipping address',
        'Where a ribosome works decides where its protein goes. Proteins made on the rough ER are fed inside it and later sent out of the cell or into membranes; proteins made by free ribosomes stay in the cytoplasm to work there.',
      ],
    ],
    goDeeperMore:
      'Why it matters: a single cell can contain millions of ribosomes, and a busy one can join several amino acids per second. Cells that release lots of protein, like pancreas cells making digestive enzymes, are packed with rough ER.\n\nBacteria have smaller ribosomes than human cells. Some antibiotics, such as streptomycin and tetracycline, jam bacterial ribosomes but not ours, which is how they kill bacteria without harming us.\n\nCommon mix-up: ribosomes aren’t surrounded by a membrane, so they aren’t organelles in the same way as mitochondria. Even bacteria, which have no membrane-bound organelles, have ribosomes.',
    diagrams: [
      diagram(
        'Ribosomes: free and bound',
        'Left: a ribosome reading mRNA and building a protein. Right: ribosomes stuck to the rough ER feed their proteins inside it, while free ribosomes release theirs into the cytoplasm.',
        [
          path('M14 140 L190 140', { stroke: '#7c3aed', strokeWidth: 4, part: 'mrna' }),
          ...['A', 'U', 'G', 'G', 'C', 'U', 'U', 'U', 'C'].map((b, i) =>
            text(26 + i * 18, 166, b, { size: 9, bold: true, fill: '#6d28d9', part: 'mrna' }),
          ),
          ellipse(100, 112, 44, 28, '#a78bfa', {
            stroke: '#6d28d9',
            strokeWidth: 2,
            part: 'large',
          }),
          ellipse(100, 140, 36, 13, '#c4b5fd', {
            stroke: '#6d28d9',
            strokeWidth: 2,
            part: 'small',
          }),
          ...[
            [96, 82],
            [84, 66],
            [70, 52],
            [56, 40],
            [42, 30],
          ].map(([x, y], i) =>
            circle(x, y, 7, ['#fca5a5', '#fdba74', '#fde047', '#86efac', '#93c5fd'][i], {
              stroke: '#475569',
              strokeWidth: 1,
              part: 'chain',
            }),
          ),
          text(100, 200, 'one ribosome at work', { size: 9, fill: '#64748b' }),
          rect(214, 112, 178, 60, '#fde68a', {
            r: 26,
            stroke: '#d97706',
            strokeWidth: 2,
            part: 'er',
          }),
          rect(226, 126, 154, 32, '#fef3c7', { r: 16, part: 'er' }),
          text(336, 146, 'inside the ER', { size: 8.5, fill: '#92400e', part: 'er' }),
          ...[240, 284, 328, 368].flatMap((x) => ribosome(x, 98, 'bound', 0.8)),
          path('M284 104 Q290 120 280 134 Q272 144 288 150', {
            stroke: '#dc2626',
            strokeWidth: 2.5,
            part: 'bound',
          }),
          ...ribosome(250, 220, 'free', 0.8),
          ...ribosome(340, 214, 'free', 0.8),
          path('M258 224 Q270 236 284 230', { stroke: '#dc2626', strokeWidth: 2.5, part: 'free' }),
          text(304, 250, 'free ribosomes', { size: 8.5, fill: '#6d28d9', part: 'free' }),
          text(303, 80, 'rough ER', { size: 9, bold: true, fill: '#92400e', part: 'er' }),
        ],
        [
          [
            'mrna',
            'mRNA',
            [20, 126],
            'A copy of a gene’s instructions. The ribosome reads it three letters at a time.',
          ],
          [
            'small',
            'Small subunit',
            [188, 160],
            'Grips the mRNA and makes sure each instruction is read in the right order.',
          ],
          [
            'large',
            'Large subunit',
            [152, 92],
            'Joins amino acids together into a chain. It is made mostly of RNA.',
          ],
          [
            'chain',
            'Growing protein',
            [30, 52],
            'A chain of amino acids that grows one link at a time, then folds into its final shape.',
          ],
          [
            'er',
            'Rough endoplasmic reticulum',
            [214, 186],
            'A folded membrane network. Proteins made here are sent out of the cell or into membranes.',
          ],
          [
            'bound',
            'Bound ribosomes',
            [394, 84],
            'Ribosomes stuck to the ER feed their protein chain straight inside it.',
          ],
          [
            'free',
            'Free ribosomes',
            [384, 228],
            'Float in the cytoplasm and make proteins that stay and work there, like enzymes for glycolysis.',
          ],
        ],
      ),
    ],
  },
  'er-golgi': {
    steps: [
      [
        'Built on the ER',
        'Proteins meant for export start on ribosomes stuck to the rough ER. As each protein is made, it is threaded inside the ER, where it folds into the right shape and gets checked for mistakes, like a factory floor with quality control.',
      ],
      [
        'Bubble mail',
        'Finished proteins are packed into tiny membrane bubbles called vesicles, which pinch off the ER and travel to the Golgi apparatus, like parcels in a mail van.',
      ],
      [
        'Sorting office',
        'The Golgi is a stack of flattened sacs. As proteins pass through it, they are modified (often with sugar “labels”), sorted and packed into new vesicles addressed to the right place: the cell surface, the lysosomes, or outside the cell.',
      ],
      [
        'Out the door',
        'Vesicles carrying proteins for export travel to the cell membrane and merge with it, spilling their contents outside. This is exocytosis, and it’s how cells release things like hormones, digestive enzymes and mucus.',
      ],
    ],
    goDeeperMore:
      'Why it matters: this shipping system is how your pancreas releases insulin and digestive enzymes, how your stomach makes mucus, and how antibodies are sent out of white blood cells. Cells that secrete a lot have a big, busy ER and Golgi.\n\nCommon mix-up: the smooth ER is different from the rough ER. It has no ribosomes and makes lipids (fats and steroid hormones) instead of proteins; in liver cells it also helps break down drugs and toxins.',
    diagrams: [
      diagram(
        'The protein shipping route',
        'A protein for export travels from ribosomes on the rough ER, through the Golgi, to the cell surface, carried between stops in vesicles.',
        [
          path('M8 40 L392 40 L392 250 L8 250 Z', {
            fill: 'none',
            stroke: '#e11d48',
            strokeWidth: 2,
            dash: true,
          }),
          path('M394 120 L394 170', { stroke: '#e11d48', strokeWidth: 5, part: 'exo' }),
          circle(60, 150, 40, '#e9d5ff', { stroke: '#7c3aed', strokeWidth: 2, part: 'nucleus' }),
          text(60, 154, 'nucleus', { size: 9, bold: true, fill: '#6d28d9', part: 'nucleus' }),
          path('M108 104 Q118 150 108 196 M122 100 Q134 150 122 200 M136 98 Q150 150 136 202', {
            stroke: '#d97706',
            strokeWidth: 6,
            part: 'rer',
          }),
          ...[
            [104, 116],
            [112, 140],
            [112, 164],
            [118, 112],
            [128, 136],
            [126, 184],
            [140, 124],
            [146, 160],
          ].map(([x, y]) => circle(x, y, 3, '#7c3aed', { part: 'rer' })),
          circle(184, 120, 9, '#fde68a', { stroke: '#d97706', strokeWidth: 2, part: 'vesicle1' }),
          arrow([150, 130], [172, 122], { stroke: '#64748b', strokeWidth: 1.5 }),
          arrow([194, 124], [226, 136], { stroke: '#64748b', strokeWidth: 1.5 }),
          ...[0, 1, 2, 3].map((i) =>
            path(`M${232 + i * 12} 104 Q${252 + i * 12} 150 ${232 + i * 12} 196`, {
              stroke: '#ea580c',
              strokeWidth: 6,
              part: 'golgi',
            }),
          ),
          text(252, 92, 'Golgi', { size: 9.5, bold: true, fill: '#c2410c', part: 'golgi' }),
          text(122, 92, 'rough ER', { size: 9.5, bold: true, fill: '#b45309', part: 'rer' }),
          circle(318, 132, 9, '#fed7aa', { stroke: '#ea580c', strokeWidth: 2, part: 'vesicle2' }),
          circle(352, 148, 9, '#fed7aa', { stroke: '#ea580c', strokeWidth: 2, part: 'vesicle2' }),
          arrow([290, 140], [306, 136], { stroke: '#64748b', strokeWidth: 1.5 }),
          arrow([328, 136], [342, 144], { stroke: '#64748b', strokeWidth: 1.5 }),
          ...[
            [374, 140],
            [382, 152],
            [378, 162],
          ].map(([x, y]) => circle(x, y, 2.5, '#dc2626', { part: 'exo' })),
          circle(318, 132, 3, '#dc2626', { part: 'vesicle2' }),
          circle(352, 148, 3, '#dc2626', { part: 'vesicle2' }),
          circle(184, 120, 3, '#dc2626', { part: 'vesicle1' }),
          text(200, 26, 'cell membrane', { size: 9, fill: '#e11d48' }),
          text(330, 212, 'secreted proteins', { size: 8.5, fill: '#b91c1c', part: 'exo' }),
        ],
        [
          [
            'nucleus',
            'Nucleus',
            [60, 98],
            'Holds the gene. A copy of the instructions (mRNA) leaves through a nuclear pore to a ribosome.',
          ],
          [
            'rer',
            'Rough ER',
            [150, 210],
            'Ribosomes on its surface build the protein and thread it inside, where it folds and is checked.',
          ],
          [
            'vesicle1',
            'Transport vesicle',
            [184, 98],
            'A membrane bubble that buds off the ER and carries proteins to the Golgi.',
          ],
          [
            'golgi',
            'Golgi apparatus',
            [276, 212],
            'Modifies proteins (often adding sugars), sorts them, and packs them into new vesicles with the right “address.”',
          ],
          [
            'vesicle2',
            'Secretory vesicles',
            [336, 110],
            'Carry finished proteins toward the cell membrane.',
          ],
          [
            'exo',
            'Exocytosis',
            [376, 100],
            'The vesicle merges with the cell membrane, releasing its proteins outside the cell.',
          ],
        ],
      ),
    ],
  },
  lysosomes: {
    steps: [
      [
        'A tiny stomach',
        'Lysosomes are small membrane bubbles packed with digestive enzymes that break down proteins, fats, sugars and DNA. Their insides are acidic, and their enzymes work best in acid, like your stomach.',
      ],
      [
        'Eating germs',
        'When a white blood cell swallows a bacterium, the bacterium ends up trapped in a bubble inside the cell. Lysosomes merge with that bubble and pour in their enzymes, digesting the invader.',
      ],
      [
        'Recycling',
        'Lysosomes also break down the cell’s own worn-out parts. The building blocks released (amino acids, sugars, fats) are sent back into the cell to make new things, so very little is wasted.',
      ],
    ],
    goDeeperMore:
      'Why it matters: lysosomes are the cell’s recycling and defense centers. When a lysosome enzyme is missing because of a faulty gene, undigested material piles up; Tay-Sachs disease, which damages nerve cells, is one of these “lysosomal storage diseases.”\n\nThe acid is also a built-in safety feature: lysosome enzymes barely work at the cytoplasm’s neutral pH, so if one leaks, it does little damage.\n\nCommon mix-up: lysosomes are mostly described in animal cells. Plant cells do similar digestion in their large central vacuole.',
    diagrams: [
      diagram(
        'A white blood cell digests a bacterium',
        'Inside a white blood cell: a swallowed bacterium is sealed in a bubble, lysosomes fuse with it, and the bacterium is broken down into reusable pieces.',
        [
          path(
            'M20 40 C80 6 320 6 380 40 C404 120 400 200 370 236 C300 262 100 262 30 236 C0 200 -4 120 20 40 Z',
            {
              fill: '#eff6ff',
              stroke: '#3b82f6',
              strokeWidth: 2.5,
              part: 'cell',
            },
          ),
          bacterium(52, 70, 'bacterium'),
          path('M30 96 Q60 120 90 96', { stroke: '#3b82f6', strokeWidth: 2.5, part: 'engulf' }),
          arrow([92, 80], [128, 102], { stroke: '#64748b', strokeWidth: 1.5 }),
          circle(156, 118, 24, '#dbeafe', { stroke: '#3b82f6', strokeWidth: 2, part: 'phagosome' }),
          bacterium(156, 118, 'phagosome'),
          circle(150, 196, 13, '#c4b5fd', { stroke: '#6d28d9', strokeWidth: 2, part: 'lysosome' }),
          ...[
            [146, 192],
            [154, 200],
            [152, 190],
          ].map(([x, y]) => circle(x, y, 2, '#6d28d9', { part: 'lysosome' })),
          arrow([158, 182], [158, 146], { stroke: '#6d28d9', strokeWidth: 1.5, part: 'lysosome' }),
          arrow([184, 118], [222, 118], { stroke: '#64748b', strokeWidth: 1.5 }),
          circle(252, 118, 26, '#ede9fe', { stroke: '#6d28d9', strokeWidth: 2, part: 'digest' }),
          path('M238 112 L246 118 M252 106 L258 112 M248 126 L256 128 M262 120 L266 128', {
            stroke: '#15803d',
            strokeWidth: 3,
            part: 'digest',
          }),
          ...[
            [244, 106],
            [262, 110],
            [240, 126],
            [258, 132],
          ].map(([x, y]) => circle(x, y, 2, '#6d28d9', { part: 'digest' })),
          arrow([280, 118], [318, 118], { stroke: '#64748b', strokeWidth: 1.5 }),
          ...[
            [332, 104],
            [346, 116],
            [334, 130],
            [352, 136],
            [358, 102],
          ].map(([x, y], i) =>
            circle(x, y, 4, ['#fca5a5', '#fde047', '#86efac', '#93c5fd', '#fdba74'][i], {
              part: 'recycle',
            }),
          ),
          text(156, 80, 'trapped', { size: 8.5, fill: '#1d4ed8', part: 'phagosome' }),
          text(150, 226, 'lysosome', { size: 9, bold: true, fill: '#6d28d9', part: 'lysosome' }),
          text(252, 160, 'digestion', { size: 9, bold: true, fill: '#6d28d9', part: 'digest' }),
          text(346, 160, 'reusable', { size: 9, bold: true, fill: '#15803d', part: 'recycle' }),
          text(346, 172, 'building blocks', { size: 8.5, fill: '#15803d', part: 'recycle' }),
        ],
        [
          [
            'bacterium',
            'Bacterium',
            [52, 46],
            'A germ that the white blood cell has detected and is about to swallow.',
          ],
          [
            'engulf',
            'Engulfing',
            [100, 64],
            'The cell membrane wraps around the bacterium and pinches off, trapping it inside (phagocytosis).',
          ],
          [
            'phagosome',
            'Food bubble (phagosome)',
            [192, 92],
            'The bacterium is now sealed inside a membrane bubble within the cell.',
          ],
          [
            'lysosome',
            'Lysosome',
            [180, 206],
            'A bubble of digestive enzymes kept acidic inside. It travels to the food bubble and merges with it.',
          ],
          [
            'digest',
            'Digestion',
            [286, 92],
            'Enzymes break the bacterium’s proteins, fats, sugars and DNA into small pieces.',
          ],
          [
            'recycle',
            'Recycling',
            [376, 92],
            'The small molecules pass back into the cell to be reused as building materials or fuel.',
          ],
          [
            'cell',
            'White blood cell',
            [28, 222],
            'A phagocyte: a defender whose job is to swallow and destroy invaders and debris.',
          ],
        ],
      ),
    ],
  },
  cytoskeleton: {
    steps: [
      [
        'Not just a bag',
        'A cell isn’t a bag of loose jelly. It is crisscrossed by a network of protein fibers called the cytoskeleton, which gives the cell its shape, holds organelles in place and lets it move, a bit like the frame and poles of a tent.',
      ],
      [
        'Three types',
        'Thin actin filaments sit under the membrane and help cells change shape and crawl. Rope-like intermediate filaments give strength. Hollow microtubules are the thickest; they act as tracks and pull chromosomes apart when cells divide.',
      ],
      [
        'Highways',
        'Motor proteins “walk” along microtubules carrying vesicles and organelles, like trucks on a highway. In long nerve cells, this is how materials made in the cell body reach the far end of the axon, up to a meter away.',
      ],
    ],
    goDeeperMore:
      'Why it matters: the cytoskeleton lets white blood cells crawl toward infections, muscle cells contract (using actin), and cells divide (microtubules form the spindle). Some cancer drugs, like Taxol, freeze microtubules so dividing cells can’t pull their chromosomes apart.\n\nCommon mix-up: the cytoskeleton isn’t fixed like a bone skeleton. Its fibers are constantly being built up and taken apart in seconds to minutes, so the cell can reshape itself whenever it needs to.',
    diagrams: [
      diagram(
        'Inside the cytoskeleton',
        'An animal cell showing its three kinds of protein fibers, and a motor protein carrying cargo along a microtubule.',
        [
          path(
            'M30 40 C110 8 300 8 370 40 C404 110 400 190 360 228 C280 258 110 258 40 226 C0 190 -2 110 30 40 Z',
            {
              fill: '#fafafa',
              stroke: '#94a3b8',
              strokeWidth: 2.5,
            },
          ),
          path(
            'M44 50 L60 40 L80 46 L100 36 M300 34 L320 42 L340 36 L360 46 M40 210 L58 222 L80 218 L100 230 M300 230 L322 222 L344 228 L362 216',
            {
              stroke: '#dc2626',
              strokeWidth: 2,
              part: 'actin',
            },
          ),
          path('M28 120 L40 112 L52 122 L64 112 M336 120 L348 110 L360 122 L372 112', {
            stroke: '#dc2626',
            strokeWidth: 2,
            part: 'actin',
          }),
          circle(150, 140, 30, '#e9d5ff', { stroke: '#7c3aed', strokeWidth: 2, part: 'nucleus' }),
          path(
            'M100 70 Q140 90 120 120 Q100 150 130 180 Q160 210 200 196 M260 60 Q240 100 270 130 Q300 160 280 200',
            {
              stroke: '#2563eb',
              strokeWidth: 3,
              part: 'intermediate',
            },
          ),
          circle(240, 130, 6, '#16a34a', { part: 'centrosome' }),
          ...[
            [240, 30],
            [340, 70],
            [370, 150],
            [320, 220],
            [230, 236],
            [190, 60],
          ].map(([x, y]) =>
            path(`M240 130 L${x} ${y}`, { stroke: '#16a34a', strokeWidth: 4, part: 'microtubule' }),
          ),
          circle(308, 144, 12, '#fde68a', { stroke: '#d97706', strokeWidth: 2, part: 'motor' }),
          path('M304 140 L300 134 M312 140 L316 134', {
            stroke: '#d97706',
            strokeWidth: 2,
            part: 'motor',
          }),
          arrow([318, 148], [350, 154], { stroke: '#d97706', strokeWidth: 2, part: 'motor' }),
        ],
        [
          [
            'actin',
            'Actin filaments',
            [80, 30],
            'The thinnest fibers, mostly just under the membrane. They let cells change shape, crawl and pinch in two.',
          ],
          [
            'intermediate',
            'Intermediate filaments',
            [104, 196],
            'Tough, rope-like fibers that give the cell strength and anchor the nucleus.',
          ],
          [
            'microtubule',
            'Microtubules',
            [208, 46],
            'Hollow tubes that act as tracks inside the cell and form the spindle during cell division.',
          ],
          [
            'centrosome',
            'Centrosome',
            [254, 112],
            'The organizing center that microtubules grow out from, near the nucleus.',
          ],
          [
            'motor',
            'Motor protein with cargo',
            [300, 172],
            'A protein that “walks” along a microtubule carrying a vesicle, powered by ATP.',
          ],
          ['nucleus', 'Nucleus', [150, 100], 'Held in position by the cytoskeleton’s fibers.'],
        ],
      ),
    ],
  },
  apoptosis: {
    steps: [
      [
        'A tidy ending',
        'Apoptosis is programmed cell death: a cell neatly takes itself apart on purpose. Unlike a cell bursting from injury, it doesn’t spill its contents, so it doesn’t harm or inflame nearby tissue.',
      ],
      [
        'When it’s needed',
        'Your body uses apoptosis to remove cells it doesn’t need or that could cause harm: the webbing between a baby’s fingers before birth, cells infected by viruses, and cells with badly damaged DNA that might become cancerous.',
      ],
      [
        'The cascade',
        'A “death signal,” from inside the cell (like serious DNA damage) or from outside (like an immune cell), switches on enzymes called caspases. Each activates more caspases in a chain reaction, and they cut apart the cell’s proteins and DNA from the inside.',
      ],
      [
        'Clean-up',
        'The cell shrinks and breaks into small, sealed packages. Each package displays an “eat me” signal on its surface, so immune cells (macrophages) swallow them quickly, leaving no mess.',
      ],
    ],
    goDeeperMore:
      'Why it matters: billions of your cells die by apoptosis every day, balancing the billions made by mitosis. Too little apoptosis lets damaged cells survive and can lead to cancer; too much can destroy cells that are needed, as in some brain diseases.\n\nCommon mix-up: apoptosis is not the same as necrosis. Necrosis is accidental death from injury (like a burn or lack of oxygen): the cell swells and bursts, and its leaking contents cause inflammation.',
    diagrams: [
      diagram(
        'Apoptosis vs necrosis',
        'Top: programmed, tidy cell death. Bottom: accidental death from injury, for comparison.',
        [
          circle(40, 70, 26, '#dbeafe', { stroke: '#2563eb', strokeWidth: 2, part: 'healthy' }),
          circle(40, 70, 9, '#7c3aed', { part: 'healthy' }),
          arrow([70, 70], [94, 70], { stroke: '#64748b', strokeWidth: 1.5 }),
          circle(122, 70, 18, '#dbeafe', { stroke: '#2563eb', strokeWidth: 2, part: 'shrink' }),
          circle(122, 70, 7, '#4c1d95', { part: 'shrink' }),
          arrow([144, 70], [168, 70], { stroke: '#64748b', strokeWidth: 1.5 }),
          circle(196, 70, 16, '#dbeafe', { stroke: '#2563eb', strokeWidth: 2, part: 'bleb' }),
          ...[
            [180, 56],
            [212, 58],
            [184, 88],
            [210, 86],
          ].map(([x, y]) =>
            circle(x, y, 6, '#dbeafe', { stroke: '#2563eb', strokeWidth: 1.5, part: 'bleb' }),
          ),
          arrow([224, 70], [248, 70], { stroke: '#64748b', strokeWidth: 1.5 }),
          ...[
            [264, 60],
            [280, 78],
            [270, 92],
            [292, 58],
          ].map(([x, y]) =>
            circle(x, y, 7, '#dbeafe', { stroke: '#2563eb', strokeWidth: 1.5, part: 'bodies' }),
          ),
          path('M330 60 C360 30 396 60 386 92 C376 120 334 116 326 92 Q340 86 336 76 Z', {
            fill: '#fef3c7',
            stroke: '#d97706',
            strokeWidth: 2,
            part: 'macrophage',
          }),
          circle(358, 84, 6, '#dbeafe', {
            stroke: '#2563eb',
            strokeWidth: 1.5,
            part: 'macrophage',
          }),
          arrow([302, 76], [324, 80], { stroke: '#64748b', strokeWidth: 1.5 }),
          text(200, 20, 'Apoptosis: neat and planned', { size: 10.5, bold: true, fill: '#1d4ed8' }),
          ...['healthy', 'shrinks', 'blebs', 'packages', 'eaten'].map((t, i) =>
            text([40, 122, 196, 278, 356][i], 124, t, { size: 8.5, fill: '#475569' }),
          ),
          path('M10 146 L390 146', { stroke: '#e2e8f0', strokeWidth: 1.5 }),
          text(200, 170, 'Necrosis: messy and accidental', {
            size: 10.5,
            bold: true,
            fill: '#b91c1c',
            part: 'necrosis',
          }),
          circle(60, 214, 24, '#fee2e2', { stroke: '#dc2626', strokeWidth: 2, part: 'necrosis' }),
          arrow([90, 214], [130, 214], { stroke: '#64748b', strokeWidth: 1.5 }),
          circle(176, 214, 36, '#fee2e2', {
            stroke: '#dc2626',
            strokeWidth: 2,
            dash: true,
            part: 'necrosis',
          }),
          ...[
            [228, 196],
            [236, 222],
            [248, 208],
            [222, 236],
          ].map(([x, y]) => circle(x, y, 3, '#dc2626', { part: 'necrosis' })),
          text(300, 206, 'swells, bursts, leaks', { size: 9, fill: '#b91c1c', part: 'necrosis' }),
          text(300, 222, '→ inflammation', {
            size: 9,
            bold: true,
            fill: '#b91c1c',
            part: 'necrosis',
          }),
        ],
        [
          [
            'healthy',
            'Signal received',
            [40, 34],
            'A healthy-looking cell gets a death signal, from DNA damage inside or from an immune cell outside.',
          ],
          [
            'shrink',
            'Cell shrinks',
            [122, 40],
            'Caspase enzymes switch on. The cell shrinks and its DNA clumps and is chopped up.',
          ],
          [
            'bleb',
            'Blebbing',
            [196, 40],
            'The membrane bulges outward in bubbles as the cytoskeleton is taken apart.',
          ],
          [
            'bodies',
            'Apoptotic bodies',
            [280, 40],
            'The cell breaks into small sealed packages, so nothing leaks out.',
          ],
          [
            'macrophage',
            'Clean-up crew',
            [380, 50],
            'Macrophages spot an “eat me” signal on the packages and swallow them.',
          ],
          [
            'necrosis',
            'Necrosis',
            [100, 186],
            'Death by injury: the cell swells and bursts, and the spilled contents trigger inflammation.',
          ],
        ],
      ),
    ],
  },
  autophagy: {
    steps: [
      [
        'Housekeeping',
        'Autophagy means “self-eating.” A cell wraps old, damaged or unneeded parts (even whole worn-out mitochondria) inside a double membrane, forming a bubble called an autophagosome, like bagging up clutter.',
      ],
      [
        'Digest and reuse',
        'The autophagosome merges with a lysosome, whose enzymes break the contents down into amino acids, sugars and fats. These are released back into the cell to build new parts or to be burned for energy.',
      ],
      [
        'Switched on by hunger',
        'When nutrients are scarce, for example during fasting, cells turn autophagy up to free building blocks and fuel from things they can spare. When food is plentiful, signals turn it down.',
      ],
    ],
    goDeeperMore:
      'Why it matters: autophagy keeps cells healthy by clearing out damage before it builds up. Nerve cells, which can’t be replaced easily, rely on it heavily, and faulty autophagy is linked to diseases like Parkinson’s and Alzheimer’s, where clumps of damaged protein collect.\n\nYoshinori Ohsumi won the 2016 Nobel Prize in Physiology or Medicine for discovering the genes that control autophagy, working with yeast.\n\nCommon mix-up: autophagy is not cell death. The cell digests some of its own parts so that the rest of it survives.',
    diagrams: [
      diagram(
        'Autophagy: recycling worn-out parts',
        'A damaged mitochondrion is wrapped up, digested by a lysosome, and broken into building blocks the cell can reuse.',
        [
          ellipse(56, 120, 30, 16, '#fdba74', {
            stroke: '#c2410c',
            strokeWidth: 2,
            part: 'damaged',
          }),
          path('M36 120 L44 114 L50 126 L58 114 L66 126 L74 120', {
            stroke: '#c2410c',
            strokeWidth: 1.5,
            part: 'damaged',
          }),
          path('M44 112 L50 118 M64 124 L70 130', {
            stroke: '#7f1d1d',
            strokeWidth: 2,
            part: 'damaged',
          }),
          arrow([92, 120], [114, 120], { stroke: '#64748b', strokeWidth: 1.5 }),
          ellipse(160, 120, 34, 20, '#fdba74', {
            opacity: 0.8,
            stroke: '#c2410c',
            part: 'phagophore',
          }),
          path('M124 104 C130 76 192 76 198 104 M124 136 C130 164 190 164 196 136', {
            stroke: '#2563eb',
            strokeWidth: 3,
            part: 'phagophore',
          }),
          arrow([200, 120], [222, 120], { stroke: '#64748b', strokeWidth: 1.5 }),
          circle(262, 120, 34, '#dbeafe', {
            stroke: '#2563eb',
            strokeWidth: 3,
            part: 'autophagosome',
          }),
          circle(262, 120, 29, 'none', {
            stroke: '#2563eb',
            strokeWidth: 1.5,
            part: 'autophagosome',
          }),
          ellipse(262, 120, 18, 10, '#fdba74', {
            opacity: 0.8,
            stroke: '#c2410c',
            part: 'autophagosome',
          }),
          circle(262, 196, 14, '#c4b5fd', { stroke: '#6d28d9', strokeWidth: 2, part: 'lysosome' }),
          arrow([262, 180], [262, 158], { stroke: '#6d28d9', strokeWidth: 1.5, part: 'lysosome' }),
          arrow([298, 120], [320, 120], { stroke: '#64748b', strokeWidth: 1.5 }),
          ...[
            [336, 104],
            [352, 118],
            [340, 134],
            [362, 138],
            [370, 104],
            [384, 124],
          ].map(([x, y], i) =>
            circle(
              x,
              y,
              4.5,
              ['#fca5a5', '#fde047', '#86efac', '#93c5fd', '#fdba74', '#c4b5fd'][i],
              { part: 'reuse' },
            ),
          ),
          text(56, 154, 'worn-out part', { size: 8.5, fill: '#475569', part: 'damaged' }),
          text(160, 180, 'wrapping', { size: 8.5, fill: '#475569', part: 'phagophore' }),
          text(262, 228, 'lysosome', { size: 9, bold: true, fill: '#6d28d9', part: 'lysosome' }),
          text(360, 164, 'reused', { size: 9, bold: true, fill: '#15803d', part: 'reuse' }),
          rect(10, 18, 380, 34, '#f8fafc', { r: 10, stroke: '#e2e8f0', part: 'hunger' }),
          text(200, 40, 'Turned up by hunger and stress · turned down when food is plentiful', {
            size: 9,
            bold: true,
            fill: '#475569',
            part: 'hunger',
          }),
        ],
        [
          [
            'damaged',
            'Worn-out part',
            [56, 92],
            'Here, a damaged mitochondrion. Leaving it could harm the cell, so it is marked for removal.',
          ],
          [
            'phagophore',
            'Wrapping membrane',
            [160, 72],
            'A cup-shaped membrane grows around the target until it seals shut.',
          ],
          [
            'autophagosome',
            'Autophagosome',
            [296, 88],
            'A bubble with a double membrane holding the cargo.',
          ],
          [
            'lysosome',
            'Lysosome fuses',
            [290, 196],
            'A lysosome merges with the autophagosome and adds its digestive enzymes.',
          ],
          [
            'reuse',
            'Building blocks reused',
            [384, 92],
            'Amino acids, sugars and fats return to the cytoplasm to build new parts or supply energy.',
          ],
          [
            'hunger',
            'Control',
            [392, 64],
            'Low nutrients switch autophagy on; plenty of food switches it down.',
          ],
        ],
      ),
    ],
  },
  endosymbiosis: {
    steps: [
      [
        'A bigger cell',
        'Around 2 billion years ago, all life was single-celled. A larger cell, related to today’s archaea, lived alongside smaller bacteria that could use oxygen to release lots of energy from food.',
      ],
      [
        'Swallowed, not digested',
        'The larger cell swallowed one of these bacteria but, instead of digesting it, kept it alive inside. The bacterium got shelter and food; the host got extra energy. Both benefited: a partnership called symbiosis.',
      ],
      [
        'A permanent team',
        'Over many generations, the two became completely dependent on each other. The bacterium passed most of its genes to the host and became the mitochondrion found in almost every cell of plants, animals and fungi today.',
      ],
      [
        'Twice!',
        'Later, a cell that already had mitochondria swallowed a photosynthetic bacterium (a cyanobacterium). It became the chloroplast, giving rise to algae and plants, which is why plant cells have both mitochondria and chloroplasts.',
      ],
    ],
    goDeeperMore:
      'Why it matters: endosymbiosis explains how complex (eukaryotic) cells, and so all plants and animals, came to exist. Biologist Lynn Margulis championed the idea in the 1960s, when it was widely doubted; DNA evidence later confirmed it.\n\nThe evidence is strong: mitochondria and chloroplasts have two membranes (one from the bacterium, one from the host’s swallowing), their own circular DNA like bacteria, bacteria-sized ribosomes, and they divide by splitting in two like bacteria.\n\nCommon mix-up: mitochondria aren’t “bacteria living in our cells” today; they can’t survive on their own anymore, because most of their genes have moved into the cell’s nucleus.',
    diagrams: [
      diagram(
        'How cells got mitochondria and chloroplasts',
        'Top: a host cell swallows an oxygen-using bacterium, which becomes the mitochondrion. Bottom: a second event adds chloroplasts in the ancestors of plants.',
        [
          circle(44, 70, 30, '#fef3c7', { stroke: '#d97706', strokeWidth: 2, part: 'host' }),
          bacterium(98, 70, 'aerobe'),
          arrow([116, 70], [140, 70], { stroke: '#64748b', strokeWidth: 1.5 }),
          circle(180, 70, 32, '#fef3c7', { stroke: '#d97706', strokeWidth: 2, part: 'engulf' }),
          circle(180, 70, 14, 'none', { stroke: '#d97706', strokeWidth: 1.5, part: 'engulf' }),
          bacterium(180, 70, 'engulf'),
          arrow([214, 70], [238, 70], { stroke: '#64748b', strokeWidth: 1.5 }),
          circle(282, 70, 36, '#fef3c7', { stroke: '#d97706', strokeWidth: 2, part: 'mito' }),
          circle(270, 66, 9, '#e9d5ff', { stroke: '#7c3aed', part: 'mito' }),
          ellipse(296, 82, 13, 7, '#fdba74', { stroke: '#c2410c', strokeWidth: 1.5, part: 'mito' }),
          ellipse(292, 52, 11, 6, '#fdba74', { stroke: '#c2410c', strokeWidth: 1.5, part: 'mito' }),
          text(282, 124, 'cells with mitochondria', { size: 8.5, fill: '#475569', part: 'mito' }),
          rect(240, 148, 30, 16, '#4ade80', {
            r: 8,
            stroke: '#15803d',
            strokeWidth: 2,
            part: 'cyano',
          }),
          arrow([282, 108], [282, 196], {
            bend: -60,
            stroke: '#64748b',
            strokeWidth: 1.5,
            dash: true,
          }),
          circle(200, 210, 38, '#f0fdf4', { stroke: '#16a34a', strokeWidth: 2, part: 'chloro' }),
          circle(188, 204, 9, '#e9d5ff', { stroke: '#7c3aed', part: 'chloro' }),
          ellipse(214, 224, 13, 7, '#fdba74', {
            stroke: '#c2410c',
            strokeWidth: 1.5,
            part: 'chloro',
          }),
          ellipse(210, 192, 14, 7, '#4ade80', {
            stroke: '#15803d',
            strokeWidth: 1.5,
            part: 'chloro',
          }),
          ellipse(184, 228, 12, 6, '#4ade80', {
            stroke: '#15803d',
            strokeWidth: 1.5,
            part: 'chloro',
          }),
          text(200, 256, '→ algae and plants', { size: 8.5, fill: '#475569', part: 'chloro' }),
          rect(16, 150, 140, 98, '#f8fafc', { r: 10, stroke: '#e2e8f0', part: 'evidence' }),
          text(86, 168, 'Evidence', { size: 10, bold: true, part: 'evidence' }),
          ...[
            'two membranes',
            'own circular DNA',
            'bacteria-like ribosomes',
            'divide by splitting',
          ].map((t, i) =>
            text(26, 188 + i * 16, `• ${t}`, { anchor: 'start', size: 8.5, part: 'evidence' }),
          ),
        ],
        [
          [
            'host',
            'Host cell',
            [44, 32],
            'A large single cell, related to today’s archaea, able to swallow smaller cells.',
          ],
          [
            'aerobe',
            'Oxygen-using bacterium',
            [98, 46],
            'A small bacterium very good at releasing energy from food using oxygen.',
          ],
          [
            'engulf',
            'Swallowed, not digested',
            [180, 30],
            'The bacterium lives on inside the host, wrapped in an extra membrane from being swallowed.',
          ],
          [
            'mito',
            'Mitochondria',
            [326, 40],
            'Over millions of years, the bacterium became the mitochondrion, the cell’s powerhouse.',
          ],
          [
            'cyano',
            'Cyanobacterium',
            [284, 156],
            'A photosynthetic bacterium, swallowed later by a cell that already had mitochondria.',
          ],
          [
            'chloro',
            'Chloroplasts',
            [244, 196],
            'The cyanobacterium became the chloroplast, so plant cells have both organelles.',
          ],
          [
            'evidence',
            'Evidence',
            [148, 148],
            'Features shared by mitochondria, chloroplasts and bacteria, but not by the rest of the cell.',
          ],
        ],
      ),
    ],
  },
  'cilia-flagella': {
    steps: [
      [
        'Tiny oars',
        'Cilia are short, hair-like structures that stick out from some cells, often in large numbers. They beat back and forth in coordinated waves, like rowers pulling oars in time.',
      ],
      [
        'Long whips',
        'Flagella are longer, usually one or a few per cell. They whip back and forth to push the cell along; a human sperm cell swims using a single flagellum. (Bacterial flagella are built differently and spin like a propeller.)',
      ],
      [
        'Moving fluid',
        'Cilia on cells that stay still move fluid past them instead. In your windpipe, cilia sweep sticky mucus, with trapped dust and germs, up toward your throat, where it is swallowed or coughed out.',
      ],
    ],
    goDeeperMore:
      'Why it matters: smoking paralyzes and damages the cilia in the airways, so mucus builds up instead of being swept away, which causes “smoker’s cough” and more chest infections. Cilia in the oviducts also help move eggs toward the uterus.\n\nInside, cilia and flagella of animal and plant cells share the same “9 + 2” pattern of microtubules: nine pairs in a ring around two in the middle. Motor proteins make the pairs slide past each other, which bends the cilium.\n\nCommon mix-up: cilia and flagella are not made of the cell membrane alone; they are supported by microtubules from the cytoskeleton.',
    diagrams: [
      diagram(
        'Cilia and flagella',
        'Left: ciliated cells lining the windpipe sweep mucus upward. Right: a sperm cell swims with one flagellum. Inset: the 9 + 2 pattern of microtubules inside both.',
        [
          rect(10, 180, 210, 70, '#fce7f3', {
            r: 6,
            stroke: '#db2777',
            strokeWidth: 1.5,
            part: 'cells',
          }),
          ...[46, 116, 186].map((x) =>
            path(`M${x - 35} 180 L${x - 35} 250 M${x + 35} 180 L${x + 35} 250`, {
              stroke: '#db2777',
              strokeWidth: 1,
              part: 'cells',
            }),
          ),
          ...[46, 116, 186].map((x) =>
            circle(x, 216, 9, '#e9d5ff', { stroke: '#7c3aed', part: 'cells' }),
          ),
          ...Array.from({ length: 19 }, (_, i) => 18 + i * 10.6).map((x, i) =>
            path(
              `M${x.toFixed(1)} 180 Q${(x + (i % 2 ? 6 : 10)).toFixed(1)} 160 ${(x + (i % 2 ? 4 : 12)).toFixed(1)} 144`,
              {
                stroke: '#16a34a',
                strokeWidth: 2.5,
                part: 'cilia',
              },
            ),
          ),
          path(
            'M10 132 Q60 122 110 132 Q160 142 220 130 L220 112 Q160 122 110 112 Q60 102 10 112 Z',
            { fill: '#fef9c3', stroke: '#ca8a04', strokeWidth: 1.5, part: 'mucus' },
          ),
          ...[
            [44, 118],
            [130, 124],
            [190, 118],
          ].map(([x, y]) => circle(x, y, 3, '#78716c', { part: 'mucus' })),
          arrow([30, 94], [200, 94], { stroke: '#ca8a04', strokeWidth: 2.5, part: 'mucus' }),
          text(115, 84, 'mucus swept toward the throat', {
            size: 8.5,
            fill: '#a16207',
            part: 'mucus',
          }),
          ellipse(268, 200, 14, 10, '#dbeafe', {
            stroke: '#2563eb',
            strokeWidth: 2,
            part: 'sperm',
          }),
          path('M282 200 Q300 186 316 200 Q332 214 348 200 Q364 186 380 200', {
            stroke: '#2563eb',
            strokeWidth: 2.5,
            part: 'flagellum',
          }),
          arrow([270, 232], [240, 232], { stroke: '#2563eb', strokeWidth: 2, part: 'sperm' }),
          text(316, 236, 'swims this way ←', { size: 8.5, fill: '#1d4ed8', part: 'sperm' }),
          circle(320, 70, 46, '#f8fafc', { stroke: '#94a3b8', strokeWidth: 1.5, part: 'axoneme' }),
          ...Array.from({ length: 9 }, (_, i) => {
            const a = (i / 9) * 2 * Math.PI;
            return [
              circle(320 + 32 * Math.cos(a) - 3, 70 + 32 * Math.sin(a), 4.5, '#86efac', {
                stroke: '#15803d',
                strokeWidth: 1,
                part: 'axoneme',
              }),
              circle(320 + 32 * Math.cos(a) + 4, 70 + 32 * Math.sin(a), 4.5, '#86efac', {
                stroke: '#15803d',
                strokeWidth: 1,
                part: 'axoneme',
              }),
            ];
          }).flat(),
          circle(314, 70, 4.5, '#86efac', { stroke: '#15803d', strokeWidth: 1, part: 'axoneme' }),
          circle(326, 70, 4.5, '#86efac', { stroke: '#15803d', strokeWidth: 1, part: 'axoneme' }),
          text(320, 132, 'cross-section: 9 + 2', {
            size: 9,
            bold: true,
            fill: '#475569',
            part: 'axoneme',
          }),
        ],
        [
          [
            'cells',
            'Airway lining cells',
            [28, 236],
            'Cells lining the windpipe and bronchi, each covered in hundreds of cilia.',
          ],
          [
            'cilia',
            'Cilia',
            [228, 160],
            'Short hairs that beat in coordinated waves, each stroke pushing the mucus a tiny bit further.',
          ],
          [
            'mucus',
            'Mucus layer',
            [20, 100],
            'Sticky mucus traps dust, pollen and germs before they reach the lungs.',
          ],
          ['sperm', 'Sperm cell', [256, 176], 'A cell that swims using one flagellum.'],
          [
            'flagellum',
            'Flagellum',
            [386, 180],
            'A long whip that beats in waves to push the cell forward.',
          ],
          [
            'axoneme',
            '9 + 2 microtubules',
            [376, 30],
            'Nine pairs of microtubules in a ring around two central ones. Motor proteins slide the pairs to make the bend.',
          ],
        ],
      ),
    ],
  },
  'cell-signaling': {
    steps: [
      [
        'Messages',
        'Cells constantly send each other chemical messages. Hormones travel through the blood, neurotransmitters jump between nerve cells, and growth factors tell nearby cells when to divide.',
      ],
      [
        'Receptors',
        'A message only affects cells that have the matching receptor: a protein whose shape fits the signal, like a key fitting a lock. Every other cell simply ignores it, which is how one hormone can target just a few tissues.',
      ],
      [
        'Relay inside',
        'When the signal binds, the receptor changes shape and triggers a chain of reactions inside the cell, passed along like a relay race. Each step can amplify the message, so one signal molecule can lead to thousands of responses.',
      ],
      [
        'Blocking',
        'Many medicines work by fitting into a receptor without switching it on, blocking the real signal. Antihistamines block histamine receptors to calm allergies, and beta blockers block adrenaline receptors to slow the heart.',
      ],
    ],
    goDeeperMore:
      'Why it matters: almost everything your body does is coordinated by signals, from blood sugar control (insulin) to the fight-or-flight response (adrenaline) to wound healing (growth factors). When signaling goes wrong, the results can be serious: many cancers involve growth-factor signaling that is stuck “on.”\n\nCommon mix-up: the signal molecule usually doesn’t enter the cell. Most hormones and neurotransmitters bind to receptors on the surface, and the message is passed inside by the relay. (Steroid hormones like estrogen are an exception: they slip through the membrane.)',
    diagrams: [
      diagram(
        'How a cell receives a signal',
        'A signal molecule fits a receptor on its target cell, triggering a relay inside that leads to a response. A cell without the receptor ignores the signal.',
        [
          circle(46, 60, 30, '#fef3c7', { stroke: '#d97706', strokeWidth: 2, part: 'sender' }),
          text(46, 104, 'signaling cell', { size: 8.5, fill: '#92400e', part: 'sender' }),
          ...[
            [96, 46],
            [124, 62],
            [150, 50],
          ].map(([x, y]) =>
            path(`M${x - 6} ${y + 5} L${x} ${y - 6} L${x + 6} ${y + 5} Z`, {
              fill: '#dc2626',
              part: 'signal',
            }),
          ),
          arrow([80, 60], [176, 92], { stroke: '#94a3b8', strokeWidth: 1.5, dash: true }),
          path('M170 112 L392 112', { stroke: MEMBRANE, strokeWidth: 8, part: 'target' }),
          rect(180, 100, 22, 34, '#c4b5fd', {
            r: 6,
            stroke: '#6d28d9',
            strokeWidth: 2,
            part: 'receptor',
          }),
          path('M185 100 L191 90 L197 100', {
            fill: '#fff',
            stroke: '#6d28d9',
            strokeWidth: 2,
            part: 'receptor',
          }),
          path('M185 89 L191 79 L197 89 Z', { fill: '#dc2626', part: 'signal' }),
          ...[
            [222, 160],
            [262, 180],
            [302, 160],
          ].map(([x, y], i) =>
            circle(x, y, 10, ['#bfdbfe', '#93c5fd', '#60a5fa'][i], {
              stroke: '#2563eb',
              part: 'relay',
            }),
          ),
          arrow([196, 136], [214, 154], { stroke: '#2563eb', strokeWidth: 1.5, part: 'relay' }),
          arrow([232, 166], [252, 176], { stroke: '#2563eb', strokeWidth: 1.5, part: 'relay' }),
          arrow([272, 176], [292, 166], { stroke: '#2563eb', strokeWidth: 1.5, part: 'relay' }),
          arrow([312, 166], [334, 196], { stroke: '#2563eb', strokeWidth: 1.5, part: 'relay' }),
          circle(352, 214, 22, '#e9d5ff', { stroke: '#7c3aed', strokeWidth: 2, part: 'response' }),
          text(352, 218, 'gene on', { size: 8, bold: true, part: 'response' }),
          text(270, 246, 'target cell (inside)', { size: 8.5, fill: '#475569', part: 'target' }),
          rect(326, 98, 22, 30, '#e2e8f0', {
            r: 6,
            stroke: '#64748b',
            strokeWidth: 2,
            part: 'blocker',
          }),
          path('M331 98 L337 88 L343 98', {
            fill: '#fff',
            stroke: '#64748b',
            strokeWidth: 2,
            part: 'blocker',
          }),
          rect(330, 82, 14, 10, '#334155', { r: 2, part: 'blocker' }),
          text(337, 72, 'drug blocks', { size: 8.5, bold: true, fill: '#334155', part: 'blocker' }),
          circle(50, 200, 26, '#f1f5f9', { stroke: '#94a3b8', strokeWidth: 2, part: 'nontarget' }),
          path('M70 160 L60 176 M76 166 L64 178', {
            stroke: '#94a3b8',
            strokeWidth: 2,
            part: 'nontarget',
          }),
          text(50, 244, 'no receptor: ignores it', {
            size: 8.5,
            fill: '#64748b',
            part: 'nontarget',
          }),
        ],
        [
          [
            'sender',
            'Signaling cell',
            [80, 26],
            'Releases signal molecules, such as a hormone from a gland.',
          ],
          [
            'signal',
            'Signal molecule',
            [150, 28],
            'The “message.” Its shape matters, because it must fit a receptor.',
          ],
          [
            'receptor',
            'Receptor',
            [214, 82],
            'A protein in the target cell’s membrane whose binding site fits the signal like a lock fits a key.',
          ],
          [
            'relay',
            'Relay inside the cell',
            [244, 140],
            'Binding sets off a chain of reactions, each step amplifying the message.',
          ],
          [
            'response',
            'Response',
            [384, 196],
            'The final effect, such as switching a gene on, opening a channel, or releasing stored sugar.',
          ],
          [
            'target',
            'Target cell',
            [178, 232],
            'Only cells with the matching receptor respond to this signal.',
          ],
          [
            'blocker',
            'Blocking drug',
            [370, 80],
            'A molecule that fits the receptor but doesn’t switch it on, so the real signal can’t bind.',
          ],
          [
            'nontarget',
            'Cell without the receptor',
            [20, 170],
            'The signal reaches this cell too, but with no receptor, nothing happens.',
          ],
        ],
      ),
    ],
  },
  'stem-cells': {
    steps: [
      [
        'Unspecialized',
        'Most of your cells have one job: a muscle cell contracts, a red blood cell carries oxygen. Stem cells haven’t picked a job yet. They are like blank, unused puzzle pieces that can still be shaped to fit.',
      ],
      [
        'Two talents',
        'Stem cells can do two things. They can divide to make more stem cells (self-renewal), keeping the supply going, and they can turn into specialized cells (differentiation) when the body needs replacements.',
      ],
      [
        'Levels of power',
        'Early embryo stem cells can become almost any cell type. Adult stem cells, such as those in bone marrow, are more limited: they only make the cells of their own tissue, like all the different blood cells.',
      ],
    ],
    goDeeperMore:
      'Why it matters: your bone marrow’s stem cells make about 2 million new red blood cells every second, and stem cells in your skin and gut constantly replace cells that wear out. Bone marrow transplants, which give patients healthy blood stem cells, are used to treat leukemia.\n\nScientists can now turn ordinary skin cells back into stem-like cells (induced pluripotent stem cells), which are used to study diseases and test new treatments.\n\nCommon mix-up: stem cells don’t contain different DNA from other cells. All your cells share the same DNA; what differs is which genes are switched on.',
  },
  telomeres: {
    steps: [
      [
        'Protective caps',
        'At each end of every chromosome is a telomere: thousands of repeats of the same short DNA sequence (TTAGGG). They don’t carry instructions for proteins; they protect the important genes, like the plastic tips on shoelaces stop them from fraying.',
      ],
      [
        'Shrinking',
        'The machinery that copies DNA can’t copy the very tip of a chromosome. So every time a cell divides, its telomeres get a little shorter. The telomere is “used up” instead of the genes.',
      ],
      [
        'Time’s up',
        'After roughly 50 divisions, telomeres become too short, and the cell stops dividing (or self-destructs). This limit is called the Hayflick limit, and it acts like a built-in counter on how many times most cells can divide.',
      ],
      [
        'Telomerase',
        'An enzyme called telomerase can add the repeats back. Stem cells and egg and sperm cells use it, so their telomeres stay long. Most cancer cells switch it back on too, which is one reason they can divide endlessly.',
      ],
    ],
    goDeeperMore:
      'Why it matters: telomere shortening is one of the processes linked to aging, since tissues gradually lose the ability to replace their cells. Studies have linked chronic stress, smoking and poor sleep to shorter telomeres, though scientists are still working out cause and effect.\n\nThe 2009 Nobel Prize in Physiology or Medicine went to Elizabeth Blackburn, Carol Greider and Jack Szostak for discovering how telomeres and telomerase protect chromosomes.\n\nCommon mix-up: switching on telomerase isn’t a simple anti-aging cure. Because cancer cells rely on telomerase, boosting it could raise cancer risk; blocking it is being studied as a cancer treatment.',
    diagrams: [
      diagram(
        'Telomeres shorten with each division',
        'The same chromosome after more and more cell divisions. The red end caps (telomeres) shrink until the cell stops dividing.',
        [
          ...[
            [44, 30, 'new cell', 'fresh'],
            [104, 22, '~20 divisions', 'shorter'],
            [164, 12, '~40 divisions', 'shorter'],
            [224, 4, '~50: stops', 'limit'],
          ].flatMap(([y, cap, label, part]) => {
            const yy = y as number;
            const c = cap as number;
            return [
              rect(70 + 30 - c, yy, c, 26, '#f87171', {
                r: 6,
                stroke: '#b91c1c',
                strokeWidth: 1.5,
                part: 'telomere',
              }),
              rect(100, yy, 200, 26, '#93c5fd', {
                r: 4,
                stroke: '#1d4ed8',
                strokeWidth: 1.5,
                part: part as string,
              }),
              rect(300, yy, c, 26, '#f87171', {
                r: 6,
                stroke: '#b91c1c',
                strokeWidth: 1.5,
                part: 'telomere',
              }),
              text(200, yy + 17, 'genes', {
                size: 9,
                bold: true,
                fill: '#1e3a8a',
                part: part as string,
              }),
              text(14, yy + 17, label as string, {
                anchor: 'start',
                size: 7.5,
                fill: '#475569',
                part: part as string,
              }),
            ];
          }),
          path('M376 40 L376 228', { stroke: '#64748b', strokeWidth: 1.5 }),
          arrow([376, 40], [376, 228], { stroke: '#64748b', strokeWidth: 1.5 }),
          text(370, 140, 'divisions', { anchor: 'end', size: 8.5, fill: '#64748b' }),
          rect(310, 4, 86, 22, '#dcfce7', { r: 8, stroke: '#16a34a', part: 'telomerase' }),
          text(353, 19, '+ telomerase', {
            size: 8.5,
            bold: true,
            fill: '#15803d',
            part: 'telomerase',
          }),
          text(200, 20, '(cap lengths exaggerated)', { size: 8, fill: '#94a3b8' }),
        ],
        [
          [
            'telomere',
            'Telomeres',
            [62, 6],
            'Repeated TTAGGG sequences at each end. They protect the genes, like shoelace tips.',
          ],
          [
            'fresh',
            'Long telomeres',
            [312, 72],
            'A young cell’s telomeres are thousands of repeats long.',
          ],
          [
            'shorter',
            'Shortening',
            [312, 134],
            'Each division loses some repeats, because the copying machinery can’t reach the very end.',
          ],
          [
            'limit',
            'Hayflick limit',
            [312, 196],
            'When telomeres get too short, the cell stops dividing, after roughly 50 divisions for many human cells.',
          ],
          [
            'telomerase',
            'Telomerase',
            [298, 15],
            'An enzyme that rebuilds telomeres. Active in stem cells, egg and sperm cells, and most cancer cells.',
          ],
        ],
      ),
    ],
  },
};
