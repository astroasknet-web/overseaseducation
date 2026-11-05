import { NextResponse } from "next/server";
import { databaseConfigured } from "@/lib/portal/db";
import { getSession } from "@/lib/portal/session";
import { mfaRequiredFor } from "@/lib/portal/auth";
import * as counsel from "@/lib/abroad/counsel";
import * as store from "@/lib/abroad/store";
import * as vault from "@/lib/abroad/vault";
import * as storage from "@/lib/market/storage";

export const dynamic = "force-dynamic";

const plain = (body: string, status: number) => new NextResponse(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "private, no-store" } });

// Serves a vault document, only through a short-lived signed link issued to the signed-in viewer (the student, or an authorised counselor / admin).
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!databaseConfigured()) return plain("Not available.", 503);
  const me = (await getSession())?.user;
  if (!me || !["student", "admin", "counselor"].includes(me.role)) return plain("Please log in.", 401);
  if (me.role !== "student" && mfaRequiredFor(me) && !me.mfa_enabled_at) return plain("Set up two-step login first.", 403);
  const { id: raw } = await params;
  const q = new URL(req.url).searchParams;
  const id = /^\d{1,9}$/.test(raw) ? Number(raw) : 0;
  const doc = id ? await vault.find(id) : null;
  const allowed = doc !== null
    && (await vault.validLink(id, me.id, Number(q.get("exp") ?? 0), q.get("sig") ?? ""))
    && (me.role === "student" ? Number(doc.user_id) === me.id : await counsel.canAccess(me, Number(doc.user_id)));
  if (!doc || !allowed) return plain("This link has expired or is not valid. Open the document again from your vault.", 403);
  const bytes = await storage.get("vault", doc.stored_name.replace(/^.*[\\/]/, ""));
  if (!bytes) return plain("File is no longer available.", 404);
  await store.audit(me.id, Number(doc.user_id), "doc.view", `${doc.doc_type} #${id}`);
  const ext = (doc.stored_name.split(".").pop() ?? "").toLowerCase();
  const inline = ["pdf", "jpg", "jpeg", "png"].includes(ext);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store", "Content-Type": doc.mime,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${doc.original_name.replace(/[^\w.\-]+/g, "_")}"`, "Content-Length": String(bytes.length),
    },
  });
}
