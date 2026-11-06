import { all, one, run } from "../portal/db";

/**
 * The Germany public universities programme. One place for the fee, the score rule and the assurance, so the public page, the student's
 * dashboard card, the product in the shop and the staff screen all say the same thing.
 */
export const GERMANY = {
  key: "germany-public",
  sku: "program-germany-public",
  name: "Germany Public Universities Programme",
  /** Paid once, in rupees, tax included. */
  feeInr: 250000,
  /** The student must score MORE than this percentage in the Yugty readiness test. */
  scoreAbove: 75,
  /** Share of the fee refunded when the assurance applies and the student chooses the refund. */
  refundPct: 40,
  includes: [
    { title: "TestAS preparation", text: "Structured preparation and timed mock tests for the TestAS, with your score tracked against the 75% mark." },
    { title: "German language training", text: "Live classes and practice that take you towards the German level your chosen programme asks for." },
    { title: "IELTS preparation", text: "Lessons, writing and speaking practice and full mock tests, so your English score is never the weak link." },
    { title: "Applications to public universities", text: "Choosing programmes, preparing documents and submitting your applications, including APS guidance for students from India." },
    { title: "Visa and blocked-account guidance", text: "A step-by-step checklist, document checks and mock interview practice for your student visa." },
    { title: "Education loan help", text: "If the fee or your living costs need a loan, our loan team prepares your file and follows it up with the bank." },
    { title: "Pre-departure briefing", text: "What to pack, how to arrive, housing and your first weeks in Germany." },
  ],
} as const;

export const refundInr = (): number => Math.round((GERMANY.feeInr * GERMANY.refundPct) / 100);

export const STATUSES: Record<string, string> = {
  enrolled: "Enrolled",
  in_programme: "In the programme",
  applied: "Applications sent",
  admitted: "Admission received",
  no_offer: "No offer yet",
  closed: "Closed",
};
export const OUTCOMES: Record<string, string> = { pending: "Not decided", admitted: "Admitted", refund: "Refund chosen", retry: "Next intake chosen" };

export interface Enrolment {
  id: number; user_id: number; status: string; test_score: number | null; consistent: number | null; outcome: string; refund_inr: number | null; note: string; created_at: string; updated_at: string;
  name?: string; email?: string;
}

const map = (r: Record<string, unknown>): Enrolment => ({
  id: Number(r.id), user_id: Number(r.user_id), status: String(r.status), test_score: r.test_score === null || r.test_score === undefined ? null : Number(r.test_score),
  consistent: r.consistent === null || r.consistent === undefined ? null : Number(r.consistent), outcome: String(r.outcome), refund_inr: r.refund_inr === null || r.refund_inr === undefined ? null : Number(r.refund_inr),
  note: String(r.note ?? ""), created_at: String(r.created_at), updated_at: String(r.updated_at), name: r.name === undefined ? undefined : String(r.name), email: r.email === undefined ? undefined : String(r.email),
});

export async function forUser(uid: number): Promise<Enrolment | null> {
  const r = await one("SELECT * FROM germany_enrolments WHERE user_id = $1", [uid]);
  return r ? map(r) : null;
}

export async function listAll(): Promise<Enrolment[]> {
  const rs = await all("SELECT g.*, u.name, u.email FROM germany_enrolments g JOIN users u ON u.id = g.user_id ORDER BY g.updated_at DESC LIMIT 300");
  return rs.map(map);
}

export async function enrol(uid: number): Promise<void> {
  await run("INSERT IGNORE INTO germany_enrolments (user_id, status) VALUES ($1, 'enrolled')", [uid]);
}

export async function enrolByEmail(email: string): Promise<string | null> {
  const u = await one<{ id: number; role: string }>("SELECT id, role FROM users WHERE email = $1", [email.trim().toLowerCase()]);
  if (!u) return "No account has that email address.";
  if (u.role !== "student") return "That account is not a student.";
  await enrol(Number(u.id));
  return null;
}

export interface Update { status: string; test_score: number | null; consistent: boolean | null; outcome: string; note: string }

export async function update(id: number, v: Update): Promise<string | null> {
  if (!STATUSES[v.status]) return "Choose a status.";
  if (!OUTCOMES[v.outcome]) return "Choose an outcome.";
  if (v.test_score !== null && (!(v.test_score >= 0) || v.test_score > 100)) return "A score is a percentage from 0 to 100.";
  const refund = v.outcome === "refund" ? refundInr() : null;
  await run("UPDATE germany_enrolments SET status = $1, test_score = $2, consistent = $3, outcome = $4, refund_inr = $5, note = $6 WHERE id = $7", [
    v.status, v.test_score, v.consistent === null ? null : v.consistent ? 1 : 0, v.outcome, refund, v.note.slice(0, 500), id,
  ]);
  return null;
}

/** Whether the assurance applies: more than 75% in the readiness test and a consistent performer. The remedy only matters if no offer comes. */
export function assurance(e: Pick<Enrolment, "test_score" | "consistent">): { eligible: boolean; text: string } {
  if (e.test_score === null) return { eligible: false, text: `Take the readiness test. You need more than ${GERMANY.scoreAbove}%.` };
  if (!(e.test_score > GERMANY.scoreAbove)) return { eligible: false, text: `Your score is ${e.test_score}%. The assurance applies once you score more than ${GERMANY.scoreAbove}%, so keep practising and retake the test.` };
  if (e.consistent !== 1) return { eligible: false, text: "You have the score. The assurance applies while you stay a consistent performer, so keep attending and completing your tests." };
  return { eligible: true, text: `You meet both conditions. If no German public university admits you, you can choose ${GERMANY.refundPct}% of the fee back or one more intake with us at no extra programme fee.` };
}
