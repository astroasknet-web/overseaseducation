"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { evaluate } from "@/lib/lms/ielts-feedback";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Result { band: number; criteria: { ta: number; cc: number; lr: number; gra: number }; wordCount: number; strengths: string[]; improvements: string[]; note: string }
const CRIT: [keyof Result["criteria"], string][] = [["ta", "Task achievement / response"], ["cc", "Coherence and cohesion"], ["lr", "Lexical resource"], ["gra", "Grammar range and accuracy"]];
const words = (s: string) => (s.trim().match(/[A-Za-z0-9'’-]+/g) ?? []).length;
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function ResultCard({ title, r }: { title: string; r: Result }) {
  return (
    <div className="rounded-xl border border-black/[0.1] bg-white p-4">
      <h3 className="text-[16px] font-bold text-ink">{title}: {r.band ? `Band ${r.band.toFixed(1)}` : "not attempted"}{r.wordCount ? ` · ${r.wordCount} words` : ""}</h3>
      {r.band ? (
        <>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-[13.5px] sm:grid-cols-4">{CRIT.map(([k, l]) => <div key={k} className="rounded-lg bg-cream-2 p-2"><dt className="text-ink-4">{l}</dt><dd className="text-[16px] font-bold text-ink">{r.criteria[k].toFixed(1)}</dd></div>)}</dl>
          {r.strengths.length ? <><h4 className="mt-3 text-[14px] font-bold text-emerald-800">Working</h4><ul className="list-disc pl-5 text-[14px] text-ink-2">{r.strengths.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}</ul></> : null}
          {r.improvements.length ? <><h4 className="mt-3 text-[14px] font-bold text-orange-deep">Push it up</h4><ul className="list-disc pl-5 text-[14px] text-ink-2">{r.improvements.slice(0, 4).map((s, i) => <li key={i}>{s}</li>)}</ul></> : null}
        </>
      ) : null}
    </div>
  );
}

/** One response box with a word count and an estimated band. Used inside lessons. Nothing is sent anywhere. */
export function WritingClinic({ task: initial, minWords }: { task: "task1" | "task2"; minWords?: number }) {
  const [task, setTask] = useState<"task1" | "task2">(initial);
  const [text, setText] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const min = task === "task1" ? 150 : 250;
  const w = words(text);
  return (
    <div className="mt-3 rounded-2xl border border-black/[0.1] bg-cream-2 p-4">
      <div role="radiogroup" aria-label="Task type" className="flex gap-2">
        {(["task1", "task2"] as const).map((t) => <button key={t} type="button" role="radio" aria-checked={task === t} onClick={() => { setTask(t); setRes(null); }} className={`min-h-[40px] rounded-full px-4 text-[13.5px] font-semibold ${task === t ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-black/10"}`}>{t === "task1" ? "Task 1 (150+ words)" : "Task 2 (250+ words)"}</button>)}
      </div>
      <label htmlFor="clinic-text" className="mt-3 block text-[14px] font-semibold text-ink">Your response</label>
      <textarea id="clinic-text" value={text} onChange={(e) => { setText(e.target.value); setRes(null); }} rows={12} className="mt-1 w-full rounded-lg border border-black/[0.15] bg-white p-3 text-[15px] leading-relaxed" placeholder="Write or paste your answer here. Your text stays in this browser." />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <span className={`text-[13.5px] font-semibold ${w >= (minWords && task === "task2" ? minWords : min) ? "text-emerald-800" : "text-ink-3"}`}>{w} words (minimum {min})</span>
        <button type="button" onClick={() => setRes(evaluate({ task, text }) as Result)} className="min-h-[44px] rounded-lg bg-orange-deep px-5 text-[14.5px] font-semibold text-white hover:bg-ink">Estimate my band</button>
      </div>
      {res ? <div className="mt-3"><ResultCard title={task === "task1" ? "Task 1" : "Task 2"} r={res} /><p className="mt-2 text-[12.5px] text-ink-4">{res.note}</p></div> : null}
    </div>
  );
}

interface TestProps { id: string; task1: { minWords: number; minutes: number; prompt: string }; task2: { minWords: number; minutes: number; prompt: string }; visualHtml: string; guide: React.ReactNode }

/** A 60-minute Writing test: Task 1 and Task 2 boxes, a countdown and an estimated band for each task and overall. */
export function WritingTestRunner({ task1, task2, visualHtml, guide }: TestProps) {
  const [tab, setTab] = useState<"t1" | "t2">("t1");
  const [t1, setT1] = useState("");
  const [t2, setT2] = useState("");
  const [left, setLeft] = useState(60 * 60);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState<{ r1: Result; r2: Result; overall: number } | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const submit = useMemo(() => () => {
    if (timer.current) clearInterval(timer.current);
    const r1 = evaluate({ task: "task1", text: t1 }) as Result;
    const r2 = evaluate({ task: "task2", text: t2 }) as Result;
    const both = r1.band > 0 && r2.band > 0;
    setDone({ r1, r2, overall: both ? Math.round(((r1.band + 2 * r2.band) / 3) * 2) / 2 : r1.band || r2.band || 0 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [t1, t2]);

  useEffect(() => {
    if (!started || done) return;
    timer.current = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [started, done]);
  useEffect(() => { if (started && !done && left === 0) submit(); }, [left, started, done, submit]);

  const w1 = words(t1), w2 = words(t2);
  const ta = "mt-2 w-full rounded-lg border border-black/[0.15] bg-white p-3 text-[15px] leading-relaxed disabled:bg-cream-2";
  return (
    <div>
      <div className="sticky top-[76px] z-10 mb-4 flex items-center justify-between rounded-xl border border-black/[0.08] bg-white/95 px-4 py-3 shadow-card backdrop-blur">
        {!started ? <button type="button" onClick={() => setStarted(true)} className="min-h-[44px] rounded-lg bg-orange-deep px-5 text-[14.5px] font-semibold text-white hover:bg-ink">Start the 60-minute timer</button> : <span className={`font-mono text-[17px] font-bold ${left < 300 ? "text-red-600" : "text-ink"}`} role="timer" aria-label="Time left">{fmt(left)}</span>}
        <span className="text-[13px] text-ink-3">Task 1: {w1} · Task 2: {w2} words</span>
        {started && !done ? <button type="button" onClick={submit} className="min-h-[44px] rounded-lg border border-black/[0.2] px-4 text-[14px] font-semibold hover:bg-cream-2">Submit</button> : null}
      </div>

      {done ? (
        <div className="mb-6 space-y-3">
          <p className="text-[20px] font-bold text-ink">Estimated overall Writing band: {done.overall ? done.overall.toFixed(1) : "not attempted"}</p>
          <ResultCard title="Task 1" r={done.r1} />
          <ResultCard title="Task 2" r={done.r2} />
          <p className="text-[12.5px] text-ink-4">{done.r2.note} Task 2 counts twice as much as Task 1 in the overall band.</p>
        </div>
      ) : null}

      <div role="tablist" aria-label="Writing tasks" className="mb-3 flex gap-2">
        {([["t1", "Task 1"], ["t2", "Task 2"]] as const).map(([k, l]) => <button key={k} role="tab" type="button" aria-selected={tab === k} onClick={() => setTab(k)} className={`min-h-[44px] rounded-full px-5 text-[14.5px] font-semibold ${tab === k ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-black/10"}`}>{l}</button>)}
      </div>
      <section hidden={tab !== "t1"} aria-label="Task 1">
        <div className="rounded-xl border border-black/[0.08] bg-white p-4"><p className="text-[12.5px] font-bold uppercase tracking-wider text-ink-4">Task 1 · about {task1.minutes} minutes · at least {task1.minWords} words</p><div className="mt-2 text-[15px] text-ink-2" dangerouslySetInnerHTML={{ __html: task1.prompt }} />{visualHtml ? <div className="iwv mt-3" dangerouslySetInnerHTML={{ __html: visualHtml }} /> : null}</div>
        <label htmlFor="w-t1" className="mt-3 block text-[14px] font-semibold text-ink">Your Task 1 answer</label>
        <textarea id="w-t1" rows={14} disabled={!!done} value={t1} onChange={(e) => setT1(e.target.value)} className={ta} />
      </section>
      <section hidden={tab !== "t2"} aria-label="Task 2">
        <div className="rounded-xl border border-black/[0.08] bg-white p-4"><p className="text-[12.5px] font-bold uppercase tracking-wider text-ink-4">Task 2 · about {task2.minutes} minutes · at least {task2.minWords} words</p><div className="mt-2 text-[15px] text-ink-2" dangerouslySetInnerHTML={{ __html: task2.prompt }} /></div>
        <label htmlFor="w-t2" className="mt-3 block text-[14px] font-semibold text-ink">Your Task 2 answer</label>
        <textarea id="w-t2" rows={16} disabled={!!done} value={t2} onChange={(e) => setT2(e.target.value)} className={ta} />
      </section>
      {done ? <div className="mt-8">{guide}</div> : null}
    </div>
  );
}
