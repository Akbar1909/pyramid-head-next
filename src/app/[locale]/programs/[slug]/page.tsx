import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { FacultyProgramHero } from "@/components/faculty-program-hero";
import { FacultyProgramRequirementsBody } from "@/components/faculty-program-requirements-body";
import { ProgramMetaBadges } from "@/components/program-meta-badges";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SanitizedHtmlBody } from "@/components/sanitized-html-body";
import { Link } from "@/i18n/navigation";
import { fetchFacultyProgramBySlug } from "@/lib/faculty-programs-server";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params;
  const program = await fetchFacultyProgramBySlug(slug);
  if (!program) {
    notFound();
  }

  const t = await getTranslations("ProgramsPage");
  const tHome = await getTranslations("HomePage");

  const metaLabels = {
    duration: t("duration"),
    credential: t("credential"),
    format: t("format"),
    practicum: t("practicum"),
    practicumHours: (hours: number) => t("practicumHours", { hours }),
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <PublicSiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <Link
          href="/"
          className="text-sm font-medium text-amber-800 hover:text-amber-900"
        >
          {t("backToPrograms")}
        </Link>
        <FacultyProgramHero program={program} className="mt-6 h-56" />
        <h1 className="mt-8 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {program.title}
        </h1>
        <div className="mt-4">
          <ProgramMetaBadges
            program={program}
            labels={metaLabels}
            theme="light"
          />
        </div>
        <p className="mt-6 whitespace-pre-wrap text-lg leading-relaxed text-zinc-600">
          {program.description}
        </p>
        {program.body?.trim() ? (
          <SanitizedHtmlBody
            html={program.body}
            className="prose prose-zinc mt-8 max-w-none [&_a]:text-amber-800"
          />
        ) : null}
        {((program.admissionRequirements ?? []).length > 0 ||
          (program.clinicalRequirements ?? []).length > 0) && (
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {(program.admissionRequirements ?? []).length > 0 ? (
              <section>
                <h2 className="text-lg font-semibold text-zinc-900">
                  {t("admissionRequirements")}
                </h2>
                <FacultyProgramRequirementsBody
                  items={program.admissionRequirements ?? []}
                  className="prose prose-zinc mt-3 max-w-none text-zinc-700 [&_a]:text-amber-800"
                />
              </section>
            ) : null}
            {(program.clinicalRequirements ?? []).length > 0 ? (
              <section>
                <h2 className="text-lg font-semibold text-zinc-900">
                  {t("clinicalRequirements")}
                </h2>
                <FacultyProgramRequirementsBody
                  items={program.clinicalRequirements ?? []}
                  className="prose prose-zinc mt-3 max-w-none text-zinc-700 [&_a]:text-amber-800"
                />
              </section>
            ) : null}
          </div>
        )}
        <div className="mt-10 flex flex-wrap gap-3 border-t border-zinc-200 pt-8">
          {program.acceptingApplications ? (
            <Link
              href={`/apply?program=${encodeURIComponent(program.slug)}`}
              className="rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-500"
            >
              {t("applyNow")}
            </Link>
          ) : (
            <span className="rounded-xl border border-zinc-300 bg-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-500">
              {t("comingSoon")}
            </span>
          )}
          <Link
            href="/admissions"
            className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            {tHome("admissions")}
          </Link>
        </div>
        <p className="mt-6 text-sm text-zinc-500">{t("paymentComingSoon")}</p>
      </main>
    </div>
  );
}
