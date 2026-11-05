import type { Metadata } from "next";
import Link from "next/link";
import { MarketShell } from "@/components/market/shell";
import { course, speakingTests, writingTests } from "@/lib/lms/ielts";
import ExamBuyStrip from "@/components/lms/ExamBuyStrip";

export const dynamic = "force-dynamic"; // the purchase strip depends on the visitor

export const metadata: Metadata = {
  title: "IELTS Preparation: Reading and Writing Lessons, Practice Tests | Yugty",
  description: "IELTS preparation for Academic and General Training: 17 Reading and Writing lessons, Writing and Speaking practice tests, and timed Reading and Listening tests with band scores.",
  alternates: { canonical: "/ielts" },
};

export default async function IeltsHub() {
  const c = course();
  const sections = Object.values(c.sections);
  return (
    <MarketShell user={null} active="courses">
      <nav aria-label="Breadcrumb" className="mb-4 text-[13px] text-ink-3"><Link href="/exam-prep" className="underline">Exam prep</Link> / IELTS</nav>
      <h1 className="font-sans text-[clamp(1.8rem,4vw,2.6rem)] font-semibold text-ink">IELTS preparation</h1>
      <p className="mt-2 max-w-[46em] text-ink-3">Lessons for Reading and Writing, covering Academic and General Training, with practice tests for all four skills.</p>
      <ExamBuyStrip examKey="ielts" />

      <h2 className="mt-8 text-[1.3rem] font-bold text-ink">Practice tests</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Reading", "30 timed tests, marked instantly with a band", "/practice-tests/ielts-reading"],
          ["Listening", "Four sections, played once, with a band", "/practice-tests/ielts-listening"],
          ["Writing", `${writingTests().length} tests with an estimated band`, "/ielts/writing-practice-tests"],
          ["Speaking", `${speakingTests().length} tests with a cue card and recorder`, "/ielts/speaking-practice-tests"],
        ].map(([t, d, h]) => <li key={t}><Link href={h} className="block h-full rounded-xl border border-black/[0.08] bg-white p-4 transition hover:border-orange"><b className="text-[15px] text-ink">{t}</b><span className="mt-1 block text-[13px] text-ink-3">{d}</span></Link></li>)}
      </ul>

      {sections.map((s) => (
        <section key={s.slug} className="mt-10" aria-label={s.label}>
          <h2 className="text-[1.3rem] font-bold text-ink">{s.icon} {s.label} lessons</h2>
          <p className="mt-1 max-w-3xl text-[14.5px] text-ink-3">{s.tagline}</p>
          <div className="mt-4 space-y-6">
            {c.modules.filter((m) => m.section === s.slug).map((m) => (
              <div key={m.number}>
                <h3 className="text-[16px] font-semibold text-ink">{m.icon} {m.title}</h3>
                <p className="text-[13.5px] text-ink-3">{m.summary}</p>
                <ul className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {m.lessons.map((l) => (
                    <li key={l.slug}><Link href={`/ielts/${s.slug}/${l.slug}`} className="block h-full rounded-xl border border-black/[0.08] bg-white p-4 transition hover:border-orange">
                      <span className="text-[12px] text-ink-4">{l.type}</span><b className="mt-0.5 block text-[15px] text-ink">{l.title}</b><span className="mt-1 block text-[12.5px] leading-snug text-ink-3">{l.topics.join(" · ")}</span>
                    </Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </MarketShell>
  );
}
