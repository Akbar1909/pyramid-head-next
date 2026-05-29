"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { NewsForm } from "@/components/news-form";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import type { NewsRow } from "@/lib/types";

export default function EditNewsPage() {
  const t = useTranslations("EditNewsPage");
  const tList = useTranslations("DashboardNews");
  const tCommon = useTranslations("Common");
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { token } = useAuth();
  const [row, setRow] = useState<NewsRow | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

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
          setError(e instanceof Error ? e.message : "Not found");
          setRow(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, id]);

  if (error || row === null) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <p className="text-base text-red-600">{error ?? t("notFound")}</p>
        <Link
          href="/dashboard/news"
          className="text-base font-medium text-amber-800 hover:text-amber-900"
        >
          {t("back")}
        </Link>
      </div>
    );
  }

  if (row === undefined) {
    return <p className="text-base text-slate-600">{tCommon("loading")}</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-base leading-relaxed text-slate-700">
        <Link
          href="/dashboard/news"
          className="font-medium text-slate-700 underline decoration-slate-300 decoration-2 underline-offset-4 hover:text-amber-900"
        >
          {t("back")}
        </Link>
        <span className="mx-3 text-slate-300">·</span>
        <Link
          href={`/dashboard/news/${id}/preview`}
          className="font-medium text-amber-800 hover:text-amber-900"
        >
          {tList("preview")}
        </Link>
      </p>
      <NewsForm key={id} mode="edit" initial={row} />
    </div>
  );
}
