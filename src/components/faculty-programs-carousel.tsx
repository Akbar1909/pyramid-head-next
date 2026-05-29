"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { FacultyProgramIcon } from "@/components/faculty-program-icon";
import { SanitizedHtmlBody } from "@/components/sanitized-html-body";
import type { FacultyProgramRow } from "@/lib/types";

type Props = {
  programs: FacultyProgramRow[];
};

export function FacultyProgramsCarousel({ programs }: Props) {
  const t = useTranslations("HomePage");
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
              className="min-w-[min(100%,280px)] shrink-0 snap-start rounded-2xl border border-zinc-800/90 bg-zinc-900/80 p-6 shadow-lg ring-1 ring-white/5 sm:min-w-[300px]"
            >
              <FacultyProgramIcon iconKey={p.iconKey} />
              <h3 className="mt-5 font-serif text-xl font-semibold leading-snug text-white">
                {p.title}
              </h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">
                {p.description}
              </p>
              {p.body?.trim() ? (
                <SanitizedHtmlBody
                  html={p.body}
                  className="mt-4 border-t border-zinc-800/80 pt-4 text-sm leading-relaxed text-zinc-400 [&_a]:text-amber-400 [&_a]:underline [&_h2]:font-serif [&_h2]:text-base [&_h3]:font-serif [&_h3]:text-sm [&_li]:marker:text-zinc-500 [&_p]:mb-2 [&_ul]:my-2"
                />
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
