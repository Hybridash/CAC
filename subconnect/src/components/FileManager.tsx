"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";
import { Alert, buttonClass, cx } from "./ui";
import { fileKind, formatBytes } from "@/lib/format";

export type FileItem = { id: string; originalName: string; mimeType: string; size: number; periodId: string | null; kind: "FILE" | "SEATING_CHART" };

type Props = {
  planId: string;
  /** Files to list here (already filtered by the caller). */
  files: FileItem[];
  maxUploadMb: number;
  accept: string;
  /** Uploads made here are limited to this period's substitute. Null = every substitute that day. */
  periodId: string | null;
  /** Used in accessible labels, e.g. "Period 2" or "the whole day". */
  scopeLabel: string;
  /** Optional per-file note (e.g. which period an orphaned file belongs to). */
  noteFor?: (f: FileItem) => string | undefined;
  compact?: boolean;
};

/** Teacher-side upload/delete. Files are sent to the server, validated, and stored privately. */
export function FileManager({ planId, files, maxUploadMb, accept, periodId, scopeLabel, noteFor, compact }: Props) {
  const [busy, setBusy] = useState<"FILE" | "SEATING_CHART" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const kindRef = useRef<"FILE" | "SEATING_CHART">("FILE");
  const router = useRouter();

  function pick(kind: "FILE" | "SEATING_CHART") {
    kindRef.current = kind;
    inputRef.current?.click();
  }

  async function upload(list: FileList | null) {
    if (!list?.length) return;
    const kind = kindRef.current;
    setError(null);
    setBusy(kind);
    try {
      for (const file of Array.from(list)) {
        if (file.size > maxUploadMb * 1024 * 1024) {
          setError(`"${file.name}" is larger than ${maxUploadMb} MB.`);
          continue;
        }
        const form = new FormData();
        form.append("file", file);
        form.append("kind", kind);
        if (periodId) form.append("periodId", periodId);
        const res = await fetch(`/api/plans/${planId}/files`, { method: "POST", body: form });
        if (!res.ok) setError((await res.json().catch(() => null))?.error ?? `"${file.name}" couldn't be uploaded.`);
      }
      router.refresh();
    } finally {
      setBusy(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(f: FileItem) {
    if (!window.confirm(`Delete "${f.originalName}"?`)) return;
    const res = await fetch(`/api/files/${f.id}`, { method: "DELETE" });
    if (!res.ok) setError("That file couldn't be deleted.");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <Alert tone="error">{error}</Alert>}
      {files.length > 0 && (
        <ul className={cx("divide-y divide-line rounded-xl border border-line", compact && "bg-surface")}>
          {files.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {f.kind === "SEATING_CHART" && <span className="mr-2 rounded-full bg-primary-soft px-2 py-0.5 text-sm font-semibold text-primary-strong">Seating chart</span>}
                  {f.originalName}
                </p>
                <p className="text-sm text-muted">
                  {fileKind(f.mimeType)} · {formatBytes(f.size)}
                  {noteFor?.(f) && ` · ${noteFor(f)}`}
                </p>
              </div>
              <div className="flex gap-1">
                <a href={`/api/files/${f.id}`} target="_blank" rel="noopener" className={buttonClass("ghost", "min-h-11 px-3")}>
                  <Icon name="eye" /> Open
                </a>
                <button type="button" onClick={() => remove(f)} className={buttonClass("ghost", "min-h-11 px-3 text-accent hover:bg-accent-soft")} aria-label={`Delete ${f.originalName}`}>
                  <Icon name="trash" /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => pick("SEATING_CHART")} disabled={!!busy} className={buttonClass("secondary")} aria-label={`Add seating chart for ${scopeLabel}`}>
          <Icon name="upload" /> {busy === "SEATING_CHART" ? "Uploading..." : "Add seating chart"}
        </button>
        <button type="button" onClick={() => pick("FILE")} disabled={!!busy} className={buttonClass("secondary")} aria-label={`Add file for ${scopeLabel}`}>
          <Icon name="upload" /> {busy === "FILE" ? "Uploading..." : "Add file"}
        </button>
        <input ref={inputRef} type="file" multiple accept={accept} className="hidden" tabIndex={-1} aria-hidden="true" onChange={(e) => upload(e.target.files)} />
      </div>
      {!compact && <p className="text-sm text-muted">PDF, Word, PowerPoint, or images. Up to {maxUploadMb} MB each.</p>}
    </div>
  );
}
