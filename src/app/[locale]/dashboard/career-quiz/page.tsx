"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import type { CareerQuizRow } from "@/lib/types";

export default function CareerQuizListPage() {
  const t = useTranslations("DashboardCareerQuiz");
  const tCommon = useTranslations("Common");
  const { token } = useAuth();
  const [rows, setRows] = useState<CareerQuizRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    setError(null);
    try {
      const data = await apiFetch<CareerQuizRow[]>("/career-quiz", { token });
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("loadError"));
    }
  }, [token, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function removeQuiz(id: string) {
    if (!token || !window.confirm(t("deleteQuizConfirm"))) {
      return;
    }
    try {
      await apiFetch(`/career-quiz/${id}`, { method: "DELETE", token });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("deleteQuizError"));
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
            {t("listTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            {t("listSubtitle")}
          </p>
        </div>
        <Link
          href="/dashboard/career-quiz/new"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-600 px-6 text-base font-semibold text-white shadow-sm hover:bg-amber-500"
        >
          {t("newQuiz")}
        </Link>
      </div>
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-800">
          {error}
        </div>
      ) : null}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[0.9375rem]">
            <thead className="border-b border-slate-200 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">{t("colTitle")}</th>
                <th className="px-5 py-4">{t("colSteps")}</th>
                <th className="px-5 py-4">{t("colPublished")}</th>
                <th className="px-5 py-4">{t("colUpdated")}</th>
                <th className="px-5 py-4 text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(rows ?? []).map((row) => (
                <tr
                  key={row.id}
                  className="bg-white hover:bg-slate-50/90"
                >
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {row.title}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {row.questions?.length ?? 0}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {row.isPublished ? t("publishedBadge") : t("draftBadge")}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {new Date(row.updatedAt).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <Link
                      href={`/dashboard/career-quiz/${row.id}`}
                      className="font-medium text-amber-800 hover:text-amber-900"
                    >
                      {t("manage")}
                    </Link>
                    <span className="mx-2 text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => void removeQuiz(row.id)}
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
        {rows?.length === 0 ? (
          <p className="px-5 py-12 text-center text-base text-slate-500">
            {t("noQuizzes")}
          </p>
        ) : null}
        {rows === null ? (
          <p className="px-5 py-12 text-center text-base text-slate-500">
            {tCommon("loading")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
