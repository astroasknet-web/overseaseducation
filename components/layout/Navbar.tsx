import Link from "next/link";

const LINKS: Array<[string, string]> = [
  ["/#destinations", "Destinations"],
  ["/#journey", "Journey"],
  ["/#packages", "Packages"],
  ["/#tools", "Tools"],
  ["/#faq", "FAQ"],
];

/** The site header: Yugty Overseas Education. Sticky, with a no-script mobile menu. */
export default function Navbar(_props: { hideUseCases?: boolean } = {}) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-3" aria-label="Yugty Overseas Education home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/yugty-logo.svg" alt="Yugty" className="h-8 w-auto" />
          <span className="hidden whitespace-nowrap border-l border-black/15 pl-3 text-[13px] font-semibold tracking-wide text-ink-3 lg:inline">Overseas Education</span>
        </Link>
        <nav className="hidden items-center gap-8 whitespace-nowrap text-[14px] font-medium text-ink-2 lg:flex" aria-label="Main">
          {LINKS.map(([h, l]) => <Link key={h} href={h} className="hover:text-orange">{l}</Link>)}
          <Link href="/study-abroad" className="hover:text-orange">Universities</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden min-h-[40px] items-center whitespace-nowrap rounded-full px-4 text-[14px] font-semibold text-ink-2 hover:text-orange sm:inline-flex">Sign in</Link>
          <Link href="/signup" className="inline-flex min-h-[40px] items-center whitespace-nowrap rounded-full bg-orange px-5 text-[14px] font-semibold text-white shadow-glow transition hover:bg-orange-dark">Get started</Link>
          <details className="relative lg:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-black/10" aria-label="Menu">
              <span className="block h-0.5 w-4 bg-ink shadow-[0_5px_0_#1a1a1a,0_-5px_0_#1a1a1a]" />
            </summary>
            <div className="absolute right-0 top-12 w-56 rounded-2xl border border-black/10 bg-white p-2 shadow-soft">
              {[...LINKS, ["/study-abroad", "Universities"], ["/login", "Sign in"]].map(([h, l]) => (
                <Link key={h + l} href={h} className="block rounded-xl px-4 py-3 text-[15px] font-medium hover:bg-cream-2">{l}</Link>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
