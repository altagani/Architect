"use client";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils/currency";

// Standard reducing-balance EMI formula. Interest rate + tenure options are
// props so admin can change them per store (site_settings.checkout could
// carry a `emi_plans` array) without touching this component.
function calculateEmi(principal: number, annualRatePct: number, months: number) {
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

const DEFAULT_TENURES = [3, 6, 9, 12, 18, 24];

export function EmiCalculator({
  price,
  currencySymbol,
  annualRatePct = 14,
  tenures = DEFAULT_TENURES,
}: {
  price: number;
  currencySymbol: string;
  annualRatePct?: number;
  tenures?: number[];
}) {
  const [months, setMonths] = useState(tenures[Math.floor(tenures.length / 2)]);
  const emi = useMemo(() => calculateEmi(price, annualRatePct, months), [price, annualRatePct, months]);

  return (
    <div className="border border-border rounded-theme p-4 bg-surface space-y-3">
      <p className="text-sm font-medium">EMI starting at {formatCurrency(emi, currencySymbol)}/mo</p>
      <div className="flex flex-wrap gap-2">
        {tenures.map((t) => (
          <button
            key={t}
            onClick={() => setMonths(t)}
            className={`px-3 py-1.5 text-xs rounded-theme border transition-colors ${
              months === t ? "bg-primary text-background border-primary" : "border-border hover:bg-background"
            }`}
          >
            {t} mo
          </button>
        ))}
      </div>
      <p className="text-xs text-muted">
        Indicative estimate at {annualRatePct}% p.a. reducing balance. Final rate depends on your card/lender.
      </p>
    </div>
  );
}
