import { Check, Minus } from "lucide-react";
import { ABROAD_PACKAGES, MATRIX, priceLabel } from "@/lib/abroad/packages";
import "./packages.css";

/** Every service against every level, so a family can see exactly where one package ends and the next begins. */
export default function PackageMatrix({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <div className={`ap-matrix-wrap ${tone === "light" ? "ap-matrix-light" : ""}`}>
      <table className="ap-matrix">
        <caption className="sr-only">What each overseas education package includes</caption>
        <thead>
          <tr>
            <th scope="col">Service</th>
            {ABROAD_PACKAGES.map((p) => <th key={p.key} scope="col" style={{ color: p.accent }}>{p.name}<small>{priceLabel(p)}</small></th>)}
          </tr>
        </thead>
        <tbody>
          {MATRIX.map((r) => (
            <tr key={r.label}>
              <th scope="row" style={{ fontWeight: 500 }}>{r.label}</th>
              {ABROAD_PACKAGES.map((p) => {
                const has = p.level >= r.level;
                const text = r.values?.[p.level];
                return (
                  <td key={p.key} style={has ? { color: p.accent } : undefined}>
                    {!has ? <><Minus className="ap-dash h-4 w-4" aria-hidden /><span className="sr-only">Not included</span></>
                      : text ? <b style={{ color: "#fff", fontWeight: 600 }}>{text}</b>
                      : <><Check className="h-5 w-5" aria-hidden /><span className="sr-only">Included</span></>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
