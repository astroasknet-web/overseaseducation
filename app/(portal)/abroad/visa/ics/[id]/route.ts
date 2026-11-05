import { NextResponse } from "next/server";
import { databaseConfigured } from "@/lib/portal/db";
import { getSession } from "@/lib/portal/session";
import * as visa from "@/lib/abroad/visa";

export const dynamic = "force-dynamic";

// The visa appointment as a calendar file. Only the case's owner can download it.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!databaseConfigured()) return new NextResponse("Not available.", { status: 503 });
  const me = (await getSession())?.user;
  const { id } = await params;
  const c = me && /^\d{1,9}$/.test(id) ? await visa.find(Number(id)) : null;
  if (!me || !c || Number(c.user_id) !== me.id || !c.appointment_at) return new NextResponse("Not found.", { status: 404 });
  return new NextResponse(visa.ics(c), { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": 'attachment; filename="visa-appointment.ics"', "Cache-Control": "private, no-store" } });
}
