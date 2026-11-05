"use client";

import { useEffect, useRef, useState } from "react";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** A countdown that can be started, stopped and reset. */
function Countdown({ seconds, label, onDone }: { seconds: number; label: string; onDone?: () => void }) {
  const [left, setLeft] = useState(seconds);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => setLeft((l) => (l <= 1 ? 0 : l - 1)), 1000);
    return () => clearInterval(t);
  }, [on]);
  useEffect(() => { if (on && left === 0) { setOn(false); onDone?.(); } }, [left, on, onDone]);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className={`font-mono text-[22px] font-bold ${left === 0 ? "text-red-600" : "text-ink"}`} role="timer" aria-label={label}>{fmt(left)}</span>
      <button type="button" onClick={() => setOn((v) => !v)} className="min-h-[44px] rounded-lg bg-ink px-4 text-[14px] font-semibold text-white hover:bg-orange-deep">{on ? "Pause" : left === seconds ? `Start ${label}` : "Resume"}</button>
      <button type="button" onClick={() => { setOn(false); setLeft(seconds); }} className="min-h-[44px] rounded-lg border border-black/[0.2] px-4 text-[14px] font-semibold hover:bg-cream-2">Reset</button>
    </div>
  );
}

/** Records your voice in this browser and plays it back. Nothing is uploaded. */
export function Recorder() {
  const [state, setState] = useState<"idle" | "rec" | "ready" | "denied" | "none">("idle");
  const [url, setUrl] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  async function start() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setState("none"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      chunks.current = [];
      r.ondataavailable = (e) => chunks.current.push(e.data);
      r.onstop = () => { stream.getTracks().forEach((t) => t.stop()); setUrl(URL.createObjectURL(new Blob(chunks.current, { type: r.mimeType || "audio/webm" }))); setState("ready"); };
      rec.current = r;
      r.start();
      setState("rec");
    } catch { setState("denied"); }
  }
  return (
    <div className="rounded-xl border border-black/[0.1] bg-cream-2 p-3">
      <div className="flex flex-wrap items-center gap-3">
        {state === "rec" ? <button type="button" onClick={() => rec.current?.stop()} className="min-h-[44px] rounded-lg bg-red-600 px-4 text-[14px] font-semibold text-white">Stop recording</button> : <button type="button" onClick={start} className="min-h-[44px] rounded-lg bg-ink px-4 text-[14px] font-semibold text-white hover:bg-orange-deep">{state === "ready" ? "Record again" : "Record my answer"}</button>}
        {state === "rec" ? <span className="text-[13.5px] font-semibold text-red-700" aria-live="polite">Recording…</span> : null}
        {state === "denied" ? <span className="text-[13.5px] text-ink-3">Microphone access was blocked. You can still practise out loud.</span> : null}
        {state === "none" ? <span className="text-[13.5px] text-ink-3">This browser cannot record audio. You can still practise out loud.</span> : null}
      </div>
      {url ? <audio controls src={url} className="mt-3 w-full" aria-label="Your recording" /> : null}
      <p className="mt-2 text-[12px] text-ink-4">Recordings stay on this device and are not uploaded.</p>
    </div>
  );
}

export function PrepTimer() { return <Countdown seconds={60} label="1-minute preparation" />; }
export function SpeakTimer() { return <Countdown seconds={120} label="2-minute talk" />; }
