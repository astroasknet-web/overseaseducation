import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@/lib/portal/guard";
import PageShell from "@/components/layout/PageShell";
import { GERMANY, refundInr, assurance, forUser } from "@/lib/abroad/germany";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Germany Public Universities Programme: TestAS, German and IELTS | Yugty Overseas Education",
  description: "TestAS preparation, German language training, IELTS and complete application support for Germany's public universities, with an admission assurance if you meet the conditions.",
  alternates: { canonical: `${SITE_URL}/germany-public-universities` },
};
export const dynamic = "force-dynamic";

const rs = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const STEPS = [
  ["Enrol", "Choose the programme and pay once at checkout. Need a loan? Our loan team helps."],
  ["Take the readiness test", `Your score tells us where you stand. You need more than ${GERMANY.scoreAbove}% to qualify for the assurance.`],
  ["Train with us", "TestAS, German and IELTS preparation, with mock tests and your progress tracked."],
  ["Apply to public universities", "We help you choose programmes, prepare documents and submit your applications."],
  ["Visa and departure", "Blocked-account and visa guidance, then your pre-departure briefing."],
];
const FAQ = [
  ["What does more than 75% mean?", `You need to score above ${GERMANY.scoreAbove}% in the Yugty readiness test. Your score is shown in your dashboard once our team records it.`],
  ["What is a consistent performer?", "A student who attends the scheduled sessions and completes the assigned tests on time through the programme."],
  ["What happens if I still do not get admission?", `If you meet both conditions and no German public university admits you, you choose: ${GERMANY.refundPct}% of the fee back (${rs(refundInr())}), or one more intake with us at no extra programme fee.`],
  ["Who decides admission?", "Universities do. The assurance is our commitment on the programme fee. It is not a promise made on behalf of any university."],
  ["Can I pay with an education loan?", "Yes. Ask our loan team and we will prepare and follow up your application with the bank. Approval is the bank's decision."],
];

export default async function GermanyPage() {
  const me = await currentUser().catch(() => null);
  const mine = me?.role === "student" ? await forUser(me.id).catch(() => null) : null;
  const target = `/checkout?sku=${GERMANY.sku}`;
  const href = me ? target : `/login?next=${encodeURIComponent(target)}`;
  const a = mine ? assurance(mine) : null;

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-[13px] text-ink-3"><Link href="/study-abroad" className="underline">Study abroad</Link> / Germany programme</nav>

        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b1220] via-[#14214a] to-[#2f6bff] p-8 text-white sm:p-12">
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#8ff0ff]">Germany · Public universities</p>
          <h1 className="mt-3 max-w-3xl text-[clamp(1.9rem,4.5vw,3rem)] font-bold leading-[1.08] !text-white">Study at a German public university, with a plan and a safety net.</h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed !text-white/80">TestAS preparation, German language training, IELTS and everything from applications to arrival, in one programme with one fee.</p>
          <p className="mt-6 flex flex-wrap items-end gap-3"><span className="text-[40px] font-bold leading-none">{rs(GERMANY.feeInr)}</span><span className="pb-1 text-[14px] !text-white/70">one-time fee, taxes included</span></p>
          <div className="mt-6 flex flex-wrap gap-3">
            {mine ? <Link href="/abroad" className="inline-flex min-h-[52px] items-center rounded-full bg-orange px-7 font-semibold text-white hover:bg-orange-dark">Open my dashboard</Link> : <Link href={href} className="inline-flex min-h-[52px] items-center rounded-full bg-orange px-7 font-semibold text-white hover:bg-orange-dark">Enrol in the programme</Link>}
            <Link href="/loan-help" className="inline-flex min-h-[52px] items-center rounded-full border border-white/30 px-7 font-semibold text-white hover:bg-white/10">Need a loan? Get help</Link>
          </div>
        </section>

        {mine && a ? (
          <section className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6" aria-labelledby="mine-h">
            <h2 id="mine-h" className="text-[18px] font-bold text-emerald-950">Your programme</h2>
            <p className="mt-1 text-[15px] text-emerald-950">{a.text}</p>
          </section>
        ) : null}

        <section className="mt-12" aria-labelledby="inc-h">
          <h2 id="inc-h" className="text-[26px] font-bold text-ink">What is included</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">{GERMANY.includes.map((i) => <li key={i.title} className="rounded-2xl border border-black/10 bg-white p-5 shadow-card"><h3 className="text-[16px] font-semibold text-ink">{i.title}</h3><p className="mt-1 text-[14px] leading-relaxed text-ink-3">{i.text}</p></li>)}</ul>
        </section>

        <section className="mt-12 rounded-3xl bg-orange-lighter p-6 sm:p-8" aria-labelledby="as-h">
          <h2 id="as-h" className="text-[26px] font-bold text-ink">Our admission assurance</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-2">Two things from you, and a clear promise from us.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-5"><p className="text-[12px] font-bold uppercase tracking-wide text-ink-4">What we ask of you</p>
              <ul className="mt-2 list-disc pl-5 text-[15px] text-ink-2 space-y-1"><li>Score <b>more than {GERMANY.scoreAbove}%</b> in the Yugty readiness test.</li><li>Stay a <b>consistent performer</b> through the programme.</li></ul></div>
            <div className="rounded-2xl bg-white p-5"><p className="text-[12px] font-bold uppercase tracking-wide text-ink-4">What we promise</p>
              <p className="mt-2 text-[15px] text-ink-2">If you meet both and still do not get admission to a German public university, you choose one:</p>
              <ul className="mt-2 list-disc pl-5 text-[15px] text-ink-2 space-y-1"><li><b>{GERMANY.refundPct}% of the fee back</b> ({rs(refundInr())}), or</li><li><b>The next intake with us</b>, with no extra programme fee.</li></ul></div>
          </div>
          <p className="mt-4 text-[13px] text-ink-3">Universities make admission decisions. This assurance is our commitment on the programme fee, not a promise on behalf of any university. Full terms are shared at enrolment.</p>
        </section>

        <section className="mt-12" aria-labelledby="how-h">
          <h2 id="how-h" className="text-[26px] font-bold text-ink">How it works</h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-5">{STEPS.map(([t, d], i) => <li key={t} className="rounded-2xl bg-cream-2 p-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-orange text-[14px] font-bold text-white">{i + 1}</span><h3 className="mt-3 text-[15px] font-semibold text-ink">{t}</h3><p className="mt-1 text-[13px] leading-relaxed text-ink-3">{d}</p></li>)}</ol>
        </section>

        <section className="mt-12" aria-labelledby="faq-h">
          <h2 id="faq-h" className="text-[26px] font-bold text-ink">Questions</h2>
          <div className="mt-4 divide-y divide-black/10 border-y border-black/10">{FAQ.map(([q, ans]) => <details key={q} className="py-4"><summary className="cursor-pointer text-[16px] font-semibold text-ink">{q}</summary><p className="mt-2 text-[15px] leading-relaxed text-ink-3">{ans}</p></details>)}</div>
        </section>

        <section className="mt-12 text-center">
          {mine ? null : <Link href={href} className="inline-flex min-h-[54px] items-center rounded-full bg-orange px-8 text-[16px] font-semibold text-white hover:bg-orange-dark">Enrol for {rs(GERMANY.feeInr)}</Link>}
          <p className="mt-3 text-[13px] text-ink-4">Questions first? <Link href="/#enquire" className="underline">Talk to a counsellor</Link>.</p>
        </section>
      </div>
    </PageShell>
  );
}
