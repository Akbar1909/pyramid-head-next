"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import {
  eventFormatClass,
  eventPublishState,
  formatDateTime,
  publishBadgeClass,
} from "@/lib/format";
import type { EventFormat, EventRow } from "@/lib/types";

function formatLabel(
  format: EventFormat,
  t: ReturnType<typeof useTranslations<"DashboardEvents">>,
): string {
  return t(`format_${format}`);
}

export default function EventsListPage() {
  const t = useTranslations("DashboardEvents");
  const tStatus = useTranslations("Common.status");
  const tCommon = useTranslations("Common");
  const { token } = useAuth();
  const [rows, setRows] = useState<EventRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    setError(null);
    try {
      const data = await apiFetch<EventRow[]>("/events", { token });
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
      await apiFetch(`/events/${id}`, { method: "DELETE", token });
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
            {t("title")}
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
            {t("subtitle")}
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-600 px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-amber-500"
        >
          {t("newEvent")}
        </Link>
      </div>
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-800">
          {error}
        </div>
      ) : null}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-[0.9375rem]">
            <thead className="border-b border-slate-200 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">{t("colTitle")}</th>
                <th className="px-5 py-4">{t("colStarts")}</th>
                <th className="px-5 py-4">{t("colFormat")}</th>
                <th className="px-5 py-4">{t("colRegistrations")}</th>
                <th className="px-5 py-4">{t("colStatus")}</th>
                <th className="px-5 py-4">{t("colAuthor")}</th>
                <th className="px-5 py-4 text-right">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(rows ?? []).map((row) => {
                const st = eventPublishState(row.publishedAt);
                const regCount = row._count?.registrations ?? 0;
                const eventFormat = row.format ?? "IN_PERSON";
                return (
                  <tr
                    key={row.id}
                    className="bg-white transition-colors hover:bg-slate-50/90"
                  >
                    <td className="max-w-xs truncate px-5 py-4 font-medium text-slate-900">
                      {row.title}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDateTime(row.startsAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${eventFormatClass(eventFormat)}`}
                      >
                        {formatLabel(eventFormat, t)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {row.registrationEnabled ? regCount : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${publishBadgeClass(st)}`}
                      >
                        {tStatus(st)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {row.author.email}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      {row.registrationEnabled ? (
                        <>
                          <Link
                            href={`/dashboard/events/${row.id}/registrations`}
                            className="font-medium text-sky-700 hover:text-sky-900"
                          >
                            {t("registrations")}
                          </Link>
                          <span className="mx-2 text-slate-300">|</span>
                        </>
                      ) : null}
                      <Link
                        href={`/dashboard/events/${row.id}/preview`}
                        className="font-medium text-slate-600 hover:text-amber-800"
                      >
                        {t("preview")}
                      </Link>
                      <span className="mx-2 text-slate-300">|</span>
                      <Link
                        href={`/dashboard/events/${row.id}/edit`}
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
                );
              })}
            </tbody>
          </table>
        </div>
        {rows?.length === 0 ? (
          <p className="px-5 py-12 text-center text-base text-slate-500">
            {t("noEvents")}
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
