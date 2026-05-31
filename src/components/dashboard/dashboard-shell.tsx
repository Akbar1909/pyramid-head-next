"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { PyramidLogo } from "@/components/pyramid-logo";
import { useAuth } from "@/contexts/auth-context";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("DashboardShell");
  const pathname = usePathname();
  const router = useRouter();
  const { token, user, isHydrated, isLoadingUser, logout } = useAuth();

  const nav = useMemo(
    () => [
      {
        href: "/dashboard",
        label: t("navOverview"),
        match: (p: string) => p === "/dashboard",
      },
      {
        href: "/dashboard/news",
        label: t("navNews"),
        match: (p: string) =>
          p === "/dashboard/news" || p.startsWith("/dashboard/news/"),
      },
      {
        href: "/dashboard/events",
        label: t("navEvents"),
        match: (p: string) =>
          p === "/dashboard/events" || p.startsWith("/dashboard/events/"),
      },
      {
        href: "/dashboard/tour-bookings",
        label: t("navTourBookings"),
        match: (p: string) => p.startsWith("/dashboard/tour-bookings"),
      },
      {
        href: "/dashboard/applications",
        label: t("navApplications"),
        match: (p: string) => p.startsWith("/dashboard/applications"),
      },
      {
        href: "/dashboard/career-quiz",
        label: t("navCareerQuiz"),
        match: (p: string) => p.startsWith("/dashboard/career-quiz"),
      },
      {
        href: "/dashboard/faculty",
        label: t("navFaculty"),
        match: (p: string) => p.startsWith("/dashboard/faculty"),
      },
      {
        href: "/dashboard/profile",
        label: t("navProfile"),
        match: (p: string) => p.startsWith("/dashboard/profile"),
      },
    ],
    [t],
  );

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (!token) {
      router.replace("/login");
    }
  }, [isHydrated, token, router]);

  if (!isHydrated || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        <p className="text-base">{t("loading")}</p>
      </div>
    );
  }

  if (isLoadingUser && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        <p className="text-base">{t("verifying")}</p>
      </div>
    );
  }

  if (user && user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-100 px-8 text-center text-slate-800">
        <p className="max-w-lg text-base leading-relaxed">
          {t("roleMessage", { email: user.email, role: user.role })}
        </p>
        <button
          type="button"
          onClick={() => {
            logout();
            router.replace("/login");
          }}
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
        >
          {t("signOut")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800 antialiased">
      <aside className="flex w-[17.5rem] shrink-0 flex-col bg-slate-900 text-slate-100 shadow-xl shadow-slate-900/20">
        <div className="border-b border-slate-700/80 px-5 py-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 text-white"
          >
            <PyramidLogo className="h-10 w-10 shrink-0" />
            <span className="text-lg font-semibold leading-tight tracking-tight">
              {t("brand")}
            </span>
          </Link>
          <p className="mt-2 text-sm leading-snug text-slate-400">
            {t("adminBadge")}
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-3 text-[0.9375rem] font-medium leading-snug transition-colors ${
                  active
                    ? "bg-slate-800 text-white shadow-inner ring-1 ring-slate-600/80"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-700/80 p-4">
          {user ? (
            <p
              className="truncate px-1 text-sm leading-relaxed text-slate-400"
              title={user.email}
            >
              {user.email}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="mt-3 w-full rounded-xl border border-slate-600 bg-slate-800/50 px-3 py-3 text-left text-[0.9375rem] font-medium text-slate-100 transition-colors hover:bg-slate-800"
          >
            {t("signOut")}
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 shrink-0 items-center justify-between gap-6 border-b border-slate-200/90 bg-white/95 px-6 py-3 shadow-sm backdrop-blur-md lg:px-10">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 lg:text-xl">
            {nav.find((n) => n.match(pathname))?.label ?? t("headerFallback")}
          </h1>
          <LocaleSwitcher size="comfortable" variant="light" />
        </header>
        <main className="flex-1 overflow-auto px-6 py-8 text-[0.9375rem] leading-relaxed text-slate-700 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
