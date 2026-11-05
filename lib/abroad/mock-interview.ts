import { all, one, run, tx, val } from "../portal/db";
import { phpRound } from "../qrscore/php";
import bankData from "./data/visa-interviews.json";
import * as notify from "./notify";
import { audit } from "./store";

/**
 * Visa interview practice (port of Portal\MockInterview). The student types answers to realistic questions; we check, with plain keyword
 * rules, which common points the answer covers and whether its length suits the interview style. This is practice and self-checking, not a
 * prediction of any visa outcome. A counselor can add human feedback on a finished session.
 */
export const QUESTIONS_PER_SESSION = 6;
export const MAX_ANSWER = 1500;
const HEDGES = ["i dont know", "i don't know", "not sure", "maybe", "i guess", "i think so"];
const AGENT = ["my agent", "consultant told", "agent told", "consultancy", "they told me to say", "was told to say"];

export interface Question { id: string; cat: string; q: string; tip?: string; c: Array<[string, string[]]> }
export interface InterviewCountry { visa: string; format: string; ideal_words: [number, number]; watch: string[]; links: Array<{ label: string; url: string }>; questions: Question[] }
interface Bank { _note: string; reviewed: string; countries: Record<string, InterviewCountry> }

export const bank = (): Bank => bankData as unknown as Bank;
export const country = (key: string): InterviewCountry | null => bank().countries[key] ?? null;
export const question = (countryKey: string, qid: string): Question | null => country(countryKey)?.questions.find((q) => q.id === qid) ?? null;

const shuffle = <T,>(a: T[]): T[] => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

/** Pick questions with a spread of categories. Returns the new (or the open) session id, or an error. */
export async function start(uid: number, countryKey: string): Promise<number | string> {
  const c = country(countryKey);
  if (!c) return "Choose a country to practise for.";
  // Resume an unfinished session rather than piling them up.
  const open = await val<number>("SELECT id FROM sa_mock_sessions WHERE user_id = $1 AND country_key = $2 AND finished_at IS NULL ORDER BY id DESC LIMIT 1", [uid, countryKey]);
  if (open !== null) return Number(open);
  if (Number(await val("SELECT COUNT(*) FROM sa_mock_sessions WHERE user_id = $1", [uid])) >= 60) return "You have many saved sessions. Delete some old ones to start a new one.";
  const pool = shuffle(c.questions);
  const picked = new Map<string, Question>();
  const cats = new Set<string>();
  for (const q of pool) { // first pass: one per category
    if (!cats.has(q.cat)) {
      cats.add(q.cat);
      picked.set(q.id, q);
    }
  }
  for (const q of pool) {
    if (picked.size >= QUESTIONS_PER_SESSION) break;
    picked.set(q.id, q);
  }
  const ids = shuffle([...picked.keys()].slice(0, QUESTIONS_PER_SESSION));
  return Number(await val("INSERT INTO sa_mock_sessions (user_id, country_key, questions_json, created_at) VALUES ($1,$2,$3,NOW()) RETURNING id", [uid, countryKey, JSON.stringify(ids)]));
}

export interface Session { id: number; user_id: number; country_key: string; questions_json: string; score: number | null; created_at: string; finished_at: string | null; qids: string[] }

export async function session(id: number): Promise<Session | null> {
  const s = await one<Record<string, unknown>>("SELECT * FROM sa_mock_sessions WHERE id = $1", [id]);
  if (!s) return null;
  let qids: string[] = [];
  try {
    const v = JSON.parse(String(s.questions_json));
    if (Array.isArray(v)) qids = v.map(String);
  } catch {
    /* none */
  }
  return { ...(s as object), id: Number(s.id), user_id: Number(s.user_id), score: s.score === null ? null : Number(s.score), qids } as Session;
}

export async function sessionsFor(uid: number, limit = 20): Promise<Array<Record<string, unknown>>> {
  return all(`SELECT * FROM sa_mock_sessions WHERE user_id = $1 ORDER BY id DESC LIMIT ${Math.trunc(limit)}`, [uid]);
}

export interface StoredAnswer { question_id: string; answer: string; words: number; coverage: number; missing: string[] }
export async function answers(sessionId: number): Promise<Record<string, StoredAnswer>> {
  const out: Record<string, StoredAnswer> = {};
  for (const r of await all<Record<string, unknown>>("SELECT * FROM sa_mock_answers WHERE session_id = $1", [sessionId])) {
    let missing: string[] = [];
    try {
      const v = JSON.parse(String(r.missing_json ?? "[]"));
      if (Array.isArray(v)) missing = v.map(String);
    } catch {
      /* none */
    }
    out[String(r.question_id)] = { question_id: String(r.question_id), answer: String(r.answer), words: Number(r.words), coverage: Number(r.coverage), missing };
  }
  return out;
}

/** Words in an answer (letters, numbers and common symbols). */
export const wordCount = (text: string): number => (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.,%£€$-]*/gu) ?? []).length;

export interface Score { coverage: number; hit: string[]; missing: string[]; words: number; length: "ok" | "short" | "long" | "empty"; flags: string[] }

export function score(q: Pick<Question, "c">, answer: string, ideal: [number, number]): Score {
  const t = answer.replace(/’/g, "'").toLowerCase();
  const hit: string[] = [];
  const missing: string[] = [];
  for (const [label, keywords] of q.c) (keywords.some((k) => t.includes(k.toLowerCase())) ? hit : missing).push(label);
  const words = wordCount(answer);
  const flags: string[] = [];
  let length: Score["length"] = "ok";
  if (words === 0) length = "empty";
  else if (words < ideal[0]) {
    length = "short";
    flags.push("Very short. Add a reason or a concrete detail.");
  } else if (words > ideal[1]) {
    length = "long";
    flags.push(`Long for an interview. Aim for the main point in about ${ideal[1]} words or fewer.`);
  }
  const h = HEDGES.find((x) => t.includes(x));
  if (h) flags.push(`Hesitant wording ("${h}") can sound unprepared. Say what you do know.`);
  if (AGENT.some((a) => t.includes(a))) flags.push("Mentioning that an agent or consultant shaped your answer raises doubts about your own plan.");
  const total = q.c.length;
  return { coverage: total ? phpRound((hit.length / total) * 100) : 0, hit, missing, words, length, flags };
}

export const band = (s: number): [string, string] => (s >= 70 ? ["Strong", "st-green"] : s >= 40 ? ["Getting there", "st-amber"] : ["Needs more work", "st-red"]);

/** Save answers and finish. Returns an error message, or null. */
export async function submit(uid: number, sessionId: number, given: Record<string, string>): Promise<string | null> {
  const s = await session(sessionId);
  if (!s || s.user_id !== uid) return "Practice session not found.";
  if (s.finished_at !== null) return "This session is already finished.";
  const ideal = country(s.country_key)?.ideal_words ?? [20, 120];
  const rows: Array<[string, string, Score]> = [];
  let answered = 0;
  let sum = 0;
  for (const qid of s.qids) {
    const q = question(s.country_key, qid);
    if (!q) continue;
    const text = Array.from(String(given[qid] ?? "")).slice(0, MAX_ANSWER).join("").trim();
    const sc = score(q, text, ideal);
    if (text !== "") answered++;
    sum += sc.coverage;
    rows.push([qid, text, sc]);
  }
  if (answered === 0) return "Answer at least one question before you finish.";
  try {
    await tx(async (c) => {
      for (const [qid, text, sc] of rows) {
        await c.query(
          `INSERT INTO sa_mock_answers (session_id, question_id, answer, words, coverage, missing_json) VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (session_id, question_id) DO UPDATE SET answer = EXCLUDED.answer, words = EXCLUDED.words, coverage = EXCLUDED.coverage, missing_json = EXCLUDED.missing_json`,
          [sessionId, qid, text, sc.words, sc.coverage, JSON.stringify(sc.missing)],
        );
      }
      await c.query("UPDATE sa_mock_sessions SET score = $1, finished_at = NOW() WHERE id = $2", [phpRound(sum / Math.max(1, rows.length)), sessionId]);
    });
  } catch {
    return "We could not save your answers. Please try again.";
  }
  await audit(uid, uid, "mock.finish", `${s.country_key} #${sessionId}`);
  return null;
}

export async function remove(uid: number, id: number): Promise<boolean> {
  const n = await run("DELETE FROM sa_mock_sessions WHERE id = $1 AND user_id = $2", [id, uid]);
  if (n) await audit(uid, uid, "mock.delete", "#" + id);
  return n > 0;
}

export async function feedback(sessionId: number): Promise<Array<Record<string, unknown> & { author: string | null; body: string }>> {
  return all("SELECT f.*, u.name AS author FROM sa_mock_feedback f LEFT JOIN users u ON u.id = f.author_id WHERE f.session_id = $1 ORDER BY f.id", [sessionId]);
}

/** Counselor feedback on a finished session. Returns an error message, or null. */
export async function addFeedback(sessionId: number, authorId: number, body: string): Promise<string | null> {
  const b = body.trim();
  const s = await session(sessionId);
  if (!s || s.finished_at === null) return "Only finished sessions can receive feedback.";
  if (b === "") return "Write your feedback first.";
  await run("INSERT INTO sa_mock_feedback (session_id, author_id, body, created_at) VALUES ($1,$2,$3,NOW())", [sessionId, authorId, Array.from(b).slice(0, 1000).join("")]);
  await audit(authorId, s.user_id, "mock.feedback", "#" + sessionId);
  await notify.mockFeedback(s.user_id, country(s.country_key)?.visa ?? "visa", String(await val("SELECT name FROM users WHERE id = $1", [authorId])), sessionId);
  return null;
}
