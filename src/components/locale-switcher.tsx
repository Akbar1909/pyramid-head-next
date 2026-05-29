"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type LocaleSwitcherProps = {
  /** Larger controls and contrast for the admin toolbar */
  size?: "default" | "comfortable";
  /** For dark admin sidebar */
  variant?: "light" | "onDark";
};

export function LocaleSwitcher({
  size = "default",
  variant = "light",
}: LocaleSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const pad =
    size === "comfortable" ? "px-2.5 py-2 text-sm" : "px-2 py-1.5 text-xs";
  const fieldset =
    variant === "onDark"
      ? `m-0 inline-flex items-center gap-0.5 rounded-lg border border-slate-600/90 bg-slate-800/90 p-1 font-medium shadow-inner ${size === "comfortable" ? "text-sm" : "text-xs"}`
      : `m-0 inline-flex items-center gap-0.5 rounded-lg border border-zinc-300 bg-zinc-100/90 p-1 font-medium shadow-sm ${size === "comfortable" ? "text-sm" : "text-xs"}`;

  return (
    <fieldset className={fieldset}>
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          className={
            l === locale
              ? variant === "onDark"
                ? `rounded-md bg-slate-600 font-semibold text-white shadow-sm ${pad}`
                : `rounded-md bg-white font-semibold text-zinc-900 shadow-sm ${pad}`
              : variant === "onDark"
                ? `rounded-md text-slate-300 transition-colors hover:bg-slate-700/90 hover:text-white ${pad}`
                : `rounded-md text-zinc-600 transition-colors hover:bg-white/80 hover:text-zinc-900 ${pad}`
          }
          onClick={() => router.replace(pathname, { locale: l })}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </fieldset>
  );
}
