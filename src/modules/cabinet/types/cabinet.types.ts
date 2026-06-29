export type LinkedCompany = {
  id: string;
  name: string;
  type: string;
  linkedAt?: string;
  permissions: string[];
};

export type AuthorizedCabinet = LinkedCompany;

export type GrantCabinetAccessPayload = {
  inviteCode: string;
  permissions?: string[];
};

export type UpdateCabinetPermissionsPayload = {
  permissions: string[];
};

export type CabinetInviteCodeResponse = {
  inviteCode: string;
};

export type CabinetInvoiceClientRef = {
  companyName: string;
};

export type CabinetInvoice = {
  id: string;
  number: string;
  status: string;
  invoiceType: string;
  issueDate: string;
  dueDate: string | null;
  currency: string;
  totalTtc: number;
  client: CabinetInvoiceClientRef;
};

export type PaginatedCabinetInvoices = {
  items: CabinetInvoice[];
  total: number;
  page: number;
  limit: number;
};
