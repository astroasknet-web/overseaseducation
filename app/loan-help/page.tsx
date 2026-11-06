import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@/lib/portal/guard";
import PageShell from "@/components/layout/PageShell";
import LoanEmiCalc from "@/components/abroad/LoanEmiCalc";
import * as LH from "@/lib/abroad/loan-help";
import { requestLoanHelpAction } from "./actions";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Education Loan Help for Studying Abroad | Yugty Overseas Education",
  description: "Short of funds? Our loan team prepares your education loan file, checks your documents and follows it up with the bank, so you can focus on your admission.",
  alternates: { canonical: `${SITE_URL}/loan-help` },
};
export const dynamic = "force-dynamic";

const STEPS = [
  ["Tell us what you need", "Two minutes: how much, where you are going, and who would be your co-applicant."],
  ["We call you and check the fit", "A loan counsellor looks at your profile and explains secured and unsecured options in plain words."],
  ["We prepare your file with you", "One checklist for every document. We check each one before it reaches the bank, so nothing comes back for a missing paper."],
  ["We submit and follow up", "We send your application and chase the bank for you, and keep you updated here until there is a decision."],
];
const WHY = [
  ["No running around", "One person to talk to, instead of bank branch after branch."],
  ["Documents done right", "Admission letter, KYC, income proof, marksheets and the cost estimate, checked before submission."],
  ["Clear numbers", "See your EMI before you commit, including the study-period moratorium."],
  ["Ready for your visa", "A sanction letter strengthens your proof of funds when you apply for your student visa."],
];

const field = "w-full min-h-[48px] rounded-lg border border-black/[0.15] bg-white px-3 text-[15px]";
const label = "block text-[13px] font-medium text-ink-2 mb-1";

export default async function LoanHelpPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const me = await currentUser().catch(() => null);
  const mine = me?.role === "student" ? await LH.latestFor(me.id).catch(() => null) : null;
  const open = mine && !["sanctioned", "closed"].includes(mine.status) ? mine : null;

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:px-6">
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0b1220] via-[#14214a] to-[#2f6bff] p-8 text-white sm:p-12">
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#8ff0ff]">Education loan help</p>
          <h1 className="mt-3 max-w-2xl text-[clamp(1.9rem,4.5vw,3rem)] font-bold leading-[1.08] !text-white">Short of funds? Let&apos;s get your loan sorted.</h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed !text-white/80">
            A degree abroad shouldn&apos;t stop at the fee. Tell us what you need and our loan team prepares your file, checks every document and follows it up with the bank, so you can focus on your admission.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#request" className="inline-flex min-h-[52px] items-center rounded-full bg-orange px-7 font-semibold text-white hover:bg-orange-dark">Get loan help</a>
            <a href="#emi" className="inline-flex min-h-[52px] items-center rounded-full border border-white/30 px-7 font-semibold text-white hover:bg-white/10">Check my EMI</a>
          </div>
          <p className="mt-5 text-[13px] !text-white/65">Yugty is not a lender. Approval, interest rate and amount are decided by the bank.</p>
        </section>

        <section className="mt-12" aria-labelledby="why-h">
          <h2 id="why-h" className="text-[26px] font-bold text-ink">Why students ask us to handle it</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">{WHY.map(([t, d]) => <li key={t} className="rounded-2xl border border-black/10 bg-white p-5 shadow-card"><h3 className="text-[16px] font-semibold text-ink">{t}</h3><p className="mt-1 text-[14px] leading-relaxed text-ink-3">{d}</p></li>)}</ul>
        </section>

        <section className="mt-12" aria-labelledby="how-h">
          <h2 id="how-h" className="text-[26px] font-bold text-ink">How it works</h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-4">{STEPS.map(([t, d], i) => <li key={t} className="rounded-2xl bg-cream-2 p-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-orange text-[14px] font-bold text-white">{i + 1}</span><h3 className="mt-3 text-[16px] font-semibold text-ink">{t}</h3><p className="mt-1 text-[14px] leading-relaxed text-ink-3">{d}</p></li>)}</ol>
        </section>

        <section id="emi" className="mt-12 scroll-mt-24"><LoanEmiCalc /></section>

        <section id="request" className="mt-12 scroll-mt-24" aria-labelledby="req-h">
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-card sm:p-8">
            <h2 id="req-h" className="text-[24px] font-bold text-ink">Ask for loan help</h2>
            <p className="mt-1 text-[14px] text-ink-3">We will call you to talk it through. There is no obligation to take a loan.</p>

            {sp.sent ? <p role="status" className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[15px] text-emerald-900">Thank you. We have your request and a loan counsellor will call you shortly.</p> : null}
            {sp.e ? <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-800">{sp.e}</p> : null}

            {!me ? (
              <div className="mt-6">
                <p className="text-[15px] text-ink-2">Sign in with your student account to send your request, so we can see your profile and keep you updated.</p>
                <p className="mt-4 flex flex-wrap gap-3">
                  <Link href="/login?next=%2Floan-help%23request" className="inline-flex min-h-[48px] items-center rounded-lg bg-orange px-6 font-semibold text-white hover:bg-orange-dark">Sign in</Link>
                  <Link href="/signup" className="inline-flex min-h-[48px] items-center rounded-lg border border-black/[0.15] px-6 font-semibold text-ink hover:bg-cream-2">Create a free account</Link>
                </p>
              </div>
            ) : me.role !== "student" ? (
              <p className="mt-6 text-[15px] text-ink-3">Loan help requests are made from a student account.</p>
            ) : open ? (
              <div className="mt-6 rounded-2xl bg-cream-2 p-5">
                <p className="text-[13px] font-bold uppercase tracking-wide text-ink-4">Your request</p>
                <p className="mt-1 text-[18px] font-semibold text-ink">{LH.STATUS[open.status] ?? open.status}</p>
                <p className="mt-1 text-[14px] text-ink-3">₹{open.amount_inr.toLocaleString("en-IN")}{open.university ? ` · ${open.university}` : ""}{open.country ? ` · ${open.country}` : ""}</p>
                {open.staff_note ? <p className="mt-2 text-[14px] text-ink-2">Note from our team: {open.staff_note}</p> : null}
              </div>
            ) : (
              <form action={requestLoanHelpAction} className="mt-6 grid gap-4 sm:grid-cols-2">
                <div><label className={label} htmlFor="amount_inr">Loan amount you need (₹)</label><input id="amount_inr" name="amount_inr" inputMode="numeric" required placeholder="e.g. 2000000" className={field} /></div>
                <div><label className={label} htmlFor="phone">Phone number to call</label><input id="phone" name="phone" type="tel" required inputMode="tel" autoComplete="tel" placeholder="+91 98765 43210" className={field} /></div>
                <div><label className={label} htmlFor="country">Country</label>
                  <select id="country" name="country" className={field} defaultValue=""><option value="">Not decided</option>{["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "UAE", "Other"].map((c) => <option key={c}>{c}</option>)}</select></div>
                <div><label className={label} htmlFor="university">University (if you know)</label><input id="university" name="university" maxLength={120} className={field} /></div>
                <div><label className={label} htmlFor="intake">Intake</label>
                  <select id="intake" name="intake" className={field} defaultValue=""><option value="">Not sure</option>{["Fall 2027", "Spring 2028", "Fall 2028", "Spring 2029"].map((c) => <option key={c}>{c}</option>)}</select></div>
                <div><label className={label} htmlFor="coapplicant">Who would be your co-applicant?</label>
                  <select id="coapplicant" name="coapplicant" required className={field} defaultValue="">{[["", "Choose"], ...Object.entries(LH.COAPPLICANT)].map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                <div className="sm:col-span-2"><label className={label} htmlFor="collateral">Can you offer collateral (property or a fixed deposit)?</label>
                  <select id="collateral" name="collateral" required className={field} defaultValue="">{[["", "Choose"], ...Object.entries(LH.COLLATERAL)].map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                <div className="sm:col-span-2"><label className={label} htmlFor="note">Anything we should know? (optional)</label><textarea id="note" name="note" rows={3} maxLength={500} className={`${field} py-2`} /></div>
                <div className="sm:col-span-2"><button type="submit" className="min-h-[52px] rounded-lg bg-orange px-8 text-[16px] font-semibold text-white hover:bg-orange-dark">Request loan help</button>
                  <p className="mt-3 text-[12px] text-ink-4">We use these details only to help with your loan and share them only with the lenders you agree to apply to.</p></div>
              </form>
            )}
            <p className="mt-6 text-[14px] text-ink-3">Already speaking to a bank yourself? Keep track of your offers in the <Link className="underline" href="/abroad/loans">loan tracker</Link>.</p>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
