import Link from "next/link";
import type { Country, Fit, Recommended, University } from "@/lib/abroad/catalogue";
import { cost as costOf, inr } from "@/lib/abroad/catalogue";
import { bandLabel } from "@/lib/abroad/options";
import { shortlistAction } from "@/app/abroad/actions";
import { getSession, dropSessionData } from "@/lib/portal/session";

/** Country code tile (no flag emoji: it renders as letters on some systems). */
export function CountryTile({ c, size = "md" }: { c: Pick<Country, "c1" | "c2" | "code">; size?: "sm" | "md" | "xl" }) {
  const cls = size === "xl" ? "w-16 h-16 text-[22px]" : size === "sm" ? "w-8 h-8 text-[12px]" : "w-11 h-11 text-[15px]";
  return <span aria-hidden="true" className={`grid place-items-center shrink-0 rounded-xl text-white font-bold ${cls}`} style={{ background: `linear-gradient(135deg, ${c.c1}, ${c.c2})` }}>{c.code}</span>;
}

const FIT_CLS = { Safe: "bg-emerald-50 text-emerald-800", Target: "bg-sky-50 text-sky-800", Reach: "bg-amber-50 text-amber-900" } as const;

export function FitBadge({ fit }: { fit: Fit }) {
  return <span title="Estimate based on your profile" className={`px-2.5 py-1 rounded-full text-[12px] font-semibold ${FIT_CLS[fit.category]}`}>{fit.category} &middot; {fit.score}% fit</span>;
}

/** Compact per-year range in INR, e.g. "Rs 17 lakh to Rs 51 lakh". */
export function inrRange(c: Country): string {
  const fx = Number(c.fx ?? 1);
  const round = (n: number) => Math.round(n / 100000) * 100000;
  return inr(round((c.tuition.low + c.living.low) * fx)) + " to " + inr(round((c.tuition.high + c.living.high) * fx));
}

export function UniCard({ u, country, fit, shortlisted, canShortlist, back }: { u: University; country: Country; fit?: Fit | null; shortlisted: boolean; canShortlist: boolean; back: string }) {
  const cost = fit?.cost ?? null;
  return (
    <li className="bg-white rounded-2xl border border-black/[0.08] shadow-card p-5 relative">
      <div className="flex gap-3">
        <CountryTile c={country} />
        <div className="min-w-0">
          <h3 className="text-[17px] font-semibold text-ink leading-snug"><Link href={`/universities/${u.slug}`} className="hover:underline underline-offset-2">{u.name}</Link></h3>
          <p className="text-[14px] text-ink-3">{u.city}, {country.name}</p>
        </div>
      </div>
      <ul className="flex flex-wrap gap-2 mt-3 text-[12px]">
        <li className="px-2.5 py-1 rounded-full bg-cream-3 text-ink-2">{u.type === "public" ? "Public" : "Private"}</li>
        <li className="px-2.5 py-1 rounded-full bg-cream-3 text-ink-2">{bandLabel(u.band)}</li>
        {u.english_taught ? <li className="px-2.5 py-1 rounded-full bg-cream-3 text-ink-2">English-taught</li> : null}
        {fit ? <li><FitBadge fit={fit} /></li> : null}
      </ul>
      <p className="text-[14px] text-ink-2 mt-3">{u.blurb}</p>
      <ul className="flex flex-wrap gap-2 mt-3">{u.fields.slice(0, 3).map((f) => <li key={f} className="px-2.5 py-1 rounded-full bg-cream-3 text-[12px]">{f}</li>)}</ul>
      {fit && (fit.reasons.length || fit.cautions.length) ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-[13px] font-medium text-orange-dark min-h-[36px] flex items-center">Why this label</summary>
          <ul className="text-[13px] space-y-1 mt-1">
            {fit.reasons.map((r) => <li key={r} className="text-emerald-800">&#10003; {r}</li>)}
            {fit.cautions.map((r) => <li key={r} className="text-ink-2">+ {r}</li>)}
          </ul>
        </details>
      ) : null}
      <div className="flex items-end justify-between gap-3 mt-4">
        <span className="text-[14px]"><b className="text-ink">{inr(cost ? cost.total_inr : estimate(u, country))}</b> <small className="text-ink-4">/ year, tuition + living (est.)</small></span>
        {canShortlist ? (
          <form action={shortlistAction}>
            <input type="hidden" name="id" value={u.id} /><input type="hidden" name="back" value={back} />
            <button type="submit" aria-pressed={shortlisted} aria-label={`${shortlisted ? "Remove from" : "Add to"} shortlist: ${u.name}`} className={`min-h-[44px] px-3 rounded-lg border text-[13px] font-medium ${shortlisted ? "bg-orange-light border-orange/40 text-orange-deep" : "border-black/[0.15] text-ink-3 hover:bg-cream-2"}`}>{shortlisted ? "Shortlisted" : "Shortlist"}</button>
          </form>
        ) : null}
      </div>
    </li>
  );
}

const estimate = (u: University, c: Country): number => costOf(u, c).total_inr;

/** One-time message set by an action, shown once and then cleared. */
export async function Flash() {
  const s = await getSession();
  const f = s?.data?.sa_flash as [string, string] | undefined;
  if (!f) return null;
  await dropSessionData("sa_flash");
  return f[0] === "ok"
    ? <p role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-[14px] text-emerald-900">{f[1]}</p>
    : <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-[14px] text-red-800">{f[1]}</p>;
}

export type { Recommended };
