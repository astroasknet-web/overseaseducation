// Fees for services sold one at a time and for Resume Studio Pro.
/**
 * Services delivered by Yugty staff, sold one at a time (sku `service-<key>`, kind `consulting`, so a purchase alerts staff, see lib/pay/fulfil.ts).
 * Silver and Gold include some of them (lib/market/plan-services.ts); the fee here is what one costs on its own.
 */
export const SERVICE_PRODUCTS: Array<{ key: string; title: string; description: string; rupees: number }> = [
  { key: "career-counselling", title: "Career counselling session (30 minutes, online)", description: "A 1:1 online session with an expert on your career direction, course and skill choices, or to clear academic doubts.", rupees: 799 },
  { key: "overseas-counselling", title: "Overseas education counselling (1:1 session)", description: "A 1:1 session on country and university choice, admission requirements, budget and scholarships, and your application plan.", rupees: 1499 },
  { key: "resume-review", title: "Expert resume review", description: "An expert reviews your resume and sends back specific changes.", rupees: 999 },
  { key: "mock-visa-interview", title: "Mock visa interview", description: "A practice visa interview with an expert and feedback on your answers.", rupees: 799 },
  { key: "expert-shortlist", title: "Overseas universities shortlist by experts", description: "A shortlist of overseas universities chosen by our experts to fit your documents and qualifications. For registered students.", rupees: 2499 },
];

/** Resume Studio Pro, sold on its own once (sku `resume-studio-pro`) and opened by any paid plan while it is active. */
export const RESUME_STUDIO_PRO_RUPEES = 199;
