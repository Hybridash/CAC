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

export const neuroLibrary: Concept[] = [
  {
    id: 'synapses',
    title: 'Synapses & Neurotransmitters',
    category: 'neuro',
    tags: ['neurotransmitters', 'dopamine', 'serotonin', 'acetylcholine', 'receptors', 'drugs'],
    aliases: ['synapse', 'neurotransmitters', 'how neurons talk', 'chemical synapse'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['action-potential'],
    summary: 'Neurons don’t touch — they pass messages across a tiny gap using chemicals.',
    steps: steps(
      ['A tiny gap', 'Between neurons is a gap called the synapse, about 20 nanometers wide.'],
      [
        'Chemical messengers',
        'An electrical signal makes the first neuron release neurotransmitters.',
      ],
      ['Receptors catch them', 'The chemicals cross the gap and fit receptors on the next neuron.'],
      ['Clean-up', 'Neurotransmitters are quickly removed so the next message is clear.'],
    ),
    interaction: lockKey(
      'Deliver each neurotransmitter to its receptor on the next neuron. One molecule is a poison!',
      [
        ['Dopamine receptor', 'triangle', '#f59e0b', 'Reward and movement'],
        ['Serotonin receptor', 'circle', '#8b5cf6', 'Mood and sleep'],
        ['Acetylcholine receptor', 'square', '#0ea5e9', 'Muscles and memory'],
        ['GABA receptor', 'hexagon', '#64748b', 'The brain’s brake'],
      ],
      [
        ['Dopamine', 'triangle', '#f59e0b', 0, 'Dopamine binds: “that was worth it, do it again!”'],
        ['Serotonin', 'circle', '#8b5cf6', 1, 'Serotonin binds, helping regulate mood and sleep.'],
        [
          'Curare (poison)',
          'square',
          '#7f1d1d',
          2,
          'Curare jams the acetylcholine receptor without activating it — muscles can’t contract. It was used on hunting darts.',
          'block',
        ],
        ['GABA', 'hexagon', '#64748b', 3, 'GABA opens chloride channels, calming the neuron down.'],
        [
          'Glucose',
          'star',
          '#facc15',
          null,
          'Glucose is food for neurons, not a neurotransmitter.',
        ],
      ],
    ),
    goDeeper:
      'At a chemical synapse, an action potential opens voltage-gated calcium channels in the axon terminal; calcium triggers synaptic vesicles to fuse and release neurotransmitter. Receptors may be ionotropic (ion channels, fast) or metabotropic (G-protein-coupled, slower and longer-lasting). Excitatory transmitters (glutamate) push the next neuron toward firing; inhibitory ones (GABA, glycine) push it away. Signals end by reuptake, enzymatic breakdown (acetylcholinesterase) or diffusion. Many drugs act here: SSRIs block serotonin reuptake, and cocaine blocks dopamine reuptake.\n\nIn reality, it’s a bit more complicated: in the lesson curare can bind, but real competitive blockers can be outcompeted by high transmitter levels. Each neurotransmitter has many receptor subtypes, and electrical synapses (gap junctions) also exist, letting current pass directly.',
    quiz: [
      mc(
        'What crosses the synapse to carry a message?',
        ['Electrons', 'Neurotransmitters', 'Red blood cells', 'DNA'],
        1,
        'Chemical messengers diffuse across the gap.',
      ),
      predict(
        'A drug blocks the reuptake of serotonin back into the first neuron.',
        'What happens to serotonin in the synapse?',
        ['It disappears faster', 'It stays around longer', 'It turns into dopamine', 'Nothing'],
        1,
        'This is how SSRI medicines work.',
      ),
      label(
        'Match each neurotransmitter to an effect.',
        [
          ['GABA', 'Calms neurons down'],
          ['Acetylcholine', 'Makes muscles contract'],
          ['Dopamine', 'Signals reward and motivation'],
        ],
        'Different messengers, different jobs.',
      ),
    ],
    relatedConcepts: ['action-potential', 'dopamine-reward', 'cell-signaling'],
    funFact: 'Your brain has an estimated 100 trillion or more synapses.',
  },
  {
    id: 'reflex-arc',
    title: 'Reflex Arcs',
    category: 'neuro',
    tags: ['reflexes', 'spinal cord', 'sensory neuron', 'motor neuron', 'nervous system'],
    aliases: ['reflex', 'knee-jerk reaction', 'why you pull your hand away'],
    difficulty: 1,
    rarity: 'common',
    summary: 'Some reactions skip the brain entirely, so you act before you even feel the pain.',
    steps: steps(
      ['Too fast to think', 'Touch a hot stove and your hand jerks away before you feel “ouch.”'],
      ['A shortcut', 'The signal goes to your spinal cord and straight back out to the muscle.'],
      ['Brain finds out later', 'Your brain is told afterward — that’s when you feel the pain.'],
    ),
    interaction: assembly(
      'Your finger touches a hot stove! Put the reflex path in order.',
      [
        ['Heat sensor in skin', '🔥', 'Pain and heat receptors in your fingertip detect danger.'],
        ['Sensory neuron', '➡️', 'Carries the signal to the spinal cord.'],
        [
          'Spinal cord relay',
          '🔀',
          'A relay neuron in the spinal cord connects straight to a motor neuron.',
        ],
        ['Motor neuron', '⬅️', 'Carries the command back out to your arm.'],
        ['Muscle pulls away', '💪', 'Your arm muscle contracts and yanks your hand back.'],
      ],
      'Reflex done in a fraction of a second — the brain only hears about it afterward.',
      {
        distractors: [
          [
            'Brain decides',
            '🧠',
            'Reflexes don’t wait for the brain to decide — that would be too slow!',
          ],
        ],
      },
    ),
    goDeeper:
      'A reflex arc includes a receptor, sensory (afferent) neuron, integration center (often interneurons in the spinal cord), motor (efferent) neuron and effector (muscle or gland). The knee-jerk (patellar) reflex is monosynaptic — the sensory neuron synapses directly on the motor neuron. Withdrawal reflexes are polysynaptic and also inhibit opposing muscles. Doctors test reflexes to check nerve and spinal cord function.\n\nIn reality, it’s a bit more complicated: pain signals travel more slowly than some touch signals, and the brain can partly override some reflexes (you can hold a hot plate you don’t want to drop). Information about the reflex is also sent up to the brain at the same time, so you become aware of it moments later.',
    quiz: [
      mc(
        'Why are reflexes so fast?',
        [
          'They use extra-thick muscles',
          'The signal goes through the spinal cord without waiting for the brain',
          'They happen before the stimulus',
          'They use hormones',
        ],
        1,
        'The spinal shortcut saves time.',
      ),
      mc(
        'Which neuron carries the signal from the skin to the spinal cord?',
        ['Motor neuron', 'Sensory neuron', 'Relay neuron in the brain', 'Hormone neuron'],
        1,
        'Sensory neurons carry information in.',
      ),
      predict(
        'A person’s sensory neurons in one leg are damaged.',
        'What happens when a doctor taps their knee?',
        [
          'The kick is stronger',
          'Little or no knee-jerk, since the signal never reaches the spinal cord',
          'They kick with the other leg',
          'They sneeze',
        ],
        1,
        'No sensory input, no reflex.',
      ),
    ],
    relatedConcepts: ['action-potential', 'synapses', 'senses'],
    funFact:
      'Babies are born with reflexes that disappear later, like gripping any finger placed in their palm.',
  },
  {
    id: 'senses',
    title: 'The Senses',
    category: 'neuro',
    tags: ['vision', 'hearing', 'smell', 'taste', 'touch', 'receptors'],
    aliases: ['five senses', 'vision', 'hearing', 'smell', 'taste', 'touch', 'sensory receptors'],
    difficulty: 1,
    rarity: 'common',
    summary:
      'Each sense has special receptor cells that turn light, sound, chemicals or pressure into nerve signals.',
    steps: steps(
      ['Translators', 'Sense organs translate the outside world into electrical signals.'],
      [
        'Special receptors',
        'Eyes catch light, ears catch vibrations, the nose and tongue catch chemicals, skin catches pressure and heat.',
      ],
      [
        'The brain decides',
        'Your brain turns those signals into what you see, hear, smell, taste and feel.',
      ],
    ),
    interaction: sorting(
      'Which sense detects each thing?',
      [
        ['Vision', '👁️', 'Light'],
        ['Hearing', '👂', 'Vibrations in the air'],
        ['Smell', '👃', 'Airborne chemicals'],
        ['Taste', '👅', 'Chemicals in food'],
        ['Touch', '✋', 'Pressure, vibration, temperature'],
      ],
      [
        ['A rainbow', '🌈', 0, 'Cone cells in your retina detect different colors of light.'],
        [
          'Thunder',
          '⛈️',
          1,
          'Sound waves vibrate the eardrum and tiny hair cells in your cochlea.',
        ],
        ['Fresh-cut grass', '🌱', 2, 'Odor molecules bind receptors high in your nose.'],
        ['Sour lemon', '🍋', 3, 'Sour taste detects acids (H⁺ ions).'],
        ['A cat’s soft fur', '🐈', 4, 'Pressure receptors in your skin feel texture.'],
        ['Smoke from a fire', '🔥', 2, 'Smell warns you of danger even before you see it.'],
        ['A hot cup of cocoa', '☕', 4, 'Heat receptors in the skin of your fingers.'],
        ['Umami in soup', '🍜', 3, 'Umami taste receptors detect glutamate (savory).'],
      ],
    ),
    goDeeper:
      'Sensory receptors transduce stimuli: photoreceptors (rods for dim light, cones for color) use light-sensitive pigments; cochlear hair cells bend with sound vibrations; olfactory neurons express one of about 400 odor receptor types; taste cells detect sweet, sour, salty, bitter and umami; skin mechanoreceptors, thermoreceptors and nociceptors detect touch, temperature and pain. Signals go through the thalamus to the cortex (except smell, which goes more directly to olfactory areas).\n\nIn reality, it’s a bit more complicated: humans have far more than five senses — balance (vestibular), body position (proprioception), internal sensing (interoception), temperature and pain are separate systems. Much of what we call “taste” is actually smell, which is why food seems bland with a blocked nose.',
    quiz: [
      mc(
        'Which cells in your eye detect color?',
        ['Rods', 'Cones', 'Hair cells', 'Taste buds'],
        1,
        'Cones detect color; rods work in dim light.',
      ),
      predict(
        'You eat strawberry jam while holding your nose.',
        'What do you notice?',
        [
          'It tastes stronger',
          'It tastes mostly just sweet — much of the flavor is gone',
          'You hear it',
          'Nothing',
        ],
        1,
        'Flavor depends heavily on smell.',
      ),
      mc(
        'Which is a real taste humans can detect?',
        ['Umami (savory)', 'Purple', 'Loudness', 'Smoothness'],
        0,
        'The five basic tastes are sweet, sour, salty, bitter and umami.',
      ),
    ],
    relatedConcepts: ['reflex-arc', 'synesthesia', 'action-potential'],
    funFact:
      'Your nose may be able to distinguish an enormous number of odors — estimates range from thousands to over a trillion.',
  },
  {
    id: 'memory-formation',
    title: 'Memory Formation',
    category: 'neuro',
    tags: ['memory', 'hippocampus', 'learning', 'forgetting curve', 'sleep', 'review'],
    aliases: ['how memories form', 'forgetting curve', 'spaced repetition', 'long-term memory'],
    difficulty: 3,
    rarity: 'common',
    summary: 'Memories fade fast — unless you revisit them. Every review makes them last longer.',
    steps: steps(
      [
        'Short-term first',
        'New information starts in short-term memory, which fades within minutes to hours.',
      ],
      [
        'The hippocampus',
        'A seahorse-shaped brain region helps turn experiences into lasting memories.',
      ],
      ['Sleep on it', 'During sleep, memories are replayed and strengthened.'],
      ['Spaced review', 'Reviewing after a gap rebuilds the memory stronger each time.'],
    ),
    interaction: slider({
      prompt:
        'How much do you remember after some days? Add review sessions and see the forgetting curve flatten.',
      inputs: [
        { id: 'days', label: 'Days since learning', min: 0, max: 30, step: 1, start: 3 },
        { id: 'reviews', label: 'Spaced review sessions', min: 0, max: 5, step: 1, start: 0 },
      ],
      output: {
        label: 'Remembered',
        unit: '%',
        max: 100,
        expr: '100 * exp(-days / (1.5 * 2.6 ^ reviews))',
      },
      graphInput: 'days',
      visual: { kind: 'glow', emoji: '🧠' },
      challenges: [
        {
          prompt: 'With no reviews, see how little is left after a week (under 15%).',
          target: { max: 15 },
          explain:
            'Without review, most new information fades within days (Ebbinghaus’s forgetting curve).',
        },
        {
          prompt: 'Keep over 70% after 30 days.',
          target: { min: 70 },
          explain:
            'Several spaced reviews slow forgetting dramatically. That’s why BioPlay rewards review after 24 hours!',
        },
      ],
    }),
    goDeeper:
      'Hermann Ebbinghaus measured his own forgetting in the 1880s and described the forgetting curve. Memory involves encoding, consolidation and retrieval. The hippocampus is crucial for forming new episodic memories (patient H.M. could not form new long-term memories after it was removed). At the cellular level, long-term potentiation (LTP) strengthens synapses that are used together. Sleep, especially slow-wave sleep, helps consolidate memories, and retrieval practice (testing yourself) is one of the most effective study methods.\n\nIn reality, it’s a bit more complicated: the slider uses a simple exponential decay; real forgetting depends on how meaningful, emotional and well-connected information is. Memories are reconstructed each time they are recalled, which is why they can change or even be false.',
    quiz: [
      mc(
        'Which brain region is key for forming new long-term memories?',
        ['Hippocampus', 'Cerebellum', 'Brainstem', 'Spinal cord'],
        0,
        'The hippocampus helps consolidate new memories.',
      ),
      predict(
        'You study a topic once and never review it.',
        'After a week, how much do you probably remember?',
        ['Almost all of it', 'Only a small part', 'More than you learned', 'Exactly half'],
        1,
        'Without review, memories fade quickly.',
      ),
      mc(
        'Which study habit best strengthens memory?',
        [
          'Re-reading once the night before',
          'Spaced practice testing yourself over days',
          'Highlighting everything',
          'Studying while very tired',
        ],
        1,
        'Spaced retrieval practice beats cramming.',
      ),
    ],
    relatedConcepts: ['neuroplasticity', 'sleep-stages', 'synapses'],
    funFact:
      'Patient H.M. could learn new motor skills like mirror drawing, even though he never remembered practicing them.',
  },
  {
    id: 'neuroplasticity',
    title: 'Neuroplasticity',
    category: 'neuro',
    tags: ['brain plasticity', 'learning', 'synapses', 'practice', 'rewiring'],
    aliases: ['brain plasticity', 'rewiring the brain', 'fire together wire together'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['synapses'],
    summary:
      'Your brain physically rewires itself every time you learn — connections you use get stronger.',
    steps: steps(
      ['A changing brain', 'The brain isn’t fixed; its connections change throughout life.'],
      ['Use it or lose it', 'Synapses that are used often get stronger; unused ones weaken.'],
      ['Fire together, wire together', 'Neurons that activate together strengthen their links.'],
    ),
    interaction: slider({
      prompt:
        'Practice a skill and see how strong the neural connection becomes. Don’t forget sleep!',
      inputs: [
        {
          id: 'practice',
          label: 'Practice per week',
          unit: 'h',
          min: 0,
          max: 10,
          step: 0.5,
          start: 1,
        },
        { id: 'sleep', label: 'Sleep per night', unit: 'h', min: 4, max: 10, step: 0.5, start: 6 },
        { id: 'weeks', label: 'Weeks', min: 0, max: 12, step: 1, start: 2 },
      ],
      output: {
        label: 'Connection strength',
        unit: '%',
        max: 100,
        expr: '100 * (1 - exp(-practice * weeks / 25)) * sig(sleep, 6.5, 0.7)',
      },
      graphInput: 'weeks',
      visual: { kind: 'glow', emoji: '🔗' },
      challenges: [
        {
          prompt: 'Build a strong connection (over 80%).',
          target: { min: 80 },
          explain: 'Regular practice over weeks, plus enough sleep, builds strong pathways.',
        },
        {
          prompt: 'Practice a lot but sleep only 4–5 hours. Can you get past 40%?',
          target: { max: 40 },
          explain:
            'Short sleep undermines learning — the brain consolidates new connections while you sleep.',
        },
      ],
    }),
    goDeeper:
      'Synaptic plasticity includes long-term potentiation (LTP) and long-term depression (LTD), following Hebb’s idea that “cells that fire together wire together.” Structural plasticity includes new dendritic spines, new synapses and, in a few regions like the hippocampus, possibly new neurons. London taxi drivers who memorize the city’s map have been found to have a larger posterior hippocampus. After a stroke, rehabilitation helps undamaged areas take over lost functions.\n\nIn reality, it’s a bit more complicated: plasticity is greatest in childhood “critical periods” (for example for language and vision), though adults keep substantial plasticity. The slider’s formula is a playful model, not a measurement.',
    quiz: [
      mc(
        'What happens to synapses you use often?',
        ['They disappear', 'They get stronger', 'They turn into blood vessels', 'Nothing'],
        1,
        'Frequently used connections strengthen.',
      ),
      predict(
        'A stroke damages the part of the brain that controls a hand.',
        'How can the person regain some use?',
        [
          'They can’t, ever',
          'Through practice, other brain areas can learn to take over',
          'Only by growing a new brain',
          'By sleeping less',
        ],
        1,
        'Neuroplasticity lets other regions adapt.',
      ),
      mc(
        '“Neurons that fire together, wire together” means…',
        [
          'Neurons are made of wire',
          'Neurons active at the same time strengthen their links',
          'Neurons only work in pairs',
          'The brain uses electricity from the wall',
        ],
        1,
        'This is Hebb’s rule of learning.',
      ),
    ],
    relatedConcepts: ['memory-formation', 'synapses', 'phantom-limb'],
    funFact:
      'Learning to juggle for three months measurably increased gray matter in motion-processing areas in one study.',
  },
  {
    id: 'myelin',
    title: 'Myelin: Insulation for Speed',
    category: 'neuro',
    tags: [
      'myelin sheath',
      'saltatory conduction',
      'multiple sclerosis',
      'glial cells',
      'nerve speed',
    ],
    aliases: ['myelin sheath', 'saltatory conduction', 'white matter', 'nodes of Ranvier'],
    difficulty: 2,
    rarity: 'common',
    prerequisites: ['action-potential'],
    summary:
      'Fatty wrapping around nerve fibers makes signals leap ahead at up to 120 meters per second.',
    steps: steps(
      ['Fatty wrapping', 'Helper cells wrap layers of fatty myelin around axons.'],
      [
        'Jumping signals',
        'The signal leaps from gap to gap (nodes of Ranvier) instead of crawling.',
      ],
      ['Thick and fast', 'Thicker axons and more myelin both mean faster signals.'],
      [
        'When it fails',
        'In multiple sclerosis, the immune system damages myelin and signals slow down.',
      ],
    ),
    interaction: slider({
      prompt: 'Adjust myelin and axon thickness. How fast can you make the nerve signal travel?',
      inputs: [
        { id: 'myelin', label: 'Myelin', unit: '%', min: 0, max: 100, step: 5, start: 0 },
        {
          id: 'diameter',
          label: 'Axon diameter',
          unit: 'µm',
          min: 0.5,
          max: 20,
          step: 0.5,
          start: 1,
        },
      ],
      output: {
        label: 'Signal speed',
        unit: 'm/s',
        max: 120,
        expr: 'step(myelin - 10, 6 * diameter * (myelin / 100), 1.0 * sqrt(diameter))',
      },
      graphInput: 'diameter',
      visual: { kind: 'particles', emoji: '⚡' },
      challenges: [
        {
          prompt: 'Without myelin, how fast can a thin fiber go? (Get it under 2 m/s.)',
          target: { max: 2 },
          explain: 'Thin unmyelinated fibers crawl at about 0.5–2 m/s — like slow pain signals.',
        },
        {
          prompt: 'Make a superhighway: over 100 m/s.',
          target: { min: 100 },
          explain:
            'Thick, well-myelinated fibers reach 80–120 m/s — used for muscle control and touch.',
        },
      ],
    }),
    goDeeper:
      'Myelin is made by oligodendrocytes in the brain and spinal cord and by Schwann cells in peripheral nerves. It insulates the axon, reducing current leak and capacitance, so the action potential only needs to regenerate at the nodes of Ranvier (saltatory conduction). Conduction velocity in myelinated fibers rises roughly in proportion to diameter (about 6 m/s per µm); in unmyelinated fibers, roughly with the square root of diameter. Myelination continues into the mid-20s, especially in the frontal lobes.\n\nIn reality, it’s a bit more complicated: the slider jumps between two simple rules rather than modeling partial myelination. In multiple sclerosis, demyelinated patches can block signals entirely, not only slow them, and some function can return as myelin is partly repaired.',
    quiz: [
      mc(
        'What does myelin do?',
        [
          'Makes neurotransmitters',
          'Insulates axons so signals travel faster',
          'Stores memories',
          'Pumps blood',
        ],
        1,
        'Myelin speeds conduction by insulating the axon.',
      ),
      mc(
        'In myelinated axons, the signal “jumps” between…',
        ['Synapses', 'Nodes of Ranvier', 'Dendrites', 'Blood vessels'],
        1,
        'This is saltatory conduction.',
      ),
      predict(
        'In multiple sclerosis, myelin in parts of the brain is damaged.',
        'What happens to nerve signals there?',
        ['They speed up', 'They slow down or get blocked', 'They turn chemical', 'Nothing'],
        1,
        'Without insulation, signals leak and slow.',
      ),
    ],
    relatedConcepts: ['action-potential', 'autoimmune-disease', 'reflex-arc'],
    funFact: 'Your brain’s “white matter” is white because of all the fatty myelin.',
  },
  {
    id: 'blood-brain-barrier',
    title: 'The Blood–Brain Barrier',
    category: 'neuro',
    tags: ['brain', 'capillaries', 'tight junctions', 'drugs', 'protection'],
    aliases: ['BBB', 'brain barrier', 'why drugs can’t reach the brain'],
    difficulty: 3,
    rarity: 'obscure',
    summary:
      'Brain blood vessels are sealed so tightly that most substances in your blood can’t get in.',
    steps: steps(
      ['Sealed walls', 'Brain capillary cells are stitched together with tight junctions.'],
      [
        'Let in the essentials',
        'Oxygen slips through; glucose and amino acids get special carriers.',
      ],
      ['Keep out trouble', 'Most germs, toxins and many medicines are blocked.'],
    ),
    interaction: sorting(
      'Does each substance get through the blood–brain barrier?',
      [
        ['Gets in', '✅', 'Crosses into the brain'],
        ['Blocked', '⛔', 'Kept out (mostly)'],
      ],
      [
        ['Oxygen', '🫧', 0, 'Small, oil-soluble gases diffuse right through.'],
        ['Glucose', '🍬', 0, 'Special GLUT1 transporters carry the brain’s main fuel across.'],
        ['Caffeine', '☕', 0, 'Caffeine is small and fat-soluble enough to cross easily.'],
        [
          'Alcohol',
          '🍷',
          0,
          'Alcohol crosses readily — which is why it affects the brain so fast.',
        ],
        [
          'Most bacteria',
          '🦠',
          1,
          'Bacteria are far too large; brain infections are rare but serious.',
        ],
        [
          'Dopamine (in a pill)',
          '💊',
          1,
          'Dopamine can’t cross — Parkinson’s patients take L-DOPA, which crosses and is turned into dopamine inside.',
        ],
        [
          'Large antibodies',
          '🛡️',
          1,
          'Big proteins are mostly kept out, which makes some brain diseases hard to treat.',
        ],
      ],
    ),
    goDeeper:
      'The blood–brain barrier is formed by endothelial cells with tight junctions, supported by pericytes and astrocyte end-feet. Small lipophilic molecules (O₂, CO₂, ethanol, caffeine, many anesthetics) diffuse through; nutrients use transporters (GLUT1 for glucose, LAT1 for large amino acids — which is how L-DOPA enters); efflux pumps such as P-glycoprotein actively push many drugs back out. A few brain regions, like those that sense blood chemistry, have leakier capillaries.\n\nIn reality, it’s a bit more complicated: “blocked” usually means very little gets through, not zero. The barrier can be weakened by inflammation, stroke or tumors, and researchers are testing focused ultrasound and “molecular Trojan horses” to sneak medicines across.',
    quiz: [
      mc(
        'What makes the blood–brain barrier so tight?',
        ['A bone shell', 'Tight junctions sealing capillary cells together', 'Thick blood', 'Hair'],
        1,
        'Tight junctions stop most substances slipping between cells.',
      ),
      predict(
        'Doctors want to raise dopamine in the brain of someone with Parkinson’s.',
        'Why don’t they just give dopamine pills?',
        [
          'Dopamine is too sweet',
          'Dopamine can’t cross the blood–brain barrier',
          'Dopamine is illegal',
          'The brain doesn’t use dopamine',
        ],
        1,
        'They give L-DOPA, which crosses and is converted into dopamine.',
      ),
      mc(
        'Which substance crosses the barrier easily?',
        ['Most bacteria', 'Large antibodies', 'Oxygen', 'Red blood cells'],
        2,
        'Small gases like oxygen diffuse through.',
      ),
    ],
    relatedConcepts: ['cell-membrane', 'dopamine-reward', 'synapses'],
    funFact:
      'Paul Ehrlich found in the 1880s that dye injected into the blood stained every organ except the brain.',
  },
  {
    id: 'dopamine-reward',
    title: 'Dopamine & Reward',
    category: 'neuro',
    tags: ['dopamine', 'motivation', 'reward prediction', 'habits', 'addiction'],
    aliases: ['reward system', 'dopamine', 'motivation', 'why we crave things'],
    difficulty: 3,
    rarity: 'common',
    prerequisites: ['synapses'],
    summary:
      'Dopamine is less about pleasure and more about wanting — it flags things worth doing again.',
    steps: steps(
      [
        'Wanting, not liking',
        'Dopamine drives motivation and wanting more than the pleasure itself.',
      ],
      ['Better than expected', 'Dopamine neurons fire when a reward is better than predicted.'],
      ['Learning cues', 'Over time they start firing at the cue that predicts a reward.'],
      ['Hijacked', 'Addictive drugs flood this system, making cues hard to resist.'],
    ),
    interaction: cascade(
      'Follow a reward signal as you learn that a bell means a treat. Then break a link.',
      ['Bell rings 🔔, then a treat arrives', '🍪'],
      [
        ['Cue noticed', '🔔', 'Your brain notices the bell.'],
        [
          'Dopamine neurons fire',
          '⚡',
          'Neurons in the midbrain release dopamine — now at the cue, because you’ve learned it predicts a treat.',
          'With dopamine neurons lost (as in Parkinson’s disease), motivation and movement both suffer.',
        ],
        [
          'Dopamine reaches the striatum',
          '🎯',
          'Dopamine arrives in the striatum, the brain’s motivation and habit hub.',
        ],
        [
          'You want it — and act',
          '🏃',
          'You feel the urge and move toward the treat.',
          'If dopamine receptors are blocked, you notice the cue but feel little drive to act on it.',
        ],
        [
          'Learning updated',
          '📈',
          'Better than expected? The link strengthens. Worse? Dopamine dips and the link weakens.',
        ],
      ],
      'You learned that the bell means a treat — and you’re motivated to go get it.',
    ),
    goDeeper:
      'Dopamine neurons in the ventral tegmental area (VTA) and substantia nigra project to the striatum (including the nucleus accumbens) and prefrontal cortex. Wolfram Schultz showed that these neurons encode reward prediction error: they fire for unexpected rewards, shift their firing to predictive cues after learning, and dip when an expected reward doesn’t come. Kent Berridge distinguished “wanting” (dopamine-dependent incentive salience) from “liking” (pleasure, involving opioid and other systems). Parkinson’s disease results from loss of substantia nigra dopamine neurons.\n\nIn reality, it’s a bit more complicated: the popular idea of “dopamine hits” from phones and “dopamine detoxes” oversimplifies — dopamine is involved in learning, movement, attention and more, and its effects depend on brain region and receptor type.',
    quiz: [
      mc(
        'Dopamine is most strongly linked to…',
        ['Wanting and motivation', 'Digesting food', 'Making bones', 'Seeing colors'],
        0,
        'Dopamine drives motivation and reward learning.',
      ),
      predict(
        'A monkey learns that a light always comes before juice.',
        'When do its dopamine neurons fire after learning?',
        ['Only when it drinks the juice', 'When the light appears', 'Never', 'Only while asleep'],
        1,
        'Dopamine responses shift to the predictive cue.',
      ),
      mc(
        'Which disease involves the loss of dopamine-making neurons?',
        ['Diabetes', 'Parkinson’s disease', 'Asthma', 'Measles'],
        1,
        'Parkinson’s affects dopamine neurons controlling movement.',
      ),
    ],
    relatedConcepts: ['synapses', 'blood-brain-barrier', 'memory-formation'],
    funFact:
      'Rats with dopamine blocked will still enjoy sugar when it’s placed in their mouths — they just won’t walk across the cage to get it.',
  },
  {
    id: 'sleep-stages',
    title: 'Sleep Stages',
    category: 'neuro',
    tags: ['sleep', 'REM', 'dreams', 'deep sleep', 'brain waves'],
    aliases: ['REM sleep', 'deep sleep', 'sleep cycles', 'why we dream'],
    difficulty: 2,
    rarity: 'common',
    summary:
      'Every night your brain cycles through light sleep, deep sleep and dreaming REM — several times.',
    steps: steps(
      ['Light sleep', 'You drift into light sleep; your brain waves start slowing.'],
      ['Deep sleep', 'Slow, big brain waves. Body repair and memory consolidation happen here.'],
      [
        'REM sleep',
        'Your brain becomes very active and you dream, but your muscles are paralyzed.',
      ],
      ['Repeat', 'One cycle takes about 90 minutes; you go through 4–6 each night.'],
    ),
    interaction: timeline(
      'Scrub through one sleep cycle. Watch the brain waves change.',
      [
        [
          'Awake',
          'Fast, small, busy brain waves. Eyes open or closed but alert.',
          [
            sh('wave', 'wave', '#f59e0b', 50, 45, 1.4),
            { id: 'z', emoji: '😊', x: 50, y: 80, size: 1.4 },
          ],
          '11:00 pm',
        ],
        [
          'N1 light sleep',
          'Drifting off. You might twitch or feel like you’re falling.',
          [
            sh('wave', 'wave', '#a3e635', 50, 45, 2.2),
            { id: 'z', emoji: '😌', x: 50, y: 80, size: 1.4 },
          ],
          '11:05 pm',
        ],
        [
          'N2 sleep',
          'Brain waves slow, with bursts called sleep spindles that help memory.',
          [
            sh('wave', 'wave', '#22c55e', 50, 45, 3.2),
            { id: 'z', emoji: '😴', x: 50, y: 80, size: 1.4 },
          ],
          '11:20 pm',
        ],
        [
          'N3 deep sleep',
          'Big, slow delta waves. Hardest to wake from; growth hormone is released.',
          [
            sh('wave', 'wave', '#0ea5e9', 50, 45, 5),
            { id: 'z', emoji: '💤', x: 50, y: 80, size: 1.6 },
          ],
          '11:50 pm',
        ],
        [
          'REM sleep',
          'Fast brain waves like being awake, rapid eye movements, vivid dreams — but your body is paralyzed.',
          [
            sh('wave', 'wave', '#c026d3', 50, 45, 1.6),
            { id: 'z', emoji: '🌈', x: 50, y: 80, size: 1.6 },
          ],
          '12:30 am',
        ],
      ],
      [
        ['Stop at the deepest sleep.', 3],
        ['Stop when you’re most likely dreaming.', 4],
      ],
      '#eef2ff',
    ),
    goDeeper:
      'Non-REM sleep has stages N1, N2 and N3 (slow-wave sleep). N2 features sleep spindles and K-complexes; N3 has high-amplitude delta waves and supports physical restoration and memory consolidation. REM sleep features desynchronized EEG, rapid eye movements, vivid dreams and muscle atonia (paralysis) that stops us acting out dreams. Early cycles have more deep sleep; later cycles have more REM. Teenagers need about 8–10 hours.\n\nIn reality, it’s a bit more complicated: the wave shapes here are cartoons — real EEG traces show frequency and amplitude changes. Dreams can happen in non-REM sleep too, just usually less vivid. Sleep paralysis happens when REM muscle paralysis lingers briefly as you wake.',
    quiz: [
      mc(
        'In which stage do the most vivid dreams happen?',
        ['N1', 'N2', 'N3 deep sleep', 'REM'],
        3,
        'REM sleep is when vivid dreaming occurs.',
      ),
      mc(
        'About how long is one sleep cycle?',
        ['10 minutes', '90 minutes', '4 hours', '8 hours'],
        1,
        'Cycles last about 90 minutes.',
      ),
      predict(
        'A person’s REM muscle paralysis stops working.',
        'What might happen?',
        [
          'They can’t dream',
          'They act out their dreams physically',
          'They sleep deeper',
          'They stop breathing',
        ],
        1,
        'This happens in REM sleep behavior disorder.',
      ),
    ],
    relatedConcepts: ['circadian-rhythms', 'memory-formation', 'neuroplasticity'],
    funFact: 'Dolphins sleep with one half of their brain at a time, keeping the other half alert.',
  },
  {
    id: 'phantom-limb',
    title: 'Phantom Limbs',
    category: 'neuro',
    tags: ['amputation', 'brain maps', 'somatosensory cortex', 'mirror therapy', 'plasticity'],
    aliases: [
      'phantom limb pain',
      'phantom sensations',
      'mirror box therapy',
      'cortical remapping',
    ],
    difficulty: 4,
    rarity: 'obscure',
    prerequisites: ['neuroplasticity'],
    summary:
      'After losing a limb, many people still feel it — because the brain’s map of the body is still there.',
    steps: steps(
      [
        'A map in the brain',
        'Your brain has a map of your body: each body part has its own patch.',
      ],
      ['Silent patch', 'After an amputation, the hand’s patch stops getting signals.'],
      ['Neighbors move in', 'Nearby areas, like the face, can take over that patch.'],
      ['Ghost sensations', 'Touching the face can then feel like touching the missing hand.'],
    ),
    interaction: timeline(
      'Watch the brain’s touch map rewire after a hand is lost.',
      [
        [
          'Normal map',
          'The touch map: face, hand and arm areas sit side by side.',
          [
            sh('face', 'rect', '#f472b6', 30, 50, 1.6, { label: 'face' }),
            sh('hand', 'rect', '#60a5fa', 50, 50, 1.6, { label: 'hand' }),
            sh('arm', 'rect', '#34d399', 70, 50, 1.6, { label: 'arm' }),
          ],
        ],
        [
          'Hand lost',
          'After amputation, the hand area goes quiet — no signals arrive.',
          [
            sh('face', 'rect', '#f472b6', 30, 50, 1.6, { label: 'face' }),
            sh('hand', 'rect', '#94a3b8', 50, 50, 1.6, { label: 'hand (silent)', opacity: 0.5 }),
            sh('arm', 'rect', '#34d399', 70, 50, 1.6, { label: 'arm' }),
          ],
          'days',
        ],
        [
          'Neighbors invade',
          'Over weeks, the face and arm areas start spreading into the silent hand area.',
          [
            sh('face', 'rect', '#f472b6', 36, 50, 2.2, { label: 'face' }),
            sh('hand', 'rect', '#94a3b8', 50, 50, 1, { opacity: 0.4 }),
            sh('arm', 'rect', '#34d399', 64, 50, 2.2, { label: 'arm' }),
          ],
          'weeks',
        ],
        [
          'Phantom touch',
          'Now touching the cheek activates old hand neurons, so it feels like the missing hand was touched!',
          [
            sh('face', 'rect', '#f472b6', 40, 50, 2.6, { label: 'face → feels like hand!' }),
            sh('arm', 'rect', '#34d399', 64, 50, 2.2, { label: 'arm' }),
            { id: 'ghost', emoji: '👻', x: 50, y: 20, size: 1.2 },
          ],
          'months',
        ],
        [
          'Mirror therapy',
          'A mirror box shows a reflection of the other hand moving, “tricking” the brain and easing phantom pain for some people.',
          [
            sh('face', 'rect', '#f472b6', 36, 50, 2.2, { label: 'face' }),
            sh('arm', 'rect', '#34d399', 64, 50, 2.2, { label: 'arm' }),
            { id: 'mirror', emoji: '🪞', x: 50, y: 20, size: 1.4 },
          ],
        ],
      ],
      [
        ['Stop when the hand area goes silent.', 1],
        ['Stop when touching the face feels like touching the missing hand.', 3],
      ],
      '#f8fafc',
    ),
    goDeeper:
      'The primary somatosensory cortex contains a distorted body map (the homunculus) in which the hand and face areas are neighbors. Vilayanur Ramachandran showed in the 1990s that touching the face of some arm amputees produced sensations in the phantom hand, consistent with cortical remapping. Phantom sensations affect most amputees, and phantom limb pain is common. Mirror box therapy gives the brain visual feedback of a “moving” limb and helps some patients.\n\nIn reality, it’s a bit more complicated: remapping is only part of the story — changes in the spinal cord and peripheral nerves, and the persistence of the brain’s body representation, also matter. Whether remapping causes phantom pain or is just associated with it is still debated.',
    quiz: [
      mc(
        'Why might touching an amputee’s face feel like touching their missing hand?',
        [
          'Nerves grow from the face to the hand',
          'The face’s brain area has expanded into the hand’s area',
          'The hand grows back',
          'It’s imagination only',
        ],
        1,
        'Neighboring areas on the brain map take over the silent region.',
      ),
      mc(
        'What is mirror box therapy?',
        [
          'A surgery',
          'Using a mirror reflection to trick the brain into “seeing” the missing limb move',
          'A type of medicine',
          'Wearing a mirror as a prosthetic',
        ],
        1,
        'Visual feedback can ease phantom pain for some people.',
      ),
      predict(
        'Someone loses their hand. Months later, scientists scan their brain’s touch map.',
        'What do they likely find?',
        [
          'The hand area is exactly the same',
          'Neighboring areas have spread into the hand area',
          'The whole map has disappeared',
          'A new hand area grew in the leg area',
        ],
        1,
        'This is cortical remapping.',
      ),
    ],
    relatedConcepts: ['neuroplasticity', 'senses', 'synesthesia'],
    funFact:
      'Some people born without limbs still report feeling phantom limbs, suggesting part of the body map is built in.',
  },
  {
    id: 'synesthesia',
    title: 'Synesthesia',
    category: 'neuro',
    tags: ['senses', 'perception', 'cross-wiring', 'colors', 'brain'],
    aliases: ['tasting words', 'seeing sounds', 'colored letters', 'grapheme-color synesthesia'],
    difficulty: 3,
    rarity: 'obscure',
    prerequisites: ['senses'],
    summary: 'For some people, letters have colors, music has shapes, or words have tastes.',
    steps: steps(
      ['Blended senses', 'In synesthesia, one sense automatically triggers another experience.'],
      ['Many types', 'The most common type gives letters and numbers their own colors.'],
      [
        'Consistent',
        'A synesthete’s pairings stay the same for years — “A” is always the same red.',
      ],
    ),
    interaction: sorting(
      'Sort each experience to its type of synesthesia.',
      [
        ['Grapheme–color', '🔤', 'Letters or numbers have colors'],
        ['Sound–color (chromesthesia)', '🎵', 'Sounds or music trigger colors'],
        ['Lexical–gustatory', '👅', 'Words trigger tastes'],
        ['Number–space', '📐', 'Numbers sit in a layout in space'],
      ],
      [
        [
          '“The letter A is always red”',
          '🅰️',
          0,
          'The most common type: letters and digits have fixed colors.',
        ],
        ['“7 is a deep green”', '7️⃣', 0, 'Numbers are graphemes too.'],
        ['“A trumpet sounds orange”', '🎺', 1, 'Musical notes or instruments trigger colors.'],
        ['“The word ‘table’ tastes like bacon”', '🥓', 2, 'A rare type where words evoke tastes.'],
        [
          '“Months circle around my body”',
          '🗓️',
          3,
          'Sequences like months or numbers occupy a mental shape in space.',
        ],
        [
          '“Piano chords look like blue shapes”',
          '🎹',
          1,
          'Sound-color often comes with shapes or movement.',
        ],
      ],
    ),
    goDeeper:
      'Synesthesia affects perhaps 2–4% of people (estimates vary) and runs in families. Brain imaging shows extra activity — and sometimes extra structural connections — between areas, for example between letter-processing regions and the color area V4 in the fusiform gyrus. Test–retest consistency over months is used to confirm it. Many synesthetes are surprised to learn others don’t experience the world this way.\n\nIn reality, it’s a bit more complicated: scientists still debate whether synesthesia comes from extra connections, reduced inhibition between areas, or both, and whether learning (like colored alphabet toys in childhood) shapes some pairings.',
    quiz: [
      mc(
        'What is the most common type of synesthesia?',
        [
          'Tasting words',
          'Seeing colors for letters and numbers',
          'Hearing smells',
          'Feeling sounds on the skin',
        ],
        1,
        'Grapheme–color synesthesia is most common.',
      ),
      mc(
        'How do researchers check that someone truly has synesthesia?',
        [
          'Ask them once',
          'Test whether their pairings stay consistent over months',
          'Measure their height',
          'Check their eyesight',
        ],
        1,
        'Real synesthetic pairings are remarkably consistent.',
      ),
      predict(
        'A synesthete says the letter E is yellow. A year later you ask again.',
        'What do they probably say?',
        [
          'A totally different color',
          'Yellow again',
          'They don’t remember letters',
          'E has no color',
        ],
        1,
        'Synesthetic pairings are stable over time.',
      ),
    ],
    relatedConcepts: ['senses', 'phantom-limb', 'neuroplasticity'],
    funFact:
      'Several famous musicians, including Billy Joel and Pharrell Williams, have described seeing colors when they hear music.',
  },
];
