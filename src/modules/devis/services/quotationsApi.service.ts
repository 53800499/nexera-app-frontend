import { env } from "@/shared/config/env";
import { authorizedFetch } from "@/shared/http/authorizedFetch";
import { tokenStorage } from "@/modules/auth/services/tokenStorage.service";
import type {
  ChangeQuotationStatusPayload,
  ConvertQuotationPayload,
  ConvertQuotationResult,
  CreateQuotationPayload,
  PaginatedQuotations,
  QuotationDetail,
  SendQuotationPayload,
  SendQuotationResult,
  UpdateQuotationPayload,
} from "../types/quotation.types";

type ListParams = {
  page: number;
  limit?: number;
  q?: string;
  status?: string;
  clientId?: string;
};

function authHeaders(): Record<string, string> {
  const token = tokenStorage.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const quotationsApi = {
  list: (params: ListParams) => {
    const search = new URLSearchParams();
    search.set("page", String(params.page));
    if (params.limit) search.set("limit", String(params.limit));
    if (params.q) search.set("q", params.q);
    if (params.status) search.set("status", params.status);
    if (params.clientId) search.set("clientId", params.clientId);
    return authorizedFetch<PaginatedQuotations>(`/quotations?${search.toString()}`);
  },

  byId: (id: string) => authorizedFetch<QuotationDetail>(`/quotations/${id}`),

  create: (payload: CreateQuotationPayload) =>
    authorizedFetch<QuotationDetail>("/quotations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateQuotationPayload) =>
    authorizedFetch<QuotationDetail>(`/quotations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  remove: (id: string) =>
    authorizedFetch<{ message: string }>(`/quotations/${id}`, {
      method: "DELETE",
    }),

  send: (id: string, payload: SendQuotationPayload = {}) =>
    authorizedFetch<SendQuotationResult>(`/quotations/${id}/send`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  changeStatus: (id: string, payload: ChangeQuotationStatusPayload) =>
    authorizedFetch<QuotationDetail>(`/quotations/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  convert: (id: string, payload: ConvertQuotationPayload) =>
    authorizedFetch<ConvertQuotationResult>(`/quotations/${id}/convert`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  pdfUrl: (id: string) => `${env.apiBaseUrl}/quotations/${id}/pdf`,

  previewUrl: (id: string) => `${env.apiBaseUrl}/quotations/${id}/preview`,

  async openAuthenticatedAsset(url: string) {
    const response = await fetch(url, { headers: authHeaders() });
    if (!response.ok) throw new Error("Impossible d'ouvrir le document");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    window.open(objectUrl, "_blank");
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  },
};
