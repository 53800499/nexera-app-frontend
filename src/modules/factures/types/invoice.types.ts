import type { CurrencyCode } from "@/shared/constants/currencies";

export type InvoiceStatus =
  | "draft"
  | "issued"
  | "sent"
  | "partial"
  | "paid"
  | "overdue"
  | "cancelled";

export type InvoiceType =
  | "standard"
  | "proforma"
  | "deposit"
  | "balance"
  | "credit_note";

export type PaymentMethod = "wire" | "check" | "cash" | "card" | "other";

export type InvoiceClientRef = {
  id: string;
  code: string;
  companyName: string;
};

export type InvoiceOrderRef = {
  id: string;
  number: string;
  status: string;
};

export type InvoiceQuotationRef = {
  id: string;
  number: string;
  status: string;
};

export type InvoiceOriginalRef = {
  id: string;
  number: string;
  status: string;
};

export type InvoicePaymentTermRef = {
  id: string;
  name: string;
  days: number;
  endOfMonth?: boolean;
};

export type InvoiceItemRef = {
  id: string;
  reference: string;
  name: string;
};

export type InvoiceLine = {
  id: string;
  position?: number;
  itemId?: string | null;
  description: string;
  quantity: number;
  unitPriceHt: number;
  discountPct: number;
  discountAmount?: number;
  taxRateId: string;
  lineTotalHt: number;
  taxAmount: number;
  lineTotalTtc: number;
  item?: InvoiceItemRef | null;
  taxRate?: { id: string; name: string; rate: number } | null;
};

export type InvoicePayment = {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference?: string | null;
  notes?: string | null;
};

export type InvoiceCreditNoteRef = {
  id: string;
  number: string;
  status: InvoiceStatus;
  totalTtc: number;
  issueDate: string;
};

export type InvoiceDepositSummary = {
  totalDepositsTtc: number;
  depositInvoiceIds: string[];
};

export type InvoiceSummary = {
  id: string;
  number: string;
  invoiceType: InvoiceType;
  status: InvoiceStatus;
  clientId: string;
  client?: InvoiceClientRef;
  orderId?: string | null;
  order?: InvoiceOrderRef | null;
  quotationId?: string | null;
  quotation?: InvoiceQuotationRef | null;
  originalInvoiceId?: string | null;
  originalInvoice?: InvoiceOriginalRef | null;
  issueDate: string;
  dueDate?: string | null;
  currency: CurrencyCode;
  exchangeRate?: number;
  subtotalHt?: number;
  discountPct?: number;
  totalTax?: number;
  totalTtc: number;
  amountDue: number;
  amountPaid: number;
  deposits?: InvoiceDepositSummary;
  createdAt?: string;
};

export type InvoiceDetail = InvoiceSummary & {
  paymentTermId?: string | null;
  paymentTerm?: InvoicePaymentTermRef | null;
  notes?: string | null;
  internalNotes?: string | null;
  lines: InvoiceLine[];
  payments: InvoicePayment[];
  creditNotes: InvoiceCreditNoteRef[];
};

export type PaginatedInvoices = {
  items: InvoiceSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type InvoiceLinePayload = {
  itemId?: string;
  description: string;
  quantity: number;
  unitPriceHt: number;
  discountPct?: number;
  discountAmount?: number;
  taxRateId: string;
};

export type CreateInvoicePayload = {
  clientId: string;
  contactId?: string;
  orderId?: string;
  quotationId?: string;
  invoiceType: InvoiceType;
  issueDate: string;
  dueDate?: string;
  currency?: CurrencyCode;
  exchangeRate?: number;
  paymentTermId?: string;
  discountPct?: number;
  discountAmount?: number;
  notes?: string;
  internalNotes?: string;
  lines: InvoiceLinePayload[];
};

export type UpdateInvoicePayload = {
  contactId?: string;
  invoiceType?: InvoiceType;
  issueDate?: string;
  dueDate?: string;
  currency?: CurrencyCode;
  exchangeRate?: number;
  paymentTermId?: string;
  discountPct?: number;
  discountAmount?: number;
  notes?: string;
  internalNotes?: string;
  lines?: InvoiceLinePayload[];
};

export type SendInvoicePayload = {
  recipientEmail?: string;
  message?: string;
};

export type CreateCreditNotePayload = {
  amountTtc?: number;
  lines?: InvoiceLinePayload[];
  notes?: string;
};

export type RecordInvoicePaymentPayload = {
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate?: string;
  reference?: string;
  notes?: string;
};
