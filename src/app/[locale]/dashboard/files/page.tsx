"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiUploadFile } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/env";
import type { UploadedFileResponse } from "@/lib/types";

export default function FilesPage() {
  const t = useTranslations("DashboardFiles");
  const { token } = useAuth();
  const [last, setLast] = useState<UploadedFileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
          {t("description")}
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm ring-1 ring-slate-900/5">
        <label
          htmlFor="dashboard-media-upload"
          className="block text-base font-semibold text-slate-800"
        >
          {t("fileLabel")}
        </label>
        <input
          id="dashboard-media-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
          disabled={!token || busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file || !token) {
              return;
            }
            setBusy(true);
            setError(null);
            try {
              const res = await apiUploadFile(token, file);
              setLast(res);
            } catch (err) {
              setError(err instanceof Error ? err.message : t("uploadFailed"));
            } finally {
              setBusy(false);
            }
          }}
          className="mt-3 block w-full text-base text-slate-700 file:mr-4 file:rounded-xl file:border file:border-slate-300 file:bg-slate-100 file:px-4 file:py-3 file:text-base file:font-medium file:text-slate-800 hover:file:bg-slate-200"
        />
        {busy ? (
          <p className="mt-3 text-sm text-slate-500">{t("uploading")}</p>
        ) : null}
        {error ? <p className="mt-3 text-base text-red-600">{error}</p> : null}
      </div>
      {last ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 text-base shadow-sm ring-1 ring-slate-900/5">
          <h3 className="text-lg font-semibold text-slate-900">
            {t("lastUpload")}
          </h3>
          <dl className="mt-5 space-y-4 text-slate-600">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("storedFileId")}
              </dt>
              <dd className="mt-1 font-mono text-sm text-amber-900">
                {last.id}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("publicPath")}
              </dt>
              <dd className="mt-1 break-all font-mono text-sm text-slate-800">
                {last.url}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("mime")}
              </dt>
              <dd className="mt-1">{last.mimeType}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("size")}
              </dt>
              <dd className="mt-1">
                {last.size} {t("bytes")}
              </dd>
            </div>
          </dl>
          {last.mimeType.startsWith("image/") ? (
            <div className="mt-6">
              <p className="text-sm font-medium text-slate-600">
                {t("preview")}
              </p>
              {/* biome-ignore lint/performance/noImgElement: remote API URL; not using next/image */}
              <img
                src={`${getApiBaseUrl()}/files/uploads/${encodeURIComponent(last.id)}`}
                alt=""
                className="mt-3 max-h-52 rounded-xl border border-slate-200 shadow-sm"
              />
            </div>
          ) : null}
          <p className="mt-6 text-sm text-slate-600">
            {t("download")}{" "}
            <a
              href={`${getApiBaseUrl()}/files/uploads/${encodeURIComponent(last.id)}/download`}
              className="font-semibold text-amber-800 underline decoration-2 underline-offset-2 hover:text-amber-900"
              target="_blank"
              rel="noreferrer"
            >
              {t("downloadLink")}
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
}
