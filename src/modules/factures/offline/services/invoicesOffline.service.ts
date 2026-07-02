import { DEFAULT_CURRENCY } from "@/shared/constants/currencies";
import { isOfflineError } from "@/shared/core/OfflineError";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { withTimeout } from "@/shared/lib/withTimeout";
import { crmOfflineRepository } from "@/modules/crm/offline/services/crmOfflineRepository";
import { ordersOfflineRepository } from "@/modules/commandes/offline/services/ordersOfflineRepository";
import { quotationsOfflineRepository } from "@/modules/devis/offline/services/quotationsOfflineRepository";
import { invoicesApi } from "../../services/invoicesApi.service";
import type {
  CreateCreditNotePayload,
  CreateInvoicePayload,
  InvoiceDetail,
  InvoiceLine,
  InvoiceLinePayload,
  PaginatedInvoices,
  RecordInvoicePaymentPayload,
  SendInvoicePayload,
  UpdateInvoicePayload,
} from "../../types/invoice.types";
import {
  clearInvoicesOfflineIfOnline,
  setInvoicesOfflineMode,
} from "../utils/invoicesOfflineState";
import { invoicesOfflineRepository } from "./invoicesOfflineRepository";
import { invoicesSyncQueue } from "./invoicesSyncQueue.service";
import { createLocalId } from "../types/offline.types";
import { useInvoicesSyncStore } from "../store/invoicesSyncStore";

const API_READ_TIMEOUT_MS = 8_000;

const OFFLINE_ACTION_ERROR =
  "Cette action nécessite une connexion réseau. Réessayez une fois en ligne.";

function isOfflineMode() {
  if (typeof window === "undefined") return false;
  if (!isBrowserOnline()) return true;
  return useInvoicesSyncStore.getState().isOffline;
}

function setInvoicesOffline(offline: boolean) {
  setInvoicesOfflineMode(offline);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function buildLinesFromPayload(lines: InvoiceLinePayload[]): InvoiceLine[] {
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

async function buildOptimisticInvoice(
  payload: CreateInvoicePayload,
  localId: string,
): Promise<InvoiceDetail> {
  const client = await crmOfflineRepository.getClient(payload.clientId);
  const order = payload.orderId
    ? await ordersOfflineRepository.getOrder(payload.orderId)
    : null;
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
    number: `FAC-LOCAL-${localId.slice(-6).toUpperCase()}`,
    invoiceType: payload.invoiceType,
    status: "draft",
    clientId: payload.clientId,
    client: client
      ? { id: client.id, code: client.code, companyName: client.companyName }
      : {
          id: payload.clientId,
          code: "LOCAL",
          companyName: "Client (local)",
        },
    orderId: payload.orderId ?? null,
    order: order
      ? { id: order.id, number: order.number, status: order.status }
      : null,
    quotationId: payload.quotationId ?? null,
    quotation: quotation
      ? { id: quotation.id, number: quotation.number, status: quotation.status }
      : null,
    issueDate: payload.issueDate,
    dueDate: payload.dueDate ?? null,
    currency: payload.currency ?? DEFAULT_CURRENCY,
    exchangeRate: payload.exchangeRate,
    paymentTermId: payload.paymentTermId ?? null,
    paymentTerm: null,
    subtotalHt,
    discountPct,
    totalTax: 0,
    totalTtc,
    amountDue: totalTtc,
    amountPaid: 0,
    notes: payload.notes ?? null,
    internalNotes: payload.internalNotes ?? null,
    lines,
    payments: [],
    creditNotes: [],
    createdAt: new Date().toISOString(),
  };
}

function mergeUpdatePayload(
  existing: InvoiceDetail,
  payload: UpdateInvoicePayload,
): InvoiceDetail {
  const lines = payload.lines
    ? buildLinesFromPayload(payload.lines)
    : existing.lines;
  const subtotalHt = roundMoney(
    lines.reduce((sum, line) => sum + line.lineTotalHt, 0),
  );
  const discountPct = payload.discountPct ?? existing.discountPct ?? 0;
  const totalTtc = roundMoney(subtotalHt * (1 - discountPct / 100));

  return {
    ...existing,
    invoiceType: payload.invoiceType ?? existing.invoiceType,
    issueDate: payload.issueDate ?? existing.issueDate,
    dueDate: payload.dueDate ?? existing.dueDate,
    currency: payload.currency ?? existing.currency,
    exchangeRate: payload.exchangeRate ?? existing.exchangeRate,
    paymentTermId: payload.paymentTermId ?? existing.paymentTermId,
    discountPct,
    subtotalHt,
    totalTax: existing.totalTax,
    totalTtc,
    amountDue: Math.max(0, totalTtc - existing.amountPaid),
    notes: payload.notes ?? existing.notes,
    internalNotes: payload.internalNotes ?? existing.internalNotes,
    lines,
  };
}

async function cachePaginatedInvoices(data: PaginatedInvoices) {
  await Promise.all(
    data.items.map((summary) =>
      invoicesOfflineRepository.upsertInvoice(
        { ...summary, lines: [], payments: [], creditNotes: [] },
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
      clearInvoicesOfflineIfOnline();
    }
    return data;
  } catch (error) {
    if (!isBrowserOnline() || isOfflineError(error)) {
      setInvoicesOffline(true);
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

export const invoicesOfflineService = {
  isOnline: () => !isOfflineMode(),

  async list(params: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    invoiceType?: string;
    clientId?: string;
  }): Promise<PaginatedInvoices> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    return readWithOfflineFallback(
      async () => {
        const data = await invoicesApi.list({ page, limit, ...params });
        await cachePaginatedInvoices(data);
        return data;
      },
      () =>
        invoicesOfflineRepository.paginateInvoices({
          page,
          limit,
          q: params.q,
          status: params.status,
          invoiceType: params.invoiceType,
          clientId: params.clientId,
        }),
    );
  },

  async byId(id: string): Promise<InvoiceDetail> {
    const readCached = async () => {
      const cached = await invoicesOfflineRepository.getInvoice(id);
      if (!cached) throw new Error("Facture introuvable hors-ligne");
      return cached;
    };

    if (isOfflineMode()) {
      return readCached();
    }

    try {
      const invoice = await withTimeout(invoicesApi.byId(id), API_READ_TIMEOUT_MS);
      await invoicesOfflineRepository.upsertInvoice(invoice, "synced");
      if (isBrowserOnline()) {
        clearInvoicesOfflineIfOnline();
      }
      return invoice;
    } catch (error) {
      if (!isBrowserOnline() || isOfflineError(error)) {
        setInvoicesOffline(true);
        return readCached();
      }
      throw error;
    }
  },

  async create(payload: CreateInvoicePayload): Promise<InvoiceDetail> {
    if (!isOfflineMode()) {
      const invoice = await invoicesApi.create(payload);
      await invoicesOfflineRepository.upsertInvoice(invoice, "synced");
      return invoice;
    }

    const localId = createLocalId();
    const optimistic = await buildOptimisticInvoice(payload, localId);
    await invoicesOfflineRepository.upsertInvoice(optimistic, "pending");
    await invoicesSyncQueue.enqueue({
      operation: "createInvoice",
      entityId: localId,
      payload: invoicesSyncQueue.payload(payload),
    });
    return optimistic;
  },

  async update(id: string, payload: UpdateInvoicePayload): Promise<InvoiceDetail> {
    if (!isOfflineMode()) {
      const invoice = await invoicesApi.update(id, payload);
      await invoicesOfflineRepository.upsertInvoice(invoice, "synced");
      return invoice;
    }

    const existing = await invoicesOfflineRepository.getInvoice(id);
    if (!existing) throw new Error("Facture introuvable hors-ligne");

    const updated = mergeUpdatePayload(existing, payload);
    await invoicesOfflineRepository.upsertInvoice(updated, "pending");
    await invoicesSyncQueue.enqueue({
      operation: "updateInvoice",
      entityId: id,
      payload: invoicesSyncQueue.payload(payload),
    });
    return updated;
  },

  async remove(id: string) {
    if (!isOfflineMode()) {
      const result = await invoicesApi.remove(id);
      await invoicesOfflineRepository.markInvoiceDeleted(id);
      return result;
    }

    await invoicesOfflineRepository.markInvoiceDeleted(id);
    await invoicesSyncQueue.enqueue({
      operation: "deleteInvoice",
      entityId: id,
      payload: invoicesSyncQueue.payload({}),
    });
    return {
      message: "Suppression en attente de synchronisation",
      invoiceId: id,
    };
  },

  async issue(id: string) {
    assertOnlineForAction();
    const invoice = await invoicesApi.issue(id);
    await invoicesOfflineRepository.upsertInvoice(invoice, "synced");
    return invoice;
  },

  async send(id: string, payload: SendInvoicePayload = {}) {
    assertOnlineForAction();
    const invoice = await invoicesApi.send(id, payload);
    await invoicesOfflineRepository.upsertInvoice(invoice, "synced");
    return invoice;
  },

  async createCreditNote(id: string, payload: CreateCreditNotePayload = {}) {
    assertOnlineForAction();
    const invoice = await invoicesApi.createCreditNote(id, payload);
    await invoicesOfflineRepository.upsertInvoice(invoice, "synced");
    return invoice;
  },

  async recordPayment(id: string, payload: RecordInvoicePaymentPayload) {
    assertOnlineForAction();
    const invoice = await invoicesApi.recordPayment(id, payload);
    await invoicesOfflineRepository.upsertInvoice(invoice, "synced");
    return invoice;
  },
};
