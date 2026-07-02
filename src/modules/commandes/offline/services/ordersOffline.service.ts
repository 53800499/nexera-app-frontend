import { DEFAULT_CURRENCY } from "@/shared/constants/currencies";
import { isOfflineError } from "@/shared/core/OfflineError";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { withTimeout } from "@/shared/lib/withTimeout";
import { crmOfflineRepository } from "@/modules/crm/offline/services/crmOfflineRepository";
import { quotationsOfflineRepository } from "@/modules/devis/offline/services/quotationsOfflineRepository";
import { ordersApi } from "../../services/ordersApi.service";
import type {
  CreateOrderInvoicePayload,
  CreateOrderInvoiceResult,
  CreateOrderPayload,
  OrderBillingSummary,
  OrderDetail,
  OrderLine,
  OrderLinePayload,
  PaginatedOrders,
  UpdateOrderPayload,
} from "../../types/order.types";
import {
  clearOrdersOfflineIfOnline,
  setOrdersOfflineMode,
} from "../utils/ordersOfflineState";
import { ordersOfflineRepository } from "./ordersOfflineRepository";
import { ordersSyncQueue } from "./ordersSyncQueue.service";
import { createLocalId } from "../types/offline.types";
import { useOrdersSyncStore } from "../store/ordersSyncStore";

const API_READ_TIMEOUT_MS = 8_000;

const OFFLINE_ACTION_ERROR =
  "Cette action nécessite une connexion réseau. Réessayez une fois en ligne.";

function isOfflineMode() {
  if (typeof window === "undefined") return false;
  if (!isBrowserOnline()) return true;
  return useOrdersSyncStore.getState().isOffline;
}

function setOrdersOffline(offline: boolean) {
  setOrdersOfflineMode(offline);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function emptyBilling(totalTtc: number): OrderBillingSummary {
  return {
    totalTtc,
    invoicedTtc: 0,
    remainingToInvoice: totalTtc,
    billingProgressPct: 0,
    isFullyBilled: false,
  };
}

function buildLinesFromPayload(lines: OrderLinePayload[]): OrderLine[] {
  return lines.map((line, index) => {
    const lineTotalHt = roundMoney(
      line.quantity * line.unitPriceHt * (1 - (line.discountPct ?? 0) / 100),
    );
    return {
      id: createLocalId(),
      position: index + 1,
      itemId: line.itemId ?? null,
      description: line.description,
      quantity: line.quantity,
      unitPriceHt: line.unitPriceHt,
      discountPct: line.discountPct ?? 0,
      discountAmount: line.discountAmount,
      taxRateId: line.taxRateId,
      lineTotalHt,
      taxAmount: 0,
      lineTotalTtc: lineTotalHt,
      item: null,
      taxRate: null,
    };
  });
}

async function buildOptimisticOrder(
  payload: CreateOrderPayload,
  localId: string,
): Promise<OrderDetail> {
  const client = await crmOfflineRepository.getClient(payload.clientId);
  const quotation = payload.quotationId
    ? await quotationsOfflineRepository.getQuotation(payload.quotationId)
    : null;
  const lines = buildLinesFromPayload(payload.lines);
  const subtotalHt = roundMoney(
    lines.reduce((sum, line) => sum + line.lineTotalHt, 0),
  );
  const discountPct = payload.discountPct ?? 0;
  const totalTtc = roundMoney(subtotalHt * (1 - discountPct / 100));

  return {
    id: localId,
    number: `BC-LOCAL-${localId.slice(-6).toUpperCase()}`,
    status: "draft",
    clientId: payload.clientId,
    client: client
      ? { id: client.id, code: client.code, companyName: client.companyName }
      : {
          id: payload.clientId,
          code: "LOCAL",
          companyName: "Client (local)",
        },
    quotationId: payload.quotationId ?? null,
    quotation: quotation
      ? { id: quotation.id, number: quotation.number, status: quotation.status }
      : null,
    issueDate: payload.issueDate,
    currency: payload.currency ?? DEFAULT_CURRENCY,
    subtotalHt,
    discountPct,
    totalTax: 0,
    totalTtc,
    billing: emptyBilling(totalTtc),
    lines,
    invoices: [],
    createdAt: new Date().toISOString(),
  };
}

function mergeUpdatePayload(
  existing: OrderDetail,
  payload: UpdateOrderPayload,
): OrderDetail {
  const lines = payload.lines
    ? buildLinesFromPayload(payload.lines)
    : existing.lines;
  const subtotalHt = roundMoney(
    lines.reduce((sum, line) => sum + line.lineTotalHt, 0),
  );
  const discountPct = payload.discountPct ?? existing.discountPct;
  const totalTtc = roundMoney(subtotalHt * (1 - discountPct / 100));

  return {
    ...existing,
    issueDate: payload.issueDate ?? existing.issueDate,
    currency: payload.currency ?? existing.currency,
    discountPct,
    subtotalHt,
    totalTax: existing.totalTax,
    totalTtc,
    billing: {
      ...existing.billing,
      totalTtc,
      remainingToInvoice: Math.max(0, totalTtc - existing.billing.invoicedTtc),
    },
    lines,
  };
}

async function cachePaginatedOrders(data: PaginatedOrders) {
  await Promise.all(
    data.items.map((summary) =>
      ordersOfflineRepository.upsertOrder(
        { ...summary, lines: [], invoices: [] },
        "synced",
      ),
    ),
  );
}

async function readWithOfflineFallback<T>(
  onlineReader: () => Promise<T>,
  offlineReader: () => Promise<T>,
): Promise<T> {
  const offlineData = await offlineReader();

  if (isOfflineMode()) {
    return offlineData;
  }

  try {
    const data = await withTimeout(onlineReader(), API_READ_TIMEOUT_MS);
    if (isBrowserOnline()) {
      clearOrdersOfflineIfOnline();
    }
    return data;
  } catch (error) {
    if (!isBrowserOnline() || isOfflineError(error)) {
      setOrdersOffline(true);
      return offlineData;
    }
    throw error;
  }
}

function assertOnlineForAction() {
  if (isOfflineMode()) {
    throw new Error(OFFLINE_ACTION_ERROR);
  }
}

export const ordersOfflineService = {
  isOnline: () => !isOfflineMode(),

  async list(params: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    clientId?: string;
  }): Promise<PaginatedOrders> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    return readWithOfflineFallback(
      async () => {
        const data = await ordersApi.list({ page, limit, ...params });
        await cachePaginatedOrders(data);
        return data;
      },
      () =>
        ordersOfflineRepository.paginateOrders({
          page,
          limit,
          q: params.q,
          status: params.status,
          clientId: params.clientId,
        }),
    );
  },

  async byId(id: string): Promise<OrderDetail> {
    const readCached = async () => {
      const cached = await ordersOfflineRepository.getOrder(id);
      if (!cached) throw new Error("Commande introuvable hors-ligne");
      return cached;
    };

    if (isOfflineMode()) {
      return readCached();
    }

    try {
      const order = await withTimeout(ordersApi.byId(id), API_READ_TIMEOUT_MS);
      await ordersOfflineRepository.upsertOrder(order, "synced");
      if (isBrowserOnline()) {
        clearOrdersOfflineIfOnline();
      }
      return order;
    } catch (error) {
      if (!isBrowserOnline() || isOfflineError(error)) {
        setOrdersOffline(true);
        return readCached();
      }
      throw error;
    }
  },

  async create(payload: CreateOrderPayload): Promise<OrderDetail> {
    if (!isOfflineMode()) {
      const order = await ordersApi.create(payload);
      await ordersOfflineRepository.upsertOrder(order, "synced");
      return order;
    }

    const localId = createLocalId();
    const optimistic = await buildOptimisticOrder(payload, localId);
    await ordersOfflineRepository.upsertOrder(optimistic, "pending");
    await ordersSyncQueue.enqueue({
      operation: "createOrder",
      entityId: localId,
      payload: ordersSyncQueue.payload(payload),
    });
    return optimistic;
  },

  async update(id: string, payload: UpdateOrderPayload): Promise<OrderDetail> {
    if (!isOfflineMode()) {
      const order = await ordersApi.update(id, payload);
      await ordersOfflineRepository.upsertOrder(order, "synced");
      return order;
    }

    const existing = await ordersOfflineRepository.getOrder(id);
    if (!existing) throw new Error("Commande introuvable hors-ligne");

    const updated = mergeUpdatePayload(existing, payload);
    await ordersOfflineRepository.upsertOrder(updated, "pending");
    await ordersSyncQueue.enqueue({
      operation: "updateOrder",
      entityId: id,
      payload: ordersSyncQueue.payload(payload),
    });
    return updated;
  },

  async remove(id: string) {
    if (!isOfflineMode()) {
      const result = await ordersApi.remove(id);
      await ordersOfflineRepository.markOrderDeleted(id);
      return result;
    }

    await ordersOfflineRepository.markOrderDeleted(id);
    await ordersSyncQueue.enqueue({
      operation: "deleteOrder",
      entityId: id,
      payload: ordersSyncQueue.payload({}),
    });
    return { message: "Suppression en attente de synchronisation", orderId: id };
  },

  async confirm(id: string) {
    assertOnlineForAction();
    const order = await ordersApi.confirm(id);
    await ordersOfflineRepository.upsertOrder(order, "synced");
    return order;
  },

  async cancel(id: string) {
    assertOnlineForAction();
    const order = await ordersApi.cancel(id);
    await ordersOfflineRepository.upsertOrder(order, "synced");
    return order;
  },

  async createInvoice(
    id: string,
    payload: CreateOrderInvoicePayload = {},
  ): Promise<CreateOrderInvoiceResult> {
    assertOnlineForAction();
    const result = await ordersApi.createInvoice(id, payload);
    await ordersOfflineRepository.upsertOrder(result.order, "synced");
    return result;
  },
};
