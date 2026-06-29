import { authorizedFetch } from "@/shared/http/authorizedFetch";
import type {
  CreateOrderInvoicePayload,
  CreateOrderInvoiceResult,
  CreateOrderPayload,
  OrderDetail,
  PaginatedOrders,
  UpdateOrderPayload,
} from "../types/order.types";

type ListParams = {
  page: number;
  limit?: number;
  q?: string;
  status?: string;
  clientId?: string;
};

export const ordersApi = {
  list: (params: ListParams) => {
    const search = new URLSearchParams();
    search.set("page", String(params.page));
    if (params.limit) search.set("limit", String(params.limit));
    if (params.q) search.set("q", params.q);
    if (params.status) search.set("status", params.status);
    if (params.clientId) search.set("clientId", params.clientId);
    return authorizedFetch<PaginatedOrders>(`/orders?${search.toString()}`);
  },

  byId: (id: string) => authorizedFetch<OrderDetail>(`/orders/${id}`),

  create: (payload: CreateOrderPayload) =>
    authorizedFetch<OrderDetail>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateOrderPayload) =>
    authorizedFetch<OrderDetail>(`/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  remove: (id: string) =>
    authorizedFetch<{ message: string; orderId: string }>(`/orders/${id}`, {
      method: "DELETE",
    }),

  confirm: (id: string) =>
    authorizedFetch<OrderDetail>(`/orders/${id}/confirm`, {
      method: "POST",
      body: JSON.stringify({}),
    }),

  cancel: (id: string) =>
    authorizedFetch<OrderDetail>(`/orders/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({}),
    }),

  createInvoice: (id: string, payload: CreateOrderInvoicePayload = {}) =>
    authorizedFetch<CreateOrderInvoiceResult>(`/orders/${id}/invoices`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
