import { ApiError } from "@/lib/api/error";
import { getApiBaseUrl } from "@/lib/env";
import type {
  ProgramApplicationSubmitResponse,
  UploadedFileResponse,
} from "@/lib/types";

export type ApiFetchOptions = RequestInit & {
  token?: string | null;
};

export async function apiFetch<T>(
  path: string,
  init?: ApiFetchOptions,
): Promise<T> {
  const { token, ...rest } = init ?? {};
  const base = getApiBaseUrl();
  const headers = new Headers(rest.headers);
  if (
    rest.body !== undefined &&
    typeof rest.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${base}${path}`, { ...rest, headers });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      throw new ApiError(res.status, { message: text.slice(0, 200) });
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, json);
  }

  return json as T;
}

export async function apiUploadFile(
  token: string,
  file: File,
): Promise<UploadedFileResponse> {
  const base = getApiBaseUrl();
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${base}/files/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      throw new ApiError(res.status, { message: text.slice(0, 200) });
    }
  }
  if (!res.ok) {
    throw new ApiError(res.status, json);
  }
  return json as UploadedFileResponse;
}

export async function apiSubmitProgramApplication(
  formData: FormData,
): Promise<ProgramApplicationSubmitResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/program-applications`, {
    method: "POST",
    body: formData,
  });
  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      throw new ApiError(res.status, { message: text.slice(0, 200) });
    }
  }
  if (!res.ok) {
    throw new ApiError(res.status, json);
  }
  return json as ProgramApplicationSubmitResponse;
}
