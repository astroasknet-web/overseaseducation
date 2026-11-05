import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/portal/guard";
import * as M from "@/lib/abroad/mock-interview";
import { deleteMockAction, finishMockAction, startMockAction } from "@/app/abroad/more-actions";
import { Flash } from "@/components/abroad/parts";
import { Card, PortalPage } from "@/components/portal/shell";

export const metadata: Metadata = { title: "Visa interview practice | GrowQR" };
export const dynamic = "force-dynamic";

const BAND_CLS: Record<string, string> = { "st-green": "bg-emerald-50 text-emerald-800", "st-amber": "bg-amber-50 text-amber-900", "st-red": "bg-red-50 text-red-800" };
const day = (s: string) => new Date(s.replace(" ", "T") + "Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default async function InterviewPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const me = await requireUser("student");
  const sp = await searchParams;
  const sid = parseInt(sp.s ?? "", 10) || 0;
  const sess = sid ? await M.session(sid) : null;
  const mine = sess && sess.user_id === me.id ? sess : null;
  const countries = M.bank().countries;

  if (mine) {
    const c = M.country(mine.country_key)!;
    const stored = await M.answers(mine.id);
    const fb = await M.feedback(mine.id);
    const done = mine.finished_at !== null;
    const [bandLabel, bandCls] = M.band(mine.score ?? 0);
    return (
      <PortalPage user={me} active="abroad" title={`${c.visa} practice`} subtitle={done ? "Your finished session, with the points each answer covered." : "Answer in your own words, as you would at the counter. Nothing is sent to anyone."} wide>
        <Flash />
        {done ? <p className="mb-5"><span className={`px-3 py-1.5 rounded-full text-[13px] font-semibold ${BAND_CLS[bandCls]}`}>{bandLabel} &middot; {mine.score}% of common points covered</span></p> : <Card title="What to expect"><p className="text-[14px] text-ink-2">{c.format}</p><ul className="list-disc pl-5 mt-2 text-[14px] text-ink-2 space-y-1">{c.watch.map((w) => <li key={w}>{w}</li>)}</ul></Card>}
        {done ? (
          <>
            {mine.qids.map((qid) => {
              const q = M.question(mine.country_key, qid);
              const a = stored[qid];
              if (!q) return null;
              const sc = M.score(q, a?.answer ?? "", c.ideal_words);
              return (
                <Card key={qid} title={q.q}>
                  <p className="text-[14px] text-ink-2 whitespace-pre-line mb-3">{a?.answer ? a.answer : <i className="text-ink-4">Not answered</i>}</p>
                  <p className="text-[13px] text-ink-3">{sc.words} words &middot; covered {sc.coverage}%</p>
                  {sc.hit.length ? <p className="text-[13px] text-emerald-800 mt-1">&#10003; {sc.hit.join(" · ")}</p> : null}
                  {sc.missing.length ? <p className="text-[13px] text-ink-2 mt-1">+ Consider mentioning: {sc.missing.join(" · ")}</p> : null}
                  {sc.flags.map((f) => <p key={f} className="text-[13px] text-amber-900 mt-1">{f}</p>)}
                  {q.tip ? <p className="text-[13px] text-ink-4 mt-2">Tip: {q.tip}</p> : null}
                </Card>
              );
            })}
            {fb.length ? <Card title="Counselor feedback">{fb.map((f) => <p key={String(f.id)} className="text-[14px] text-ink-2 mb-2"><b>{f.author}</b>: {f.body}</p>)}</Card> : null}
            <form action={startMockAction} className="mb-3"><input type="hidden" name="country" value={mine.country_key} /><button className="min-h-[48px] px-6 rounded-lg bg-orange hover:bg-orange-dark text-white font-semibold text-[15px]" type="submit">Practise again</button></form>
          </>
        ) : (
          <form action={finishMockAction}>
            <input type="hidden" name="s" value={mine.id} />
            {mine.qids.map((qid, i) => {
              const q = M.question(mine.country_key, qid);
              if (!q) return null;
              return (
                <Card key={qid}>
                  <label htmlFor={`a-${qid}`} className="block text-[16px] font-semibold text-ink mb-1">{i + 1}. {q.q}</label>
                  {q.tip ? <p className="text-[13px] text-ink-4 mb-2">Tip: {q.tip}</p> : null}
                  <textarea id={`a-${qid}`} name={`a[${qid}]`} rows={4} maxLength={M.MAX_ANSWER} className="w-full px-3 py-2.5 rounded-lg border border-black/[0.15] bg-white text-[15px]" />
                </Card>
              );
            })}
            <button type="submit" className="min-h-[52px] px-8 rounded-lg bg-orange hover:bg-orange-dark text-white font-semibold text-[16px]">Finish and see my feedback</button>
          </form>
        )}
        <form action={deleteMockAction} className="mt-4"><input type="hidden" name="s" value={mine.id} /><button type="submit" className="min-h-[44px] px-3 rounded-lg text-[14px] text-red-700 hover:bg-red-50">Delete this session</button></form>
        <p className="mt-2"><Link className="underline text-[14px]" href="/abroad/interview">All practice sessions</Link></p>
      </PortalPage>
    );
  }

  const sessions = await M.sessionsFor(me.id, 20);
  const want = sp.c && sp.c in countries ? sp.c : "";
  return (
    <PortalPage user={me} active="abroad" title="Visa interview practice" subtitle="Practice with realistic questions. We check which common points you covered. It is self-checking, not a prediction of any visa decision." wide>
      <Flash />
      <Card title="Start a practice session">
        <ul className="grid sm:grid-cols-2 gap-3">
          {Object.entries(countries).map(([key, c]) => (
            <li key={key} className={`rounded-xl border p-4 ${want === key ? "border-orange/60 bg-orange-light/40" : "border-black/[0.08]"}`}>
              <b className="text-ink">{c.visa}</b><p className="text-[13px] text-ink-3 mt-1">{c.format}</p>
              <form action={startMockAction} className="mt-3"><input type="hidden" name="country" value={key} /><button type="submit" className="min-h-[44px] px-4 rounded-lg bg-ink text-white text-[14px] font-semibold">Start {M.QUESTIONS_PER_SESSION} questions</button></form>
            </li>
          ))}
        </ul>
        <p className="text-[12px] text-ink-4 mt-4">{M.bank()._note}</p>
      </Card>
      {sessions.length ? (
        <Card title="Your sessions">
          <ul className="divide-y divide-black/[0.07]">
            {sessions.map((s) => (
              <li key={String(s.id)} className="py-3 flex flex-wrap justify-between gap-3"><span><b className="text-ink">{M.country(String(s.country_key))?.visa ?? String(s.country_key)}</b> <span className="text-[13px] text-ink-3">&middot; {day(String(s.created_at))} &middot; {s.finished_at ? `${String(s.score)}% covered` : "unfinished"}</span></span><Link className="underline text-[14px] min-h-[44px] inline-flex items-center" href={`/abroad/interview?s=${String(s.id)}`}>{s.finished_at ? "Review" : "Continue"}</Link></li>
            ))}
          </ul>
        </Card>
      ) : null}
    </PortalPage>
  );
}
