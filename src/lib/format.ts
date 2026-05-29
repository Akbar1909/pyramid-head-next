export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export type PublishState = "draft" | "scheduled" | "published";

export function newsPublishState(publishedAt: string | null): PublishState {
  if (!publishedAt) {
    return "draft";
  }
  const t = new Date(publishedAt).getTime();
  if (Number.isNaN(t)) {
    return "draft";
  }
  if (t > Date.now()) {
    return "scheduled";
  }
  return "published";
}

export function eventPublishState(publishedAt: string | null): PublishState {
  return newsPublishState(publishedAt);
}

export function tourBookingStatusClass(
  status: "PENDING" | "CONFIRMED" | "CANCELLED",
): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-950";
    case "CONFIRMED":
      return "bg-emerald-100 text-emerald-950";
    case "CANCELLED":
      return "bg-slate-200 text-slate-800";
    default:
      return "bg-slate-200 text-slate-800";
  }
}

export function programApplicationStatusClass(
  status: "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "DECLINED" | "WITHDRAWN",
): string {
  switch (status) {
    case "SUBMITTED":
      return "bg-sky-100 text-sky-950";
    case "UNDER_REVIEW":
      return "bg-amber-100 text-amber-950";
    case "ACCEPTED":
      return "bg-emerald-100 text-emerald-950";
    case "DECLINED":
      return "bg-red-100 text-red-950";
    case "WITHDRAWN":
      return "bg-slate-200 text-slate-800";
    default:
      return "bg-slate-200 text-slate-800";
  }
}

export function publishBadgeClass(state: PublishState): string {
  switch (state) {
    case "draft":
      return "bg-zinc-200 text-zinc-800";
    case "scheduled":
      return "bg-amber-100 text-amber-900";
    case "published":
      return "bg-emerald-100 text-emerald-900";
    default:
      return "bg-zinc-200 text-zinc-800";
  }
}

/** `datetime-local` value from ISO string in local timezone. */
export function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
}

export function fromDatetimeLocalValue(local: string): string | undefined {
  const t = local.trim();
  if (!t) {
    return undefined;
  }
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) {
    return undefined;
  }
  return d.toISOString();
}
