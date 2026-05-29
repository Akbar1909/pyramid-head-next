"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { RichTextEditor } from "@/components/rich-text-editor";
import { ThumbnailPicker } from "@/components/thumbnail-picker";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "@/i18n/navigation";
import { apiFetch, apiUploadFile } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/env";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/format";
import { isHtmlContentEmpty } from "@/lib/html-content";
import type { EventRow } from "@/lib/types";

type Props = {
  mode: "create" | "edit";
  initial?: EventRow | null;
};

type EventFormValues = {
  title: string;
  slug: string;
  body: string;
  startsLocal: string;
  endsLocal: string;
  location: string;
  publishedLocal: string;
  thumbnailId: string;
  clearThumbnail: boolean;
  unpublish: boolean;
};

function eventDefaults(initial?: EventRow | null): EventFormValues {
  return {
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    body: initial?.body ?? "",
    startsLocal: toDatetimeLocalValue(initial?.startsAt ?? null),
    endsLocal: toDatetimeLocalValue(initial?.endsAt ?? null),
    location: initial?.location ?? "",
    publishedLocal: toDatetimeLocalValue(initial?.publishedAt ?? null),
    thumbnailId: initial?.thumbnail?.id ?? "",
    clearThumbnail: false,
    unpublish: false,
  };
}

export function EventForm({ mode, initial }: Props) {
  const t = useTranslations("EventForm");
  const tCommon = useTranslations("Common");
  const formId = useId();
  const router = useRouter();
  const { token } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    defaultValues: eventDefaults(initial),
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset only when record id changes
  useEffect(() => {
    reset(eventDefaults(initial));
  }, [initial?.id, reset]);

  const uploadImage = useCallback(
    async (file: File) => {
      if (!token) {
        throw new Error(t("imageUploadNeedSignIn"));
      }
      const res = await apiUploadFile(token, file);
      return `${getApiBaseUrl()}/files/uploads/${encodeURIComponent(res.id)}`;
    },
    [token, t],
  );

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30";
  const inputError = (name: keyof EventFormValues) =>
    errors[name] ? "border-red-600 ring-red-600/40" : "";

  const onValid = async (data: EventFormValues) => {
    if (!token) {
      return;
    }
    const startsAt = fromDatetimeLocalValue(data.startsLocal);
    if (!startsAt) {
      setError("startsLocal", {
        type: "validate",
        message: t("startRequired"),
      });
      return;
    }
    try {
      const endsAt = fromDatetimeLocalValue(data.endsLocal);
      const publishedAt = fromDatetimeLocalValue(data.publishedLocal);
      if (mode === "create") {
        await apiFetch<EventRow>("/events", {
          method: "POST",
          token,
          body: JSON.stringify({
            title: data.title.trim(),
            ...(data.slug.trim() ? { slug: data.slug.trim() } : {}),
            body: data.body,
            startsAt,
            ...(endsAt !== undefined ? { endsAt } : {}),
            ...(data.location.trim() ? { location: data.location.trim() } : {}),
            ...(publishedAt !== undefined ? { publishedAt } : {}),
            ...(data.thumbnailId.trim()
              ? { thumbnailId: data.thumbnailId.trim() }
              : {}),
          }),
        });
      } else if (initial) {
        const payload: Record<string, unknown> = {
          title: data.title.trim(),
          slug: data.slug.trim(),
          body: data.body,
          startsAt,
          endsAt: endsAt ?? null,
          location: data.location.trim(),
        };
        if (data.unpublish) {
          payload.unpublish = true;
        } else if (publishedAt !== undefined) {
          payload.publishedAt = publishedAt;
        }
        const hadStoredThumbnail = Boolean(initial.thumbnail?.id);
        if (data.clearThumbnail) {
          payload.clearThumbnail = true;
        } else if (data.thumbnailId.trim()) {
          payload.thumbnailId = data.thumbnailId.trim();
        } else if (hadStoredThumbnail) {
          payload.clearThumbnail = true;
        }
        await apiFetch<EventRow>(`/events/${initial.id}`, {
          method: "PATCH",
          token,
          body: JSON.stringify(payload),
        });
      }
      router.push("/dashboard/events");
      router.refresh();
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : t("saveFailed"),
      });
    }
  };

  const startsField = register("startsLocal", {
    validate: (v) =>
      fromDatetimeLocalValue(v) !== undefined ? true : t("startRequired"),
  });

  const publishedField = register("publishedLocal");

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      className="mx-auto max-w-3xl space-y-8 text-[0.9375rem] leading-relaxed"
      noValidate
    >
      {errors.root?.message ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-800">
          {errors.root.message}
        </div>
      ) : null}
      <div>
        <label
          htmlFor={`${formId}-title`}
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          {t("title")}
        </label>
        <input
          id={`${formId}-title`}
          className={`${inputClass} ${inputError("title")}`}
          {...register("title", { required: t("titleRequired") })}
        />
        {errors.title?.message ? (
          <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
        ) : null}
      </div>
      <div>
        <label
          htmlFor={`${formId}-slug`}
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          {t("slug")}
        </label>
        <input
          id={`${formId}-slug`}
          placeholder={t("slugPlaceholder")}
          className={`${inputClass} placeholder:text-slate-400`}
          {...register("slug")}
        />
      </div>
      <div>
        <label
          id={`${formId}-body-label`}
          htmlFor={`${formId}-body`}
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          {t("body")}
        </label>
        <Controller
          name="body"
          control={control}
          rules={{
            validate: (v) =>
              !isHtmlContentEmpty(v) ? true : t("bodyRequired"),
          }}
          render={({ field, fieldState }) => (
            <>
              <RichTextEditor
                instanceKey={initial?.id ?? "new"}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                labelId={`${formId}-body-label`}
                editorId={`${formId}-body`}
                placeholder={t("richTextPlaceholder")}
                uploadImage={uploadImage}
              />
              {fieldState.error?.message ? (
                <p className="mt-1 text-xs text-red-400">
                  {fieldState.error.message}
                </p>
              ) : null}
            </>
          )}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${formId}-starts`}
            className="mb-2 block text-sm font-semibold text-slate-800"
          >
            {t("startsAt")}
          </label>
          <input
            id={`${formId}-starts`}
            type="datetime-local"
            className={`${inputClass} ${inputError("startsLocal")}`}
            {...startsField}
          />
          {errors.startsLocal?.message ? (
            <p className="mt-1 text-xs text-red-400">
              {errors.startsLocal.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor={`${formId}-ends`}
            className="mb-2 block text-sm font-semibold text-slate-800"
          >
            {t("endsAt")}
          </label>
          <input
            id={`${formId}-ends`}
            type="datetime-local"
            className={inputClass}
            {...register("endsLocal")}
          />
        </div>
      </div>
      <div>
        <label
          htmlFor={`${formId}-location`}
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          {t("location")}
        </label>
        <input
          id={`${formId}-location`}
          className={inputClass}
          {...register("location")}
        />
      </div>
      <div>
        <label
          htmlFor={`${formId}-published`}
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          {t("publishAt")}
        </label>
        <input
          id={`${formId}-published`}
          type="datetime-local"
          className={`rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${inputError("publishedLocal")}`}
          {...publishedField}
          onChange={(e) => {
            publishedField.onChange(e);
            setValue("unpublish", false, { shouldDirty: true });
          }}
        />
      </div>
      {mode === "edit" ? (
        <Controller
          name="unpublish"
          control={control}
          render={({ field }) => (
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-slate-800">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => {
                  field.onChange(e.target.checked);
                  if (e.target.checked) {
                    setValue("publishedLocal", "", { shouldDirty: true });
                  }
                }}
              />
              {t("unpublish")}
            </label>
          )}
        />
      ) : null}
      <Controller
        name="thumbnailId"
        control={control}
        render={({ field }) => (
          <ThumbnailPicker value={field.value} onChange={field.onChange} />
        )}
      />
      {mode === "edit" && initial?.thumbnail ? (
        <Controller
          name="clearThumbnail"
          control={control}
          render={({ field }) => (
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-slate-800">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              {t("removeThumbnail")}
            </label>
          )}
        />
      ) : null}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-12 rounded-xl bg-amber-600 px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-amber-500 disabled:opacity-50"
        >
          {isSubmitting
            ? t("saving")
            : mode === "create"
              ? t("create")
              : t("saveChanges")}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
        >
          {tCommon("cancel")}
        </button>
      </div>
    </form>
  );
}
