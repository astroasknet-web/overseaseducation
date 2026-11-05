import Link from "next/link";
import { ArrowRight, Plane } from "lucide-react";
import { ABROAD_PACKAGES, rs } from "@/lib/abroad/packages";

/** A strip that points people to the overseas education packages from the study-abroad pages and the dashboard. */
export default function PackagesBanner({ href }: { href: string }) {
  return (
    <Link href={href} className="group mb-6 flex flex-wrap items-center gap-4 rounded-2xl bg-gradient-to-r from-[#0b1020] via-[#10204a] to-[#1b1740] px-5 py-4 text-white shadow-card transition hover:shadow-glow">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#2fd39a] to-[#35d9ff] text-[#04201a]"><Plane className="h-5 w-5" aria-hidden /></span>
      <span className="min-w-0 flex-1">
        <b className="block text-[1rem]">Want an expert beside you? See the overseas education packages</b>
        <span className="block text-[0.86rem] text-white/70">Five levels, from a university shortlist at {rs(ABROAD_PACKAGES[0].from)} to arrival and settling-in support.</span>
      </span>
      <span className="inline-flex items-center gap-2 text-[0.92rem] font-semibold text-[#8cf0c9]">View packages <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden /></span>
    </Link>
  );
}
