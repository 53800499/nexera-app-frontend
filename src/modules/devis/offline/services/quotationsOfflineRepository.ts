import type {
  PaginatedQuotations,
  QuotationDetail,
  QuotationSummary,
} from "../../types/quotation.types";
import { getQuotationsOfflineDb } from "../db/quotationsOffline.db";
import type { SyncStatus } from "../types/offline.types";

function parseQuotation(record: { data: string }): QuotationDetail {
  return JSON.parse(record.data) as QuotationDetail;
}

function toSummary(quotation: QuotationDetail): QuotationSummary {
  const { lines, notes, internalNotes, convertedToOrderId, convertedToInvoiceId, ...summary } =
    quotation;
  return summary;
}

export const quotationsOfflineRepository = {
  async upsertQuotation(
    quotation: QuotationDetail,
    syncStatus: SyncStatus,
    serverId?: string,
  ) {
    const db = getQuotationsOfflineDb();
    if (!db) return;

    await db.quotations.put({
      id: quotation.id,
      serverId:
        serverId ?? (quotation.id.startsWith("local_") ? undefined : quotation.id),
      tenantId: quotation.tenantId,
      data: JSON.stringify(quotation),
      syncStatus,
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    });
  },

  async replaceLocalQuotation(localId: string, serverQuotation: QuotationDetail) {
    const db = getQuotationsOfflineDb();
    if (!db) return;

    await db.transaction("rw", db.quotations, db.syncQueue, async () => {
      await db.quotations.delete(localId);

      await db.quotations.put({
        id: serverQuotation.id,
        serverId: serverQuotation.id,
        tenantId: serverQuotation.tenantId,
        data: JSON.stringify(serverQuotation),
        syncStatus: "synced",
        updatedAt: new Date().toISOString(),
        isDeleted: false,
      });

      const queueItems = await db.syncQueue.toArray();
      for (const item of queueItems) {
        if (item.entityId === localId && item.id != null) {
          await db.syncQueue.update(item.id, { entityId: serverQuotation.id });
        }
      }
    });
  },

  async getQuotation(id: string): Promise<QuotationDetail | null> {
    const db = getQuotationsOfflineDb();
    if (!db) return null;

    const byId = await db.quotations.get(id);
    if (byId && !byId.isDeleted) return parseQuotation(byId);

    const byServerId = await db.quotations
      .where("serverId")
      .equals(id)
      .first();
    if (byServerId && !byServerId.isDeleted) return parseQuotation(byServerId);

    return null;
  },

  async listQuotations(): Promise<QuotationSummary[]> {
    const db = getQuotationsOfflineDb();
    if (!db) return [];

    const records = await db.quotations
      .filter((record) => record.isDeleted !== true)
      .toArray();

    return records
      .map((record) => {
        try {
          return toSummary(parseQuotation(record));
        } catch {
          return null;
        }
      })
      .filter((item): item is QuotationSummary => item !== null)
      .sort((a, b) =>
        (b.issueDate ?? "").localeCompare(a.issueDate ?? "", "fr"),
      );
  },

  async filterQuotations(params: {
    q?: string;
    status?: string;
    clientId?: string;
  }): Promise<QuotationSummary[]> {
    let items = await this.listQuotations();

    if (params.status) {
      items = items.filter((item) => item.status === params.status);
    }

    if (params.clientId) {
      items = items.filter((item) => item.clientId === params.clientId);
    }

    const q = params.q?.trim().toLowerCase();
    if (q) {
      items = items.filter((item) => {
        const haystack = [
          item.number,
          item.client?.companyName ?? "",
          item.client?.code ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    return items;
  },

  async paginateQuotations(params: {
    page: number;
    limit: number;
    q?: string;
    status?: string;
    clientId?: string;
  }): Promise<PaginatedQuotations> {
    const items = await this.filterQuotations(params);
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / params.limit));
    const safePage = Math.min(Math.max(params.page, 1), totalPages);
    const start = (safePage - 1) * params.limit;

    return {
      items: items.slice(start, start + params.limit),
      total,
      page: safePage,
      limit: params.limit,
      totalPages,
    };
  },

  async markQuotationDeleted(id: string) {
    const db = getQuotationsOfflineDb();
    if (!db) return;

    const record = await db.quotations.get(id);
    if (!record) return;

    await db.quotations.update(id, {
      isDeleted: true,
      syncStatus: "pending",
      updatedAt: new Date().toISOString(),
    });
  },

  async setMeta(key: string, value: string) {
    const db = getQuotationsOfflineDb();
    if (!db) return;
    await db.meta.put({ key, value });
  },

  async getMeta(key: string) {
    const db = getQuotationsOfflineDb();
    if (!db) return null;
    const row = await db.meta.get(key);
    return row?.value ?? null;
  },
};
