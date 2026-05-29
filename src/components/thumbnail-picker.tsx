"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiUploadFile } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/env";

type Props = {
  value: string;
  onChange: (storedFileId: string) => void;
  accept?: string;
  /** Overrides default translated label */
  label?: string;
};

export function ThumbnailPicker({
  value,
  onChange,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  label,
}: Props) {
  const t = useTranslations("ThumbnailPicker");
  const fieldId = useId();
  const { token } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewSrc = value
    ? `${getApiBaseUrl()}/files/uploads/${encodeURIComponent(value)}`
    : null;
  const labelText = label ?? t("defaultLabel");

  return (
    <div className="space-y-3">
      <label
        htmlFor={`${fieldId}-file`}
        className="block text-sm font-semibold text-slate-800"
      >
        {labelText}
      </label>
      <p className="text-sm leading-relaxed text-slate-600">{t("hint")}</p>
      <div className="flex flex-wrap items-center gap-3">
        <input
          id={`${fieldId}-file`}
          type="file"
          accept={accept}
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
              onChange(res.id);
            } catch (err) {
              setError(err instanceof Error ? err.message : t("uploadFailed"));
            } finally {
              setBusy(false);
            }
          }}
          className="block text-base text-slate-700 file:mr-4 file:rounded-xl file:border file:border-slate-300 file:bg-slate-100 file:px-4 file:py-3 file:text-base file:font-medium file:text-slate-800 hover:file:bg-slate-200"
        />
        {busy ? (
          <span className="text-sm text-slate-500">{t("uploading")}</span>
        ) : null}
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-sm font-semibold text-slate-600 underline decoration-slate-300 decoration-2 underline-offset-2 hover:text-amber-800"
          >
            {t("clear")}
          </button>
        ) : null}
      </div>
      {value ? (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-sm font-medium text-emerald-800">
            {t("attached")}
          </p>
          {previewSrc ? (
            // biome-ignore lint/performance/noImgElement: remote API URL; not using next/image
            <img
              src={previewSrc}
              alt={t("previewAlt")}
              className="h-28 max-w-xs rounded-lg border border-slate-200 object-cover shadow-sm"
            />
          ) : null}
        </div>
      ) : null}
      {error ? <p className="text-base text-red-600">{error}</p> : null}
    </div>
  );
}
