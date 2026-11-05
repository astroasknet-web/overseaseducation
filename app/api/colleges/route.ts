import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimited } from "@/lib/rate-limit";

// Proxies the free Hipolabs universities API (HTTP-only, so we proxy here)
export async function GET(req: NextRequest) {
  const limit = await rateLimit(req, { key: "colleges", limit: 30, windowMs: 60_000 });
  if (!limit.ok) return rateLimited(limit.retryAfterSec);

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  try {
    // Upstream offers https; prefer it so the response can't be tampered with
    // in transit, and fall back to http only if the TLS endpoint fails.
    const search = (scheme: "https" | "http") =>
      fetch(`${scheme}://universities.hipolabs.com/search?country=India&name=${encodeURIComponent(q)}`, {
        next: { revalidate: 86400 },
      });

    const res = await search("https").catch(() => search("http"));
    if (!res.ok) return NextResponse.json([]);

    const data: { name: string }[] = await res.json();
    const names = data.map((u) => u.name).slice(0, 8);
    return NextResponse.json(names);
  } catch {
    return NextResponse.json([]);
  }
}
