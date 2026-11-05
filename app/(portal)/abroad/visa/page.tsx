import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/portal/guard";
import * as visa from "@/lib/abroad/visa";
import { saveVisaAction } from "@/app/abroad/more-actions";
import { Flash } from "@/components/abroad/parts";
import { Card, PortalPage } from "@/components/portal/shell";

export const metadata: Metadata = { title: "My visa tracker | GrowQR" };
export const dynamic = "force-dynamic";

const input = "w-full px-3 py-2.5 rounded-lg border border-black/[0.15] bg-white text-[15px] min-h-[44px]";
const dt = (s: string | null) => (s ? String(s).slice(0, 16).replace(" ", "T") : "");

export default async function VisaPage() {
  const me = await requireUser("student");
  const cases = await visa.forUser(me.id);
  const ready = await Promise.all(cases.map((c) => visa.readiness(me.id, c)));
  return (
    <PortalPage user={me} active="abroad" title="My visa tracker" subtitle="You book the appointment with the embassy; we remind you, give you a calendar file and check you are ready." wide>
      <Flash />
      {!cases.length ? <Card><p className="text-[15px] text-ink-3">A visa case appears here once a university makes you an offer. <Link className="underline" href="/abroad#apps">See your applications</Link>.</p></Card> : null}
      {cases.map((c, i) => (
        <Card key={c.id} title={c.uni_name}>
          <p className="text-[14px] text-ink-3 mb-4">{c.program} &middot; {c.intake} &middot; {visa.STAGES[c.stage]}{c.appointment_at ? <> &middot; <a className="underline" href={`/abroad/visa/ics/${c.id}`}>Add to calendar</a></> : null}</p>
          <div className="mb-5">
            <h3 className="text-[15px] font-semibold text-ink mb-1">Readiness: {ready[i].done} of {ready[i].total}</h3>
            <div className="h-2 rounded-full bg-cream-3 overflow-hidden mb-2" role="img" aria-label={`${ready[i].done} of ${ready[i].total} ready`}><span className="block h-full bg-orange rounded-full" style={{ width: `${(ready[i].done / ready[i].total) * 100}%` }} /></div>
            <ul className="text-[14px] space-y-1">{ready[i].items.map((it) => <li key={it[0]}>{it[1] ? <span className="text-emerald-800">&#10003; {it[0]}</span> : <Link className="text-ink-2 underline" href={it[2]}>+ {it[0]}</Link>}</li>)}</ul>
          </div>
          <form action={saveVisaAction} className="grid sm:grid-cols-2 gap-4">
            <input type="hidden" name="id" value={c.id} />
            <div><label htmlFor={`st${c.id}`} className="block text-[13px] font-medium text-ink-2 mb-1">Where you are</label>
              <select id={`st${c.id}`} name="stage" defaultValue={c.stage} className={input}>{Object.entries(visa.STAGES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
            <div><label htmlFor={`ap${c.id}`} className="block text-[13px] font-medium text-ink-2 mb-1">Appointment date and time</label>
              <input id={`ap${c.id}`} name="appointment_at" type="datetime-local" defaultValue={dt(c.appointment_at)} className={input} /></div>
            <div><label htmlFor={`bi${c.id}`} className="block text-[13px] font-medium text-ink-2 mb-1">Biometrics date and time <span className="text-ink-4 font-normal">(if separate)</span></label>
              <input id={`bi${c.id}`} name="biometrics_at" type="datetime-local" defaultValue={dt(c.biometrics_at)} className={input} /></div>
            <div><label htmlFor={`ce${c.id}`} className="block text-[13px] font-medium text-ink-2 mb-1">Centre</label>
              <input id={`ce${c.id}`} name="centre" maxLength={80} defaultValue={c.centre} placeholder="e.g. US Consulate, Chennai" className={input} /></div>
            <div className="sm:col-span-2"><label htmlFor={`no${c.id}`} className="block text-[13px] font-medium text-ink-2 mb-1">Notes</label>
              <textarea id={`no${c.id}`} name="notes" rows={2} maxLength={500} defaultValue={c.notes} className={input} /></div>
            <div className="sm:col-span-2"><button type="submit" className="min-h-[48px] px-6 rounded-lg bg-orange hover:bg-orange-dark text-white font-semibold text-[15px]">Save</button></div>
          </form>
        </Card>
      ))}
    </PortalPage>
  );
}
