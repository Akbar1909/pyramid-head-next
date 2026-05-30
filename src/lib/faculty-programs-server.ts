import { getApiBaseUrl } from "@/lib/env";
import type { FacultyProgramRow } from "@/lib/types";

function normalizeProgram(row: FacultyProgramRow): FacultyProgramRow {
  return {
    ...row,
    slug: row.slug ?? row.id,
    admissionRequirements: row.admissionRequirements ?? [],
    clinicalRequirements: row.clinicalRequirements ?? [],
    acceptingApplications: row.acceptingApplications ?? true,
  };
}

export async function fetchPublishedFacultyPrograms(): Promise<
  FacultyProgramRow[]
> {
  const url = `${getApiBaseUrl()}/faculty-programs/published`;
  try {
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) {
      return [];
    }
    const data = (await res.json()) as FacultyProgramRow[];
    return data.map(normalizeProgram);
  } catch {
    return [];
  }
}

export async function fetchFacultyProgramBySlug(
  slug: string,
): Promise<FacultyProgramRow | null> {
  const url = `${getApiBaseUrl()}/faculty-programs/${encodeURIComponent(slug)}`;
  try {
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) {
      return null;
    }
    return normalizeProgram((await res.json()) as FacultyProgramRow);
  } catch {
    return null;
  }
}
