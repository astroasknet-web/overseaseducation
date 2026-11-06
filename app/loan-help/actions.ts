"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/portal/guard";
import * as LH from "@/lib/abroad/loan-help";

const KEYS = ["amount_inr", "country", "university", "intake", "coapplicant", "collateral", "phone", "note"] as const;

/** A signed-in student asks for loan help. Validated here, never trusted from the form; one open request at a time. */
export async function requestLoanHelpAction(fd: FormData): Promise<void> {
  const me = await requireUser("student");
  const raw: Record<string, string> = {};
  for (const k of KEYS) raw[k] = String(fd.get(k) ?? "");
  const [v, err] = LH.validate(raw);
  if (!v) redirect(`/loan-help?e=${encodeURIComponent(err ?? "Please check the form.")}#request`);
  const e = await LH.create(me.id, v);
  redirect(e ? `/loan-help?e=${encodeURIComponent(e)}#request` : "/loan-help?sent=1#request");
}
