import { describe, expect, it } from "vitest";
import { GERMANY, assurance, refundInr } from "./germany";
import { validate } from "./loan-help";

describe("Germany programme", () => {
  it("costs Rs 2.5 lakh and refunds 40% of it", () => {
    expect(GERMANY.feeInr).toBe(250000);
    expect(refundInr()).toBe(100000);
  });
  it("applies the assurance only above 75% and for a consistent performer", () => {
    expect(assurance({ test_score: null, consistent: null }).eligible).toBe(false);
    expect(assurance({ test_score: 75, consistent: 1 }).eligible).toBe(false); // "more than 75%"
    expect(assurance({ test_score: 80, consistent: 0 }).eligible).toBe(false);
    expect(assurance({ test_score: 80, consistent: null }).eligible).toBe(false);
    expect(assurance({ test_score: 75.5, consistent: 1 }).eligible).toBe(true);
  });
});

describe("loan help request", () => {
  const ok = { amount_inr: "2,000,000", phone: "+91 98765 43210", coapplicant: "parent_salaried", collateral: "no", country: "Germany", university: "TUM", intake: "Fall 2027", note: "" };
  it("accepts a complete request", () => {
    const [v, err] = validate(ok);
    expect(err).toBeNull();
    expect(v?.amount_inr).toBe(2000000);
  });
  it("rejects a tiny amount, a bad phone and missing choices", () => {
    expect(validate({ ...ok, amount_inr: "5000" })[1]).toMatch(/loan amount/i);
    expect(validate({ ...ok, phone: "abc" })[1]).toMatch(/phone/i);
    expect(validate({ ...ok, coapplicant: "" })[1]).toMatch(/co-applicant/i);
    expect(validate({ ...ok, collateral: "" })[1]).toMatch(/collateral/i);
  });
});
