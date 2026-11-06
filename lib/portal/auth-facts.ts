import "server-only";
import { all as allTemplates } from "@/lib/studio/templates";
import { COUNTRIES } from "@/components/home-options/data";
import { STAGES } from "@/lib/journey/default-template";
import { totalUniversities } from "@/lib/abroad/catalogue";
import { databaseConfigured } from "@/lib/portal/db";

/** The numbers shown on the sign-in and sign-up panels. Counted from what the site really holds, so they never go stale as features are added. */
export interface AuthFacts { templates: number; universities: number | null; countries: number; stages: number }

export async function authFacts(): Promise<AuthFacts> {
  const universities = databaseConfigured() ? await totalUniversities().catch(() => null) : null;
  return {
    templates: Object.keys(allTemplates()).length,
    universities: universities && universities > 0 ? universities : null,
    countries: COUNTRIES.length,
    stages: STAGES.filter((s) => !s.track).length,
  };
}
