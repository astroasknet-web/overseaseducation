import type { Metadata } from "next";
import Link from "next/link";
import SiteChrome from "@/components/layout/SiteChrome";

export const metadata: Metadata = {
  title: "GrowQR Overseas Education",
  description: "Find universities, compare country packages, prepare for IELTS, and manage your whole overseas journey (profile, documents, visa, funds, loans, interview practice) with a counsellor beside you.",
};

const CARDS = [
  { href: "/overseas-packages", title: "Country packages", text: "Compare study-abroad packages by country, with what is included at each stage." },
  { href: "/study-abroad", title: "Study destinations", text: "Explore countries and their partner universities, then shortlist the ones that fit your profile." },
  { href: "/ielts", title: "IELTS preparation", text: "Lessons, writing and speaking practice, and full mock tests." },
  { href: "/abroad", title: "My overseas journey", text: "Profile, matches, documents, visa, funds, loans and interview practice in one dashboard." },
  { href: "/counselor", title: "Counsellor desk", text: "For counsellors: manage students, review journeys and run mock interviews." },
];

export default function Home() {
  return (
    <SiteChrome>
      <main className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <p className="text-[13px] font-semibold uppercase tracking-wider text-orange-deep">GrowQR Overseas Education</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">Study abroad, end to end</h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-2">Find universities, compare country packages, prepare for IELTS, and manage your whole overseas journey (profile, documents, visa, funds, loans, interview practice) with a counsellor beside you.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/abroad" className="inline-flex min-h-[48px] items-center rounded-full bg-orange px-6 font-semibold text-white">Start your journey</Link>
          <Link href="/login" className="inline-flex min-h-[48px] items-center rounded-full border border-black/15 px-6 font-semibold">Sign in</Link>
        </div>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="block h-full rounded-2xl border border-black/10 p-6 transition hover:border-orange hover:shadow-md">
                <h2 className="text-xl font-semibold">{c.title}</h2>
                <p className="mt-2 text-[15px] text-ink-2">{c.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </SiteChrome>
  );
}
