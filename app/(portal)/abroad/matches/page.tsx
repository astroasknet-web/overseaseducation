import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/portal/guard";
import * as A from "@/lib/abroad/catalogue";
import * as S from "@/lib/abroad/store";
import { SA_DISCLAIMER } from "@/lib/abroad/options";
import { UniCard } from "@/components/abroad/parts";
import { PortalPage } from "@/components/portal/shell";
import { Alert } from "@/components/portal/ui";

export const metadata: Metadata = { title: "Your Safe, Target and Reach universities | GrowQR" };
export const dynamic = "force-dynamic";

const BLURB = {
  Reach: "Ambitious. Your profile is below their typical level, so apply to a few and expect it to be hard.",
  Target: "The core of your list. Your profile is in line with typical admits.",
  Safe: "Your profile is comfortably above their typical level. A dependable backup.",
} as const;

export default async function MatchesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const me = await requireUser("student");
  const sp = await searchParams;
  const profile = await S.profile(me.id);
  if (!S.isComplete(profile) || !profile) redirect("/abroad/profile");
  const cs = await A.countries();
  const shortlist = await S.shortlistIds(me.id);
  const only = sp.c && sp.c in cs ? sp.c : "";
  const catSel = ["Safe", "Target", "Reach"].includes(sp.cat ?? "") ? (sp.cat as "Safe" | "Target" | "Reach") : "";
  const rec = await A.recommend(profile, cs, only ? { country: only } : undefined);
  const by: Record<"Reach" | "Target" | "Safe", A.Recommended[]> = { Reach: [], Target: [], Safe: [] };
  for (const u of rec) by[u.fit.category].push(u);
  const here = "/abroad/matches" + (only || catSel ? "?" + new URLSearchParams(Object.entries({ c: only, cat: catSel }).filter(([, v]) => v)).toString() : "");
  const english = profile.english_test === "none" ? "Not taken yet" : `${profile.english_test} ${Number(profile.english_score)}`;

  return (
    <PortalPage user={me} active="abroad" title="Your Safe, Target and Reach universities" subtitle="Ranked for your profile, with the reasons behind each label." wide="full">
      {sp.saved ? <Alert kind="success">Profile saved. These matches use your latest answers.</Alert> : null}
      <ul className="flex flex-wrap gap-2 mb-4 text-[13px]" aria-label="Your profile">
        <li className="px-3 py-1.5 rounded-full bg-white border border-black/[0.08]">{profile.level === "UG" ? "Undergraduate" : "Postgraduate"}: {profile.field}</li>
        <li className="px-3 py-1.5 rounded-full bg-white border border-black/[0.08]">Academic index {Number(profile.academic_index)}/100</li>
        <li className="px-3 py-1.5 rounded-full bg-white border border-black/[0.08]">English: {english}</li>
        <li className="px-3 py-1.5 rounded-full bg-white border border-black/[0.08]">Budget {A.inr(Number(profile.budget_inr))} / year</li>
        <li><Link className="underline min-h-[44px] inline-flex items-center" href="/abroad/profile">Edit profile</Link></li>
      </ul>
      <nav aria-label="Filter" className="flex flex-wrap gap-2 mb-6">
        <Link href="/abroad/matches" className={`min-h-[40px] inline-flex items-center px-3.5 rounded-full border text-[13px] ${!only ? "bg-ink text-white border-ink" : "bg-white border-black/[0.15]"}`}>All countries</Link>
        {Object.values(cs).map((c) => <Link key={c.key} href={`/abroad/matches?c=${c.key}`} className={`min-h-[40px] inline-flex items-center px-3.5 rounded-full border text-[13px] ${only === c.key ? "bg-ink text-white border-ink" : "bg-white border-black/[0.15]"}`}>{c.name}</Link>)}
      </nav>
      {!rec.length ? <p className="bg-white rounded-2xl border border-black/[0.08] p-6 text-[15px] text-ink-3">No universities in this country offer your level. Try another country.</p> : null}
      {(["Target", "Reach", "Safe"] as const).filter((k) => !catSel || catSel === k).map((k) =>
        by[k].length ? (
          <section key={k} className="mb-8" aria-labelledby={`h-${k}`}>
            <h2 id={`h-${k}`} className="text-[20px] font-bold text-ink">{k} <span className="text-ink-4 font-normal">({by[k].length})</span></h2>
            <p className="text-[14px] text-ink-3 mb-3">{BLURB[k]}</p>
            <ul className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{by[k].map((u) => <UniCard key={u.id} u={u} country={cs[u.country_key]} fit={u.fit} shortlisted={shortlist.includes(u.id)} canShortlist back={here} />)}</ul>
          </section>
        ) : null,
      )}
      <p className="text-[13px] text-ink-4 max-w-3xl">{SA_DISCLAIMER} Labels are estimates from your profile, not predictions of admission.</p>
    </PortalPage>
  );
}
