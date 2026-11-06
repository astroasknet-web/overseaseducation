/**
 * Editable content for the Yugty Overseas Education home page. Change text here; no page code needs to be touched.
 *
 * What is real and what is a placeholder:
 *  - Destination fees and the university count come from lib/abroad/data/study-abroad.json (the live catalogue).
 *  - Services, journey steps, FAQs and resource cards are general guidance written for this page.
 *  - TESTIMONIALS are clearly marked SAMPLES. Replace them with verified student stories (and set `placeholder: false`).
 *  - STATS only lists catalogue facts. Add verified figures (students guided, partner universities, ...) to VERIFIED_STATS when you have them.
 *  - Photos are optional: drop a file at public/home/destinations/<key>.jpg (or .webp), public/home/hero.jpg, public/home/students/<n>.jpg
 *    and it appears automatically; until then a designed gradient is shown.
 */

export type Destination = { key: string; name: string; code: string; catalogue: boolean; blurb: string; programmes: string[]; hue: [string, string] };

export const DESTINATIONS: Destination[] = [
  { key: "usa", name: "United States", code: "US", catalogue: true, blurb: "The widest choice of programmes, research funding and campus life in the world.", programmes: ["Computer Science", "Business", "Engineering"], hue: ["#1d4ed8", "#38bdf8"] },
  { key: "uk", name: "United Kingdom", code: "GB", catalogue: true, blurb: "Short, focused degrees: a one-year master's and a three-year bachelor's.", programmes: ["Law", "Finance", "Data Science"], hue: ["#4338ca", "#a78bfa"] },
  { key: "canada", name: "Canada", code: "CA", catalogue: true, blurb: "Welcoming campuses with strong pathways to work after graduation.", programmes: ["Engineering", "Health Sciences", "IT"], hue: ["#be123c", "#fb7185"] },
  { key: "australia", name: "Australia", code: "AU", catalogue: true, blurb: "Highly ranked universities, a strong graduate job market and a relaxed lifestyle.", programmes: ["Business", "Nursing", "Environmental Science"], hue: ["#0f766e", "#2dd4bf"] },
  { key: "germany", name: "Germany", code: "DE", catalogue: true, blurb: "Low or no tuition at public universities and a powerhouse engineering sector.", programmes: ["Mechanical Engineering", "Automotive", "Sciences"], hue: ["#0e7490", "#67e8f9"] },
  { key: "france", name: "France", code: "FR", catalogue: true, blurb: "Affordable public universities and leading business schools and grandes écoles.", programmes: ["Management", "Fashion & Design", "Hospitality"], hue: ["#3730a3", "#818cf8"] },
  { key: "poland", name: "Poland", code: "PL", catalogue: false, blurb: "An affordable gateway to a European degree with a growing tech and medical sector.", programmes: ["Medicine", "IT", "Engineering"], hue: ["#9f1239", "#fda4af"] },
  { key: "ireland", name: "Ireland", code: "IE", catalogue: false, blurb: "English-speaking, home to major technology and pharmaceutical employers.", programmes: ["Data Analytics", "Pharma", "Business"], hue: ["#047857", "#6ee7b7"] },
  { key: "netherlands", name: "Netherlands", code: "NL", catalogue: false, blurb: "Hundreds of English-taught programmes in an open, international environment.", programmes: ["Engineering", "Agri-Food", "Design"], hue: ["#c2410c", "#fdba74"] },
  { key: "new-zealand", name: "New Zealand", code: "NZ", catalogue: false, blurb: "Safe, supportive and known for applied, hands-on learning.", programmes: ["Agriculture", "Tourism", "Sciences"], hue: ["#0369a1", "#7dd3fc"] },
];

export type Service = { icon: string; title: string; text: string; href: string; cta: string };
export const SERVICES: Service[] = [
  { icon: "Compass", title: "University Selection & Career Counselling", text: "A balanced list of ambitious, target and safer universities built around your goals.", href: "/study-abroad", cta: "Explore universities" },
  { icon: "BookOpen", title: "Programme Selection", text: "Match your background and career plans to the right programme and specialisation.", href: "#enquire?service=Programme%20selection", cta: "Get advice" },
  { icon: "FileText", title: "University Application Assistance", text: "Statements, recommendations, resumes and forms prepared and submitted with care.", href: "/overseas-packages", cta: "See packages" },
  { icon: "BadgeCheck", title: "Admission & Offer Letter Support", text: "Track every response and compare offers before you decide.", href: "#enquire?service=Admission%20support", cta: "Talk to us" },
  { icon: "Award", title: "Scholarship Guidance", text: "Find scholarships you qualify for and prepare strong applications.", href: "#scholarships", cta: "View funding" },
  { icon: "Languages", title: "IELTS & English Language Preparation", text: "Lessons, writing and speaking practice, and full-length mock tests.", href: "/ielts", cta: "Start practising" },
  { icon: "Stamp", title: "Student Visa Guidance", text: "A clear checklist, document review and interview practice for your destination.", href: "#enquire?service=Visa%20guidance", cta: "Get guidance" },
  { icon: "Landmark", title: "Education Loan Assistance", text: "Compare loan options and understand the repayments before you commit.", href: "#scholarships", cta: "Plan funding" },
  { icon: "House", title: "Accommodation Assistance", text: "Practical help finding safe housing near your campus.", href: "#enquire?service=Accommodation", cta: "Ask about housing" },
  { icon: "Plane", title: "Pre-Departure Guidance", text: "Packing, banking, travel and what to expect in your first weeks.", href: "#enquire?service=Pre-departure", cta: "Prepare to fly" },
  { icon: "LifeBuoy", title: "International Student Support", text: "A point of contact after you arrive, when questions are most likely to come up.", href: "/support", cta: "Get support" },
];

export const WHY: Array<{ icon: string; title: string; text: string }> = [
  { icon: "Users", title: "Personalised student guidance", text: "Advice built around your profile, budget and goals, not a template." },
  { icon: "Globe", title: "Global education opportunities", text: "Ten study destinations and a growing catalogue of universities to compare." },
  { icon: "ShieldCheck", title: "Transparent admission process", text: "Every step, document and fee is visible to you, and nothing is promised that cannot be delivered." },
  { icon: "Award", title: "Scholarship assistance", text: "Help finding and applying for funding you are eligible for." },
  { icon: "Route", title: "End-to-end application support", text: "From first shortlist to visa and arrival, in one dashboard." },
  { icon: "Target", title: "Career-oriented counselling", text: "Programme choices tied to where you want your career to go." },
  { icon: "LifeBuoy", title: "Dedicated student assistance", text: "People you can ask, at every stage of the journey." },
];

/** Add verified figures here (for example { value: 2500, suffix: "+", label: "Students guided" }). They animate when scrolled into view. */
export const VERIFIED_STATS: Array<{ value: number; suffix?: string; label: string }> = [];

export const JOURNEY: Array<{ no: string; name: string; text: string }> = [
  { no: "01", name: "Discover", text: "Explore countries, universities and programmes." },
  { no: "02", name: "Consult", text: "Receive personalised academic guidance." },
  { no: "03", name: "Shortlist", text: "Identify universities matching your profile and budget." },
  { no: "04", name: "Apply", text: "Complete applications and documentation." },
  { no: "05", name: "Get Admitted", text: "Receive and evaluate admission offers." },
  { no: "06", name: "Prepare", text: "Complete visa and pre-departure preparations." },
  { no: "07", name: "Fly", text: "Begin your international education journey." },
];

export const FUNDING: Array<{ icon: string; title: string; text: string }> = [
  { icon: "Award", title: "Merit-based scholarships", text: "Awards for strong academic records and achievements." },
  { icon: "GraduationCap", title: "University scholarships", text: "Funding offered directly by universities to international students." },
  { icon: "Landmark", title: "Government-funded scholarships", text: "Programmes backed by national governments and agencies." },
  { icon: "Wallet", title: "Tuition fee guidance", text: "Understand real tuition ranges for every destination, in rupees." },
  { icon: "PiggyBank", title: "Education loan assistance", text: "Compare lenders, collateral rules and monthly repayments." },
  { icon: "Building2", title: "Cost-of-living planning", text: "Budget rent, food and travel before you choose a city." },
];

export type Testimonial = { name: string; country: string; university: string; programme: string; quote: string; placeholder: boolean };
export const TESTIMONIALS: Testimonial[] = [
  { name: "Student name", country: "United Kingdom", university: "University name", programme: "MSc Data Science", quote: "Replace this with a real quote from a student who has enrolled. Keep it short, specific and in their own words.", placeholder: true },
  { name: "Student name", country: "Canada", university: "University name", programme: "BEng Mechanical Engineering", quote: "Replace this with a real quote from a student who has enrolled. Keep it short, specific and in their own words.", placeholder: true },
  { name: "Student name", country: "Australia", university: "University name", programme: "Master of Business Analytics", quote: "Replace this with a real quote from a student who has enrolled. Keep it short, specific and in their own words.", placeholder: true },
];

export const RESOURCES: Array<{ tag: string; title: string; text: string; href: string }> = [
  { tag: "Guide", title: "Overseas education guide", text: "How to choose a country, a programme and a university.", href: "/study-abroad" },
  { tag: "Country", title: "Study in the USA", text: "Costs, intakes, work rights and visa steps.", href: "/study-abroad/usa" },
  { tag: "Country", title: "Study in the UK", text: "Short degrees, the Graduate Route and how to apply.", href: "/study-abroad/uk" },
  { tag: "Practice", title: "IELTS preparation", text: "Lessons and full-length practice tests for all four skills.", href: "/ielts" },
  { tag: "Funding", title: "Scholarships & funding", text: "Where to look and how to plan your costs.", href: "#scholarships" },
  { tag: "Visa", title: "Visa information", text: "Documents and steps for each destination.", href: "/study-abroad/canada" },
  { tag: "Planning", title: "Application deadlines", text: "Main intakes and the months to start preparing.", href: "/study-abroad/germany" },
  { tag: "Support", title: "Questions & help", text: "Talk to the team or raise a support ticket.", href: "/support" },
];

export const FAQS: Array<[string, string]> = [
  ["How do I choose the right country?", "Start with your programme, budget and career plans. Compare tuition, living costs, work rights after study and visa rules for each destination, then shortlist two or three. A counsellor can help you weigh them against your profile."],
  ["What are the admission requirements?", "They vary by university and programme, but usually include academic transcripts, proof of English proficiency, a statement of purpose, recommendations and a resume. Some programmes also ask for tests such as the GRE or GMAT."],
  ["Can I study abroad without IELTS?", "Sometimes. Many universities accept other tests (such as PTE, TOEFL or Duolingo), and some waive the requirement based on previous English-medium study. Rules are set by each university, so check the programme page or ask us."],
  ["How can I find scholarships?", "Look at university scholarships, government programmes and merit awards for your destination. Deadlines are often earlier than admission deadlines, so start while you shortlist."],
  ["What is the average cost of studying abroad?", "It depends heavily on country and programme. Germany can be low-tuition at public universities, while the USA and UK are at the higher end. Our destination pages show yearly tuition and living costs in rupees."],
  ["How long does the admission process take?", "Plan for several months from shortlisting to offer, plus time for the visa. Most students begin 9 to 12 months before the intake they want."],
  ["What documents are required for a student visa?", "Typically an offer letter, passport, proof of funds, academic records and English test results, plus country-specific forms and sometimes a medical check or interview. Requirements differ, so confirm on the official visa site."],
  ["Can I work while studying abroad?", "Most destinations allow limited part-time work during term and full-time in holidays, with limits set by each country's student visa. Check the current rules for your destination before you rely on this income."],
];

export const STUDY_LEVELS = ["Undergraduate", "Postgraduate", "Doctoral", "Diploma / professional"] as const;
export const INTAKES = ["Jan 2027", "May 2027", "Sep 2027", "Jan 2028", "Sep 2028", "Not sure yet"] as const;
export const SUBJECTS = ["Computer Science & IT", "Data Science & AI", "Engineering", "Business & Management", "Economics & Finance", "Design & Arts", "Health & Life Sciences", "Sciences", "Law & Social Sciences"] as const;
export const BUDGETS = [
  { label: "Any budget", value: "" },
  { label: "Up to ₹15 lakh / year", value: "15" },
  { label: "₹15 – 30 lakh / year", value: "30" },
  { label: "₹30 – 50 lakh / year", value: "50" },
  { label: "Above ₹50 lakh / year", value: "99" },
] as const;

/** Replace the placeholders with real contact details. Social icons only show when a URL is set. */
export const CONTACT = { email: "hello@yourdomain.com", phone: "+91 00000 00000", address: "Your office address, City, India" };
export const SOCIAL: { linkedin: string; instagram: string; youtube: string; facebook: string; x: string } = { linkedin: "", instagram: "", youtube: "", facebook: "", x: "" };
