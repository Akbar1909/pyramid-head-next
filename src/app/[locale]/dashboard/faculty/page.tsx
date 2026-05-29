"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import type { FacultyProgramRow } from "@/lib/types";

function iconPresetLabel(iconKey: string, t: (key: string) => string) {
  switch (iconKey) {
    case "cardiac":
      return t("iconPreset_cardiac");
    case "cardiology":
      return t("iconPreset_cardiology");
    case "psw":
      return t("iconPreset_psw");
    case "medical_admin":
      return t("iconPreset_medical_admin");
    case "science":
      return t("iconPreset_science");
    case "generic":
      return t("iconPreset_generic");
    default:
      return iconKey;
  }
}

export default function FacultyProgramsListPage() {
  const t = useTranslations("DashboardFaculty");
  const tCommon = useTranslations("Common");
  const { token } = useAuth();
  const [rows, setRows] = useState<FacultyProgramRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    setError(null);
    try {
      const data = await apiFetch<FacultyProgramRow[]>("/faculty-programs", {
        token,
      });
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : tCommon("failedToLoad"));
    }
  }, [token, tCommon]);

  useEffect(() => {
    void load();
  }, [load]);

  async function removeOne(id: string) {
    if (!token || !window.confirm(t("deleteConfirm"))) {
      return;
    }
    try {
      await apiFetch(`/faculty-programs/${id}`, { method: "DELETE", token });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("deleteError"));
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
            {t("pageTitle")}
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
            {t("pageSubtitle")}
          </p>
        </div>
        <Link
          href="/dashboard/faculty/new"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-600 px-6 text-base font-semibold text-white shadow-sm hover:bg-amber-500"
        >
          {t("newProgram")}
        </Link>
      </div>
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-800">
          {error}
        </div>
      ) : null}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[0.9375rem]">
            <thead className="border-b border-slate-200 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">{t("colTitle")}</th>
                <th className="px-5 py-4">{t("colIcon")}</th>
                <th className="px-5 py-4">{t("colOrder")}</th>
                <th className="px-5 py-4">{t("colPublished")}</th>
                <th className="px-5 py-4">{t("colUpdated")}</th>
                <th className="px-5 py-4 text-right">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(rows ?? []).map((row) => (
                <tr key={row.id} className="bg-white hover:bg-slate-50/90">
                  <td className="max-w-xs truncate px-5 py-4 font-medium text-slate-900">
                    {row.title}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                    {iconPresetLabel(row.iconKey, t)}
                  </td>
                  <td className="px-5 py-4 text-slate-700">{row.sortOrder}</td>
                  <td className="px-5 py-4 text-slate-700">
                    {row.isPublished ? t("yes") : t("no")}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {new Date(row.updatedAt).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <Link
                      href={`/dashboard/faculty/${row.id}/edit`}
                      className="font-medium text-amber-800 hover:text-amber-900"
                    >
                      {tCommon("edit")}
                    </Link>
                    <span className="mx-2 text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => void removeOne(row.id)}
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
