"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";
import { useLive } from "./LiveProvider";
import { cx } from "./ui";

export type NavItem = { href: string; label: string; icon: IconName; exact?: boolean };

function isCurrent(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
}

export function DesktopNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const current = isCurrent(pathname, item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cx("flex min-h-11 items-center gap-2 rounded-lg px-3 font-medium", current ? "bg-primary-soft text-primary-strong" : "text-muted hover:bg-primary-soft hover:text-primary-strong")}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { unreadNotifications } = useLive();
  const all: NavItem[] = [...items, { href: "/notifications", label: "Alerts", icon: "bell" }];
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${all.length}, minmax(0, 1fr))` }}>
        {all.map((item) => {
          const current = isCurrent(pathname, item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cx("relative flex min-h-16 flex-col items-center justify-center gap-0.5 text-[13px] font-medium", current ? "text-primary-strong" : "text-muted")}
              >
                <Icon name={item.icon} className="size-6" />
                {item.label}
                {item.href === "/notifications" && unreadNotifications > 0 && (
                  <span className="absolute top-2 left-1/2 ml-2 size-2.5 rounded-full bg-accent" aria-label={`${unreadNotifications} unread`} />
                )}
                {current && <span className="absolute top-0 h-1 w-10 rounded-b bg-primary" aria-hidden="true" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function BellLink() {
  const { unreadNotifications } = useLive();
  return (
    <Link
      href="/notifications"
      className="relative hidden min-h-11 min-w-11 items-center justify-center rounded-lg text-muted hover:bg-primary-soft hover:text-primary-strong md:flex"
      aria-label={unreadNotifications ? `Notifications, ${unreadNotifications} unread` : "Notifications"}
    >
      <Icon name="bell" className="size-6" />
      {unreadNotifications > 0 && (
        <span className="absolute top-1 right-1 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-white" aria-hidden="true">
          {unreadNotifications > 9 ? "9+" : unreadNotifications}
        </span>
      )}
    </Link>
  );
}
