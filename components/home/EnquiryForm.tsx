"use client";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { DESTINATIONS, INTAKES, STUDY_LEVELS } from "@/lib/home/content";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "ok" } | { kind: "error"; message: string };
const EMPTY = { name: "", email: "", phone: "", destination: "", level: "", intake: "", service: "", website: "" };

export default function EnquiryForm() {
  const ref = useRef<HTMLFormElement | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [v, setV] = useState(EMPTY);

  // Links like /#enquire?dest=Canada&service=Visa%20guidance prefill the form and scroll to it.
  useEffect(() => {
    const apply = () => {
      const h = location.hash;
      if (!h.startsWith("#enquire")) return;
      const p = new URLSearchParams(h.split("?")[1] ?? "");
      setV((s) => ({ ...s, destination: p.get("dest") ?? s.destination, level: p.get("level") ?? s.level, intake: p.get("intake") ?? s.intake, service: p.get("service") ?? s.service }));
      document.getElementById("enquire")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    apply();
    addEventListener("hashchange", apply);
    return () => removeEventListener("hashchange", apply);
  }, []);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "sending" });
    try {
      const r = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "counselling", name: v.name, email: v.email, phone: v.phone, destination: v.destination, level: v.level, intake: v.intake, service: v.service, source: "home", website: v.website }),
      });
      const j = (await r.json().catch(() => ({}))) as { message?: string };
      if (!r.ok) return setStatus({ kind: "error", message: j.message ?? "Something went wrong. Please try again." });
      setStatus({ kind: "ok" });
      setV(EMPTY);
    } catch {
      setStatus({ kind: "error", message: "We could not reach the server. Check your connection and try again." });
    }
  }

  if (status.kind === "ok") {
    return (
      <div className="yg-enq-ok" role="status">
        <CheckCircle2 size={44} aria-hidden />
        <h3>Thank you. We have your details.</h3>
        <p>One of our education experts will contact you shortly to talk through your options.</p>
        <button type="button" className="yg-btn yg-btn-ghost-dark" onClick={() => setStatus({ kind: "idle" })}>
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form ref={ref} onSubmit={submit} className="yg-enq" aria-describedby="enq-note">
      <div className="yg-enq-grid">
        <label className="yg-in">
          <span>Full name</span>
          <input required minLength={2} maxLength={120} autoComplete="name" value={v.name} onChange={set("name")} placeholder="Your full name" />
        </label>
        <label className="yg-in">
          <span>Email address</span>
          <input required type="email" maxLength={190} autoComplete="email" inputMode="email" value={v.email} onChange={set("email")} placeholder="you@example.com" />
        </label>
        <label className="yg-in">
          <span>Phone number</span>
          <input required type="tel" autoComplete="tel" inputMode="tel" pattern="[+()\d\s\-]{7,20}" title="Enter a valid phone number" value={v.phone} onChange={set("phone")} placeholder="+91 98765 43210" />
        </label>
        <label className="yg-in">
          <span>Preferred study destination</span>
          <select required value={v.destination} onChange={set("destination")}>
            <option value="">Select a country</option>
            {DESTINATIONS.map((d) => (
              <option key={d.key}>{d.name}</option>
            ))}
            <option>Not sure yet</option>
          </select>
        </label>
        <label className="yg-in">
          <span>Intended study level</span>
          <select required value={v.level} onChange={set("level")}>
            <option value="">Select a level</option>
            {STUDY_LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
            {v.level && !STUDY_LEVELS.includes(v.level as never) && <option>{v.level}</option>}
          </select>
        </label>
        <label className="yg-in">
          <span>Preferred intake</span>
          <select required value={v.intake} onChange={set("intake")}>
            <option value="">Select an intake</option>
            {INTAKES.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </label>
      </div>
      {v.service ? (
        <p className="yg-enq-svc">
          Enquiring about: <b>{v.service}</b>{" "}
          <button type="button" onClick={() => setV((s) => ({ ...s, service: "" }))} aria-label="Clear topic">
            ×
          </button>
        </p>
      ) : null}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="yg-hp" value={v.website} onChange={set("website")} name="website" />
      <button type="submit" className="yg-btn yg-btn-primary yg-enq-go" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? (
          <>
            <Loader2 size={18} className="yg-spin" aria-hidden /> Sending…
          </>
        ) : (
          "Get Free Counselling"
        )}
      </button>
      {status.kind === "error" ? (
        <p className="yg-enq-err" role="alert">
          {status.message}
        </p>
      ) : null}
      <p id="enq-note" className="yg-enq-note">
        Free, no obligation. We use your details only to contact you about your enquiry.
      </p>
    </form>
  );
}
