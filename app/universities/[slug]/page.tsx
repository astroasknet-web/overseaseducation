import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { databaseConfigured } from "@/lib/portal/db";
import { isVerified } from "@/lib/portal/auth";
import * as A from "@/lib/abroad/catalogue";
import * as S from "@/lib/abroad/store";
import { bandLabel, intakes, SA_DISCLAIMER } from "@/lib/abroad/options";
import { applyAction } from "@/app/abroad/actions";
import { CountryTile, Flash, FitBadge, UniCard } from "@/components/abroad/parts";
import { currentViewer, MarketShell } from "@/components/market/shell";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_URL } from "@/lib/seo";
import { shortlistAction } from "@/app/abroad/actions";

export const dynamic = "force-dynamic";
const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "");

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  if (!databaseConfigured()) return { title: "University | GrowQR" };
  const u = await A.university(clean((await params).slug));
  if (!u) return { title: "University not found | GrowQR", robots: { index: false, follow: true } };
  const c = await A.country(u.country_key);
  return {
    title: `${u.name}: Costs, Fit and How to Apply | GrowQR`,
    description: Array.from(`${u.name} in ${u.city}${c ? ", " + c.name : ""}. ${u.blurb} See estimated yearly cost in rupees and whether it is a Safe, Target or Reach for you.`).slice(0, 155).join(""),
    alternates: { canonical: `${SITE_URL}/universities/${u.slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function UniversityPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = clean((await params).slug);
  const me = await currentViewer();
  if (!databaseConfigured()) notFound();
  const u = slug ? await A.university(slug) : null;
  if (!u) notFound();
  const c = (await A.country(u.country_key))!;
  const isStudent = me?.role === "student";
  const profile = isStudent ? await S.profile(me!.id) : null;
  const complete = S.isComplete(profile);
  const fit = complete && profile && u.level_list.includes(profile.level) ? A.fit(profile, u, c) : null;
  const cost = A.cost(u, c);
  const shortlisted = isStudent ? (await S.shortlistIds(me!.id)).includes(u.id) : false;
  const existing = isStudent ? (await S.applications(me!.id)).find((a) => a.university_id === u.id) : null;
  const here = `/universities/${u.slug}`;
  const peers = (await A.universities({ country: u.country_key })).filter((x) => x.slug !== u.slug).slice(0, 3);
  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollegeOrUniversity", name: u.name, url: u.url, address: { "@type": "PostalAddress", addressLocality: u.city, addressCountry: c.code } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Study abroad", item: `${SITE_URL}/study-abroad` },
        { "@type": "ListItem", position: 3, name: c.name, item: `${SITE_URL}/study-abroad/${c.key}` },
        { "@type": "ListItem", position: 4, name: u.name },
      ] },
    ],
  };
  const box = "bg-white rounded-2xl border border-black/[0.08] shadow-card p-5 sm:p-7";
  const input = "w-full px-4 py-3 rounded-lg border border-black/[0.12] text-[16px] sm:text-[15px] bg-white min-h-[44px]";

  return (
    <MarketShell user={me} active="abroad">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonld) }} />
      <nav aria-label="Breadcrumb" className="text-[13px] text-ink-3 mb-4"><Link href="/" className="underline">Home</Link> / <Link href="/study-abroad" className="underline">Study abroad</Link> / <Link href={`/study-abroad/${c.key}`} className="underline">{c.name}</Link></nav>
      <Flash />
      <header className="flex gap-4 items-center">
        <CountryTile c={c} size="xl" />
        <div className="min-w-0">
          <h1 className="text-[26px] sm:text-[32px] font-bold text-ink tracking-tight leading-tight">{u.name}</h1>
          <p className="text-[15px] text-ink-3">{u.city}, {c.name} &middot; {u.type === "public" ? "Public" : "Private"} &middot; {bandLabel(u.band)}{u.english_taught ? " · English-taught" : ""}</p>
        </div>
      </header>
      {fit ? <p className="mt-3"><FitBadge fit={fit} /></p> : null}

      <div className="grid lg:grid-cols-[1fr_22rem] gap-6 mt-6 items-start">
        <div className="space-y-6 min-w-0">
          <article className={box}>
            <h2 className="text-[20px] font-bold text-ink mb-2">About</h2>
            <p className="text-[15px] text-ink-2">{u.blurb}</p>
            <h3 className="text-[16px] font-semibold text-ink mt-4 mb-2">Strong fields</h3>
            <ul className="flex flex-wrap gap-2">{u.fields.map((f) => <li key={f} className="px-3 py-1.5 rounded-full bg-cream-3 text-[13px]">{f}</li>)}</ul>
            <h3 className="text-[16px] font-semibold text-ink mt-4 mb-2">Levels</h3>
            <p className="text-[15px] text-ink-2">{u.level_list.map((l) => (l === "UG" ? "Undergraduate" : "Postgraduate")).join(" and ")}</p>
            <p className="mt-4"><a className="underline text-orange-dark" href={u.url} target="_blank" rel="noopener noreferrer">Official website</a></p>
          </article>

          <article className={box}>
            <h2 className="text-[20px] font-bold text-ink mb-2">Estimated yearly cost</h2>
            <ul className="text-[15px] text-ink-2 space-y-1.5">
              <li>Tuition: <b>{cost.currency} {cost.tuition.toLocaleString("en-US")}</b> (about {A.inr(cost.tuition_inr)})</li>
              <li>Living: <b>{cost.currency} {cost.living.toLocaleString("en-US")}</b></li>
              <li>Total: <b>{A.inr(cost.total_inr)}</b> per year</li>
            </ul>
            <p className="text-[13px] text-ink-4 mt-3">{SA_DISCLAIMER}</p>
          </article>

          {fit ? (
            <article className={box}>
              <h2 className="text-[20px] font-bold text-ink mb-2">Why this label for you</h2>
              <ul className="text-[15px] space-y-1.5">
                {fit.reasons.map((r) => <li key={r} className="text-emerald-800">&#10003; {r}</li>)}
                {fit.cautions.map((r) => <li key={r} className="text-ink-2">+ {r}</li>)}
              </ul>
            </article>
          ) : null}
        </div>

        <aside className="space-y-6" aria-label="Apply">
          <div className={box}>
            <h2 className="text-[18px] font-bold text-ink mb-2">Apply with a counselor</h2>
            {!isStudent ? (
              <>
                <p className="text-[14px] text-ink-3 mb-3">Create a free student account to see your fit and start an application.</p>
                <Link href={`/login?next=${encodeURIComponent(here)}`} className="flex items-center justify-center min-h-[48px] rounded-lg bg-orange hover:bg-orange-dark text-white font-semibold text-[15px]">Log in or sign up</Link>
              </>
            ) : !complete ? (
              <>
                <p className="text-[14px] text-ink-3 mb-3">Build your study-abroad profile first so we can check the fit and your documents.</p>
                <Link href="/abroad/profile" className="flex items-center justify-center min-h-[48px] rounded-lg bg-orange hover:bg-orange-dark text-white font-semibold text-[15px]">Build my profile</Link>
              </>
            ) : existing ? (
              <p className="text-[14px] text-ink-2">You have an application here: <b>{existing.status.replace("_", " ")}</b>. <Link className="underline" href="/abroad#apps">Open my journey</Link>.</p>
            ) : !isVerified(me) ? (
              <p className="text-[14px] text-ink-3">Confirm your email address to start an application.</p>
            ) : (
              <form action={applyAction} className="space-y-3">
                <input type="hidden" name="id" value={u.id} /><input type="hidden" name="back" value={here} />
                <div><label htmlFor="program" className="block text-[13px] font-medium text-ink-2 mb-1">Program</label><input id="program" name="program" required minLength={3} maxLength={160} placeholder="e.g. MS Computer Science" className={input} /></div>
                <div><label htmlFor="intake" className="block text-[13px] font-medium text-ink-2 mb-1">Intake</label><select id="intake" name="intake" defaultValue={profile?.intake ?? ""} className={input}>{intakes().map((i) => <option key={i}>{i}</option>)}</select></div>
                <button type="submit" className="w-full min-h-[48px] rounded-lg bg-orange hover:bg-orange-dark text-white font-semibold text-[15px]">Start application</button>
              </form>
            )}
            {isStudent ? (
              <form action={shortlistAction} className="mt-3"><input type="hidden" name="id" value={u.id} /><input type="hidden" name="back" value={here} /><button type="submit" aria-pressed={shortlisted} className="w-full min-h-[44px] rounded-lg border border-black/[0.15] text-[14px] font-medium hover:bg-cream-2">{shortlisted ? "Remove from shortlist" : "Add to shortlist"}</button></form>
            ) : null}
          </div>
        </aside>
      </div>

      {peers.length ? (
        <section className="mt-10" aria-labelledby="peers-h"><h2 id="peers-h" className="text-[20px] font-bold text-ink mb-4">More in {c.name}</h2>
          <ul className="grid md:grid-cols-3 gap-4">{peers.map((p) => <UniCard key={p.id} u={p} country={c} fit={complete && profile && p.level_list.includes(profile.level) ? A.fit(profile, p, c) : null} shortlisted={false} canShortlist={false} back={here} />)}</ul></section>
      ) : null}
    </MarketShell>
  );
}
