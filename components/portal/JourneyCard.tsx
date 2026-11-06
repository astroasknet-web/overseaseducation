import Link from "next/link";
import { Card } from "@/components/portal/shell";
import { caseOfUser } from "@/lib/journey/store";
import { viewCase } from "@/lib/journey/service";

/** The student's study abroad journey at a glance, at the top of the account page. */
export default async function JourneyCard({ userId }: { userId: number }) {
  const jc = await caseOfUser(userId).catch(() => null);
  const jv = jc ? await viewCase(jc.id).catch(() => null) : null;
  const btn = "inline-flex items-center min-h-[48px] px-5 rounded-lg bg-orange hover:bg-orange-dark text-white font-semibold text-[15px]";
  if (!jv) {
    return (
      <Card title="Your study abroad journey">
        <p className="text-[15px] text-ink-3 mb-4">Build your profile to see your Safe, Target and Reach universities, then follow a 12-stage checklist from shortlist to arrival.</p>
        <Link href="/abroad" className={btn}>Start your journey</Link>
      </Card>
    );
  }
  const next = jv.next[0];
  return (
    <Card title="Your study abroad journey">
      <p className="text-[15px] text-ink-2 mb-2"><b>{jv.progress.pct}% complete</b> &middot; {jv.progress.done} of {jv.progress.total} steps done</p>
      <div className="h-2 rounded-full bg-cream-3 overflow-hidden mb-4" role="img" aria-label={`${jv.progress.pct}% of the journey complete`}><span className="block h-full bg-orange rounded-full" style={{ width: `${jv.progress.pct}%` }} /></div>
      {next ? <p className="text-[14px] text-ink-3 mb-4">Next step: <b className="text-ink">{next.task.title}</b></p> : <p className="text-[14px] text-ink-3 mb-4">Every step you can do yourself is done.</p>}
      <div className="flex flex-wrap gap-3">
        <Link href="/abroad" className={btn}>Open my journey</Link>
        <Link href="/abroad/matches" className="inline-flex items-center min-h-[48px] px-5 rounded-lg border border-black/[0.15] hover:bg-cream-2 text-ink font-semibold text-[15px]">My university matches</Link>
      </div>
    </Card>
  );
}
