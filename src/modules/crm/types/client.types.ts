export type ClientType = "company" | "individual";

export type Address = {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle?: string | null;
  email?: string | null;
  phone?: string | null;
  isPrimary: boolean;
};

export type ClientCounts = {
  contacts: number;
  quotations: number;
  invoices: number;
  orders: number;
  payments: number;
};

export type ClientSummary = {
  id: string;
  tenantId: string;
  code: string;
  clientType: ClientType;
  companyName: string;
  tradeName?: string | null;
  siret?: string | null;
  taxId?: string | null;
  sector?: string | null;
  isArchived: boolean;
  defaultCurrency?: string;
  billingAddress?: Address;
  contacts: Contact[];
  _count?: ClientCounts;
  createdAt?: string;
};

export type TransactionSummary = {
  id: string;
  number: string;
  status: string;
  issueDate: string;
  totalTtc: number | string;
  amountDue?: number | string;
};

export type PaymentSummary = {
  id: string;
  reference?: string | null;
  paymentDate: string;
  amount: number | string;
  paymentMethod?: string | null;
};

export type ClientDetail = ClientSummary & {
  shippingAddress?: Address | null;
  defaultPaymentTermId?: string | null;
  defaultDiscountPct?: number;
  creditLimit?: number | null;
  notes?: string | null;
  remindersDisabled?: boolean;
  remindersDisabledReason?: string | null;
  quotations?: TransactionSummary[];
  invoices?: TransactionSummary[];
  orders?: TransactionSummary[];
  payments?: PaymentSummary[];
  history?: {
    quotations: TransactionSummary[];
    invoices: TransactionSummary[];
    orders: TransactionSummary[];
    payments: PaymentSummary[];
    counts: ClientCounts;
  };
};

export type PaginatedClients = {
  items: ClientSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type DuplicateMatch = {
  id: string;
  code: string;
  companyName: string;
  siret?: string | null;
  taxId?: string | null;
  matchedOn: string[];
};

export type CheckDuplicatesResult = {
  hasDuplicates: boolean;
  duplicates: DuplicateMatch[];
};

export type CreateContactPayload = {
  firstName: string;
  lastName: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  isPrimary?: boolean;
};

export type CreateClientPayload = {
  clientType: ClientType;
  companyName: string;
  primaryContact: CreateContactPayload;
  billingAddress: string;
  tradeName?: string;
  siret?: string;
  taxId?: string;
  sector?: string;
  shippingAddress?: string;
  defaultCurrency?: string;
  defaultPaymentTermId?: string;
  defaultDiscountPct?: number;
  creditLimit?: number;
  notes?: string;
  remindersDisabled?: boolean;
  remindersDisabledReason?: string;
  confirmDuplicate?: boolean;
};

export type UpdateClientPayload = Partial<
  Omit<CreateClientPayload, "primaryContact" | "confirmDuplicate">
> & {
  isArchived?: boolean;
};

export class ClientDuplicateError extends Error {
  duplicates: DuplicateMatch[];

  constructor(duplicates: DuplicateMatch[]) {
    super("DUPLICATE_CLIENT");
    this.name = "ClientDuplicateError";
    this.duplicates = duplicates;
  }
}
