import { env } from "@/shared/config/env";
import { authorizedFetch } from "@/shared/http/authorizedFetch";
import { tokenStorage } from "@/modules/auth/services/tokenStorage.service";
import type {
  CreateCreditNotePayload,
  CreateInvoicePayload,
  InvoiceDetail,
  PaginatedInvoices,
  RecordInvoicePaymentPayload,
  SendInvoicePayload,
  UpdateInvoicePayload,
} from "../types/invoice.types";

type ListParams = {
  page: number;
  limit?: number;
  q?: string;
  status?: string;
  invoiceType?: string;
  clientId?: string;
};

function authHeaders(): Record<string, string> {
  const token = tokenStorage.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const invoicesApi = {
  list: (params: ListParams) => {
    const search = new URLSearchParams();
    search.set("page", String(params.page));
    if (params.limit) search.set("limit", String(params.limit));
    if (params.q) search.set("q", params.q);
    if (params.status) search.set("status", params.status);
    if (params.invoiceType) search.set("invoiceType", params.invoiceType);
    if (params.clientId) search.set("clientId", params.clientId);
    return authorizedFetch<PaginatedInvoices>(`/invoices?${search.toString()}`);
  },

  byId: (id: string) => authorizedFetch<InvoiceDetail>(`/invoices/${id}`),

  create: (payload: CreateInvoicePayload) =>
    authorizedFetch<InvoiceDetail>("/invoices", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateInvoicePayload) =>
    authorizedFetch<InvoiceDetail>(`/invoices/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  remove: (id: string) =>
    authorizedFetch<{ message: string }>(`/invoices/${id}`, {
      method: "DELETE",
    }),

  issue: (id: string) =>
    authorizedFetch<InvoiceDetail>(`/invoices/${id}/issue`, {
      method: "POST",
      body: JSON.stringify({}),
    }),

  send: (id: string, payload: SendInvoicePayload = {}) =>
    authorizedFetch<InvoiceDetail>(`/invoices/${id}/send`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createCreditNote: (id: string, payload: CreateCreditNotePayload = {}) =>
    authorizedFetch<InvoiceDetail>(`/invoices/${id}/credit-note`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  recordPayment: (id: string, payload: RecordInvoicePaymentPayload) =>
    authorizedFetch<InvoiceDetail>(`/invoices/${id}/payments`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  pdfUrl: (id: string) => `${env.apiBaseUrl}/invoices/${id}/pdf`,

  async openAuthenticatedAsset(url: string) {
    const response = await fetch(url, { headers: authHeaders() });
    if (!response.ok) throw new Error("Impossible d'ouvrir le document");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    window.open(objectUrl, "_blank");
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  },
};
