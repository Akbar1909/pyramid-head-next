"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";

type TourBookingResponse = {
  id: string;
  fullName: string;
  email: string;
  visitAt: string;
  status: string;
};

const TIME_SLOTS: {
  value: string;
  labelKey: "slot0900" | "slot1130" | "slot1400" | "slot1600";
}[] = [
  { value: "09:00", labelKey: "slot0900" },
  { value: "11:30", labelKey: "slot1130" },
  { value: "14:00", labelKey: "slot1400" },
  { value: "16:00", labelKey: "slot1600" },
];

const DEPARTMENTS: {
  value: string;
  labelKey:
    | "deptBusiness"
    | "deptComputer"
    | "deptEngineering"
    | "deptLiberalArts"
    | "deptHealth"
    | "deptEducation"
    | "deptOther";
}[] = [
  { value: "Business Administration", labelKey: "deptBusiness" },
  { value: "Computer Science", labelKey: "deptComputer" },
  { value: "Engineering", labelKey: "deptEngineering" },
  { value: "Liberal Arts", labelKey: "deptLiberalArts" },
  { value: "Health Sciences", labelKey: "deptHealth" },
  { value: "Education", labelKey: "deptEducation" },
  { value: "Other", labelKey: "deptOther" },
];

function tomorrowISODate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function BookTourPage() {
  const t = useTranslations("BookTourPage");
  const tHome = useTranslations("HomePage");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState(
    DEPARTMENTS[0]?.value ?? "Other",
  );
  const [visitDate, setVisitDate] = useState(tomorrowISODate());
  const [visitTime, setVisitTime] = useState(TIME_SLOTS[0]?.value ?? "09:00");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const visitAt = new Date(`${visitDate}T${visitTime}:00`);
    if (Number.isNaN(visitAt.getTime())) {
      setError(t("error"));
      setBusy(false);
      return;
    }
    try {
      await apiFetch<TourBookingResponse>("/tour-bookings", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          department,
          visitAt: visitAt.toISOString(),
        }),
      });
      setDone(true);
    } catch {
      setError(t("error"));
    } finally {
      setBusy(false);
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-800";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10">
      <div className="absolute right-4 top-4 flex items-center gap-3">
        <LocaleSwitcher size="comfortable" />
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 hover:text-amber-800"
        >
          {tHome("brand")}
        </Link>
      </div>
      <div className="mx-auto mt-12 max-w-xl">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-slate-900">
          {t("title")}
        </h1>
        <p className="mt-3 text-center text-base text-slate-600">
          {t("subtitle")}
        </p>
        {done ? (
          <output
            className="mt-10 block rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center text-lg font-medium text-emerald-900"
            aria-live="polite"
          >
            {t("success")}
          </output>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-10 space-y-5 rounded-2xl border border-slate-200/90 bg-white p-8 shadow-lg ring-1 ring-slate-900/5"
          >
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-800">
                {error}
              </div>
            ) : null}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="bt-name" className={labelClass}>
                  {t("fullName")}
                </label>
                <input
                  id="bt-name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={fieldClass}
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="bt-email" className={labelClass}>
                  {t("email")}
                </label>
                <input
                  id="bt-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldClass}
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="bt-phone" className={labelClass}>
                  {t("phone")}
                </label>
                <input
                  id="bt-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={fieldClass}
                  autoComplete="tel"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="bt-dept" className={labelClass}>
                  {t("department")}
                </label>
                <select
                  id="bt-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className={fieldClass}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {t(d.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="bt-date" className={labelClass}>
                  {t("visitDate")}
                </label>
                <input
                  id="bt-date"
                  type="date"
                  required
                  min={tomorrowISODate()}
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="bt-time" className={labelClass}>
                  {t("visitTime")}
                </label>
                <select
                  id="bt-time"
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className={fieldClass}
                >
                  {TIME_SLOTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {t(s.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="mt-2 flex min-h-12 w-full items-center justify-center rounded-xl bg-red-600 text-base font-semibold text-white shadow-sm transition-colors hover:bg-red-500 disabled:opacity-50"
            >
              {busy ? t("submitting") : t("submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
