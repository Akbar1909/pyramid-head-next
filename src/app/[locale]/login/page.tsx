"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useAuth } from "@/contexts/auth-context";
import { Link, useRouter } from "@/i18n/navigation";

export default function LoginPage() {
  const t = useTranslations("LoginPage");
  const router = useRouter();
  const { login, token, user, isHydrated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isHydrated && token && user?.role === "ADMIN") {
      router.replace("/dashboard");
    }
  }, [isHydrated, token, user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof Error && err.message === "ADMIN_ONLY") {
        setError(t("adminOnly"));
      } else {
        setError(err instanceof Error ? err.message : t("signInFailed"));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200/80 px-4 py-12">
      <div className="absolute right-6 top-6">
        <LocaleSwitcher size="comfortable" />
      </div>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {t("title")}
          </h1>
          <p className="mt-3 text-lg text-slate-600">{t("subtitle")}</p>
        </div>
        <form
          onSubmit={onSubmit}
          className="space-y-6 rounded-2xl border border-slate-200/90 bg-white p-8 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5"
        >
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-800">
              {error}
            </div>
          ) : null}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              {t("password")}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="flex min-h-12 w-full items-center justify-center rounded-xl bg-amber-600 text-base font-semibold text-white shadow-sm transition-colors hover:bg-amber-500 disabled:opacity-50"
          >
            {busy ? t("signingIn") : t("signIn")}
          </button>
        </form>
        <p className="text-center text-base text-slate-600">
          <Link
            href="/"
            className="font-medium text-amber-800 underline decoration-amber-300 decoration-2 underline-offset-4 hover:text-amber-900"
          >
            {t("backToSite")}
          </Link>
        </p>
      </div>
    </div>
  );
}
