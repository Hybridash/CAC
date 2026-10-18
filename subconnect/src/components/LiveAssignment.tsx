"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Refreshes the server-rendered plan when the teacher edits it, and when access ends. */
export function LiveAssignment({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  useEffect(() => {
    const es = new EventSource(`/api/assignments/${assignmentId}/stream`);
    es.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.type === "plan-updated" || data.type === "access-ended") router.refresh();
      if (data.type === "access-ended") es.close();
    };
    return () => es.close();
  }, [assignmentId, router]);
  return null;
}
