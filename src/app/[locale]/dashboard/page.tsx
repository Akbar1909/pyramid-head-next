"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import {
  eventPublishState,
  newsPublishState,
  publishBadgeClass,
} from "@/lib/format";
import type { EventRow, NewsRow } from "@/lib/types";

export default function DashboardHomePage() {
  const t = useTranslations("DashboardOverview");
  const tStatus = useTranslations("Common.status");
  const tCommon = useTranslations("Common");
  const { token } = useAuth();
  const [news, setNews] = useState<NewsRow[] | null>(null);
  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [n, ev] = await Promise.all([
          apiFetch<NewsRow[]>("/news", { token }),
          apiFetch<EventRow[]>("/events", { token }),
        ]);
        if (!cancelled) {
          setNews(n);
          setEvents(ev);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : tCommon("failedToLoad"));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, tCommon]);

  const newsDrafts =
    news?.filter((x) => newsPublishState(x.publishedAt) === "draft").length ??
    0;
  const newsScheduled =
    news?.filter((x) => newsPublishState(x.publishedAt) === "scheduled")
      .length ?? 0;
  const newsPub =
    news?.filter((x) => newsPublishState(x.publishedAt) === "published")
      .length ?? 0;

  const evDrafts =
    events?.filter((x) => eventPublishState(x.publishedAt) === "draft")
      .length ?? 0;
  const evScheduled =
    events?.filter((x) => eventPublishState(x.publishedAt) === "scheduled")
      .length ?? 0;
  const evPub =
    events?.filter((x) => eventPublishState(x.publishedAt) === "published")
      .length ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 lg:text-lg">
          {t("subtitle")}
        </p>
      </div>
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-800">
          {error}
        </div>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("news")}
          total={news?.length ?? "—"}
          href="/dashboard/news"
          lines={[
            { label: t("published"), value: news ? newsPub : "—" },
            { label: t("scheduled"), value: news ? newsScheduled : "—" },
            { label: t("drafts"), value: news ? newsDrafts : "—" },
          ]}
        />
        <StatCard
          title={t("events")}
          total={events?.length ?? "—"}
          href="/dashboard/events"
          lines={[
            { label: t("published"), value: events ? evPub : "—" },
            { label: t("scheduled"), value: events ? evScheduled : "—" },
            { label: t("drafts"), value: events ? evDrafts : "—" },
          ]}
        />
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
          <h3 className="text-base font-semibold text-slate-800">
            {t("quickActions")}
          </h3>
          <ul className="mt-4 space-y-3 text-[0.9375rem]">
            <li>
              <Link
                href="/dashboard/news/new"
                className="font-medium text-amber-800 underline decoration-amber-300 decoration-2 underline-offset-4 hover:text-amber-900"
              >
                {t("newArticle")}
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/events/new"
                className="font-medium text-amber-800 underline decoration-amber-300 decoration-2 underline-offset-4 hover:text-amber-900"
              >
                {t("newEvent")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-800">
            {t("recentNews")}
          </h3>
        </div>
        <ul className="divide-y divide-slate-200">
          {(news ?? []).slice(0, 5).map((item) => {
            const st = newsPublishState(item.publishedAt);
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50/80"
              >
                <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium text-slate-900">
                  {item.title}
                </span>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold ${publishBadgeClass(st)}`}
                  >
                    {tStatus(st)}
                  </span>
                  <Link
                    href={`/dashboard/news/${item.id}/edit`}
                    className="text-[0.9375rem] font-medium text-amber-800 hover:text-amber-900"
                  >
                    {tCommon("edit")}
                  </Link>
                </div>
              </li>
            );
          })}
          {!news?.length ? (
            <li className="px-5 py-10 text-center text-base text-slate-500">
              {t("noArticles")}
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  title,
  total,
  href,
  lines,
}: {
  title: string;
  total: number | string;
  href: string;
  lines: { label: string; value: number | string }[];
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition-all hover:border-slate-300 hover:shadow-md"
    >
      <h3 className="text-base font-semibold text-slate-600">{title}</h3>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 tabular-nums">
        {total}
      </p>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600">
        {lines.map((l) => (
          <li key={l.label}>
            {l.label}:{" "}
            <span className="font-medium text-slate-800">{l.value}</span>
          </li>
        ))}
      </ul>
    </Link>
  );
}
