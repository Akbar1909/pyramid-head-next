import { SanitizedHtmlBody } from "@/components/sanitized-html-body";
import { requirementsArrayToDisplayHtml } from "@/lib/faculty-program-requirements";

type Props = {
  items: string[];
  className?: string;
};

export function FacultyProgramRequirementsBody({ items, className }: Props) {
  const html = requirementsArrayToDisplayHtml(items);
  if (!html) {
    return null;
  }
  return (
    <SanitizedHtmlBody
      html={html}
      className={
        className ??
        "text-sm leading-relaxed text-zinc-700 [&_a]:text-amber-800 [&_a]:underline [&_li]:marker:text-zinc-500 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
      }
    />
  );
}
