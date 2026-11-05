/**
 * This repository serves a single Yugty vertical (Yugty Overseas Education). Every path that belongs to another vertical is sent to the main site (MARKETING_URL).
 * Set SITE_MODE=full to serve every path from this host instead. Pure functions, safe for the edge middleware.
 */
export const PORTAL_PREFIXES = [
  "/.well-known", "/_next", "/abroad", "/account", "/api/auth", "/api/colleges", "/api/cron", "/api/files", "/api/growqr-profile", "/api/health", "/api/learn", "/api/portal", "/api/razorpay", "/api/salesiq", "/api/send-contact", "/api/t", "/api/upload-resume", "/api/v1", "/auth", "/billing", "/cart", "/checkout", "/console", "/contact", "/counselor", "/crm-file.js", "/data-deletion", "/favicon.ico", "/file", "/forgot-password", "/go", "/yugty-logo.svg", "/ielts", "/login", "/overseas-packages", "/passport", "/pricing", "/privacy-policy", "/refund-policy", "/reset-password", "/robots.txt", "/signup", "/sitemap.xml", "/study-abroad", "/support", "/universities", "/v", "/verify", "/verify-email",
];

export function isPortalPath(pathname: string): boolean {
  return PORTAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export type Decision = { action: "next" } | { action: "redirect"; to: string };

/** What to do with a request on a portal-only host. `marketing` is the main site, e.g. https://growqr.ai (no trailing slash). */
export function portalDecision(pathname: string, search: string, marketing: string): Decision {
  if (pathname === "/") return { action: "next" }; // the main site's home page
  if (isPortalPath(pathname) || /\.[a-z0-9]{2,5}$/i.test(pathname)) return { action: "next" }; // static files (logo, js) are served as they are
  return { action: "redirect", to: `${marketing.replace(/\/+$/, "")}${pathname}${search}` };
}
