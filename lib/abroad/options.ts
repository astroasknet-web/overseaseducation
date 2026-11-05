/** Choices offered on the study-abroad profile form. */
export const BUDGETS: Record<number, string> = {
  1000000: "Up to Rs 10 lakh", 1500000: "Up to Rs 15 lakh", 2000000: "Up to Rs 20 lakh", 3000000: "Up to Rs 30 lakh", 4000000: "Up to Rs 40 lakh",
  5000000: "Up to Rs 50 lakh", 7500000: "Up to Rs 75 lakh", 10000000: "Rs 1 crore or more",
};

/** The next intakes a student can aim for: from September on, the main intake is next year's. */
export function intakes(now = new Date()): string[] {
  const yr = now.getUTCFullYear();
  const start = now.getUTCMonth() + 1 >= 9 ? yr + 1 : yr;
  return [`Fall ${start}`, `Spring ${start + 1}`, `Fall ${start + 1}`, `Spring ${start + 2}`, "Not sure yet"];
}

export const SA_DISCLAIMER = "Costs, selectivity bands and requirements on this page are indicative editorial estimates, not official figures or admission predictions. Always confirm fees, deadlines and entry requirements on the university's own website.";

export const bandLabel = (band: number): string => ({ 1: "Open admission", 2: "Moderately selective", 3: "Selective", 4: "Very selective", 5: "Highly selective" } as Record<number, string>)[band] ?? "Selective";
