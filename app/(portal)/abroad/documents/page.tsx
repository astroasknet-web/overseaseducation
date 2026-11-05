import type { Metadata } from "next";
import Link from "next/link";
import { isVerified } from "@/lib/portal/auth";
import { requireUser } from "@/lib/portal/guard";
import * as V from "@/lib/abroad/vault";
import { deleteDocAction } from "@/app/abroad/actions";
import { Flash } from "@/components/abroad/parts";
import { UploadForm } from "@/components/abroad/upload-form";
import { Card, PortalPage } from "@/components/portal/shell";
import { Alert } from "@/components/portal/ui";

export const metadata: Metadata = { title: "My study-abroad documents | GrowQR" };
export const dynamic = "force-dynamic";

const PILL: Record<string, string> = { uploaded: "bg-cream-3 text-ink-2", verified: "bg-emerald-50 text-emerald-800", rejected: "bg-red-50 text-red-800" };
const day = (s: string) => new Date(s.replace(" ", "T") + "Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const kb = (n: number) => (n >= 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB");

export default async function DocumentsPage() {
  const me = await requireUser("student");
  const docs = await V.forUser(me.id);
  const missing = await V.missingRequired(me.id);
  const links = new Map<number, string>();
  for (const d of docs) links.set(d.id, await V.link(d.id, me.id));
  return (
    <PortalPage user={me} active="abroad" title="My documents" subtitle="A private vault. Only you and your counselor can open these files, through links that expire in minutes." wide>
      <Flash />
      {missing.length ? <Alert kind="info">Required before you can submit an application: {missing.map((t) => V.TYPES[t].toLowerCase()).join(", ")}.</Alert> : null}
      <Card title="Upload a document">
        {isVerified(me) ? <UploadForm types={V.TYPES} /> : <p className="text-[15px] text-ink-3">Confirm your email address to upload documents.</p>}
        <p className="text-[13px] text-ink-4 mt-4">Every file is scanned for malware and active content before it is stored. Files are kept in a private bucket and every view is logged.</p>
      </Card>
      <Card title={`Your files (${docs.length})`}>
        {!docs.length ? <p className="text-[15px] text-ink-3">Nothing uploaded yet.</p> : (
          <ul className="divide-y divide-black/[0.07]">
            {docs.map((d) => (
              <li key={d.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <b className="text-ink">{V.TYPES[d.doc_type]}</b>
                  <p className="text-[13px] text-ink-3 truncate">{d.original_name} &middot; {kb(Number(d.size))} &middot; {day(d.created_at)}</p>
                  {d.status === "rejected" && d.reject_reason ? <p className="text-[13px] text-red-700">Reason: {d.reject_reason}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${PILL[d.status]}`}>{d.status}</span>
                  <a className="min-h-[44px] inline-flex items-center px-3 rounded-lg border border-black/[0.15] text-[14px] hover:bg-cream-2" href={links.get(d.id)} target="_blank" rel="noopener noreferrer">Open</a>
                  <form action={deleteDocAction}><input type="hidden" name="id" value={d.id} /><button className="min-h-[44px] px-3 rounded-lg text-[14px] text-red-700 hover:bg-red-50" type="submit">Delete</button></form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <p><Link className="underline text-[14px]" href="/abroad">Back to my journey</Link></p>
    </PortalPage>
  );
}
