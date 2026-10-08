/** Tiny genetic-code helpers for the DNA → protein flagship. */

export const DNA_PAIR: Record<string, string> = { A: 'U', T: 'A', G: 'C', C: 'G' };
export const RNA_PAIR: Record<string, string> = { A: 'U', U: 'A', G: 'C', C: 'G' };

export type AminoAcid = { name: string; short: string; color: string } | 'STOP';

/** The part of the standard genetic code this lesson uses. */
export const CODONS: Record<string, AminoAcid> = {
  AUG: { name: 'Methionine', short: 'Met', color: '#22c55e' },
  CAC: { name: 'Histidine', short: 'His', color: '#3b82f6' },
  GAG: { name: 'Glutamic acid', short: 'Glu', color: '#f43f5e' },
  GUG: { name: 'Valine', short: 'Val', color: '#a855f7' },
  CCU: { name: 'Proline', short: 'Pro', color: '#f59e0b' },
  UUU: { name: 'Phenylalanine', short: 'Phe', color: '#14b8a6' },
  GGA: { name: 'Glycine', short: 'Gly', color: '#64748b' },
  UAA: 'STOP',
  UAG: 'STOP',
  UGA: 'STOP',
};

/** Template strand (read 3′→5′) chosen so the mRNA codes Met-His-Glu-STOP, the start of β-globin. */
export const TEMPLATE = 'TACGTGCTCATT';
/** Changing one letter (T→A at position 8) turns GAG (Glu) into GUG (Val): the sickle-cell mutation. */
export const MUTATION_INDEX = 7;

export const transcribe = (template: string) => [...template].map((b) => DNA_PAIR[b]).join('');

export const codonsOf = (mrna: string) => mrna.match(/.{3}/g) ?? [];

export const anticodonOf = (codon: string) => [...codon].map((b) => RNA_PAIR[b]).join('');

export function translate(mrna: string): AminoAcid[] {
  const out: AminoAcid[] = [];
  for (const c of codonsOf(mrna)) {
    const aa = CODONS[c];
    if (!aa) break;
    out.push(aa);
    if (aa === 'STOP') break;
  }
  return out;
}

export const mutate = (template: string) =>
  template.slice(0, MUTATION_INDEX) + 'A' + template.slice(MUTATION_INDEX + 1);
