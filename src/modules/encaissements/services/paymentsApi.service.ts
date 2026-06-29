import { authorizedFetch } from "@/shared/http/authorizedFetch";
import type {
  CancelPaymentPayload,
  ClientPaymentContext,
  CreatePaymentPayload,
  PaginatedPayments,
  PaymentDetail,
} from "../types/payment.types";

type ListParams = {
  page: number;
  limit?: number;
  clientId?: string;
  includeCancelled?: boolean;
};

export const paymentsApi = {
  list: (params: ListParams) => {
    const search = new URLSearchParams();
    search.set("page", String(params.page));
    if (params.limit) search.set("limit", String(params.limit));
    if (params.clientId) search.set("clientId", params.clientId);
    if (params.includeCancelled) search.set("includeCancelled", "true");
    return authorizedFetch<PaginatedPayments>(`/payments?${search.toString()}`);
  },

  byId: (id: string) => authorizedFetch<PaymentDetail>(`/payments/${id}`),

  clientContext: (clientId: string) =>
    authorizedFetch<ClientPaymentContext>(
      `/payments/clients/${clientId}/context`,
    ),

  create: (payload: CreatePaymentPayload) =>
    authorizedFetch<PaymentDetail>("/payments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  cancel: (id: string, payload: CancelPaymentPayload) =>
    authorizedFetch<PaymentDetail>(`/payments/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
