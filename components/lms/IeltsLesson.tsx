/* eslint-disable @typescript-eslint/no-explicit-any */
import PassageQs from "@/components/lms/PassageQs";
import { WritingClinic } from "@/components/lms/IeltsWriting";
import { cleanHtml } from "@/lib/market/lessons";
import type { Block } from "@/lib/lms/ielts";

const PROSE = "text-[15.5px] leading-relaxed text-ink-2 [&_li]:mt-1 [&_p]:mt-3 [&_p:first-child]:mt-0 [&_strong]:text-ink [&_table]:my-3 [&_table]:w-full [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:bg-cream-2 [&_th]:p-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5";
const H = (html?: string) => ({ __html: cleanHtml(html ?? "") });
const CALL: Record<string, string> = { info: "border-sky-500 bg-sky-50", warn: "border-amber-500 bg-amber-50", warning: "border-amber-500 bg-amber-50", tip: "border-emerald-600 bg-emerald-50", danger: "border-red-500 bg-red-50" };

export default function IeltsLesson({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "prose":
            return <div key={i} className={PROSE} dangerouslySetInnerHTML={H(b.html)} />;
          case "callout":
            return <aside key={i} className={`rounded-xl border-l-4 px-4 py-3 ${CALL[b.variant ?? "info"] ?? CALL.info}`}>{b.title ? <h3 className="text-[15px] font-bold text-ink">{b.title}</h3> : null}<div className={`${PROSE} ${b.title ? "mt-1" : ""}`} dangerouslySetInnerHTML={H(b.html)} /></aside>;
          case "table":
          case "band-table":
            return <div key={i} className={`${PROSE} overflow-x-auto`} dangerouslySetInnerHTML={H(b.html)} />;
          case "steps":
            return <section key={i} className="rounded-xl border border-black/[0.08] bg-white p-4">{b.title ? <h3 className="text-[16px] font-bold text-ink">{b.title}</h3> : null}<ol className="mt-2 list-decimal space-y-2 pl-5 text-[15px] text-ink-2">{(b.items ?? []).map((s, k) => <li key={k} dangerouslySetInnerHTML={H(s)} />)}</ol></section>;
          case "example":
            return <section key={i} className="rounded-xl border border-black/[0.1] bg-cream-2 p-4">{b.title ? <h3 className="text-[15px] font-bold text-ink">Example: {b.title}</h3> : null}<div className={`${PROSE} mt-2`} dangerouslySetInnerHTML={H(b.prompt)} /><details className="mt-3 rounded-lg border border-black/[0.1] bg-white p-3"><summary className="cursor-pointer text-[14.5px] font-semibold text-ink">Show the answer and explanation</summary><div className={`${PROSE} mt-2`} dangerouslySetInnerHTML={H(b.answer)} /><div className={`${PROSE} mt-2`} dangerouslySetInnerHTML={H(b.explain)} /></details></section>;
          case "passage":
            return <section key={i} className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-card">{b.title ? <h3 className="text-[18px] font-bold text-ink">{b.title}</h3> : null}<div className={`${PROSE} mt-3`} dangerouslySetInnerHTML={H(b.html)} /><h4 className="mt-5 text-[15px] font-bold text-ink">Questions</h4><PassageQs items={(b.questions ?? []).map((q: any) => ({ q: cleanHtml(q.q ?? ""), options: q.options, answer: String(q.answer ?? ""), explain: q.explain ? cleanHtml(q.explain) : undefined }))} /></section>;
          case "model":
            return <section key={i} className="rounded-2xl border border-emerald-600/40 bg-emerald-50/50 p-5"><h3 className="text-[17px] font-bold text-ink">{b.title}{b.band ? ` (Band ${b.band})` : ""}</h3><div className={`${PROSE} mt-2`} dangerouslySetInnerHTML={H(b.html)} />{b.annotations?.length ? <details className="mt-3 rounded-lg border border-black/[0.1] bg-white p-3"><summary className="cursor-pointer text-[14.5px] font-semibold text-ink">Why this scores well</summary><ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14.5px] text-ink-2">{b.annotations.map((a, k) => <li key={k} dangerouslySetInnerHTML={H(a)} />)}</ul></details> : null}</section>;
          case "writing-practice":
            return <section key={i} className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-card"><h3 className="text-[17px] font-bold text-ink">{b.title}</h3><div className={`${PROSE} mt-2`} dangerouslySetInnerHTML={H(b.prompt)} /><WritingClinic task={b.task === "task1" ? "task1" : "task2"} minWords={Number(b.minWords) || undefined} /></section>;
          default:
            return b.html ? <div key={i} className={PROSE} dangerouslySetInnerHTML={H(b.html)} /> : null;
        }
      })}
    </div>
  );
}
