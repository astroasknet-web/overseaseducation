import fs from "node:fs";
import path from "node:path";

/**
 * IELTS course imported from Vidaara (content/lms/ielts/): 17 Reading and Writing lessons, 30 Writing practice tests and
 * 30 Speaking practice tests. Reading and Listening practice tests are already part of GrowQR (/practice-tests).
 * Built by scripts/import-vidaara-ielts.mjs. No database; the Writing band estimate runs in the browser.
 */
export interface Section { slug: string; label: string; color: string; icon: string; tagline: string }
export interface LessonRef { number: number; slug: string; title: string; type: string; topics: string[] }
export interface Module { number: number; section: string; title: string; icon: string; summary: string; lessons: LessonRef[] }
export interface Course { sections: Record<string, Section>; modules: Module[] }

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Block { type: string; html?: string; title?: string; variant?: string; items?: string[]; prompt?: string; answer?: string; explain?: string; band?: string; annotations?: string[]; questions?: any[]; task?: string; minWords?: number | string }
export interface Lesson { slug: string; section: string; title: string; est_time?: string; summary: string; objectives?: string[]; blocks: Block[]; faqs?: { q: string; a: string }[]; next?: string; seo?: { title?: string; description?: string } }

export interface TestRef { id: number; slug: string; title: string; level: string; topics: string[] }
export interface WritingTest { id: number; slug: string; title: string; level: string; topics: string[]; task1: { format: string; minWords: number; minutes: number; prompt: string; visual?: any }; task2: { type: string; minWords: number; minutes: number; prompt: string }; bandCriteria: any; traps: { title: string; detail: string }[] }
export interface SpeakingTest { id: number; slug: string; title: string; level: string; topics: string[]; part1: { topic: string; questions: string[] }[]; part2: { title: string; bullets: string[]; explain: string; followups: string[] }; part3: { q: string; followups: string[] }[]; bandGuide: Record<string, string[]>; band9?: any; mistakes: { title: string; detail: string }[] }

const ROOT = path.join(process.cwd(), "content", "lms", "ielts");
const cache = new Map<string, unknown>();
const safe = (s: string) => /^[a-z0-9-]+$/.test(s);

function read<T>(...parts: string[]): T | null {
  if (!parts.every((p) => safe(p))) return null;
  const file = path.join(ROOT, ...parts.slice(0, -1), `${parts[parts.length - 1]}.json`);
  if (cache.has(file)) return cache.get(file) as T;
  try {
    const j = JSON.parse(fs.readFileSync(file, "utf8")) as T;
    cache.set(file, j);
    return j;
  } catch {
    return null;
  }
}

export const course = (): Course => read<Course>("course") ?? { sections: {}, modules: [] };
export const lesson = (slug: string): Lesson | null => read<Lesson>("lessons", slug);
export const writingTests = (): TestRef[] => read<TestRef[]>("writing", "index") ?? [];
export const writingTest = (slug: string): WritingTest | null => read<WritingTest>("writing", slug);
export const speakingTests = (): TestRef[] => read<TestRef[]>("speaking", "index") ?? [];
export const speakingTest = (slug: string): SpeakingTest | null => read<SpeakingTest>("speaking", slug);

export const allLessons = (): (LessonRef & { section: string; moduleTitle: string })[] => course().modules.flatMap((m) => m.lessons.map((l) => ({ ...l, section: m.section, moduleTitle: m.title })));
export function neighbours(slug: string): { prev: LessonRef | null; next: LessonRef | null } {
  const cur = allLessons().find((l) => l.slug === slug);
  if (!cur) return { prev: null, next: null };
  const list = allLessons().filter((l) => l.section === cur.section);
  const i = list.findIndex((l) => l.slug === slug);
  return { prev: i > 0 ? list[i - 1] : null, next: i < list.length - 1 ? list[i + 1] : null };
}
