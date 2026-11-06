/**
 * The one exam-preparation pack this site sells: IELTS preparation (sku `course-exam-ielts`). The lessons, strategies and Writing and
 * Speaking practice tests open for a buyer; the free pages stay public. `onSale: false` would show it as "coming soon".
 */
export const EXAM_PREP: Array<{ key: string; slug: string; title: string; rupees: number; onSale: boolean; hub: string; blurb: string }> = [
  { key: "ielts", slug: "exam-ielts", title: "IELTS preparation", rupees: 1299, onSale: true, hub: "ielts", blurb: "Reading and Writing lessons and strategies, plus Writing and Speaking practice tests. (The full Reading and Listening test sets are a separate product.)" },
];
