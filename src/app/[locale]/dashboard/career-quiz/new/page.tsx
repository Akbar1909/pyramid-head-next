"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link, useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import type { CareerQuizRow } from "@/lib/types";

export default function NewCareerQuizPage() {
  const t = useTranslations("DashboardCareerQuiz");
  const formId = useId();
  const router = useRouter();
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [displayTotalSteps, setDisplayTotalSteps] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-800";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      return;
    }
    setBusy(true);
    setError(null);
    const stepsTrim = displayTotalSteps.trim();
    const stepsNum =
      stepsTrim === ""
        ? undefined
        : Number.parseInt(stepsTrim, 10);
    if (stepsTrim !== "" && (!Number.isFinite(stepsNum) || (stepsNum as number) < 1)) {
      setError(t("saveQuizError"));
      setBusy(false);
      return;
    }
    try {
      const created = await apiFetch<CareerQuizRow>("/career-quiz", {
        method: "POST",
        token,
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          displayTotalSteps: stepsNum,
          isPublished,
        }),
      });
      router.push(`/dashboard/career-quiz/${created.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("saveQuizError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <p className="text-base">
        <Link
          href="/dashboard/career-quiz"
          className="font-medium text-amber-800 hover:text-amber-900"
        >
          {t("backToList")}
        </Link>
      </p>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
          {t("newQuiz")}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
          {t("newQuizSubtitle")}
        </p>
      </div>
      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/5"
      >
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-800">
            {error}
          </div>
        ) : null}
        <div>
          <label htmlFor={`${formId}-title`} className={labelClass}>
            {t("quizTitle")}
          </label>
          <input
            id={`${formId}-title`}
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${formId}-desc`} className={labelClass}>
            {t("description")}
          </label>
          <textarea
            id={`${formId}-desc`}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
            placeholder={t("descriptionOptionalPlaceholder")}
          />
        </div>
        <details className="rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 sm:px-5 sm:py-4">
          <summary className="cursor-pointer text-base font-semibold text-slate-800">
            {t("quizAdvancedToggle")}
          </summary>
          <div className="mt-4">
            <label htmlFor={`${formId}-steps`} className={labelClass}>
              {t("displayTotalSteps")}
            </label>
            <input
              id={`${formId}-steps`}
              type="number"
              min={1}
              value={displayTotalSteps}
              onChange={(e) => setDisplayTotalSteps(e.target.value)}
              className={inputClass}
              placeholder="12"
            />
            <p className="mt-2 text-sm text-slate-600">
              {t("displayTotalStepsHint")}
            </p>
          </div>
        </details>
        <label className="flex cursor-pointer items-start gap-3 text-base text-slate-800">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          <span>{t("published")}</span>
        </label>
        <button
          type="submit"
          disabled={busy}
          className="min-h-12 rounded-xl bg-amber-600 px-6 text-base font-semibold text-white shadow-sm hover:bg-amber-500 disabled:opacity-50"
        >
          {busy ? t("savingQuiz") : t("createQuiz")}
        </button>
      </form>
    </div>
  );
}
