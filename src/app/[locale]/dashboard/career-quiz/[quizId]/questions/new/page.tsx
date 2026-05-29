"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CareerQuizQuestionForm } from "@/components/career-quiz-question-form";
import { Link } from "@/i18n/navigation";

export default function NewCareerQuizQuestionPage() {
  const t = useTranslations("DashboardCareerQuiz");
  const params = useParams();
  const quizId = typeof params.quizId === "string" ? params.quizId : "";

  if (!quizId) {
    return null;
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
        {t("newQuestionTitle")}
      </h2>
      <CareerQuizQuestionForm quizId={quizId} mode="create" />
    </div>
  );
}
