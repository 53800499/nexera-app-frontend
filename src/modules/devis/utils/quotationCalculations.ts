import type { TaxRate } from "@/modules/catalogue/types/catalogue.types";
import { DEFAULT_CURRENCY } from "@/shared/constants/currencies";

export type LineInput = {
  quantity: number;
  unitPriceHt: number;
  discountPct: number;
  taxRateId: string;
};

export type QuotationTotals = {
  subtotalHt: number;
  globalDiscountPct: number;
  discountedSubtotalHt: number;
  taxByRate: { ratePct: number; baseHt: number; taxAmount: number }[];
  totalTax: number;
  totalTtc: number;
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function computeLineTotalHt(line: LineInput) {
  const gross = line.quantity * line.unitPriceHt;
  const discount = gross * (line.discountPct / 100);
  return roundMoney(gross - discount);
}

export function computeQuotationTotals(
  lines: LineInput[],
  globalDiscountPct: number,
  taxRates: TaxRate[],
): QuotationTotals {
  const rateMap = new Map(taxRates.map((rate) => [rate.id, rate.rate]));

  const lineTotals = lines.map((line) => ({
    line,
    lineTotalHt: computeLineTotalHt(line),
    ratePct: rateMap.get(line.taxRateId) ?? 0,
  }));

  const subtotalHt = roundMoney(
    lineTotals.reduce((sum, row) => sum + row.lineTotalHt, 0),
  );

  const discountedSubtotalHt = roundMoney(
    subtotalHt * (1 - globalDiscountPct / 100),
  );

  const discountRatio =
    subtotalHt > 0 ? discountedSubtotalHt / subtotalHt : 0;

  const taxBuckets = new Map<number, number>();

  for (const row of lineTotals) {
    const baseHt = roundMoney(row.lineTotalHt * discountRatio);
    const taxAmount = roundMoney(baseHt * (row.ratePct / 100));
    const current = taxBuckets.get(row.ratePct) ?? 0;
    taxBuckets.set(row.ratePct, roundMoney(current + taxAmount));
  }

  const taxByRate = [...taxBuckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([ratePct, taxAmount]) => ({
      ratePct,
      baseHt: roundMoney(
        lineTotals
          .filter((row) => row.ratePct === ratePct)
          .reduce((sum, row) => sum + roundMoney(row.lineTotalHt * discountRatio), 0),
      ),
      taxAmount,
    }));

  const totalTax = roundMoney(
    taxByRate.reduce((sum, bucket) => sum + bucket.taxAmount, 0),
  );

  return {
    subtotalHt,
    globalDiscountPct,
    discountedSubtotalHt,
    taxByRate,
    totalTax,
    totalTtc: roundMoney(discountedSubtotalHt + totalTax),
  };
}

export function formatMoney(
  value: number,
  currency: string = DEFAULT_CURRENCY,
  locale = "fr-FR",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(Number.isFinite(value) ? value : 0);
}
