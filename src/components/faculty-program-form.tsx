"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { FacultyProgramFormBodyEditor } from "@/components/faculty-program-form-body-editor";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import { FACULTY_PROGRAM_ICON_KEYS } from "@/lib/faculty-program-icon-keys";
import type { FacultyProgramRow } from "@/lib/types";

function richBodyToPayload(html: string): string | null {
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/\u00a0/g, " ")
    .trim();
  if (!text.length) {
    return null;
  }
  return html.trimEnd();
}

type Props = {
  mode: "create" | "edit";
  initial?: FacultyProgramRow | null;
};

export function FacultyProgramForm({ mode, initial }: Props) {
  const t = useTranslations("DashboardFaculty");
  const tCommon = useTranslations("Common");
  const formId = useId();
  const router = useRouter();
  const { token } = useAuth();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [iconKey, setIconKey] = useState(() => {
    const k = initial?.iconKey;
    if (k && (FACULTY_PROGRAM_ICON_KEYS as readonly string[]).includes(k)) {
      return k;
    }
    return "generic";
  });
  const [sortOrder, setSortOrder] = useState(
    initial != null ? String(initial.sortOrder) : "0",
  );
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-800";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      return;
    }
    const order = Number.parseInt(sortOrder, 10);
    if (!Number.isFinite(order) || order < 0) {
      setError(t("sortOrderInvalid"));
      return;
    }
    if (!description.trim()) {
      setError(t("descriptionRequired"));
      return;
    }
    setBusy(true);
    setError(null);
    const bodyPayload = richBodyToPayload(body);
    try {
      if (mode === "create") {
        await apiFetch<FacultyProgramRow>("/faculty-programs", {
          method: "POST",
          token,
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            ...(bodyPayload != null ? { body: bodyPayload } : {}),
            iconKey,
            sortOrder: order,
            isPublished,
          }),
        });
      } else if (initial) {
        await apiFetch<FacultyProgramRow>(`/faculty-programs/${initial.id}`, {
          method: "PATCH",
          token,
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            body: bodyPayload,
            iconKey,
            sortOrder: order,
            isPublished,
          }),
        });
      }
      router.push("/dashboard/faculty");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("saveError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/5"
    >
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-800">
          {error}
        </div>
      ) : null}
      <div>
        <label htmlFor={`${formId}-title`} className={labelClass}>
          {t("fieldTitle")}
        </label>
        <input
          id={`${formId}-title`}
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor={`${formId}-desc`} className={labelClass}>
          {t("fieldDescription")}
        </label>
        <p className="mb-2 text-sm text-slate-600">{t("descriptionCardHint")}</p>
        <textarea
          id={`${formId}-desc`}
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
          placeholder={t("descriptionPlaceholder")}
        />
      </div>
      <div>
        <span id={`${formId}-body-label`} className={labelClass}>
          {t("fieldBody")}
        </span>
        <p className="mb-2 text-sm text-slate-600">{t("bodyRichHint")}</p>
        <FacultyProgramFormBodyEditor
          instanceKey={`body-${mode}-${initial?.id ?? "new"}`}
          labelId={`${formId}-body-label`}
          editorId={`${formId}-body`}
          value={body}
          onChange={setBody}
          placeholder={t("bodyPlaceholder")}
        />
      </div>
      <div>
        <label htmlFor={`${formId}-icon`} className={labelClass}>
          {t("iconKey")}
        </label>
        <select
          id={`${formId}-icon`}
          value={iconKey}
          onChange={(e) => setIconKey(e.target.value)}
          className={inputClass}
        >
          {FACULTY_PROGRAM_ICON_KEYS.map((key) => (
            <option key={key} value={key}>
              {t(`iconPreset_${key}`)}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-slate-600">{t("iconKeyHelp")}</p>
      </div>
      <div>
        <label htmlFor={`${formId}-order`} className={labelClass}>
          {t("sortOrder")}
        </label>
        <input
          id={`${formId}-order`}
          type="number"
          min={0}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className={inputClass}
        />
      </div>
      <label className="flex cursor-pointer items-start gap-3 text-base text-slate-800">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="mt-1 h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
        />
        <span>{t("published")}</span>
      </label>
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={busy}
          className="min-h-12 rounded-xl bg-amber-600 px-6 text-base font-semibold text-white shadow-sm hover:bg-amber-500 disabled:opacity-50"
        >
          {busy ? t("saving") : mode === "create" ? t("create") : tCommon("save")}
        </button>
      </div>
    </form>
  );
}
