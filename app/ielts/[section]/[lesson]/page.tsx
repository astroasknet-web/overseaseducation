import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketShell } from "@/components/market/shell";
import IeltsLesson from "@/components/lms/IeltsLesson";
import { allLessons, course, lesson, neighbours } from "@/lib/lms/ielts";
import ExamLocked from "@/components/lms/ExamLocked";
import { lockedExam } from "@/lib/lms/exam-access";
import { examForIelts } from "@/lib/lms/exam-products";

export const dynamic = "force-dynamic"; // what the visitor can open depends on what they bought

type P = { params: Promise<{ section: string; lesson: string }> };
const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "");

export function generateStaticParams() { return allLessons().map((l) => ({ section: l.section, lesson: l.slug })); }

async function load(params: P["params"]) {
  const p = await params;
  const slug = clean(p.lesson);
  const ref = allLessons().find((l) => l.slug === slug && l.section === clean(p.section));
  const l = ref ? lesson(slug) : null;
  return { ref, l };
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { ref, l } = await load(params);
  if (!ref || !l) return { title: "Lesson not found | GrowQR", robots: { index: false, follow: true } };
  return { title: l.seo?.title ? `${l.seo.title} | GrowQR` : `${l.title}: IELTS Lesson | GrowQR`, description: l.seo?.description ?? l.summary, alternates: { canonical: `/ielts/${ref.section}/${l.slug}` } };
}

export default async function IeltsLessonPage({ params }: P) {
  const { ref, l } = await load(params);
  if (!ref || !l) notFound();
  const lock = await lockedExam(examForIelts());
  if (lock) return <ExamLocked access={lock} title={l.title} back={{ href: "/ielts", label: "IELTS" }} />;
  const sec = course().sections[ref.section];
  const { prev, next } = neighbours(l.slug);
  return (
    <MarketShell user={null} active="courses">
      <nav aria-label="Breadcrumb" className="mb-4 text-[13px] text-ink-3"><Link href="/ielts" className="underline">IELTS</Link> / {sec?.label ?? ref.section} / {ref.moduleTitle}</nav>
      <h1 className="text-[26px] font-bold leading-tight tracking-tight text-ink sm:text-[34px]">{l.title}</h1>
      <p className="mt-1 text-[14.5px] text-ink-3">{ref.type}{l.est_time ? ` · ${l.est_time}` : ""}</p>
      <p className="mt-3 max-w-3xl text-[16px] text-ink-2">{l.summary}</p>
      {l.objectives?.length ? <section className="mt-5 rounded-xl border border-black/[0.08] bg-white p-4" aria-label="What you will learn"><h2 className="text-[15px] font-bold text-ink">What you will learn</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-[14.5px] text-ink-2">{l.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul></section> : null}
      <div className="mt-6"><IeltsLesson blocks={l.blocks} /></div>
      {l.faqs?.length ? (
        <section className="mt-8" aria-label="Frequently asked questions"><h2 className="text-[20px] font-bold text-ink">Questions people ask</h2>
          <div className="mt-3 space-y-2">{l.faqs.map((f, i) => <details key={i} className="rounded-xl border border-black/[0.1] bg-white p-3"><summary className="cursor-pointer text-[15px] font-semibold text-ink">{f.q}</summary><p className="mt-2 text-[14.5px] text-ink-2">{f.a}</p></details>)}</div>
        </section>
      ) : null}
      <nav aria-label="Lessons" className="mt-8 flex flex-wrap justify-between gap-3 border-t border-black/10 pt-5 text-[14px]">
        {prev ? <Link href={`/ielts/${ref.section}/${prev.slug}`} className="font-semibold text-orange-deep underline">← {prev.title}</Link> : <span />}
        {next ? <Link href={`/ielts/${ref.section}/${next.slug}`} className="font-semibold text-orange-deep underline">{next.title} →</Link> : null}
      </nav>
    </MarketShell>
  );
}
