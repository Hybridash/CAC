import type { ComponentType } from 'react';
import { AtpFigure } from './AtpFigure';
import { FoldingFigure } from './FoldingFigure';
import { MembraneFigure } from './MembraneFigure';
import { MitochondriaFigure } from './MitochondriaFigure';
import { OsmosisFigure } from './OsmosisFigure';
import { ReplicationFigure } from './ReplicationFigure';
import { TranscriptionFigure } from './TranscriptionFigure';
import { PUMP_ALT, PumpFigure } from './PumpFigure';

/** A lesson figure follows the lesson's step index (0-based) and has a caption per step. */
export interface LessonFigure {
  Figure: ComponentType<{ step: number }>;
  /** Short caption for each step, shown under the figure. */
  captions: readonly string[];
  title: string;
}

/** Concepts with a hand-built figure get the figure-led lesson layout. */
export const LESSON_FIGURES: Record<string, LessonFigure> = {
  'cell-membrane': {
    Figure: MembraneFigure,
    title: 'The cell membrane and diffusion',
    captions: [
      'Figure: a membrane is two rows of phospholipids with proteins set into it.',
      'Figure: molecules spread from the crowded side to the empty side.',
      'Figure: a bigger difference between the sides makes the spreading faster.',
      'Figure: small molecules slip through the lipids; big ones need a protein gate.',
    ],
  },
  atp: {
    Figure: AtpFigure,
    title: 'ATP as a rechargeable battery',
    captions: [
      'Figure: ATP is adenosine with a chain of three phosphates.',
      'Figure: the last phosphate breaks off and the energy is spent, leaving ADP.',
      'Figure: respiration puts the phosphate back and ATP is ready again.',
    ],
  },
  mitochondria: {
    Figure: MitochondriaFigure,
    title: 'Fuel in, ATP out',
    captions: [
      'Figure: glucose and oxygen arrive at the cell.',
      'Figure: glucose is split, and the pieces go into the mitochondrion.',
      'Figure: the folded inner membrane has room for many ATP makers.',
      'Figure: carbon dioxide and water leave as waste.',
    ],
  },
  'dna-replication': {
    Figure: ReplicationFigure,
    title: 'The replication fork',
    captions: [
      'Figure: helicase unzips the double helix at the fork.',
      'Figure: each old strand gets a short primer to start from.',
      'Figure: polymerase adds matching letters along each old strand.',
      'Figure: ligase seals the gaps, leaving two helices with one old strand and one new strand each.',
    ],
  },
  transcription: {
    Figure: TranscriptionFigure,
    title: 'From gene to mRNA',
    captions: [
      'Figure: transcription factors mark the start of the gene.',
      'Figure: RNA polymerase opens the DNA and builds a matching RNA.',
      'Figure: the RNA gets a cap and a tail, and the introns are cut out.',
      'Figure: the finished mRNA leaves the nucleus through a pore.',
    ],
  },
  'protein-folding': {
    Figure: FoldingFigure,
    title: 'Four levels of protein structure',
    captions: [
      'Figure: a protein starts as a chain of amino acids.',
      'Figure: parts coil into helices and fold into sheets.',
      'Figure: the whole chain folds into one 3D shape.',
      'Figure: several folded chains can join into one protein, like hemoglobin.',
    ],
  },
  osmosis: {
    Figure: OsmosisFigure,
    title: 'Osmosis across a membrane',
    captions: [
      'Figure: water crosses through channels in both directions; solutes stay put.',
      'Figure: with more solutes below, water flows down through the channels.',
      'Figure: a red blood cell swells, stays the same, or shrivels depending on the water around it.',
    ],
  },
  'active-transport': {
    Figure: PumpFigure,
    title: 'The sodium–potassium pump',
    captions: [
      'Figure: sodium is crowded outside the cell and scarce inside.',
      'Figure: three sodium ions bind inside while ATP waits.',
      'Figure: the phosphate flips the pump and sodium leaves.',
      'Figure: one cycle moves 3 Na⁺ out and 2 K⁺ in, and spends 1 ATP.',
    ],
  },
};

export { PUMP_ALT };
