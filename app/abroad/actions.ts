"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isVerified } from "@/lib/portal/auth";
import { databaseConfigured } from "@/lib/portal/db";
import { currentUser } from "@/lib/portal/guard";
import { safeNext } from "@/lib/portal/security";
import * as A from "@/lib/abroad/catalogue";
import * as S from "@/lib/abroad/store";
import * as V from "@/lib/abroad/vault";
import { putSessionData } from "@/lib/portal/session";
import { BUDGETS, intakes } from "@/lib/abroad/options";

/** Server Actions for the student's study-abroad journey. Each re-checks that the caller is a signed-in student, and email-confirmed where personal data is stored. */
const flash = (kind: "ok" | "err", text: string) => putSessionData({ sa_flash: [kind, text] });

async function student(back: string) {
  const me = await currentUser();
  if (!me) redirect(`/login?next=${encodeURIComponent(back)}`);
  if (me.role !== "student") redirect(back);
  return me;
}

/** Add or remove a university from the shortlist. Safe for a signed-out visitor: they are sent to log in and returned. */
export async function shortlistAction(fd: FormData): Promise<void> {
  const back = safeNext(String(fd.get("back") ?? ""), "/abroad");
  const me = await student(back);
  const id = parseInt(String(fd.get("id") ?? ""), 10) || 0;
  const on = await S.toggleShortlist(me.id, id);
  await S.audit(me.id, me.id, on ? "shortlist.add" : "shortlist.remove", String(id));
  await S.syncStage(me.id, me.id);
  redirect(back);
}

export async function applyAction(fd: FormData): Promise<void> {
  const back = safeNext(String(fd.get("back") ?? ""), "/abroad");
  const me = await student(back);
  if (!isVerified(me)) {
    await flash("err", "Please confirm your email address first.");
    redirect(back);
  }
  const r = await S.createApplication(me.id, parseInt(String(fd.get("id") ?? ""), 10) || 0, String(fd.get("program") ?? ""), String(fd.get("intake") ?? ""));
  await flash(typeof r === "string" ? "err" : "ok", typeof r === "string" ? r : "Application started. Upload your documents, then submit it for review.");
  redirect("/abroad#apps");
}

export async function submitAction(fd: FormData): Promise<void> {
  const me = await student("/abroad");
  if (!isVerified(me)) {
    await flash("err", "Please confirm your email address first.");
    redirect("/abroad");
  }
  const err = await S.submitForReview(me.id, parseInt(String(fd.get("id") ?? ""), 10) || 0);
  await flash(err ? "err" : "ok", err ?? "Submitted. A counselor will review your documents and let you know.");
  redirect("/abroad#apps");
}

export async function answerOfferAction(fd: FormData): Promise<void> {
  const me = await student("/abroad");
  if (!isVerified(me)) {
    await flash("err", "Please confirm your email address first.");
    redirect("/abroad");
  }
  const accept = String(fd.get("answer") ?? "") === "accept";
  const err = await S.answerOffer(me.id, parseInt(String(fd.get("id") ?? ""), 10) || 0, accept);
  await flash(err ? "err" : "ok", err ?? (accept ? "Offer accepted. Your visa checklist is ready." : "Offer declined."));
  redirect("/abroad#apps");
}

export async function visaTickAction(fd: FormData): Promise<void> {
  const me = await student("/abroad");
  await S.toggleVisaItem(me.id, parseInt(String(fd.get("id") ?? ""), 10) || 0, parseInt(String(fd.get("idx") ?? ""), 10));
  redirect("/abroad#apps");
}

export async function deleteDocAction(fd: FormData): Promise<void> {
  const me = await student("/abroad/documents");
  const id = parseInt(String(fd.get("id") ?? ""), 10) || 0;
  const ok = await V.remove(me.id, id);
  if (ok) await S.audit(me.id, me.id, "doc.delete", String(id));
  await flash(ok ? "ok" : "err", ok ? "Document deleted." : "Document not found.");
  redirect("/abroad/documents");
}

export interface UploadState { ok?: boolean; error?: string }

export async function uploadDocAction(_prev: UploadState, fd: FormData): Promise<UploadState> {
  if (!databaseConfigured()) return { error: "Uploads are not available right now." };
  const me = await currentUser();
  if (!me || me.role !== "student") redirect("/login?next=/abroad/documents");
  if (!isVerified(me)) return { error: "Please confirm your email address first." };
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file to upload." };
  const r = await V.upload(me.id, String(fd.get("doc_type") ?? ""), { name: file.name, size: file.size, bytes: new Uint8Array(await file.arrayBuffer()) }, (a, d) => S.audit(me.id, me.id, a, d));
  if (typeof r === "string") return { error: r };
  await S.audit(me.id, me.id, "doc.upload", String(fd.get("doc_type")));
  await S.syncStage(me.id, me.id);
  revalidatePath("/abroad/documents");
  revalidatePath("/abroad");
  return { ok: true };
}

export interface ProfileState { error?: string; errors?: Record<string, string>; values?: Record<string, string | string[]> }

export async function saveProfileAction(_prev: ProfileState, fd: FormData): Promise<ProfileState> {
  const me = await student("/abroad/profile");
  if (!isVerified(me)) return { error: "Please confirm your email address before saving your profile." };
  const cs = await A.countries();
  const g = (k: string) => String(fd.get(k) ?? "").trim();
  const v = { level: g("level"), field: g("field"), score_type: g("score_type"), score_value: g("score_value"), english_test: g("english_test"), english_score: g("english_score"), gre: g("gre"), budget_inr: g("budget_inr"), intake: g("intake"), goal: Array.from(g("goal")).slice(0, 500).join(""), countries: fd.getAll("countries").map(String).filter((c) => c in cs) };
  const e: Record<string, string> = {};
  if (!["UG", "PG"].includes(v.level)) e.level = "Choose the level you want to study.";
  if (!A.FIELDS.includes(v.field)) e.field = "Choose a field of study.";
  const range = ({ percentage: [30, 100], cgpa10: [3, 10], gpa4: [1.5, 4] } as Record<string, [number, number]>)[v.score_type];
  const sv = Number(v.score_value);
  if (!range) e.score_value = "Choose how you report your score.";
  else if (v.score_value === "" || !Number.isFinite(sv) || sv < range[0] || sv > range[1]) e.score_value = `Enter a score between ${range[0]} and ${range[1]}.`;
  const es = Number(v.english_score);
  if (!["none", "IELTS", "TOEFL", "PTE"].includes(v.english_test)) e.english_test = "Choose an option.";
  else if (v.english_test !== "none") {
    const max = ({ IELTS: [1, 9], TOEFL: [0, 120], PTE: [10, 90] } as Record<string, [number, number]>)[v.english_test];
    if (v.english_score === "" || !Number.isFinite(es) || es < max[0] || es > max[1]) e.english_score = `Enter your ${v.english_test} score (${max[0]} to ${max[1]}).`;
  }
  if (v.gre !== "" && (!/^\d+$/.test(v.gre) || Number(v.gre) < 260 || Number(v.gre) > 340)) e.gre = "GRE total must be between 260 and 340, or leave it empty.";
  const budget = parseInt(v.budget_inr, 10);
  if (!(budget in BUDGETS)) e.budget_inr = "Choose a yearly budget.";
  if (!v.countries.length) e.countries = "Choose at least one country you are open to.";
  if (!intakes().includes(v.intake)) e.intake = "Choose an intake.";
  const existing = await S.profile(me.id);
  if (!existing?.consent_at && !fd.get("consent")) e.consent = "Please agree so we can match you and handle your documents.";
  if (Object.keys(e).length) return { errors: e, values: v };
  await S.saveProfile(me.id, {
    level: v.level, field: v.field, score_type: v.score_type, score_value: sv, english_test: v.english_test, english_score: v.english_test === "none" ? null : es,
    gre: v.gre === "" ? null : Number(v.gre), budget_inr: budget, countries: v.countries, intake: v.intake, goal: v.goal,
  }, Boolean(fd.get("consent")) || Boolean(existing?.consent_at));
  redirect("/abroad/matches?saved=1");
}
