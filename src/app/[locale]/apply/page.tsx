"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense, useCallback, useEffect, useState } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link } from "@/i18n/navigation";
import {
  apiFetch,
  apiSubmitProgramApplication,
} from "@/lib/api/client";
import type {
  FacultyProgramRow,
  ProgramApplicationDocumentType,
  ProgramApplicationSubmitResponse,
} from "@/lib/types";

const CITIZENSHIPS = ["CA", "US", "UK", "INT"] as const;

const DOCUMENT_TYPES: ProgramApplicationDocumentType[] = [
  "transcript",
  "government_id",
  "credentials",
  "police_check",
  "immunization",
  "cpr_certification",
  "other",
];

type FileEntry = {
  file: File;
  documentType: ProgramApplicationDocumentType;
};

function ApplyFormInner() {
  const t = useTranslations("ApplyPage");
  const tHome = useTranslations("HomePage");
  const tDoc = useTranslations("DocumentTypes");
  const searchParams = useSearchParams();
  const programSlug = searchParams.get("program")?.trim() ?? "";

  const [programs, setPrograms] = useState<FacultyProgramRow[]>([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [citizenship, setCitizenship] = useState<(typeof CITIZENSHIPS)[number]>(
    "CA",
  );
  const [preferredStartDate, setPreferredStartDate] = useState("");
  const [whyProgram, setWhyProgram] = useState("");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProgramApplicationSubmitResponse | null>(
    null,
  );

  const loadPrograms = useCallback(async () => {
    setProgramsLoading(true);
    try {
      const data = await apiFetch<FacultyProgramRow[]>(
        "/faculty-programs/published",
      );
      setPrograms(data);
      if (programSlug) {
        const match = data.find((p) => p.slug === programSlug);
        if (match) {
          setSelectedProgramId(match.id);
        }
      }
    } catch {
      setPrograms([]);
    } finally {
      setProgramsLoading(false);
    }
  }, [programSlug]);

  useEffect(() => {
    void loadPrograms();
  }, [loadPrograms]);

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);
  const canApply =
    !selectedProgram || selectedProgram.acceptingApplications !== false;

  function onAddFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files;
    e.target.value = "";
    if (!picked?.length) {
      return;
    }
    setFiles((prev) => [
      ...prev,
      ...Array.from(picked).map((file) => ({
        file,
        documentType: "other" as ProgramApplicationDocumentType,
      })),
    ]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function setFileType(index: number, documentType: ProgramApplicationDocumentType) {
    setFiles((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, documentType } : entry,
      ),
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedProgram && !selectedProgram.acceptingApplications) {
      setError(t("programNotAccepting"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("firstName", firstName.trim());
      formData.append("lastName", lastName.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("dateOfBirth", dateOfBirth);
      formData.append("citizenship", citizenship);
      formData.append("preferredStartDate", preferredStartDate);
      if (selectedProgramId) {
        formData.append("facultyProgramId", selectedProgramId);
      }
      const trimmedWhy = whyProgram.trim();
      if (trimmedWhy) {
        formData.append(
          "supplementaryAnswers",
          JSON.stringify({ whyProgram: trimmedWhy }),
        );
      }
      if (files.length > 0) {
        formData.append(
          "documentTypes",
          JSON.stringify(files.map((f) => f.documentType)),
        );
        for (const entry of files) {
          formData.append("files", entry.file);
        }
      }
      const response = await apiSubmitProgramApplication(formData);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
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
      <div className="mx-auto mt-12 max-w-2xl">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-slate-900">
          {t("title")}
        </h1>
        <p className="mt-3 text-center text-base text-slate-600">
          {t("subtitle")}
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          {t("paymentComingSoon")}
        </p>

        {result ? (
          <output
            className="mt-10 block space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-emerald-900"
            aria-live="polite"
          >
            <p className="text-lg font-medium">{t("success")}</p>
            <p className="text-sm">{t("trackingTokenHint")}</p>
            <p className="rounded-lg bg-white px-4 py-3 font-mono text-sm text-slate-800">
              {result.trackingToken}
            </p>
            <Link
              href={`/track?token=${encodeURIComponent(result.trackingToken)}`}
              className="inline-flex rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              {t("trackNow")}
            </Link>
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

            <div>
              <label htmlFor="apply-program" className={labelClass}>
                {t("program")}
              </label>
              <select
                id="apply-program"
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                disabled={programsLoading}
                className={fieldClass}
              >
                <option value="">{t("programOptional")}</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                    {!p.acceptingApplications ? ` (${t("comingSoonLabel")})` : ""}
                  </option>
                ))}
              </select>
              {selectedProgram && !selectedProgram.acceptingApplications ? (
                <p className="mt-2 text-sm text-amber-800">
                  {t("programNotAccepting")}
                </p>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="apply-first" className={labelClass}>
                  {t("firstName")}
                </label>
                <input
                  id="apply-first"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={fieldClass}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label htmlFor="apply-last" className={labelClass}>
                  {t("lastName")}
                </label>
                <input
                  id="apply-last"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={fieldClass}
                  autoComplete="family-name"
                />
              </div>
              <div>
                <label htmlFor="apply-email" className={labelClass}>
                  {t("email")}
                </label>
                <input
                  id="apply-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldClass}
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="apply-phone" className={labelClass}>
                  {t("phone")}
                </label>
                <input
                  id="apply-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={fieldClass}
                  autoComplete="tel"
                />
              </div>
              <div>
                <label htmlFor="apply-dob" className={labelClass}>
                  {t("dateOfBirth")}
                </label>
                <input
                  id="apply-dob"
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="apply-citizenship" className={labelClass}>
                  {t("citizenship")}
                </label>
                <select
                  id="apply-citizenship"
                  value={citizenship}
                  onChange={(e) =>
                    setCitizenship(e.target.value as (typeof CITIZENSHIPS)[number])
                  }
                  className={fieldClass}
                >
                  {CITIZENSHIPS.map((c) => (
                    <option key={c} value={c}>
                      {t(`citizenship_${c}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="apply-start" className={labelClass}>
                  {t("preferredStartDate")}
                </label>
                <input
                  id="apply-start"
                  type="date"
                  required
                  value={preferredStartDate}
                  onChange={(e) => setPreferredStartDate(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="apply-why" className={labelClass}>
                  {t("whyProgram")}
                </label>
                <textarea
                  id="apply-why"
                  rows={4}
                  value={whyProgram}
                  onChange={(e) => setWhyProgram(e.target.value)}
                  className={fieldClass}
                  placeholder={t("whyProgramPlaceholder")}
                />
              </div>
            </div>

            <div>
              <span className={labelClass}>{t("documents")}</span>
              <p className="mb-3 text-sm text-slate-600">{t("documentsHint")}</p>
              <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={onAddFiles}
                className="block text-sm text-slate-700 file:mr-4 file:rounded-xl file:border file:border-slate-300 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium"
              />
              {files.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {files.map((entry, index) => (
                    <li
                      key={`${entry.file.name}-${index}`}
                      className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm text-slate-800">
                        {entry.file.name}
                      </span>
                      <select
                        value={entry.documentType}
                        onChange={(e) =>
                          setFileType(
                            index,
                            e.target.value as ProgramApplicationDocumentType,
                          )
                        }
                        className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                      >
                        {DOCUMENT_TYPES.map((dt) => (
                          <option key={dt} value={dt}>
                            {tDoc(dt)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        {t("removeFile")}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={busy || !canApply}
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

export default function ApplyPage() {
  const t = useTranslations("Common");
  return (
    <Suspense
      fallback={
        <p className="py-20 text-center text-slate-500">{t("loading")}</p>
      }
    >
      <ApplyFormInner />
    </Suspense>
  );
}
