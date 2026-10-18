import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logout } from "@/app/actions/auth";
import { LiveProvider } from "@/components/LiveProvider";
import { BellLink, DesktopNav, MobileNav, type NavItem } from "@/components/Nav";
import { Icon } from "@/components/icons";

const NAV: Record<string, NavItem[]> = {
  ADMIN: [
    { href: "/admin", label: "Home", icon: "home", exact: true },
    { href: "/admin/assignments", label: "Assignments", icon: "calendar" },
    { href: "/admin/people", label: "People", icon: "people" },
    { href: "/admin/settings", label: "School", icon: "gear" },
  ],
  TEACHER: [
    { href: "/teacher", label: "Home", icon: "home", exact: true },
    { href: "/teacher/plans", label: "Sub Plans", icon: "doc" },
    { href: "/teacher/templates", label: "Templates", icon: "clipboard" },
  ],
  SUBSTITUTE: [{ href: "/sub", label: "Assignments", icon: "calendar" }],
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unread = await prisma.notification.count({ where: { userId: user.id, readAt: null } });
  const items = NAV[user.role];
  const roleLabel = user.role === "ADMIN" ? "School admin" : user.role === "TEACHER" ? "Teacher" : "Substitute";

  return (
    <LiveProvider initialUnread={unread}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
          <div className="flex items-center gap-6">
            <Link href={items[0].href} className="text-lg font-bold tracking-tight text-primary-strong">SubConnect</Link>
            <DesktopNav items={items} />
          </div>
          <div className="flex items-center gap-1">
            <BellLink />
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-[15px] font-semibold">{user.name}</p>
              <p className="text-sm text-muted">{roleLabel} · {user.school.name}</p>
            </div>
            <form action={logout}>
              <button type="submit" className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-muted hover:bg-primary-soft hover:text-primary-strong">
                <Icon name="logout" />
                <span className="text-[15px] font-medium">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 pt-6 pb-28 md:pb-12">
        {children}
      </main>
      <MobileNav items={items} />
    </LiveProvider>
  );
}
