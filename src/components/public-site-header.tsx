import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link } from "@/i18n/navigation";

export async function PublicSiteHeader() {
  const t = await getTranslations("HomePage");

  return (
    <header className="border-b border-zinc-200 bg-white px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link
          href="/"
          className="font-semibold tracking-tight text-zinc-900 hover:text-amber-800"
        >
          {t("brand")}
        </Link>
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link
              href="/admissions"
              className="font-medium text-zinc-700 hover:text-amber-900"
            >
              {t("admissions")}
            </Link>
            <Link
              href="/apply"
              className="font-medium text-zinc-700 hover:text-amber-900"
            >
              {t("apply")}
            </Link>
            <Link
              href="/track"
              className="font-medium text-zinc-700 hover:text-amber-900"
            >
              {t("trackApplication")}
            </Link>
            <Link
              href="/book-tour"
              className="font-medium text-amber-800 hover:text-amber-900"
            >
              {t("bookTour")}
            </Link>
            <Link href="/login" className="text-zinc-600 hover:text-zinc-900">
              {t("adminSignIn")}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
