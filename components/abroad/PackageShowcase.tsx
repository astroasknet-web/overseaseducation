"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Plane, Sparkles } from "lucide-react";
import { ABROAD_PACKAGES, ABROAD_STAGES, PACKAGE_DISCLAIMER, cumulativeItems, packageByKey, priceLabel, type AbroadPackage } from "@/lib/abroad/packages";
import "./packages.css";

export interface PackageCta { href: string; label: string; quote: boolean }

/**
 * Overseas education packages, as a journey: a flight path across five stages, five levels that each reach further along it, and one detail panel for
 * the level you pick. Built to look different from the plan cards on purpose, since these are services from people, not an app subscription.
 * Prices, items and stages all come from lib/abroad/packages.ts; the buttons come from the page that places it (buy, quote, or sign in first).
 */
export default function PackageShowcase({ ctas, owned = [], initial = "application-pro", variant = "page", headingLevel = 3 }: { ctas: Record<string, PackageCta>; owned?: string[]; initial?: AbroadPackage["key"]; variant?: "home" | "page" | "public"; headingLevel?: 2 | 3 }) {
  const [key, setKey] = useState<AbroadPackage["key"]>(initial);
  const p = packageByKey(key)!;
  const cta = ctas[p.key];
  const H = headingLevel === 2 ? "h2" : "h3";
  const total = cumulativeItems(p);
  const own = owned.includes(p.key);

  return (
    <div className={`ap ap-${variant}`}>
      <ol className="ap-rail" aria-label="The five stages of the journey">
        {ABROAD_STAGES.map((s, i) => (
          <li key={s} className={i < p.reaches ? "ap-on" : ""} style={{ ["--c" as string]: p.accent }}>
            <span className="ap-node" aria-hidden>{i === p.reaches - 1 ? <Plane className="h-4 w-4" /> : i < p.reaches ? <Check className="h-4 w-4" /> : i + 1}</span>
            <span className="ap-stage">{s}</span>
            <span className="sr-only">{i < p.reaches ? " (covered by this package)" : " (not covered by this package)"}</span>
          </li>
        ))}
      </ol>

      <div role="radiogroup" aria-label="Choose a package" className="ap-steps">
        {ABROAD_PACKAGES.map((x) => {
          const on = x.key === key;
          return (
            <button key={x.key} type="button" role="radio" aria-checked={on} onClick={() => setKey(x.key)} className={`ap-step ${on ? "ap-step-on" : ""}`}
              style={{ ["--c" as string]: x.accent, ["--c2" as string]: x.accent2, ["--lv" as string]: x.level }}>
              <span className="ap-step-lv">Level {x.level}</span>
              <span className="ap-step-name">{x.name}</span>
              <span className="ap-step-price">{priceLabel(x)}</span>
              <span className="ap-step-bar" aria-hidden><i style={{ width: `${(x.level / 5) * 100}%` }} /></span>
              {owned.includes(x.key) ? <span className="ap-step-own">Yours</span> : null}
            </button>
          );
        })}
      </div>

      <article key={p.key} className="ap-panel ap-in" style={{ ["--c" as string]: p.accent, ["--c2" as string]: p.accent2 }} aria-live="polite">
        <span aria-hidden className="ap-panel-glow" />
        <div className="ap-panel-head">
          <div>
            <p className="ap-kicker"><Sparkles className="h-4 w-4" aria-hidden />Level {p.level} of 5</p>
            <H className="ap-title">{p.name}</H>
            <p className="ap-tag">{p.tagline}</p>
            <p className="ap-target"><b>Best for:</b> {p.target}</p>
          </div>
          <div className="ap-buy">
            <p className="ap-price">{priceLabel(p)}</p>
            <p className="ap-price-note">One-time fee, paid online</p>
            {own ? <p className="ap-own">You already have this package</p> : (
              <Link href={cta.href} className="ap-cta">{cta.label}<ArrowRight className="h-4 w-4" aria-hidden /></Link>
            )}
          </div>
        </div>

        {p.builds ? (
          <button type="button" className="ap-builds" onClick={() => setKey(ABROAD_PACKAGES[p.level - 2].key)}>
            <Check className="h-4 w-4 shrink-0" aria-hidden /><span>Everything in <b>{p.builds}</b>, plus</span>
          </button>
        ) : null}

        <div className={`ap-groups ${p.adds.length > 2 ? "ap-groups-2" : ""}`}>
          {p.adds.map((g) => (
            <section key={g.title} className="ap-group">
              <h4>{g.title}</h4>
              <ul>{g.items.map((it) => <li key={it}><Check className="h-4 w-4" aria-hidden /><span>{it}</span></li>)}</ul>
            </section>
          ))}
        </div>

        <p className="ap-total">{total} services in total across levels 1 to {p.level}, covering {p.reaches} of the 5 stages.</p>
      </article>

      <p className="ap-fine">{PACKAGE_DISCLAIMER}</p>
    </div>
  );
}
