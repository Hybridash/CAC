import type { OlyQuestion } from '../../olympiad';

/** Biosystematics (classification and phylogeny). Original questions. */
export const SYSTEMATICS: OlyQuestion[] = [
  {
    id: 'systematics-1',
    topic: 'systematics',
    level: 1,
    skill: 'recall',
    format: 'single',
    stem: 'In cladistics, a derived character shared by two or more groups, inherited from their most recent common ancestor, is called:',
    options: [
      'A symplesiomorphy',
      'A synapomorphy',
      'An autapomorphy',
      'A homoplasy',
      'An analogy',
    ],
    answer: 1,
    explain:
      'Synapomorphies (shared derived traits) define clades. A symplesiomorphy is a shared ancestral trait, which does not show close relationship; an autapomorphy is unique to one group; a homoplasy is a similarity due to convergence or reversal, not common ancestry.',
  },
  {
    id: 'systematics-2',
    topic: 'systematics',
    level: 2,
    skill: 'reasoning',
    format: 'single',
    stem: 'Birds evolved from within the group of animals traditionally called “reptiles”. What kind of group is “reptiles” if birds are left out?',
    options: ['Monophyletic', 'Paraphyletic', 'Polyphyletic', 'A clade', 'An outgroup'],
    answer: 1,
    explain:
      'A monophyletic group (clade) contains an ancestor and ALL of its descendants. Leaving out one branch (birds) that arose from within the group makes it paraphyletic. A polyphyletic group is one that does not even include the common ancestor of its members.',
  },
  {
    id: 'systematics-3',
    topic: 'systematics',
    level: 1,
    skill: 'recall',
    format: 'single',
    stem: 'Which pair of features shows that mushrooms belong with the fungi rather than with plants?',
    options: [
      'Cell walls of chitin and feeding by absorbing digested food',
      'Cell walls of cellulose and photosynthesis',
      'Lack of a nucleus and binary fission',
      'Multicellularity and reproduction by spores',
      'Growth in soil and a stalk-like body',
    ],
    answer: 0,
    explain:
      'Fungi have chitin cell walls (like insect exoskeletons, not cellulose) and are heterotrophs that secrete enzymes and absorb the products. Spores and multicellularity are found in both fungi and plants, so they do not separate the groups.',
  },
  {
    id: 'systematics-4',
    topic: 'systematics',
    level: 2,
    skill: 'recall',
    format: 'single',
    stem: 'In deuterostomes, the first opening of the embryo’s gut becomes the anus. Which animal is a deuterostome?',
    options: ['Earthworm', 'Octopus', 'Sea star', 'Grasshopper', 'Garden snail'],
    answer: 2,
    explain:
      'Echinoderms (such as sea stars) and chordates are the main deuterostome groups. Annelids, molluscs and arthropods are protostomes, in which the first opening typically becomes the mouth.',
  },
  {
    id: 'systematics-5',
    topic: 'systematics',
    level: 3,
    skill: 'data',
    format: 'single',
    stem: 'Four species (P, Q, R and S) and an outgroup were scored for four characters (0 = ancestral state, 1 = derived state). Using maximum parsimony, which two species are each other’s closest relatives?',
    table: {
      caption: 'Character matrix',
      columns: ['Taxon', 'Char. 1', 'Char. 2', 'Char. 3', 'Char. 4'],
      rows: [
        ['Outgroup', 0, 0, 0, 0],
        ['P', 1, 1, 0, 0],
        ['Q', 1, 1, 1, 0],
        ['R', 1, 1, 1, 1],
        ['S', 1, 0, 0, 0],
      ],
    },
    options: ['P and S', 'Q and R', 'P and R', 'R and S', 'P and Q'],
    answer: 1,
    explain:
      'Character 1 unites all four species. Character 2 groups P, Q and R (S branched off first). Character 3 groups Q and R, so they are sister species; character 4 is unique to R. The tree ((Q, R), P), S explains every character with a single change, the most parsimonious solution.',
  },
  {
    id: 'systematics-6',
    topic: 'systematics',
    level: 2,
    skill: 'recall',
    format: 'single',
    stem: 'Which feature is characteristic of archaea but not of bacteria?',
    options: [
      'A cell wall made of peptidoglycan',
      'Membrane lipids with ether linkages to glycerol',
      'A membrane-bound nucleus',
      'Circular chromosomes',
      '70S ribosomes',
    ],
    answer: 1,
    explain:
      'Archaeal membrane lipids are linked to glycerol by ether bonds (and often branched), unlike the ester-linked lipids of bacteria and eukaryotes. Archaea lack peptidoglycan; both groups lack a nucleus, have circular chromosomes and 70S ribosomes.',
  },
  {
    id: 'systematics-7',
    topic: 'systematics',
    level: 1,
    skill: 'recall',
    format: 'single',
    stem: 'A small arthropod has eight walking legs, no antennae, a body in two main parts, and fang-like mouthparts in front of the mouth. To which group does it belong?',
    options: ['Insects', 'Crustaceans', 'Arachnids', 'Millipedes', 'Centipedes'],
    answer: 2,
    explain:
      'Arachnids (spiders, scorpions, mites) have two body regions, eight legs, chelicerae and no antennae. Insects have three body regions, six legs and one pair of antennae; crustaceans have two pairs of antennae; millipedes and centipedes have many legs.',
  },
  {
    id: 'systematics-8',
    topic: 'systematics',
    level: 1,
    skill: 'recall',
    format: 'single',
    stem: 'Which group of plants has vascular tissue (xylem and phloem) but does not produce seeds?',
    options: ['Mosses', 'Liverworts', 'Conifers', 'Flowering plants', 'Ferns'],
    answer: 4,
    explain:
      'Ferns (and their relatives) are seedless vascular plants that disperse by spores. Mosses and liverworts are non-vascular. Conifers and flowering plants are seed plants.',
  },
  {
    id: 'systematics-9',
    topic: 'systematics',
    level: 3,
    skill: 'recall',
    format: 'truefalse',
    stem: 'Judge each statement about phylogeny and classification.',
    statements: [
      { text: 'Birds are more closely related to crocodilians than to lizards.', answer: true },
      {
        text: 'A paraphyletic group includes a common ancestor and all of its descendants.',
        answer: false,
      },
      {
        text: 'Convergent traits can mislead a phylogenetic analysis if they are treated as homologous.',
        answer: true,
      },
      { text: 'Fungi are more closely related to plants than to animals.', answer: false },
    ],
    explain:
      'Birds and crocodilians together form the archosaurs. A group with an ancestor and all descendants is monophyletic; a paraphyletic group leaves some descendants out. Convergent similarities (homoplasy) suggest false relationships. Molecular data place fungi with animals in the opisthokonts.',
  },
];
