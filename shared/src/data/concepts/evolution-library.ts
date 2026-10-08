import type { Concept } from '../../types';
import { assembly, em, label, mc, predict, slider, sorting, steps, timeline } from './helpers';

export const evolutionLibrary: Concept[] = [
  {
    id: 'adaptation',
    title: 'Adaptation',
    category: 'evolution',
    tags: ['adaptations', 'environment', 'survival', 'camouflage', 'habitats'],
    aliases: ['animal adaptations', 'how animals fit their habitat'],
    difficulty: 1,
    rarity: 'common',
    summary:
      'Living things have features that help them survive where they live — shaped over many generations.',
    steps: steps(
      [
        'Fitting in',
        'An adaptation is a trait that helps an organism survive and reproduce in its environment.',
      ],
      ['Many kinds', 'Adaptations can be body parts, behaviors or chemistry.'],
      ['Built slowly', 'They build up over generations through natural selection.'],
    ),
    interaction: sorting(
      'Which habitat does each adaptation suit best?',
      [
        ['Arctic', '🧊', 'Freezing and snowy'],
        ['Desert', '🏜️', 'Hot and dry'],
        ['Ocean', '🌊', 'Underwater life'],
      ],
      [
        ['Thick fat and fur (polar bear)', '🐻‍❄️', 0, 'Blubber and dense fur trap heat.'],
        ['White winter coat (arctic fox)', '🦊', 0, 'Camouflage against the snow.'],
        [
          'Hump storing fat (camel)',
          '🐫',
          1,
          'Fat in one place leaves the rest of the body cooler; camels also tolerate losing lots of water.',
        ],
        ['Big ears releasing heat (fennec fox)', '👂', 1, 'Large ears radiate body heat.'],
        [
          'Waxy stems storing water (cactus)',
          '🌵',
          1,
          'Thick, waxy stems store water and lose little.',
        ],
        ['Gills (fish)', '🐟', 2, 'Gills extract oxygen from water.'],
        ['Streamlined body (dolphin)', '🐬', 2, 'A smooth shape cuts through water efficiently.'],
      ],
    ),
    goDeeper:
      'An adaptation is a heritable trait that increased fitness in an ancestral environment and was shaped by natural selection. Examples include structural traits (beaks, fur), physiological traits (antifreeze proteins in Antarctic fish, high-altitude hemoglobin) and behaviors (migration, hibernation). Adaptation is always relative to an environment — a polar bear’s coat is a burden in a desert.\n\nIn reality, it’s a bit more complicated: not every trait is an adaptation. Some are side effects of other traits, leftovers from the past (vestigial structures), or spread by chance (genetic drift). Also, a camel’s hump stores fat, not water — a common myth.',
    quiz: [
      mc(
        'What is an adaptation?',
        [
          'Something an animal learns in one day',
          'A trait that helps an organism survive and reproduce in its environment',
          'A disease',
          'A type of habitat',
        ],
        1,
        'Adaptations improve survival and reproduction.',
      ),
      mc(
        'What is stored in a camel’s hump?',
        ['Water', 'Fat', 'Air', 'Milk'],
        1,
        'A common myth says water — it’s actually fat.',
      ),
      predict(
        'A polar bear is moved to a hot desert.',
        'Will its thick fur help?',
        [
          'Yes, it helps everywhere',
          'No — it will overheat; adaptations fit specific environments',
          'It will turn into sand-colored fur overnight',
          'Polar bears love heat',
        ],
        1,
        'Adaptations are only useful in the right environment.',
      ),
    ],
    relatedConcepts: ['natural-selection', 'convergent-evolution', 'island-rule'],
    funFact:
      'Antarctic icefish have no red blood cells — their blood is clear, and antifreeze proteins keep it from freezing.',
  },
  {
    id: 'genetic-drift',
    title: 'Genetic Drift',
    category: 'evolution',
    tags: ['random chance', 'small populations', 'founder effect', 'bottleneck', 'alleles'],
    aliases: ['founder effect', 'population bottleneck', 'random evolution'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['natural-selection'],
    summary: 'Sometimes evolution happens by pure luck — especially in small populations.',
    steps: steps(
      ['Random luck', 'Which individuals happen to reproduce isn’t always about being “better.”'],
      [
        'Small = big swings',
        'In small populations, chance can wipe out a gene version in a few generations.',
      ],
      [
        'Bottlenecks',
        'Disasters that shrink a population leave behind whatever genes survived by luck.',
      ],
      [
        'Founders',
        'A few individuals starting a new population carry only some of the original variety.',
      ],
    ),
    interaction: slider({
      prompt:
        'Start with a 50/50 mix of two neutral gene versions. How likely is one to disappear by chance?',
      inputs: [
        { id: 'pop', label: 'Population size', min: 4, max: 500, step: 2, start: 100 },
        { id: 'gens', label: 'Generations', min: 1, max: 200, step: 1, start: 50 },
      ],
      output: {
        label: 'Chance one version is lost',
        unit: '%',
        max: 100,
        expr: '100 * (1 - exp(-gens / (1.4 * pop)))',
      },
      graphInput: 'pop',
      visual: { kind: 'particles', emoji: '🎲' },
      challenges: [
        {
          prompt: 'Make drift almost certain to wipe out a version (over 90%).',
          target: { min: 90 },
          explain:
            'In a tiny population, random luck quickly fixes one version and loses the other.',
        },
        {
          prompt: 'Keep both versions safe: under 10% chance of loss.',
          target: { max: 10 },
          explain: 'Large populations buffer against random drift.',
        },
      ],
    }),
    goDeeper:
      'Genetic drift is random change in allele frequencies due to sampling — which individuals happen to survive and reproduce. Its strength is inversely related to population size: for a neutral allele, the expected time to fixation is about 4N generations, and the probability of eventual fixation equals its current frequency. Founder effects (e.g., high frequencies of certain genetic conditions in some isolated communities) and bottlenecks (northern elephant seals were hunted down to perhaps 20–100 individuals) reduce genetic diversity.\n\nIn reality, it’s a bit more complicated: the slider uses a simplified formula. Drift and selection act together; in small populations drift can even fix mildly harmful alleles, which is a concern for endangered species with low genetic diversity, like cheetahs.',
    quiz: [
      mc(
        'Genetic drift is strongest in…',
        ['Large populations', 'Small populations', 'All populations equally', 'Only plants'],
        1,
        'Chance has a bigger effect when there are fewer individuals.',
      ),
      predict(
        'A storm kills 95% of a beetle population at random.',
        'What happens to genetic diversity?',
        [
          'It increases',
          'It drops — a bottleneck',
          'It stays the same',
          'All beetles become identical twins',
        ],
        1,
        'Survivors carry only part of the original gene pool.',
      ),
      mc(
        'How is drift different from natural selection?',
        [
          'Drift is driven by random chance, not by how well traits fit',
          'Drift only happens in bacteria',
          'There is no difference',
          'Selection is random',
        ],
        0,
        'Selection favors useful traits; drift is luck.',
      ),
    ],
    relatedConcepts: ['natural-selection', 'speciation', 'island-rule'],
    funFact:
      'All living cheetahs are so genetically similar that skin grafts between unrelated cheetahs were accepted in experiments.',
  },
  {
    id: 'speciation',
    title: 'Speciation',
    category: 'evolution',
    tags: [
      'new species',
      'reproductive isolation',
      'geographic isolation',
      'Grand Canyon squirrels',
    ],
    aliases: ['how new species form', 'allopatric speciation', 'reproductive isolation'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['natural-selection'],
    summary: 'Split one population apart for long enough and it can become two different species.',
    steps: steps(
      ['One population', 'A species is a group that can interbreed.'],
      ['A barrier', 'A canyon, river or mountain splits the population.'],
      ['Drifting apart', 'Each side adapts to its own conditions and changes by chance.'],
      ['Two species', 'Eventually they can’t interbreed even if they meet again.'],
    ),
    interaction: timeline(
      'Watch squirrels split into two species across the Grand Canyon.',
      [
        [
          'One population',
          'Squirrels roam a wide forest and all interbreed.',
          [
            em('s1', '🐿️', 30, 55, 1.2),
            em('s2', '🐿️', 50, 50, 1.2),
            em('s3', '🐿️', 70, 55, 1.2),
            em('trees', '🌲', 50, 25, 2),
          ],
          'Long ago',
        ],
        [
          'A canyon forms',
          'Over millions of years, the Colorado River carves a canyon. Squirrels can’t cross.',
          [
            em('s1', '🐿️', 22, 55, 1.2),
            em('s2', '🐿️', 30, 45, 1.2),
            em('s3', '🐿️', 78, 55, 1.2),
            em('canyon', '🏞️', 50, 60, 2.2),
            em('trees', '🌲', 50, 20, 1.5),
          ],
        ],
        [
          'Changing separately',
          'Each side faces different food, weather and predators. Different mutations appear.',
          [
            em('s1', '🐿️', 22, 55, 1.2),
            em('s2', '🐿️', 30, 45, 1.2),
            em('s3', '🦫', 78, 55, 1.2),
            em('canyon', '🏞️', 50, 60, 2.2),
          ],
        ],
        [
          'Two species',
          'Today: Abert’s squirrel on the south rim and the Kaibab squirrel on the north rim — distinct populations that no longer mix.',
          [
            em('s1', '🐿️', 22, 55, 1.4, { label: 'Abert’s' }),
            em('s3', '🦫', 78, 55, 1.4, { label: 'Kaibab' }),
            em('canyon', '🏞️', 50, 60, 2.2),
          ],
          'Today',
        ],
      ],
      [
        ['Stop when the population is first split by a barrier.', 1],
        ['Stop when they have become separate kinds.', 3],
      ],
      '#fff7ed',
    ),
    goDeeper:
      'The biological species concept defines species as groups of interbreeding populations reproductively isolated from others. Allopatric speciation follows geographic separation; sympatric speciation happens without it (for example by polyploidy in plants or by shifting to a new host in insects). Reproductive barriers can be prezygotic (different mating seasons, songs or body parts) or postzygotic (hybrids that are infertile, like mules).\n\nIn reality, it’s a bit more complicated: the Kaibab and Abert’s squirrels are usually classified as subspecies of one species — a nice example of speciation in progress, since “species” boundaries can be fuzzy. The emoji change in the timeline is just a visual cue, not a real body change!',
    quiz: [
      mc(
        'What usually starts allopatric speciation?',
        [
          'A new food',
          'A geographic barrier splitting a population',
          'A single mutation',
          'Pollution',
        ],
        1,
        'Physical separation stops gene flow.',
      ),
      mc(
        'When are two populations considered separate species?',
        [
          'When they look different',
          'When they can no longer interbreed and produce fertile offspring',
          'When they live in different countries',
          'When they eat different food',
        ],
        1,
        'Reproductive isolation is the key.',
      ),
      predict(
        'A horse and a donkey have a baby (a mule).',
        'What does the mule tell us?',
        [
          'Horses and donkeys are the same species',
          'They are separate species — mules are usually infertile',
          'Mules are a third species',
          'Nothing',
        ],
        1,
        'Infertile hybrids show reproductive isolation.',
      ),
    ],
    relatedConcepts: ['natural-selection', 'genetic-drift', 'phylogenetic-trees', 'island-rule'],
    funFact:
      'Over 500 species of cichlid fish evolved in Lake Victoria in perhaps just 15,000 years.',
  },
  {
    id: 'convergent-evolution',
    title: 'Convergent Evolution',
    category: 'evolution',
    tags: ['analogous structures', 'wings', 'streamlining', 'eyes', 'similar solutions'],
    aliases: ['analogous structures', 'same solution evolving twice'],
    difficulty: 2,
    rarity: 'common',
    summary: 'Unrelated animals can evolve the same solution to the same problem.',
    steps: steps(
      ['Same problem', 'Flying, swimming fast or seeing well are problems many animals face.'],
      ['Similar answers', 'Natural selection often finds similar solutions independently.'],
      ['Not relatives', 'A bat’s wing and a bird’s wing look alike but evolved separately.'],
    ),
    interaction: sorting(
      'These animals aren’t closely related. Sort them by the solution they evolved.',
      [
        ['Wings for flight', '🪽', 'Evolved flight separately'],
        ['Torpedo-shaped swimmers', '🌊', 'Streamlined for speed'],
        ['Camera-like eyes', '👁️', 'Lens-focused eyes'],
      ],
      [
        ['Bat', '🦇', 0, 'Bat wings are skin stretched over long finger bones.'],
        ['Bird', '🐦', 0, 'Bird wings are feathers on a fused arm.'],
        ['Butterfly', '🦋', 0, 'Insect wings evolved from body-wall outgrowths, not limbs at all.'],
        ['Shark (a fish)', '🦈', 1, 'Fish evolved this shape first.'],
        [
          'Dolphin (a mammal)',
          '🐬',
          1,
          'Dolphins descend from land mammals but re-evolved the same shape.',
        ],
        [
          'Octopus',
          '🐙',
          2,
          'Octopus eyes resemble ours but evolved separately — and have no blind spot!',
        ],
        ['Human', '🧍', 2, 'Our eyes are camera-like too.'],
      ],
    ),
    goDeeper:
      'Convergent evolution produces analogous structures (similar function, different origin), in contrast to homologous structures (shared ancestry, possibly different functions, like the bones of a human arm and a bat wing). Classic examples include wings in insects, pterosaurs, birds and bats; streamlined bodies in sharks, ichthyosaurs and dolphins; camera eyes in vertebrates and cephalopods; and the repeated evolution of crab-like bodies (“carcinization”) among crustaceans.\n\nIn reality, it’s a bit more complicated: bat and bird wings are homologous as forelimbs (shared from a common four-limbed ancestor) but convergent as wings. Sometimes the same genes are reused in convergent traits, showing deep shared toolkits.',
    quiz: [
      mc(
        'What is convergent evolution?',
        [
          'Close relatives looking different',
          'Unrelated organisms evolving similar traits',
          'Two species merging',
          'Evolution stopping',
        ],
        1,
        'Similar problems → similar solutions.',
      ),
      mc(
        'Why do sharks and dolphins look alike?',
        [
          'They are closely related',
          'Both evolved streamlined bodies for fast swimming',
          'Dolphins are fish',
          'Sharks are mammals',
        ],
        1,
        'Dolphins are mammals; the shape converged.',
      ),
      predict(
        'An octopus and a human both have camera-like eyes.',
        'What does this suggest?',
        [
          'Octopuses are our close cousins',
          'Good eye designs evolved independently',
          'Humans evolved from octopuses',
          'Eyes don’t evolve',
        ],
        1,
        'This is convergent evolution.',
      ),
    ],
    relatedConcepts: ['adaptation', 'phylogenetic-trees', 'echolocation'],
    funFact:
      'Crustaceans have evolved a crab-like body shape at least five separate times — scientists call it “carcinization.”',
  },
  {
    id: 'coevolution',
    title: 'Coevolution',
    category: 'evolution',
    tags: ['arms race', 'newts', 'garter snakes', 'toxins', 'predator-prey'],
    aliases: ['evolutionary arms race', 'coevolution of predators and prey'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['natural-selection'],
    summary: 'When two species shape each other’s evolution, it can turn into an arms race.',
    steps: steps(
      ['Partners and rivals', 'Coevolution happens when two species drive each other’s evolution.'],
      ['A toxic newt', 'Rough-skinned newts carry a deadly toxin in their skin.'],
      [
        'A resistant snake',
        'Some garter snakes evolved resistance — so newts with more toxin survive better.',
      ],
      ['Escalation', 'Each side keeps pushing the other: more toxin, more resistance.'],
    ),
    interaction: slider({
      prompt:
        'Play the arms race between toxic newts and garter snakes. Can the snake eat the newt and survive?',
      inputs: [
        { id: 'toxin', label: 'Newt toxin level', min: 0, max: 100, step: 5, start: 40 },
        { id: 'resist', label: 'Snake resistance', min: 0, max: 100, step: 5, start: 20 },
      ],
      output: {
        label: 'Snake survives the meal',
        unit: '%',
        max: 100,
        expr: '100 * sig(resist - toxin, 0, 6)',
      },
      graphInput: 'resist',
      visual: { kind: 'growth', emoji: '🐍' },
      challenges: [
        {
          prompt: 'Give the newts the upper hand: snake survival under 10%.',
          target: { max: 10 },
          explain:
            'Toxin beats resistance: snakes that try to eat these newts die, so selection favors resistant snakes.',
        },
        {
          prompt: 'Now let the snakes catch up: survival over 90%.',
          target: { min: 90 },
          explain:
            'Resistance beats toxin — and selection now favors newts with even more toxin. The race continues!',
        },
      ],
    }),
    goDeeper:
      'Rough-skinned newts (Taricha granulosa) contain tetrodotoxin (TTX), which blocks voltage-gated sodium channels. Common garter snakes (Thamnophis sirtalis) in some areas evolved TTX resistance through mutations in their sodium channel genes. Edmund Brodie Jr. and III mapped geographic “hotspots” where both toxin and resistance are extreme and “coldspots” where both are low. Other coevolution examples: flowers and pollinators (mutualistic), and hosts and parasites.\n\nIn reality, it’s a bit more complicated: resistance comes with costs — highly resistant snakes crawl more slowly — so the race doesn’t escalate forever everywhere. The slider shows a single matchup, not the population-level process across generations.',
    quiz: [
      mc(
        'What is coevolution?',
        [
          'One species evolving alone',
          'Two species driving each other’s evolution',
          'Species never changing',
          'Two species merging',
        ],
        1,
        'Each species is part of the other’s environment.',
      ),
      predict(
        'Snakes in an area become highly resistant to newt toxin.',
        'What happens to the newts over generations?',
        [
          'Toxin levels drop',
          'More-toxic newts survive better, so toxin levels may rise',
          'Newts become snakes',
          'Nothing',
        ],
        1,
        'Selection favors newts that can still defend themselves.',
      ),
      mc(
        'Which is an example of coevolution between partners (not enemies)?',
        [
          'Flowers and their pollinators',
          'Lions and zebras',
          'Viruses and antibiotics',
          'Rocks and rivers',
        ],
        0,
        'Flowers and pollinators shape each other cooperatively.',
      ),
    ],
    relatedConcepts: ['red-queen', 'pollination', 'action-potential', 'plant-defenses'],
    funFact:
      'One rough-skinned newt may carry enough toxin to kill many humans — but only if eaten.',
  },
  {
    id: 'sexual-selection',
    title: 'Sexual Selection',
    category: 'evolution',
    tags: ['mate choice', 'peacock', 'competition', 'ornaments', 'courtship'],
    aliases: ['mate choice', 'why peacocks have big tails', 'courtship displays'],
    difficulty: 2,
    rarity: 'common',
    prerequisites: ['natural-selection'],
    summary:
      'Some traits evolve not to survive, but to win mates — like a peacock’s enormous tail.',
    steps: steps(
      [
        'Survival isn’t everything',
        'Traits that help win mates can spread even if they’re costly.',
      ],
      ['Choosing', 'In many species, females choose males with impressive displays.'],
      ['Competing', 'In others, males fight rivals for access to mates.'],
    ),
    interaction: sorting(
      'Did each trait evolve to impress the choosers, or to beat rivals?',
      [
        ['Impress the choosers', '💃', 'Mate choice'],
        ['Beat the rivals', '⚔️', 'Competition between rivals'],
      ],
      [
        ['Peacock’s tail', '🦚', 0, 'Peahens prefer males with more elaborate tails.'],
        [
          'Bowerbird’s decorated bower',
          '🎨',
          0,
          'Males build and decorate structures to attract females.',
        ],
        ['Bright red male cardinal', '❤️', 0, 'Colorful plumage signals health to choosy females.'],
        ['Deer antlers', '🦌', 1, 'Males clash antlers to win access to females.'],
        [
          'Huge male elephant seals',
          '🦭',
          1,
          'Big males win fights and control beaches full of females.',
        ],
        ['Stag beetle jaws', '🪲', 1, 'Oversized jaws are used to wrestle rival males.'],
      ],
    ),
    goDeeper:
      'Darwin proposed sexual selection in 1871 to explain traits like the peacock’s tail that seem to hurt survival. Intersexual selection (mate choice) favors ornaments and displays; intrasexual selection (competition) favors weapons and size. Ideas for why choosers prefer certain traits include direct benefits, “good genes” (honest signals that are costly to fake, the handicap principle) and runaway selection (preference and trait reinforce each other). Sexual selection often produces sexual dimorphism.\n\nIn reality, it’s a bit more complicated: roles aren’t always female-choosing and male-competing — in seahorses and some birds (like phalaropes) the roles are reversed, and in many species both sexes choose.',
    quiz: [
      mc(
        'Why might a peacock’s huge tail evolve even if it makes flying harder?',
        [
          'It helps catch food',
          'Peahens prefer males with bigger tails, so those males have more offspring',
          'It keeps them warm',
          'It scares away rain',
        ],
        1,
        'Reproductive success can outweigh survival costs.',
      ),
      label(
        'Match each trait to how it helps win mates.',
        [
          ['Peacock tail', 'Impresses choosy females'],
          ['Deer antlers', 'Used to fight rival males'],
          ['Bowerbird bower', 'A decorated display built to attract a mate'],
        ],
        'Ornaments attract; weapons compete.',
      ),
      predict(
        'In a bird species, females always choose the males with the longest tails.',
        'What happens to tail length over many generations?',
        [
          'It gets shorter',
          'It tends to get longer',
          'It stays exactly the same',
          'Tails disappear',
        ],
        1,
        'Longer-tailed males leave more offspring.',
      ),
    ],
    relatedConcepts: ['natural-selection', 'kin-selection', 'coevolution'],
    funFact:
      'Darwin once wrote that the sight of a feather in a peacock’s tail made him feel sick — because he couldn’t explain it with survival alone.',
  },
  {
    id: 'fossil-record',
    title: 'The Fossil Record',
    category: 'evolution',
    tags: ['fossils', 'geologic time', 'dinosaurs', 'extinction', 'Tiktaalik'],
    aliases: ['fossils', 'history of life', 'geologic timeline', 'mass extinctions'],
    difficulty: 2,
    rarity: 'common',
    summary:
      'Fossils are snapshots of life from millions of years ago, stacked in rock like pages of history.',
    steps: steps(
      [
        'Rock layers',
        'Newer rock layers form on top of older ones, so deeper usually means older.',
      ],
      ['Turned to stone', 'Bones, shells and footprints can be preserved as fossils.'],
      ['A long story', 'Fossils show life changing from simple cells to dinosaurs to us.'],
    ),
    interaction: timeline(
      'Scrub through 3.5 billion years of life.',
      [
        [
          'First life',
          'Simple microbes form mats called stromatolites.',
          [em('a', '🦠', 50, 55, 2)],
          '3.5 billion years ago',
        ],
        [
          'Cambrian explosion',
          'Many animal body plans appear quickly, like trilobites.',
          [em('a', '🦐', 40, 55, 1.6), em('b', '🪼', 62, 45, 1.4)],
          '540 million years ago',
        ],
        [
          'Fish walk onto land',
          'Tiktaalik, a fish with leg-like fins, shows the move from water to land.',
          [em('a', '🐟', 40, 60, 1.6), em('b', '🦎', 62, 55, 1.4)],
          '375 million years ago',
        ],
        [
          'Age of dinosaurs',
          'Dinosaurs dominate the land; small mammals scurry around.',
          [em('a', '🦕', 40, 55, 2.2), em('b', '🐁', 70, 70, 0.8)],
          '230–66 million years ago',
        ],
        [
          'Asteroid impact',
          'A huge asteroid wipes out the non-bird dinosaurs. Birds survive!',
          [em('a', '☄️', 30, 25, 1.6), em('b', '🐦', 65, 60, 1.2)],
          '66 million years ago',
        ],
        [
          'Humans appear',
          'Early humans walk upright in Africa; Homo sapiens arrives about 300,000 years ago.',
          [em('a', '🧍', 50, 55, 2)],
          '~6 million years ago to now',
        ],
      ],
      [
        ['Stop when animals first move onto land.', 2],
        ['Stop at the mass extinction that ended the dinosaurs.', 4],
      ],
      '#fef3c7',
    ),
    goDeeper:
      'Fossilization is rare: it usually requires quick burial in sediment, often in water. Relative dating uses the law of superposition; radiometric dating (e.g., uranium–lead, potassium–argon) of volcanic layers gives absolute ages. Transitional fossils such as Tiktaalik (fish-to-tetrapod), Archaeopteryx (dinosaur-to-bird) and whale ancestors like Pakicetus and Ambulocetus document major transitions. Earth has had five major mass extinctions, the largest being the end-Permian about 252 million years ago.\n\nIn reality, it’s a bit more complicated: the timeline highlights only a few moments, and the fossil record is biased toward organisms with hard parts living in places where sediment collects. Humans and dinosaurs never lived at the same time — about 66 million years separate them.',
    quiz: [
      mc(
        'In undisturbed rock layers, where are the oldest fossils usually found?',
        ['At the top', 'At the bottom', 'In the middle', 'Randomly placed'],
        1,
        'Older layers are buried beneath newer ones.',
      ),
      mc(
        'What does Tiktaalik show?',
        [
          'How birds learned to swim',
          'A transition between fish and four-legged land animals',
          'The first plant',
          'How dinosaurs died',
        ],
        1,
        'Tiktaalik has fish features and limb-like fins.',
      ),
      predict(
        'Scientists find a fossil with feathers and a dinosaur-like skeleton.',
        'What does this support?',
        [
          'Birds are not related to dinosaurs',
          'Birds evolved from dinosaurs',
          'Feathers came from fish',
          'Fossils are fake',
        ],
        1,
        'Archaeopteryx and feathered dinosaurs show this link.',
      ),
    ],
    relatedConcepts: ['phylogenetic-trees', 'natural-selection', 'speciation'],
    funFact: 'Birds are living dinosaurs — so technically, not all dinosaurs went extinct.',
  },
  {
    id: 'phylogenetic-trees',
    title: 'Phylogenetic Trees',
    category: 'evolution',
    tags: ['tree of life', 'common ancestor', 'cladogram', 'shared traits', 'classification'],
    aliases: ['tree of life', 'cladogram', 'evolutionary tree', 'family tree of species'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['natural-selection'],
    summary: 'All living things are relatives. Phylogenetic trees show who branched off from whom.',
    steps: steps(
      ['One big family', 'All life shares a common ancestor.'],
      ['Branches', 'Each branch point is a common ancestor of the groups after it.'],
      [
        'Shared traits',
        'New traits that appear along a branch are shared by everything beyond it.',
      ],
    ),
    interaction: assembly(
      'Build the vertebrate tree: put these new traits in the order they evolved.',
      [
        [
          'Backbone',
          '🦴',
          'All vertebrates — fish, frogs, lizards, birds, mammals — share a backbone.',
        ],
        ['Jaws', '🦷', 'Jaws appeared after the first jawless fish (like lampreys).'],
        ['Four limbs', '🦎', 'Tetrapods (amphibians and beyond) have four limbs.'],
        ['Amniotic egg', '🥚', 'Reptiles, birds and mammals have eggs that don’t dry out on land.'],
        ['Hair & milk', '🐄', 'Mammals are the branch with hair and milk.'],
      ],
      'Your tree is built! Each trait is shared by every group branching off after it.',
      {
        distractors: [
          [
            'Wings',
            '🪽',
            'Wings evolved separately in several groups — they don’t define a single branch here.',
          ],
        ],
      },
    ),
    goDeeper:
      'Phylogenetic trees (cladograms) group organisms by shared derived characters (synapomorphies). Nodes represent common ancestors; branches can rotate around nodes without changing relationships. Clades are monophyletic groups — an ancestor and all its descendants. Molecular data (DNA and protein sequences) now dominate tree-building. Surprising results include: birds are reptiles (dinosaurs), whales are closest to hippos, and fungi are closer to animals than plants.\n\nIn reality, it’s a bit more complicated: trees are hypotheses that get revised with new data, and in microbes horizontal gene transfer tangles branches into webs. Reading trees, remember that no living species is “ancestor” to another — they are cousins.',
    quiz: [
      mc(
        'What does a branch point (node) on a tree represent?',
        ['A modern species', 'A common ancestor', 'A mass extinction', 'A fossil site'],
        1,
        'Nodes are shared ancestors.',
      ),
      mc(
        'Which animals are closest relatives of whales?',
        ['Sharks', 'Hippos', 'Fish', 'Octopuses'],
        1,
        'DNA shows whales and hippos share a recent common ancestor.',
      ),
      predict(
        'A new animal has a backbone, jaws and four limbs but lays eggs that dry out on land.',
        'Where does it fit?',
        ['Mammals', 'Amphibians', 'Birds', 'Jawless fish'],
        1,
        'It has four limbs but no amniotic egg — an amphibian.',
      ),
    ],
    relatedConcepts: ['fossil-record', 'convergent-evolution', 'speciation'],
    funFact: 'Darwin’s only diagram in On the Origin of Species is an evolutionary tree.',
  },
  {
    id: 'vestigial-structures',
    title: 'Vestigial Structures',
    category: 'evolution',
    tags: ['evolution evidence', 'tailbone', 'whale hips', 'leftovers', 'ancestry'],
    aliases: ['vestigial organs', 'evolutionary leftovers', 'tailbone'],
    difficulty: 2,
    rarity: 'common',
    summary:
      'Some body parts are leftovers from ancestors — reduced versions of what they once were.',
    steps: steps(
      [
        'Echoes of the past',
        'Vestigial structures are reduced forms of features that were fully used by ancestors.',
      ],
      ['Clues to ancestry', 'They show how species are related.'],
      ['Not always useless', 'Many vestigial parts still have small jobs — they’re just reduced.'],
    ),
    interaction: sorting(
      'Is each one a vestigial leftover or a fully working feature?',
      [
        ['Vestigial (reduced leftover)', '🦴', 'Smaller version of an ancestral feature'],
        ['Fully working', '⚙️', 'Used for its full original job'],
      ],
      [
        [
          'Human tailbone (coccyx)',
          '🍑',
          0,
          'A remnant of our ancestors’ tail (it still anchors muscles).',
        ],
        ['Whale hip bones', '🐋', 0, 'Leftovers from four-legged land ancestors.'],
        ['Kiwi wings', '🥝', 0, 'Tiny wings on a flightless bird.'],
        ['Blind cavefish eyes', '🐟', 0, 'Cave fish have shrunken, non-working eyes.'],
        ['Goosebumps', '🥶', 0, 'They fluff up fur in mammals — but we have little fur left.'],
        ['Human heart', '🫀', 1, 'Fully working!'],
        ['Eagle wings', '🦅', 1, 'Used for flight.'],
        ['Elephant trunk', '🐘', 1, 'A fully working (and very useful) nose and upper lip.'],
      ],
    ),
    goDeeper:
      'Vestigial structures are homologous to fully functional structures in related species but have lost or reduced their ancestral function. Examples: whale and snake pelvic bones, the human plica semilunaris (a remnant of a third eyelid), ear muscles (auriculares) that wiggle the ears in some people, and the palmar grasp reflex in babies. Molecular vestiges also exist, like the broken GULO gene that leaves humans unable to make vitamin C.\n\nIn reality, it’s a bit more complicated: “vestigial” doesn’t mean useless. The human appendix may act as a reservoir for gut bacteria and contains immune tissue, and whale pelvic bones help anchor reproductive muscles. What makes them vestigial is that they are reduced from an ancestral function.',
    quiz: [
      mc(
        'What is a vestigial structure?',
        [
          'A brand-new organ',
          'A reduced remnant of a feature used by ancestors',
          'A broken bone',
          'A type of fossil',
        ],
        1,
        'They are evolutionary leftovers.',
      ),
      mc(
        'Why do whales have tiny hip bones?',
        [
          'To walk on the sea floor',
          'Their ancestors were four-legged land mammals',
          'To swim faster',
          'To store fat',
        ],
        1,
        'Whale ancestors walked on land.',
      ),
      predict(
        'Fish live in a pitch-dark cave for thousands of generations.',
        'What tends to happen to their eyes?',
        ['They get bigger', 'They shrink or stop working', 'They glow', 'Nothing'],
        1,
        'Eyes are costly and useless in darkness, so they are reduced.',
      ),
    ],
    relatedConcepts: ['phylogenetic-trees', 'fossil-record', 'natural-selection'],
    funFact:
      'Humans can’t make vitamin C because the gene for it is broken — but the broken gene is still in our DNA.',
  },
  {
    id: 'kin-selection',
    title: 'Kin Selection',
    category: 'evolution',
    tags: ['altruism', 'Hamilton’s rule', 'relatedness', 'social insects', 'helping family'],
    aliases: ['Hamilton’s rule', 'altruism in animals', 'inclusive fitness'],
    difficulty: 4,
    rarity: 'obscure',
    prerequisites: ['natural-selection'],
    summary:
      'Helping your relatives can spread your genes — which explains why some animals sacrifice themselves.',
    steps: steps(
      ['A puzzle', 'Why would an animal help others at a cost to itself?'],
      ['Shared genes', 'Relatives share genes: siblings share about half on average.'],
      ['Hamilton’s rule', 'Helping evolves when relatedness × benefit > cost (rB > C).'],
    ),
    interaction: slider({
      prompt:
        'Should a ground squirrel give a risky alarm call to warn others? Use Hamilton’s rule (rB − C).',
      inputs: [
        { id: 'r', label: 'Relatedness to listeners (r)', min: 0, max: 1, step: 0.05, start: 0.5 },
        {
          id: 'benefit',
          label: 'Benefit to relatives (offspring saved)',
          min: 0,
          max: 10,
          step: 0.5,
          start: 2,
        },
        {
          id: 'cost',
          label: 'Cost to the caller (own offspring lost)',
          min: 0,
          max: 5,
          step: 0.25,
          start: 1.5,
        },
      ],
      output: {
        label: 'Gene payoff for calling (rB − C + 5)',
        max: 10,
        expr: 'clamp(r * benefit - cost + 5, 0, 10)',
      },
      readouts: [{ label: 'rB − C', expr: 'r * benefit - cost' }],
      graphInput: 'r',
      visual: { kind: 'growth', emoji: '🐿️' },
      challenges: [
        {
          prompt: 'Make calling worth it for the genes: payoff over 7 (rB − C > 2).',
          target: { min: 7 },
          explain: 'Warning many close relatives can outweigh the risk to yourself.',
        },
        {
          prompt: 'Make calling a bad deal: payoff under 4 (rB − C < −1).',
          target: { max: 4 },
          explain: 'Warning strangers (r ≈ 0) at a high cost doesn’t pay off genetically.',
        },
      ],
    }),
    goDeeper:
      'W. D. Hamilton (1964) formalized inclusive fitness: an individual’s genes can spread through its own offspring and through relatives’ offspring. Hamilton’s rule, rB > C, predicts when altruism evolves. Relatedness r is about 0.5 for parent–offspring and full siblings, 0.25 for half-siblings and grandparents, 0.125 for first cousins. Belding’s ground squirrels give more alarm calls when relatives are nearby. In honeybees, haplodiploidy makes sisters unusually closely related (r = 0.75), which was proposed to help explain worker bees’ sterility.\n\nIn reality, it’s a bit more complicated: the payoff shown adds 5 just to keep the meter positive. Kin selection is one route to cooperation; others include reciprocity and group-level benefits, and the role of haplodiploidy in social insects is debated.',
    quiz: [
      mc(
        'What does Hamilton’s rule say?',
        [
          'Help everyone equally',
          'Altruism evolves when relatedness × benefit > cost',
          'Never help anyone',
          'Only parents help',
        ],
        1,
        'rB > C.',
      ),
      mc(
        'About how related are full siblings?',
        ['0', '0.125', '0.5', '1'],
        2,
        'On average, full siblings share half their genes by descent.',
      ),
      predict(
        'A squirrel is surrounded by unrelated strangers when a hawk appears.',
        'Is a risky alarm call favored by kin selection?',
        [
          'Yes, strongly',
          'Less likely — r is near zero',
          'Only if it’s raining',
          'Kin selection doesn’t apply to squirrels',
        ],
        1,
        'With r ≈ 0, the genetic benefit disappears.',
      ),
    ],
    relatedConcepts: ['natural-selection', 'sexual-selection', 'naked-mole-rats'],
    funFact:
      'The biologist J.B.S. Haldane joked that he’d lay down his life for two brothers or eight cousins.',
  },
  {
    id: 'red-queen',
    title: 'The Red Queen Hypothesis',
    category: 'evolution',
    tags: ['arms race', 'parasites', 'sex', 'evolution', 'coevolution'],
    aliases: ['Red Queen', 'running to stay in place', 'why sex exists'],
    difficulty: 4,
    rarity: 'obscure',
    prerequisites: ['coevolution'],
    summary:
      'Species must keep evolving just to keep up with their enemies — running to stay in place.',
    steps: steps(
      [
        'Running in place',
        '“It takes all the running you can do to keep in the same place,” says the Red Queen in Through the Looking-Glass.',
      ],
      ['Moving targets', 'Parasites constantly evolve to break into hosts.'],
      ['Shuffle the deck', 'Sexual reproduction shuffles genes, making offspring harder targets.'],
    ),
    interaction: slider({
      prompt: 'Parasites evolve fast. How much does gene-shuffling (sex) help hosts stay ahead?',
      inputs: [
        { id: 'parasite', label: 'Parasite evolution speed', min: 0, max: 100, step: 5, start: 60 },
        {
          id: 'shuffle',
          label: 'Host gene shuffling (sex & recombination)',
          min: 0,
          max: 100,
          step: 5,
          start: 0,
        },
      ],
      output: {
        label: 'Hosts infected',
        unit: '%',
        max: 100,
        expr: '100 * sig(parasite - shuffle * 1.1, 10, 12)',
      },
      graphInput: 'shuffle',
      visual: { kind: 'particles', emoji: '🪱' },
      challenges: [
        {
          prompt: 'Clonal hosts (no shuffling) vs fast parasites: let infection soar above 90%.',
          target: { min: 90 },
          explain: 'Clones are identical targets — once a parasite cracks one, it cracks them all.',
        },
        {
          prompt: 'Keep fast parasites (60+) at bay: infection under 20%.',
          target: { max: 20 },
          explain: 'Shuffled genes create moving targets, so parasites can’t keep up.',
        },
      ],
    }),
    goDeeper:
      'Leigh Van Valen proposed the Red Queen hypothesis in 1973 to explain why extinction risk in a group seems constant over time: species continually evolve in response to evolving competitors, predators and parasites. It was later linked to the evolution of sex: despite the “twofold cost” of males, sexual recombination creates genetic novelty that helps hosts escape coevolving parasites. Curtis Lively’s studies of New Zealand mud snails found sexual snails more common where parasites were abundant; experiments with nematodes and bacteria have also supported the idea.\n\nIn reality, it’s a bit more complicated: the slider is a cartoon of a complex idea. Other explanations for sex include purging harmful mutations, and bdelloid rotifers have thrived for millions of years without it.',
    quiz: [
      mc(
        'What does the Red Queen hypothesis say?',
        [
          'Species stop evolving once they’re perfect',
          'Species must keep evolving to keep up with evolving enemies',
          'Queens rule all species',
          'Only plants evolve',
        ],
        1,
        'Running just to stay in place.',
      ),
      mc(
        'According to one Red Queen idea, why might sex be useful?',
        [
          'It is faster than cloning',
          'It shuffles genes, making offspring harder for parasites to target',
          'It makes animals bigger',
          'It stops mutations',
        ],
        1,
        'Gene shuffling creates moving targets.',
      ),
      predict(
        'A population of identical clones faces a fast-evolving parasite.',
        'What is the risk?',
        [
          'They are all protected',
          'A parasite that cracks one can infect them all',
          'The parasite dies',
          'Nothing',
        ],
        1,
        'Identical hosts are equally vulnerable.',
      ),
    ],
    relatedConcepts: ['coevolution', 'parasites', 'bdelloid-rotifers', 'meiosis'],
    funFact: 'New Zealand mud snails reproduce sexually more often in lakes with more parasites.',
  },
  {
    id: 'island-rule',
    title: 'Island Gigantism & Dwarfism',
    category: 'evolution',
    tags: ['islands', 'dwarf elephants', 'Komodo dragon', 'dodo', 'body size'],
    aliases: ['island rule', 'Foster’s rule', 'island dwarfism', 'island gigantism'],
    difficulty: 3,
    rarity: 'obscure',
    prerequisites: ['natural-selection'],
    summary: 'On islands, big animals often shrink and small animals often grow huge.',
    steps: steps(
      ['Limited food', 'Islands have less food, so large animals benefit from being smaller.'],
      ['Fewer predators', 'With no big predators, small animals can safely grow larger.'],
      ['Odd results', 'Dwarf elephants, giant rats, giant tortoises and pony-sized hippos!'],
    ),
    interaction: sorting(
      'Did each island species get giant or dwarf compared to its mainland relatives?',
      [
        ['Island giant', '🦖', 'Grew bigger than mainland relatives'],
        ['Island dwarf', '🐭', 'Shrank compared to mainland relatives'],
      ],
      [
        ['Dwarf elephants of Sicily', '🐘', 1, 'Some were about 1 meter tall at the shoulder.'],
        ['Komodo dragon', '🦎', 0, 'The largest living lizard, on Indonesian islands.'],
        [
          'Dodo (a giant pigeon)',
          '🐦',
          0,
          'The dodo was a large, flightless relative of pigeons on Mauritius.',
        ],
        [
          'Homo floresiensis (“hobbit”)',
          '🧍',
          1,
          'A small human species on Flores island, about 1.1 m tall.',
        ],
        ['Galápagos giant tortoise', '🐢', 0, 'Much bigger than most mainland tortoises.'],
        ['Channel Islands fox', '🦊', 1, 'About the size of a house cat.'],
        ['Flores giant rat', '🐀', 0, 'Rats on Flores grew to the size of small cats.'],
      ],
    ),
    goDeeper:
      'The island rule (Foster’s rule, 1964) describes a tendency for large-bodied species to become smaller and small-bodied species to become larger on islands. Explanations include limited resources (favoring smaller large animals), release from predators and competitors (allowing small animals to grow), and founder effects. Examples include dwarf elephants and mammoths on Mediterranean islands and Wrangel Island, dwarf hippos on Cyprus and Madagascar, and giant rodents and birds on several islands.\n\nIn reality, it’s a bit more complicated: the rule is a tendency with many exceptions, and its strength depends on island size, isolation and diet. Island species often evolve flightlessness and fearlessness too, which made many vulnerable when humans and invasive predators arrived.',
    quiz: [
      mc(
        'What often happens to large mammals on small islands?',
        [
          'They grow larger',
          'They become smaller over generations',
          'They learn to fly',
          'Nothing',
        ],
        1,
        'Limited food favors smaller bodies.',
      ),
      mc(
        'Why might small animals become giants on islands?',
        [
          'There is more ice',
          'There are fewer predators and competitors',
          'They eat more sunlight',
          'They are in the ocean',
        ],
        1,
        'Release from predation allows larger size.',
      ),
      predict(
        'Elephants reach a small island with little food and no predators.',
        'What might happen over many generations?',
        [
          'They become giants',
          'They evolve smaller bodies',
          'They become fish',
          'They stay identical',
        ],
        1,
        'Island dwarfism, like Sicily’s dwarf elephants.',
      ),
    ],
    relatedConcepts: ['adaptation', 'genetic-drift', 'speciation', 'invasive-species'],
    funFact:
      'Woolly mammoths survived on Wrangel Island until about 4,000 years ago — after the Egyptian pyramids were built.',
  },
];
