import { redirect } from "next/navigation";

/** Pricing for this site is the overseas packages page. */
export default function PricingPage(): never {
  redirect("/overseas-packages");
}
