"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePeriods } from "@/app/actions/admin";
import { Icon } from "@/components/icons";
import { Alert, Button, Input } from "@/components/ui";

type Row = { key: string; id?: string; name: string; startTime: string; endTime: string };
let seq = 0;

export function BellScheduleForm({ periods }: { periods: Array<{ id: string; name: string; startTime: string; endTime: string }> }) {
  const [rows, setRows] = useState<Row[]>(() => periods.map((p) => ({ ...p, key: p.id })));
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const update = (key: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const move = (i: number, d: -1 | 1) =>
    setRows((rs) => {
      const j = i + d;
      if (j < 0 || j >= rs.length) return rs;
      const next = [...rs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  function save() {
    start(async () => {
      const res = await savePeriods(rows.map(({ key: _k, ...r }) => r));
      setStatus(res?.error ? { tone: "error", text: res.error } : { tone: "success", text: res?.success ?? "Saved." });
      if (!res?.error) router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.length === 0 && <p className="text-muted">No periods yet. Add the periods in your school day.</p>}
      <ol className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <li key={r.key} className="grid grid-cols-[1fr_auto] gap-2 rounded-xl border border-line bg-canvas p-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor={`${r.key}-name`} className="text-sm font-semibold">Name</label>
              <Input id={`${r.key}-name`} value={r.name} onChange={(e) => update(r.key, { name: e.target.value })} maxLength={40} />
            </div>
            <div>
              <label htmlFor={`${r.key}-start`} className="text-sm font-semibold">Starts</label>
              <Input id={`${r.key}-start`} type="time" value={r.startTime} onChange={(e) => update(r.key, { startTime: e.target.value })} />
            </div>
            <div>
              <label htmlFor={`${r.key}-end`} className="text-sm font-semibold">Ends</label>
              <Input id={`${r.key}-end`} type="time" value={r.endTime} onChange={(e) => update(r.key, { endTime: e.target.value })} />
            </div>
            <div className="col-span-2 flex justify-end gap-1 sm:col-span-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="flex size-11 items-center justify-center rounded-lg text-muted hover:bg-primary-soft disabled:opacity-40" aria-label={`Move ${r.name || "period"} up`}><Icon name="up" /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="flex size-11 items-center justify-center rounded-lg text-muted hover:bg-primary-soft disabled:opacity-40" aria-label={`Move ${r.name || "period"} down`}><Icon name="down" /></button>
              <button type="button" onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))} className="flex size-11 items-center justify-center rounded-lg text-accent hover:bg-accent-soft" aria-label={`Remove ${r.name || "period"}`}><Icon name="trash" /></button>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => setRows((rs) => [...rs, { key: `n${++seq}`, name: `Period ${rs.length + 1}`, startTime: "", endTime: "" }])} disabled={rows.length >= 20}>
          <Icon name="plus" /> Add period
        </Button>
        <Button type="button" onClick={save} disabled={pending}>{pending ? "Saving..." : "Save bell schedule"}</Button>
      </div>
      <div aria-live="polite">{status && <Alert tone={status.tone}>{status.text}</Alert>}</div>
      <p className="text-sm text-muted">Removing a period hides it from new assignments and plans. Existing assignments keep it.</p>
    </div>
  );
}
