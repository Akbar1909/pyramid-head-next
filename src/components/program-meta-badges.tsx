import type { FacultyProgramRow } from "@/lib/types";

type Props = {
  program: Pick<
    FacultyProgramRow,
    "duration" | "credentialType" | "format" | "practicumHours"
  >;
  labels: {
    duration: string;
    credential: string;
    format: string;
    practicum: string;
    practicumHours: (hours: number) => string;
  };
  theme?: "dark" | "light";
};

export function ProgramMetaBadges({
  program,
  labels,
  theme = "dark",
}: Props) {
  const items: string[] = [];
  if (program.duration?.trim()) {
    items.push(`${labels.duration}: ${program.duration}`);
  }
  if (program.credentialType?.trim()) {
    items.push(`${labels.credential}: ${program.credentialType}`);
  }
  if (program.format?.trim()) {
    items.push(`${labels.format}: ${program.format}`);
  }
  if (program.practicumHours != null) {
    items.push(labels.practicumHours(program.practicumHours));
  }
  if (items.length === 0) {
    return null;
  }
  const badgeClass =
    theme === "dark"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
      : "border-amber-200 bg-amber-50 text-amber-900";
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${badgeClass}`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
