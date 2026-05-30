"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link, useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/env";
import {
  formatDateOnly,
  formatDateTime,
  fromDatetimeLocalValue,
  programApplicationStatusClass,
  toDatetimeLocalValue,
} from "@/lib/format";
import {
  ALL_PROGRAM_APPLICATION_STATUSES,
  useProgramApplicationStatusLabel,
} from "@/lib/program-application-status";
import type {
  ProgramApplicationDetail,
  ProgramApplicationStatus,
} from "@/lib/types";

export default function ApplicationDetailPage() {
  const t = useTranslations("DashboardApplications");
  const tDoc = useTranslations("DocumentTypes");
  const tCommon = useTranslations("Common");
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const { token } = useAuth();
  const statusLabel = useProgramApplicationStatusLabel();
  const [row, setRow] = useState<ProgramApplicationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ProgramApplicationStatus>("SUBMITTED");
  const [notes, setNotes] = useState("");
  const [interviewScheduledAt, setInterviewScheduledAt] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [enrolledAt, setEnrolledAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!token || !id) {
      return;
    }
    setError(null);
    try {
      const data = await apiFetch<ProgramApplicationDetail>(
        `/program-applications/${id}`,
        { token },
      );
      setRow(data);
      setStatus(data.status);
      setNotes(data.adminNotes ?? "");
      setInterviewScheduledAt(toDatetimeLocalValue(data.interviewScheduledAt));
      setInterviewNotes(data.interviewNotes ?? "");
      setEnrolledAt(toDatetimeLocalValue(data.enrolledAt));
    } catch (e) {
      setError(e instanceof Error ? e.message : tCommon("failedToLoad"));
    }
  }, [id, token, tCommon]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !id) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await apiFetch<ProgramApplicationDetail>(
        `/program-applications/${id}`,
        {
          method: "PATCH",
          token,
          body: JSON.stringify({
            status,
            adminNotes: notes.trim() || null,
            interviewScheduledAt:
              fromDatetimeLocalValue(interviewScheduledAt) ?? null,
            interviewNotes: interviewNotes.trim() || null,
            enrolledAt: fromDatetimeLocalValue(enrolledAt) ?? null,
          }),
        },
      );
      setRow(updated);
      setInterviewScheduledAt(
        toDatetimeLocalValue(updated.interviewScheduledAt),
      );
      setEnrolledAt(toDatetimeLocalValue(updated.enrolledAt));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!token || !id || !window.confirm(t("deleteConfirm"))) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await apiFetch(`/program-applications/${id}`, {
        method: "DELETE",
        token,
      });
      router.replace("/dashboard/applications");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("deleteError"));
    } finally {
      setDeleting(false);
    }
  }

  if (!row && !error) {
    return (
      <p className="text-center text-base text-slate-500">
        {tCommon("loading")}
      </p>
    );
  }

  if (error && !row) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <p className="text-red-800">{error}</p>
        <Link
          href="/dashboard/applications"
          className="inline-block font-medium text-sky-700 hover:text-sky-900"
        >
          {t("backToList")}
        </Link>
      </div>
    );
  }

  if (!row) {
    return null;
  }

  const base = getApiBaseUrl();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard/applications"
          className="text-sm font-medium text-sky-700 hover:text-sky-900"
        >
          {t("backToList")}
        </Link>
        <button
          type="button"
          disabled={deleting}
          onClick={() => void onDelete()}
          className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          {deleting ? t("deleting") : t("delete")}
        </button>
      </div>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          {t("detailTitle")}
        </h2>
        <p className="mt-1 text-lg font-medium text-slate-800">
          {row.firstName} {row.lastName}
        </p>
        <p className="text-slate-600">{row.email}</p>
        <p className="text-slate-600">{row.phone}</p>
        <p className="mt-2">
          <span
            className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${programApplicationStatusClass(row.status)}`}
          >
            {statusLabel(row.status)}
          </span>
        </p>
      </div>

      <dl className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("dob")}
          </dt>
          <dd className="mt-1 text-slate-800">
            {formatDateOnly(row.dateOfBirth)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("citizenship")}
          </dt>
          <dd className="mt-1 text-slate-800">{row.citizenship}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("preferredStartDate")}
          </dt>
          <dd className="mt-1 text-slate-800">
            {formatDateOnly(row.preferredStartDate)}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("program")}
          </dt>
          <dd className="mt-1 text-slate-800">
            {row.facultyProgram?.title ?? "—"}
          </dd>
        </div>
      </dl>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">
          {t("attachments")}
        </h3>
        <ul className="mt-3 space-y-2 text-sm">
          {row.attachments.map((a) => {
            const href = `${base}/files/uploads/${encodeURIComponent(a.storedFileId)}/download`;
            const label = a.storedFile.originalName ?? a.storedFileId;
            const docType = tDoc(
              (a.documentType || "other") as
                | "transcript"
                | "government_id"
                | "credentials"
                | "police_check"
                | "immunization"
                | "cpr_certification"
                | "other",
            );
            return (
              <li key={a.id}>
                <span className="mr-2 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {docType}
                </span>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-sky-700 underline underline-offset-2 hover:text-sky-900"
                >
                  {label}
                </a>
                <span className="ml-2 text-slate-500">
                  ({Math.round(a.storedFile.sizeBytes / 1024)} KB)
                </span>
              </li>
            );
          })}
        </ul>
        {row.attachments.length === 0 ? (
          <p className="mt-2 text-slate-500">{t("noAttachments")}</p>
        ) : null}
      </section>

      <form
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
        onSubmit={(e) => void onSave(e)}
      >
        <h3 className="text-lg font-semibold text-slate-900">{t("review")}</h3>
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
            htmlFor="app-status"
          >
            {t("colStatus")}
          </label>
          <select
            id="app-status"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as ProgramApplicationStatus)
            }
            className="mt-2 min-h-10 max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
          >
            {ALL_PROGRAM_APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
            htmlFor="app-interview-at"
          >
            {t("interviewScheduledAt")}
          </label>
          <input
            id="app-interview-at"
            type="datetime-local"
            value={interviewScheduledAt}
            onChange={(e) => setInterviewScheduledAt(e.target.value)}
            className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm"
          />
        </div>
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
            htmlFor="app-interview-notes"
          >
            {t("interviewNotes")}
          </label>
          <textarea
            id="app-interview-notes"
            value={interviewNotes}
            onChange={(e) => setInterviewNotes(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm"
          />
        </div>
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
            htmlFor="app-enrolled-at"
          >
            {t("enrolledAt")}
          </label>
          <input
            id="app-enrolled-at"
            type="datetime-local"
            value={enrolledAt}
            onChange={(e) => setEnrolledAt(e.target.value)}
            className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm"
          />
          <p className="mt-1 text-xs text-slate-500">{t("enrolledAtHint")}</p>
        </div>
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
            htmlFor="app-notes"
          >
            {t("adminNotes")}
          </label>
          <textarea
            id="app-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? t("saving") : t("save")}
        </button>
      </form>
    </div>
  );
}
