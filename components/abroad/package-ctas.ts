import { ABROAD_PACKAGES, packageSku, rs } from "@/lib/abroad/packages";
import type { PackageCta } from "./PackageShowcase";

/** The button for each package: every package is a fixed fee, so it goes to checkout (after sign-in). */
export function packageCtas(signedIn: boolean): Record<string, PackageCta> {
  const out: Record<string, PackageCta> = {};
  for (const p of ABROAD_PACKAGES) {
    const target = `/checkout?sku=${packageSku(p.key)}`;
    out[p.key] = {
      href: signedIn ? target : `/login?next=${encodeURIComponent(target)}`,
      label: `Choose this package · ${rs(p.from)}`,
      quote: false,
    };
  }
  return out;
}
