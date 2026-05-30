function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hasHtmlMarkup(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}

function richHtmlToPayload(html: string): string | null {
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/\u00a0/g, " ")
    .trim();
  if (!text.length) {
    return null;
  }
  return html.trimEnd();
}

/** Load API `string[]` into a TipTap HTML value. */
export function requirementsArrayToEditorHtml(
  items: string[] | undefined,
): string {
  const list = (items ?? []).filter(Boolean);
  if (list.length === 0) {
    return "";
  }
  if (list.length === 1) {
    return list[0];
  }
  if (list.every((item) => !hasHtmlMarkup(item))) {
    return `<ul>${list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }
  return list.join("");
}

/** Save TipTap HTML back to API `string[]` (single HTML block). */
export function editorHtmlToRequirementsArray(html: string): string[] {
  const payload = richHtmlToPayload(html);
  return payload ? [payload] : [];
}

/** Render requirements on the public site. */
export function requirementsArrayToDisplayHtml(
  items: string[] | undefined,
): string {
  const list = (items ?? []).filter(Boolean);
  if (list.length === 0) {
    return "";
  }
  if (list.length === 1) {
    return list[0];
  }
  if (list.every((item) => !hasHtmlMarkup(item))) {
    return `<ul>${list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }
  return list.join("");
}
