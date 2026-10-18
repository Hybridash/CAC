"use client";

import { useActionState } from "react";
import { updateSchool } from "@/app/actions/admin";
import { Alert, Button, Field, Input, Select } from "@/components/ui";

export function SchoolForm({ school, timezones }: { school: { name: string; timezone: string; defaultAccessOpens: string }; timezones: string[] }) {
  const [state, action, pending] = useActionState(updateSchool, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {state?.success && <Alert tone="success">{state.success}</Alert>}
      <Field label="School name" htmlFor="s-name"><Input id="s-name" name="name" defaultValue={school.name} required /></Field>
      <Field label="Timezone" htmlFor="s-tz" hint="Used to open and close substitute access at the right local time.">
        <Select id="s-tz" name="timezone" defaultValue={school.timezone}>
          {timezones.map((tz) => <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>)}
        </Select>
      </Field>
      <Field label="Default time substitutes can see plans" htmlFor="s-access" hint="Used as the default for new assignments.">
        <Select id="s-access" name="defaultAccessOpens" defaultValue={school.defaultAccessOpens}>
          <option value="MORNING_OF">6:00 AM on the first day</option>
          <option value="EVENING_BEFORE">6:00 PM the evening before</option>
        </Select>
      </Field>
      <div><Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save settings"}</Button></div>
    </form>
  );
}
