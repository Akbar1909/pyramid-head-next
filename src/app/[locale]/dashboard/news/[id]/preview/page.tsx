"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { SanitizedHtmlBody } from "@/components/sanitized-html-body";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import { apiAssetUrl } from "@/lib/env";
import {
  formatDateTime,
  newsPublishState,
  publishBadgeClass,
} from "@/lib/format";
import type { NewsRow } from "@/lib/types";

export default function NewsPreviewPage() {
  const t = useTranslations("ContentPreview");
  const tStatus = useTranslations("Common.status");
  const tCommon = useTranslations("Common");
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { token } = useAuth();
  const [row, setRow] = useState<NewsRow | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const notFoundLabel = t("notFound");

  useEffect(() => {
    if (!token || !id) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<NewsRow>(`/news/${id}`, { token });
        if (!cancelled) {
          setRow(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : notFoundLabel);
          setRow(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, id, notFoundLabel]);

  if (error || row === null) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <p className="text-base text-red-600">{error ?? t("notFound")}</p>
        <Link
          href="/dashboard/news"
          className="text-base font-medium text-amber-800 hover:text-amber-900"
        >
          {t("backToNews")}
        </Link>
      </div>
    );
  }

  if (row === undefined) {
    return <p className="text-base text-slate-600">{tCommon("loading")}</p>;
  }

  const st = newsPublishState(row.publishedAt);
  const thumbSrc = row.thumbnail
    ? apiAssetUrl(`/files/uploads/${encodeURIComponent(row.thumbnail.id)}`)
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-base">
          <Link
            href="/dashboard/news"
            className="font-medium text-slate-700 underline decoration-slate-300 decoration-2 underline-offset-4 hover:text-amber-900"
          >
            {t("backToNews")}
          </Link>
          <span className="text-slate-300">·</span>
          <Link
            href={`/dashboard/news/${id}/edit`}
            className="font-medium text-amber-800 hover:text-amber-900"
          >
            {tCommon("edit")}
          </Link>
        </div>
        <span
          className={`inline-block rounded-md px-3 py-1 text-sm font-semibold ${publishBadgeClass(st)}`}
        >
          {tStatus(st)}
        </span>
      </div>

      <article className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm ring-1 ring-slate-900/5 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("newsKicker")}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {row.title}
        </h1>
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-base text-slate-600">
          <div>
            <dt className="inline font-medium text-slate-500">
              {t("published")}
            </dt>{" "}
            <dd className="inline text-slate-900">
              {row.publishedAt
                ? formatDateTime(row.publishedAt)
                : t("notPublished")}
            </dd>
          </div>
          <div>
            <dt className="inline font-medium text-slate-500">{t("author")}</dt>{" "}
            <dd className="inline text-slate-900">{row.author.email}</dd>
          </div>
        </dl>
        {thumbSrc ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            {/* biome-ignore lint/performance/noImgElement: remote API URL */}
            <img
              src={thumbSrc}
              alt=""
              className="max-h-[360px] w-full object-cover"
            />
          </div>
        ) : null}
        <div className="mt-10 border-t border-slate-200 pt-10">
          <SanitizedHtmlBody
            html={row.body}
            className="text-base leading-relaxed"
          />
        </div>
      </article>
    </div>
  );
}
