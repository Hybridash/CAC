"use client";

import { useActionState, useState } from "react";
import { createUser, resetPassword } from "@/app/actions/admin";
import { Alert, Button, Field, Input, Select } from "@/components/ui";

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUser, undefined);
  const [role, setRole] = useState("TEACHER");
  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {state?.success && <Alert tone="success">{state.success}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="cu-name"><Input id="cu-name" name="name" required /></Field>
        <Field label="Email" htmlFor="cu-email"><Input id="cu-email" name="email" type="email" required /></Field>
        <Field label="Role" htmlFor="cu-role">
          <Select id="cu-role" name="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="TEACHER">Teacher</option>
            <option value="SUBSTITUTE">Substitute</option>
            <option value="ADMIN">School admin</option>
          </Select>
        </Field>
        <Field label="Temporary password" htmlFor="cu-password" hint="At least 10 characters. Share it privately.">
          <Input id="cu-password" name="password" type="text" autoComplete="off" minLength={10} required />
        </Field>
        {role === "TEACHER" && (
          <>
            <Field label="Room (optional)" htmlFor="cu-room"><Input id="cu-room" name="room" /></Field>
            <Field label="Subject or grade (optional)" htmlFor="cu-subject"><Input id="cu-subject" name="subject" /></Field>
          </>
        )}
        {role === "SUBSTITUTE" && <Field label="Phone (optional)" htmlFor="cu-phone"><Input id="cu-phone" name="phone" type="tel" /></Field>}
      </div>
      <div><Button type="submit" disabled={pending}>{pending ? "Creating..." : "Create account"}</Button></div>
    </form>
  );
}

export function ResetPasswordForm({ userId, name }: { userId: string; name: string }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  const [open, setOpen] = useState(false);
  if (!open) return <Button type="button" variant="ghost" onClick={() => setOpen(true)}>Reset password</Button>;
  return (
    <form action={action} className="flex w-full flex-col gap-2 sm:w-auto">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {state?.success && <Alert tone="success">{state.success}</Alert>}
      <input type="hidden" name="userId" value={userId} />
      <label htmlFor={`pw-${userId}`} className="sr-only">New password for {name}</label>
      <div className="flex gap-2">
        <Input id={`pw-${userId}`} name="password" type="text" autoComplete="off" minLength={10} placeholder="New temporary password" required />
        <Button type="submit" variant="secondary" disabled={pending}>Set</Button>
      </div>
    </form>
  );
}
