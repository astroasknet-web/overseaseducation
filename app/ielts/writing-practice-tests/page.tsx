import type { Metadata } from "next";
import Link from "next/link";
import { MarketShell } from "@/components/market/shell";
import { writingTests } from "@/lib/lms/ielts";

export const metadata: Metadata = {
  title: "IELTS Writing Practice Tests: with a Band Estimate | Yugty",
  description: "30 IELTS Academic Writing practice tests with Task 1 charts, tables, processes and maps, Task 2 essays, a 60-minute timer and an instant estimated band.",
  alternates: { canonical: "/ielts/writing-practice-tests" },
};

export default function WritingTests() {
  const tests = writingTests();
  return (
    <MarketShell user={null} active="courses">
      <nav aria-label="Breadcrumb" className="mb-4 text-[13px] text-ink-3"><Link href="/ielts" className="underline">IELTS</Link> / Writing practice tests</nav>
      <h1 className="font-sans text-[clamp(1.8rem,4vw,2.6rem)] font-semibold text-ink">IELTS Writing practice tests</h1>
      <p className="mt-2 max-w-[46em] text-ink-3">{tests.length} tests. Each has a Task 1 visual, a Task 2 essay and a 60-minute timer. You get an estimated band when you submit. The estimate is rule-based and offline, so it checks length, structure, linking words and vocabulary range. It is not an examiner, and it cannot judge your ideas.</p>
      <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tests.map((t) => (
          <li key={t.slug}><Link href={`/ielts/writing-practice-tests/${t.slug}`} className="block h-full rounded-xl border border-black/[0.08] bg-white p-4 transition hover:border-orange">
            <b className="text-[15px] text-ink">{t.title}</b><span className="mt-0.5 block text-[12.5px] text-ink-4">{t.level}</span>
            <span className="mt-1.5 block text-[13px] leading-snug text-ink-3">{t.topics.join(" · ")}</span>
          </Link></li>
        ))}
      </ol>
    </MarketShell>
  );
}
