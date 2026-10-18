"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePlan, saveTemplate, type BlockInput } from "@/app/actions/plans";
import { ELEMENTARY_SECTIONS, type SectionKey, type Sections } from "@/lib/sections";
import { RichTextEditor } from "./RichTextEditor";
import { FileManager, type FileItem } from "./FileManager";
import { BookIllustration, ChalkboardIllustration, ClipboardIllustration, FilesIllustration } from "./illustrations";
import { Icon } from "./icons";
import { Alert, Button, Card, Field, Input, SectionTitle, Select } from "./ui";

type Block = BlockInput & { key: string };
export type TemplateOption = { id: string; name: string; directionsHtml: string; sections: Sections; blocks: BlockInput[] };
export type PeriodOption = { id: string; name: string; startTime: string; endTime: string };
/** Who covers what on this plan's date. periodId null = a full-day substitute. */
export type CoverageEntry = { periodId: string | null; subName: string };
export type Level = "ELEMENTARY" | "SECONDARY";

type Initial = { directionsHtml: string; sections: Sections; blocks: BlockInput[] };
type Props = { periods: PeriodOption[]; level: Level } & (
  | {
      mode: "plan";
      planId: string;
      coverage: CoverageEntry[];
      initial: Initial & { title: string };
      files: FileItem[];
      templates: TemplateOption[];
      maxUploadMb: number;
      accept: string;
    }
  | { mode: "template"; templateId: string; initial: Initial & { name: string } }
);

let keySeq = 0;
const withKey = (b: BlockInput): Block => ({ ...b, key: `b${++keySeq}` });
const blockFor = (p: PeriodOption | undefined, n: number): BlockInput =>
  p
    ? { periodId: p.id, label: p.name, startTime: p.startTime, endTime: p.endTime, location: "", lessonHtml: "" }
    : { periodId: null, label: `Block ${n}`, startTime: "", endTime: "", location: "", lessonHtml: "" };

const iconButton = "flex size-11 items-center justify-center rounded-lg text-muted hover:bg-primary-soft disabled:opacity-40";

export function PlanEditor(props: Props) {
  const router = useRouter();
  const elementary = props.level === "ELEMENTARY";
  const [title, setTitle] = useState(props.mode === "plan" ? props.initial.title : props.initial.name);
  const [directions, setDirections] = useState(props.initial.directionsHtml);
  const [sections, setSections] = useState<Sections>(props.initial.sections);
  const [blocks, setBlocks] = useState<Block[]>(() => props.initial.blocks.map(withKey));
  const [version, setVersion] = useState(0); // remounts editors when a template is applied
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [saving, startSaving] = useTransition();
  const [templateChoice, setTemplateChoice] = useState("");
  const [newTemplateName, setNewTemplateName] = useState("");
  const snapshot = JSON.stringify({ title, directions, sections, blocks: blocks.map(({ key: _k, ...b }) => b) });
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot);
  const dirty = snapshot !== savedSnapshot;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (key: string, patch: Partial<BlockInput>) => setBlocks((bs) => bs.map((b) => (b.key === key ? { ...b, ...patch } : b)));
  const setSection = (key: SectionKey, html: string) => setSections((s) => ({ ...s, [key]: html }));
  const move = (i: number, dir: -1 | 1) =>
    setBlocks((bs) => {
      const j = i + dir;
      if (j < 0 || j >= bs.length) return bs;
      const next = [...bs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const coverage = props.mode === "plan" ? props.coverage : [];
  const fullDaySubs = coverage.filter((c) => c.periodId === null).map((c) => c.subName);
  const coveredBy = (periodId: string | null | undefined) =>
    [...fullDaySubs, ...(periodId ? coverage.filter((c) => c.periodId === periodId).map((c) => c.subName) : [])];
  const needsLesson = blocks.filter((b) => !b.lessonHtml && coveredBy(b.periodId).length > 0);
  const files = props.mode === "plan" ? props.files : [];
  const periodName = (id: string | null) => props.periods.find((p) => p.id === id)?.name;

  function choosePeriod(b: Block, periodId: string) {
    const prev = props.periods.find((p) => p.id === b.periodId);
    const next = props.periods.find((p) => p.id === periodId);
    const patch: Partial<BlockInput> = { periodId: next?.id ?? null };
    // Fill name and times from the bell schedule unless the teacher customized them.
    if (next && (!b.label || b.label === prev?.name || /^Block \d+$/.test(b.label))) patch.label = next.name;
    if (next && (!b.startTime || b.startTime === prev?.startTime)) patch.startTime = next.startTime;
    if (next && (!b.endTime || b.endTime === prev?.endTime)) patch.endTime = next.endTime;
    update(b.key, patch);
  }

  const payload = () => ({ directionsHtml: directions, sections, blocks: blocks.map(({ key: _k, ...b }) => b) });

  function save() {
    const submitted = snapshot;
    startSaving(async () => {
      const res =
        props.mode === "plan"
          ? await savePlan(props.planId, { title, ...payload() })
          : await saveTemplate(props.templateId, { name: title, ...payload() });
      if (res.ok) {
        setSavedSnapshot(submitted);
        setStatus({ tone: "success", text: props.mode === "plan" ? "Saved. Your substitute will see the latest version." : "Template saved." });
        router.refresh();
      } else {
        setStatus({ tone: "error", text: res.error });
      }
    });
  }

  function applyTemplate() {
    if (props.mode !== "plan") return;
    const t = props.templates.find((x) => x.id === templateChoice);
    if (!t) return;
    if (!window.confirm(`Replace this plan's schedule and directions with "${t.name}"? Uploaded files are kept.`)) return;
    setDirections(t.directionsHtml);
    setSections(t.sections);
    setBlocks(t.blocks.map(withKey));
    setVersion((v) => v + 1);
  }

  function saveAsTemplate() {
    const name = newTemplateName.trim();
    if (!name) return setStatus({ tone: "error", text: "Give the template a name first." });
    startSaving(async () => {
      const res = await saveTemplate(null, { name, ...payload() });
      setStatus(res.ok ? { tone: "success", text: `Saved as template "${name}".` } : { tone: "error", text: res.error });
      if (res.ok) {
        setNewTemplateName("");
        router.refresh();
      }
    });
  }

  // Day-level files, plus any period files whose period no longer has a block in this plan.
  const blockPeriods = new Set(blocks.map((b) => b.periodId).filter(Boolean));
  const dayFiles = files.filter((f) => f.periodId === null || !blockPeriods.has(f.periodId));

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <Field label={props.mode === "plan" ? "Plan title (optional)" : "Template name"} htmlFor="plan-title">
          <Input
            id="plan-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={props.mode === "plan" ? 140 : 80}
            placeholder={props.mode === "plan" ? (elementary ? "e.g. Pumpkin math and fall writing" : "e.g. Cells review and microscope practice") : "e.g. Standard Sub Directions"}
          />
        </Field>
        {props.mode === "plan" && props.templates.length > 0 && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="Start from a template" htmlFor="template-choice">
                <Select id="template-choice" value={templateChoice} onChange={(e) => setTemplateChoice(e.target.value)}>
                  <option value="">Choose a template</option>
                  {props.templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Button type="button" variant="secondary" onClick={applyTemplate} disabled={!templateChoice}>Apply template</Button>
          </div>
        )}
      </Card>

      <Card aria-labelledby="schedule-heading">
        <SectionTitle id="schedule-heading" illustration={elementary ? <BookIllustration /> : <ChalkboardIllustration />}>
          {elementary ? "Daily schedule" : "Lesson plans by period"}
        </SectionTitle>
        {elementary ? (
          <p className="mb-4 text-muted">
            {props.mode === "plan" && fullDaySubs.length
              ? `${fullDaySubs.join(" and ")} will cover your whole day. `
              : "One substitute covers your whole day. "}
            List each part of the day and what students should do.
          </p>
        ) : (
          <p className="mb-4 text-muted">
            Write a lesson plan for each period and add that period&apos;s seating chart. Each substitute only sees the periods they cover.
          </p>
        )}
        <ol className="flex flex-col gap-4">
          {blocks.map((b, i) => {
            const name = b.label || `block ${i + 1}`;
            const subs = coveredBy(b.periodId);
            return (
              <li key={b.key} className="rounded-xl border border-line bg-canvas p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    {props.mode !== "plan" || elementary ? (
                      <p className="font-semibold text-muted">{elementary ? `Part ${i + 1} of the day` : `Block ${i + 1}`}</p>
                    ) : subs.length ? (
                      <p className="font-semibold text-primary-strong">Covered by {subs.join(" and ")}</p>
                    ) : (
                      <p className="font-semibold text-muted">No substitute assigned for this {b.periodId ? "period" : "block"} yet</p>
                    )}
                    {props.mode === "plan" && !b.lessonHtml && subs.length > 0 && <p className="text-sm font-medium text-accent-strong">Lesson plan needed</p>}
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={iconButton} aria-label={`Move ${name} up`}><Icon name="up" /></button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} className={iconButton} aria-label={`Move ${name} down`}><Icon name="down" /></button>
                    <button
                      type="button"
                      onClick={() => (b.lessonHtml === "" || window.confirm(`Remove "${b.label}"?`)) && setBlocks((bs) => bs.filter((x) => x.key !== b.key))}
                      className="flex size-11 items-center justify-center rounded-lg text-accent hover:bg-accent-soft"
                      aria-label={`Remove ${name}`}
                    >
                      <Icon name="trash" />
                    </button>
                  </div>
                </div>
                <div className={elementary ? "grid gap-3 sm:grid-cols-[2fr_1fr_1fr_2fr]" : "grid gap-3 sm:grid-cols-[2fr_2fr_1fr_1fr_2fr]"}>
                  {!elementary && (
                    <Field label="Period" htmlFor={`${b.key}-period`}>
                      <Select id={`${b.key}-period`} value={b.periodId ?? ""} onChange={(e) => choosePeriod(b, e.target.value)}>
                        {props.periods.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                        <option value="">Not a class period</option>
                      </Select>
                    </Field>
                  )}
                  <Field label={elementary ? "Subject or activity" : "Name"} htmlFor={`${b.key}-label`}>
                    <Input id={`${b.key}-label`} value={b.label} onChange={(e) => update(b.key, { label: e.target.value })} maxLength={80} required />
                  </Field>
                  <Field label="Starts" htmlFor={`${b.key}-start`}>
                    <Input id={`${b.key}-start`} type="time" value={b.startTime} onChange={(e) => update(b.key, { startTime: e.target.value })} />
                  </Field>
                  <Field label="Ends" htmlFor={`${b.key}-end`}>
                    <Input id={`${b.key}-end`} type="time" value={b.endTime} onChange={(e) => update(b.key, { endTime: e.target.value })} />
                  </Field>
                  <Field label="Room or place" htmlFor={`${b.key}-loc`}>
                    <Input id={`${b.key}-loc`} value={b.location} onChange={(e) => update(b.key, { location: e.target.value })} maxLength={80} />
                  </Field>
                </div>
                <div className="mt-3">
                  <p className="mb-1.5 font-semibold">{elementary ? "What to do" : "Lesson plan"}</p>
                  <RichTextEditor
                    key={`${b.key}-${version}`}
                    id={`${b.key}-lesson`}
                    label={`Lesson plan for ${name}`}
                    value={b.lessonHtml}
                    onChange={(html) => update(b.key, { lessonHtml: html })}
                    placeholder="What should students do? Where are the materials?"
                  />
                </div>
                {props.mode === "plan" && !elementary && (
                  <div className="mt-4">
                    <p className="mb-1.5 font-semibold">Seating chart and files for {b.label || "this period"}</p>
                    {b.periodId ? (
                      <FileManager
                        compact
                        planId={props.planId}
                        files={files.filter((f) => f.periodId === b.periodId)}
                        periodId={b.periodId}
                        scopeLabel={b.label || periodName(b.periodId) || "this period"}
                        maxUploadMb={props.maxUploadMb}
                        accept={props.accept}
                      />
                    ) : (
                      <p className="text-muted">Choose a period above to attach a seating chart or files. Whole-day files go in the Files section below.</p>
                    )}
                    {b.periodId && <p className="mt-1 text-sm text-muted">Only the substitute covering {periodName(b.periodId) ?? "this period"} can see these.</p>}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() =>
            setBlocks((bs) => [
              ...bs,
              withKey(elementary ? blockFor(undefined, bs.length + 1) : blockFor(props.periods.find((p) => !bs.some((b) => b.periodId === p.id)), bs.length + 1)),
            ])
          }
          disabled={blocks.length >= 20}
        >
          <Icon name="plus" /> {elementary ? "Add to schedule" : "Add period"}
        </Button>
      </Card>

      {elementary &&
        ELEMENTARY_SECTIONS.map((sec) => (
          <Card key={sec.key} aria-labelledby={`${sec.key}-heading`}>
            <SectionTitle id={`${sec.key}-heading`} illustration={<ClipboardIllustration />}>{sec.title}</SectionTitle>
            <p className="mb-3 text-muted">{sec.hint}</p>
            <RichTextEditor key={`${sec.key}-${version}`} id={sec.key} label={sec.title} value={sections[sec.key] ?? ""} onChange={(html) => setSection(sec.key, html)} />
          </Card>
        ))}

      <Card aria-labelledby="directions-heading">
        <SectionTitle id="directions-heading" illustration={<ClipboardIllustration />}>{elementary ? "Other directions" : "General directions"}</SectionTitle>
        <p className="mb-3 text-muted">
          {elementary
            ? "Emergency procedures, allergies and medical notes, where materials are. Every part of the day can see this."
            : "Attendance, emergency procedures, helpful students, where materials are. Every substitute covering this day sees this."}
        </p>
        <RichTextEditor key={`directions-${version}`} id="directions" label="General directions" value={directions} onChange={setDirections} placeholder="Start typing your directions" />
      </Card>

      {props.mode === "plan" && (
        <Card aria-labelledby="files-heading">
          <SectionTitle id="files-heading" illustration={<FilesIllustration />}>{elementary ? "Class seating chart and files" : "Files for the whole day"}</SectionTitle>
          <p className="mb-3 text-muted">
            {elementary ? "Your substitute can open these from their phone." : "Every substitute covering this day can see these. Put period seating charts in each period above."}
          </p>
          <FileManager
            planId={props.planId}
            files={dayFiles}
            periodId={null}
            scopeLabel="the whole day"
            noteFor={(f) => (f.periodId ? `Only the ${periodName(f.periodId) ?? "period"} substitute` : undefined)}
            maxUploadMb={props.maxUploadMb}
            accept={props.accept}
          />
        </Card>
      )}

      {props.mode === "plan" && (
        <Card>
          <Field label="Save this schedule and directions as a reusable template" htmlFor="new-template-name">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input id="new-template-name" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} placeholder="Template name" maxLength={80} />
              <Button type="button" variant="secondary" onClick={saveAsTemplate} disabled={saving}>Save as template</Button>
            </div>
          </Field>
        </Card>
      )}

      <div className="sticky bottom-20 z-10 flex flex-col gap-2 rounded-2xl border border-line bg-surface/95 p-3 backdrop-blur md:bottom-4 sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite" className="min-h-6">
          {props.mode === "plan" && !elementary && needsLesson.length > 0 && !status && (
            <p className="px-1 font-medium text-accent-strong">Lesson plan needed for {needsLesson.map((b) => b.label).join(", ")}.</p>
          )}
          {status && (!dirty || status.tone === "error") ? (
            <Alert tone={status.tone}>{status.text}</Alert>
          ) : (
            <p className="px-1 text-muted">{dirty ? "You have unsaved changes." : "All changes saved."}</p>
          )}
        </div>
        <Button type="button" onClick={save} disabled={saving || !dirty}>{saving ? "Saving..." : props.mode === "plan" ? "Save plan" : "Save template"}</Button>
      </div>
    </div>
  );
}
