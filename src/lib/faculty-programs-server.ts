import { getApiBaseUrl } from "@/lib/env";
import type { FacultyProgramRow } from "@/lib/types";

export async function fetchPublishedFacultyPrograms(): Promise<
  FacultyProgramRow[]
> {
  const url = `${getApiBaseUrl()}/faculty-programs/published`;
  try {
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) {
      return [];
    }
    return (await res.json()) as FacultyProgramRow[];
  } catch {
    return [];
  }
}
