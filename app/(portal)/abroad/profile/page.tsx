import type { Metadata } from "next";
import { isVerified } from "@/lib/portal/auth";
import { requireUser } from "@/lib/portal/guard";
import * as A from "@/lib/abroad/catalogue";
import * as S from "@/lib/abroad/store";
import { BUDGETS, intakes } from "@/lib/abroad/options";
import { ProfileForm } from "@/components/abroad/profile-form";
import { PortalPage } from "@/components/portal/shell";
import { Alert } from "@/components/portal/ui";
import { ResendVerification } from "@/components/portal/forms";

export const metadata: Metadata = { title: "My study-abroad profile | GrowQR" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const me = await requireUser("student");
  const cs = await A.countries();
  const p = await S.profile(me.id);
  const list = intakes();
  const initial = {
    level: p?.level ?? "PG", field: p?.field ?? "", score_type: p?.score_type ?? "percentage", score_value: p?.score_value ?? "", english_test: p?.english_test ?? "none",
    english_score: p?.english_score ?? "", gre: p?.gre ? String(p.gre) : "", budget_inr: String(p?.budget_inr || 3000000), countries: p?.country_list ?? [], intake: p?.intake || list[0], goal: p?.goal ?? "",
  };
  return (
    <PortalPage user={me} active="abroad" title="Your study-abroad profile" subtitle="Your answers decide which universities are Safe, Target or Reach for you. Change them any time." wide>
      {!isVerified(me) ? <><Alert kind="info">Confirm your email to save your profile.</Alert><div className="mb-6"><ResendVerification /></div></> : null}
      <ProfileForm initial={initial} fields={A.FIELDS} countries={Object.values(cs).map((c) => ({ key: c.key, name: c.name }))} budgets={Object.fromEntries(Object.entries(BUDGETS))} intakes={list} hasConsent={Boolean(p?.consent_at)} />
    </PortalPage>
  );
}
