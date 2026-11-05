import type { Metadata } from "next";
import { requireUser } from "@/lib/portal/guard";
import * as A from "@/lib/abroad/catalogue";
import * as L from "@/lib/abroad/loans";
import * as V from "@/lib/abroad/vault";
import { deleteLoanAction, saveLoanAction } from "@/app/abroad/more-actions";
import { Flash } from "@/components/abroad/parts";
import { Card, PortalPage } from "@/components/portal/shell";

export const metadata: Metadata = { title: "My education loans | GrowQR" };
export const dynamic = "force-dynamic";

const input = "w-full px-3 py-2.5 rounded-lg border border-black/[0.15] bg-white text-[15px] min-h-[44px]";

function LoanForm({ l, fin }: { l?: L.Loan; fin: V.Doc[] }) {
  const k = l?.id ?? "new";
  return (
    <form action={saveLoanAction} className="grid sm:grid-cols-2 gap-4">
      {l ? <input type="hidden" name="id" value={l.id} /> : null}
      <div><label htmlFor={`lender-${k}`} className="block text-[13px] font-medium text-ink-2 mb-1">Lender</label><input id={`lender-${k}`} name="lender" maxLength={80} defaultValue={l?.lender} placeholder="e.g. State Bank of India" className={input} /></div>
      <div><label htmlFor={`type-${k}`} className="block text-[13px] font-medium text-ink-2 mb-1">Loan type</label><select id={`type-${k}`} name="loan_type" defaultValue={l?.loan_type ?? "unsecured"} className={input}><option value="unsecured">Unsecured</option><option value="secured">Secured (with collateral)</option></select></div>
      <div><label htmlFor={`amount-${k}`} className="block text-[13px] font-medium text-ink-2 mb-1">Amount applied for (Rs)</label><input id={`amount-${k}`} name="amount_inr" inputMode="numeric" defaultValue={l?.amount_inr} className={input} /></div>
      <div><label htmlFor={`rate-${k}`} className="block text-[13px] font-medium text-ink-2 mb-1">Annual interest rate (%) <span className="text-ink-4 font-normal">(optional)</span></label><input id={`rate-${k}`} name="rate_pct" inputMode="decimal" defaultValue={l?.rate_pct ?? ""} className={input} /></div>
      <div><label htmlFor={`years-${k}`} className="block text-[13px] font-medium text-ink-2 mb-1">Repayment (years)</label><input id={`years-${k}`} name="tenure_years" type="number" min={1} max={20} defaultValue={l?.tenure_years ?? 10} className={input} /></div>
      <div><label htmlFor={`mor-${k}`} className="block text-[13px] font-medium text-ink-2 mb-1">Moratorium (months)</label><input id={`mor-${k}`} name="moratorium_months" type="number" min={0} max={72} defaultValue={l?.moratorium_months ?? 30} className={input} /></div>
      <div><label htmlFor={`status-${k}`} className="block text-[13px] font-medium text-ink-2 mb-1">Status</label><select id={`status-${k}`} name="status" defaultValue={l?.status ?? "researching"} className={input}>{Object.entries(L.STATUS).map(([s, lab]) => <option key={s} value={s}>{lab}</option>)}</select></div>
      <div><label htmlFor={`sanc-${k}`} className="block text-[13px] font-medium text-ink-2 mb-1">Sanctioned amount (Rs) <span className="text-ink-4 font-normal">(once sanctioned)</span></label><input id={`sanc-${k}`} name="sanctioned_inr" inputMode="numeric" defaultValue={l?.sanctioned_inr ?? ""} className={input} /></div>
      <div className="sm:col-span-2"><label htmlFor={`doc-${k}`} className="block text-[13px] font-medium text-ink-2 mb-1">Sanction letter</label>
        <select id={`doc-${k}`} name="document_id" defaultValue={l?.document_id ?? 0} className={input}><option value={0}>No document yet</option>{fin.map((d) => <option key={d.id} value={d.id}>{d.original_name}</option>)}</select></div>
      <fieldset className="sm:col-span-2"><legend className="text-[13px] font-medium text-ink-2 mb-1">Documents the lender usually asks for</legend>
        <div className="grid sm:grid-cols-2 gap-x-4">{Object.entries(L.CHECKLIST).map(([c, lab]) => <label key={c} className="flex items-start gap-2.5 min-h-[40px] text-[14px] text-ink-2"><input type="checkbox" name="checks" value={c} defaultChecked={l?.checks.includes(c)} className="mt-1" />{lab}</label>)}</div></fieldset>
      <div className="sm:col-span-2"><button type="submit" className="min-h-[48px] px-6 rounded-lg bg-orange hover:bg-orange-dark text-white font-semibold text-[15px]">{l ? "Save changes" : "Add loan"}</button></div>
    </form>
  );
}

export default async function LoansPage() {
  const me = await requireUser("student");
  const loans = await L.forUser(me.id);
  const fin = (await V.forUser(me.id)).filter((d) => d.doc_type === "financial" && d.status !== "rejected");
  return (
    <PortalPage user={me} active="abroad" title="My education loans" subtitle="Track lenders, documents and your repayment estimate. GrowQR is not a lender and does not arrange loans." wide>
      <Flash />
      {loans.map((l) => (
        <Card key={l.id} title={`${l.lender}: ${L.STATUS[l.status]}`}>
          {l.emi ? (
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-[14px]">
              {[["Monthly EMI", A.inr(l.emi.emi)], ["Balance when repayment starts", A.inr(l.emi.balance_at_start)], ["Total payable", A.inr(l.emi.total_payable)], ["Total interest", A.inr(l.emi.total_interest)]].map(([k, v]) => <div key={k} className="rounded-xl bg-cream-2 px-3 py-2"><dt className="text-[12px] text-ink-4">{k}</dt><dd className="font-bold text-ink">{v}</dd></div>)}
            </dl>
          ) : <p className="text-[14px] text-ink-3 mb-4">Add the interest rate to see your estimated EMI.</p>}
          <details><summary className="cursor-pointer text-[14px] font-medium text-orange-dark min-h-[44px] flex items-center">Edit this loan</summary><div className="mt-3"><LoanForm l={l} fin={fin} /></div></details>
          <form action={deleteLoanAction} className="mt-2"><input type="hidden" name="id" value={l.id} /><button type="submit" className="min-h-[44px] px-3 rounded-lg text-[14px] text-red-700 hover:bg-red-50">Remove loan</button></form>
        </Card>
      ))}
      <Card title="Add a loan"><LoanForm fin={fin} /></Card>
      <p className="text-[13px] text-ink-4 max-w-3xl">The EMI assumes interest during the moratorium is added to the balance when repayment starts, then a standard reducing-balance EMI. Your lender&apos;s figures will differ.</p>
    </PortalPage>
  );
}
