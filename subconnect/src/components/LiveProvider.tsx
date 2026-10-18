"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Ctx = { unreadNotifications: number };
const LiveContext = createContext<Ctx>({ unreadNotifications: 0 });

export function useLive() {
  return useContext(LiveContext);
}

/**
 * Opens one Server-Sent Events connection per signed-in tab for user-level events
 * (new notifications, new chat messages, assignment changes) and refreshes server-rendered data.
 */
export function LiveProvider({ initialUnread, children }: { initialUnread: number; children: React.ReactNode }) {
  const [unread, setUnread] = useState(initialUnread);
  const router = useRouter();
  const pathname = usePathname();
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setUnread(initialUnread), [initialUnread]);
  useEffect(() => {
    if (pathname === "/notifications") setUnread(0);
  }, [pathname]);

  useEffect(() => {
    const es = new EventSource("/api/stream");
    es.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.type === "notification") setUnread((n) => n + 1);
      if (data.type === "notification" || data.type === "unread" || data.type === "assignment-changed") {
        // Debounce refreshes so a burst of events causes one re-render.
        if (refreshTimer.current) clearTimeout(refreshTimer.current);
        refreshTimer.current = setTimeout(() => router.refresh(), 400);
      }
    };
    return () => es.close();
  }, [router]);

  return <LiveContext.Provider value={{ unreadNotifications: unread }}>{children}</LiveContext.Provider>;
}
