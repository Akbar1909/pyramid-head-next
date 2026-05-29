/** True when HTML has no meaningful text (empty editor, `<p></p>`, whitespace). */
export function isHtmlContentEmpty(html: string): boolean {
  const trimmed = html.trim();
  if (!trimmed || trimmed === "<p></p>") {
    return true;
  }
  if (typeof document === "undefined") {
    return !trimmed.replace(/<[^>]*>/g, "").trim();
  }
  const doc = new DOMParser().parseFromString(trimmed, "text/html");
  return (doc.body.textContent || "").trim().length === 0;
}
