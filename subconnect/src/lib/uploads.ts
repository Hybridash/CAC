/** Upload validation: extension allowlist + magic-byte check + size limit. No SVG/HTML (script risk). */

export const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_MB ?? 15) * 1024 * 1024;

type Kind = { mime: string; check: (b: Buffer) => boolean; inline: boolean };

const startsWith = (b: Buffer, bytes: number[]) => bytes.every((v, i) => b[i] === v);
const isZip = (b: Buffer) => startsWith(b, [0x50, 0x4b, 0x03, 0x04]);
const isOle = (b: Buffer) => startsWith(b, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const zipHas = (b: Buffer, name: string) => isZip(b) && b.includes(Buffer.from(name));

const KINDS: Record<string, Kind> = {
  pdf: { mime: "application/pdf", check: (b) => startsWith(b, [0x25, 0x50, 0x44, 0x46]), inline: true },
  png: { mime: "image/png", check: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47]), inline: true },
  jpg: { mime: "image/jpeg", check: (b) => startsWith(b, [0xff, 0xd8, 0xff]), inline: true },
  jpeg: { mime: "image/jpeg", check: (b) => startsWith(b, [0xff, 0xd8, 0xff]), inline: true },
  gif: { mime: "image/gif", check: (b) => startsWith(b, [0x47, 0x49, 0x46, 0x38]), inline: true },
  webp: { mime: "image/webp", check: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP", inline: true },
  docx: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", check: (b) => zipHas(b, "word/"), inline: false },
  doc: { mime: "application/msword", check: isOle, inline: false },
  pptx: { mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", check: (b) => zipHas(b, "ppt/"), inline: false },
  ppt: { mime: "application/vnd.ms-powerpoint", check: isOle, inline: false },
};

export const ACCEPT_ATTR = Object.keys(KINDS).map((k) => `.${k}`).join(",");

export type UploadCheck = { ok: true; mime: string; ext: string } | { ok: false; error: string };

export function validateUpload(filename: string, bytes: Buffer): UploadCheck {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const kind = KINDS[ext];
  if (!kind) return { ok: false, error: "That file type isn't supported. Use PDF, Word, PowerPoint, or an image." };
  if (bytes.length === 0) return { ok: false, error: "That file is empty." };
  if (bytes.length > MAX_UPLOAD_BYTES) return { ok: false, error: `Files must be under ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.` };
  if (!kind.check(bytes)) return { ok: false, error: "That file's contents don't match its type." };
  return { ok: true, mime: kind.mime, ext };
}

export function isInlineViewable(mime: string) {
  return Object.values(KINDS).some((k) => k.mime === mime && k.inline);
}

export function cleanFilename(name: string) {
  const base = name.split(/[\\/]/).pop() ?? "file";
  return base.replace(/[^\w.\- ()]/g, "_").slice(0, 120) || "file";
}
