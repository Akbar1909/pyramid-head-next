import { getApiBaseUrl } from "@/lib/env";
import type { AdmissionsContent } from "@/lib/types";

const EMPTY: AdmissionsContent = {
  introHtml: null,
  generalRequirements: [],
};

function normalizeAdmissions(data: AdmissionsContent): AdmissionsContent {
  return {
    introHtml: data.introHtml ?? null,
    generalRequirements: data.generalRequirements ?? [],
  };
}

export async function fetchAdmissionsContent(): Promise<AdmissionsContent> {
  const url = `${getApiBaseUrl()}/admissions`;
  try {
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) {
      return EMPTY;
    }
    return normalizeAdmissions((await res.json()) as AdmissionsContent);
  } catch {
    return EMPTY;
  }
}
