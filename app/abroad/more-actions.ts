"use server";

import { redirect } from "next/navigation";
import { isVerified } from "@/lib/portal/auth";
import { currentUser } from "@/lib/portal/guard";
import { putSessionData } from "@/lib/portal/session";
import * as funds from "@/lib/abroad/funds";
import * as loans from "@/lib/abroad/loans";
import * as mock from "@/lib/abroad/mock-interview";
import * as privacy from "@/lib/abroad/privacy";
import * as visa from "@/lib/abroad/visa";

/** Server Actions for visa, funds, loans, interview practice and privacy. Each re-checks that the caller is a signed-in, email-confirmed student. */
const flash = (kind: "ok" | "err", text: string) => putSessionData({ sa_flash: [kind, text] });
const int = (v: FormDataEntryValue | null): number => parseInt(String(v ?? ""), 10) || 0;

async function student(back: string, needVerified = true) {
  const me = await currentUser();
  if (!me) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (me.role !== "student") redirect("/account");
  if (needVerified && !isVerified(me)) {
    await flash("err", "Please confirm your email address first.");
    redirect(back);
  }
  return me;
}

export async function saveVisaAction(fd: FormData): Promise<void> {
  const me = await student("/abroad/visa");
  const err = await visa.save(me.id, int(fd.get("id")), Object.fromEntries(fd.entries()));
  await flash(err ? "err" : "ok", err ?? "Visa details saved.");
  redirect("/abroad/visa");
}

export async function addFundAction(fd: FormData): Promise<void> {
  const u = int(fd.get("u"));
  const back = `/abroad/funds${u ? "?u=" + u : ""}`;
  const me = await student(back);
  const err = await funds.add(me.id, String(fd.get("kind") ?? ""), String(fd.get("label") ?? ""), String(fd.get("amount") ?? ""), int(fd.get("document_id")));
  await flash(err ? "err" : "ok", err ?? "Source added.");
  redirect(back);
}

export async function removeFundAction(fd: FormData): Promise<void> {
  const u = int(fd.get("u"));
  const back = `/abroad/funds${u ? "?u=" + u : ""}`;
  const me = await student(back, false);
  const ok = await funds.remove(me.id, int(fd.get("id")));
  await flash(ok ? "ok" : "err", ok ? "Source removed." : "Source not found.");
  redirect(back);
}

export async function saveLoanAction(fd: FormData): Promise<void> {
  const me = await student("/abroad/loans");
  const raw: Record<string, unknown> = Object.fromEntries(fd.entries());
  raw.checks = fd.getAll("checks").map(String);
  const [v, errors] = loans.validate(raw);
  if (Object.keys(errors).length) {
    await flash("err", Object.values(errors).join(" "));
    redirect("/abroad/loans");
  }
  const id = int(fd.get("id"));
  const err = await loans.save(me.id, id || null, v, int(fd.get("document_id")));
  await flash(err ? "err" : "ok", err ?? "Loan saved.");
  redirect("/abroad/loans");
}

export async function deleteLoanAction(fd: FormData): Promise<void> {
  const me = await student("/abroad/loans", false);
  const ok = await loans.remove(me.id, int(fd.get("id")));
  await flash(ok ? "ok" : "err", ok ? "Loan removed." : "Loan not found.");
  redirect("/abroad/loans");
}

export async function startMockAction(fd: FormData): Promise<void> {
  const me = await student("/abroad/interview", false);
  const r = await mock.start(me.id, String(fd.get("country") ?? ""));
  if (typeof r === "string") {
    await flash("err", r);
    redirect("/abroad/interview");
  }
  redirect(`/abroad/interview?s=${r}`);
}

export async function finishMockAction(fd: FormData): Promise<void> {
  const me = await student("/abroad/interview", false);
  const sid = int(fd.get("s"));
  const given: Record<string, string> = {};
  for (const [k, v] of fd.entries()) {
    const m = /^a\[([A-Za-z0-9_-]{1,20})\]$/.exec(k);
    if (m) given[m[1]] = String(v);
  }
  const err = await mock.submit(me.id, sid, given);
  if (err) await flash("err", err);
  redirect(`/abroad/interview?s=${sid}`);
}

export async function deleteMockAction(fd: FormData): Promise<void> {
  const me = await student("/abroad/interview", false);
  const ok = await mock.remove(me.id, int(fd.get("s")));
  await flash(ok ? "ok" : "err", ok ? "Practice session deleted." : "Session not found.");
  redirect("/abroad/interview");
}

export async function eraseAction(fd: FormData): Promise<void> {
  const me = await student("/abroad", false);
  if (String(fd.get("confirm") ?? "") !== "DELETE") {
    await flash("err", "Type DELETE to confirm erasing your study-abroad data.");
    redirect("/abroad");
  }
  await privacy.erase(me.id);
  await flash("ok", "Your study-abroad data has been erased.");
  redirect("/study-abroad");
}
