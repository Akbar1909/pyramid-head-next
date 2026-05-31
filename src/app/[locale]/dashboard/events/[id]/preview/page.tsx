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
  eventFormatClass,
  eventPublishState,
  formatDateTime,
  publishBadgeClass,
} from "@/lib/format";
import type { EventFormat, EventRow } from "@/lib/types";

export default function EventPreviewPage() {
  const t = useTranslations("ContentPreview");
  const tEvents = useTranslations("DashboardEvents");
  const tStatus = useTranslations("Common.status");
  const tCommon = useTranslations("Common");
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { token } = useAuth();
  const [row, setRow] = useState<EventRow | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const notFoundLabel = t("notFound");

  useEffect(() => {
    if (!token || !id) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<EventRow>(`/events/${id}`, { token });
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
          href="/dashboard/events"
          className="text-base font-medium text-amber-800 hover:text-amber-900"
        >
          {t("backToEvents")}
        </Link>
      </div>
    );
  }

  if (row === undefined) {
    return <p className="text-base text-slate-600">{tCommon("loading")}</p>;
  }

  const st = eventPublishState(row.publishedAt);
  const eventFormat = row.format ?? "IN_PERSON";
  const regCount = row._count?.registrations ?? 0;
  const thumbSrc = row.thumbnail
    ? apiAssetUrl(`/files/uploads/${encodeURIComponent(row.thumbnail.id)}`)
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-base">
          <Link
            href="/dashboard/events"
            className="font-medium text-slate-700 underline decoration-slate-300 decoration-2 underline-offset-4 hover:text-amber-900"
          >
            {t("backToEvents")}
          </Link>
          <span className="text-slate-300">·</span>
          <Link
            href={`/dashboard/events/${id}/edit`}
            className="font-medium text-amber-800 hover:text-amber-900"
          >
            {tCommon("edit")}
          </Link>
          {row.registrationEnabled ? (
            <>
              <span className="text-slate-300">·</span>
              <Link
                href={`/dashboard/events/${id}/registrations`}
                className="font-medium text-sky-700 hover:text-sky-900"
              >
                {tEvents("registrations")} ({regCount})
              </Link>
            </>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-block rounded-md px-3 py-1 text-sm font-semibold ${eventFormatClass(eventFormat)}`}
          >
            {tEvents(`format_${eventFormat}`)}
          </span>
          <span
            className={`inline-block rounded-md px-3 py-1 text-sm font-semibold ${publishBadgeClass(st)}`}
          >
            {tStatus(st)}
          </span>
        </div>
      </div>

      <article className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm ring-1 ring-slate-900/5 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("eventKicker")}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {row.title}
        </h1>
        <dl className="mt-6 space-y-2 text-base text-slate-600">
          <div>
            <dt className="inline font-medium text-slate-500">{t("starts")}</dt>{" "}
            <dd className="inline text-slate-900">
              <time dateTime={row.startsAt}>
                {formatDateTime(row.startsAt)}
              </time>
            </dd>
          </div>
          {row.endsAt ? (
            <div>
              <dt className="inline font-medium text-slate-500">{t("ends")}</dt>{" "}
              <dd className="inline text-slate-900">
                <time dateTime={row.endsAt}>{formatDateTime(row.endsAt)}</time>
              </dd>
            </div>
          ) : null}
          {row.location ? (
            <div>
              <dt className="inline font-medium text-slate-500">
                {eventFormat === "ONLINE"
                  ? tEvents("locationOnline")
                  : eventFormat === "HYBRID"
                    ? tEvents("locationHybrid")
                    : tEvents("locationInPerson")}
              </dt>{" "}
              <dd className="inline text-slate-900">{row.location}</dd>
            </div>
          ) : null}
          {row.registrationEnabled ? (
            <div>
              <dt className="inline font-medium text-slate-500">
                {tEvents("colRegistrations")}
              </dt>{" "}
              <dd className="inline text-slate-900">{regCount}</dd>
            </div>
          ) : null}
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
