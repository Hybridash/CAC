import type { OlyQuestion } from '../../olympiad';

/** Plant Anatomy & Physiology. Original questions. */
export const PLANTS: OlyQuestion[] = [
  {
    id: 'plants-1',
    topic: 'plants',
    level: 1,
    skill: 'recall',
    format: 'single',
    stem: 'A gardener removes a complete ring of bark (including the phloem) from around the trunk of a young tree, leaving the wood intact. Which process is directly interrupted?',
    options: [
      'Movement of water from the roots to the leaves',
      'Movement of sugars from the leaves to the roots',
      'Gas exchange through the stomata',
      'Uptake of minerals by root hairs',
      'Photosynthesis in the leaves',
    ],
    answer: 1,
    explain:
      'Phloem, just under the bark, carries sugars from sources (leaves) to sinks (roots). Water and minerals travel up in the xylem (the wood), which is left intact, so the leaves stay green for a while. Starved of sugar, the roots eventually die and so does the tree.',
  },
  {
    id: 'plants-2',
    topic: 'plants',
    level: 2,
    skill: 'reasoning',
    format: 'single',
    stem: 'A fungal toxin strongly activates the proton pump (H⁺-ATPase) in the plasma membrane of guard cells. What happens to the stomata of a leaf treated with the toxin?',
    options: [
      'They open, because K⁺ and water enter the guard cells',
      'They close, because K⁺ and water leave the guard cells',
      'They close, because the guard cells run out of ATP',
      'Nothing happens, because stomata respond only to light',
      'They open, because the guard cells lose turgor',
    ],
    answer: 0,
    explain:
      'Pumping H⁺ out hyperpolarizes the guard cell membrane and drives K⁺ in through channels (with Cl⁻ or malate as counter-ions). The extra solutes lower the water potential, water flows in, the guard cells swell, and their uneven walls bow apart to open the pore. The toxin forces this even in the dark, so the leaf wilts.',
  },
  {
    id: 'plants-3',
    topic: 'plants',
    level: 2,
    skill: 'reasoning',
    format: 'single',
    stem: 'Why do C₄ plants such as maize lose much less carbon to photorespiration than C₃ plants on hot, bright days?',
    options: [
      'Their Rubisco cannot bind O₂ at all',
      'They keep their stomata closed throughout the day',
      'PEP carboxylase fixes CO₂ in the mesophyll and the carbon is released around Rubisco in bundle-sheath cells, keeping the CO₂:O₂ ratio there high',
      'They carry out the Calvin cycle only at night',
      'They do not have a Calvin cycle',
    ],
    answer: 2,
    explain:
      'Rubisco can react with O₂ instead of CO₂ (photorespiration), especially when it is hot and stomata are partly closed. C₄ plants first fix CO₂ with PEP carboxylase, which does not react with O₂, then shuttle a C₄ acid into bundle-sheath cells and release CO₂ there. Concentrated CO₂ around Rubisco suppresses its oxygenase reaction. The Calvin cycle still runs in daytime.',
  },
  {
    id: 'plants-4',
    topic: 'plants',
    level: 3,
    skill: 'data',
    format: 'truefalse',
    stem: 'Plants of one species were grown under different 24-hour light regimes, and flowering was recorded. A “flash” is 5 minutes of light given in the middle of the dark period.',
    table: {
      caption: 'Flowering under different light regimes',
      columns: ['Light : dark (hours)', 'Night treatment', 'Flowered?'],
      rows: [
        ['14 : 10', 'none', 'no'],
        ['12 : 12', 'none', 'yes'],
        ['8 : 16', 'none', 'yes'],
        ['8 : 16', 'red flash', 'no'],
        ['8 : 16', 'red flash, then far-red flash', 'yes'],
      ],
    },
    statements: [
      { text: 'This is a short-day (long-night) plant.', answer: true },
      { text: 'The critical night length lies between 10 and 12 hours.', answer: true },
      {
        text: 'The effect of the red flash is cancelled by far-red light, which suggests that phytochrome is involved.',
        answer: true,
      },
      {
        text: 'Flowering is controlled by the total amount of light the plant receives per day.',
        answer: false,
      },
    ],
    explain:
      'The plant flowers only when the night is at least 12 h, and fails with a 10 h night, so it needs a long uninterrupted night (a “short-day” plant) with a critical night length between 10 and 12 h. A red flash breaks the night; far-red light right after reverses it, the classic red/far-red switch of phytochrome. Total light cannot explain the results: plants on 8:16 with a flash received less light than the 12:12 plants, which flowered, yet they did not flower. What matters is the length of the uninterrupted night.',
  },
  {
    id: 'plants-5',
    topic: 'plants',
    level: 1,
    skill: 'recall',
    format: 'single',
    stem: 'In a root, water and dissolved minerals can travel through cell walls (the apoplast) until they reach a layer whose walls contain a waxy band of suberin. This band forces them to cross a cell membrane. Which layer is it?',
    options: ['Epidermis', 'Cortex', 'Endodermis', 'Pericycle', 'Xylem'],
    answer: 2,
    explain:
      'The Casparian strip in the walls of endodermis cells blocks the apoplastic route. Water and minerals must pass through the membranes of endodermis cells, which lets the plant control which ions enter the xylem.',
  },
  {
    id: 'plants-6',
    topic: 'plants',
    level: 2,
    skill: 'reasoning',
    format: 'single',
    stem: 'Oat seedlings are lit from one side. In one group, the top 2 mm of each shoot tip is covered with an opaque cap; in another group, the region just below the tip is covered instead. What is the most likely result?',
    options: [
      'Both groups bend toward the light',
      'Neither group bends toward the light',
      'Only the group with uncovered tips bends toward the light',
      'Only the group with covered tips bends toward the light',
      'Both groups bend away from the light',
    ],
    answer: 2,
    explain:
      'The tip senses the direction of light and redistributes auxin to the shaded side. Auxin then moves down and makes cells below the tip elongate more on the shaded side, so the shoot bends toward the light. Covering the tip blocks the sensing; covering the region below does not, because that region only responds to auxin.',
  },
  {
    id: 'plants-7',
    topic: 'plants',
    level: 1,
    skill: 'recall',
    format: 'single',
    stem: 'Unripe avocados ripen faster when sealed in a bag with a ripe banana. Which plant hormone, released as a gas by the banana, causes this?',
    options: ['Auxin', 'Abscisic acid', 'Ethylene', 'Gibberellin', 'Cytokinin'],
    answer: 2,
    explain:
      'Ethylene is a gaseous hormone that triggers ripening in many fruits. Ripening fruit make more ethylene, which speeds the ripening of nearby fruit, a positive feedback that the sealed bag concentrates.',
  },
  {
    id: 'plants-8',
    topic: 'plants',
    level: 2,
    skill: 'reasoning',
    format: 'single',
    stem: 'A plant cell has a solute potential of −0.8 MPa and a pressure potential of +0.3 MPa. It is placed in a solution with a water potential of −0.7 MPa. What happens?',
    options: [
      'Water enters the cell, because the cell’s water potential is higher',
      'Water leaves the cell, because the cell’s water potential is higher than the solution’s',
      'There is no net movement, because the water potentials are equal',
      'Water enters the cell until it bursts',
      'Solutes leave the cell until the potentials are equal',
    ],
    answer: 1,
    explain:
      'Water potential = solute potential + pressure potential = −0.8 + 0.3 = −0.5 MPa. Water moves from higher (less negative) to lower water potential, so it moves from the cell (−0.5) into the solution (−0.7). The cell loses turgor. A plant cell wall prevents bursting anyway.',
  },
  {
    id: 'plants-9',
    topic: 'plants',
    level: 2,
    skill: 'reasoning',
    format: 'single',
    stem: 'A flowering plant has 2n = 20 chromosomes. After double fertilization, how many chromosomes does each nucleus of the endosperm contain?',
    options: ['10', '20', '30', '40', '60'],
    answer: 2,
    explain:
      'One sperm (n = 10) fertilizes the egg to make the diploid zygote (20). The other sperm fuses with the two polar nuclei of the central cell (10 + 10), giving a triploid endosperm with 3n = 30 chromosomes.',
  },
  {
    id: 'plants-10',
    topic: 'plants',
    level: 2,
    skill: 'reasoning',
    format: 'single',
    stem: 'The acidity of leaf cell sap is measured every few hours in a cactus that uses crassulacean acid metabolism (CAM). When is the sap most acidic?',
    options: [
      'In the middle of the afternoon',
      'At dawn, at the end of the night',
      'At dusk, at the end of the day',
      'It stays constant all day and night',
      'At noon, when photosynthesis is fastest',
    ],
    answer: 1,
    explain:
      'CAM plants open their stomata at night, fix CO₂ into malic acid and store it in the vacuole, so acidity builds up all night and peaks at dawn. During the day the stomata close (saving water) and the malate is broken down to release CO₂ for the Calvin cycle, so acidity falls.',
  },
  {
    id: 'plants-11',
    topic: 'plants',
    level: 3,
    skill: 'data',
    format: 'truefalse',
    stem: 'Net oxygen production by a leaf was measured at different light intensities and two CO₂ concentrations (temperature constant).',
    table: {
      caption: 'Net O₂ production (arbitrary units)',
      columns: ['Light (µmol photons m⁻² s⁻¹)', '400 ppm CO₂', '1000 ppm CO₂'],
      rows: [
        [0, -2, -2],
        [100, 4, 4],
        [300, 10, 13],
        [600, 12, 19],
        [1200, 12, 22],
      ],
    },
    statements: [
      {
        text: 'At 100 µmol photons m⁻² s⁻¹, photosynthesis is limited by light rather than by CO₂.',
        answer: true,
      },
      {
        text: 'The light compensation point lies between 0 and 100 µmol photons m⁻² s⁻¹.',
        answer: true,
      },
      {
        text: 'At 1200 µmol photons m⁻² s⁻¹, adding CO₂ does not increase photosynthesis.',
        answer: false,
      },
      {
        text: 'Gross photosynthesis at 600 µmol photons m⁻² s⁻¹ and 400 ppm CO₂ is about 10 units.',
        answer: false,
      },
    ],
    explain:
      'At 100 the two CO₂ levels give the same rate, so CO₂ is not limiting; light is. Net O₂ goes from −2 (respiration only, in the dark) to +4, so it crosses zero (the compensation point) between 0 and 100. At 1200, extra CO₂ raises the rate from 12 to 22, so CO₂ is limiting there. Gross photosynthesis = net + respiration = 12 + 2 = 14, not 10.',
  },
  {
    id: 'plants-12',
    topic: 'plants',
    level: 1,
    skill: 'recall',
    format: 'single',
    stem: 'Which feature is found in flowering plants (angiosperms) but not in conifers (gymnosperms)?',
    options: [
      'Seeds',
      'Pollen grains',
      'Xylem and phloem',
      'Ovules enclosed within a carpel (ovary)',
      'Alternation of generations',
    ],
    answer: 3,
    explain:
      'Both groups make seeds and pollen, have vascular tissue and alternate generations. Only angiosperms enclose their ovules in a carpel; the ovary wall develops into the fruit. In gymnosperms (“naked seeds”) the ovules sit exposed on cone scales.',
  },
  {
    id: 'plants-13',
    topic: 'plants',
    level: 2,
    skill: 'reasoning',
    format: 'single',
    stem: 'A tomato plant has yellowing (chlorosis) in its OLDER, lower leaves, while its young leaves stay green. A deficiency of which nutrient is most likely?',
    options: ['Iron', 'Calcium', 'Nitrogen', 'Boron', 'Sulfur'],
    answer: 2,
    explain:
      'Nitrogen is mobile in the phloem: when it is scarce, the plant breaks down proteins and chlorophyll in old leaves and moves the nitrogen to young growth, so old leaves yellow first. Iron, calcium, boron and (mostly) sulfur are poorly remobilized, so their deficiencies show first in young leaves.',
  },
  {
    id: 'plants-14',
    topic: 'plants',
    level: 1,
    skill: 'recall',
    format: 'single',
    stem: 'What provides most of the force that lifts water to the top of a 60-meter tree?',
    options: [
      'Root pressure pushing water up from below',
      'ATP-powered pumps in the xylem walls',
      'Tension created by evaporation of water from the leaves, transmitted down cohesive water columns',
      'Capillary action in the narrow xylem vessels alone',
      'Pressure from sugar flowing in the phloem',
    ],
    answer: 2,
    explain:
      'This is the cohesion–tension mechanism. Transpiration from leaf cell walls creates negative pressure (tension); because water molecules cohere through hydrogen bonds and adhere to xylem walls, the whole column is pulled up. Root pressure and capillarity can raise water only a few meters, and xylem is dead tissue with no pumps.',
  },
  {
    id: 'plants-15',
    topic: 'plants',
    level: 3,
    skill: 'recall',
    format: 'truefalse',
    stem: 'Judge each statement about plant hormones.',
    statements: [
      {
        text: 'During drought, abscisic acid accumulates in leaves and promotes stomatal closure.',
        answer: true,
      },
      {
        text: 'In germinating cereal grains, gibberellin from the embryo induces the aleurone layer to make α-amylase.',
        answer: true,
      },
      {
        text: 'Cytokinins are made mainly in shoot tips and travel down to the roots.',
        answer: false,
      },
      {
        text: 'In tissue culture, a high auxin-to-cytokinin ratio favors the formation of roots.',
        answer: true,
      },
    ],
    explain:
      'ABA is the drought hormone that closes stomata. Gibberellin signals the aleurone to secrete α-amylase, which breaks down endosperm starch to feed the embryo. Cytokinins are made mainly in root tips and travel up in the xylem. High auxin:cytokinin favors roots; high cytokinin:auxin favors shoots.',
  },
];
