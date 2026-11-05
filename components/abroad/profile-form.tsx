"use client";

import { useActionState, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { saveProfileAction, type ProfileState } from "@/app/abroad/actions";
import { Alert } from "@/components/portal/ui";

const input = "w-full px-4 py-3 rounded-lg border text-[16px] sm:text-[15px] text-ink bg-white outline-none focus:ring-2 focus:ring-orange/25 focus:border-orange/60 min-h-[44px]";
const ring = (e?: string) => (e ? "border-red-400" : "border-black/[0.12]");

function Submit() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="min-h-[52px] px-8 rounded-lg bg-orange hover:bg-orange-dark disabled:opacity-60 text-white font-semibold text-[16px]">{pending ? "Saving..." : "Save and see my matches"}</button>;
}

function Row({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="block text-[14px] font-medium text-ink-2 mb-2">{label} {hint ? <span className="text-ink-4 font-normal">{hint}</span> : null}</label>
      {children}
      {error ? <p id={`${id}-err`} className="mt-1.5 text-[13px] text-red-700">{error}</p> : null}
    </div>
  );
}

export interface Initial { level: string; field: string; score_type: string; score_value: string; english_test: string; english_score: string; gre: string; budget_inr: string; countries: string[]; intake: string; goal: string }

export function ProfileForm({ initial, fields, countries, budgets, intakes, hasConsent }: { initial: Initial; fields: string[]; countries: Array<{ key: string; name: string }>; budgets: Record<string, string>; intakes: string[]; hasConsent: boolean }) {
  const [s, action] = useActionState(saveProfileAction, {} as ProfileState);
  const v = (s.values as unknown as Initial | undefined) ?? initial;
  const e = s.errors ?? {};
  const key = useMemo(() => Math.random(), [s]); // eslint-disable-line react-hooks/exhaustive-deps -- remount so selects start from the values just sent
  return (
    <form action={action} noValidate className="bg-white rounded-2xl border border-black/[0.08] shadow-card p-5 sm:p-7">
      {s.error ? <Alert>{s.error}</Alert> : null}
      <div key={key}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Row id="level" label="Level you want to study" error={e.level}><select id="level" name="level" defaultValue={v.level} className={`${input} ${ring(e.level)}`}><option value="PG">Postgraduate (Master&apos;s)</option><option value="UG">Undergraduate (Bachelor&apos;s)</option></select></Row>
          <Row id="field" label="Field of study" error={e.field}><select id="field" name="field" defaultValue={v.field} aria-describedby="field-err" className={`${input} ${ring(e.field)}`}><option value="">Choose</option>{fields.map((f) => <option key={f}>{f}</option>)}</select></Row>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Row id="score_type" label="How you report your score" error={e.score_type}><select id="score_type" name="score_type" defaultValue={v.score_type} className={`${input} ${ring(e.score_type)}`}><option value="percentage">Percentage</option><option value="cgpa10">CGPA out of 10</option><option value="gpa4">GPA out of 4</option></select></Row>
          <Row id="score_value" label="Your score" error={e.score_value}><input id="score_value" name="score_value" type="number" step="0.01" inputMode="decimal" defaultValue={v.score_value} aria-describedby="score_value-err" className={`${input} ${ring(e.score_value)}`} /></Row>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Row id="english_test" label="English test" error={e.english_test}><select id="english_test" name="english_test" defaultValue={v.english_test} className={`${input} ${ring(e.english_test)}`}><option value="none">Not taken yet</option><option>IELTS</option><option>TOEFL</option><option>PTE</option></select></Row>
          <Row id="english_score" label="English score" hint="(if taken)" error={e.english_score}><input id="english_score" name="english_score" type="number" step="0.5" inputMode="decimal" defaultValue={v.english_score} aria-describedby="english_score-err" className={`${input} ${ring(e.english_score)}`} /></Row>
        </div>
        <Row id="gre" label="GRE total" hint="(optional, 260 to 340)" error={e.gre}><input id="gre" name="gre" inputMode="numeric" defaultValue={v.gre} aria-describedby="gre-err" className={`${input} ${ring(e.gre)}`} /></Row>
        <Row id="budget_inr" label="Yearly budget (tuition + living)" error={e.budget_inr}><select id="budget_inr" name="budget_inr" defaultValue={v.budget_inr} className={`${input} ${ring(e.budget_inr)}`}>{Object.entries(budgets).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Row>
        <fieldset className="mb-5"><legend className="block text-[14px] font-medium text-ink-2 mb-2">Countries you are open to</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-1">{countries.map((c) => <label key={c.key} className="flex items-center gap-2 min-h-[44px] text-[15px]"><input type="checkbox" name="countries" value={c.key} defaultChecked={v.countries.includes(c.key)} />{c.name}</label>)}</div>
          {e.countries ? <p className="mt-1.5 text-[13px] text-red-700">{e.countries}</p> : null}
        </fieldset>
        <Row id="intake" label="Intake" error={e.intake}><select id="intake" name="intake" defaultValue={v.intake} className={`${input} ${ring(e.intake)}`}>{intakes.map((i) => <option key={i}>{i}</option>)}</select></Row>
        <Row id="goal" label="Your goal in a sentence or two" hint="(optional)"><textarea id="goal" name="goal" rows={3} maxLength={500} defaultValue={v.goal} className={`${input} border-black/[0.12]`} /></Row>
        {!hasConsent ? (
          <div className="mb-5">
            <label className="flex items-start gap-2.5 text-[14px] text-ink-2 min-h-[44px]"><input type="checkbox" name="consent" value="1" className="mt-1" />I agree that GrowQR may use these details to match me with universities and that a counselor may view my documents. I can export or erase my data at any time.</label>
            {e.consent ? <p className="mt-1.5 text-[13px] text-red-700">{e.consent}</p> : null}
          </div>
        ) : null}
      </div>
      {Object.keys(e).length ? <p role="alert" className="mb-4 text-[14px] text-red-700">Please fix the highlighted fields.</p> : null}
      <Submit />
    </form>
  );
}
