"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Alert, Button, Field, Input } from "@/components/ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" disabled={pending}>{pending ? "Signing in..." : "Sign in"}</Button>
    </form>
  );
}
