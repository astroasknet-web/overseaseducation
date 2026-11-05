import Link from "next/link";
import { ArrowRight } from "lucide-react";

const LINKS: Array<[string, string]> = [
  ["/#destinations", "Destinations"],
  ["/#services", "Services"],
  ["/#journey", "Journey"],
  ["/#scholarships", "Scholarships"],
  ["/#resources", "Resources"],
  ["/#faq", "FAQ"],
];

/**
 * The site header for Yugty Overseas Education. `overlay` places it transparently over the dark home hero; other pages get the solid
 * white bar. The mobile menu is a native <details>, so it works without JavaScript.
 */
export default function Navbar({ overlay = false }: { overlay?: boolean; hideUseCases?: boolean } = {}) {
  return (
    <header className={`yg-header ${overlay ? "yg-header-overlay" : "yg-header-solid"}`}>
      <div className="yg-wrap yg-header-in">
        <Link href="/" className="yg-brand" aria-label="Yugty Overseas Education home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/yugty-logo.svg" alt="Yugty" className="yg-logo" />
          <span className="yg-brand-sub">Overseas Education</span>
        </Link>
        <nav className="yg-nav" aria-label="Main">
          {LINKS.map(([h, l]) => (
            <Link key={h} href={h}>
              {l}
            </Link>
          ))}
        </nav>
        <div className="yg-header-cta">
          <Link href="/login" className="yg-signin">
            Sign in
          </Link>
          <Link href="/#enquire" className="yg-btn yg-btn-primary yg-btn-sm">
            Free counselling <ArrowRight size={16} aria-hidden />
          </Link>
          <details className="yg-menu">
            <summary aria-label="Open menu">
              <span />
            </summary>
            <div className="yg-menu-panel">
              {[...LINKS, ["/study-abroad", "Find universities"], ["/login", "Sign in"]].map(([h, l]) => (
                <Link key={h + l} href={h}>
                  {l}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
