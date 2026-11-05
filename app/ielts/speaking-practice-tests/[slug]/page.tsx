import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketShell } from "@/components/market/shell";
import { PrepTimer, Recorder, SpeakTimer } from "@/components/lms/IeltsSpeaking";
import { speakingTest, speakingTests } from "@/lib/lms/ielts";
import ExamLocked from "@/components/lms/ExamLocked";
import { lockedExam } from "@/lib/lms/exam-access";
import { examForIelts } from "@/lib/lms/exam-products";

export const dynamic = "force-dynamic"; // what the visitor can open depends on what they bought

type P = { params: Promise<{ slug: string }> };
const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "");
const GUIDE: [string, string][] = [["fc", "Fluency and coherence"], ["lr", "Lexical resource"], ["gra", "Grammar range and accuracy"], ["pron", "Pronunciation"]];

export function generateStaticParams() { return speakingTests().map((t) => ({ slug: t.slug })); }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const t = speakingTest(clean((await params).slug));
  if (!t) return { title: "Test not found | GrowQR", robots: { index: false, follow: true } };
  return { title: `${t.title}: Free IELTS Speaking Practice | GrowQR`, description: `IELTS Speaking practice on ${t.topics.join(", ")}, with a cue card, timers and a recorder.`.slice(0, 160), alternates: { canonical: `/ielts/speaking-practice-tests/${t.slug}` } };
}

export default async function SpeakingTestPage({ params }: P) {
  const t = speakingTest(clean((await params).slug));
  if (!t) notFound();
  const lock = await lockedExam(examForIelts());
  if (lock) return <ExamLocked access={lock} title={t.title} back={{ href: "/ielts/speaking-practice-tests", label: "IELTS Speaking practice tests" }} />;
  const card = "rounded-2xl border border-black/[0.08] bg-white p-5 shadow-card";
  return (
    <MarketShell user={null} active="courses">
      <nav aria-label="Breadcrumb" className="mb-4 text-[13px] text-ink-3"><Link href="/ielts" className="underline">IELTS</Link> / <Link href="/ielts/speaking-practice-tests" className="underline">Speaking practice tests</Link> / {t.title}</nav>
      <h1 className="text-[24px] font-bold leading-tight tracking-tight text-ink sm:text-[30px]">{t.title}</h1>
      <p className="mt-1 text-[14.5px] text-ink-3">{t.level} · {t.topics.join(" · ")}</p>

      <div className="mt-6 space-y-6">
        <section className={card} aria-label="Part 1">
          <h2 className="text-[19px] font-bold text-ink">Part 1: Introduction and interview (4 to 5 minutes)</h2>
          <p className="mt-1 text-[13.5px] text-ink-3">Answer each question in two to four sentences: a direct answer, then a reason or a small example.</p>
          <div className="mt-3 space-y-4">{t.part1.map((p) => <div key={p.topic}><h3 className="text-[15px] font-semibold text-ink">{p.topic}</h3><ul className="mt-1 list-disc space-y-1 pl-5 text-[15px] text-ink-2">{p.questions.map((q) => <li key={q}>{q}</li>)}</ul></div>)}</div>
          <div className="mt-4"><Recorder /></div>
        </section>

        <section className={card} aria-label="Part 2">
          <h2 className="text-[19px] font-bold text-ink">Part 2: Long turn (3 to 4 minutes)</h2>
          <div className="mt-3 rounded-xl border-2 border-dashed border-ink/30 bg-cream-2 p-4">
            <p className="text-[16px] font-semibold text-ink">{t.part2.title}</p>
            <p className="mt-2 text-[14px] text-ink-3">You should say:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-[15px] text-ink-2">{t.part2.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
            <p className="mt-2 text-[15px] text-ink-2">{t.part2.explain}</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><div><p className="mb-1 text-[13.5px] font-semibold text-ink">Preparation</p><PrepTimer /></div><div><p className="mb-1 text-[13.5px] font-semibold text-ink">Your talk</p><SpeakTimer /></div></div>
          <div className="mt-4"><Recorder /></div>
          {t.part2.followups.length ? <div className="mt-4"><h3 className="text-[15px] font-semibold text-ink">Rounding-off questions</h3><ul className="mt-1 list-disc space-y-1 pl-5 text-[15px] text-ink-2">{t.part2.followups.map((f) => <li key={f}>{f}</li>)}</ul></div> : null}
        </section>

        <section className={card} aria-label="Part 3">
          <h2 className="text-[19px] font-bold text-ink">Part 3: Discussion (4 to 5 minutes)</h2>
          <p className="mt-1 text-[13.5px] text-ink-3">Give an opinion, explain it, and compare. Aim for developed answers of three to five sentences.</p>
          <ol className="mt-3 space-y-3">{t.part3.map((q, i) => <li key={i} className="text-[15px] text-ink-2"><b className="mr-1.5 text-ink-4">{i + 1}.</b>{q.q}{q.followups?.length ? <ul className="mt-1 list-disc pl-6 text-[14px] text-ink-3">{q.followups.map((f) => <li key={f}>{f}</li>)}</ul> : null}</li>)}</ol>
          <div className="mt-4"><Recorder /></div>
        </section>

        <section className={card} aria-label="Self-assessment guide">
          <h2 className="text-[19px] font-bold text-ink">Check your answers against the band guide</h2>
          <div className="mt-3 space-y-2">{GUIDE.map(([k, label]) => t.bandGuide?.[k]?.length ? <details key={k} className="rounded-lg border border-black/[0.1] bg-cream-2 p-3"><summary className="cursor-pointer text-[14.5px] font-semibold text-ink">{label}</summary><ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] text-ink-2">{t.bandGuide[k].map((x, i) => <li key={i}>{x}</li>)}</ul></details> : null)}</div>
          {t.band9 ? <details className="mt-3 rounded-lg border border-emerald-600/40 bg-emerald-50/60 p-3"><summary className="cursor-pointer text-[14.5px] font-semibold text-ink">What a Band 9 answer does</summary>
            <div className="mt-2 space-y-2 text-[14px] text-ink-2">{t.band9.part1 ? <p><b>Part 1.</b> {t.band9.part1}</p> : null}{Array.isArray(t.band9.part2) ? <div><b>Part 2.</b><ul className="mt-1 list-disc pl-5">{t.band9.part2.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul></div> : null}{t.band9.part3 ? <div><b>Part 3.</b> {t.band9.part3.method}{Array.isArray(t.band9.part3.framework) ? <ul className="mt-1 list-disc pl-5">{t.band9.part3.framework.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul> : null}</div> : null}</div></details> : null}
          {t.mistakes?.length ? <details className="mt-3 rounded-lg border border-black/[0.1] bg-cream-2 p-3"><summary className="cursor-pointer text-[14.5px] font-semibold text-ink">Common mistakes</summary><ul className="mt-2 space-y-2 text-[14px] text-ink-2">{t.mistakes.map((m) => <li key={m.title}><b>{m.title}.</b> {m.detail}</li>)}</ul></details> : null}
        </section>
      </div>
    </MarketShell>
  );
}
