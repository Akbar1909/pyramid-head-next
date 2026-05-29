import { getTranslations } from "next-intl/server";
import { FacultyProgramsSection } from "@/components/faculty-programs-section";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link } from "@/i18n/navigation";

export default async function Home() {
  const t = await getTranslations("HomePage");

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <span className="font-semibold tracking-tight">{t("brand")}</span>
          <div className="flex items-center gap-4">
            <LocaleSwitcher />
            <nav className="flex flex-wrap items-center gap-4 text-sm">
              <Link
                href="/book-tour"
                className="font-medium text-amber-800 hover:text-amber-900"
              >
                {t("bookTour")}
              </Link>
              <Link href="/login" className="text-zinc-600 hover:text-zinc-900">
                {t("adminSignIn")}
              </Link>
              <Link
                href="/dashboard"
                className="rounded-md bg-amber-600 px-3 py-1.5 font-medium text-white hover:bg-amber-500"
              >
                {t("dashboard")}
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <div className="mx-auto flex max-w-5xl flex-1 flex-col justify-center px-6 py-24">
          <p className="text-sm font-medium uppercase tracking-widest text-amber-700">
            {t("kicker")}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600">
            {t("description")}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/book-tour"
              className="rounded-md bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-500"
            >
              {t("bookTour")}
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
            >
              {t("openDashboard")}
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
            >
              {t("signIn")}
            </Link>
          </div>
        </div>
        <FacultyProgramsSection />
      </main>
    </div>
  );
}
