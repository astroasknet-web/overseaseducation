import { EXAM_PREP } from "@/lib/pay/exam-fees";

/**
 * Which paid exam-preparation product a page belongs to. The free pages (the exam overview, the list of chapters) stay public; the notes, chapter tests and
 * mock tests behind them open only for a buyer of that exam (sku `course-exam-<key>`, see lib/pay/exam-fees.ts).
 */
export type ExamKey = (typeof EXAM_PREP)[number]["key"];

export const examProduct = (key: string) => EXAM_PREP.find((e) => e.key === key) ?? null;
export const examByHub = (hub: string) => EXAM_PREP.find((e) => e.hub === hub) ?? null;

export const examForIelts = (): ExamKey => "ielts";
