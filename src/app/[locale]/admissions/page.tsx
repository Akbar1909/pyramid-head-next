import { getTranslations } from "next-intl/server";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SanitizedHtmlBody } from "@/components/sanitized-html-body";
import { Link } from "@/i18n/navigation";
import { fetchAdmissionsContent } from "@/lib/admissions-server";
import { fetchPublishedFacultyPrograms } from "@/lib/faculty-programs-server";

export default async function AdmissionsPage() {
  const [admissions, programs] = await Promise.all([
    fetchAdmissionsContent(),
    fetchPublishedFacultyPrograms(),
  ]);
  const t = await getTranslations("AdmissionsPage");
  const tProg = await getTranslations("ProgramsPage");

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <PublicSiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-600">
          {t("subtitle")}
        </p>
        {admissions.introHtml?.trim() ? (
          <SanitizedHtmlBody
            html={admissions.introHtml}
            className="prose prose-zinc mt-8 max-w-none [&_a]:text-amber-800"
          />
        ) : null}
        {admissions.generalRequirements.length > 0 ? (
          <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900">
              {t("generalRequirements")}
            </h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-zinc-700">
              {admissions.generalRequirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>
        ) : null}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-zinc-900">
            {t("programRequirements")}
          </h2>
          <p className="mt-2 text-zinc-600">{t("programRequirementsHint")}</p>
          <ul className="mt-6 space-y-4">
            {programs.map((p) => (
              <li
                key={p.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/programs/${p.slug}`}
                      className="text-lg font-semibold text-zinc-900 hover:text-amber-800"
                    >
                      {p.title}
                    </Link>
                    <p className="mt-1 text-sm text-zinc-600">
                      {p.description}
                    </p>
                  </div>
                  {p.acceptingApplications ? (
                    <Link
                      href={`/apply?program=${encodeURIComponent(p.slug)}`}
                      className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500"
                    >
                      {tProg("applyNow")}
                    </Link>
                  ) : (
                    <span className="shrink-0 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-500">
                      {tProg("comingSoon")}
                    </span>
                  )}
                </div>
                { (p.admissionRequirements ?? []).length > 0 ? (
                  <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                    {(p.admissionRequirements ?? []).slice(0, 3).map((req) => (
                      <li key={req}>{req}</li>
                    ))}
                    {(p.admissionRequirements ?? []).length > 3 ? (
                      <li>
                        <Link
                          href={`/programs/${p.slug}`}
                          className="font-medium text-amber-800 hover:underline"
                        >
                          {t("viewAllRequirements")}
                        </Link>
                      </li>
                    ) : null}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/apply"
            className="rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-500"
          >
            {t("startApplication")}
          </Link>
          <Link
            href="/track"
            className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            {t("trackExisting")}
          </Link>
        </div>
        <p className="mt-6 text-sm text-zinc-500">{tProg("paymentComingSoon")}</p>
      </main>
    </div>
  );
}
