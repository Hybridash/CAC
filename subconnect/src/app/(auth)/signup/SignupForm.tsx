"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import { Alert, Button, Field, Input } from "@/components/ui";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  if (state?.success) return <Alert tone="success">{state.success}</Alert>;
  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Full name" htmlFor="name">
        <Input id="name" name="name" autoComplete="name" required />
      </Field>
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password" htmlFor="password" hint="At least 10 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required />
      </Field>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 font-semibold">I am a</legend>
        {[
          ["TEACHER", "Classroom teacher"],
          ["SUBSTITUTE", "Substitute teacher"],
        ].map(([value, label]) => (
          <label key={value} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-line bg-surface px-3 has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
            <input type="radio" name="role" value={value} required className="size-5 accent-[#3f5f8f]" />
            {label}
          </label>
        ))}
      </fieldset>
      <Field label="School join code" htmlFor="joinCode" hint="Ask your school office for this code.">
        <Input id="joinCode" name="joinCode" autoCapitalize="characters" required />
      </Field>
      <Button type="submit" disabled={pending}>{pending ? "Sending..." : "Request account"}</Button>
    </form>
  );
}
