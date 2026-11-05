import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { currentViewer, MarketShell } from "@/components/market/shell";
import PackageShowcase from "@/components/abroad/PackageShowcase";
import PackageMatrix from "@/components/abroad/PackageMatrix";
import { packageCtas } from "@/components/abroad/package-ctas";
import { ABROAD_PACKAGES, PACKAGE_DISCLAIMER, packageByKey, rs } from "@/lib/abroad/packages";
import { SITE_URL } from "@/lib/seo";
import "@/components/abroad/packages.css";

export const dynamic = "force-dynamic"; // the buttons depend on whether you are signed in

export const metadata: Metadata = {
  title: "Overseas Education Packages: From Shortlisting to Settling Abroad | GrowQR",
  description: `Five levels of expert help for studying abroad, from a university shortlist at ${rs(1999)} to arrival, housing and welfare support after you land. Compare every service.`,
  alternates: { canonical: `${SITE_URL}/overseas-packages` },
  openGraph: { type: "website", url: `${SITE_URL}/overseas-packages`, siteName: "GrowQR", title: "Overseas Education Packages | GrowQR", description: `Five levels of expert help for studying abroad, from a university shortlist at ${rs(1999)} to arrival, housing and welfare support after you land.` },
};

const FAQ: Array<[string, string]> = [
  ["Which package should I start with?", "If you are still choosing where to apply, start with Discovery & Shortlisting. If you already know your course and universities, Application Pro covers the applications. Each level includes everything in the one before, so you can start small."],
  ["Can I move up to a higher package later?", "Yes. Tell your counsellor or raise a support ticket and we will work out what you have already covered."],
  ["Does any package guarantee admission or a visa?", "No. Universities and governments make those decisions. The packages improve how prepared and organised you are."],
  ["How do I pay?", "Every package is a one-time fee paid online at checkout, by card, UPI or net banking. You will receive a receipt, and your counsellor contacts you about the next steps."],
];

export default async function OverseasPackagesPage({ searchParams }: { searchParams: Promise<{ pkg?: string }> }) {
  const me = await currentViewer();
  const sp = await searchParams;
  const initial = packageByKey(sp.pkg ?? "")?.key ?? "application-pro";
  return (
    <MarketShell user={me} active="abroad">
      <nav aria-label="Breadcrumb" className="mb-4 text-[13px] text-ink-3"><Link href="/study-abroad" className="underline">Study abroad</Link> / Packages</nav>
      <header className="max-w-3xl">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-brand-deep">Overseas education</p>
        <h1 className="mt-3 text-[32px] font-bold leading-[1.1] text-ink sm:text-[44px]">From the first shortlist to your first month abroad.</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-ink-3 sm:text-[17px]">Five levels of hands-on help from GrowQR&apos;s counsellors. Each level includes everything in the one before it, so you can start where you are and go as far as you need. Prices run from {rs(ABROAD_PACKAGES[0].from)} to {rs(ABROAD_PACKAGES[4].from)}.</p>
      </header>

      <div className="mt-8 sm:mt-10"><PackageShowcase ctas={packageCtas(!!me)} initial={initial} variant="public" headingLevel={2} /></div>

      <section className="mt-12 sm:mt-16" aria-labelledby="ap-compare">
        <h2 id="ap-compare" className="text-[24px] font-bold text-ink sm:text-[30px]">Compare every service</h2>
        <p className="mt-2 mb-5 max-w-[40em] text-[15px] text-ink-3">A tick means the service is included from that level upward.</p>
        <PackageMatrix tone="light" />
      </section>

      <section className="mt-12 sm:mt-16 grid gap-6 lg:grid-cols-[1fr_1.2fr]" aria-labelledby="ap-faq">
        <div>
          <h2 id="ap-faq" className="text-[24px] font-bold text-ink sm:text-[30px]">Questions families ask</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-3">{PACKAGE_DISCLAIMER}</p>
          <p className="mt-5 flex flex-wrap gap-3">
            <Link href="/study-abroad" className="inline-flex min-h-[46px] items-center gap-2 rounded-full border border-black/[0.15] px-5 font-semibold text-ink hover:bg-cream-3">Explore universities <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            <Link href="/contact" className="inline-flex min-h-[46px] items-center rounded-full px-5 font-semibold text-ink underline underline-offset-4">Talk to us</Link>
          </p>
        </div>
        <div className="grid gap-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group rounded-2xl border border-black/[0.08] bg-white p-5 shadow-card">
              <summary className="cursor-pointer list-none text-[16px] font-semibold text-ink">{q}</summary>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-3">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </MarketShell>
  );
}
