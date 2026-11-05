/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketShell } from "@/components/market/shell";
import { WritingTestRunner } from "@/components/lms/IeltsWriting";
import { render as renderVisual } from "@/lib/lms/ielts-visual";
import { writingTest, writingTests } from "@/lib/lms/ielts";
import ExamLocked from "@/components/lms/ExamLocked";
import { lockedExam } from "@/lib/lms/exam-access";
import { examForIelts } from "@/lib/lms/exam-products";

export const dynamic = "force-dynamic"; // what the visitor can open depends on what they bought

type P = { params: Promise<{ slug: string }> };
const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "");
const CRIT: [string, string][] = [["ta", "Task achievement / response"], ["cc", "Coherence and cohesion"], ["lr", "Lexical resource"], ["gra", "Grammar range and accuracy"]];

export function generateStaticParams() { return writingTests().map((t) => ({ slug: t.slug })); }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const t = writingTest(clean((await params).slug));
  if (!t) return { title: "Test not found | Yugty", robots: { index: false, follow: true } };
  return { title: `${t.title}: Free IELTS Writing Practice Test | Yugty`, description: `A 60-minute IELTS Academic Writing practice test (${t.topics.join(", ")}) with an estimated band.`.slice(0, 160), alternates: { canonical: `/ielts/writing-practice-tests/${t.slug}` } };
}

export default async function WritingTestPage({ params }: P) {
  const t = writingTest(clean((await params).slug));
  if (!t) notFound();
  const lock = await lockedExam(examForIelts());
  if (lock) return <ExamLocked access={lock} title={t.title} back={{ href: "/ielts/writing-practice-tests", label: "IELTS Writing practice tests" }} />;
  const visual: string = renderVisual(t.task1.visual, t.task1.format);
  const bc = t.bandCriteria ?? {};
  const guide = (
    <section className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-card" aria-label="Examiner guidance">
      <h2 className="text-[20px] font-bold text-ink">What the examiner looks for</h2>
      {(["task1", "task2"] as const).map((k) => bc[k] ? (
        <div key={k} className="mt-4"><h3 className="text-[16px] font-semibold text-ink">{k === "task1" ? "Task 1" : "Task 2"}</h3>
          <dl className="mt-2 space-y-3">{CRIT.map(([c, label]) => bc[k][c]?.length ? <div key={c}><dt className="text-[14px] font-bold text-ink-2">{label}</dt><dd><ul className="list-disc pl-5 text-[14px] text-ink-3">{bc[k][c].map((x: string, i: number) => <li key={i}>{x}</li>)}</ul></dd></div> : null)}</dl>
        </div>
      ) : null)}
      {t.traps?.length ? <div className="mt-5"><h3 className="text-[16px] font-semibold text-ink">Common traps</h3><ul className="mt-2 space-y-2">{t.traps.map((x) => <li key={x.title} className="text-[14px] text-ink-2"><b>{x.title}.</b> {x.detail}</li>)}</ul></div> : null}
    </section>
  );
  return (
    <MarketShell user={null} active="courses">
      <nav aria-label="Breadcrumb" className="mb-4 text-[13px] text-ink-3"><Link href="/ielts" className="underline">IELTS</Link> / <Link href="/ielts/writing-practice-tests" className="underline">Writing practice tests</Link> / {t.title}</nav>
      <h1 className="text-[24px] font-bold leading-tight tracking-tight text-ink sm:text-[30px]">{t.title}</h1>
      <p className="mb-5 mt-1 text-[14.5px] text-ink-3">{t.level} · {t.topics.join(" · ")}</p>
      <WritingTestRunner id={t.slug} task1={t.task1} task2={t.task2} visualHtml={visual} guide={guide} />
    </MarketShell>
  );
}
