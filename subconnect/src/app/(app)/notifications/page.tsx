import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/time";
import { MarkNotificationsRead } from "@/components/MarkNotificationsRead";
import { BellIllustration } from "@/components/illustrations";
import { Card, cx, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return (
    <>
      <MarkNotificationsRead />
      <PageHeader title="Notifications" illustration={<BellIllustration />} />
      {items.length === 0 ? (
        <Card><EmptyState illustration={<BellIllustration title="A bell" />} title="You're all caught up" /></Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((n) => {
            const body = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{n.title}</p>
                  {!n.readAt && <span className="mt-2 size-2.5 shrink-0 rounded-full bg-accent" aria-label="New" />}
                </div>
                <p>{n.body}</p>
                <p className="text-sm text-muted">{formatDateTime(n.createdAt, user.school.timezone)}</p>
              </>
            );
            const cls = cx("block rounded-xl border bg-surface p-4", n.readAt ? "border-line" : "border-primary-tint bg-primary-soft/40");
            return <li key={n.id}>{n.link ? <Link href={n.link} className={cx(cls, "hover:border-primary-tint")}>{body}</Link> : <div className={cls}>{body}</div>}</li>;
          })}
        </ul>
      )}
    </>
  );
}
