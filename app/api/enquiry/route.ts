import { NextResponse } from "next/server";
import { z } from "zod";
import { databaseConfigured, run } from "@/lib/portal/db";
import { rateLimit, rateLimited } from "@/lib/rate-limit";
import { createLogger } from "@/lib/log";

const log = createLogger("enquiry");

const clean = (max: number) => z.string().trim().max(max).default("");
const Counselling = z.object({
  kind: z.literal("counselling"),
  name: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(190),
  phone: z.string().trim().regex(/^[+()\d\s-]{7,20}$/, "Please enter a valid phone number."),
  destination: clean(60),
  level: clean(40),
  intake: clean(40),
  service: clean(80),
  source: clean(60),
  website: z.string().max(200).optional(), // honeypot
});
const Newsletter = z.object({
  kind: z.literal("newsletter"),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(190),
  source: clean(60),
  website: z.string().max(200).optional(),
});
const Body = z.discriminatedUnion("kind", [Counselling, Newsletter]);

export async function POST(req: Request) {
  const rl = await rateLimit(req, { key: "enquiry", limit: 6, windowMs: 10 * 60_000 });
  if (!rl.ok) return rateLimited(rl.retryAfterSec);

  let json: unknown;
  try { json = await req.json(); } catch { return NextResponse.json({ error: "bad_request", message: "Invalid request." }, { status: 400 }); }
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", message: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 422 });
  }
  const d = parsed.data;
  if (d.website) return NextResponse.json({ ok: true }); // bots fill the hidden field; pretend success
  if (!databaseConfigured()) {
    return NextResponse.json({ error: "unavailable", message: "We cannot take enquiries right now. Please try again shortly." }, { status: 503 });
  }
  try {
    if (d.kind === "counselling") {
      await run(
        "INSERT INTO overseas_enquiries (kind, full_name, email, phone, destination, study_level, intake, service, source) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        ["counselling", d.name, d.email, d.phone, d.destination, d.level, d.intake, d.service, d.source || "home"],
      );
    } else {
      await run("INSERT INTO overseas_enquiries (kind, email, source) VALUES ($1,$2,$3)", ["newsletter", d.email, d.source || "footer"]);
    }
  } catch (e) {
    log.error("insert failed", { message: (e as Error).message });
    return NextResponse.json({ error: "server", message: "Something went wrong. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
