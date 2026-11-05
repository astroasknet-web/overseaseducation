import { NextResponse } from "next/server";
import { databaseConfigured } from "@/lib/portal/db";
import { suggest, topUp } from "@/lib/portal/colleges";

export const dynamic = "force-dynamic";

// Type-ahead for the college picker. Read-only, public, tiny JSON.
export async function GET(req: Request) {
  const h = { "Cache-Control": "private, max-age=60", "X-Content-Type-Options": "nosniff" };
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (!databaseConfigured()) return NextResponse.json(topUp([], q), { headers: h });
  try {
    return NextResponse.json(await suggest(q), { headers: h });
  } catch (e) {
    console.error("college-suggest:", (e as Error).message);
    return NextResponse.json(topUp([], q), { headers: h });
  }
}
