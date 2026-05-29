import sanitizeHtml from "sanitize-html";

const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "s",
    "strike",
    "h1",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
    "img",
    "code",
    "pre",
    "hr",
    "span",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "class"],
    "*": ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    img: ["http", "https"],
  },
  allowProtocolRelative: false,
};

type Props = {
  html: string;
  className?: string;
};

/** Renders TipTap CMS HTML after sanitization (admin preview, etc.). */
export function SanitizedHtmlBody({ html, className = "" }: Props) {
  const safe = sanitizeHtml(html, SANITIZE);
  return (
    <div
      className={`cms-html-preview text-slate-800 ${className}`.trim()}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized with sanitize-html (trusted CMS output).
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
