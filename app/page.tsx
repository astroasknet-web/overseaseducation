import type { Metadata } from "next";
import Link from "next/link";
import data from "@/lib/abroad/data/study-abroad.json";
import { ABROAD_PACKAGES, ABROAD_STAGES, PACKAGE_DISCLAIMER, rs } from "@/lib/abroad/packages";
import { SITE_URL } from "@/lib/seo";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Yugty Overseas Education: Plan, Apply, Fund and Settle Abroad",
  description:
    "Compare universities in the USA, UK, Canada, Germany, Australia, France and the UAE, see yearly costs in rupees, and get counsellor-led help from shortlisting to visa, funding and settling in.",
  alternates: { canonical: SITE_URL },
};

const fx = data.fx as Record<string, number>;
const lakh = (inr: number) => `₹${(inr / 1_00_000).toFixed(inr >= 10_00_000 ? 0 : 1)} lakh`;

const STAGE_TEXT: Record<string, string> = {
  Plan: "Profile evaluation, a shortlist of Safe, Target and Reach universities, and a deadline roadmap.",
  Apply: "SOP and LOR strategy, resume refinement, and applications filed and tracked for you.",
  Prepare: "IELTS coaching, scholarship search and interview preparation with a real counsellor.",
  "Visa and funding": "Visa file, financial documents, education loans and proof-of-funds planning.",
  "Settle in": "Pre-departure briefing, accommodation, banking, and support after you land.",
};

const TOOLS = [
  { href: "/ielts", title: "IELTS preparation", text: "Lessons, writing and speaking practice, and 30 full mock tests per skill." },
  { href: "/abroad/matches", title: "University matches", text: "Safe, Target and Reach options scored against your profile and budget." },
  { href: "/abroad/visa", title: "Visa tracker", text: "Step-by-step checklist with deadlines and calendar reminders." },
  { href: "/abroad/funds", title: "Funds planner", text: "Tuition, living cost and proof-of-funds worked out in rupees." },
  { href: "/abroad/loans", title: "Education loans", text: "Compare lenders and see the EMI before you commit." },
  { href: "/abroad/interview", title: "Visa interview practice", text: "Mock interviews with feedback on every answer." },
];

const FAQ = [
  ["Do you guarantee admission or a visa?", "No. Universities and governments make those decisions. We improve the quality of your file and your preparation, and we say so plainly on every package."],
  ["Can I use the tools without buying a package?", "Yes. Browsing destinations, comparing universities, IELTS practice and the cost planner are free once you sign in."],
  ["Are prices shown in rupees?", "Yes. Tuition and living costs are converted at a stated rate and marked with the date they were last reviewed."],
  ["Who delivers the counselling?", "Yugty counsellors and vetted partners, with every step visible in your dashboard."],
];

type Country = { key: string; name: string; code: string; currency: string; c1: string; c2: string; tagline: string; tuition: { mid: number } };

export default function Home() {
  const countries = data.countries as unknown as Country[];
  const unis = data.universities.length;
  const inr = (c: Country) => c.tuition.mid * (fx[c.currency] ?? 1);

  return (
    <div className="min-h-screen bg-white text-ink">
      <Navbar />

      <section className="relative overflow-hidden bg-[#0B1220] text-white">
        <div aria-hidden className="absolute inset-0 opacity-60" style={{ background: "radial-gradient(60% 80% at 85% 0%, rgba(255,106,47,.35), transparent 60%), radial-gradient(50% 60% at 0% 100%, rgba(59,130,246,.28), transparent 60%)" }} />
        <div aria-hidden className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:py-28 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[13px] font-medium text-white/85">
              <span className="h-2 w-2 rounded-full bg-orange" /> Counsellor-led, from first shortlist to first day on campus
            </span>
            <h1 className="mt-6 text-[40px] font-bold leading-[1.08] tracking-tight text-white sm:text-6xl">
              Study abroad with a plan, <span className="font-serif font-normal italic text-orange">not guesswork.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed !text-white/75">
              Compare {unis}+ universities across {countries.length} countries, see the real yearly cost in rupees, and get expert help with applications, IELTS, visa, funding and settling in.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/study-abroad" className="inline-flex min-h-[52px] items-center rounded-full bg-orange px-8 text-[16px] font-semibold text-white shadow-glow transition hover:bg-orange-dark">Explore universities</Link>
              <Link href="/overseas-packages" className="inline-flex min-h-[52px] items-center rounded-full border border-white/25 px-8 text-[16px] font-semibold text-white transition hover:bg-white/10">View packages</Link>
            </div>
            <dl className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-white/15 pt-8">
              {[[`${countries.length}`, "Study destinations"], [`${unis}+`, "Universities compared"], ["5", "Journey stages covered"]].map(([n, l]) => (
                <div key={l}>
                  <dt className="text-3xl font-bold sm:text-4xl">{n}</dt>
                  <dd className="mt-1 text-[13px] text-white/60">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 shadow-2xl backdrop-blur sm:p-8">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-white/55">Typical yearly tuition</p>
            <ul className="mt-5 divide-y divide-white/10">
              {countries.map((c) => (
                <li key={c.key} className="flex items-center justify-between py-3">
                  <span className="flex items-center gap-3 text-[15px] font-medium"><Badge code={c.code} />{c.name}</span>
                  <span className="text-[15px] font-semibold tabular-nums">{lakh(inr(c))}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[12px] leading-relaxed text-white/50">Mid-range tuition converted to rupees at the rate on file. Reviewed {data.reviewed}. Living costs are extra.</p>
          </div>
        </div>
      </section>

      <section id="destinations" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20">
        <SectionHead eyebrow="Destinations" title="Seven countries, compared honestly" text="Tuition, living cost, work rights after study and visa steps for each destination, in one place." />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((c) => (
            <li key={c.key}>
              <Link href={`/study-abroad/${c.key}`} className="group block h-full overflow-hidden rounded-3xl border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-card">
                <div className="flex h-28 items-end justify-between p-5 text-white" style={{ background: `linear-gradient(135deg, ${c.c1}, ${c.c2})` }}>
                  <span className="text-2xl font-bold">{c.name}</span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-[15px] font-bold tracking-wide ring-1 ring-white/40" aria-hidden>{c.code}</span>
                </div>
                <div className="p-5">
                  <p className="min-h-[66px] text-[15px] leading-relaxed text-ink-3">{c.tagline}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-black/[0.07] pt-4 text-[13px]">
                    <span className="text-ink-4">Tuition from <b className="text-ink">{lakh(inr(c))}</b>/yr</span>
                    <span className="font-semibold text-orange transition group-hover:translate-x-1">Explore →</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
          <li>
            <Link href="/study-abroad" className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-orange/40 bg-orange-lighter p-6 text-center transition hover:border-orange">
              <span className="text-xl font-semibold text-orange-deep">Browse all {unis}+ universities</span>
              <span className="mt-2 text-[14px] text-ink-3">Filter by country, field, level and budget</span>
            </Link>
          </li>
        </ul>
      </section>

      <section id="journey" className="scroll-mt-20 bg-cream-2 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead eyebrow="The journey" title="Five stages. One dashboard." text="Everything from the first profile review to your first month abroad, tracked in your own student dashboard." />
          <ol className="mt-12 grid gap-5 md:grid-cols-5">
            {ABROAD_STAGES.map((s, i) => (
              <li key={s} className="rounded-3xl bg-white p-6 shadow-card">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange text-[15px] font-bold text-white">{i + 1}</span>
                <h3 className="mt-4 text-lg font-semibold">{s}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-3">{STAGE_TEXT[s]}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="packages" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20">
        <SectionHead eyebrow="Packages" title="Choose how much help you want" text="Five levels, each building on the last. Pay once, at a fixed price." />
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {ABROAD_PACKAGES.map((p) => (
            <li key={p.key} className={`flex flex-col rounded-3xl border p-6 ${p.level === 3 ? "border-orange shadow-glow" : "border-black/10"}`}>
              {p.level === 3 ? <span className="mb-3 w-fit rounded-full bg-orange px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Most chosen</span> : <span className="mb-3 h-[26px]" />}
              <span className="text-[12px] font-semibold uppercase tracking-widest text-ink-4">Level {p.level}</span>
              <h3 className="mt-1 text-lg font-semibold leading-snug">{p.name}</h3>
              <p className="mt-1 text-[14px] text-ink-3">{p.tagline}</p>
              <p className="mt-5 text-3xl font-bold">{rs(p.from)}</p>
              <ul className="mt-5 flex-1 space-y-2 text-[14px] text-ink-2">
                {p.headline.map((h) => (
                  <li key={h} className="flex gap-2"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />{h}</li>
                ))}
              </ul>
              <Link href="/overseas-packages" className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full border border-black/15 text-[14px] font-semibold transition hover:border-orange hover:text-orange">See what is included</Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-3xl text-[13px] leading-relaxed text-ink-4">{PACKAGE_DISCLAIMER}</p>
      </section>

      <section id="tools" className="scroll-mt-20 bg-[#0B1220] py-20 text-white">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead dark eyebrow="Your toolkit" title="Everything you need, in one place" text="Practical tools that work whether or not you buy a package." />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="block h-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-orange/60 hover:bg-white/[0.07]">
                  <h3 className="text-lg font-semibold text-white">{t.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed !text-white/65">{t.text}</p>
                  <span className="mt-4 inline-block text-[14px] font-semibold text-orange">Open →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-20">
        <SectionHead eyebrow="FAQ" title="Straight answers" />
        <div className="mt-10 divide-y divide-black/10 border-y border-black/10">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold">
                {q}<span className="text-2xl text-orange transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-3">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-5 pb-20">
        <div className="mx-auto max-w-7xl rounded-[32px] bg-gradient-to-br from-orange to-orange-dark px-6 py-14 text-center text-white sm:py-20">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold leading-tight !text-white sm:text-5xl">Ready to see where your profile can take you?</h2>
          <p className="mx-auto mt-4 max-w-xl !text-white/85">Create a free account, build your profile, and get your first Safe, Target and Reach shortlist.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="inline-flex min-h-[52px] items-center rounded-full bg-white px-8 font-semibold text-orange-deep">Create free account</Link>
            <Link href="/overseas-packages" className="inline-flex min-h-[52px] items-center rounded-full border border-white/50 px-8 font-semibold text-white">Talk to a counsellor</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Badge({ code }: { code: string }) {
  return <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold tracking-wide ring-1 ring-white/25" aria-hidden>{code}</span>;
}

function SectionHead({ eyebrow, title, text, dark }: { eyebrow: string; title: string; text?: string; dark?: boolean }) {
  return (
    <div className="max-w-2xl">
      <p className="text-[13px] font-semibold uppercase tracking-widest text-orange">{eyebrow}</p>
      <h2 className={`mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl ${dark ? "!text-white" : ""}`}>{title}</h2>
      {text ? <p className={`mt-4 text-lg leading-relaxed ${dark ? "!text-white/70" : "text-ink-3"}`}>{text}</p> : null}
    </div>
  );
}
