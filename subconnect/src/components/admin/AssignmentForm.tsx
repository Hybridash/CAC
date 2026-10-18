"use client";

import { useActionState, useState } from "react";
import { saveAssignment } from "@/app/actions/admin";
import { Alert, Button, Field, Input, Select, Textarea } from "@/components/ui";

type Person = { id: string; name: string; detail?: string | null; elementary?: boolean };
type PeriodOption = { id: string; name: string; time: string };
type Props = {
  teachers: Person[];
  substitutes: Person[];
  periods: PeriodOption[];
  defaults: {
    id?: string;
    teacherId?: string;
    substituteId?: string;
    startDate: string;
    endDate: string;
    accessOpens: string;
    notes?: string;
    periodIds?: string[];
  };
  minDate?: string;
};

export function AssignmentForm({ teachers, substitutes, periods, defaults, minDate }: Props) {
  const [state, action, pending] = useActionState(saveAssignment, undefined);
  const [coverage, setCoverage] = useState(defaults.periodIds?.length ? "periods" : "full");
  const [teacherId, setTeacherId] = useState(defaults.teacherId ?? "");
  const elementary = teachers.find((t) => t.id === teacherId)?.elementary ?? false;
  const name = defaults.id ?? "new";
  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {state?.success && <Alert tone="success">{state.success}</Alert>}
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Teacher" htmlFor="teacherId">
          <Select id="teacherId" name="teacherId" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required>
            <option value="" disabled>Choose a teacher</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}{t.detail ? ` (${t.detail})` : ""}</option>)}
          </Select>
        </Field>
        <Field label="Substitute" htmlFor="substituteId">
          <Select id="substituteId" name="substituteId" defaultValue={defaults.substituteId ?? ""} required>
            <option value="" disabled>Choose a substitute</option>
            {substitutes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="First day" htmlFor="startDate">
          <Input id="startDate" name="startDate" type="date" defaultValue={defaults.startDate} min={minDate} required />
        </Field>
        <Field label="Last day" htmlFor="endDate" hint="Same as the first day for a single day.">
          <Input id="endDate" name="endDate" type="date" defaultValue={defaults.endDate} min={minDate} required />
        </Field>
      </div>
      {elementary ? (
        <>
          <input type="hidden" name="coverage" value="full" />
          <Alert tone="info">This is an elementary classroom, so one substitute covers the whole day.</Alert>
        </>
      ) : (
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 font-semibold">What does this substitute cover?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            ["full", "Full day", "Every period, plus all general directions"],
            ["periods", "Specific periods", "Another sub can cover the other periods"],
          ].map(([value, label, hint]) => (
            <label key={value} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-line bg-surface p-3 has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
              <input type="radio" name="coverage" value={value} checked={coverage === value} onChange={() => setCoverage(value)} className="mt-1 size-5 accent-[#3f5f8f]" />
              <span><span className="block font-medium">{label}</span><span className="text-sm text-muted">{hint}</span></span>
            </label>
          ))}
        </div>
        {coverage === "periods" &&
          (periods.length === 0 ? (
            <Alert tone="info">Add your bell schedule under School settings to assign by period.</Alert>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {periods.map((p) => (
                <label key={p.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-line bg-surface px-3 has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
                  <input type="checkbox" name="periodIds" value={p.id} defaultChecked={defaults.periodIds?.includes(p.id)} className="size-5 accent-[#3f5f8f]" aria-describedby={`${name}-${p.id}-time`} />
                  <span className="font-medium">{p.name}</span>
                  <span id={`${name}-${p.id}-time`} className="ml-auto text-sm text-muted">{p.time}</span>
                </label>
              ))}
            </div>
          ))}
      </fieldset>
      )}
      <Field label="Substitute can see plans starting" htmlFor="accessOpens" hint="Access ends automatically at the end of the last day.">
        <Select id="accessOpens" name="accessOpens" defaultValue={defaults.accessOpens}>
          <option value="MORNING_OF">6:00 AM on the first day</option>
          <option value="EVENING_BEFORE">6:00 PM the evening before</option>
        </Select>
      </Field>
      <Field label="Notes (optional)" htmlFor="notes" hint="Shown to both the teacher and substitute. Do not include student information.">
        <Textarea id="notes" name="notes" defaultValue={defaults.notes} maxLength={1000} />
      </Field>
      <div>
        <Button type="submit" disabled={pending}>{pending ? "Saving..." : defaults.id ? "Save changes" : "Create assignment"}</Button>
      </div>
    </form>
  );
}
