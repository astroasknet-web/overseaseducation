import type { Metadata } from "next";
import { requireUser } from "@/lib/portal/guard";
import { btnLine, box, ConsolePage, Stats } from "@/components/admin/console-page";
import * as G from "@/lib/abroad/germany";
import { enrolGermanyAction, updateGermanyAction } from "../programme-actions";

export const metadata: Metadata = { title: "Germany programme | Yugty", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const input = "min-h-[44px] rounded-lg border border-black/[0.15] bg-white px-3 text-[14px]";
const rs = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default async function GermanyStaff() {
  const me = await requireUser("counselor", "admin");
  const list = await G.listAll();
  const eligible = list.filter((e) => G.assurance(e).eligible).length;
  return (
    <ConsolePage me={me} tab="germany" plain title="Germany programme" subtitle={`Fee ${rs(G.GERMANY.feeInr)} · assurance when the readiness score is above ${G.GERMANY.scoreAbove}% and the student is a consistent performer.`}>
      <Stats items={[["Enrolled", list.length], ["Meet the assurance conditions", eligible], ["Admitted", list.filter((e) => e.status === "admitted").length], ["No offer yet", list.filter((e) => e.status === "no_offer").length]]} />
      <section className={box} aria-labelledby="add-h">
        <h2 id="add-h" className="mb-3 text-[18px] font-semibold text-ink">Add a student</h2>
        <form action={enrolGermanyAction} className="flex flex-wrap items-end gap-3">
          <label className="text-[13px] font-medium text-ink-2">Student email<input name="email" type="email" required className={`${input} mt-1 block w-72`} /></label>
          <button className={btnLine} type="submit">Add to programme</button>
        </form>
        <p className="mt-2 text-[13px] text-ink-4">Students who pay at checkout are added automatically.</p>
      </section>
      <section className={box} aria-labelledby="list-h">
        <h2 id="list-h" className="mb-3 text-[18px] font-semibold text-ink">Students</h2>
        {!list.length ? <p className="text-[14px] text-ink-3">No students yet.</p> : (
          <ul className="divide-y divide-black/[0.07]">
            {list.map((e) => {
              const a = G.assurance(e);
              return (
                <li key={e.id} className="py-4">
                  <p className="text-[15px]"><b>{e.name}</b> <span className="text-ink-4">{e.email}</span></p>
                  <p className={`mt-1 text-[13px] ${a.eligible ? "text-emerald-800" : "text-ink-3"}`}>{a.text}</p>
                  {e.status === "no_offer" && a.eligible ? <p className="mt-1 text-[13px] font-semibold text-orange-deep">Remedy due: refund {rs(G.refundInr())} ({G.GERMANY.refundPct}%) or next intake at no extra programme fee.</p> : null}
                  <form action={updateGermanyAction} className="mt-3 grid items-end gap-3 sm:grid-cols-6">
                    <input type="hidden" name="id" value={e.id} />
                    <label className="text-[12px] text-ink-3">Status<select name="status" defaultValue={e.status} className={`${input} mt-1 block w-full`}>{Object.entries(G.STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                    <label className="text-[12px] text-ink-3">Test score %<input name="test_score" inputMode="decimal" defaultValue={e.test_score ?? ""} className={`${input} mt-1 block w-full`} /></label>
                    <label className="text-[12px] text-ink-3">Consistent?<select name="consistent" defaultValue={e.consistent === null ? "" : String(e.consistent)} className={`${input} mt-1 block w-full`}><option value="">Not decided</option><option value="1">Yes</option><option value="0">No</option></select></label>
                    <label className="text-[12px] text-ink-3">Outcome<select name="outcome" defaultValue={e.outcome} className={`${input} mt-1 block w-full`}>{Object.entries(G.OUTCOMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                    <label className="text-[12px] text-ink-3 sm:col-span-1">Note<input name="note" defaultValue={e.note} maxLength={500} className={`${input} mt-1 block w-full`} /></label>
                    <button className={btnLine} type="submit">Save</button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </ConsolePage>
  );
}
