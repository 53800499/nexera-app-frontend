import type {
  InvoiceDetail,
  InvoiceSummary,
  PaginatedInvoices,
} from "../../types/invoice.types";
import { getInvoicesOfflineDb } from "../db/invoicesOffline.db";
import type { SyncStatus } from "../types/offline.types";

function parseInvoice(record: { data: string }): InvoiceDetail {
  return JSON.parse(record.data) as InvoiceDetail;
}

function toSummary(invoice: InvoiceDetail): InvoiceSummary {
  const { lines, payments, creditNotes, ...summary } = invoice;
  return summary;
}

export const invoicesOfflineRepository = {
  async upsertInvoice(
    invoice: InvoiceDetail,
    syncStatus: SyncStatus,
    serverId?: string,
  ) {
    const db = getInvoicesOfflineDb();
    if (!db) return;

    await db.invoices.put({
      id: invoice.id,
      serverId:
        serverId ?? (invoice.id.startsWith("local_") ? undefined : invoice.id),
      tenantId: undefined,
      data: JSON.stringify(invoice),
      syncStatus,
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    });
  },

  async replaceLocalInvoice(localId: string, serverInvoice: InvoiceDetail) {
    const db = getInvoicesOfflineDb();
    if (!db) return;

    await db.transaction("rw", db.invoices, db.syncQueue, async () => {
      await db.invoices.delete(localId);

      await db.invoices.put({
        id: serverInvoice.id,
        serverId: serverInvoice.id,
        data: JSON.stringify(serverInvoice),
        syncStatus: "synced",
        updatedAt: new Date().toISOString(),
        isDeleted: false,
      });

      const queueItems = await db.syncQueue.toArray();
      for (const item of queueItems) {
        if (item.entityId === localId && item.id != null) {
          await db.syncQueue.update(item.id, { entityId: serverInvoice.id });
        }
      }
    });
  },

  async getInvoice(id: string): Promise<InvoiceDetail | null> {
    const db = getInvoicesOfflineDb();
    if (!db) return null;

    const byId = await db.invoices.get(id);
    if (byId && !byId.isDeleted) return parseInvoice(byId);

    const byServerId = await db.invoices.where("serverId").equals(id).first();
    if (byServerId && !byServerId.isDeleted) return parseInvoice(byServerId);

    return null;
  },

  async listInvoices(): Promise<InvoiceSummary[]> {
    const db = getInvoicesOfflineDb();
    if (!db) return [];

    const records = await db.invoices
      .filter((record) => record.isDeleted !== true)
      .toArray();

    return records
      .map((record) => {
        try {
          return toSummary(parseInvoice(record));
        } catch {
          return null;
        }
      })
      .filter((item): item is InvoiceSummary => item !== null)
      .sort((a, b) =>
        (b.issueDate ?? "").localeCompare(a.issueDate ?? "", "fr"),
      );
  },

  async filterInvoices(params: {
    q?: string;
    status?: string;
    invoiceType?: string;
    clientId?: string;
  }): Promise<InvoiceSummary[]> {
    let items = await this.listInvoices();

    if (params.status) {
      items = items.filter((item) => item.status === params.status);
    }

    if (params.invoiceType) {
      items = items.filter((item) => item.invoiceType === params.invoiceType);
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

  async paginateInvoices(params: {
    page: number;
    limit: number;
    q?: string;
    status?: string;
    invoiceType?: string;
    clientId?: string;
  }): Promise<PaginatedInvoices> {
    const items = await this.filterInvoices(params);
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

  async markInvoiceDeleted(id: string) {
    const db = getInvoicesOfflineDb();
    if (!db) return;

    const record = await db.invoices.get(id);
    if (!record) return;

    await db.invoices.update(id, {
      isDeleted: true,
      syncStatus: "pending",
      updatedAt: new Date().toISOString(),
    });
  },

  async setMeta(key: string, value: string) {
    const db = getInvoicesOfflineDb();
    if (!db) return;
    await db.meta.put({ key, value });
  },

  async getMeta(key: string) {
    const db = getInvoicesOfflineDb();
    if (!db) return null;
    const row = await db.meta.get(key);
    return row?.value ?? null;
  },
};
