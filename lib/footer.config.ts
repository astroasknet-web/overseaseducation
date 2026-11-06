import { CONTACT, SOCIAL } from "@/lib/home/content";
import { STANDARD_LEGAL } from "@/components/standard-footer/defaults";
import type { FooterConfig } from "@/components/standard-footer/types";
import { SITE_URL } from "@/lib/seo";

/**
 * Footer settings for Yugty Overseas Education. The layout is the standard footer used by every Yugty web application
 * (components/standard-footer); only the values below are specific to this app.
 *
 * The app family panel appears once at least two apps have a URL: set NEXT_PUBLIC_APP_URL_LEARNING, _INTERNSHIPS and _RECRUITMENT
 * (full https:// URLs) when those sites go live.
 */
const env = (k: string) => (process.env[k] ?? "").trim();

export const FOOTER: FooterConfig = {
  brand: {
    name: "Yugty Overseas Education",
    logoSrc: "/yugty-logo.svg",
    logoAlt: "Yugty Overseas Education",
    tagline: "Compare universities, plan your costs in rupees and get counsellor-led help from shortlist to visa to arrival.",
  },
  siteUrl: SITE_URL,
  cta: {
    eyebrow: "Study abroad. Planned.",
    title: "Your global education journey starts here.",
    text: "Discover world-class universities, compare real costs and get expert guidance at every step. Free counselling, no obligation.",
    primary: { label: "Get free counselling", href: "/#enquire" },
    secondary: { label: "Find your university", href: "/study-abroad" },
    tertiary: { label: "See the packages", href: "/overseas-packages" },
  },
  appsTitle: "One family. One account.",
  apps: [
    { key: "overseas", name: "Overseas Education", href: "/", icon: "Globe" },
    { key: "learning", name: "Learning & Courses", href: env("NEXT_PUBLIC_APP_URL_LEARNING"), icon: "GraduationCap", external: true },
    { key: "internships", name: "Internships", href: env("NEXT_PUBLIC_APP_URL_INTERNSHIPS"), icon: "Briefcase", external: true },
    { key: "recruitment", name: "Recruitment & Hiring", href: env("NEXT_PUBLIC_APP_URL_RECRUITMENT"), icon: "Users", external: true },
  ],
  newsletter: { label: "Get study abroad updates", button: "Join", endpoint: "/api/enquiry", source: "footer" },
  columns: [
    { title: "Study abroad", links: [
      { href: "/study-abroad", label: "Find universities" },
      { href: "/study-abroad/usa", label: "Study in the USA" },
      { href: "/study-abroad/uk", label: "Study in the UK" },
      { href: "/study-abroad/canada", label: "Study in Canada" },
      { href: "/study-abroad/australia", label: "Study in Australia" },
      { href: "/study-abroad/germany", label: "Study in Germany" },
      { href: "/#destinations", label: "All destinations" },
    ] },
    { title: "Services", links: [
      { href: "/overseas-packages", label: "Packages" },
      { href: "/ielts", label: "IELTS preparation" },
      { href: "/#scholarships", label: "Scholarships & funding" },
      { href: "/#enquire?service=Visa%20guidance", label: "Visa guidance" },
      { href: "/#scholarships", label: "Education loans" },
      { href: "/#journey", label: "Your journey" },
    ] },
    { title: "Resources", links: [
      { href: "/#resources", label: "Knowledge centre" },
      { href: "/#faq", label: "FAQs" },
      { href: "/support", label: "Student support" },
      { href: "/login", label: "Student login" },
    ] },
    { title: "Company", links: [
      { href: "/#why", label: "About us" },
      { href: "/contact", label: "Contact us" },
      { href: "/support", label: "Support" },
      { href: "/pricing", label: "Plans and pricing" },
    ] },
  ],
  social: [
    { label: "LinkedIn", href: SOCIAL.linkedin, icon: "linkedin" },
    { label: "X", href: SOCIAL.x, icon: "x" },
    { label: "Instagram", href: SOCIAL.instagram, icon: "instagram" },
    { label: "YouTube", href: SOCIAL.youtube, icon: "youtube" },
    { label: "Facebook", href: SOCIAL.facebook, icon: "facebook" },
  ],
  supportEmail: CONTACT.email,
  share: {
    title: "Know someone who should try Yugty Overseas Education?",
    text: "Yugty Overseas Education: compare universities, plan costs in rupees and get expert help to study abroad",
    subject: "Have a look at Yugty Overseas Education",
  },
  // The Editorial Policy page is part of the standard footer; add it here once this app publishes one.
  legal: STANDARD_LEGAL.filter((l) => l.href !== "/editorial-policy"),
};
