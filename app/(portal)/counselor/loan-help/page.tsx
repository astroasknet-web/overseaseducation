import type { Metadata } from "next";
import { requireUser } from "@/lib/portal/guard";
import { btnLine, box, ConsolePage, Stats } from "@/components/admin/console-page";
import * as LH from "@/lib/abroad/loan-help";
import { updateLoanHelpAction } from "../programme-actions";

export const metadata: Metadata = { title: "Loan help requests | Yugty", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const input = "min-h-[44px] rounded-lg border border-black/[0.15] bg-white px-3 text-[14px]";

export default async function LoanHelpStaff() {
  const me = await requireUser("counselor", "admin");
  const list = await LH.listAll();
  return (
    <ConsolePage me={me} tab="loan-help" plain title="Loan help requests" subtitle="Students who asked for help with an education loan. Call them, prepare the file, follow it up with the bank.">
      <Stats items={[["New", list.filter((l) => l.status === "new").length], ["In progress", list.filter((l) => ["contacted", "docs", "submitted"].includes(l.status)).length], ["Sanctioned", list.filter((l) => l.status === "sanctioned").length], ["All requests", list.length]]} />
      <section className={box} aria-labelledby="ll-h">
        <h2 id="ll-h" className="mb-3 text-[18px] font-semibold text-ink">Requests</h2>
        {!list.length ? <p className="text-[14px] text-ink-3">No requests yet.</p> : (
          <ul className="divide-y divide-black/[0.07]">
            {list.map((l) => (
              <li key={l.id} className="py-4">
                <p className="text-[15px]"><b>{l.name}</b> <span className="text-ink-4">{l.email} · {l.phone}</span></p>
                <p className="mt-1 text-[14px] text-ink-2">₹{l.amount_inr.toLocaleString("en-IN")} · {l.country || "country not chosen"}{l.university ? ` · ${l.university}` : ""}{l.intake ? ` · ${l.intake}` : ""}</p>
                <p className="text-[13px] text-ink-3">Co-applicant: {LH.COAPPLICANT[l.coapplicant] ?? l.coapplicant} · Collateral: {LH.COLLATERAL[l.collateral] ?? l.collateral}{l.note ? ` · "${l.note}"` : ""}</p>
                <form action={updateLoanHelpAction} className="mt-3 flex flex-wrap items-end gap-3">
                  <input type="hidden" name="id" value={l.id} />
                  <label className="text-[12px] text-ink-3">Status<select name="status" defaultValue={l.status} className={`${input} mt-1 block`}>{Object.entries(LH.STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                  <label className="grow text-[12px] text-ink-3">Note the student can see<input name="staff_note" defaultValue={l.staff_note} maxLength={500} className={`${input} mt-1 block w-full`} /></label>
                  <button className={btnLine} type="submit">Save</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </ConsolePage>
  );
}
