import { NextResponse } from "next/server";
import { databaseConfigured } from "@/lib/portal/db";
import { getSession } from "@/lib/portal/session";
import * as privacy from "@/lib/abroad/privacy";
import * as store from "@/lib/abroad/store";

export const dynamic = "force-dynamic";

// A student downloads everything GrowQR holds about their study-abroad journey (data portability). Only their own data, only when signed in.
export async function GET() {
  if (!databaseConfigured()) return new NextResponse("Not available.", { status: 503 });
  const me = (await getSession())?.user;
  if (!me || me.role !== "student") return new NextResponse("Please log in.", { status: 401 });
  await store.audit(me.id, me.id, "data.export");
  return new NextResponse(JSON.stringify(await privacy.exportData(me.id), null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": 'attachment; filename="growqr-study-abroad-data.json"', "Cache-Control": "no-store" },
  });
}
