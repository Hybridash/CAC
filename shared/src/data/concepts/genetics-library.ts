import type { Concept } from '../../types';
import {
  assembly,
  cascade,
  label,
  lockKey,
  mc,
  predict,
  sh,
  slider,
  sorting,
  steps,
  timeline,
} from './helpers';

export const geneticsLibrary: Concept[] = [
  {
    id: 'dna-structure',
    title: 'DNA Structure',
    category: 'genetics',
    tags: ['double helix', 'base pairs', 'nucleotides', 'A T G C', 'genes'],
    aliases: ['double helix', 'base pairing', 'what is DNA', 'deoxyribonucleic acid'],
    difficulty: 1,
    rarity: 'common',
    summary: 'DNA is a twisted ladder whose rungs spell out the instructions for building you.',
    steps: steps(
      ['A twisted ladder', 'DNA is a double helix: two long strands wound around each other.'],
      ['Four letters', 'The rungs are made of four bases: A, T, G and C.'],
      ['Perfect partners', 'A always pairs with T, and G always pairs with C.'],
      [
        'A recipe book',
        'The order of the letters spells out genes, the instructions for proteins.',
      ],
    ),
    interaction: lockKey(
      'Complete the ladder: snap each base onto its partner on the other strand.',
      [
        ['A on strand 1', 'triangle', '#22c55e', 'Adenine'],
        ['G on strand 1', 'square', '#eab308', 'Guanine'],
        ['T on strand 1', 'wave', '#f43f5e', 'Thymine'],
        ['C on strand 1', 'circle', '#3b82f6', 'Cytosine'],
      ],
      [
        ['T', 'triangle', '#f43f5e', 0, 'A–T: two hydrogen bonds hold this pair together.'],
        ['C', 'square', '#3b82f6', 1, 'G–C: three hydrogen bonds — a slightly stronger pair.'],
        ['A', 'wave', '#22c55e', 2, 'T–A: partners again!'],
        ['G', 'circle', '#eab308', 3, 'C–G locks in.'],
        ['U', 'triangle', '#fb923c', null, 'U (uracil) is only found in RNA. DNA uses T instead!'],
      ],
    ),
    goDeeper:
      'DNA (deoxyribonucleic acid) is a polymer of nucleotides, each made of a deoxyribose sugar, a phosphate and a base. The sugar–phosphate backbones run in opposite directions (antiparallel, 5′→3′ and 3′→5′). Purines (A, G) pair with pyrimidines (T, C) via hydrogen bonds — two for A–T and three for G–C — keeping the helix a constant width. James Watson and Francis Crick built the model in 1953 using X-ray images by Rosalind Franklin and Maurice Wilkins.\n\nIn reality, it’s a bit more complicated: the shapes in the game stand in for the real chemistry of hydrogen bonding and base geometry. Most DNA in cells is tightly wrapped around histone proteins, and the human genome holds about 3 billion base pairs per set of chromosomes.',
    quiz: [
      mc('Which base pairs with A in DNA?', ['G', 'C', 'T', 'U'], 2, 'Adenine pairs with thymine.'),
      mc(
        'What is the shape of DNA called?',
        ['Single strand', 'Double helix', 'Triple spiral', 'Flat sheet'],
        1,
        'Two strands twist into a double helix.',
      ),
      predict(
        'One strand of DNA reads ATTGC.',
        'What does the partner strand read?',
        ['ATTGC', 'TAACG', 'UAACG', 'GCCAT'],
        1,
        'A↔T and G↔C: ATTGC pairs with TAACG.',
      ),
    ],
    relatedConcepts: ['dna-replication', 'transcription', 'genetic-code'],
    funFact:
      'If you stretched out all the DNA in your body end to end, it would reach the Sun and back dozens of times.',
  },
  {
    id: 'dna-replication',
    title: 'DNA Replication',
    category: 'genetics',
    tags: ['copying DNA', 'helicase', 'polymerase', 'semi-conservative', 'cell division'],
    aliases: ['copying DNA', 'DNA polymerase', 'semi-conservative replication'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['dna-structure'],
    summary:
      'Before a cell divides, an enzyme crew unzips DNA and builds a matching copy of each half.',
    steps: steps(
      ['Unzip', 'Helicase unzips the double helix into two single strands.'],
      ['Start here', 'Primase lays down a short starter piece (primer).'],
      ['Build', 'DNA polymerase adds matching letters, following the base-pairing rules.'],
      ['Stitch', 'Ligase seals the gaps. Each new DNA has one old strand and one new one.'],
    ),
    interaction: assembly(
      'Put the replication crew to work in the right order.',
      [
        ['Helicase', '🔓', 'Unzips the double helix by breaking the hydrogen bonds between bases.'],
        ['Primase', '🏁', 'Builds a short RNA primer so polymerase has somewhere to start.'],
        ['DNA polymerase III', '🧱', 'Adds new nucleotides, matching A–T and G–C.'],
        ['DNA polymerase I', '🔁', 'Replaces the RNA primers with DNA.'],
        ['Ligase', '🪡', 'Seals the nicks between DNA pieces into one continuous strand.'],
      ],
      'Replicated! Two identical DNA molecules, each with one old and one new strand.',
      { distractors: [['Ribosome', '🏭', 'Ribosomes make proteins — they don’t copy DNA.']] },
    ),
    goDeeper:
      'Replication is semi-conservative (shown by Meselson and Stahl in 1958). Polymerases only build 5′→3′, so the leading strand is made continuously while the lagging strand is made in short Okazaki fragments, each needing its own primer. Single-strand binding proteins keep strands apart and topoisomerase relieves twisting ahead of the fork. Polymerases proofread, and the overall error rate is about one mistake per billion bases.\n\nIn reality, it’s a bit more complicated: the enzyme names here (polymerase III and I) are from bacteria; human cells use polymerases δ and ε, and start copying at thousands of origins at once so the whole genome finishes in hours.',
    quiz: [
      mc(
        'Which enzyme unzips DNA?',
        ['Ligase', 'Helicase', 'Primase', 'Amylase'],
        1,
        'Helicase separates the two strands.',
      ),
      mc(
        'Why is replication called “semi-conservative”?',
        [
          'Half the DNA is thrown away',
          'Each new DNA has one old strand and one new strand',
          'Only half the genes are copied',
          'It happens half the time',
        ],
        1,
        'Each original strand serves as a template and stays in a new molecule.',
      ),
      predict(
        'Ligase stops working during replication.',
        'What happens?',
        [
          'DNA can’t be unzipped',
          'The new strands are left in disconnected pieces',
          'Proteins can’t be made',
          'Nothing',
        ],
        1,
        'Without ligase, gaps between Okazaki fragments aren’t sealed.',
      ),
    ],
    relatedConcepts: ['dna-structure', 'mitosis', 'pcr', 'telomeres'],
    funFact:
      'Your cells copy about 6 billion bases of DNA every time they divide — in just a few hours.',
  },
  {
    id: 'transcription',
    title: 'Transcription',
    category: 'genetics',
    tags: ['mRNA', 'RNA polymerase', 'promoter', 'gene expression', 'splicing'],
    aliases: ['DNA to RNA', 'making mRNA', 'RNA polymerase'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['dna-structure'],
    summary: 'To use a gene, the cell copies it into a portable message called mRNA.',
    steps: steps(
      [
        'Find the gene',
        'Proteins called transcription factors mark the start of a gene (the promoter).',
      ],
      ['Copy it', 'RNA polymerase unzips a small section and builds matching RNA.'],
      ['Edit it', 'The RNA gets a cap and a tail, and non-coding introns are cut out (splicing).'],
      ['Ship it', 'The finished mRNA leaves the nucleus to be read by ribosomes.'],
    ),
    interaction: cascade(
      'Switch on a gene and follow the message out of the nucleus. Then break a step.',
      ['Signal: “make this protein!”', '📣'],
      [
        [
          'Transcription factors bind',
          '🧲',
          'Transcription factors attach to the promoter, flagging the gene.',
          'No transcription factors: RNA polymerase never finds the gene, so it stays switched off.',
        ],
        ['RNA polymerase attaches', '🚂', 'RNA polymerase docks and unwinds the DNA.'],
        [
          'mRNA is built',
          '📝',
          'It reads the template strand and builds RNA (with U instead of T).',
        ],
        [
          'Cap, tail and splicing',
          '✂️',
          'Introns are cut out and exons stitched together; a cap and poly-A tail protect the ends.',
          'If splicing fails, introns stay in and the message is garbled — some diseases work this way.',
        ],
        [
          'mRNA exits the nucleus',
          '🚪',
          'The finished message travels through a nuclear pore to the ribosomes.',
        ],
      ],
      'Message delivered! Ribosomes can now translate it into protein.',
    ),
    goDeeper:
      'RNA polymerase II transcribes protein-coding genes in eukaryotes. It reads the template (antisense) strand 3′→5′ and synthesizes RNA 5′→3′; the mRNA matches the coding (sense) strand except U replaces T. Promoters often contain a TATA box recognized by general transcription factors, and enhancers far away can boost transcription. Pre-mRNA processing adds a 5′ cap and a 3′ poly-A tail, and the spliceosome removes introns.\n\nIn reality, it’s a bit more complicated: in bacteria there is no nucleus, so ribosomes start translating mRNA while it is still being transcribed. Many genes are transcribed in bursts, and much of the genome is transcribed into RNAs that never become proteins.',
    quiz: [
      mc(
        'What does RNA polymerase make?',
        ['Protein', 'mRNA', 'DNA', 'Lipids'],
        1,
        'RNA polymerase builds an RNA copy of a gene.',
      ),
      label(
        'Match each term to its meaning.',
        [
          ['Promoter', 'DNA signal marking where a gene starts'],
          ['Intron', 'Non-coding piece cut out of the RNA'],
          ['Exon', 'Coding piece kept in the mRNA'],
        ],
        'Promoters start genes; introns are removed; exons are expressed.',
      ),
      predict(
        'A cell can’t make the transcription factor for gene X.',
        'What happens to protein X?',
        [
          'It is made faster',
          'Little or none is made, because the gene isn’t transcribed',
          'It becomes DNA',
          'It is made by mitochondria',
        ],
        1,
        'Without transcription, there’s no mRNA to translate.',
      ),
    ],
    relatedConcepts: ['translation', 'alternative-splicing', 'lac-operon'],
    funFact: 'RNA polymerase copies about 20–50 letters per second in human cells.',
  },
  {
    id: 'genetic-code',
    title: 'The Genetic Code & Codons',
    category: 'genetics',
    tags: ['codons', 'amino acids', 'start codon', 'stop codon', 'redundancy'],
    aliases: ['codon table', 'triplet code', 'genetic code'],
    difficulty: 2,
    rarity: 'common',
    prerequisites: ['transcription'],
    summary:
      'Life reads RNA in three-letter words, and almost every living thing uses the same dictionary.',
    steps: steps(
      ['Three-letter words', 'Each group of three RNA letters is a codon.'],
      [
        '64 words, 20 meanings',
        'There are 64 codons but only 20 amino acids, so most amino acids have several codons.',
      ],
      ['Start and stop', 'AUG means “start” (and methionine). UAA, UAG and UGA mean “stop.”'],
    ),
    interaction: sorting(
      'Sort each codon to what it means.',
      [
        ['Leucine', '🟩', 'An amino acid with six codons'],
        ['Glycine', '🟦', 'Starts with GG'],
        ['STOP', '🛑', 'End of the protein'],
        ['Methionine (START)', '🏁', 'Only one codon'],
      ],
      [
        ['CUU', '🔤', 0, 'CUU codes for leucine.'],
        ['UUA', '🔤', 0, 'UUA also codes for leucine — the code is redundant.'],
        ['GGU', '🔤', 1, 'GGU codes for glycine.'],
        ['GGA', '🔤', 1, 'GGA also codes for glycine — only the last letter changed.'],
        ['UAA', '🔤', 2, 'UAA is a stop codon.'],
        ['UGA', '🔤', 2, 'UGA is a stop codon.'],
        ['AUG', '🔤', 3, 'AUG is the start codon and codes for methionine.'],
      ],
    ),
    goDeeper:
      'The code was cracked in the 1960s by Marshall Nirenberg, Har Gobind Khorana and others. It is read in non-overlapping triplets from a fixed start, and it is degenerate (redundant): changes in the third position often don’t change the amino acid, which buffers against mutations. The code is nearly universal, strong evidence that all life shares a common ancestor.\n\nIn reality, it’s a bit more complicated: there are small variations — mitochondria read UGA as tryptophan instead of stop, and some organisms use UGA or UAG to insert rare amino acids (selenocysteine, pyrrolysine). “Wobble” pairing lets one tRNA read several codons.',
    quiz: [
      mc(
        'How many letters make one codon?',
        ['1', '2', '3', '4'],
        2,
        'Codons are three-letter words.',
      ),
      mc(
        'Why can a mutation sometimes change a codon without changing the protein?',
        [
          'Codons are random',
          'Several codons code for the same amino acid',
          'Proteins ignore codons',
          'Ribosomes fix all mutations',
        ],
        1,
        'The code is redundant, especially at the third letter.',
      ),
      predict(
        'A gene from a jellyfish is put into a bacterium.',
        'Can the bacterium make the jellyfish protein?',
        [
          'No — bacteria use a different code',
          'Yes — the genetic code is nearly universal',
          'Only if it’s cold',
          'Only if it has a nucleus',
        ],
        1,
        'Because nearly all life shares one code, genes can be moved between species.',
      ),
    ],
    relatedConcepts: ['translation', 'mutations', 'dna-structure'],
    funFact:
      'The glowing GFP protein from jellyfish is made correctly in bacteria, plants and mice because they all share the same code.',
  },
  {
    id: 'mutations',
    title: 'Mutations',
    category: 'genetics',
    tags: ['DNA changes', 'frameshift', 'missense', 'nonsense', 'sickle cell', 'evolution'],
    aliases: ['gene mutations', 'frameshift mutation', 'point mutation', 'DNA errors'],
    difficulty: 2,
    rarity: 'common',
    prerequisites: ['genetic-code'],
    summary:
      'A mutation is a typo in DNA. Some do nothing, some change a word, some scramble the whole sentence.',
    steps: steps(
      [
        'Typos happen',
        'Mutations are changes in DNA, from copying mistakes, radiation or chemicals.',
      ],
      ['Silent', 'Some don’t change the protein at all.'],
      [
        'One word changed',
        'Missense mutations swap one amino acid. Nonsense mutations add an early STOP.',
      ],
      ['Frameshift', 'Adding or deleting a letter shifts every word after it.'],
    ),
    interaction: sorting(
      'Think of a gene as a sentence of three-letter words: THE FAT CAT ATE THE RAT. Sort each change.',
      [
        ['Silent', '🤫', 'Same meaning'],
        ['Missense', '🔄', 'One word changes'],
        ['Nonsense', '🛑', 'Sentence stops early'],
        ['Frameshift', '🌀', 'Everything after is scrambled'],
      ],
      [
        [
          'THE FAT BAT ATE THE RAT',
          '🦇',
          1,
          'One word changed — like one amino acid swapped (sickle cell works this way).',
        ],
        ['THE FAT CAT', '✋', 2, 'An early stop codon cuts the protein short.'],
        [
          'THE FAC ATA TET HER AT',
          '🌀',
          3,
          'A deleted letter shifts the reading frame for every word after it.',
        ],
        [
          'THE FAT CAT ATE THE RAT (GAA→GAG, still Glu)',
          '🤫',
          0,
          'A changed letter that still codes for the same amino acid.',
        ],
        ['THE FAT CCA TAT ETH ERA T', '➕', 3, 'An inserted letter also shifts the frame.'],
        ['Sickle cell (Glu → Val)', '🩸', 1, 'One base change swaps one amino acid in hemoglobin.'],
      ],
    ),
    goDeeper:
      'Point mutations (substitutions) can be silent, missense or nonsense. Insertions or deletions that aren’t multiples of three cause frameshifts, usually destroying the protein. Larger changes include duplications, inversions and translocations of chromosome segments. Mutations arise from replication errors, tautomeric shifts, UV light (thymine dimers), ionizing radiation and chemical mutagens; repair systems fix most of them.\n\nIn reality, it’s a bit more complicated: the sentence analogy treats letters like codons, but real codons are three bases. Most mutations are neutral, a few are harmful and very few are helpful — yet those few are the raw material for evolution. Each person is born with roughly 50–100 new mutations not found in either parent.',
    quiz: [
      mc(
        'Which mutation is usually most damaging?',
        ['Silent', 'Missense', 'Frameshift', 'None of them'],
        2,
        'Frameshifts scramble every codon after the change.',
      ),
      predict(
        'A single base change turns a codon into UAG.',
        'What happens to the protein?',
        [
          'It is longer',
          'It stops early (nonsense mutation)',
          'It is unchanged',
          'It gets a new amino acid',
        ],
        1,
        'UAG is a stop codon, so translation ends early.',
      ),
      mc(
        'Why are mutations important for evolution?',
        [
          'They always help',
          'They create new variation for selection to act on',
          'They stop evolution',
          'They only happen in plants',
        ],
        1,
        'New variation is the raw material of evolution.',
      ),
    ],
    relatedConcepts: [
      'genetic-code',
      'natural-selection',
      'nonsense-mediated-decay',
      'translation',
    ],
    funFact:
      'Sunburn damages skin DNA by fusing neighboring T bases together into “thymine dimers.”',
  },
  {
    id: 'mendelian-inheritance',
    title: 'Mendelian Inheritance',
    category: 'genetics',
    tags: ['Mendel', 'peas', 'dominant', 'recessive', 'alleles', 'genotype', 'phenotype'],
    aliases: ['Mendel', 'dominant and recessive', 'pea plant experiments', 'genotype vs phenotype'],
    difficulty: 2,
    rarity: 'common',
    summary:
      'Gregor Mendel’s pea plants revealed that traits are passed on as hidden pairs of “factors” — genes.',
    steps: steps(
      ['Two copies', 'Each plant has two copies (alleles) of a gene, one from each parent.'],
      ['Dominant wins', 'A dominant allele (P, purple) shows up even with one copy.'],
      ['Hidden recessive', 'A recessive allele (p, white) only shows if there are two copies.'],
      ['3 to 1', 'Two hidden carriers (Pp × Pp) give about 3 purple to 1 white.'],
    ),
    interaction: {
      template: 'punnett',
      config: {
        prompt: 'Cross Mendel’s pea plants. P (purple) is dominant over p (white).',
        gene: {
          name: 'Flower color',
          alleles: ['P', 'p'],
          inheritance: 'complete',
          phenotypes: {
            PP: { label: 'Purple', color: '#d8b4fe', emoji: '🟣' },
            Pp: { label: 'Purple', color: '#e9d5ff', emoji: '🟣' },
            pp: { label: 'White', color: '#f8fafc', emoji: '⚪' },
          },
        },
        mothers: ['PP', 'Pp', 'pp'],
        fathers: ['PP', 'Pp', 'pp'],
        challenges: [
          {
            prompt: 'Get Mendel’s famous 3 purple : 1 white ratio (25% white).',
            phenotype: 'White',
            probability: 0.25,
            explain: 'Pp × Pp: one in four babies gets pp and shows the hidden white trait.',
          },
          {
            prompt: 'Make a cross where every baby is purple, using a white parent.',
            phenotype: 'Purple',
            probability: 1,
            explain:
              'PP × pp: every baby gets one dominant P, so all are purple (but secretly Pp).',
          },
          {
            prompt: 'Find a cross with a 50% chance of white.',
            phenotype: 'White',
            probability: 0.5,
            explain:
              'Pp × pp is a “test cross” — it reveals whether a purple plant is hiding a white allele.',
          },
        ],
      },
    },
    goDeeper:
      'Mendel (1822–1884) studied seven pea traits and proposed the law of segregation (each parent passes on one of its two alleles at random) and the law of independent assortment (alleles of different genes sort independently). Homozygous individuals have two identical alleles (PP or pp); heterozygous have two different ones (Pp). Genotype is the allele combination; phenotype is what you observe.\n\nIn reality, it’s a bit more complicated: independent assortment only holds for genes on different chromosomes or far apart on the same one (linked genes tend to travel together). Mendel’s work was ignored until 1900, and statisticians have since noted his results fit the predicted ratios almost suspiciously well.',
    quiz: [
      mc(
        'A plant has the alleles Pp. What color are its flowers if P (purple) is dominant?',
        ['White', 'Purple', 'Pink', 'Half purple, half white'],
        1,
        'One dominant allele is enough to show purple.',
      ),
      predict(
        'Two purple pea plants have a white baby.',
        'What must be true about the parents?',
        [
          'Both are PP',
          'Both carry a hidden p allele (Pp)',
          'One is white in secret',
          'A mutation always happened',
        ],
        1,
        'Each parent must have passed on a recessive p.',
      ),
      label(
        'Match each term to its meaning.',
        [
          ['Genotype', 'The allele combination, like Pp'],
          ['Phenotype', 'The trait you can see, like purple'],
          ['Recessive', 'Only shows with two copies'],
        ],
        'Genotype is the code; phenotype is the result.',
      ),
    ],
    relatedConcepts: ['punnett-squares', 'incomplete-dominance', 'meiosis'],
    funFact:
      'Mendel was a monk; he grew around 28,000 pea plants in his monastery garden over eight years.',
  },
  {
    id: 'punnett-squares',
    title: 'Punnett Squares & Probability',
    category: 'genetics',
    tags: ['probability', 'carriers', 'cystic fibrosis', 'recessive disease', 'genetics'],
    aliases: ['punnett square', 'genetic probability', 'carrier parents'],
    difficulty: 2,
    rarity: 'common',
    prerequisites: ['mendelian-inheritance'],
    summary: 'A Punnett square is a quick way to predict the chances of a baby inheriting a trait.',
    steps: steps(
      ['Make a grid', 'Write one parent’s alleles across the top and the other’s down the side.'],
      ['Fill it in', 'Each box combines one allele from each parent.'],
      [
        'Read the odds',
        'Each box is a 25% chance for each child — every child rolls the dice again.',
      ],
    ),
    interaction: {
      template: 'punnett',
      config: {
        prompt:
          'Cystic fibrosis is recessive. Two carriers (Cc) can have an affected child (cc). Explore the odds.',
        gene: {
          name: 'CFTR gene',
          alleles: ['C', 'c'],
          inheritance: 'complete',
          phenotypes: {
            CC: { label: 'Unaffected', color: '#bbf7d0', emoji: '🙂' },
            Cc: { label: 'Carrier', color: '#fef08a', emoji: '🙂' },
            cc: { label: 'Has cystic fibrosis', color: '#fecaca', emoji: '🫁' },
          },
        },
        mothers: ['CC', 'Cc', 'cc'],
        fathers: ['CC', 'Cc', 'cc'],
        challenges: [
          {
            prompt: 'Two carrier parents: find the chance of a child with cystic fibrosis.',
            phenotype: 'Has cystic fibrosis',
            probability: 0.25,
            explain: 'Cc × Cc gives 1 in 4 cc. Every pregnancy has the same 25% chance.',
          },
          {
            prompt:
              'Find parents whose children have a 50% chance of being carriers but 0% chance of the disease.',
            phenotype: 'Carrier',
            probability: 0.5,
            explain: 'CC × Cc: half the children are carriers, none are affected.',
          },
          {
            prompt: 'Find a cross where every child is a carrier.',
            phenotype: 'Carrier',
            probability: 1,
            explain: 'CC × cc: each child gets one C and one c.',
          },
        ],
      },
    },
    goDeeper:
      'Each fertilization is an independent event, so probabilities don’t “remember” earlier children: if carriers already have one affected child, the next child still has a 25% chance. The phenotype label “Carrier” here marks people with one copy who don’t have the disease. Cystic fibrosis is caused by mutations in the CFTR gene, which makes a chloride channel; thick mucus builds up in the lungs and digestive system.\n\nIn reality, it’s a bit more complicated: in this lesson carriers are shown as a separate category to make the genetics visible, but carriers are healthy (CF is fully recessive). Over 2,000 CFTR mutations are known, and modern medicines called CFTR modulators can partly fix the faulty channel for many patients.',
    quiz: [
      mc(
        'Two carriers (Cc × Cc) have a child. What is the chance the child has the recessive condition?',
        ['0%', '25%', '50%', '100%'],
        1,
        'One box in four is cc.',
      ),
      predict(
        'Two carrier parents already have one child with cystic fibrosis.',
        'What is the chance their next child also has it?',
        ['0% — it already happened', '25% — each child is a new roll', '50%', '100%'],
        1,
        'Each pregnancy is independent.',
      ),
      mc(
        'A Punnett square shows…',
        [
          'Exactly what each child will look like',
          'The probabilities of different outcomes',
          'Which parent is older',
          'How many children a couple will have',
        ],
        1,
        'It predicts chances, not certainties.',
      ),
    ],
    relatedConcepts: ['mendelian-inheritance', 'sex-linked-traits', 'incomplete-dominance'],
    funFact:
      'Reginald Punnett invented his famous square in the early 1900s, and also studied the genetics of chickens.',
  },
  {
    id: 'sex-linked-traits',
    title: 'Sex-Linked Traits',
    category: 'genetics',
    tags: ['X chromosome', 'color blindness', 'hemophilia', 'carriers', 'inheritance'],
    aliases: ['X-linked inheritance', 'color blindness genetics', 'why more boys are colorblind'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['punnett-squares'],
    summary: 'Genes on the X chromosome explain why some traits are much more common in boys.',
    steps: steps(
      ['X and Y', 'Most females have two X chromosomes (XX); most males have one X and a Y (XY).'],
      [
        'One copy only',
        'Males have just one copy of X genes, so a recessive allele on their X always shows.',
      ],
      [
        'Carrier moms',
        'Females with one faulty copy are usually carriers who can pass it to sons.',
      ],
    ),
    interaction: {
      template: 'punnett',
      config: {
        prompt:
          'Red–green color blindness is X-linked recessive. N = normal vision, n = color blind.',
        gene: {
          name: 'Color vision',
          alleles: ['N', 'n'],
          inheritance: 'x-linked',
          phenotypes: {
            XNXN: { label: 'Normal vision', color: '#bbf7d0', emoji: '👩' },
            XNXn: { label: 'Carrier', color: '#fef08a', emoji: '👩' },
            XnXn: { label: 'Color blind', color: '#fecaca', emoji: '👩' },
            XNY: { label: 'Normal vision', color: '#bbf7d0', emoji: '👨' },
            XnY: { label: 'Color blind', color: '#fecaca', emoji: '👨' },
          },
        },
        mothers: ['XNXN', 'XNXn', 'XnXn'],
        fathers: ['XNY', 'XnY'],
        challenges: [
          {
            prompt:
              'A carrier mom and a dad with normal vision: find the chance of a color-blind child.',
            phenotype: 'Color blind',
            probability: 0.25,
            explain:
              'Only sons can be affected here: each son has a 50% chance, so 25% of all children.',
          },
          {
            prompt: 'Find parents where half the children are carriers and none are color blind.',
            phenotype: 'Carrier',
            probability: 0.5,
            explain:
              'Normal mom × color-blind dad: every daughter gets dad’s Xⁿ (carrier); sons get mom’s normal X.',
          },
          {
            prompt: 'Find a cross where every child is color blind.',
            phenotype: 'Color blind',
            probability: 1,
            explain:
              'A color-blind mom gives Xⁿ to everyone, and a color-blind dad gives Xⁿ to daughters.',
          },
        ],
      },
    },
    goDeeper:
      'X-linked recessive traits (red–green color blindness, hemophilia A and B, Duchenne muscular dystrophy) appear far more often in males, who are hemizygous for X genes. Affected fathers pass the allele to all daughters but no sons (sons get his Y). About 8% of males of Northern European descent have red–green color vision deficiency, versus about 0.5% of females.\n\nIn reality, it’s a bit more complicated: in each female cell one X chromosome is randomly switched off (X-inactivation), so carriers can have patches of cells expressing each allele — calico cats show this as patchy fur colors. Not everyone fits XX/XY: there are natural variations in sex chromosomes and development.',
    quiz: [
      mc(
        'Why are X-linked recessive traits more common in males?',
        [
          'Males have more genes',
          'Males have only one X, so one recessive allele shows',
          'The Y chromosome causes them',
          'Females can’t inherit them',
        ],
        1,
        'With no second X to mask it, the recessive allele is expressed.',
      ),
      predict(
        'A color-blind father and a mother with two normal alleles have a daughter.',
        'What is the daughter?',
        [
          'Color blind',
          'A carrier with normal vision',
          'Definitely normal with no faulty allele',
          'It can’t be predicted',
        ],
        1,
        'She gets dad’s Xⁿ and mom’s Xᴺ, so she’s a carrier.',
      ),
      mc(
        'Can a father pass an X-linked trait to his son?',
        [
          'Yes, always',
          'No — sons get his Y chromosome, not his X',
          'Only if the son is the oldest',
          'Only on Tuesdays',
        ],
        1,
        'Sons inherit their X from their mother.',
      ),
    ],
    relatedConcepts: ['punnett-squares', 'blood-clotting', 'mendelian-inheritance'],
    funFact:
      'Almost all calico cats are female, because the orange and black fur genes sit on the X chromosome.',
  },
  {
    id: 'epigenetics',
    title: 'Epigenetics',
    category: 'genetics',
    tags: ['DNA methylation', 'histones', 'gene expression', 'environment', 'chromatin'],
    aliases: [
      'epigenetic switches',
      'DNA methylation',
      'histone modification',
      'genes and environment',
    ],
    difficulty: 4,
    rarity: 'common',
    prerequisites: ['transcription'],
    summary: 'Chemical tags on and around DNA switch genes on or off without changing the letters.',
    steps: steps(
      ['Same recipe book', 'Nearly every cell in your body has the same DNA.'],
      ['Sticky notes', 'Epigenetic tags act like sticky notes saying “read this” or “skip this.”'],
      ['Methyl tags', 'Methyl groups on DNA usually silence a gene.'],
      ['Spools', 'DNA wraps around histone spools. Loose spools can be read; tight ones can’t.'],
    ),
    interaction: slider({
      prompt: 'Add or remove epigenetic tags and see how much of the gene is expressed.',
      inputs: [
        { id: 'methyl', label: 'DNA methylation', unit: '%', min: 0, max: 100, step: 5, start: 50 },
        {
          id: 'acetyl',
          label: 'Histone acetylation (loosening)',
          unit: '%',
          min: 0,
          max: 100,
          step: 5,
          start: 50,
        },
      ],
      output: {
        label: 'Gene expression',
        unit: '%',
        max: 100,
        expr: '100 * (1 - methyl / 100) * (0.15 + 0.85 * acetyl / 100)',
      },
      graphInput: 'methyl',
      visual: { kind: 'glow', emoji: '🧬' },
      challenges: [
        {
          prompt: 'Switch the gene fully ON (over 90%).',
          target: { min: 90 },
          explain: 'No methyl “off” tags and loose, acetylated histones: the gene is easy to read.',
        },
        {
          prompt: 'Silence the gene (under 5%).',
          target: { max: 5 },
          explain:
            'Heavy methylation shuts the gene down — this is how cells keep the wrong genes quiet.',
        },
        {
          prompt: 'Find a medium setting (40–60%).',
          target: { min: 40, max: 60 },
          explain: 'Expression isn’t just on or off — tags can tune it up or down.',
        },
      ],
    }),
    goDeeper:
      'DNA methylation (adding methyl groups to cytosines, usually at CpG sites) generally represses transcription. Histone modifications change how tightly DNA is packed: acetylation loosens chromatin (euchromatin) and promotes expression; certain methylation marks compact it (heterochromatin). These marks help cells keep their identity — a liver cell stays a liver cell — and are copied when cells divide.\n\nIn reality, it’s a bit more complicated: the slider treats the two kinds of marks as simple dials, but marks interact and their effects depend on where they are. Some epigenetic effects of environment (diet, stress, toxins) are well documented, but claims about traits passing down many human generations are mostly unproven; in mammals most marks are reset in eggs and sperm, with exceptions such as genomic imprinting.',
    quiz: [
      mc(
        'What does epigenetics change?',
        [
          'The DNA letters',
          'Which genes are switched on or off',
          'The number of chromosomes',
          'The genetic code',
        ],
        1,
        'Epigenetic tags change gene activity without changing the sequence.',
      ),
      mc(
        'DNA methylation usually…',
        ['Turns genes off', 'Turns genes on', 'Makes new genes', 'Copies DNA'],
        0,
        'Methyl tags at promoters typically silence genes.',
      ),
      predict(
        'Identical twins have the same DNA. As they age, their epigenetic tags drift apart.',
        'What might result?',
        [
          'They become genetically different',
          'The same genes are expressed differently, so they can differ in health or traits',
          'Nothing can change',
          'They swap DNA',
        ],
        1,
        'Same sequence, different tags, different expression.',
      ),
    ],
    relatedConcepts: ['genomic-imprinting', 'transcription', 'lac-operon'],
    funFact:
      'Queen and worker honeybees can have the same genes — a royal jelly diet changes their epigenetic tags and development.',
  },
  {
    id: 'lac-operon',
    title: 'Gene Switches: The Lac Operon',
    category: 'genetics',
    tags: ['operon', 'bacteria', 'gene regulation', 'repressor', 'lactose', 'E. coli'],
    aliases: ['operon', 'lac operon', 'gene expression in bacteria', 'repressor protein'],
    difficulty: 4,
    rarity: 'common',
    prerequisites: ['transcription'],
    summary:
      'Bacteria only make lactose-eating enzymes when lactose is around — thanks to a clever gene switch.',
    steps: steps(
      [
        'Don’t waste energy',
        'Making enzymes costs energy, so bacteria make them only when needed.',
      ],
      ['A blocker', 'A repressor protein normally sits on the DNA, blocking the lactose genes.'],
      ['Lactose unlocks it', 'When lactose arrives, it grabs the repressor and pulls it off.'],
      ['Genes on', 'RNA polymerase can now read the genes and make lactose-digesting enzymes.'],
    ),
    interaction: cascade(
      'Give E. coli some milk sugar and watch the switch flip. Then break a part.',
      ['Add lactose', '🥛'],
      [
        [
          'Lactose enters',
          '🍬',
          'A little lactose gets in and is converted to allolactose, the signal.',
        ],
        [
          'Signal grabs the repressor',
          '🧲',
          'Allolactose binds the LacI repressor and changes its shape.',
          'A broken repressor can’t hold on at all — the genes are ALWAYS on, even with no lactose, wasting energy.',
        ],
        ['Repressor lets go', '🔓', 'The repressor falls off the operator, clearing the road.'],
        ['RNA polymerase transcribes', '🚂', 'lacZ, lacY and lacA are copied into one mRNA.'],
        [
          'Enzymes made',
          '✂️',
          'β-galactosidase splits lactose; a permease pumps more lactose in.',
          'A broken lacZ gene: the switch flips, but no working enzyme is made, so lactose can’t be digested.',
        ],
      ],
      'The bacteria now digest lactose. When it runs out, the repressor rebinds and the genes switch off.',
    ),
    goDeeper:
      'An operon is a cluster of genes transcribed together from one promoter, found in bacteria. The lac operon (lacZ, lacY, lacA) is under negative control by the LacI repressor, which binds the operator unless allolactose is present. It is also under positive control: when glucose is low, cAMP rises and the CAP–cAMP complex helps RNA polymerase bind, so the operon is strongly expressed only when lactose is present AND glucose is absent. François Jacob and Jacques Monod won the 1965 Nobel Prize for this work.\n\nIn reality, it’s a bit more complicated: the switch is leaky, so a few permease and enzyme molecules are always present, which is how the first lactose gets in. The lesson leaves out the glucose/CAP layer to keep the cascade simple.',
    quiz: [
      mc(
        'What does the lac repressor do when there is no lactose?',
        [
          'Activates the genes',
          'Sits on the DNA and blocks transcription',
          'Digests glucose',
          'Leaves the cell',
        ],
        1,
        'The repressor blocks RNA polymerase from reading the lac genes.',
      ),
      predict(
        'A mutation means the repressor can no longer bind DNA.',
        'What happens to the lac genes?',
        [
          'They’re always off',
          'They’re always on, even without lactose',
          'They switch on only at night',
          'The cell dies instantly',
        ],
        1,
        'With no working repressor, nothing blocks transcription.',
      ),
      mc(
        'Why is gene regulation like this useful to bacteria?',
        [
          'It makes them glow',
          'It saves energy by only making enzymes when needed',
          'It lets them photosynthesize',
          'It makes them divide slower',
        ],
        1,
        'Making unneeded proteins wastes resources.',
      ),
    ],
    relatedConcepts: ['transcription', 'epigenetics', 'bacteria-vs-viruses'],
    funFact:
      'Scientists use the lacZ gene as a color reporter: bacteria with it turn blue on a special dye called X-gal.',
  },
  {
    id: 'crispr',
    title: 'CRISPR Gene Editing',
    category: 'genetics',
    tags: ['gene editing', 'Cas9', 'guide RNA', 'biotechnology', 'genetic engineering'],
    aliases: ['CRISPR-Cas9', 'gene editing', 'genetic scissors', 'genome editing'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['dna-structure'],
    summary:
      'CRISPR is a molecular scissors with a GPS: it finds an exact spot in DNA and cuts it.',
    steps: steps(
      [
        'A bacterial defense',
        'Bacteria use CRISPR to remember and cut up viruses that attacked them.',
      ],
      [
        'Guide + scissors',
        'A guide RNA matches the target DNA; the Cas9 protein does the cutting.',
      ],
      ['Cut', 'Cas9 finds the matching sequence and slices both DNA strands.'],
      [
        'Repair',
        'The cell repairs the cut — which can switch a gene off or paste in a new sequence.',
      ],
    ),
    interaction: assembly(
      'Edit a gene: put the CRISPR steps in order.',
      [
        [
          'Design a guide RNA',
          '🗺️',
          'Scientists write a ~20-letter RNA that matches the target gene.',
        ],
        ['Load Cas9', '✂️', 'The guide RNA slots into the Cas9 protein, forming the editing tool.'],
        [
          'Search the genome',
          '🔍',
          'Cas9 scans DNA for a short signal (PAM) next to the matching sequence.',
        ],
        ['Cut both strands', '💥', 'When the guide matches, Cas9 cuts the double helix.'],
        [
          'Cell repairs the cut',
          '🩹',
          'Quick repair often breaks the gene; with a template, a new sequence can be pasted in.',
        ],
      ],
      'Gene edited! This is how scientists study genes and develop treatments like the first approved CRISPR therapy for sickle cell disease.',
      {
        distractors: [
          [
            'Add a virus',
            '🦠',
            'CRISPR tools can be delivered many ways — a virus isn’t a required step.',
          ],
        ],
      },
    ),
    goDeeper:
      'CRISPR (clustered regularly interspaced short palindromic repeats) arrays store snippets of viral DNA in bacterial genomes; transcribed into guide RNAs, they direct Cas proteins to destroy matching viruses. Jennifer Doudna and Emmanuelle Charpentier (Nobel Prize 2020) showed that Cas9 could be programmed with a single guide RNA to cut any DNA next to a PAM sequence (NGG for SpCas9). Cells repair cuts by error-prone non-homologous end joining (often knocking out the gene) or by homology-directed repair using a template.\n\nIn reality, it’s a bit more complicated: Cas9 can sometimes cut similar, unintended sites (off-target effects), and newer tools — base editors and prime editors — change letters without cutting both strands. In 2023 the first CRISPR-based therapy (Casgevy) was approved for sickle cell disease. Editing embryos in ways that pass to future generations raises serious ethical questions and is banned or restricted in many countries.',
    quiz: [
      mc(
        'What tells Cas9 where to cut?',
        ['A protein map', 'A guide RNA that matches the target DNA', 'Sunlight', 'Random chance'],
        1,
        'The guide RNA base-pairs with the target sequence.',
      ),
      mc(
        'Where did CRISPR originally come from?',
        [
          'Human brains',
          'A bacterial immune system against viruses',
          'Plant chloroplasts',
          'A computer lab',
        ],
        1,
        'Bacteria evolved CRISPR to fight viruses.',
      ),
      predict(
        'Cas9 cuts a gene and the cell repairs it quickly but sloppily, adding a few extra letters.',
        'What likely happens to the gene?',
        [
          'It works better',
          'It is knocked out, often by a frameshift',
          'It doubles',
          'It turns into RNA',
        ],
        1,
        'Sloppy repair often shifts the reading frame and breaks the gene.',
      ),
    ],
    relatedConcepts: ['dna-structure', 'mutations', 'bacteriophages', 'horizontal-gene-transfer'],
    funFact:
      'Yogurt companies used CRISPR knowledge to make bacterial cultures resistant to viruses before it became a gene-editing tool.',
  },
  {
    id: 'pcr',
    title: 'PCR: Copying DNA in a Tube',
    category: 'genetics',
    tags: [
      'polymerase chain reaction',
      'DNA amplification',
      'testing',
      'forensics',
      'Taq polymerase',
    ],
    aliases: ['polymerase chain reaction', 'DNA photocopier', 'COVID test PCR'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['dna-replication'],
    summary: 'PCR copies a chosen bit of DNA billions of times by heating and cooling a tube.',
    steps: steps(
      ['Heat it', 'At about 95 °C, the two DNA strands separate.'],
      ['Cool it', 'At about 55 °C, short primers stick to either side of the target.'],
      ['Warm it', 'At about 72 °C, a heat-loving polymerase builds new strands.'],
      ['Repeat', 'Each cycle doubles the DNA: 30 cycles can make over a billion copies.'],
    ),
    interaction: assembly(
      'Program the PCR machine: put one cycle’s temperature steps in order. It loops!',
      [
        [
          'Denature at 95 °C',
          '🔥',
          'Heat breaks the hydrogen bonds; the double helix comes apart.',
        ],
        ['Anneal at 55 °C', '❄️', 'Cooling lets the primers stick to their matching spots.'],
        ['Extend at 72 °C', '🧱', 'Taq polymerase adds nucleotides, building new strands.'],
      ],
      'One cycle done — the DNA doubled. A PCR machine repeats this 25–40 times.',
      {
        layout: 'cycle',
        distractors: [
          ['Freeze at −20 °C', '🧊', 'Freezing stores samples, but isn’t part of the cycle.'],
          ['Add ribosomes', '🏭', 'PCR copies DNA; it doesn’t make proteins.'],
        ],
      },
    ),
    goDeeper:
      'Kary Mullis invented PCR in 1983 (Nobel Prize 1993). It requires template DNA, two primers flanking the target, the four dNTPs, magnesium and a thermostable DNA polymerase such as Taq, originally from Thermus aquaticus, a bacterium from Yellowstone hot springs. Amplification is exponential: after n cycles there are up to 2ⁿ copies. Uses include medical diagnostics, forensics, ancestry testing and research. Reverse-transcription PCR (RT-PCR) first converts RNA into DNA, which is how many COVID-19 tests detected the virus.\n\nIn reality, it’s a bit more complicated: annealing temperatures are tuned to each primer pair (often 50–65 °C), and efficiency is never quite 100%, so real yields are lower than 2ⁿ. Quantitative PCR measures how quickly the DNA amount rises to estimate how much was there at the start.',
    quiz: [
      mc(
        'Why is heat used at the start of each PCR cycle?',
        [
          'To kill bacteria',
          'To separate the DNA strands',
          'To make primers',
          'To glue DNA together',
        ],
        1,
        'High heat denatures (unzips) double-stranded DNA.',
      ),
      mc(
        'Why does PCR use Taq polymerase from a hot-spring bacterium?',
        [
          'It glows',
          'It survives the repeated high temperatures',
          'It is cheaper than water',
          'It cuts DNA',
        ],
        1,
        'A heat-stable enzyme doesn’t denature at 95 °C.',
      ),
      predict(
        'You start with 1 DNA molecule and run 10 perfect cycles.',
        'About how many copies do you have?',
        ['10', '100', 'About 1,000', '1 million'],
        2,
        '2¹⁰ = 1,024 — doubling adds up fast.',
      ),
    ],
    relatedConcepts: ['dna-replication', 'extremophiles', 'crispr'],
    funFact:
      'Kary Mullis said the idea for PCR came to him while driving along a California highway at night.',
  },
  {
    id: 'rna-interference',
    title: 'RNA Interference',
    category: 'genetics',
    tags: ['siRNA', 'microRNA', 'gene silencing', 'Dicer', 'RISC', 'Argonaute'],
    aliases: ['RNAi', 'gene silencing', 'siRNA', 'microRNA'],
    difficulty: 5,
    rarity: 'obscure',
    prerequisites: ['transcription', 'translation'],
    summary: 'Cells can silence a gene by shredding its messages before they are ever read.',
    steps: steps(
      ['Double trouble', 'Double-stranded RNA is a warning sign — many viruses make it.'],
      ['Chop', 'An enzyme called Dicer chops it into short pieces about 21 letters long.'],
      ['Seek', 'One strand guides a protein complex (RISC) to any matching mRNA.'],
      ['Destroy', 'RISC slices the mRNA, so that protein is never made.'],
    ),
    interaction: cascade(
      'Introduce double-stranded RNA matching a gene, and watch it get silenced. Then break a link.',
      ['Add double-stranded RNA', '🧬'],
      [
        ['dsRNA detected', '👀', 'Long double-stranded RNA appears in the cytoplasm.'],
        [
          'Dicer chops it',
          '🔪',
          'Dicer cuts it into short interfering RNAs (siRNAs), ~21 nucleotides long.',
          'No Dicer: the long RNA is never chopped into guides, so no silencing happens.',
        ],
        ['RISC loads a guide', '🎯', 'One strand is loaded into the RISC complex as a guide.'],
        [
          'Guide finds matching mRNA',
          '🔍',
          'The guide base-pairs with any mRNA that matches its sequence.',
        ],
        [
          'Argonaute slices it',
          '✂️',
          'The Argonaute protein in RISC cuts the mRNA.',
          'With a broken Argonaute “slicer”, the guide still binds but the mRNA survives and protein is made.',
        ],
        ['Gene silenced', '🔇', 'With its mRNA destroyed, the protein is no longer made.'],
      ],
      'The gene is silenced — even though its DNA is untouched.',
    ),
    goDeeper:
      'RNA interference was discovered in worms by Andrew Fire and Craig Mello (Nobel Prize 2006). It defends against viruses and transposons, and the related microRNA pathway regulates normal genes: hundreds of human microRNAs fine-tune protein levels, usually by repressing translation or destabilizing mRNA with imperfect matching. Scientists use synthetic siRNAs to switch off genes in experiments, and several siRNA medicines are approved (for example patisiran for hereditary transthyretin amyloidosis).\n\nIn reality, it’s a bit more complicated: in mammals, long double-stranded RNA also triggers an interferon alarm response, so researchers deliver short pre-made siRNAs instead. Perfectly matched siRNAs usually trigger slicing, while microRNAs usually bind imperfectly and block translation rather than slicing.',
    quiz: [
      mc(
        'What does the enzyme Dicer do?',
        [
          'Copies DNA',
          'Chops double-stranded RNA into short pieces',
          'Builds proteins',
          'Repairs mutations',
        ],
        1,
        'Dicer produces the short guide RNAs.',
      ),
      mc(
        'What does RNAi destroy?',
        ['DNA', 'Matching mRNA', 'Ribosomes', 'The nucleus'],
        1,
        'RISC slices mRNA that matches its guide.',
      ),
      predict(
        'Scientists add siRNA matching the gene for a glowing protein in a glowing worm.',
        'What happens?',
        [
          'The worm glows brighter',
          'The worm stops glowing as the mRNA is destroyed',
          'The worm’s DNA is deleted',
          'Nothing',
        ],
        1,
        'The protein can’t be made without its mRNA.',
      ),
    ],
    relatedConcepts: ['transcription', 'translation', 'epigenetics', 'viral-replication'],
    funFact:
      'RNAi was first glimpsed in petunias, when scientists trying to make flowers more purple accidentally made them white.',
  },
  {
    id: 'alternative-splicing',
    title: 'Alternative Splicing',
    category: 'genetics',
    tags: ['exons', 'introns', 'spliceosome', 'protein diversity', 'mRNA'],
    aliases: ['exon shuffling', 'one gene many proteins', 'splicing'],
    difficulty: 4,
    rarity: 'obscure',
    prerequisites: ['transcription'],
    summary: 'One gene can make several different proteins by mixing and matching its pieces.',
    steps: steps(
      ['Genes in pieces', 'Most human genes are split into exons (kept) and introns (cut out).'],
      ['Choose your pieces', 'Different cells can keep different combinations of exons.'],
      [
        'Many proteins, one gene',
        'So one gene can make several protein versions for different tissues.',
      ],
    ),
    interaction: lockKey(
      'Each tissue needs its own version of a protein. Deliver the right mRNA splice version to each.',
      [
        ['Muscle cell', 'triangle', '#ef4444', 'Needs version with exon 2'],
        ['Brain cell', 'square', '#6366f1', 'Needs version with exon 3'],
        ['Liver cell', 'circle', '#f59e0b', 'Needs the short version'],
      ],
      [
        ['Exons 1-2-4', 'triangle', '#ef4444', 0, 'Exon 3 was skipped: the muscle version.'],
        ['Exons 1-3-4', 'square', '#6366f1', 1, 'Exon 2 was skipped: the brain version.'],
        [
          'Exons 1-4',
          'circle',
          '#f59e0b',
          2,
          'Both middle exons skipped: the short liver version.',
        ],
        [
          'Intron A + exons',
          'wave',
          '#94a3b8',
          null,
          'Introns must be cut out! This message would make a garbled protein.',
        ],
      ],
    ),
    goDeeper:
      'The spliceosome (snRNAs plus proteins) removes introns from pre-mRNA. In alternative splicing, exons can be skipped, intron sequences retained, or alternative 5′/3′ splice sites chosen, controlled by splicing regulators that bind enhancer and silencer sequences. Over 90% of human multi-exon genes are alternatively spliced, which helps explain how about 20,000 genes produce a far larger variety of proteins. The fruit fly Dscam gene can in theory produce over 38,000 versions.\n\nIn reality, it’s a bit more complicated: the gene here is invented to show the idea, and many splice variants may be rare or non-functional. Splicing errors cause diseases such as spinal muscular atrophy, now treated with a drug (nusinersen) that changes how the SMN2 gene is spliced.',
    quiz: [
      mc(
        'What gets removed during splicing?',
        ['Exons', 'Introns', 'Codons', 'Ribosomes'],
        1,
        'Introns are cut out; exons are joined.',
      ),
      mc(
        'How can about 20,000 human genes make many more kinds of proteins?',
        [
          'Each gene is read backwards too',
          'Alternative splicing joins exons in different combinations',
          'Proteins copy themselves',
          'Ribosomes invent new proteins',
        ],
        1,
        'Mixing exons produces protein variants.',
      ),
      predict(
        'A drug changes which exons are kept in a gene’s mRNA.',
        'What could it change?',
        [
          'The DNA sequence',
          'Which protein version the cell makes',
          'The number of chromosomes',
          'Nothing',
        ],
        1,
        'Splicing-switching drugs change the protein without touching DNA.',
      ),
    ],
    relatedConcepts: ['transcription', 'translation', 'nonsense-mediated-decay'],
    funFact:
      'One fruit fly gene, Dscam, could theoretically make over 38,000 different proteins through alternative splicing.',
  },
  {
    id: 'transposons',
    title: 'Transposons: Jumping Genes',
    category: 'genetics',
    tags: ['jumping genes', 'Barbara McClintock', 'corn', 'mobile DNA', 'genome'],
    aliases: [
      'jumping genes',
      'transposable elements',
      'mobile genetic elements',
      'Barbara McClintock',
    ],
    difficulty: 4,
    rarity: 'obscure',
    prerequisites: ['dna-structure'],
    summary: 'Some pieces of DNA can cut themselves out and hop to new spots in the genome.',
    steps: steps(
      ['DNA that moves', 'Transposons are stretches of DNA that can move around the genome.'],
      [
        'Cut and paste',
        'An enzyme called transposase cuts the transposon out and pastes it elsewhere.',
      ],
      ['Breaking genes', 'If it lands inside a gene, it can switch that gene off.'],
      ['Speckled corn', 'Barbara McClintock discovered this from spotted corn kernels.'],
    ),
    interaction: timeline(
      'Watch a jumping gene hop into a color gene in a corn kernel.',
      [
        [
          'Gene working',
          'The purple color gene works, so the kernel cells make purple pigment.',
          [
            sh('k', 'blob', '#a855f7', 50, 50, 5),
            sh('tn', 'rod', '#facc15', 20, 25, 0.8, { label: 'transposon' }),
          ],
        ],
        [
          'Transposon cuts out',
          'Transposase cuts the transposon out of its old spot.',
          [
            sh('k', 'blob', '#a855f7', 50, 50, 5),
            sh('tn', 'rod', '#facc15', 32, 30, 0.8, { label: 'transposon' }),
          ],
        ],
        [
          'Lands in the color gene',
          'It hops into the color gene, breaking it. Cells now make no pigment: the kernel turns pale.',
          [
            sh('k', 'blob', '#fef3c7', 50, 50, 5),
            sh('tn', 'rod', '#facc15', 50, 45, 0.8, { label: 'in color gene' }),
          ],
        ],
        [
          'Jumps out again',
          'In some cells, it hops back out, repairing the gene. Those cells and their descendants make purple again.',
          [
            sh('k', 'blob', '#fef3c7', 50, 50, 5),
            sh('tn', 'rod', '#facc15', 78, 30, 0.8),
            ...[
              [38, 40],
              [60, 58],
              [44, 66],
              [58, 36],
            ].map(([x, y], i) => sh(`spot${i}`, 'circle', '#7e22ce', x, y, 0.5)),
          ],
        ],
        [
          'Speckled kernel',
          'The result: a pale kernel with purple speckles, each spot a patch of cells where the gene was fixed.',
          [
            sh('k', 'blob', '#fef3c7', 50, 50, 5),
            ...[
              [38, 40],
              [60, 58],
              [44, 66],
              [58, 36],
              [50, 50],
              [40, 56],
              [62, 44],
            ].map(([x, y], i) => sh(`spot${i}`, 'circle', '#7e22ce', x, y, 0.55)),
          ],
        ],
      ],
      [
        ['Stop when the transposon breaks the color gene.', 2],
        ['Stop when you see the final speckled kernel.', 4],
      ],
      '#fefce8',
    ),
    goDeeper:
      'Barbara McClintock discovered transposition in maize in the 1940s; her work was long doubted and she won the Nobel Prize in 1983. DNA transposons move by cut-and-paste using transposase; retrotransposons copy themselves via an RNA intermediate and reverse transcriptase (copy-and-paste). Nearly half the human genome derives from transposable elements, such as LINE-1 and Alu repeats, though most are now inactive.\n\nIn reality, it’s a bit more complicated: transposons are not just “junk” — some have been repurposed by evolution, for example the RAG genes that let immune cells shuffle antibody genes probably came from an ancient transposon. The peppered moth’s dark color mutation is a transposon insertion.',
    quiz: [
      mc(
        'Who discovered jumping genes?',
        ['Gregor Mendel', 'Barbara McClintock', 'Charles Darwin', 'Rosalind Franklin'],
        1,
        'McClintock found them in corn.',
      ),
      predict(
        'A transposon lands in the middle of a gene for an enzyme.',
        'What is the likely result?',
        [
          'The enzyme works better',
          'The gene is disrupted and the enzyme may not be made',
          'The cell grows a new chromosome',
          'Nothing can happen',
        ],
        1,
        'Insertions can break genes.',
      ),
      mc(
        'About how much of the human genome comes from transposable elements?',
        ['Less than 1%', 'Nearly half', 'Exactly 100%', 'None'],
        1,
        'Roughly 45% of our genome is transposon-derived.',
      ),
    ],
    relatedConcepts: ['mutations', 'horizontal-gene-transfer', 'natural-selection'],
    funFact:
      'The dark form of the peppered moth was caused by a jumping gene inserting itself near a color gene.',
  },
  {
    id: 'nonsense-mediated-decay',
    title: 'Nonsense-Mediated Decay',
    category: 'genetics',
    tags: ['mRNA quality control', 'stop codon', 'UPF1', 'exon junction complex', 'RNA'],
    aliases: ['NMD', 'mRNA surveillance', 'quality control for messages'],
    difficulty: 5,
    rarity: 'obscure',
    prerequisites: ['mutations', 'alternative-splicing'],
    summary:
      'Cells shred faulty messages with a premature STOP before they make half-finished proteins.',
    steps: steps(
      ['A risky typo', 'A nonsense mutation puts a STOP codon too early in a gene.'],
      [
        'Leftover markers',
        'Splicing leaves protein markers on the mRNA wherever introns were removed.',
      ],
      [
        'The tell-tale sign',
        'Normally the first ribosome knocks all markers off. If it stops early, markers are left behind.',
      ],
      ['Shred it', 'Surveillance proteins notice and destroy the faulty message.'],
    ),
    interaction: cascade(
      'A mutation creates an early STOP codon. Watch quality control catch it, then break a step.',
      ['Mutation: early STOP codon', '⚠️'],
      [
        [
          'Splicing leaves markers',
          '📍',
          'Exon junction complexes sit just upstream of each place an intron was removed.',
        ],
        [
          'First ribosome reads the mRNA',
          '🏭',
          'During the first “pioneer” round, the ribosome strips off markers as it passes.',
        ],
        [
          'Ribosome stops too early',
          '🛑',
          'It hits the premature STOP while markers still sit further along.',
        ],
        [
          'UPF proteins notice',
          '🕵️',
          'UPF1 and partners detect a stop codon upstream of a leftover marker.',
          'Without UPF1, the faulty mRNA survives and a truncated protein is made — which can interfere with the normal protein.',
        ],
        ['mRNA destroyed', '♻️', 'The message is decapped and chewed up by nucleases.'],
      ],
      'The faulty message is destroyed. No half-made protein — which is often safer than a broken one.',
    ),
    goDeeper:
      'Nonsense-mediated mRNA decay (NMD) degrades transcripts with premature termination codons, generally when the stop lies more than ~50–55 nucleotides upstream of the last exon–exon junction. Core factors include UPF1 (an RNA helicase), UPF2 and UPF3, and decay proceeds through endonucleolytic cleavage (SMG6) and exonucleases. About a third of disease-causing mutations create premature stop codons, so NMD shapes how severe many genetic diseases are.\n\nIn reality, it’s a bit more complicated: NMD isn’t only for errors — cells use it to regulate many normal genes, sometimes paired with alternative splicing to turn genes down. Doctors are also exploring the opposite strategy for some diseases: drugs that let ribosomes read through premature stops.',
    quiz: [
      mc(
        'What does nonsense-mediated decay destroy?',
        ['Healthy proteins', 'mRNAs with a premature stop codon', 'All DNA', 'Ribosomes'],
        1,
        'It targets faulty messages with early stops.',
      ),
      mc(
        'How does the cell recognize an early stop codon?',
        [
          'The mRNA turns red',
          'Splicing markers are still on the mRNA after the ribosome stops',
          'The DNA tells it',
          'The ribosome explodes',
        ],
        1,
        'Markers left downstream of a stop signal that the stop came too early.',
      ),
      predict(
        'NMD is switched off in a cell with a nonsense mutation.',
        'What happens?',
        [
          'Nothing is made',
          'Short, truncated proteins are made from the faulty mRNA',
          'The mutation is fixed',
          'The gene doubles',
        ],
        1,
        'Without NMD, the faulty mRNA is translated into a short protein.',
      ),
    ],
    relatedConcepts: ['mutations', 'alternative-splicing', 'translation'],
    funFact:
      'Some people with the same disease gene have milder or worse symptoms depending on whether NMD destroys their faulty mRNA.',
  },
  {
    id: 'genomic-imprinting',
    title: 'Genomic Imprinting',
    category: 'genetics',
    tags: ['epigenetics', 'parent of origin', 'Prader-Willi', 'Angelman', 'IGF2'],
    aliases: ['parent-of-origin effects', 'imprinted genes', 'Prader-Willi and Angelman'],
    difficulty: 5,
    rarity: 'obscure',
    prerequisites: ['epigenetics'],
    summary:
      'For a few genes, it matters whether your copy came from mom or dad — only one parent’s copy is used.',
    steps: steps(
      [
        'Two copies, one used',
        'Usually both copies of a gene work. For imprinted genes, one is silenced.',
      ],
      ['Stamped in the egg or sperm', 'The silencing tags are added while eggs or sperm are made.'],
      [
        'Same deletion, different disease',
        'Losing a chromosome 15 region from dad causes Prader-Willi syndrome; from mom, Angelman syndrome.',
      ],
    ),
    interaction: sorting(
      'For each gene, which parent’s copy is switched on?',
      [
        ['Only dad’s copy works', '👨', 'Maternal copy silenced'],
        ['Only mom’s copy works', '👩', 'Paternal copy silenced'],
        ['Both copies work', '👫', 'Not imprinted'],
      ],
      [
        ['IGF2 (growth factor)', '📈', 0, 'Dad’s IGF2 copy is active and promotes fetal growth.'],
        ['H19', '🧶', 1, 'H19 is expressed only from mom’s chromosome.'],
        [
          'UBE3A in neurons',
          '🧠',
          1,
          'Only mom’s UBE3A works in neurons — losing it causes Angelman syndrome.',
        ],
        [
          'SNRPN region genes',
          '🧩',
          0,
          'Dad’s copies are active; losing them causes Prader-Willi syndrome.',
        ],
        ['Hemoglobin (HBB)', '🩸', 2, 'Most genes, like hemoglobin, use both copies.'],
        ['Insulin receptor', '📡', 2, 'Not imprinted — both copies are used.'],
      ],
    ),
    goDeeper:
      'Imprinting affects only about 100–200 human genes. Parent-specific DNA methylation at imprinting control regions is set in the germline, escapes the usual epigenetic reset after fertilization, and is then copied in body cells. A leading explanation is the “parental conflict” hypothesis: paternally expressed genes tend to promote offspring growth (taking more resources from the mother), while maternally expressed genes tend to restrain it.\n\nIn reality, it’s a bit more complicated: imprinting can be tissue-specific (UBE3A is imprinted in neurons but not most other cells), and imprinting disorders can also arise from uniparental disomy, where a child inherits both copies of a chromosome from one parent.',
    quiz: [
      mc(
        'What makes a gene “imprinted”?',
        [
          'It has a mutation',
          'Only the copy from one specific parent is active',
          'It is printed on paper',
          'It is found only in males',
        ],
        1,
        'Imprinted genes are expressed depending on parent of origin.',
      ),
      predict(
        'A child inherits a deletion on chromosome 15 from their father, and the mother’s copy is normal.',
        'Which condition is expected?',
        ['Angelman syndrome', 'Prader-Willi syndrome', 'No condition', 'Color blindness'],
        1,
        'The paternally expressed genes are lost and mom’s copies are silenced.',
      ),
      mc(
        'When are imprinting tags set?',
        [
          'During puberty',
          'While eggs and sperm are made',
          'After birth',
          'Never — they are random',
        ],
        1,
        'Imprints are established in the germline.',
      ),
    ],
    relatedConcepts: ['epigenetics', 'mendelian-inheritance', 'meiosis'],
    funFact:
      'Mules (donkey dad, horse mom) and hinnies (horse dad, donkey mom) look different partly because of imprinted genes.',
  },
  {
    id: 'horizontal-gene-transfer',
    title: 'Horizontal Gene Transfer',
    category: 'genetics',
    tags: ['plasmids', 'conjugation', 'transformation', 'transduction', 'bacteria'],
    aliases: ['HGT', 'lateral gene transfer', 'bacterial gene sharing', 'plasmid sharing'],
    difficulty: 3,
    rarity: 'obscure',
    prerequisites: ['bacteria-vs-viruses'],
    summary: 'Bacteria don’t just inherit genes from parents — they swap them with neighbors.',
    steps: steps(
      [
        'Sideways, not down',
        'Vertical transfer is parent → offspring. Horizontal transfer is between living cells.',
      ],
      [
        'Three ways',
        'Bacteria can grab DNA from the environment, get it from a virus, or pass it through a tube.',
      ],
      ['Spreading resistance', 'This is how antibiotic resistance genes jump between species.'],
    ),
    interaction: sorting(
      'Sort each example to the way the DNA moved.',
      [
        ['Transformation', '🫴', 'Picking up free DNA from the surroundings'],
        ['Transduction', '🦠', 'A virus accidentally carries DNA between bacteria'],
        ['Conjugation', '🔗', 'Direct transfer through a connecting tube'],
      ],
      [
        [
          'Griffith’s 1928 experiment: harmless bacteria picked up deadly genes from dead bacteria',
          '💀',
          0,
          'Bacteria absorbed DNA released by dead cells.',
        ],
        [
          'A phage packs a bacterial gene by mistake and injects it into a new host',
          '💉',
          1,
          'Phages can ferry genes between bacteria.',
        ],
        [
          'A resistance plasmid passes through a pilus to a neighbor',
          '🔌',
          2,
          'Conjugation uses a pilus “bridge.”',
        ],
        [
          'Cholera bacteria got their toxin gene from a virus',
          '☣️',
          1,
          'The cholera toxin gene arrived on a phage.',
        ],
        [
          'Lab bacteria take up a plasmid after a heat shock',
          '🌡️',
          0,
          'Scientists use transformation to put genes into bacteria.',
        ],
        [
          'Different species share a “superbug” resistance plasmid in a hospital',
          '🏥',
          2,
          'Plasmids spread resistance across species by conjugation.',
        ],
      ],
    ),
    goDeeper:
      'Horizontal gene transfer is a major force in bacterial evolution. Transformation was discovered by Frederick Griffith (1928) and its agent shown to be DNA by Avery, MacLeod and McCarty (1944). Transduction can be generalized (random host DNA packaged) or specialized. Conjugation transfers plasmids (and sometimes chromosome pieces) via a pilus; integrons and transposons help collect resistance genes into mobile packages.\n\nIn reality, it’s a bit more complicated: HGT isn’t limited to bacteria. Mitochondria and chloroplasts transferred many genes to the nucleus, bdelloid rotifers have picked up genes from bacteria and fungi, and some genes in sweet potatoes came from soil bacteria. HGT makes the “tree of life” look more like a web near its roots.',
    quiz: [
      mc(
        'Which method uses a virus to carry DNA?',
        ['Transformation', 'Transduction', 'Conjugation', 'Fermentation'],
        1,
        'Transduction is virus-mediated.',
      ),
      mc(
        'Why does horizontal gene transfer worry doctors?',
        [
          'It makes bacteria smaller',
          'Resistance genes can spread between different bacteria quickly',
          'It creates viruses',
          'It only happens in plants',
        ],
        1,
        'Resistance can jump to new species without waiting for mutations.',
      ),
      predict(
        'A harmless gut bacterium sits next to a bacterium carrying a resistance plasmid.',
        'What can happen?',
        [
          'Nothing — bacteria can’t share genes',
          'The harmless bacterium may receive the plasmid and become resistant',
          'Both bacteria die',
          'They turn into one bacterium',
        ],
        1,
        'Conjugation can pass the plasmid along.',
      ),
    ],
    relatedConcepts: [
      'antibiotic-resistance',
      'bacteriophages',
      'bdelloid-rotifers',
      'endosymbiosis',
    ],
    funFact:
      'Sweet potatoes contain genes from soil bacteria — they are a naturally “genetically modified” crop.',
  },
  {
    id: 'mitochondrial-inheritance',
    title: 'Mitochondrial Inheritance',
    category: 'genetics',
    tags: ['mtDNA', 'maternal inheritance', 'mitochondria', 'ancestry', 'Mitochondrial Eve'],
    aliases: ['maternal inheritance', 'mtDNA', 'Mitochondrial Eve', 'inherited from mom'],
    difficulty: 3,
    rarity: 'obscure',
    prerequisites: ['mitochondria'],
    summary: 'Your mitochondria — and their DNA — come only from your mother.',
    steps: steps(
      ['Their own DNA', 'Mitochondria carry a small circle of DNA with 37 genes.'],
      [
        'Egg brings them',
        'The egg contains hundreds of thousands of mitochondria; the sperm’s are destroyed.',
      ],
      [
        'Mom’s line only',
        'So everyone inherits mitochondrial DNA from their mother, her mother, and so on.',
      ],
    ),
    interaction: sorting(
      'A grandmother carries a mitochondrial DNA variant. Who inherits it?',
      [
        ['Inherits the variant', '✅', 'Got it through the maternal line'],
        ['Does not inherit it', '❌', 'Mitochondria didn’t pass this way'],
      ],
      [
        ['Her son', '👦', 0, 'Sons get mitochondria from their mother too.'],
        ['Her daughter', '👧', 0, 'Daughters inherit their mother’s mitochondria.'],
        [
          'Her son’s children',
          '👶',
          1,
          'Men don’t pass on their mitochondria, so the line stops with him.',
        ],
        ['Her daughter’s children', '🍼', 0, 'The daughter passes it on to all her children.'],
        ['Her husband', '👴', 1, 'Spouses aren’t related through mitochondria.'],
        [
          'Her daughter’s daughter’s children',
          '🧒',
          0,
          'The maternal line continues for generations.',
        ],
      ],
    ),
    goDeeper:
      'Human mitochondrial DNA (mtDNA) is about 16,569 base pairs and encodes 13 proteins of the electron transport chain plus rRNAs and tRNAs. Sperm mitochondria are tagged and destroyed after fertilization. Because mtDNA doesn’t recombine and mutates at a steady rate, it is used to trace maternal ancestry; “Mitochondrial Eve” is the most recent woman from whom all living humans descend through the maternal line.\n\nIn reality, it’s a bit more complicated: cells contain many mtDNA copies, which can be a mix of normal and mutated (heteroplasmy), so the severity of mitochondrial diseases can vary even among siblings. A few rare cases of paternal mtDNA inheritance have been reported. “Three-parent” IVF techniques can replace a mother’s faulty mitochondria with a donor’s.',
    quiz: [
      mc(
        'From whom do you inherit mitochondrial DNA?',
        ['Your father', 'Your mother', 'Both parents equally', 'Neither'],
        1,
        'mtDNA comes from the egg.',
      ),
      predict(
        'A man has a mitochondrial disease mutation.',
        'Will his children inherit it?',
        [
          'Yes, all of them',
          'No — fathers don’t pass on mitochondria',
          'Only his sons',
          'Only his daughters',
        ],
        1,
        'His mitochondria aren’t passed on.',
      ),
      mc(
        'Why is mtDNA useful for tracing ancestry?',
        [
          'It changes every generation completely',
          'It passes down the maternal line without mixing',
          'It is identical in all animals',
          'It is only found in bones',
        ],
        1,
        'Without recombination, mtDNA tracks maternal lineages.',
      ),
    ],
    relatedConcepts: ['mitochondria', 'endosymbiosis', 'mendelian-inheritance'],
    funFact:
      'In 2013, mitochondrial DNA helped confirm a 500-year-old skeleton was King Richard III by matching it with living maternal-line relatives.',
  },
];
