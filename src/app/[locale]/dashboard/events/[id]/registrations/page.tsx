"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import {
  eventRegistrationStatusClass,
  formatDateTime,
} from "@/lib/format";
import type { EventRegistrationRow, EventRegistrationStatus } from "@/lib/types";

export default function EventRegistrationsPage() {
  const t = useTranslations("DashboardEventRegistrations");
  const tCommon = useTranslations("Common");
  const params = useParams();
  const eventId = typeof params.id === "string" ? params.id : "";
  const { token } = useAuth();
  const [rows, setRows] = useState<EventRegistrationRow[] | null>(null);
  const [eventTitle, setEventTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !eventId) {
      return;
    }
    setError(null);
    try {
      const [registrations, event] = await Promise.all([
        apiFetch<EventRegistrationRow[]>(
          `/events/${encodeURIComponent(eventId)}/registrations`,
          { token },
        ),
        apiFetch<{ title: string }>(`/events/${encodeURIComponent(eventId)}`, {
          token,
        }),
      ]);
      setRows(registrations);
      setEventTitle(event.title);
    } catch (e) {
      setError(e instanceof Error ? e.message : tCommon("failedToLoad"));
    }
  }, [eventId, token, tCommon]);

  useEffect(() => {
    void load();
  }, [load]);

  function statusLabel(status: EventRegistrationStatus): string {
    return status === "CANCELLED" ? t("statusCancelled") : t("statusRegistered");
  }

  async function cancelOne(id: string) {
    if (!token || !window.confirm(t("cancelConfirm"))) {
      return;
    }
    setError(null);
    try {
      await apiFetch(`/event-registrations/${id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("cancelError"));
    }
  }

  async function removeOne(id: string) {
    if (!token || !window.confirm(t("deleteConfirm"))) {
      return;
    }
    setError(null);
    try {
      await apiFetch(`/event-registrations/${id}`, {
        method: "DELETE",
        token,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("deleteError"));
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-8">
      <div>
        <Link
          href="/dashboard/events"
          className="text-sm font-medium text-sky-700 hover:text-sky-900"
        >
          {t("backToEvents")}
        </Link>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
          {t("title")}
        </h2>
        {eventTitle ? (
          <p className="mt-2 text-lg font-medium text-slate-800">{eventTitle}</p>
        ) : null}
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
                <th className="px-5 py-4">{t("colName")}</th>
                <th className="px-5 py-4">{t("colEmail")}</th>
                <th className="px-5 py-4">{t("colPhone")}</th>
                <th className="px-5 py-4">{t("colRegistered")}</th>
                <th className="px-5 py-4">{t("colStatus")}</th>
                <th className="px-5 py-4 text-right">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(rows ?? []).map((row) => (
                <tr
                  key={row.id}
                  className="bg-white transition-colors hover:bg-slate-50/90"
                >
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {row.fullName}
                  </td>
                  <td className="max-w-[200px] truncate px-5 py-4 text-slate-700">
                    {row.email}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                    {row.phone}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    <time dateTime={row.createdAt}>
                      {formatDateTime(row.createdAt)}
                    </time>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${eventRegistrationStatusClass(row.status)}`}
                    >
                      {statusLabel(row.status)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    {row.status !== "CANCELLED" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void cancelOne(row.id)}
                          className="font-medium text-amber-800 hover:text-amber-950"
                        >
                          {t("cancel")}
                        </button>
                        <span className="mx-2 text-slate-300">|</span>
                      </>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void removeOne(row.id)}
                      className="font-medium text-red-600 hover:text-red-800"
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
