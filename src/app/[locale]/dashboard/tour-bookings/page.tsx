"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api/client";
import { formatDateTime, tourBookingStatusClass } from "@/lib/format";
import type { TourBookingRow, TourBookingStatus } from "@/lib/types";

const STATUSES: TourBookingStatus[] = ["PENDING", "CONFIRMED", "CANCELLED"];

export default function TourBookingsPage() {
  const t = useTranslations("DashboardTourBookings");
  const tCommon = useTranslations("Common");
  const { token } = useAuth();
  const [rows, setRows] = useState<TourBookingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    setError(null);
    try {
      const data = await apiFetch<TourBookingRow[]>("/tour-bookings", {
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

  function statusLabel(s: TourBookingStatus): string {
    if (s === "PENDING") {
      return t("statusPending");
    }
    if (s === "CONFIRMED") {
      return t("statusConfirmed");
    }
    return t("statusCancelled");
  }

  async function setStatus(id: string, status: TourBookingStatus) {
    if (!token) {
      return;
    }
    setError(null);
    try {
      await apiFetch<TourBookingRow>(`/tour-bookings/${id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("updateError"));
    }
  }

  async function removeOne(id: string) {
    if (!token || !window.confirm(t("deleteConfirm"))) {
      return;
    }
    setError(null);
    try {
      await apiFetch(`/tour-bookings/${id}`, { method: "DELETE", token });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("deleteError"));
    }
  }

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
          <table className="w-full min-w-[900px] text-left text-[0.9375rem]">
            <thead className="border-b border-slate-200 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">{t("colName")}</th>
                <th className="px-5 py-4">{t("colEmail")}</th>
                <th className="px-5 py-4">{t("colPhone")}</th>
                <th className="px-5 py-4">{t("colDepartment")}</th>
                <th className="px-5 py-4">{t("colVisit")}</th>
                <th className="px-5 py-4">{t("colStatus")}</th>
                <th className="px-5 py-4">{t("colBooked")}</th>
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
                  <td className="max-w-[180px] truncate px-5 py-4 text-slate-700">
                    {row.department}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                    <time dateTime={row.visitAt}>
                      {formatDateTime(row.visitAt)}
                    </time>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <span
                        className={`inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-semibold ${tourBookingStatusClass(row.status)}`}
                      >
                        {statusLabel(row.status)}
                      </span>
                      <select
                        aria-label={t("colStatus")}
                        className="min-h-10 max-w-[11rem] rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-medium text-slate-800 shadow-sm"
                        value={row.status}
                        onChange={(e) =>
                          void setStatus(
                            row.id,
                            e.target.value as TourBookingStatus,
                          )
                        }
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {statusLabel(s)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {formatDateTime(row.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
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
