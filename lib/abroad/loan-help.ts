import { all, one, run } from "../portal/db";

/** Loan help: the student tells us what they need, our loan team prepares the file and follows it up with the bank. */
export const STATUS: Record<string, string> = {
  new: "Received",
  contacted: "We have called you",
  docs: "Preparing your documents",
  submitted: "Sent to the bank",
  sanctioned: "Loan sanctioned",
  closed: "Closed",
};
export const COAPPLICANT: Record<string, string> = { parent_salaried: "Parent or guardian with a salary", parent_business: "Parent or guardian with a business", other: "Another relative", none: "Not sure yet" };
export const COLLATERAL: Record<string, string> = { yes: "Yes, I can offer collateral", no: "No collateral", not_sure: "Not sure" };

export interface LoanHelp {
  id: number; user_id: number; amount_inr: number; country: string; university: string; intake: string; coapplicant: string; collateral: string; phone: string; note: string;
  status: string; staff_note: string; created_at: string; name?: string; email?: string;
}
const map = (r: Record<string, unknown>): LoanHelp => ({
  id: Number(r.id), user_id: Number(r.user_id), amount_inr: Number(r.amount_inr), country: String(r.country), university: String(r.university), intake: String(r.intake),
  coapplicant: String(r.coapplicant), collateral: String(r.collateral), phone: String(r.phone), note: String(r.note ?? ""), status: String(r.status), staff_note: String(r.staff_note ?? ""),
  created_at: String(r.created_at), name: r.name === undefined ? undefined : String(r.name), email: r.email === undefined ? undefined : String(r.email),
});

export async function latestFor(uid: number): Promise<LoanHelp | null> {
  const r = await one("SELECT * FROM loan_help_requests WHERE user_id = $1 ORDER BY id DESC LIMIT 1", [uid]);
  return r ? map(r) : null;
}

export async function listAll(): Promise<LoanHelp[]> {
  const rs = await all("SELECT l.*, u.name, u.email FROM loan_help_requests l JOIN users u ON u.id = l.user_id ORDER BY (l.status = 'closed'), l.created_at DESC LIMIT 300");
  return rs.map(map);
}

export interface Input { amount_inr: number; country: string; university: string; intake: string; coapplicant: string; collateral: string; phone: string; note: string }

export function validate(raw: Record<string, string>): [Input | null, string | null] {
  const amount = Math.round(Number(String(raw.amount_inr ?? "").replace(/[, ]/g, "")));
  if (!Number.isFinite(amount) || amount < 100000 || amount > 100000000) return [null, "Enter the loan amount you need, between Rs 1 lakh and Rs 10 crore."];
  const phone = String(raw.phone ?? "").trim();
  if (!/^[+()\d\s-]{7,20}$/.test(phone)) return [null, "Enter a phone number we can call."];
  const coapplicant = String(raw.coapplicant ?? "");
  const collateral = String(raw.collateral ?? "");
  if (!COAPPLICANT[coapplicant]) return [null, "Tell us who would be your co-applicant."];
  if (!COLLATERAL[collateral]) return [null, "Tell us whether you can offer collateral."];
  return [{ amount_inr: amount, country: String(raw.country ?? "").slice(0, 40), university: String(raw.university ?? "").trim().slice(0, 120), intake: String(raw.intake ?? "").slice(0, 30), coapplicant, collateral, phone, note: String(raw.note ?? "").trim().slice(0, 500) }, null];
}

/** One open request at a time: a second one while the first is still being worked on would only split the follow-up. */
export async function create(uid: number, v: Input): Promise<string | null> {
  const open = await one("SELECT id FROM loan_help_requests WHERE user_id = $1 AND status NOT IN ('sanctioned','closed') ORDER BY id DESC LIMIT 1", [uid]);
  if (open) return "You already have a loan request in progress. Our team will be in touch about it.";
  await run("INSERT INTO loan_help_requests (user_id, amount_inr, country, university, intake, coapplicant, collateral, phone, note) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)", [uid, v.amount_inr, v.country, v.university, v.intake, v.coapplicant, v.collateral, v.phone, v.note]);
  return null;
}

export async function setStatus(id: number, status: string, staffNote: string): Promise<string | null> {
  if (!STATUS[status]) return "Choose a status.";
  await run("UPDATE loan_help_requests SET status = $1, staff_note = $2 WHERE id = $3", [status, staffNote.slice(0, 500), id]);
  return null;
}
