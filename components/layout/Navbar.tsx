import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { currentUser } from "@/lib/portal/guard";

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
 * white bar. It shows "My journey" and the person's first name when someone is signed in. The mobile menu is a native <details>, so it
 * works without JavaScript.
 */
export default async function Navbar({ overlay = false }: { overlay?: boolean; hideUseCases?: boolean } = {}) {
  const me = await currentUser().catch(() => null);
  const first = me ? (me.name.split(" ")[0] || "Account") : "";
  const journeyHref = me ? (me.role === "student" ? "/abroad" : me.role === "counselor" ? "/counselor/journey" : "/account") : "/#enquire";
  const menu: Array<[string, string]> = me
    ? [...LINKS, ["/study-abroad", "Find universities"], [journeyHref, me.role === "student" ? "My journey" : "My workspace"], ["/account", "My account"]]
    : [...LINKS, ["/study-abroad", "Find universities"], ["/login", "Sign in"]];
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
          {me ? (
            <Link href="/account" className="yg-signin" aria-label={`My account, signed in as ${me.name}`}>
              Hi, {first}
            </Link>
          ) : (
            <Link href="/login" className="yg-signin">
              Sign in
            </Link>
          )}
          <Link href={journeyHref} className="yg-btn yg-btn-primary yg-btn-sm">
            {me ? (me.role === "student" ? "My journey" : "My workspace") : "Free counselling"} <ArrowRight size={16} aria-hidden />
          </Link>
          <details className="yg-menu">
            <summary aria-label="Open menu">
              <span />
            </summary>
            <div className="yg-menu-panel">
              {menu.map(([h, l]) => (
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
