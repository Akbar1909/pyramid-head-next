"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";
import { ThumbnailPicker } from "@/components/thumbnail-picker";
import { useAuth } from "@/contexts/auth-context";
import { Link, useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import type { CareerQuizQuestionRow } from "@/lib/types";

const LETTERS = ["A", "B", "C"] as const;

type OptionDraft = {
  title: string;
  description: string;
};

type Props = {
  quizId: string;
  mode: "create" | "edit";
  initial?: CareerQuizQuestionRow | null;
};

function emptyTriple(): OptionDraft[] {
  return [
    { title: "", description: "" },
    { title: "", description: "" },
    { title: "", description: "" },
  ];
}

function fromInitial(q: CareerQuizQuestionRow): {
  options: OptionDraft[];
  correctIndex: number;
} {
  const sorted = [...q.options].sort((a, b) => a.sortOrder - b.sortOrder);
  const options: OptionDraft[] = emptyTriple();
  for (let i = 0; i < 3; i++) {
    const o = sorted[i];
    if (o) {
      options[i] = { title: o.title, description: o.description };
    }
  }
  const correctIndex = Math.max(
    0,
    sorted.findIndex((o) => o.isCorrect),
  );
  return { options, correctIndex };
}

export function CareerQuizQuestionForm({ quizId, mode, initial }: Props) {
  const t = useTranslations("DashboardCareerQuiz");
  const formId = useId();
  const router = useRouter();
  const { token } = useAuth();
  const [stepOrder, setStepOrder] = useState(
    mode === "edit" && initial ? String(initial.stepOrder) : "1",
  );
  const [categoryLabel, setCategoryLabel] = useState(
    mode === "edit" && initial ? initial.categoryLabel : "",
  );
  const [questionText, setQuestionText] = useState(
    mode === "edit" && initial ? initial.questionText : "",
  );
  const [quoteText, setQuoteText] = useState(
    mode === "edit" && initial ? (initial.quoteText ?? "") : "",
  );
  const [imageFileId, setImageFileId] = useState(
    mode === "edit" && initial ? (initial.imageFileId ?? "") : "",
  );
  const [options, setOptions] = useState<OptionDraft[]>(() =>
    mode === "edit" && initial ? fromInitial(initial).options : emptyTriple(),
  );
  const [correctIndex, setCorrectIndex] = useState(
    () => (mode === "edit" && initial ? fromInitial(initial).correctIndex : 0),
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initial) {
      const parsed = fromInitial(initial);
      setStepOrder(String(initial.stepOrder));
      setCategoryLabel(initial.categoryLabel);
      setQuestionText(initial.questionText);
      setQuoteText(initial.quoteText ?? "");
      setImageFileId(initial.imageFileId ?? "");
      setOptions(parsed.options);
      setCorrectIndex(parsed.correctIndex);
    }
  }, [mode, initial]);

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-800";
  const sectionClass =
    "rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6";
  const sectionTitleClass = "text-lg font-semibold tracking-tight text-slate-900";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      return;
    }
    const step = Number.parseInt(stepOrder, 10);
    if (!Number.isFinite(step) || step < 1) {
      setError(t("invalidStep"));
      return;
    }
    setBusy(true);
    setError(null);
    const optionsPayload = options.map((o) => ({
      title: o.title.trim(),
      description: o.description.trim(),
    }));
    try {
      if (mode === "create") {
        await apiFetch(`/career-quiz/${quizId}/questions`, {
          method: "POST",
          token,
          body: JSON.stringify({
            stepOrder: step,
            categoryLabel: categoryLabel.trim(),
            questionText: questionText.trim(),
            quoteText: quoteText.trim() || undefined,
            imageFileId: imageFileId.trim() || undefined,
            options: optionsPayload,
            correctOptionIndex: correctIndex,
          }),
        });
      } else if (initial) {
        await apiFetch(`/career-quiz/questions/${initial.id}`, {
          method: "PATCH",
          token,
          body: JSON.stringify({
            stepOrder: step,
            categoryLabel: categoryLabel.trim(),
            questionText: questionText.trim(),
            quoteText: quoteText.trim() || undefined,
            imageFileId: imageFileId.trim(),
            options: optionsPayload,
            correctOptionIndex: correctIndex,
          }),
        });
      }
      router.push(`/dashboard/career-quiz/${quizId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("saveQuestionError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-3xl space-y-6 text-[0.9375rem] leading-relaxed"
    >
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-800">
          {error}
        </div>
      ) : null}

      <section className={sectionClass} aria-labelledby={`${formId}-s1`}>
        <h2 id={`${formId}-s1`} className={sectionTitleClass}>
          {t("sectionStepTopic")}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{t("sectionStepTopicHelp")}</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${formId}-step`} className={labelClass}>
              {t("stepOrder")}
            </label>
            <input
              id={`${formId}-step`}
              type="number"
              min={1}
              required
              value={stepOrder}
              onChange={(e) => setStepOrder(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={`${formId}-cat`} className={labelClass}>
              {t("categoryLabel")}
            </label>
            <input
              id={`${formId}-cat`}
              required
              value={categoryLabel}
              onChange={(e) => setCategoryLabel(e.target.value)}
              className={inputClass}
              placeholder={t("categoryPlaceholder")}
            />
          </div>
        </div>
      </section>

      <section className={sectionClass} aria-labelledby={`${formId}-s2`}>
        <h2 id={`${formId}-s2`} className={sectionTitleClass}>
          {t("sectionQuestionCopy")}
        </h2>
        <div className="mt-5 space-y-5">
          <div>
            <label htmlFor={`${formId}-q`} className={labelClass}>
              {t("questionText")}
            </label>
            <textarea
              id={`${formId}-q`}
              required
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${formId}-quote`} className={labelClass}>
              {t("quoteText")}
            </label>
            <textarea
              id={`${formId}-quote`}
              rows={2}
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              className={inputClass}
              placeholder={t("quotePlaceholder")}
            />
            <p className="mt-2 text-sm text-slate-600">{t("quoteHelp")}</p>
          </div>
        </div>
      </section>

      <section className={sectionClass} aria-labelledby={`${formId}-s3`}>
        <h2 id={`${formId}-s3`} className={sectionTitleClass}>
          {t("sectionPhoto")}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{t("sectionPhotoHelp")}</p>
        <div className="mt-4">
          <ThumbnailPicker
            label={t("imageLabel")}
            value={imageFileId}
            onChange={setImageFileId}
          />
        </div>
      </section>

      <section className={sectionClass} aria-labelledby={`${formId}-s4`}>
        <h2 id={`${formId}-s4`} className={sectionTitleClass}>
          {t("optionsHeading")}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{t("optionsHelp")}</p>
        <ul className="mt-5 space-y-4">
          {options.map((opt, index) => (
            <li
              key={`opt-${LETTERS[index]}`}
              className="rounded-xl border border-slate-200 bg-slate-50/90 p-4 sm:p-5"
            >
              <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-slate-200 pb-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-base font-bold text-amber-900">
                  {LETTERS[index]}
                </span>
                <label className="flex cursor-pointer items-center gap-2 text-base text-slate-800">
                  <input
                    type="radio"
                    name={`${formId}-correct`}
                    checked={correctIndex === index}
                    onChange={() => setCorrectIndex(index)}
                    className="h-5 w-5 border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>{t("markCorrectAnswer")}</span>
                </label>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass} htmlFor={`${formId}-t-${index}`}>
                    {t("optionTitle")}
                  </label>
                  <input
                    id={`${formId}-t-${index}`}
                    required
                    value={opt.title}
                    onChange={(e) => {
                      const v = e.target.value;
                      setOptions((o) =>
                        o.map((row, i) => (i === index ? { ...row, title: v } : row)),
                      );
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor={`${formId}-d-${index}`}>
                    {t("optionDescription")}
                  </label>
                  <textarea
                    id={`${formId}-d-${index}`}
                    required
                    rows={2}
                    value={opt.description}
                    onChange={(e) => {
                      const v = e.target.value;
                      setOptions((o) =>
                        o.map((row, i) =>
                          i === index ? { ...row, description: v } : row,
                        ),
                      );
                    }}
                    className={inputClass}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={busy}
          className="min-h-12 rounded-xl bg-amber-600 px-6 text-base font-semibold text-white shadow-sm hover:bg-amber-500 disabled:opacity-50"
        >
          {busy ? t("savingQuestion") : t("saveQuestion")}
        </button>
        <Link
          href={`/dashboard/career-quiz/${quizId}`}
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-base font-semibold text-slate-800 hover:bg-slate-50"
        >
          {t("cancelQuestion")}
        </Link>
      </div>
    </form>
  );
}
