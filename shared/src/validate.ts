/** Structural checks for concept and mystery data. Run by the test suite over the whole library. */
import { evalExpr, exprVariables } from './expr';
import { punnett } from './sim';
import type { Concept, Diagram, LibraryUpgrade, Mystery, QuizQuestion } from './types';

function checkQuestion(q: QuizQuestion, where: string, errors: string[]) {
  if (q.kind === 'label') {
    if (q.pairs.length < 2 || q.pairs.length > 5) errors.push(`${where}: label needs 2–5 pairs`);
    return;
  }
  if (q.options.length < 2) errors.push(`${where}: needs at least 2 options`);
  if (q.answer < 0 || q.answer >= q.options.length) errors.push(`${where}: answer out of range`);
  if (new Set(q.options).size !== q.options.length) errors.push(`${where}: duplicate options`);
}

export function validateConcept(c: Concept, allIds: Set<string>): string[] {
  const e: string[] = [];
  const at = (s: string) => `${c.id}: ${s}`;
  if (!/^[a-z0-9-]+$/.test(c.id)) e.push(at('id must be kebab-case'));
  if (c.quiz.length !== 3) e.push(at('quiz must have exactly 3 questions'));
  c.quiz.forEach((q, i) => checkQuestion(q, at(`quiz[${i}]`), e));
  if (c.steps.length < 2) e.push(at('needs at least 2 steps'));
  if (c.tags.length < 2) e.push(at('needs at least 2 tags'));
  if (!c.goDeeper || c.goDeeper.length < 80) e.push(at('goDeeper is too short'));
  if (!c.summary) e.push(at('missing summary'));
  for (const r of c.relatedConcepts) if (!allIds.has(r)) e.push(at(`unknown related concept ${r}`));
  for (const r of c.prerequisites ?? [])
    if (!allIds.has(r)) e.push(at(`unknown prerequisite ${r}`));
  if (c.relatedConcepts.includes(c.id)) e.push(at('relates to itself'));

  const it = c.interaction;
  switch (it.template) {
    case 'feed-and-observe': {
      const meters = new Set(it.config.meters.map((m) => m.id));
      for (const item of it.config.items)
        for (const ef of item.effects)
          if (!meters.has(ef.meter)) e.push(at(`item ${item.id} affects unknown meter`));
      for (const r of it.config.responses) {
        if (!meters.has(r.when.meter) || !meters.has(r.effect.meter))
          e.push(at(`response ${r.id} uses unknown meter`));
      }
      if (it.config.items.length < 2) e.push(at('feed-and-observe needs 2+ items'));
      break;
    }
    case 'assembly-line':
      if (it.config.parts.length < 3) e.push(at('assembly needs 3+ parts'));
      if (new Set(it.config.parts.map((p) => p.label)).size !== it.config.parts.length)
        e.push(at('assembly part labels must be unique'));
      break;
    case 'slider-sim': {
      const ids = new Set(it.config.inputs.map((i) => i.id));
      const exprs = [it.config.output.expr, ...(it.config.readouts ?? []).map((r) => r.expr)];
      for (const x of exprs) {
        try {
          for (const v of exprVariables(x)) if (!ids.has(v)) e.push(at(`expr uses unknown ${v}`));
        } catch (err) {
          e.push(at(String(err)));
        }
      }
      if (!ids.has(it.config.graphInput)) e.push(at('graphInput is not an input'));
      for (const i of it.config.inputs)
        if (i.start < i.min || i.start > i.max) e.push(at(`input ${i.id} start out of range`));
      if (it.config.challenges.length < 1) e.push(at('slider needs a challenge'));
      else {
        try {
          for (const ch of it.config.challenges)
            if (!sliderTargetReachable(it.config, ch.target))
              e.push(at(`slider challenge "${ch.prompt}" can't be reached`));
        } catch (err) {
          e.push(at(String(err)));
        }
      }
      break;
    }
    case 'lock-and-key': {
      const rec = new Set(it.config.receptors.map((r) => r.id));
      for (const m of it.config.molecules) {
        if (m.fits && !rec.has(m.fits)) e.push(at(`molecule ${m.id} fits unknown receptor`));
        const r = it.config.receptors.find((x) => x.id === m.fits);
        if (r && r.shape !== m.shape) e.push(at(`molecule ${m.id} shape must match its receptor`));
      }
      if (!it.config.molecules.some((m) => m.fits)) e.push(at('lock-and-key needs a fitting key'));
      break;
    }
    case 'zoom-explorer': {
      const lv = new Set(it.config.levels.map((l) => l.id));
      for (const l of it.config.levels)
        for (const h of l.hotspots)
          if (h.zoomTo && !lv.has(h.zoomTo)) e.push(at(`hotspot ${h.id} zooms to unknown level`));
      if (it.config.levels.length < 2) e.push(at('zoom needs 2+ levels'));
      break;
    }
    case 'cause-effect': {
      const ids = new Set(it.config.nodes.map((n) => n.id));
      for (const b of it.config.breakable) {
        if (!ids.has(b)) e.push(at(`breakable ${b} is not a node`));
        if (!it.config.nodes.find((n) => n.id === b)?.brokenText)
          e.push(at(`breakable ${b} needs brokenText`));
      }
      if (it.config.nodes.length < 3) e.push(at('cause-effect needs 3+ nodes'));
      break;
    }
    case 'sorting': {
      const bins = new Set(it.config.bins.map((b) => b.id));
      for (const i of it.config.items) if (!bins.has(i.bin)) e.push(at(`item ${i.id} has bad bin`));
      if (it.config.items.length < 4) e.push(at('sorting needs 4+ items'));
      break;
    }
    case 'ecosystem': {
      const ids = new Set(it.config.species.map((s) => s.id));
      for (const s of it.config.species)
        for (const x of s.eats ?? [])
          if (!ids.has(x.id)) e.push(at(`${s.id} eats unknown ${x.id}`));
      for (const t of it.config.toggleable) if (!ids.has(t)) e.push(at(`toggle ${t} unknown`));
      break;
    }
    case 'punnett': {
      const { gene } = it.config;
      try {
        for (const m of it.config.mothers)
          for (const f of it.config.fathers) {
            const r = punnett(gene, m, f);
            for (const g of Object.keys(r.genotypes))
              if (!gene.phenotypes[g]) e.push(at(`missing phenotype for ${g}`));
          }
      } catch (err) {
        e.push(at(String(err)));
      }
      const labels = new Set(Object.values(gene.phenotypes).map((p) => p.label));
      for (const ch of it.config.challenges) {
        if (!labels.has(ch.phenotype)) e.push(at(`challenge phenotype ${ch.phenotype} unknown`));
        const ok = it.config.mothers.some((m) =>
          it.config.fathers.some(
            (f) =>
              Math.abs((punnett(gene, m, f).phenotypes[ch.phenotype] ?? 0) - ch.probability) < 1e-9,
          ),
        );
        if (!ok) e.push(at(`no cross achieves "${ch.prompt}"`));
      }
      break;
    }
    case 'timeline': {
      const ids = new Set(it.config.frames.map((f) => f.id));
      for (const cp of it.config.checkpoints)
        if (!ids.has(cp.frame)) e.push(at(`checkpoint frame ${cp.frame} unknown`));
      if (it.config.frames.length < 3) e.push(at('timeline needs 3+ frames'));
      break;
    }
    case 'flagship':
      break;
  }
  return e;
}

/** Extra checks for a High School lesson: it must line up with its base concept and its diagrams. */
export function validateHighSchool(c: Concept, base: Concept | undefined): string[] {
  const e: string[] = [];
  const at = (s: string) => `${c.id}: ${s}`;
  const hs = c.highSchool;
  if (!hs) return [at('missing highSchool info')];
  if (!base) return [at(`unknown base concept ${hs.baseId}`)];
  // Steps track the reused interaction's stages, so the counts must match.
  if (c.steps.length !== base.steps.length)
    e.push(at(`has ${c.steps.length} steps but ${base.id} has ${base.steps.length}`));
  if (hs.diagrams.length < 1) e.push(at('needs at least one diagram'));
  if (hs.keyTerms.length < 3) e.push(at('needs at least 3 key terms'));
  for (const d of hs.diagrams) e.push(...validateDiagram(d, at));
  return e;
}

/** Structural checks for one labeled diagram. */
export function validateDiagram(d: Diagram, at: (s: string) => string): string[] {
  const e: string[] = [];
  const where = (s: string) => at(`diagram “${d.title}”: ${s}`);
  const ids = new Set(d.parts.map((p) => p.id));
  if (ids.size !== d.parts.length) e.push(where('duplicate part ids'));
  if (d.parts.length < 3) e.push(where('needs at least 3 labeled parts'));
  if (!d.caption) e.push(where('missing caption'));
  for (const p of d.parts) {
    const [x, y] = p.at;
    if (x < 0 || y < 0 || x > d.width || y > d.height)
      e.push(where(`part ${p.id} marker is off the diagram`));
    if (p.description.length < 30) e.push(where(`part ${p.id} needs a fuller description`));
  }
  for (const s of d.shapes)
    if (s.part && !ids.has(s.part)) e.push(where(`shape refers to unknown part ${s.part}`));
  return e;
}

/** Checks an upgrade against the library concept it improves. */
export function validateLibraryUpgrade(
  id: string,
  up: LibraryUpgrade,
  base: Concept | undefined,
): string[] {
  const at = (s: string) => `${id} (upgrade): ${s}`;
  if (!base) return [at('unknown concept')];
  const e: string[] = [];
  if (up.steps.length !== base.steps.length)
    e.push(at(`has ${up.steps.length} steps but the concept has ${base.steps.length}`));
  for (const [title, text] of up.steps) {
    if (!title) e.push(at('step missing a title'));
    if (text.length < 80) e.push(at(`step “${title}” is too short to be a fuller explanation`));
  }
  if (up.goDeeperMore.length < 200) e.push(at('goDeeperMore is too short'));
  for (const d of up.diagrams ?? []) e.push(...validateDiagram(d, at));
  return e;
}

export function validateMystery(m: Mystery, conceptIds: Set<string>): string[] {
  const e: string[] = [];
  const at = (s: string) => `${m.id}: ${s}`;
  for (const r of m.requires) if (!conceptIds.has(r)) e.push(at(`requires unknown concept ${r}`));
  if (m.requires.length < 2) e.push(at('should combine 2+ concepts'));
  if (m.clues.length < 3) e.push(at('needs 3+ clues'));
  if (m.answer < 0 || m.answer >= m.explanations.length) e.push(at('answer out of range'));
  if (!m.evidence.some((x) => x.supports)) e.push(at('needs supporting evidence'));
  if (!m.evidence.some((x) => !x.supports)) e.push(at('needs red-herring evidence'));
  for (const c of m.clues) {
    if (c.kind === 'slider') {
      for (const v of exprVariables(c.expr)) if (v !== 'x') e.push(at(`clue ${c.id} uses ${v}`));
    }
  }
  return e;
}

/** Grid-search the slider inputs to check a challenge target is achievable. */
function sliderTargetReachable(
  c: Extract<Concept['interaction'], { template: 'slider-sim' }>['config'],
  target: { min?: number; max?: number },
): boolean {
  const steps = c.inputs.length > 2 ? 12 : 40;
  const grids = c.inputs.map((i) =>
    Array.from({ length: steps + 1 }, (_, k) => i.min + ((i.max - i.min) * k) / steps),
  );
  const vals: Record<string, number> = {};
  const search = (d: number): boolean => {
    if (d === c.inputs.length) {
      const out = Math.max(0, Math.min(c.output.max, evalExpr(c.output.expr, vals)));
      return (
        (target.min === undefined || out >= target.min) &&
        (target.max === undefined || out <= target.max)
      );
    }
    return grids[d].some((v) => {
      vals[c.inputs[d].id] = v;
      return search(d + 1);
    });
  };
  return search(0);
}
