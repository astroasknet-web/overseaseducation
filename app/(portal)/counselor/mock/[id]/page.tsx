import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { one } from "@/lib/portal/db";
import { requireMfaIfStaff, requireUser } from "@/lib/portal/guard";
import * as AB from "@/lib/abroad/store";
import * as CN from "@/lib/abroad/counsel";
import * as MI from "@/lib/abroad/mock-interview";
import { btnDark, btnLine, box, ConsolePage, field } from "@/components/admin/console-page";
import { mockFeedbackAction } from "../../actions";

export const metadata: Metadata = { title: "Mock interview review | GrowQR", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function MockReview({ params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const id = /^\d{1,9}$/.test(raw) ? Number(raw) : 0;
  const me = await requireUser("counselor", "admin");
  await requireMfaIfStaff(me, `/counselor/mock/${id}`);
  const sess = id ? await MI.session(id) : null;
  if (!sess || sess.finished_at === null || !(await CN.canAccess(me, Number(sess.user_id)))) notFound();
  const student = await one<{ id: number; name: string }>("SELECT id, name FROM users WHERE id = $1", [Number(sess.user_id)]);
  if (!student) notFound();
  await AB.audit(me.id, Number(sess.user_id), "mock.view", `#${id}`);
  const info = MI.country(sess.country_key);
  const ideal = info?.ideal_words ?? [20, 120];
  const [ans, fb] = await Promise.all([MI.answers(id), MI.feedback(id)]);
  const [bandLabel, bandCls] = MI.band(Number(sess.score ?? 0));
  const tone = bandCls === "st-green" ? "bg-emerald-50 text-emerald-800" : bandCls === "st-amber" ? "bg-amber-50 text-amber-900" : "bg-red-50 text-red-800";
  const date = new Date(sess.finished_at.replace(" ", "T") + "Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

  return (
    <ConsolePage me={me} tab={me.role === "admin" ? "abroad" : "caseload"} plain title={`Mock interview: ${student.name}`} subtitle={`${info?.visa ?? ""} - ${date}`}
      actions={<Link href={`/counselor/student/${student.id}`} className={`${btnLine} inline-flex items-center`}>Back to student</Link>}>
      <section className={box}>
        <p className="text-[28px] font-bold text-ink">{Number(sess.score ?? 0)}% <span className={`ml-2 align-middle px-2.5 py-1 rounded-full text-[13px] font-semibold ${tone}`}>{bandLabel}</span></p>
        <p className="text-[14px] text-ink-3">Keyword coverage only. Your reading of tone, honesty and consistency with the student&apos;s documents matters more.</p>
      </section>

      {sess.qids.map((qid, i) => {
        const q = MI.question(sess.country_key, qid);
        const a = ans[qid];
        if (!q || !a) return null;
        const sc = MI.score(q, a.answer, ideal as [number, number]);
        return (
          <section key={qid} className={box}>
            <p className="text-[13px] text-ink-4">{i + 1}. {q.cat}</p>
            <h3 className="text-[17px] font-semibold text-ink mb-2">{q.q}</h3>
            {a.answer === "" ? <p className="text-[14px] text-ink-3">Skipped.</p> : <blockquote className="border-l-4 border-orange/40 pl-4 text-[15px] text-ink-2 whitespace-pre-line mb-2">{a.answer}</blockquote>}
            <p className="text-[13px] text-ink-3">{a.words} words &middot; {a.coverage}% of key points{sc.missing.length ? ` · missing: ${sc.missing.join("; ")}` : ""}</p>
            {sc.flags.map((x) => <p key={x} className="text-[13px] text-ink-3">{x}</p>)}
          </section>
        );
      })}

      <section className={box} aria-labelledby="fb-h"><h2 id="fb-h" className="text-[18px] font-semibold text-ink mb-3">Feedback for the student</h2>
        <ul className="space-y-2.5 mb-4">{fb.map((x) => <li key={String(x.id)} className="text-[14px] border-l-2 border-black/[0.1] pl-3"><b>{x.author ?? ""}</b> <small className="text-ink-4">{new Date(String(x.created_at).replace(" ", "T") + "Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</small><br /><span className="whitespace-pre-line">{x.body}</span></li>)}</ul>
        <form action={mockFeedbackAction}><input type="hidden" name="id" value={id} />
          <label className="sr-only" htmlFor="fbb">Feedback</label><textarea id="fbb" name="body" rows={4} maxLength={1000} required placeholder="What was strong, and what should they work on before the real interview?" className={`${field} w-full mb-2`} />
          <button className={btnDark} type="submit">Send feedback</button></form>
      </section>
    </ConsolePage>
  );
}
