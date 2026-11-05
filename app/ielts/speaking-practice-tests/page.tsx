import type { Metadata } from "next";
import Link from "next/link";
import { MarketShell } from "@/components/market/shell";
import { speakingTests } from "@/lib/lms/ielts";

export const metadata: Metadata = {
  title: "IELTS Speaking Practice Tests: with Cue Cards and Recorder | GrowQR",
  description: "30 IELTS Speaking practice tests with Part 1 questions, a Part 2 cue card with preparation and speaking timers, Part 3 discussion, band guidance and a voice recorder.",
  alternates: { canonical: "/ielts/speaking-practice-tests" },
};

export default function SpeakingTests() {
  const tests = speakingTests();
  return (
    <MarketShell user={null} active="courses">
      <nav aria-label="Breadcrumb" className="mb-4 text-[13px] text-ink-3"><Link href="/ielts" className="underline">IELTS</Link> / Speaking practice tests</nav>
      <h1 className="font-sans text-[clamp(1.8rem,4vw,2.6rem)] font-semibold text-ink">IELTS Speaking practice tests</h1>
      <p className="mt-2 max-w-[46em] text-ink-3">{tests.length} tests. Each has the three parts of the interview, a cue card with a one-minute preparation timer and a two-minute talk timer, and a recorder so you can listen back. Recordings stay on your device.</p>
      <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tests.map((t) => (
          <li key={t.slug}><Link href={`/ielts/speaking-practice-tests/${t.slug}`} className="block h-full rounded-xl border border-black/[0.08] bg-white p-4 transition hover:border-orange">
            <b className="text-[15px] text-ink">{t.title}</b><span className="mt-0.5 block text-[12.5px] text-ink-4">{t.level}</span>
            <span className="mt-1.5 block text-[13px] leading-snug text-ink-3">{t.topics.join(" · ")}</span>
          </Link></li>
        ))}
      </ol>
    </MarketShell>
  );
}
