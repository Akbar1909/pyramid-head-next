"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense, useState } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import { formatDateOnly, formatDateTime, programApplicationStatusClass } from "@/lib/format";
import { useProgramApplicationStatusLabel } from "@/lib/program-application-status";
import type { ProgramApplicationTrackResponse } from "@/lib/types";

function TrackFormInner() {
  const t = useTranslations("TrackPage");
  const tHome = useTranslations("HomePage");
  const searchParams = useSearchParams();
  const statusLabel = useProgramApplicationStatusLabel();
  const [token, setToken] = useState(
    () => searchParams.get("token")?.trim() ?? "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProgramApplicationTrackResponse | null>(
    null,
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) {
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const data = await apiFetch<ProgramApplicationTrackResponse>(
        `/program-applications/track/${encodeURIComponent(trimmed)}`,
      );
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setBusy(false);
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-800";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10">
      <div className="absolute right-4 top-4 flex items-center gap-3">
        <LocaleSwitcher size="comfortable" />
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 hover:text-amber-800"
        >
          {tHome("brand")}
        </Link>
      </div>
      <div className="mx-auto mt-12 max-w-xl">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-slate-900">
          {t("title")}
        </h1>
        <p className="mt-3 text-center text-base text-slate-600">
          {t("subtitle")}
        </p>
        <form
          onSubmit={onSubmit}
          className="mt-10 space-y-5 rounded-2xl border border-slate-200/90 bg-white p-8 shadow-lg ring-1 ring-slate-900/5"
        >
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-800">
              {error}
            </div>
          ) : null}
          <div>
            <label htmlFor="track-token" className={labelClass}>
              {t("trackingToken")}
            </label>
            <input
              id="track-token"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className={fieldClass}
              placeholder={t("trackingTokenPlaceholder")}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="flex min-h-12 w-full items-center justify-center rounded-xl bg-amber-600 text-base font-semibold text-white shadow-sm hover:bg-amber-500 disabled:opacity-50"
          >
            {busy ? t("loading") : t("submit")}
          </button>
        </form>

        {result ? (
          <section
            className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            aria-live="polite"
          >
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                {t("statusHeading")}
              </h2>
              <span
                className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${programApplicationStatusClass(result.status)}`}
              >
                {statusLabel(result.status)}
              </span>
            </div>
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("program")}
                </dt>
                <dd className="mt-1 text-slate-800">
                  {result.facultyProgram ? (
                    <Link
                      href={`/programs/${result.facultyProgram.slug}`}
                      className="font-medium text-amber-800 hover:underline"
                    >
                      {result.facultyProgram.title}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("preferredStartDate")}
                </dt>
                <dd className="mt-1 text-slate-800">
                  {formatDateOnly(result.preferredStartDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("submitted")}
                </dt>
                <dd className="mt-1 text-slate-800">
                  {formatDateTime(result.createdAt)}
                </dd>
              </div>
              {result.interviewScheduledAt ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("interviewScheduled")}
                  </dt>
                  <dd className="mt-1 text-slate-800">
                    {formatDateTime(result.interviewScheduledAt)}
                  </dd>
                </div>
              ) : null}
              {result.enrolledAt ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("enrolledAt")}
                  </dt>
                  <dd className="mt-1 text-slate-800">
                    {formatDateTime(result.enrolledAt)}
                  </dd>
                </div>
              ) : null}
            </dl>
            <p className="mt-6 text-sm text-slate-500">{t("paymentComingSoon")}</p>
          </section>
        ) : null}
      </div>
    </div>
  );
}

export default function TrackPage() {
  const t = useTranslations("Common");
  return (
    <Suspense
      fallback={
        <p className="py-20 text-center text-slate-500">{t("loading")}</p>
      }
    >
      <TrackFormInner />
    </Suspense>
  );
}
