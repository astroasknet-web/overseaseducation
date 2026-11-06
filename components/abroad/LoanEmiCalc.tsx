"use client";
import { useMemo, useState } from "react";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** A quick EMI estimate: interest during the moratorium is added to the balance, then a standard reducing-balance EMI. Indicative only. */
export default function LoanEmiCalc() {
  const [lakh, setLakh] = useState(20);
  const [rate, setRate] = useState(9.5);
  const [years, setYears] = useState(10);
  const [mor, setMor] = useState(18);
  const r = useMemo(() => {
    const p = lakh * 100000;
    const bal = p * (1 + (rate / 1200) * mor);
    const i = rate / 1200;
    const n = years * 12;
    const emi = i === 0 ? bal / n : (bal * i) / (1 - Math.pow(1 + i, -n));
    return { bal, emi, total: emi * n };
  }, [lakh, rate, years, mor]);

  const field = "w-full min-h-[44px] rounded-lg border border-black/[0.15] bg-white px-3 text-[15px]";
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-card">
      <h3 className="text-[18px] font-bold text-ink">See your monthly EMI</h3>
      <p className="mt-1 text-[14px] text-ink-3">Move the numbers to see what a loan could cost each month. Your bank&apos;s figures will differ.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-[13px] font-medium text-ink-2">Loan amount: <b>{lakh} lakh</b>
          <input type="range" min={2} max={80} step={1} value={lakh} onChange={(e) => setLakh(Number(e.target.value))} className="mt-2 w-full accent-orange" />
        </label>
        <label className="text-[13px] font-medium text-ink-2">Interest rate (per year)
          <input type="number" min={6} max={16} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} className={`${field} mt-1`} />
        </label>
        <label className="text-[13px] font-medium text-ink-2">Repayment: <b>{years} years</b>
          <input type="range" min={3} max={15} step={1} value={years} onChange={(e) => setYears(Number(e.target.value))} className="mt-2 w-full accent-orange" />
        </label>
        <label className="text-[13px] font-medium text-ink-2">Moratorium: <b>{mor} months</b> (study period, before EMIs start)
          <input type="range" min={0} max={48} step={6} value={mor} onChange={(e) => setMor(Number(e.target.value))} className="mt-2 w-full accent-orange" />
        </label>
      </div>
      <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-orange-lighter p-3"><dt className="text-[12px] text-ink-3">Monthly EMI</dt><dd className="text-[20px] font-bold text-orange-deep">{inr(r.emi)}</dd></div>
        <div className="rounded-2xl bg-cream-2 p-3"><dt className="text-[12px] text-ink-3">When EMIs start</dt><dd className="text-[17px] font-bold text-ink">{inr(r.bal)}</dd></div>
        <div className="rounded-2xl bg-cream-2 p-3"><dt className="text-[12px] text-ink-3">Total payable</dt><dd className="text-[17px] font-bold text-ink">{inr(r.total)}</dd></div>
      </dl>
    </div>
  );
}
