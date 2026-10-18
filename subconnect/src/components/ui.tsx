import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { AssignmentStatus } from "@/lib/access";

export function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 min-h-12 text-[16px] font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
const variants = {
  primary: "bg-accent text-white hover:bg-accent-strong",
  secondary: "bg-surface text-primary border border-primary-tint hover:bg-primary-soft",
  ghost: "text-primary hover:bg-primary-soft",
  danger: "bg-surface text-accent border border-accent/40 hover:bg-accent-soft",
};
export type ButtonVariant = keyof typeof variants;

export function buttonClass(variant: ButtonVariant = "primary", extra?: string) {
  return cx(buttonBase, variants[variant], extra);
}

export function Button({ variant = "primary", className, ...props }: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({ variant = "primary", className, ...props }: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section className={cx("rounded-2xl border border-line bg-surface p-5 sm:p-6", className)} {...props} />;
}

export function PageHeader({ title, subtitle, actions, illustration }: { title: string; subtitle?: ReactNode; actions?: ReactNode; illustration?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {illustration && <div className="hidden w-24 shrink-0 sm:block">{illustration}</div>}
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[1.7rem]">{title}</h1>
          {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function SectionTitle({ children, illustration, id }: { children: ReactNode; illustration?: ReactNode; id?: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      {illustration && <div className="w-10 shrink-0">{illustration}</div>}
      <h2 id={id} className="text-lg font-semibold">{children}</h2>
    </div>
  );
}

export function EmptyState({ illustration, title, children }: { illustration: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      <div className="mb-4 w-40">{illustration}</div>
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-1 max-w-md text-muted">{children}</div>}
    </div>
  );
}

const statusStyle: Record<AssignmentStatus, string> = {
  ACTIVE: "bg-ok-soft text-ok",
  UPCOMING: "bg-primary-soft text-primary-strong",
  PAST: "bg-canvas text-muted border border-line",
  CANCELLED: "bg-accent-soft text-accent-strong",
};
const statusLabel: Record<AssignmentStatus, string> = { ACTIVE: "Active", UPCOMING: "Upcoming", PAST: "Ended", CANCELLED: "Cancelled" };

export function StatusBadge({ status }: { status: AssignmentStatus }) {
  return <span className={cx("inline-block rounded-full px-3 py-0.5 text-sm font-semibold", statusStyle[status])}>{statusLabel[status]}</span>;
}

export function CountBadge({ count, label }: { count: number; label: string }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-accent px-2 text-sm font-bold text-white" aria-label={`${count} ${label}`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-semibold">{label}</label>
      {children}
      {hint && <p className="text-sm text-muted">{hint}</p>}
    </div>
  );
}

export const inputClass =
  "w-full min-h-12 rounded-lg border border-line bg-surface px-3 text-[16px] text-ink placeholder:text-muted/80 focus:border-primary";

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={cx(inputClass, props.className)} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={cx(inputClass, "pr-8", props.className)} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={cx(inputClass, "min-h-24 py-2", props.className)} />;
}

export function Alert({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: ReactNode }) {
  const style = tone === "error" ? "bg-accent-soft text-accent-strong border-accent/30" : tone === "success" ? "bg-ok-soft text-ok border-ok/30" : "bg-primary-soft text-primary-strong border-primary-tint";
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cx("rounded-lg border px-4 py-3", style)}>
      {children}
    </div>
  );
}

/** Renders server-sanitized HTML. Only ever pass content that went through sanitizeRichText(). */
export function RichText({ html, className }: { html: string; className?: string }) {
  return <div className={cx("prose-plan", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
