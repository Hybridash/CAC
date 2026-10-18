"use client";

import { useEffect } from "react";
import { markAllNotificationsRead } from "@/app/actions/notifications";

export function MarkNotificationsRead() {
  useEffect(() => {
    markAllNotificationsRead();
  }, []);
  return null;
}
