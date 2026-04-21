/**
 * Finance + scheduling helpers for the CB module.
 * All currency-aware; conversions are NOT auto — amounts kept in their entry currency.
 */

export type Currency = "EUR" | "USD" | "GBP" | "MAD" | "TND" | "AED" | "SAR" | "CHF";
export const CURRENCIES: Currency[] = ["EUR", "USD", "GBP", "MAD", "TND", "AED", "SAR", "CHF"];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: "€", USD: "$", GBP: "£", MAD: "DH", TND: "DT", AED: "AED", SAR: "SR", CHF: "CHF",
};

export function fmtMoney(amount: number | undefined | null, currency: Currency = "EUR"): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) return "—";
  const sym = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${sym} ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtPercent(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

/** Detect overlapping date ranges (inclusive) — used for scheduling conflicts. */
export function rangesOverlap(aStart?: string, aEnd?: string, bStart?: string, bEnd?: string): boolean {
  if (!aStart || !bStart) return false;
  const a1 = new Date(aStart).getTime();
  const a2 = new Date(aEnd ?? aStart).getTime();
  const b1 = new Date(bStart).getTime();
  const b2 = new Date(bEnd ?? bStart).getTime();
  return a1 <= b2 && b1 <= a2;
}

export function listDatesInRange(start?: string, end?: string): string[] {
  if (!start) return [];
  const out: string[] = [];
  const s = new Date(start);
  const e = new Date(end ?? start);
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export interface QuotationLine {
  label: string;
  mandays: number;
  sellRate: number;          // per manday (sell)
  costRate: number;          // per manday (cost / auditor fee)
}
export interface QuotationInputs {
  lines: QuotationLine[];
  accreditationCost?: number;     // what we pay accreditation body
  accreditationSell?: number;     // what we re-bill client
  travelCost?: number;
  travelSell?: number;
  otherIndirectCost?: number;     // user-entered indirect costs
  overheadAllocation?: number;    // allocated overhead (computed or manual)
  discount?: number;              // % discount on sell side, 0–1
}
export interface QuotationOutputs {
  totalSell: number;
  totalDirectCost: number;
  totalIndirectCost: number;
  totalCost: number;
  grossMargin: number;            // totalSell − totalDirectCost
  netProfit: number;              // totalSell − totalCost
  marginPct: number;              // grossMargin / totalSell
  netMarginPct: number;           // netProfit / totalSell
}

export function computeQuotation(q: QuotationInputs): QuotationOutputs {
  const lineSell = q.lines.reduce((s, l) => s + (l.mandays || 0) * (l.sellRate || 0), 0);
  const lineCost = q.lines.reduce((s, l) => s + (l.mandays || 0) * (l.costRate || 0), 0);
  const accSell = q.accreditationSell ?? 0;
  const accCost = q.accreditationCost ?? 0;
  const travelSell = q.travelSell ?? 0;
  const travelCost = q.travelCost ?? 0;

  const grossSell = lineSell + accSell + travelSell;
  const discount = q.discount ?? 0;
  const totalSell = grossSell * (1 - discount);

  const totalDirectCost = lineCost + accCost + travelCost;
  const totalIndirectCost = (q.overheadAllocation ?? 0) + (q.otherIndirectCost ?? 0);
  const totalCost = totalDirectCost + totalIndirectCost;

  const grossMargin = totalSell - totalDirectCost;
  const netProfit = totalSell - totalCost;
  return {
    totalSell, totalDirectCost, totalIndirectCost, totalCost,
    grossMargin, netProfit,
    marginPct: totalSell > 0 ? grossMargin / totalSell : 0,
    netMarginPct: totalSell > 0 ? netProfit / totalSell : 0,
  };
}

/** Roll up overheads (monthly recurring × 12 + annual) → annual total. */
export function annualOverheadTotal(overheads: any[]): number {
  return overheads.reduce((s, o) => {
    const amt = Number(o.amount) || 0;
    return s + (o.frequency === "monthly" ? amt * 12 : amt);
  }, 0);
}
