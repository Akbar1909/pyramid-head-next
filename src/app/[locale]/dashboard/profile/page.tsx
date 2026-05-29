"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api/client";
import type { ProfileBundle } from "@/lib/types";

export default function ProfilePage() {
  const t = useTranslations("DashboardProfile");
  const formId = useId();
  const { token } = useAuth();
  const [data, setData] = useState<ProfileBundle | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const bundle = await apiFetch<ProfileBundle>("/profile", { token });
        if (!cancelled) {
          setData(bundle);
          setFirstName(bundle.profile?.firstName ?? "");
          setLastName(bundle.profile?.lastName ?? "");
          setPhone(bundle.profile?.phone ?? "");
          setAvatarUrl(bundle.profile?.avatarUrl ?? "");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t("loadError"));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, t]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      return;
    }
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const bundle = await apiFetch<ProfileBundle>("/profile", {
        method: "PATCH",
        token,
        body: JSON.stringify({
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          phone: phone.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
        }),
      });
      setData(bundle);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("saveError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          {t("account")}{" "}
          <span className="font-mono text-sm text-slate-800">
            {data?.user.email ?? "…"}
          </span>{" "}
          · {t("role")}{" "}
          <span className="font-mono text-sm text-slate-800">
            {data?.user.role ?? "…"}
          </span>
        </p>
      </div>
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-800">
          {error}
        </div>
      ) : null}
      {saved ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-base text-emerald-800">
          {t("saved")}
        </div>
      ) : null}
      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm ring-1 ring-slate-900/5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`${formId}-first`}
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              {t("firstName")}
            </label>
            <input
              id={`${formId}-first`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
          <div>
            <label
              htmlFor={`${formId}-last`}
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              {t("lastName")}
            </label>
            <input
              id={`${formId}-last`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor={`${formId}-phone`}
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            {t("phone")}
          </label>
          <input
            id={`${formId}-phone`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
        <div>
          <label
            htmlFor={`${formId}-avatar`}
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            {t("avatarUrl")}
          </label>
          <input
            id={`${formId}-avatar`}
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="min-h-12 rounded-xl bg-amber-600 px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-amber-500 disabled:opacity-50"
        >
          {busy ? t("saving") : t("saveProfile")}
        </button>
      </form>
    </div>
  );
}
