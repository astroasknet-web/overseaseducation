import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as F from "./funds";
import * as L from "./loans";
import * as M from "./mock-interview";
import * as V from "./visa";

/** Parity: loans, funds, the calendar file and interview scoring must equal the original PHP (php scripts/abroad2-golden.php). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = JSON.parse(readFileSync(path.join(__dirname, "__golden__", "abroad2.json"), "utf8")) as any;
const sa = JSON.parse(readFileSync(path.join(__dirname, "data/study-abroad.json"), "utf8"));

describe("loans", () => {
  it("computes EMIs identically", () => {
    for (const [a, want] of g.emi) expect(L.emi(a[0], a[1], a[2], a[3]), JSON.stringify(a)).toEqual(want);
  });
  it("validates forms identically", () => {
    for (const [input, want] of g.validate) {
      const [vals, errs] = L.validate(input);
      const wantErrs = Array.isArray(want[1]) && want[1].length === 0 ? {} : want[1];
      expect([vals, errs], JSON.stringify(input)).toEqual([want[0], wantErrs]);
    }
  });
});

describe("funds", () => {
  it("sets the same funds target for every country and cost tier", () => {
    expect(g.target.length).toBeGreaterThanOrEqual(21);
    for (const [key, tier, want] of g.target) {
      const c = sa.countries.find((x: { key: string }) => x.key === key);
      expect(F.target({ cost_tier: tier }, { ...c, fx: sa.fx[c.currency] ?? 1 }), `${key}/${tier}`).toEqual(want);
    }
  });
  it("measures coverage identically", () => {
    for (const [a, want] of g.coverage) expect(F.coverage({ documented: a[0], planned: a[1] }, a[2]), JSON.stringify(a)).toEqual(want);
  });
});

describe("visa calendar", () => {
  it("writes the same .ics lines", () => {
    for (const [c, want] of g.ics) expect(V.ics(c).split("\r\n").filter((l) => l !== "" && !l.startsWith("DTSTAMP")), JSON.stringify(c)).toEqual(want);
  });
  it("ends with CRLF and stamps the file", () => {
    const s = V.ics({ id: 1, uni_name: "U", centre: "", appointment_at: "2026-11-03 09:30:00" }, new Date("2026-10-07T01:02:03Z"));
    expect(s.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(s).toContain("DTSTAMP:20261007T010203Z");
  });
  it("parses datetime-local values strictly", () => {
    expect(V.parseLocal("")).toBeNull();
    expect(V.parseLocal("2026-11-03T09:30")).toBe("2026-11-03 09:30:00");
    for (const bad of ["2026-11-03 09:30", "2026-02-30T09:30", "2026-11-03T25:00", "nope", "2026-11-03T09:30:00"]) expect(V.parseLocal(bad), bad).toBe("");
  });
});

describe("mock interview scoring", () => {
  it("scores every question and answer identically", () => {
    expect(g.mock.length).toBeGreaterThan(200);
    for (const [country, qid, answer, ideal, want, words] of g.mock) {
      const q = M.question(country, qid)!;
      expect(M.score(q, answer, ideal), `${country}/${qid}/${String(answer).slice(0, 20)}`).toEqual(want);
      expect(M.wordCount(answer)).toBe(words);
    }
  });
  it("bands scores identically", () => {
    for (const [n, want] of g.band) expect(M.band(n)).toEqual(want);
  });
});
