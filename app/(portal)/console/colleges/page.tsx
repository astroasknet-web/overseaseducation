import type { Metadata } from "next";
import * as IN from "@/lib/admin/institutions";
import { btnDark, btnLine, box, ConsolePage, field, Stats } from "@/components/admin/console-page";
import { adminGate } from "../gate";
import { collegeAction } from "../actions";

export const metadata: Metadata = { title: "College submissions | GrowQR", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Colleges() {
  const me = await adminGate("/console/colleges");
  const [pending, total] = await Promise.all([IN.pending(), IN.approvedCount()]);
  return (
    <ConsolePage me={me} tab="colleges" title="College submissions" subtitle={`Colleges students added because they could not find them. ${IN.PROMOTE_AT} matching submissions approve one automatically.`}>
      <Stats items={[["Searchable colleges", total.toLocaleString("en-IN")], ["Waiting for review", pending.length]]} />
      {!pending.length ? <p className="text-[14px] text-ink-3">Nothing to review.</p> : null}
      {pending.map((c) => (
        <article key={c.id} className={box}>
          <h3 className="text-[17px] font-semibold text-ink">{c.name}</h3>
          <p className="text-[14px] text-ink-3 mb-3">{[c.district, c.state].filter(Boolean).join(", ")} &middot; {c.submit_count} submission{c.submit_count === 1 ? "" : "s"} &middot; first added {new Date(c.created_at.replace(" ", "T") + "Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" })}</p>
          <div className="flex gap-3 mb-3">
            <form action={collegeAction}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="act" value="approve" /><button className={btnDark} type="submit">Approve</button></form>
            <form action={collegeAction}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="act" value="reject" /><button className={btnLine} type="submit">Reject</button></form>
          </div>
          {c.matches.length ? (
            <form action={collegeAction} className="flex flex-wrap items-end gap-3"><input type="hidden" name="id" value={c.id} /><input type="hidden" name="act" value="merge" />
              <div><label htmlFor={`t${c.id}`} className="block text-[13px] text-ink-3 mb-1">Same as an existing college?</label>
                <select id={`t${c.id}`} name="target" className={field}>{c.matches.map((m) => <option key={m.id} value={m.id}>{m.name}{m.place ? ` (${m.place})` : ""}</option>)}</select></div>
              <button className={btnLine} type="submit">Merge into it</button></form>
          ) : null}
        </article>
      ))}
    </ConsolePage>
  );
}
