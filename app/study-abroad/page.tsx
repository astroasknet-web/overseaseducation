import type { Metadata } from "next";
import Link from "next/link";
import { databaseConfigured } from "@/lib/portal/db";
import * as A from "@/lib/abroad/catalogue";
import * as S from "@/lib/abroad/store";
import { SA_DISCLAIMER } from "@/lib/abroad/options";
import { CountryTile, inrRange, UniCard } from "@/components/abroad/parts";
import { currentViewer, MarketShell } from "@/components/market/shell";
import { SITE_URL } from "@/lib/seo";
import PackagesBanner from "@/components/abroad/PackagesBanner";

export const dynamic = "force-dynamic";
type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] ?? "" : v ?? "");

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = ["q", "country", "field", "level", "type", "sort"].some((k) => one(sp[k]));
  return {
    title: "Study Abroad: Compare Universities, Costs and Visas | Yugty",
    description: "Compare universities in the USA, UK, Canada, Australia, Germany and more. See yearly costs in rupees, find your Safe, Target and Reach options, and apply with a counselor.",
    alternates: { canonical: `${SITE_URL}/study-abroad` },
    robots: filtered ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function StudyAbroadPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const me = await currentViewer();
  if (!databaseConfigured()) return <MarketShell user={null} active="abroad"><p>Study abroad is not available right now. Please try again shortly.</p></MarketShell>;
  const cs = await A.countries();
  const isStudent = me?.role === "student";
  const profile = isStudent ? await S.profile(me!.id) : null;
  const complete = S.isComplete(profile);
  const shortlist = isStudent ? await S.shortlistIds(me!.id) : [];
  const q = Array.from(one(sp.q).trim()).slice(0, 80).join("");
  const country = one(sp.country) in cs ? one(sp.country) : "";
  const field = A.FIELDS.includes(one(sp.field)) ? one(sp.field) : "";
  const level = ["UG", "PG"].includes(one(sp.level)) ? one(sp.level) : "";
  const type = ["public", "private"].includes(one(sp.type)) ? one(sp.type) : "";
  const sort = ["name", "selective", "open"].includes(one(sp.sort)) ? one(sp.sort) : "";
  const unis = await A.universities({ q, country, field, level, type, sort });
  const fits = complete && profile ? new Map(A.rank(profile, unis, cs).map((u) => [u.id, u.fit])) : new Map();
  const sel = "min-h-[44px] px-3 rounded-lg border border-black/[0.15] bg-white text-[14px]";
  const here = "/study-abroad";

  return (
    <MarketShell user={me} active="abroad">
      <h1 className="text-[28px] sm:text-[34px] font-bold text-ink tracking-tight">Study abroad, planned step by step</h1>
      <p className="text-[15px] text-ink-3 mt-1.5 mb-6 max-w-2xl">Compare {unis.length === await A.totalUniversities() ? unis.length : "the"} universities across {Object.keys(cs).length} countries with yearly costs in rupees. Add your profile to see Safe, Target and Reach options and apply with a counselor beside you.</p>
      <PackagesBanner href="/overseas-packages" />
      <p className="mb-6 flex flex-wrap gap-3">
        {isStudent ? (
          <>
            <Link href={complete ? "/abroad/matches" : "/abroad/profile"} className="inline-flex items-center min-h-[48px] px-5 rounded-lg bg-orange hover:bg-orange-dark text-white font-semibold text-[15px]">{complete ? "See my matches" : "Build my profile"}</Link>
            <Link href="/abroad" className="inline-flex items-center min-h-[48px] px-5 rounded-lg border border-black/[0.15] text-[15px] font-medium hover:bg-cream-2">My study-abroad journey</Link>
          </>
        ) : (
          <Link href="/signup" className="inline-flex items-center min-h-[48px] px-5 rounded-lg bg-orange hover:bg-orange-dark text-white font-semibold text-[15px]">Create a free account</Link>
        )}
      </p>

      <section aria-labelledby="c-h" className="mb-10">
        <h2 id="c-h" className="text-[20px] font-bold text-ink mb-4">Countries</h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(cs).map((c) => (
            <li key={c.key} className="bg-white rounded-2xl border border-black/[0.08] shadow-card p-4">
              <Link href={`/study-abroad/${c.key}`} className="flex gap-3 items-center"><CountryTile c={c} /><span><b className="block text-ink">{c.name}</b><small className="text-ink-4">{c.n} universities</small></span></Link>
              <p className="text-[13px] text-ink-3 mt-2">{c.tagline as string}</p>
              <p className="text-[13px] text-ink-2 mt-2"><b>{inrRange(c)}</b> <span className="text-ink-4">per year</span></p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="u-h">
        <h2 id="u-h" className="text-[20px] font-bold text-ink mb-3">Universities</h2>
        <form method="get" action={here} role="search" className="flex flex-wrap gap-2 mb-4">
          <label htmlFor="uq" className="sr-only">Search universities</label>
          <input id="uq" name="q" type="search" defaultValue={q} maxLength={80} placeholder="Search a university or city" className={`${sel} flex-1 min-w-[12rem] text-[16px]`} />
          <label htmlFor="ucountry" className="sr-only">Country</label>
          <select id="ucountry" name="country" defaultValue={country} className={sel}><option value="">All countries</option>{Object.values(cs).map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}</select>
          <label htmlFor="ufield" className="sr-only">Field</label>
          <select id="ufield" name="field" defaultValue={field} className={sel}><option value="">Any field</option>{A.FIELDS.map((f) => <option key={f}>{f}</option>)}</select>
          <label htmlFor="ulevel" className="sr-only">Level</label>
          <select id="ulevel" name="level" defaultValue={level} className={sel}><option value="">UG and PG</option><option value="UG">Undergraduate</option><option value="PG">Postgraduate</option></select>
          <label htmlFor="utype" className="sr-only">Type</label>
          <select id="utype" name="type" defaultValue={type} className={sel}><option value="">Public and private</option><option value="public">Public</option><option value="private">Private</option></select>
          <label htmlFor="usort" className="sr-only">Sort</label>
          <select id="usort" name="sort" defaultValue={sort} className={sel}><option value="">Most selective first</option><option value="open">Most open first</option><option value="name">A to Z</option></select>
          <button type="submit" className="min-h-[44px] px-5 rounded-lg bg-orange hover:bg-orange-dark text-white font-semibold text-[15px]">Filter</button>
        </form>
        <p className="text-[14px] text-ink-3 mb-3" role="status">{unis.length} {unis.length === 1 ? "university" : "universities"}</p>
        {unis.length ? (
          <ul className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {unis.map((u) => <UniCard key={u.id} u={u} country={cs[u.country_key]} fit={fits.get(u.id) ?? null} shortlisted={shortlist.includes(u.id)} canShortlist={isStudent} back={here} />)}
          </ul>
        ) : <p className="bg-white rounded-2xl border border-black/[0.08] p-6 text-[15px] text-ink-3">No universities match. <Link className="underline" href={here}>Clear filters</Link>.</p>}
        <p className="text-[13px] text-ink-4 mt-6 max-w-3xl">{SA_DISCLAIMER}</p>
      </section>
    </MarketShell>
  );
}
