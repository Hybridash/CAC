import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DndArena, Draggable, DropZone } from '../../templates/framework/dnd';
import type { TemplateProps } from '../../templates/framework/types';
import { Feedback, Prompt, type FeedbackTone } from '../../templates/framework/ui';
import { sfx } from '../../lib/sound';
import {
  anticodonOf,
  CODONS,
  codonsOf,
  DNA_PAIR,
  mutate,
  TEMPLATE,
  transcribe,
  translate,
  type AminoAcid,
} from './genetics';
import { GoalItem, Icon } from '../../components/Icon';

const BASE_COLOR: Record<string, string> = {
  A: '#4ade80',
  T: '#fb7185',
  U: '#fb923c',
  G: '#facc15',
  C: '#60a5fa',
};

/** tRNAs on offer: the right ones plus look-alikes. Anticodon pairs with the codon. */
const TRNAS = ['AUG', 'CAC', 'GAG', 'CCU', 'UUU', 'GGA'].map((codon) => ({
  id: `trna-${codon}`,
  codon,
  anticodon: anticodonOf(codon),
  aa: CODONS[codon] as Exclude<AminoAcid, 'STOP'>,
}));

type Phase = 'transcribe' | 'translate' | 'done';

export function TranslationLesson({
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<{ component: string }>) {
  const mrnaTarget = transcribe(TEMPLATE);
  const codons = codonsOf(mrnaTarget);
  const [phase, setPhase] = useState<Phase>('transcribe');
  const [built, setBuilt] = useState('');
  const [chain, setChain] = useState<Exclude<AminoAcid, 'STOP'>[]>([]);
  const [codonIndex, setCodonIndex] = useState(0);
  const [mutated, setMutated] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: FeedbackTone } | null>({
    text: 'RNA polymerase is ready. Add the RNA letter that pairs with each DNA letter, left to right.',
    tone: 'info',
  });
  const completed = useRef(alreadyDone);
  const say = (text: string, tone: FeedbackTone = 'info') => setMsg({ text, tone });

  useEffect(() => {
    if (mutated && phase === 'done' && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      onComplete();
    }
  }, [mutated, phase, onComplete]);

  const addBase = useCallback(
    (base: string) => {
      if (phase !== 'transcribe') return;
      const i = built.length;
      const dna = TEMPLATE[i];
      if (DNA_PAIR[dna] === base) {
        sfx.pop();
        const next = built + base;
        setBuilt(next);
        if (next.length === 1) onStage?.(1);
        if (next.length === TEMPLATE.length) {
          sfx.correct();
          setPhase('translate');
          onStage?.(2);
          say(
            'mRNA finished! It slips out of the nucleus to a ribosome. Now match tRNAs to each 3-letter codon.',
            'good',
          );
        } else say(`${dna} pairs with ${base}. ${next.length} of ${TEMPLATE.length} letters.`);
      } else {
        sfx.nope();
        say(
          dna === 'A' && base === 'T'
            ? 'Close! RNA has no T — it uses U (uracil) to pair with A.'
            : `Hmm, ${base} doesn’t pair with ${dna}. Remember: A pairs with U, and G pairs with C.`,
          'hint',
        );
      }
    },
    [built, phase, onStage],
  );

  // Keyboard shortcut: type A/U/G/C to add the next RNA letter.
  useEffect(() => {
    if (phase !== 'transcribe') return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      const k = e.key.toUpperCase();
      if ('AUGCT'.includes(k) && k.length === 1) addBase(k);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, addBase]);

  const onDrop = (id: string, zone: string) => {
    if (id.startsWith('nt-') && zone === 'next-slot') addBase(id.slice(3));
    if (zone !== 'ribosome' || phase !== 'translate') return;
    const codon = codons[codonIndex];
    const aa = CODONS[codon];
    if (id === 'release') {
      if (aa === 'STOP') {
        sfx.fanfare();
        setPhase('done');
        onStage?.(4);
        say(
          'STOP codon! The release factor frees the finished protein. It folds into shape and goes to work.',
          'good',
        );
      } else {
        sfx.nope();
        say(
          `${codon} isn’t a stop codon — it still codes for an amino acid. Find the tRNA that matches.`,
          'hint',
        );
      }
      return;
    }
    const t = TRNAS.find((x) => x.id === id);
    if (!t) return;
    if (aa === 'STOP') {
      sfx.nope();
      say(`${codon} is a STOP codon. No tRNA matches it — use the release factor.`, 'hint');
    } else if (t.codon === codon) {
      sfx.correct();
      setChain((c) => [...c, t.aa]);
      setCodonIndex((i) => i + 1);
      onStage?.(3);
      say(
        `Anticodon ${t.anticodon} pairs with codon ${codon}. ${t.aa.name} joins the chain!`,
        'good',
      );
    } else {
      sfx.nope();
      say(
        `Anticodon ${t.anticodon} doesn’t pair with ${codon}. Look for the opposite letters (A–U, G–C).`,
        'hint',
      );
    }
  };

  const mutatedProtein = useMemo(() => translate(transcribe(mutate(TEMPLATE))), []);
  const normalProtein = useMemo(() => translate(mrnaTarget), [mrnaTarget]);

  return (
    <div className="flex flex-col gap-3">
      <Prompt>
        {phase === 'transcribe'
          ? 'Step 1 · Transcription: build the mRNA copy of the gene (drag, tap, or type A/U/G/C).'
          : phase === 'translate'
            ? 'Step 2 · Translation: drag the tRNA whose anticodon pairs with the codon in the ribosome.'
            : 'Step 3 · Mutation lab: what happens if a single DNA letter changes?'}
      </Prompt>
      <DndArena onDrop={onDrop}>
        {/* ------- nucleus ------- */}
        <section
          className="rounded-3xl bg-violet-50 p-3 ring-2 ring-violet-200"
          aria-label="Nucleus"
        >
          <h3 className="mb-2 text-sm font-extrabold text-violet-900">Nucleus</h3>
          <div className="overflow-x-auto pb-1">
            <div className="flex w-max flex-col gap-1">
              <Strand
                label="DNA template"
                letters={[...(mutated ? mutate(TEMPLATE) : TEMPLATE)]}
                highlight={phase === 'transcribe' ? built.length : -1}
                mutateAt={mutated ? 7 : -1}
              />
              <div className="flex gap-1 pl-[6.5rem]" aria-hidden>
                {[...TEMPLATE].map((_, i) => (
                  <span
                    key={i}
                    className={`w-9 text-center text-xs ${i % 3 === 2 ? 'mr-1.5' : ''} ${i < built.length ? 'text-violet-500' : 'text-transparent'}`}
                  >
                    ┆
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="w-24 shrink-0 text-right text-xs font-bold text-ink-soft">
                  mRNA
                </span>
                {[...TEMPLATE].map((_, i) => (
                  <span key={i} className={i % 3 === 2 ? 'mr-1.5' : ''}>
                    {i < built.length ? (
                      <motion.span
                        className="block"
                        initial={{ y: -16, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                      >
                        <Tile b={(mutated ? transcribe(mutate(TEMPLATE)) : built)[i]} />
                      </motion.span>
                    ) : i === built.length && phase === 'transcribe' ? (
                      <DropZone id="next-slot" label={`position ${i + 1}`} className="rounded-lg">
                        {({ isOver, armed }) => (
                          <span
                            className={`grid h-9 w-9 place-items-center rounded-lg border-2 border-dashed text-sm font-bold ${isOver ? 'border-indigo-500 bg-indigo-100' : armed ? 'border-indigo-400 bg-white' : 'animate-pulse border-violet-400 bg-white'}`}
                          >
                            ?
                          </span>
                        )}
                      </DropZone>
                    ) : (
                      <span className="block h-9 w-9 rounded-lg border-2 border-dashed border-slate-200" />
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {phase === 'transcribe' && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold">RNA letters:</span>
              {['A', 'U', 'G', 'C'].map((b) => (
                <Draggable key={b} id={`nt-${b}`} label={`RNA base ${b}`}>
                  <Tile b={b} big />
                </Draggable>
              ))}
              <span className="text-xs text-ink-soft">Pairs: A–U · T–A · G–C · C–G</span>
            </div>
          )}
        </section>

        {/* ------- cytoplasm / ribosome ------- */}
        {phase !== 'transcribe' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-sky-50 p-3 ring-2 ring-sky-200"
            aria-label="Cytoplasm"
          >
            <h3 className="mb-2 text-sm font-extrabold text-sky-900">Cytoplasm · ribosome</h3>
            <div className="flex flex-wrap items-center gap-2">
              {codons.map((c, i) => (
                <div key={i} className="relative">
                  {i === codonIndex && phase === 'translate' ? (
                    <DropZone
                      id="ribosome"
                      label={`ribosome reading codon ${c}`}
                      className="rounded-2xl"
                    >
                      {({ isOver, armed }) => (
                        <div
                          className={`rounded-2xl p-1.5 ring-4 ${isOver ? 'bg-indigo-100 ring-indigo-500' : armed ? 'bg-white ring-indigo-300' : 'bg-amber-100 ring-amber-400'}`}
                        >
                          <div className="mb-1 text-center text-[10px] font-extrabold text-amber-900">
                            RIBOSOME
                          </div>
                          <Codon c={c} />
                        </div>
                      )}
                    </DropZone>
                  ) : (
                    <div className={`rounded-2xl p-1.5 ${i < codonIndex ? 'opacity-50' : ''}`}>
                      <Codon c={c} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div
              className="mt-3 flex min-h-12 flex-wrap items-center gap-1"
              aria-label="Protein chain"
            >
              <span className="mr-1 text-sm font-bold">Protein:</span>
              <AnimatePresence>
                {chain.map((aa, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{
                      scale: 1,
                      rotate: phase === 'done' ? (i % 2 ? 18 : -18) : 0,
                      y: phase === 'done' ? (i % 2 ? 8 : -8) : 0,
                    }}
                    className="grid h-11 w-11 place-items-center rounded-full text-xs font-extrabold text-white shadow ring-2 ring-white"
                    style={{ background: aa.color }}
                    title={aa.name}
                  >
                    {aa.short}
                  </motion.span>
                ))}
              </AnimatePresence>
              {chain.length === 0 && (
                <span className="text-sm text-ink-soft">(empty — add the first amino acid)</span>
              )}
            </div>
            {phase === 'translate' && (
              <div className="mt-3 flex flex-wrap gap-2">
                {TRNAS.map((t) => (
                  <Draggable
                    key={t.id}
                    id={t.id}
                    label={`tRNA with anticodon ${t.anticodon} carrying ${t.aa.name}`}
                  >
                    <span className="flex flex-col items-center rounded-2xl bg-white px-2 py-1.5 shadow ring-1 ring-black/10">
                      <span
                        className="grid h-8 w-8 place-items-center rounded-full text-[10px] font-extrabold text-white"
                        style={{ background: t.aa.color }}
                      >
                        {t.aa.short}
                      </span>
                      <span className="text-[10px] text-ink-soft">tRNA</span>
                      <span className="font-mono text-sm font-extrabold tracking-wider">
                        {t.anticodon}
                      </span>
                    </span>
                  </Draggable>
                ))}
                <Draggable id="release" label="Release factor for stop codons">
                  <span className="flex h-full flex-col items-center justify-center rounded-2xl bg-rose-50 px-3 py-1.5 shadow ring-1 ring-rose-200">
                    <Icon name="stop" size={24} />
                    <span className="text-xs font-extrabold text-rose-800">Release factor</span>
                  </span>
                </Draggable>
              </div>
            )}
          </motion.section>
        )}
      </DndArena>

      {phase === 'done' && (
        <section
          className="rounded-3xl bg-white p-3 ring-2 ring-rose-200"
          aria-label="Mutation lab"
        >
          <h3 className="font-extrabold">
            <Icon name="flask" size={22} className="mr-1" /> Mutation lab
          </h3>
          {!mutated ? (
            <>
              <p className="text-sm text-ink-soft">
                Swap ONE DNA letter (the T in the third codon’s template, CTC → CAC). What happens
                to the protein?
              </p>
              <button
                className="btn-primary mt-2"
                onClick={() => {
                  setMutated(true);
                  sfx.whoosh();
                  onStage?.(5);
                  say(
                    'One letter changed: GAG became GUG, so glutamic acid became valine. This exact swap in the hemoglobin gene causes sickle-cell disease.',
                    'hint',
                  );
                }}
              >
                <Icon name="dna" size={18} /> Mutate one letter
              </button>
            </>
          ) : (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <ProteinRow title="Normal hemoglobin start" chain={normalProtein} />
              <ProteinRow title="Sickle-cell version" chain={mutatedProtein} />
            </div>
          )}
        </section>
      )}

      <Feedback text={msg?.text ?? null} tone={msg?.tone} />
      <ul className="flex flex-wrap gap-2 text-sm font-bold" aria-label="Goals">
        <Goal done={phase !== 'transcribe'}>Transcribe DNA → mRNA</Goal>
        <Goal done={phase === 'done'}>Translate mRNA → protein</Goal>
        <Goal done={mutated}>Try a mutation</Goal>
      </ul>
      <CodonChart />
    </div>
  );
}

function Goal({ done, children }: { done: boolean; children: React.ReactNode }) {
  return <GoalItem done={done}>{children}</GoalItem>;
}

function Tile({ b, big }: { b: string; big?: boolean }) {
  return (
    <span
      className={`grid place-items-center rounded-lg font-mono font-extrabold text-ink shadow-sm ring-1 ring-black/15 ${big ? 'h-12 w-12 text-2xl' : 'h-9 w-9 text-lg'}`}
      style={{ background: BASE_COLOR[b] }}
    >
      {b}
    </span>
  );
}

function Strand({
  label,
  letters,
  highlight,
  mutateAt,
}: {
  label: string;
  letters: string[];
  highlight: number;
  mutateAt: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="w-24 shrink-0 text-right text-xs font-bold text-ink-soft">{label}</span>
      {letters.map((b, i) => (
        <span
          key={i}
          className={`rounded-lg ${i === highlight ? 'ring-4 ring-indigo-400' : ''} ${i === mutateAt ? 'ring-4 ring-rose-500' : ''} ${i % 3 === 2 ? 'mr-1.5' : ''}`}
        >
          <Tile b={b} />
        </span>
      ))}
    </div>
  );
}

function Codon({ c }: { c: string }) {
  const aa = CODONS[c];
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-0.5">
        {[...c].map((b, i) => (
          <Tile key={i} b={b} />
        ))}
      </div>
      <span className="mt-0.5 text-[11px] font-bold text-ink-soft">
        {aa === 'STOP' ? 'STOP' : aa ? aa.short : '?'}
      </span>
    </div>
  );
}

function ProteinRow({ title, chain }: { title: string; chain: AminoAcid[] }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-2">
      <p className="text-sm font-bold">{title}</p>
      <div className="mt-1 flex gap-1">
        {chain.map((aa, i) =>
          aa === 'STOP' ? (
            <span key={i} className="chip bg-rose-100 text-rose-800">
              stop
            </span>
          ) : (
            <span
              key={i}
              className="grid h-10 w-10 place-items-center rounded-full text-xs font-extrabold text-white"
              style={{ background: aa.color }}
            >
              {aa.short}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

function CodonChart() {
  return (
    <details className="rounded-2xl bg-white p-3 ring-1 ring-black/10">
      <summary className="cursor-pointer text-sm font-extrabold">
        <Icon name="book" size={20} className="mr-1" /> Codon chart (part of the genetic code)
      </summary>
      <div className="mt-2 grid grid-cols-2 gap-1 text-sm sm:grid-cols-5">
        {Object.entries(CODONS).map(([codon, aa]) => (
          <span key={codon} className="rounded-lg bg-slate-50 px-2 py-1 font-mono">
            {codon} → <b>{aa === 'STOP' ? 'STOP' : aa.short}</b>
          </span>
        ))}
      </div>
    </details>
  );
}
