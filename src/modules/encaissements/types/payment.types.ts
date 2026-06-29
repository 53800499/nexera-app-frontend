export type PaymentMethod = "wire" | "check" | "cash" | "card" | "other";

export type AllocationMode = "fifo" | "manual";

export type OpenInvoiceForPayment = {
  id: string;
  number: string;
  status: string;
  issueDate: string;
  dueDate?: string | null;
  currency: string;
  totalTtc: number;
  amountPaid: number;
  amountDue: number;
};

export type ClientAdvance = {
  id: string;
  originalAmount: number;
  remainingAmount: number;
  currency: string;
};

export type ClientPaymentContext = {
  clientId: string;
  clientName: string;
  defaultCurrency: string;
  openInvoices: OpenInvoiceForPayment[];
  availableAdvances: ClientAdvance[];
  totalOpenDue: number;
};

export type PaymentImputation = {
  id: string;
  invoiceId: string;
  invoiceNumber?: string;
  amount: number;
};

export type PaymentSummary = {
  id: string;
  clientId: string;
  clientName?: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  exchangeGainLoss?: number | null;
  unallocatedAmount: number;
  paymentMethod: PaymentMethod;
  reference?: string | null;
  paymentDate: string;
  notes?: string | null;
  isCancelled: boolean;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  imputations: PaymentImputation[];
  advanceCreated?: ClientAdvance | null;
  createdAt: string;
};

export type PaymentDetail = PaymentSummary;

export type PaginatedPayments = {
  items: PaymentSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaymentImputationPayload = {
  invoiceId: string;
  amount: number;
};

export type CreatePaymentPayload = {
  clientId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  allocationMode: AllocationMode;
  currency?: string;
  exchangeRate?: number;
  paymentDate?: string;
  reference?: string;
  notes?: string;
  imputations?: PaymentImputationPayload[];
};

export type CancelPaymentPayload = {
  reason: string;
};
