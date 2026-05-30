"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import { formatDateTime, programApplicationStatusClass } from "@/lib/format";
import { useProgramApplicationStatusLabel } from "@/lib/program-application-status";
import type { ProgramApplicationListRow } from "@/lib/types";

export default function ApplicationsPage() {
  const t = useTranslations("DashboardApplications");
  const tCommon = useTranslations("Common");
  const { token } = useAuth();
  const statusLabel = useProgramApplicationStatusLabel();
  const [rows, setRows] = useState<ProgramApplicationListRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    setError(null);
    try {
      const data = await apiFetch<ProgramApplicationListRow[]>(
        "/program-applications",
        { token },
      );
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : tCommon("failedToLoad"));
    }
  }, [token, tCommon]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-[1100px] space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
          {t("subtitle")}
        </p>
      </div>
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-800">
          {error}
        </div>
      ) : null}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-[0.9375rem]">
            <thead className="border-b border-slate-200 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">{t("colSubmitted")}</th>
                <th className="px-5 py-4">{t("colName")}</th>
                <th className="px-5 py-4">{t("colEmail")}</th>
                <th className="px-5 py-4">{t("colProgram")}</th>
                <th className="px-5 py-4">{t("colStatus")}</th>
                <th className="px-5 py-4">{t("colFiles")}</th>
                <th className="px-5 py-4 text-right">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(rows ?? []).map((row) => (
                <tr
                  key={row.id}
                  className="bg-white transition-colors hover:bg-slate-50/90"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    <time dateTime={row.createdAt}>
                      {formatDateTime(row.createdAt)}
                    </time>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {row.firstName} {row.lastName}
                  </td>
                  <td className="max-w-[200px] truncate px-5 py-4 text-slate-700">
                    {row.email}
                  </td>
                  <td className="max-w-[180px] truncate px-5 py-4 text-slate-700">
                    {row.facultyProgram?.title ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-semibold ${programApplicationStatusClass(row.status)}`}
                    >
                      {statusLabel(row.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {row._count.attachments}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <Link
                      href={`/dashboard/applications/${row.id}`}
                      className="font-medium text-sky-700 hover:text-sky-900"
                    >
                      {t("view")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows?.length === 0 ? (
          <p className="px-5 py-12 text-center text-base text-slate-500">
            {t("noRows")}
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
