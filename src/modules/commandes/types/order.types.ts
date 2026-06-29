import type { CurrencyCode } from "@/shared/constants/currencies";

export type OrderStatus =
  | "draft"
  | "confirmed"
  | "partially_paid"
  | "paid"
  | "cancelled";

export type OrderClientRef = {
  id: string;
  code: string;
  companyName: string;
};

export type OrderQuotationRef = {
  id: string;
  number: string;
  status: string;
};

export type OrderItemRef = {
  id: string;
  reference: string;
  name: string;
};

export type OrderLine = {
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
  item?: OrderItemRef | null;
  taxRate?: { id: string; name: string; rate: number } | null;
};

export type OrderInvoiceRef = {
  id: string;
  number: string;
  status: string;
  invoiceType: string;
  issueDate: string;
  totalTtc: number;
  amountPaid: number;
  amountDue: number;
};

export type OrderBillingSummary = {
  totalTtc: number;
  invoicedTtc: number;
  remainingToInvoice: number;
  billingProgressPct: number;
  isFullyBilled: boolean;
};

export type OrderSummary = {
  id: string;
  number: string;
  status: OrderStatus;
  clientId: string;
  client?: OrderClientRef;
  quotationId?: string | null;
  quotation?: OrderQuotationRef | null;
  issueDate: string;
  currency: CurrencyCode;
  subtotalHt: number;
  discountPct: number;
  totalTax: number;
  totalTtc: number;
  billing: OrderBillingSummary;
  createdAt?: string;
};

export type OrderDetail = OrderSummary & {
  lines: OrderLine[];
  invoices: OrderInvoiceRef[];
};

export type PaginatedOrders = {
  items: OrderSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type OrderLinePayload = {
  itemId?: string;
  description: string;
  quantity: number;
  unitPriceHt: number;
  discountPct?: number;
  discountAmount?: number;
  taxRateId: string;
};

export type CreateOrderPayload = {
  clientId: string;
  quotationId?: string;
  issueDate: string;
  currency?: CurrencyCode;
  discountPct?: number;
  lines: OrderLinePayload[];
};

export type UpdateOrderPayload = {
  issueDate?: string;
  currency?: CurrencyCode;
  discountPct?: number;
  lines?: OrderLinePayload[];
};

export type CreateOrderInvoicePayload = {
  amountTtc?: number;
  billingPct?: number;
  invoiceType?: "standard" | "deposit" | "balance" | "proforma";
  dueDate?: string;
};

export type CreateOrderInvoiceResult = {
  invoice: { id: string; number: string };
  order: OrderDetail;
};
