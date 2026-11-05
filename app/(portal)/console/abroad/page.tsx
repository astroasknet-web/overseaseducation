import type { Metadata } from "next";
import Link from "next/link";
import { all, one } from "@/lib/portal/db";
import * as CAT from "@/lib/abroad/catalogue";
import * as CN from "@/lib/abroad/counsel";
import * as VT from "@/lib/abroad/vault";
import { btnDark, btnLine, box, ConsolePage, field, Stats } from "@/components/admin/console-page";
import { adminGate } from "../gate";
import { abroadOpsAction } from "../actions";

export const metadata: Metadata = { title: "Study abroad operations | GrowQR", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type R = Record<string, unknown>;
const when = (ts: unknown) => new Date(String(ts).replace(" ", "T") + "Z").toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" });
const th = "py-2 pr-3 text-left font-medium text-ink-4";

export default async function AbroadOps() {
  const me = await adminGate("/console/abroad");
  const st = (await one<R>(`SELECT (SELECT COUNT(*) FROM sa_profiles) AS profiles, (SELECT COUNT(*) FROM sa_applications WHERE status = 'in_review') AS in_review,
    (SELECT COUNT(*) FROM sa_documents WHERE status = 'uploaded') AS docs, (SELECT COUNT(*) FROM sa_applications WHERE status = 'offer') AS offers`)) ?? {};
  const docs = await all<R>("SELECT d.*, u.name AS student FROM sa_documents d JOIN users u ON u.id = d.user_id WHERE d.status = 'uploaded' ORDER BY d.created_at ASC LIMIT 25");
  const apps = await all<R>(`SELECT a.*, u.name AS student, un.name AS uni_name FROM sa_applications a JOIN users u ON u.id = a.user_id JOIN sa_universities un ON un.id = a.university_id
    WHERE a.status IN ('in_review','applied','offer') ORDER BY CASE a.status WHEN 'in_review' THEN 1 WHEN 'applied' THEN 2 ELSE 3 END, a.updated_at ASC LIMIT 40`);
  const visa = await all<R>("SELECT p.user_id, u.name FROM sa_profiles p JOIN users u ON u.id = p.user_id WHERE p.stage = 'VISA_PREP' ORDER BY p.updated_at ASC LIMIT 20");
  const counselors = await CN.counselors();
  const roster = await all<R>("SELECT p.user_id, p.stage, p.counselor_id, u.name FROM sa_profiles p JOIN users u ON u.id = p.user_id WHERE p.consent_at IS NOT NULL ORDER BY (p.counselor_id IS NOT NULL), p.updated_at DESC LIMIT 40");
  const audit = await all<R>("SELECT a.*, s.name AS subject, k.name AS actor FROM sa_audit a LEFT JOIN users s ON s.id = a.subject_user_id LEFT JOIN users k ON k.id = a.actor_user_id ORDER BY a.id DESC LIMIT 15");
  const links = new Map<number, string>();
  for (const d of docs) links.set(Number(d.id), await VT.link(Number(d.id), me.id));

  return (
    <ConsolePage me={me} tab="abroad" title="Study abroad operations" subtitle="Verify documents, move applications, and review the audit trail.">
      <Stats items={[["Student profiles", Number(st.profiles ?? 0)], ["Documents to verify", Number(st.docs ?? 0)], ["Applications in review", Number(st.in_review ?? 0)], ["Open offers", Number(st.offers ?? 0)]]} />

      <section className={box} aria-labelledby="co-h"><h2 id="co-h" className="text-[18px] font-semibold text-ink mb-2">Counselors and assignments</h2>
        {!counselors.length ? <p className="text-[14px] text-ink-3">No counselors yet. Create a staff login with the counselor role first.</p> : (
          <>
            <p className="text-[14px] text-ink-3 mb-3">{counselors.length} counselor{counselors.length === 1 ? "" : "s"}: {counselors.map((c) => `${c.name} (${c.caseload})`).join(", ")}</p>
            <ul className="divide-y divide-black/[0.07]">{roster.map((r) => (
              <li key={String(r.user_id)} className="py-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[14px]"><b><Link className="hover:underline" href={`/counselor/student/${r.user_id}`}>{String(r.name)}</Link></b> <span className="text-ink-3">{CAT.STAGES[String(r.stage)]?.[0] ?? String(r.stage)}</span></span>
                <form action={abroadOpsAction} className="flex gap-2"><input type="hidden" name="act" value="assign" /><input type="hidden" name="user_id" value={String(r.user_id)} />
                  <label className="sr-only" htmlFor={`as${r.user_id}`}>Counselor for {String(r.name)}</label>
                  <select id={`as${r.user_id}`} name="counselor_id" defaultValue={Number(r.counselor_id ?? 0)} className={field}><option value={0}>Unassigned</option>{counselors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                  <button className={btnLine} type="submit">Save</button></form>
              </li>
            ))}</ul>
          </>)}
      </section>

      <section className="mb-5" aria-labelledby="dv-h"><h2 id="dv-h" className="text-[18px] font-semibold text-ink mb-3">Documents waiting for verification</h2>
        {!docs.length ? <p className="text-[14px] text-ink-3">Nothing to verify.</p> : null}
        {docs.map((d) => (
          <article key={String(d.id)} className={box}>
            <div className="flex flex-wrap justify-between gap-2 mb-2"><div><h3 className="text-[16px] font-semibold text-ink">{VT.TYPES[String(d.doc_type)] ?? String(d.doc_type)} <small className="text-ink-3 font-normal">from {String(d.student)}</small></h3>
              <p className="text-[13px] text-ink-3">{String(d.original_name)} &middot; {Math.round(Number(d.size) / 1024)} KB &middot; {when(d.created_at)}</p></div>
              <a className={`${btnLine} inline-flex items-center`} href={links.get(Number(d.id))} target="_blank" rel="noopener noreferrer">Open file</a></div>
            <form action={abroadOpsAction} className="flex flex-wrap gap-2 items-center"><input type="hidden" name="id" value={String(d.id)} />
              <label className="sr-only" htmlFor={`r${d.id}`}>Reason if rejecting</label><input id={`r${d.id}`} name="reason" maxLength={255} placeholder="Reason (required to reject)" className={`${field} flex-1 min-w-[12rem]`} />
              <label className="sr-only" htmlFor={`da${d.id}`}>Decision</label><select id={`da${d.id}`} name="act" className={field}><option value="doc_verify">Verify</option><option value="doc_reject">Reject (needs a reason)</option></select><button className={btnDark} type="submit">Save</button></form>
          </article>
        ))}
      </section>

      <section className="mb-5" aria-labelledby="ap-h"><h2 id="ap-h" className="text-[18px] font-semibold text-ink mb-3">Applications</h2>
        {!apps.length ? <p className="text-[14px] text-ink-3">No applications in progress.</p> : null}
        {apps.map((a) => {
          const status = String(a.status);
          return (
            <article key={String(a.id)} className={box}>
              <h3 className="text-[16px] font-semibold text-ink">{String(a.uni_name)} <small className="text-ink-3 font-normal">{String(a.student)}</small></h3>
              <p className="text-[13px] text-ink-3 mb-2">{String(a.program)} &middot; {String(a.intake)} &middot; {status.replace("_", " ")}</p>
              <form action={abroadOpsAction} className="flex flex-wrap gap-2 items-center"><input type="hidden" name="id" value={String(a.id)} />
                <label className="sr-only" htmlFor={`n${a.id}`}>Note to student</label><input id={`n${a.id}`} name="note" maxLength={255} placeholder="Note (required to return a draft; shown on offers)" className={`${field} flex-1 min-w-[12rem]`} />
                {status === "offer" || status === "applied" ? <><label className="sr-only" htmlFor={`o${a.id}`}>Offer type</label><select id={`o${a.id}`} name="offer_type" className={field}><option value="conditional">Conditional offer</option><option value="unconditional">Unconditional offer</option></select></> : null}
                <label className="sr-only" htmlFor={`aa${a.id}`}>Next step</label>
                <select id={`aa${a.id}`} name="act" className={field}>
                  {status === "in_review" ? <><option value="to_applied">Mark applied (dispatch)</option><option value="to_draft">Return to student</option></> : null}
                  {status === "applied" ? <><option value="to_offer">Record offer</option><option value="to_declined">Close (no offer)</option></> : null}
                  {status === "offer" ? <option value="to_declined">Withdraw offer</option> : null}
                </select>
                <button className={btnDark} type="submit">Save</button>
              </form>
            </article>
          );
        })}
      </section>

      {visa.length ? (
        <section className={box} aria-labelledby="vs-h"><h2 id="vs-h" className="text-[18px] font-semibold text-ink mb-3">Students in visa preparation</h2>
          <ul className="divide-y divide-black/[0.07]">{visa.map((v) => <li key={String(v.user_id)} className="py-2 flex justify-between items-center"><b className="text-[14px]">{String(v.name)}</b>
            <form action={abroadOpsAction}><input type="hidden" name="act" value="alumni" /><input type="hidden" name="user_id" value={String(v.user_id)} /><button className={btnLine} type="submit">Mark as arrived</button></form></li>)}</ul>
        </section>
      ) : null}

      <section className={box} aria-labelledby="au-h"><h2 id="au-h" className="text-[18px] font-semibold text-ink mb-3">Audit trail (latest)</h2>
        <div className="overflow-x-auto"><table className="w-full text-[14px] min-w-[40rem]"><thead><tr><th scope="col" className={th}>When</th><th scope="col" className={th}>Action</th><th scope="col" className={th}>By</th><th scope="col" className={th}>Student</th><th scope="col" className={th}>Detail</th></tr></thead>
          <tbody>{audit.map((x) => <tr key={String(x.id)} className="border-t border-black/[0.07]"><td className="py-2 pr-3">{when(x.created_at)}</td><td className="pr-3">{String(x.action)}</td><td className="pr-3">{String(x.actor ?? "")}</td><td className="pr-3">{String(x.subject ?? "")}</td><td className="text-ink-3">{String(x.detail ?? "")}</td></tr>)}</tbody></table></div>
        <p className="text-[13px] text-ink-4 mt-3"><Link className="underline" href="/crm">Overseas CRM</Link> is a separate, limited-access tool.</p>
      </section>
    </ConsolePage>
  );
}
