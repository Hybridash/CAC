import type { Concept, SceneElement } from '../../types';

// --- Meiosis scene helpers: red = from mom, blue = from dad; long pair A, short pair B.
const RED = '#ef4444';
const BLUE = '#3b82f6';
const cell = (id: string, x: number, size: number, opacity = 1): SceneElement => ({
  id,
  shape: 'ring',
  color: '#a78bfa',
  x,
  y: 50,
  size,
  opacity,
});
const chr = (
  id: string,
  color: string,
  x: number,
  y: number,
  long: boolean,
  rotate = 0,
): SceneElement => ({ id, shape: 'chromosome', color, x, y, size: long ? 1 : 0.7, rotate });
const chromatid = (
  id: string,
  color: string,
  x: number,
  y: number,
  long: boolean,
): SceneElement => ({ id, shape: 'rod', color, x, y, size: long ? 0.8 : 0.55, rotate: 90 });

export const cell_: Concept[] = [
  {
    id: 'mitosis',
    title: 'Mitosis',
    category: 'cell',
    flagship: true,
    tags: ['cell division', 'chromosomes', 'growth', 'cell cycle', 'cancer', 'spindle'],
    aliases: ['cell division', 'how cells divide', 'cell cycle', 'PMAT'],
    difficulty: 2,
    rarity: 'common',
    summary: 'One cell becomes two identical cells — the way you grow and heal.',
    steps: [
      {
        title: 'Interphase: copy',
        text: 'The cell grows and copies every chromosome, so each one becomes an X of two identical halves.',
      },
      {
        title: 'Prophase: pack up',
        text: 'Chromosomes coil up tight, the nucleus breaks down, and spindle fibers start to grow.',
      },
      {
        title: 'Metaphase: line up',
        text: 'Chromosomes line up single-file across the middle of the cell.',
      },
      {
        title: 'Anaphase: pull apart',
        text: 'Spindle fibers pull the two halves of each X to opposite ends.',
      },
      {
        title: 'Telophase: split',
        text: 'New nuclei form and the cell pinches in two (cytokinesis).',
      },
      {
        title: 'Two identical cells',
        text: 'Each new cell has exactly the same chromosomes as the original.',
      },
      {
        title: 'When control fails',
        text: 'Checkpoints normally stop faulty division. If they break, cells can divide out of control: cancer.',
      },
    ],
    interaction: { template: 'flagship', config: { component: 'mitosis' } },
    goDeeper:
      'The cell cycle has interphase (G1, S and G2) and the mitotic (M) phase. DNA is replicated in S phase, producing sister chromatids held together at the centromere by cohesin. In prophase, chromatin condenses and the mitotic spindle forms from centrosomes; in prometaphase, the nuclear envelope breaks down and microtubules attach to kinetochores. The spindle assembly checkpoint holds the cell in metaphase until every chromosome is attached from both poles; then separase cuts cohesin and anaphase begins. Cytokinesis in animal cells uses a contractile ring of actin and myosin.\n\nIn reality, it’s a bit more complicated: human cells have 46 chromosomes (the lesson shows 4), and textbooks often add prometaphase as a separate stage. Plant cells don’t pinch — they build a cell plate down the middle. Cancer usually needs several mutations, typically in genes that push the cycle forward (oncogenes) and in genes that act as brakes (tumor suppressors like p53).',
    quiz: [
      {
        kind: 'mc',
        prompt: 'What happens in metaphase?',
        options: [
          'DNA is copied',
          'Chromosomes line up in the middle',
          'The cell splits in two',
          'Sister chromatids are pulled apart',
        ],
        answer: 1,
        explain: 'In metaphase, chromosomes line up single-file across the cell’s middle.',
      },
      {
        kind: 'mc',
        prompt: 'How do the two daughter cells compare to the parent cell?',
        options: [
          'They have half the chromosomes',
          'They are genetically identical',
          'They are all different',
          'One gets all the DNA',
        ],
        answer: 1,
        explain: 'Mitosis makes identical copies — unlike meiosis.',
      },
      {
        kind: 'predict',
        scenario:
          'A mutation breaks the checkpoint that stops cells from dividing when they shouldn’t.',
        prompt: 'What is most likely to happen?',
        options: [
          'Cells stop dividing forever',
          'Cells divide out of control and may form a tumor',
          'Cells become bacteria',
          'Nothing at all',
        ],
        answer: 1,
        explain: 'Without checkpoints, cells keep dividing — the hallmark of cancer.',
      },
    ],
    relatedConcepts: ['meiosis'],
    funFact:
      'Your body makes roughly 3.8 million new cells every second, mostly blood and gut cells.',
  },
  {
    id: 'meiosis',
    title: 'Meiosis',
    category: 'cell',
    tags: ['sex cells', 'gametes', 'chromosomes', 'crossing over', 'haploid', 'sperm', 'egg'],
    aliases: ['cell division for sex cells', 'reduction division', 'making gametes'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: [],
    summary:
      'Meiosis turns one cell into four egg or sperm cells, each with half the chromosomes, and all different.',
    steps: [
      {
        title: 'Copy first',
        text: 'Before meiosis, every chromosome is copied, so each looks like an X of two identical halves.',
      },
      {
        title: 'Partners pair up',
        text: 'Matching chromosomes from mom and dad pair up and swap pieces (crossing over).',
      },
      {
        title: 'Division 1',
        text: 'The pairs are pulled apart into two cells. Which way each pair goes is random.',
      },
      {
        title: 'Division 2',
        text: 'Then the two halves of each X split, making four cells with half the usual chromosomes.',
      },
    ],
    interaction: {
      template: 'timeline',
      config: {
        prompt:
          'Drag the slider (or press play) to watch meiosis. Red chromosomes came from mom, blue from dad.',
        background: '#faf5ff',
        frames: [
          {
            id: 'interphase',
            label: 'Interphase',
            text: 'The cell copies its DNA. Chromosomes are loose threads inside the nucleus.',
            elements: [
              cell('c1', 50, 6.4),
              { id: 'nuc', shape: 'ring', color: '#c4b5fd', x: 50, y: 50, size: 3.4 },
              { id: 'A1', shape: 'wave', color: RED, x: 45, y: 44, size: 0.9 },
              { id: 'A2', shape: 'wave', color: BLUE, x: 56, y: 46, size: 0.9 },
              { id: 'B1', shape: 'wave', color: RED, x: 46, y: 57, size: 0.6 },
              { id: 'B2', shape: 'wave', color: BLUE, x: 55, y: 58, size: 0.6 },
            ],
          },
          {
            id: 'prophase1',
            label: 'Prophase I',
            text: 'Chromosomes coil up. Matching pairs find each other and swap pieces — crossing over mixes mom’s and dad’s genes.',
            elements: [
              cell('c1', 50, 6.4),
              { id: 'nuc', shape: 'ring', color: '#c4b5fd', x: 50, y: 50, size: 3.4, opacity: 0.3 },
              chr('A1', RED, 47, 42, true),
              chr('A2', BLUE, 53, 42, true),
              chr('B1', RED, 47, 60, false),
              chr('B2', BLUE, 53, 60, false),
              { id: 'swap', emoji: '🔀', x: 50, y: 30, size: 0.6 },
            ],
          },
          {
            id: 'metaphase1',
            label: 'Metaphase I',
            text: 'The PAIRS line up along the middle of the cell, side by side.',
            elements: [
              cell('c1', 50, 6.4),
              chr('A1', RED, 46, 40, true),
              chr('A2', BLUE, 54, 40, true),
              chr('B2', BLUE, 46, 62, false),
              chr('B1', RED, 54, 62, false),
              { id: 'eq', shape: 'rect', color: '#e9d5ff', x: 50, y: 51, size: 0.3, opacity: 0.8 },
            ],
          },
          {
            id: 'anaphase1',
            label: 'Anaphase I',
            text: 'Partners are pulled to opposite ends. Each side gets one of each pair — but which one is random.',
            elements: [
              cell('c1', 50, 6.4),
              chr('A1', RED, 37, 40, true),
              chr('A2', BLUE, 63, 40, true),
              chr('B2', BLUE, 37, 62, false),
              chr('B1', RED, 63, 62, false),
            ],
          },
          {
            id: 'telophase1',
            label: 'Telophase I',
            text: 'The cell splits in two. Each new cell has half as many chromosomes (but each is still an X).',
            elements: [
              cell('c1', 28, 4.4),
              cell('c2', 72, 4.4),
              chr('A1', RED, 28, 40, true),
              chr('B2', BLUE, 28, 62, false),
              chr('A2', BLUE, 72, 40, true),
              chr('B1', RED, 72, 62, false),
            ],
          },
          {
            id: 'metaphase2',
            label: 'Metaphase II',
            text: 'In each cell, chromosomes line up single-file along the middle.',
            elements: [
              cell('c1', 28, 4.4),
              cell('c2', 72, 4.4),
              chr('A1', RED, 28, 42, true, 90),
              chr('B2', BLUE, 28, 60, false, 90),
              chr('A2', BLUE, 72, 42, true, 90),
              chr('B1', RED, 72, 60, false, 90),
            ],
          },
          {
            id: 'anaphase2',
            label: 'Anaphase II',
            text: 'The two halves of each X (sister chromatids) are pulled apart.',
            elements: [
              cell('c1', 28, 4.4),
              cell('c2', 72, 4.4),
              chromatid('A1a', RED, 20, 42, true),
              chromatid('A1b', RED, 36, 42, true),
              chromatid('B2a', BLUE, 20, 60, false),
              chromatid('B2b', BLUE, 36, 60, false),
              chromatid('A2a', BLUE, 64, 42, true),
              chromatid('A2b', BLUE, 80, 42, true),
              chromatid('B1a', RED, 64, 60, false),
              chromatid('B1b', RED, 80, 60, false),
            ],
          },
          {
            id: 'telophase2',
            label: 'Telophase II',
            text: 'Four cells, each with one copy of each chromosome. Thanks to crossing over and random sorting, they are all genetically different.',
            elements: [
              cell('c1', 13, 2.6),
              cell('c3', 37, 2.6),
              cell('c2', 63, 2.6),
              cell('c4', 87, 2.6),
              chromatid('A1a', RED, 13, 44, true),
              chromatid('B2a', BLUE, 13, 58, false),
              chromatid('A1b', RED, 37, 44, true),
              chromatid('B2b', BLUE, 37, 58, false),
              chromatid('A2a', BLUE, 63, 44, true),
              chromatid('B1a', RED, 63, 58, false),
              chromatid('A2b', BLUE, 87, 44, true),
              chromatid('B1b', RED, 87, 58, false),
            ],
          },
        ],
        checkpoints: [
          {
            prompt: 'Stop when matching PAIRS line up side by side in the middle.',
            frame: 'metaphase1',
          },
          { prompt: 'Stop when the two halves of each X are pulled apart.', frame: 'anaphase2' },
          {
            prompt: 'Stop at the end, when there are four genetically different cells.',
            frame: 'telophase2',
          },
        ],
      },
    },
    goDeeper:
      'Meiosis is two divisions (meiosis I and II) after one round of DNA replication, turning one diploid cell (2n) into four haploid cells (n). In prophase I, homologous chromosomes pair up (synapsis) and exchange segments at chiasmata (crossing over). In metaphase I, homologous pairs line up at random orientation (independent assortment), giving 2²³ ≈ 8 million combinations in humans before crossing over is even counted. Meiosis I separates homologs; meiosis II separates sister chromatids, like mitosis.\n\nIn reality, it’s a bit more complicated: the animation shows just two chromosome pairs (humans have 23), and crossing over is only hinted at — real chromosomes end up as mosaics of red and blue segments. In females, meiosis is uneven: it produces one large egg and small polar bodies, and it pauses for years partway through. Errors in separating chromosomes (nondisjunction) cause conditions such as Down syndrome (trisomy 21).',
    quiz: [
      {
        kind: 'mc',
        prompt: 'How many cells does meiosis make from one cell?',
        options: [
          'Two identical cells',
          'Four genetically different cells',
          'One big cell',
          'Eight identical cells',
        ],
        answer: 1,
        explain: 'Two divisions make four haploid cells, and they are all different.',
      },
      {
        kind: 'mc',
        prompt: 'What is crossing over?',
        options: [
          'Cells swapping places',
          'Matching chromosomes swapping pieces',
          'DNA being copied',
          'The cell membrane pinching in',
        ],
        answer: 1,
        explain: 'Homologous chromosomes exchange segments during prophase I, mixing genes.',
      },
      {
        kind: 'predict',
        scenario:
          'During meiosis I, one pair of chromosomes fails to separate and both go into the same cell.',
        prompt: 'What happens to the sex cells?',
        options: [
          'Nothing changes',
          'Some get an extra chromosome and some are missing one',
          'They all die instantly',
          'They become identical',
        ],
        answer: 1,
        explain:
          'This is nondisjunction. It can lead to conditions like Down syndrome (an extra chromosome 21).',
      },
    ],
    relatedConcepts: ['incomplete-dominance'],
    funFact:
      'Thanks to crossing over and random sorting, you could produce trillions of genetically different eggs or sperm.',
  },
];
