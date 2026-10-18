import sanitizeHtml from "sanitize-html";

/** All rich text is sanitized on the server before it is stored. */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html ?? "", {
    allowedTags: ["h2", "h3", "h4", "p", "br", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "a", "blockquote", "hr", "code"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer nofollow" }),
      h1: "h2",
    },
  }).slice(0, 200_000);
}

export function isBlankHtml(html: string): boolean {
  return sanitizeHtml(html ?? "", { allowedTags: [], allowedAttributes: {} }).trim().length === 0;
}
