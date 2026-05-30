import { FacultyProgramIcon } from "@/components/faculty-program-icon";
import { apiAssetUrl } from "@/lib/env";
import type { FacultyProgramRow } from "@/lib/types";

type Props = {
  program: Pick<FacultyProgramRow, "iconKey" | "imageFile" | "title">;
  className?: string;
};

export function FacultyProgramHero({ program, className = "" }: Props) {
  if (program.imageFile?.url) {
    return (
      // biome-ignore lint/performance/noImgElement: remote API asset URL
      <img
        src={apiAssetUrl(program.imageFile.url)}
        alt={program.title}
        className={`h-48 w-full rounded-2xl object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex h-48 items-center justify-center rounded-2xl border border-zinc-800/90 bg-zinc-900/80 ${className}`}
    >
      <FacultyProgramIcon iconKey={program.iconKey} className="h-16 w-16" />
    </div>
  );
}
