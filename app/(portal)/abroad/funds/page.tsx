import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/portal/guard";
import * as A from "@/lib/abroad/catalogue";
import * as F from "@/lib/abroad/funds";
import * as S from "@/lib/abroad/store";
import * as V from "@/lib/abroad/vault";
import { addFundAction, removeFundAction } from "@/app/abroad/more-actions";
import { Flash } from "@/components/abroad/parts";
import { Card, PortalPage } from "@/components/portal/shell";

export const metadata: Metadata = { title: "My proof of funds | GrowQR" };
export const dynamic = "force-dynamic";

const input = "w-full px-3 py-2.5 rounded-lg border border-black/[0.15] bg-white text-[15px] min-h-[44px]";
const STATUS = { ready: ["Ready: fully documented", "bg-emerald-50 text-emerald-800"], planned: ["Planned: add documents", "bg-amber-50 text-amber-900"], short: ["Short of the target", "bg-red-50 text-red-800"] } as const;

export default async function FundsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const me = await requireUser("student");
  const sp = await searchParams;
  const cs = await A.countries();
  const targets = await F.planTargets(me.id);
  const options = new Map<number, A.University>();
  for (const a of targets) {
    const u = await A.universityById(a.university_id);
    if (u) options.set(u.id, u);
  }
  for (const id of await S.shortlistIds(me.id)) {
    const u = await A.universityById(id);
    if (u && !options.has(id)) options.set(id, u);
  }
  const want = parseInt(sp.u ?? "", 10) || 0;
  const uni = options.get(want) ?? (await F.primaryUniversity(me.id)) ?? null;
  const country = uni ? cs[uni.country_key] : null;
  const t = uni && country ? F.target(uni, country) : null;
  const pool = await F.pool(me.id);
  const cov = t ? F.coverage(pool, t.min_inr) : null;
  const fin = (await V.forUser(me.id)).filter((d) => d.doc_type === "financial" && d.status !== "rejected");
  const here = `/abroad/funds${uni ? "?u=" + uni.id : ""}`;

  return (
    <PortalPage user={me} active="abroad" title="My proof of funds" subtitle="What you should be able to show, what you have lined up, and what is still missing. Figures are indicative: confirm with the embassy and the university." wide>
      <Flash />
      {options.size ? (
        <form method="get" className="mb-5 flex flex-wrap items-end gap-2">
          <div><label htmlFor="u" className="block text-[13px] font-medium text-ink-2 mb-1">Plan for</label>
            <select id="u" name="u" defaultValue={uni?.id} className={input}>{[...options.values()].map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
          <button type="submit" className="min-h-[44px] px-4 rounded-lg border border-black/[0.15] text-[14px] font-medium hover:bg-cream-2">Show</button>
        </form>
      ) : <Card><p className="text-[15px] text-ink-3">Shortlist a university or start an application to see the funds you need. <Link className="underline" href="/study-abroad">Browse universities</Link>.</p></Card>}

      {t && cov && uni ? (
        <Card title={`${t.label}: ${A.inr(t.min_inr)}`}>
          <p className="text-[14px] text-ink-3">{t.basis}. Estimated first-year cost: {A.inr(t.est_inr)}.</p>
          {t.note ? <p className="text-[14px] text-ink-2 mt-2">{t.note}</p> : null}
          {t.seasoning ? <p className="text-[14px] text-ink-2 mt-2"><b>Seasoning:</b> {t.seasoning}</p> : null}
          <div className="mt-4 h-3 rounded-full bg-cream-3 overflow-hidden relative" role="img" aria-label={`${cov.pct_documented}% documented, ${cov.pct_total}% planned`}>
            <span className="absolute inset-y-0 left-0 bg-orange/40 rounded-full" style={{ width: `${cov.pct_total}%` }} /><span className="absolute inset-y-0 left-0 bg-orange rounded-full" style={{ width: `${cov.pct_documented}%` }} />
          </div>
          <p className="mt-2 text-[14px]"><span className={`px-2.5 py-1 rounded-full text-[12px] font-semibold ${STATUS[cov.status][1]}`}>{STATUS[cov.status][0]}</span> <span className="text-ink-3 ml-2">Documented {A.inr(pool.documented)} &middot; planned {A.inr(pool.planned)}{cov.gap > 0 ? ` · still needed ${A.inr(cov.gap)}` : ""}</span></p>
          {t.links.length ? <p className="mt-3 text-[13px]">Official sources: {t.links.map((l, i) => <span key={l.url}>{i ? " · " : ""}<a className="underline text-orange-dark" href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a></span>)}</p> : null}
        </Card>
      ) : null}

      <Card title="Your sources">
        {!pool.lines.length ? <p className="text-[15px] text-ink-3">Nothing listed yet.</p> : (
          <ul className="divide-y divide-black/[0.07]">
            {pool.lines.map((l) => (
              <li key={`${l.loan ? "l" : "s"}${l.id}`} className="py-3 flex flex-wrap justify-between gap-3">
                <div><b className="text-ink">{l.name}</b><p className="text-[13px] text-ink-3">{l.kind} &middot; {A.inr(l.amount)} &middot; {l.verified ? "document verified" : l.documented ? "document attached" : "no document yet"}</p></div>
                {l.loan ? <Link className="text-[14px] underline self-center" href="/abroad/loans">Open loan</Link> : <form action={removeFundAction}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="u" value={uni?.id ?? 0} /><button type="submit" className="min-h-[44px] px-3 rounded-lg text-[14px] text-red-700 hover:bg-red-50">Remove</button></form>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Add a source">
        <form action={addFundAction} className="grid sm:grid-cols-2 gap-4">
          <input type="hidden" name="u" value={uni?.id ?? 0} />
          <div><label htmlFor="kind" className="block text-[13px] font-medium text-ink-2 mb-1">Type</label><select id="kind" name="kind" className={input}>{Object.entries(F.KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div><label htmlFor="label" className="block text-[13px] font-medium text-ink-2 mb-1">Name</label><input id="label" name="label" maxLength={80} placeholder="e.g. Parents' savings" className={input} /></div>
          <div><label htmlFor="amount" className="block text-[13px] font-medium text-ink-2 mb-1">Amount for year one (Rs)</label><input id="amount" name="amount" inputMode="numeric" placeholder="e.g. 2500000" className={input} /></div>
          <div><label htmlFor="document_id" className="block text-[13px] font-medium text-ink-2 mb-1">Financial document</label>
            <select id="document_id" name="document_id" className={input}><option value="0">No document yet</option>{fin.map((d) => <option key={d.id} value={d.id}>{d.original_name}</option>)}</select>
            <p className="text-[12px] text-ink-4 mt-1">Upload bank statements or letters under <Link className="underline" href="/abroad/documents">Documents</Link> as &ldquo;Financial documents&rdquo;.</p></div>
          <div className="sm:col-span-2"><button type="submit" className="min-h-[48px] px-6 rounded-lg bg-orange hover:bg-orange-dark text-white font-semibold text-[15px]">Add source</button></div>
        </form>
      </Card>
      <p className="text-[13px] text-ink-4">{here ? "" : ""}Education loans you track count here too: <Link className="underline" href="/abroad/loans">open the loan tracker</Link>.</p>
    </PortalPage>
  );
}
