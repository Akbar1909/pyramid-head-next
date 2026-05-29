"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FacultyProgramForm } from "@/components/faculty-program-form";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import type { FacultyProgramRow } from "@/lib/types";

export default function EditFacultyProgramPage() {
  const t = useTranslations("DashboardFaculty");
  const tCommon = useTranslations("Common");
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { token } = useAuth();
  const [row, setRow] = useState<FacultyProgramRow | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<FacultyProgramRow>(`/faculty-programs/${id}`, {
          token,
        });
        if (!cancelled) {
          setRow(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t("loadError"));
          setRow(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, id, t]);

  if (error || row === null) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <p className="text-base text-red-600">{error ?? t("notFound")}</p>
        <Link
          href="/dashboard/faculty"
          className="text-base font-medium text-amber-800 hover:text-amber-900"
        >
          {t("backToList")}
        </Link>
      </div>
    );
  }

  if (row === undefined) {
    return <p className="text-base text-slate-600">{tCommon("loading")}</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <p className="text-base">
        <Link
          href="/dashboard/faculty"
          className="font-medium text-amber-800 hover:text-amber-900"
        >
          {t("backToList")}
        </Link>
      </p>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
        {t("editTitle")}
      </h2>
      <FacultyProgramForm key={row.id} mode="edit" initial={row} />
    </div>
  );
}
