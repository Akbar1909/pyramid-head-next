"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import type { CareerQuizQuestionRow, CareerQuizRow } from "@/lib/types";

export default function CareerQuizDetailPage() {
  const t = useTranslations("DashboardCareerQuiz");
  const tCommon = useTranslations("Common");
  const formId = useId();
  const params = useParams();
  const quizId = typeof params.quizId === "string" ? params.quizId : "";
  const { token } = useAuth();
  const [quiz, setQuiz] = useState<CareerQuizRow | null | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [displayTotalSteps, setDisplayTotalSteps] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-800";

  const load = useCallback(async () => {
    if (!token || !quizId) {
      return;
    }
    setLoadError(null);
    try {
      const data = await apiFetch<CareerQuizRow>(`/career-quiz/${quizId}`, {
        token,
      });
      setQuiz(data);
      setTitle(data.title);
      setDescription(data.description ?? "");
      setDisplayTotalSteps(
        data.displayTotalSteps != null ? String(data.displayTotalSteps) : "",
      );
      setIsPublished(data.isPublished);
    } catch (e) {
      setQuiz(null);
      setLoadError(e instanceof Error ? e.message : t("loadError"));
    }
  }, [token, quizId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSaveQuiz(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !quizId) {
      return;
    }
    setBusy(true);
    setSaveError(null);
    const stepsTrim = displayTotalSteps.trim();
    const stepsNum =
      stepsTrim === ""
        ? null
        : Number.parseInt(stepsTrim, 10);
    if (
      stepsTrim !== "" &&
      (!Number.isFinite(stepsNum) || (stepsNum as number) < 1)
    ) {
      setSaveError(t("saveQuizError"));
      setBusy(false);
      return;
    }
    try {
      const updated = await apiFetch<CareerQuizRow>(`/career-quiz/${quizId}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          displayTotalSteps: stepsNum,
          isPublished,
        }),
      });
      setQuiz(updated);
      setTitle(updated.title);
      setDescription(updated.description ?? "");
      setDisplayTotalSteps(
        updated.displayTotalSteps != null
          ? String(updated.displayTotalSteps)
          : "",
      );
      setIsPublished(updated.isPublished);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t("saveQuizError"));
    } finally {
      setBusy(false);
    }
  }

  async function deleteQuestion(questionId: string) {
    if (!token || !window.confirm(t("deleteQuestionConfirm"))) {
      return;
    }
    try {
      await apiFetch(`/career-quiz/questions/${questionId}`, {
        method: "DELETE",
        token,
      });
      await load();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : t("deleteQuestionError"));
    }
  }

  if (loadError || quiz === null) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <p className="text-base text-red-600">{loadError ?? t("quizNotFound")}</p>
        <Link
          href="/dashboard/career-quiz"
          className="text-base font-medium text-amber-800 hover:text-amber-900"
        >
          {t("backToList")}
        </Link>
      </div>
    );
  }

  if (quiz === undefined) {
    return <p className="text-base text-slate-600">{tCommon("loading")}</p>;
  }

  const questions = [...quiz.questions].sort(
    (a, b) => a.stepOrder - b.stepOrder,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-10">
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
          {t("detailTitle")}
        </h2>
        <p className="mt-2 text-base text-slate-600">{quiz.title}</p>
      </div>

      <form
        onSubmit={onSaveQuiz}
        className="space-y-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/5"
      >
        {saveError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-800">
            {saveError}
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
          {busy ? t("savingQuiz") : t("saveQuiz")}
        </button>
      </form>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h3 className="text-xl font-semibold text-slate-900">
            {t("questionsTitle")}
          </h3>
          <Link
            href={`/dashboard/career-quiz/${quizId}/questions/new`}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-900 px-5 text-base font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            {t("addQuestion")}
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[0.9375rem]">
              <thead className="border-b border-slate-200 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">{t("colStep")}</th>
                  <th className="px-5 py-4">{t("colCategory")}</th>
                  <th className="px-5 py-4">{t("colPreview")}</th>
                  <th className="px-5 py-4 text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {questions.map((q: CareerQuizQuestionRow) => (
                  <tr key={q.id} className="bg-white hover:bg-slate-50/90">
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                      {q.stepOrder}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{q.categoryLabel}</td>
                    <td className="max-w-md truncate px-5 py-4 text-slate-700">
                      {q.questionText}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/career-quiz/${quizId}/questions/${q.id}/edit`}
                        className="font-medium text-amber-800 hover:text-amber-900"
                      >
                        {t("editQuestion")}
                      </Link>
                      <span className="mx-2 text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => void deleteQuestion(q.id)}
                        className="font-medium text-red-600 hover:text-red-700"
                      >
                        {tCommon("delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {questions.length === 0 ? (
            <p className="px-5 py-10 text-center text-base text-slate-500">
              {t("questionsEmpty")}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
