export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function fileKind(mime: string) {
  if (mime === "application/pdf") return "PDF";
  if (mime.startsWith("image/")) return "Image";
  if (mime.includes("word")) return "Word";
  if (mime.includes("presentation") || mime.includes("powerpoint")) return "PowerPoint";
  return "File";
}
