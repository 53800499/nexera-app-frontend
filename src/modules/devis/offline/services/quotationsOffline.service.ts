import { DEFAULT_CURRENCY } from "@/shared/constants/currencies";
import { isOfflineError } from "@/shared/core/OfflineError";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { withTimeout } from "@/shared/lib/withTimeout";
import { crmOfflineRepository } from "@/modules/crm/offline/services/crmOfflineRepository";
import { ordersApi } from "@/modules/commandes/services/ordersApi.service";
import { ordersOfflineRepository } from "@/modules/commandes/offline/services/ordersOfflineRepository";
import { invoicesApi } from "@/modules/factures/services/invoicesApi.service";
import { invoicesOfflineRepository } from "@/modules/factures/offline/services/invoicesOfflineRepository";
import { quotationsApi } from "../../services/quotationsApi.service";
import type {
  ChangeQuotationStatusPayload,
  ConvertQuotationPayload,
  ConvertQuotationResult,
  CreateQuotationPayload,
  PaginatedQuotations,
  QuotationDetail,
  QuotationLine,
  QuotationLinePayload,
  SendQuotationPayload,
  SendQuotationResult,
  UpdateQuotationPayload,
} from "../../types/quotation.types";
import {
  createQuotationPreviewUrl,
  downloadQuotationPdf,
} from "../../pdf/quotationPdf.service";
import {
  clearQuotationsOfflineIfOnline,
  setQuotationsOfflineMode,
} from "../utils/quotationsOfflineState";
import { quotationsOfflineRepository } from "./quotationsOfflineRepository";
import { quotationsSyncQueue } from "./quotationsSyncQueue.service";
import { createLocalId } from "../types/offline.types";
import { useQuotationsSyncStore } from "../store/quotationsSyncStore";

const API_READ_TIMEOUT_MS = 8_000;

const OFFLINE_ACTION_ERROR =
  "Cette action nécessite une connexion réseau. Réessayez une fois en ligne.";

function isOfflineMode() {
  if (typeof window === "undefined") return false;
  if (!isBrowserOnline()) return true;
  return useQuotationsSyncStore.getState().isOffline;
}

function setQuotationsOffline(offline: boolean) {
  setQuotationsOfflineMode(offline);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function buildLinesFromPayload(lines: QuotationLinePayload[]): QuotationLine[] {
  return lines.map((line, index) => {
    const lineTotalHt = roundMoney(
      line.quantity * line.unitPriceHt * (1 - (line.discountPct ?? 0) / 100),
    );
    return {
      id: createLocalId(),
      position: index + 1,
      lineNumber: index + 1,
      itemId: line.itemId ?? null,
      description: line.description,
      quantity: line.quantity,
      unitPriceHt: line.unitPriceHt,
      discountPct: line.discountPct ?? 0,
      discountAmount: line.discountAmount,
      taxRateId: line.taxRateId,
      taxRatePct: 0,
      lineTotalHt,
      taxAmount: 0,
      lineTotalTtc: lineTotalHt,
      item: null,
      taxRate: null,
    };
  });
}

async function buildOptimisticQuotation(
  payload: CreateQuotationPayload,
  localId: string,
): Promise<QuotationDetail> {
  const client = await crmOfflineRepository.getClient(payload.clientId);
  const lines = buildLinesFromPayload(payload.lines);
  const subtotalHt = roundMoney(
    lines.reduce((sum, line) => sum + line.lineTotalHt, 0),
  );
  const discountPct = payload.discountPct ?? 0;
  const discountAmount = roundMoney(subtotalHt * (discountPct / 100));

  return {
    id: localId,
    tenantId: "local",
    number: `BROUILLON-${localId.slice(-6).toUpperCase()}`,
    status: "draft",
    clientId: payload.clientId,
    client: client
      ? {
          id: client.id,
          code: client.code,
          companyName: client.companyName,
        }
      : {
          id: payload.clientId,
          code: "LOCAL",
          companyName: "Client (local)",
        },
    issueDate: payload.issueDate,
    expiryDate: payload.expiryDate ?? null,
    currency: payload.currency ?? DEFAULT_CURRENCY,
    subtotalHt,
    discountPct,
    discountAmount,
    totalTax: 0,
    totalTtc: roundMoney(subtotalHt - discountAmount),
    paymentTermId: payload.paymentTermId ?? null,
    paymentTerm: null,
    notes: payload.notes ?? null,
    internalNotes: payload.internalNotes ?? null,
    lines,
    createdAt: new Date().toISOString(),
  };
}

function mergeUpdatePayload(
  existing: QuotationDetail,
  payload: UpdateQuotationPayload,
): QuotationDetail {
  const lines = buildLinesFromPayload(payload.lines);
  const subtotalHt = roundMoney(
    lines.reduce((sum, line) => sum + line.lineTotalHt, 0),
  );
  const discountPct = payload.discountPct ?? existing.discountPct;
  const discountAmount = roundMoney(subtotalHt * (discountPct / 100));

  return {
    ...existing,
    issueDate: payload.issueDate ?? existing.issueDate,
    expiryDate:
      payload.expiryDate !== undefined
        ? payload.expiryDate
        : existing.expiryDate,
    currency: payload.currency ?? existing.currency,
    discountPct,
    discountAmount,
    subtotalHt,
    totalTax: existing.totalTax,
    totalTtc: roundMoney(subtotalHt - discountAmount + existing.totalTax),
    paymentTermId:
      payload.paymentTermId !== undefined
        ? payload.paymentTermId
        : existing.paymentTermId,
    notes: payload.notes !== undefined ? payload.notes : existing.notes,
    internalNotes:
      payload.internalNotes !== undefined
        ? payload.internalNotes
        : existing.internalNotes,
    lines,
  };
}

async function cachePaginatedQuotations(data: PaginatedQuotations) {
  await Promise.all(
    data.items.map((summary) =>
      quotationsOfflineRepository.upsertQuotation(
        { ...summary, lines: [] },
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
      clearQuotationsOfflineIfOnline();
    }
    return data;
  } catch (error) {
    if (!isBrowserOnline() || isOfflineError(error)) {
      setQuotationsOffline(true);
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

export const quotationsOfflineService = {
  isOnline: () => !isOfflineMode(),

  async list(params: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    clientId?: string;
  }): Promise<PaginatedQuotations> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    return readWithOfflineFallback(
      async () => {
        const data = await quotationsApi.list({ page, limit, ...params });
        await cachePaginatedQuotations(data);
        return data;
      },
      () =>
        quotationsOfflineRepository.paginateQuotations({
          page,
          limit,
          q: params.q,
          status: params.status,
          clientId: params.clientId,
        }),
    );
  },

  async byId(id: string): Promise<QuotationDetail> {
    return readWithOfflineFallback(
      async () => {
        const quotation = await quotationsApi.byId(id);
        await quotationsOfflineRepository.upsertQuotation(quotation, "synced");
        return quotation;
      },
      async () => {
        const cached = await quotationsOfflineRepository.getQuotation(id);
        if (!cached) throw new Error("Devis introuvable hors-ligne");
        return cached;
      },
    );
  },

  async create(payload: CreateQuotationPayload): Promise<QuotationDetail> {
    if (!isOfflineMode()) {
      const quotation = await quotationsApi.create(payload);
      await quotationsOfflineRepository.upsertQuotation(quotation, "synced");
      return quotation;
    }

    const localId = createLocalId();
    const optimistic = await buildOptimisticQuotation(payload, localId);
    await quotationsOfflineRepository.upsertQuotation(optimistic, "pending");
    await quotationsSyncQueue.enqueue({
      operation: "createQuotation",
      entityId: localId,
      payload: quotationsSyncQueue.payload(payload),
    });
    return optimistic;
  },

  async update(
    id: string,
    payload: UpdateQuotationPayload,
  ): Promise<QuotationDetail> {
    if (!isOfflineMode()) {
      const quotation = await quotationsApi.update(id, payload);
      await quotationsOfflineRepository.upsertQuotation(quotation, "synced");
      return quotation;
    }

    const existing = await quotationsOfflineRepository.getQuotation(id);
    if (!existing) throw new Error("Devis introuvable hors-ligne");

    const updated = mergeUpdatePayload(existing, payload);
    await quotationsOfflineRepository.upsertQuotation(updated, "pending");
    await quotationsSyncQueue.enqueue({
      operation: "updateQuotation",
      entityId: id,
      payload: quotationsSyncQueue.payload(payload),
    });
    return updated;
  },

  async remove(id: string) {
    if (!isOfflineMode()) {
      const result = await quotationsApi.remove(id);
      await quotationsOfflineRepository.markQuotationDeleted(id);
      return result;
    }

    await quotationsOfflineRepository.markQuotationDeleted(id);
    await quotationsSyncQueue.enqueue({
      operation: "deleteQuotation",
      entityId: id,
      payload: quotationsSyncQueue.payload({}),
    });
    return { message: "Suppression en attente de synchronisation" };
  },

  async send(id: string, payload: SendQuotationPayload = {}) {
    assertOnlineForAction();
    const result = await quotationsApi.send(id, payload);
    await quotationsOfflineRepository.upsertQuotation(
      result.quotation,
      "synced",
    );
    return result;
  },

  async changeStatus(id: string, payload: ChangeQuotationStatusPayload) {
    assertOnlineForAction();
    const quotation = await quotationsApi.changeStatus(id, payload);
    await quotationsOfflineRepository.upsertQuotation(quotation, "synced");
    return quotation;
  },

  async convert(
    id: string,
    payload: ConvertQuotationPayload,
  ): Promise<ConvertQuotationResult> {
    assertOnlineForAction();
    const result = await quotationsApi.convert(id, payload);

    const quotation = await quotationsApi.byId(id);
    await quotationsOfflineRepository.upsertQuotation(quotation, "synced");

    if (result.target === "order") {
      const order = await ordersApi.byId(result.targetId);
      await ordersOfflineRepository.upsertOrder(order, "synced");
    } else {
      const invoice = await invoicesApi.byId(result.targetId);
      await invoicesOfflineRepository.upsertInvoice(invoice, "synced");
    }

    return result;
  },

  async openQuotationPreview(quotation: QuotationDetail) {
    return createQuotationPreviewUrl(quotation);
  },

  async downloadQuotationPdfFile(quotation: QuotationDetail) {
    await downloadQuotationPdf(quotation);
  },
};
