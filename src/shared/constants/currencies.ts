import { z } from "zod";

/** Codes ISO 4217 supportés par NEXERA (select global). */
export const CURRENCY_CODES = {
  EUR: "EUR",
  USD: "USD",
  XOF: "XOF",
  XAF: "XAF",
  GBP: "GBP",
  CHF: "CHF",
  CAD: "CAD",
  MAD: "MAD",
} as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[keyof typeof CURRENCY_CODES];

export const DEFAULT_CURRENCY: CurrencyCode = CURRENCY_CODES.XOF;

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  EUR: "Euro",
  USD: "Dollar américain",
  XOF: "Franc CFA (BCEAO)",
  XAF: "Franc CFA (BEAC)",
  GBP: "Livre sterling",
  CHF: "Franc suisse",
  CAD: "Dollar canadien",
  MAD: "Dirham marocain",
};

export const CURRENCY_OPTIONS = (
  Object.entries(CURRENCY_LABELS) as [CurrencyCode, string][]
).map(([code, name]) => ({
  value: code,
  label: `${code} — ${name}`,
}));

const currencyCodeList = Object.values(CURRENCY_CODES) as [
  CurrencyCode,
  ...CurrencyCode[],
];

export const currencySchema = z.enum(currencyCodeList, {
  message: "Devise invalide",
});

export function isCurrencyCode(value: string): value is CurrencyCode {
  return currencyCodeList.includes(value as CurrencyCode);
}

export function formatCurrencyLabel(code: string) {
  if (isCurrencyCode(code)) {
    return CURRENCY_OPTIONS.find((option) => option.value === code)?.label ?? code;
  }
  return code;
}
