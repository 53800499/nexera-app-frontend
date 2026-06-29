import type { CurrencyCode } from "@/shared/constants/currencies";

/** Statuts alignés sur le backend (minuscules). */
export type QuotationStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "declined"
  | "expired"
  | "converted";

export type QuotationClientRef = {
  id: string;
  code: string;
  companyName: string;
};

export type QuotationPaymentTermRef = {
  id: string;
  name: string;
  days: number;
  endOfMonth?: boolean;
};

export type QuotationItemRef = {
  id: string;
  reference: string;
  name: string;
};

export type QuotationLine = {
  id: string;
  position?: number;
  lineNumber?: number;
  itemId?: string | null;
  description: string;
  quantity: number;
  unitPriceHt: number;
  discountPct: number;
  discountAmount?: number;
  taxRateId: string;
  taxRatePct?: number;
  lineTotalHt: number;
  taxAmount: number;
  lineTotalTtc: number;
  item?: QuotationItemRef | null;
  taxRate?: { id: string; name: string; rate: number } | null;
};

export type QuotationSummary = {
  id: string;
  tenantId?: string;
  number: string;
  status: QuotationStatus;
  clientId: string;
  client?: QuotationClientRef;
  issueDate: string;
  expiryDate?: string | null;
  currency: CurrencyCode;
  subtotalHt: number;
  discountPct: number;
  discountAmount?: number;
  totalTax: number;
  totalTtc: number;
  paymentTermId?: string | null;
  paymentTerm?: QuotationPaymentTermRef | null;
  createdAt?: string;
};

export type QuotationDetail = QuotationSummary & {
  notes?: string | null;
  internalNotes?: string | null;
  lines: QuotationLine[];
  convertedToOrderId?: string | null;
  convertedToInvoiceId?: string | null;
};

export type PaginatedQuotations = {
  items: QuotationSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaymentTerm = {
  id: string;
  name: string;
  days: number;
  endOfMonth: boolean;
  isDefault: boolean;
};

/** Aligné sur QuotationLineDto backend. */
export type QuotationLinePayload = {
  itemId?: string;
  description: string;
  quantity: number;
  unitPriceHt: number;
  discountPct?: number;
  discountAmount?: number;
  taxRateId: string;
};

/** Aligné sur create-quotation.dto.ts backend. */
export type CreateQuotationPayload = {
  clientId: string;
  issueDate: string;
  expiryDate?: string;
  currency?: CurrencyCode;
  discountPct?: number;
  paymentTermId?: string;
  notes?: string;
  internalNotes?: string;
  lines: QuotationLinePayload[];
};

/** Aligné sur update-quotation.dto.ts backend. */
export type UpdateQuotationPayload = {
  issueDate?: string;
  expiryDate?: string;
  currency?: CurrencyCode;
  discountPct?: number;
  paymentTermId?: string;
  notes?: string;
  internalNotes?: string;
  lines: QuotationLinePayload[];
};

export type ChangeQuotationStatusPayload = {
  status: "viewed" | "accepted" | "declined";
};

export type SendQuotationPayload = {
  recipientEmail?: string;
  message?: string;
};

export type SendQuotationResult = {
  quotation: QuotationDetail;
  message: string;
  recipientEmail?: string | null;
  pdfUrl?: string;
  downloadUrl?: string;
};

export type ConvertQuotationPayload = {
  target: "order" | "invoice";
};

export type ConvertQuotationResult = {
  target: "order" | "invoice";
  targetId: string;
};
