"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { FacultyProgramHero } from "@/components/faculty-program-hero";
import { ProgramMetaBadges } from "@/components/program-meta-badges";
import { SanitizedHtmlBody } from "@/components/sanitized-html-body";
import { Link } from "@/i18n/navigation";
import type { FacultyProgramRow } from "@/lib/types";

type Props = {
  programs: FacultyProgramRow[];
};

export function FacultyProgramsCarousel({ programs }: Props) {
  const t = useTranslations("HomePage");
  const tProg = useTranslations("ProgramsPage");
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByDir(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }
    const delta = Math.min(el.clientWidth * 0.85, 360) * dir;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section className="border-t border-zinc-800 bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t("facultyTitle")}
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-400">
              {t("facultySubtitle")}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollByDir(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-500/60 text-amber-400 transition hover:bg-amber-500/10"
              aria-label={t("facultyScrollPrev")}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollByDir(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-500/60 text-amber-400 transition hover:bg-amber-500/10"
              aria-label={t("facultyScrollNext")}
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="mt-10 flex gap-5 overflow-x-auto pb-2 pt-1 scrollbar-thin [scrollbar-color:rgba(212,175,55,0.35)_transparent]"
        >
          {programs.map((p) => (
            <article
              key={p.id}
              className="flex min-w-[min(100%,280px)] shrink-0 snap-start flex-col rounded-2xl border border-zinc-800/90 bg-zinc-900/80 p-6 shadow-lg ring-1 ring-white/5 sm:min-w-[300px]"
            >
              <FacultyProgramHero program={p} className="h-36" />
              <h3 className="mt-5 font-serif text-xl font-semibold leading-snug text-white">
                <Link
                  href={`/programs/${p.slug}`}
                  className="hover:text-amber-300"
                >
                  {p.title}
                </Link>
              </h3>
              <div className="mt-3">
                <ProgramMetaBadges
                  program={p}
                  labels={{
                    duration: tProg("duration"),
                    credential: tProg("credential"),
                    format: tProg("format"),
                    practicum: tProg("practicum"),
                    practicumHours: (hours) =>
                      tProg("practicumHours", { hours }),
                  }}
                />
              </div>
              <p className="mt-3 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">
                {p.description}
              </p>
              {p.body?.trim() ? (
                <SanitizedHtmlBody
                  html={p.body}
                  className="mt-4 border-t border-zinc-800/80 pt-4 text-sm leading-relaxed text-zinc-400 [&_a]:text-amber-400 [&_a]:underline [&_h2]:font-serif [&_h2]:text-base [&_h3]:font-serif [&_h3]:text-sm [&_li]:marker:text-zinc-500 [&_p]:mb-2 [&_ul]:my-2"
                />
              ) : null}
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/programs/${p.slug}`}
                  className="rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
                >
                  {tProg("learnMore")}
                </Link>
                {p.acceptingApplications ? (
                  <Link
                    href={`/apply?program=${encodeURIComponent(p.slug)}`}
                    className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-500"
                  >
                    {tProg("applyNow")}
                  </Link>
                ) : (
                  <span className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-500">
                    {tProg("comingSoon")}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
