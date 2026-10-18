import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createBlankTemplate } from "@/app/actions/plans";
import { ClipboardIllustration } from "@/components/illustrations";
import { Button, Card, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Templates" };

export default async function TemplatesPage() {
  const user = await requireUser("TEACHER");
  const templates = await prisma.template.findMany({ where: { teacherId: user.id }, orderBy: { updatedAt: "desc" } });
  return (
    <>
      <PageHeader
        title="Templates"
        subtitle="Reusable schedules and directions, so you don't retype the same information."
        illustration={<ClipboardIllustration />}
        actions={<form action={createBlankTemplate}><Button type="submit">New template</Button></form>}
      />
      {templates.length === 0 ? (
        <Card>
          <EmptyState illustration={<ClipboardIllustration title="A clipboard" />} title="No templates yet">
            Create one here, or use &quot;Save as template&quot; at the bottom of any sub plan.
          </EmptyState>
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {templates.map((t) => (
            <li key={t.id}>
              <Link href={`/teacher/templates/${t.id}`} className="block h-full rounded-xl border border-line bg-surface p-4 hover:border-primary-tint hover:bg-primary-soft/40">
                <p className="text-lg font-semibold">{t.name}</p>
                <p className="text-sm text-muted">{Array.isArray(t.blocks) ? t.blocks.length : 0} periods · Updated {t.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
