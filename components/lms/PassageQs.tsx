"use client";

import { useState } from "react";

export interface PQ { q: string; options?: string[]; answer: string; explain?: string }

/** Reading practice questions after a passage: pick an option (or reveal the answer) and read the explanation. */
export default function PassageQs({ items }: { items: PQ[] }) {
  const [picked, setPicked] = useState<Record<number, string>>({});
  const [shown, setShown] = useState<Record<number, boolean>>({});
  return (
    <ol className="mt-4 space-y-5">
      {items.map((it, i) => {
        const sel = picked[i];
        const open = !!shown[i] || sel !== undefined;
        return (
          <li key={i} className="rounded-xl border border-black/[0.1] bg-white p-3.5">
            <div className="text-[15px] text-ink"><b className="mr-1.5 text-ink-4">{i + 1}.</b><span dangerouslySetInnerHTML={{ __html: it.q }} /></div>
            {it.options ? (
              <div role="radiogroup" aria-label={`Question ${i + 1}`} className="mt-2 grid gap-2">
                {it.options.map((o) => {
                  const letter = o.trim().charAt(0).toUpperCase();
                  const right = open && letter === it.answer.trim().toUpperCase();
                  const wrong = sel === letter && letter !== it.answer.trim().toUpperCase();
                  return <button key={o} type="button" role="radio" aria-checked={sel === letter} disabled={sel !== undefined} onClick={() => setPicked((p) => ({ ...p, [i]: letter }))} className={`min-h-[44px] rounded-lg border px-3 py-2 text-left text-[14px] ${right ? "border-emerald-600 bg-emerald-50" : wrong ? "border-red-500 bg-red-50" : "border-black/[0.12] hover:border-orange"} disabled:cursor-default`}>{o}</button>;
                })}
              </div>
            ) : !open ? <button type="button" onClick={() => setShown((s) => ({ ...s, [i]: true }))} className="mt-2 min-h-[40px] rounded-lg bg-ink px-3.5 text-[13.5px] font-semibold text-white hover:bg-orange-deep">Show the answer</button> : null}
            {open ? <div className="mt-2 rounded-lg bg-cream-2 px-3 py-2 text-[14px] text-ink-2"><b>Answer: {it.answer}.</b>{it.explain ? <span className="mt-1 block" dangerouslySetInnerHTML={{ __html: it.explain }} /> : null}</div> : null}
          </li>
        );
      })}
    </ol>
  );
}
