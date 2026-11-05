"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const r = await fetch("/api/enquiry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "newsletter", email, source: "footer" }) });
      const j = (await r.json().catch(() => ({}))) as { message?: string };
      if (!r.ok) {
        setMsg(j.message ?? "Please try again.");
        return setState("err");
      }
      setState("ok");
      setEmail("");
    } catch {
      setMsg("Could not reach the server.");
      setState("err");
    }
  }
  return (
    <form onSubmit={submit} className="yg-news" aria-label="Newsletter">
      <label className="sr-only" htmlFor="yg-news-email">
        Email address
      </label>
      <input id="yg-news-email" type="email" required maxLength={190} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" autoComplete="email" />
      <button type="submit" disabled={state === "sending"} className="yg-btn yg-btn-primary">
        {state === "sending" ? "…" : "Subscribe"}
      </button>
      <p role="status" className={state === "err" ? "err" : ""}>
        {state === "ok" ? "Thanks, you are subscribed." : state === "err" ? msg : ""}
      </p>
    </form>
  );
}
