"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/portal/guard";
import { putSessionData } from "@/lib/portal/session";
import * as G from "@/lib/abroad/germany";
import * as LH from "@/lib/abroad/loan-help";

const flash = (kind: "ok" | "err", text: string) => putSessionData({ console_flash: [kind, text] });
const s = (fd: FormData, k: string): string => String(fd.get(k) ?? "").trim();
const staff = () => requireUser("counselor", "admin");

export async function enrolGermanyAction(fd: FormData): Promise<void> {
  await staff();
  const err = await G.enrolByEmail(s(fd, "email"));
  await flash(err ? "err" : "ok", err ?? "Student added to the Germany programme.");
  redirect("/counselor/germany");
}

export async function updateGermanyAction(fd: FormData): Promise<void> {
  await staff();
  const score = s(fd, "test_score");
  const err = await G.update(Number(s(fd, "id")), {
    status: s(fd, "status"), test_score: score === "" ? null : Number(score), consistent: s(fd, "consistent") === "" ? null : s(fd, "consistent") === "1", outcome: s(fd, "outcome"), note: s(fd, "note"),
  });
  await flash(err ? "err" : "ok", err ?? "Saved.");
  redirect("/counselor/germany");
}

export async function updateLoanHelpAction(fd: FormData): Promise<void> {
  await staff();
  const err = await LH.setStatus(Number(s(fd, "id")), s(fd, "status"), s(fd, "staff_note"));
  await flash(err ? "err" : "ok", err ?? "Saved.");
  redirect("/counselor/loan-help");
}
