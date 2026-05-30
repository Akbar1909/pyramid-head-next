import { getTranslations } from "next-intl/server";
import { FacultyProgramsSection } from "@/components/faculty-programs-section";
import { PublicSiteHeader } from "@/components/public-site-header";
import { Link } from "@/i18n/navigation";

export default async function Home() {
  const t = await getTranslations("HomePage");

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50 text-zinc-900">
      <PublicSiteHeader />
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
              href="/admissions"
              className="rounded-md bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-500"
            >
              {t("admissions")}
            </Link>
            <Link
              href="/apply"
              className="rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
            >
              {t("apply")}
            </Link>
            <Link
              href="/book-tour"
              className="rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
            >
              {t("bookTour")}
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
            >
              {t("openDashboard")}
            </Link>
          </div>
        </div>
        <FacultyProgramsSection />
      </main>
    </div>
  );
}
