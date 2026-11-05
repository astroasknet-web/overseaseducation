import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { databaseConfigured } from "@/lib/portal/db";
import * as A from "@/lib/abroad/catalogue";
import * as S from "@/lib/abroad/store";
import { SA_DISCLAIMER } from "@/lib/abroad/options";
import { CountryTile, inrRange, UniCard } from "@/components/abroad/parts";
import { currentViewer, MarketShell } from "@/components/market/shell";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "");
type Faq = { q: string; a: string };
type Official = { label: string; url: string };

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  if (!databaseConfigured()) return { title: "Study abroad | GrowQR" };
  const c = await A.country(clean((await params).country));
  if (!c) return { title: "Country not found | GrowQR", robots: { index: false, follow: true } };
  return {
    title: `Study in ${c.name}: Universities, Costs and Visa | GrowQR`,
    description: Array.from(`Study in ${c.name}: compare universities, yearly costs of about ${inrRange(c)}, intakes, exams and the visa checklist.`).slice(0, 155).join(""),
    alternates: { canonical: `${SITE_URL}/study-abroad/${c.key}` },
    robots: { index: true, follow: true },
  };
}

export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {
  const key = clean((await params).country);
  const me = await currentViewer();
  if (!databaseConfigured()) notFound();
  const c = await A.country(key);
  if (!c) notFound();
  const cs = await A.countries();
  const unis = await A.universities({ country: key });
  const isStudent = me?.role === "student";
  const profile = isStudent ? await S.profile(me!.id) : null;
  const fits = S.isComplete(profile) && profile ? new Map(A.rank(profile, unis, cs).map((u) => [u.id, u.fit])) : new Map();
  const shortlist = isStudent ? await S.shortlistIds(me!.id) : [];
  const fx = Number(c.fx ?? 1);
  const faq = (c.faq as Faq[]) ?? [];
  const here = `/study-abroad/${key}`;
  const list = (items: unknown): string[] => (Array.isArray(items) ? items.map(String) : []);
  const visa = c.visa as { name: string; steps: string[] };
  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Study abroad", item: `${SITE_URL}/study-abroad` },
        { "@type": "ListItem", position: 3, name: c.name },
      ] },
      { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };

  return (
    <MarketShell user={me} active="abroad">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonld) }} />
      <nav aria-label="Breadcrumb" className="text-[13px] text-ink-3 mb-4"><Link href="/" className="underline">Home</Link> / <Link href="/study-abroad" className="underline">Study abroad</Link> / <span aria-current="page">{c.name}</span></nav>
      <header className="flex gap-4 items-center">
        <CountryTile c={c} size="xl" />
        <div><h1 className="text-[26px] sm:text-[32px] font-bold text-ink tracking-tight leading-tight">Study in {c.name}</h1><p className="text-[15px] text-ink-3">{c.tagline as string}</p></div>
      </header>
      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        {[["Yearly cost", inrRange(c)], ["Main intake", list(c.intakes)[0]?.replace(/ \(.*/, "") ?? ""], ["Work after study", String(c.work).split(".")[0]], ["Universities listed", String(unis.length)]].map(([k, v]) => (
          <li key={k} className="bg-white rounded-xl border border-black/[0.08] px-4 py-3"><span className="block text-[12px] text-ink-4">{k}</span><b className="text-[14px] text-ink">{v}</b></li>
        ))}
      </ul>

      <section className="mt-8" aria-labelledby="cu-h">
        <h2 id="cu-h" className="text-[20px] font-bold text-ink mb-3">Universities in {c.name}</h2>
        <ul className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{unis.map((u) => <UniCard key={u.id} u={u} country={c} fit={fits.get(u.id) ?? null} shortlisted={shortlist.includes(u.id)} canShortlist={isStudent} back={here} />)}</ul>
        <p className="text-[13px] text-ink-4 mt-4 max-w-3xl">{SA_DISCLAIMER} Last reviewed: {String(c.reviewed ?? "")}.</p>
      </section>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <article className="bg-white rounded-2xl border border-black/[0.08] shadow-card p-5 sm:p-7">
          <h2 className="text-[20px] font-bold text-ink mb-3">Cost of studying in {c.name}</h2>
          <ul className="text-[15px] text-ink-2 space-y-1.5">
            <li>Tuition ({c.currency} per year): <b>{c.tuition.low.toLocaleString("en-US")} to {c.tuition.high.toLocaleString("en-US")}</b></li>
            <li>Living ({c.currency} per year): <b>{c.living.low.toLocaleString("en-US")} to {c.living.high.toLocaleString("en-US")}</b></li>
          </ul>
          <p className="text-[14px] text-ink-3 mt-3">{String(c.tuition_note)} Exchange rate used: 1 {c.currency} = Rs {fx}.</p>
          <h3 className="text-[16px] font-semibold text-ink mt-5 mb-2">Intakes</h3>
          <ul className="list-disc pl-5 text-[15px] text-ink-2 space-y-1">{list(c.intakes).map((i) => <li key={i}>{i}</li>)}</ul>
          <h3 className="text-[16px] font-semibold text-ink mt-5 mb-2">Tests you may need</h3>
          <ul className="list-disc pl-5 text-[15px] text-ink-2 space-y-1">{list(c.exams).map((i) => <li key={i}>{i}</li>)}</ul>
          <h3 className="text-[16px] font-semibold text-ink mt-5 mb-2">Work after study</h3>
          <p className="text-[15px] text-ink-2">{String(c.work)}</p>
          <h3 className="text-[16px] font-semibold text-ink mt-5 mb-2">Why students choose {c.name}</h3>
          <ul className="list-disc pl-5 text-[15px] text-ink-2 space-y-1">{list(c.highlights).map((i) => <li key={i}>{i}</li>)}</ul>
        </article>
        <article className="bg-white rounded-2xl border border-black/[0.08] shadow-card p-5 sm:p-7">
          <h2 className="text-[20px] font-bold text-ink mb-3">Visa checklist: {visa.name}</h2>
          <ol className="list-decimal pl-5 text-[15px] text-ink-2 space-y-2">{visa.steps.map((s) => <li key={s}>{s}</li>)}</ol>
          <h3 className="text-[16px] font-semibold text-ink mt-5 mb-2">Official sources</h3>
          <ul className="space-y-1 text-[15px]">{((c.official as Official[]) ?? []).map((o) => <li key={o.url}><a className="underline text-orange-dark" href={o.url} target="_blank" rel="noopener noreferrer">{o.label}</a></li>)}</ul>
        </article>
      </div>

      {faq.length ? (
        <section className="mt-8" aria-labelledby="f-h">
          <h2 id="f-h" className="text-[20px] font-bold text-ink mb-3">Studying in {c.name}: questions</h2>
          <div className="space-y-2">{faq.map((f) => <details key={f.q} className="bg-white rounded-xl border border-black/[0.08] px-4 py-2"><summary className="cursor-pointer font-medium text-ink min-h-[44px] flex items-center">{f.q}</summary><p className="text-[15px] text-ink-2 pb-3">{f.a}</p></details>)}</div>
        </section>
      ) : null}

      <nav aria-label="Other countries" className="mt-8 flex flex-wrap gap-2">
        {Object.values(cs).filter((o) => o.key !== key).map((o) => <Link key={o.key} href={`/study-abroad/${o.key}`} className="inline-flex items-center gap-2 min-h-[44px] px-3 rounded-full border border-black/[0.15] bg-white text-[14px]"><CountryTile c={o} size="sm" />{o.name}</Link>)}
      </nav>
    </MarketShell>
  );
}
