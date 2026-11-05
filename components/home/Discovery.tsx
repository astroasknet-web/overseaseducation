"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { BUDGETS, DESTINATIONS, INTAKES, SUBJECTS } from "@/lib/home/content";

export type UniLite = { slug: string; name: string; country: string; levels: string[]; fields: string[]; cost: string };

const TABS = [
  { id: "all", label: "Universities", level: "" },
  { id: "UG", label: "Undergraduate", level: "UG" },
  { id: "PG", label: "Postgraduate", level: "PG" },
  { id: "PhD", label: "Doctoral", level: "PhD" },
  { id: "Dip", label: "Diploma & professional", level: "Dip" },
  { id: "Sch", label: "Scholarships", level: "" },
] as const;

const CATALOGUE = new Set(["usa", "uk", "canada", "germany", "australia", "france", "uae"]);
const COST_BY_BUDGET: Record<string, string[]> = { "15": ["low"], "30": ["low", "mid"], "50": ["low", "mid", "high"], "99": ["low", "mid", "high"] };

/** Compact variant sits in the hero; the full variant has tabs, six filters and a live result preview. */
export default function Discovery({ unis, compact = false }: { unis: UniLite[]; compact?: boolean }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [country, setCountry] = useState("");
  const [subject, setSubject] = useState("");
  const [course, setCourse] = useState("");
  const [budget, setBudget] = useState("");
  const [intake, setIntake] = useState("");
  const level = TABS.find((t) => t.id === tab)?.level ?? "";

  const matches = useMemo(() => {
    const q = course.trim().toLowerCase();
    return unis.filter(
      (u) =>
        (!country || u.country === country) &&
        (!level || level === "PhD" || level === "Dip" || u.levels.includes(level)) &&
        (!subject || u.fields.includes(subject)) &&
        (!q || u.name.toLowerCase().includes(q) || u.fields.some((f) => f.toLowerCase().includes(q))) &&
        (!budget || (COST_BY_BUDGET[budget] ?? []).includes(u.cost)),
    );
  }, [unis, country, level, subject, course, budget]);

  const catalogueLevel = level === "" || level === "UG" || level === "PG";
  const goesToEnquiry = tab === "Sch" || !catalogueLevel || (country !== "" && !CATALOGUE.has(country));

  function href(): string {
    if (tab === "Sch") return "/#scholarships";
    if (goesToEnquiry) {
      const p = new URLSearchParams();
      const d = DESTINATIONS.find((x) => x.key === country);
      if (d) p.set("dest", d.name);
      if (level) p.set("level", TABS.find((t) => t.id === tab)!.label);
      if (intake) p.set("intake", intake);
      return `/#enquire?${p.toString()}`;
    }
    const p = new URLSearchParams();
    if (country) p.set("country", country);
    if (level) p.set("level", level);
    if (subject) p.set("field", subject);
    if (course.trim()) p.set("q", course.trim());
    const s = p.toString();
    return `/study-abroad${s ? `?${s}` : ""}`;
  }

  return (
    <form
      className={`yg-search ${compact ? "yg-search-compact" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        window.location.assign(href());
      }}
      role="search"
      aria-label="Find a university or course"
    >
      {!compact && (
        <div className="yg-tabs" role="tablist" aria-label="What are you looking for?">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={tab === t.id ? "on" : ""}>
              {t.label}
            </button>
          ))}
        </div>
      )}
      <div className="yg-fields">
        <label className="yg-field">
          <span>Country</span>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">Any country</option>
            {DESTINATIONS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        {compact ? (
          <label className="yg-field">
            <span>Level</span>
            <select value={tab} onChange={(e) => setTab(e.target.value as typeof tab)}>
              <option value="all">Any level</option>
              <option value="UG">Undergraduate</option>
              <option value="PG">Postgraduate</option>
              <option value="PhD">Doctoral</option>
              <option value="Dip">Diploma</option>
            </select>
          </label>
        ) : (
          <label className="yg-field">
            <span>Subject</span>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">Any subject</option>
              {SUBJECTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        )}
        <label className="yg-field yg-field-wide">
          <span>Course or university</span>
          <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. Data Science, Oxford" maxLength={80} />
        </label>
        {!compact && (
          <>
            <label className="yg-field">
              <span>Budget</span>
              <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                {BUDGETS.map((b) => (
                  <option key={b.label} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="yg-field">
              <span>Intake</span>
              <select value={intake} onChange={(e) => setIntake(e.target.value)}>
                <option value="">Any intake</option>
                {INTAKES.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </label>
          </>
        )}
        <button type="submit" className="yg-btn yg-btn-primary yg-search-go">
          <Search size={18} aria-hidden /> {tab === "Sch" ? "See funding" : goesToEnquiry ? "Ask an expert" : "Search"}
        </button>
      </div>
      {!compact && (
        <div className="yg-results" aria-live="polite">
          {tab === "Sch" ? (
            <p>Scholarships depend on your destination, course and profile. We will show you what you are eligible for.</p>
          ) : goesToEnquiry ? (
            <p>This combination is handled by our counsellors. Continue and we will prefill the enquiry for you.</p>
          ) : (
            <>
              <p>
                <b>{matches.length}</b> {matches.length === 1 ? "university matches" : "universities match"} your filters.
              </p>
              {matches.length > 0 && (
                <ul>
                  {matches.slice(0, 5).map((u) => (
                    <li key={u.slug}>
                      <Link href={`/universities/${u.slug}`}>{u.name}</Link>
                    </li>
                  ))}
                  {matches.length > 5 && <li className="more">+{matches.length - 5} more</li>}
                </ul>
              )}
            </>
          )}
          <Link href={href()} className="yg-link">
            {tab === "Sch" ? "Jump to funding" : "View full results"} <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      )}
    </form>
  );
}
