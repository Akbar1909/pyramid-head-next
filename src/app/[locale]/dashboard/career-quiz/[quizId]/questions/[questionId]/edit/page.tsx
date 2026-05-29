"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { CareerQuizQuestionForm } from "@/components/career-quiz-question-form";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import type { CareerQuizQuestionRow, CareerQuizRow } from "@/lib/types";

export default function EditCareerQuizQuestionPage() {
  const t = useTranslations("DashboardCareerQuiz");
  const tCommon = useTranslations("Common");
  const params = useParams();
  const quizId = typeof params.quizId === "string" ? params.quizId : "";
  const questionId =
    typeof params.questionId === "string" ? params.questionId : "";
  const { token } = useAuth();
  const [question, setQuestion] = useState<
    CareerQuizQuestionRow | null | undefined
  >(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !quizId || !questionId) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const quiz = await apiFetch<CareerQuizRow>(`/career-quiz/${quizId}`, {
          token,
        });
        const found = quiz.questions.find((q) => q.id === questionId) ?? null;
        if (!cancelled) {
          setQuestion(found);
          if (!found) {
            setError(t("questionNotFound"));
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t("loadError"));
          setQuestion(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, quizId, questionId, t]);

  if (error || question === null) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <p className="text-base text-red-600">{error ?? t("questionNotFound")}</p>
        <Link
          href={quizId ? `/dashboard/career-quiz/${quizId}` : "/dashboard/career-quiz"}
          className="text-base font-medium text-amber-800 hover:text-amber-900"
        >
          {quizId ? t("backToQuiz") : t("backToList")}
        </Link>
      </div>
    );
  }

  if (question === undefined) {
    return <p className="text-base text-slate-600">{tCommon("loading")}</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-base">
        <Link
          href={`/dashboard/career-quiz/${quizId}`}
          className="font-medium text-amber-800 hover:text-amber-900"
        >
          {t("backToQuiz")}
        </Link>
      </p>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
        {t("editQuestionTitle")}
      </h2>
      <CareerQuizQuestionForm
        quizId={quizId}
        mode="edit"
        initial={question}
      />
    </div>
  );
}
