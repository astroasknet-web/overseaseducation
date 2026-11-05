"use client";
import { useEffect } from "react";

const DEST = [
  { name: "USA", lat: 38.9, lon: -77.0 }, { name: "UK", lat: 51.5, lon: -0.1 }, { name: "Canada", lat: 45.4, lon: -75.7 }, { name: "Germany", lat: 52.5, lon: 13.4 },
  { name: "Australia", lat: -35.3, lon: 149.1 }, { name: "France", lat: 48.9, lon: 2.35 }, { name: "UAE", lat: 24.5, lon: 54.4 },
];
const STAGES = ["Discover", "Consult", "Shortlist", "Apply", "Get admitted", "Fly"];

function load(src: string): Promise<void> {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[data-yg-src="${src}"]`)) return res();
    const s = document.createElement("script");
    s.src = src; s.async = false; s.setAttribute("data-yg-src", src);
    s.onload = () => res(); s.onerror = () => rej(new Error(src));
    document.body.appendChild(s);
  });
}

/** The interactive globe: a wireframe that fills in with oceans, land and routes from India to the study destinations as the journey progresses. */
export default function GlobeHero() {
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        await load("/yugty/world-data.js");
        await load("/yugty/globe.js");
        if (dead) return;
        const cv = document.getElementById("yg-globe");
        if (cv) cv.removeAttribute("data-started");
        await load("/yugty/globe-runner.js").catch(() => undefined);
        // The runner is idempotent; if it was already loaded (client navigation), start it again.
        if (!dead && document.getElementById("yg-globe")?.getAttribute("data-started") !== "1") {
          const s = document.createElement("script"); s.src = "/yugty/globe-runner.js?r=" + Date.now(); document.body.appendChild(s);
        }
      } catch { /* the page is fully usable without the globe */ }
    })();
    return () => { dead = true; };
  }, []);

  return (
    <div className="yg-globe" role="group" aria-label="Interactive globe showing study routes from India to seven destinations">
      <canvas id="yg-globe" data-dest={JSON.stringify(DEST)} aria-hidden />
      <ul className="yg-dest-chips" aria-label="Highlight a destination on the globe">
        {DEST.map((d) => (
          <li key={d.name}><button type="button" data-dest-chip data-name={d.name}>{d.name}</button></li>
        ))}
      </ul>
      <div className="yg-stage" aria-live="polite">
        <span className="yg-stage-k">Your journey</span>
        <b data-yg-stage>Discover</b>
        <span className="yg-dots">{STAGES.map((s, i) => <button key={s} type="button" data-yg-dot aria-label={`Show stage ${i + 1}: ${s}`} className={i === 0 ? "on" : ""} />)}</span>
      </div>
    </div>
  );
}
