import type {
  OrderDetail,
  OrderSummary,
  PaginatedOrders,
} from "../../types/order.types";
import { getOrdersOfflineDb } from "../db/ordersOffline.db";
import type { SyncStatus } from "../types/offline.types";

function parseOrder(record: { data: string }): OrderDetail {
  return JSON.parse(record.data) as OrderDetail;
}

function toSummary(order: OrderDetail): OrderSummary {
  const { lines, invoices, ...summary } = order;
  return summary;
}

export const ordersOfflineRepository = {
  async upsertOrder(order: OrderDetail, syncStatus: SyncStatus, serverId?: string) {
    const db = getOrdersOfflineDb();
    if (!db) return;

    await db.orders.put({
      id: order.id,
      serverId:
        serverId ?? (order.id.startsWith("local_") ? undefined : order.id),
      tenantId: undefined,
      data: JSON.stringify(order),
      syncStatus,
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    });
  },

  async replaceLocalOrder(localId: string, serverOrder: OrderDetail) {
    const db = getOrdersOfflineDb();
    if (!db) return;

    await db.transaction("rw", db.orders, db.syncQueue, async () => {
      await db.orders.delete(localId);

      await db.orders.put({
        id: serverOrder.id,
        serverId: serverOrder.id,
        data: JSON.stringify(serverOrder),
        syncStatus: "synced",
        updatedAt: new Date().toISOString(),
        isDeleted: false,
      });

      const queueItems = await db.syncQueue.toArray();
      for (const item of queueItems) {
        if (item.entityId === localId && item.id != null) {
          await db.syncQueue.update(item.id, { entityId: serverOrder.id });
        }
      }
    });
  },

  async getOrder(id: string): Promise<OrderDetail | null> {
    const db = getOrdersOfflineDb();
    if (!db) return null;

    const byId = await db.orders.get(id);
    if (byId && !byId.isDeleted) return parseOrder(byId);

    const byServerId = await db.orders.where("serverId").equals(id).first();
    if (byServerId && !byServerId.isDeleted) return parseOrder(byServerId);

    return null;
  },

  async listOrders(): Promise<OrderSummary[]> {
    const db = getOrdersOfflineDb();
    if (!db) return [];

    const records = await db.orders
      .filter((record) => record.isDeleted !== true)
      .toArray();

    return records
      .map((record) => {
        try {
          return toSummary(parseOrder(record));
        } catch {
          return null;
        }
      })
      .filter((item): item is OrderSummary => item !== null)
      .sort((a, b) =>
        (b.issueDate ?? "").localeCompare(a.issueDate ?? "", "fr"),
      );
  },

  async filterOrders(params: {
    q?: string;
    status?: string;
    clientId?: string;
  }): Promise<OrderSummary[]> {
    let items = await this.listOrders();

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

  async paginateOrders(params: {
    page: number;
    limit: number;
    q?: string;
    status?: string;
    clientId?: string;
  }): Promise<PaginatedOrders> {
    const items = await this.filterOrders(params);
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

  async markOrderDeleted(id: string) {
    const db = getOrdersOfflineDb();
    if (!db) return;

    const record = await db.orders.get(id);
    if (!record) return;

    await db.orders.update(id, {
      isDeleted: true,
      syncStatus: "pending",
      updatedAt: new Date().toISOString(),
    });
  },

  async setMeta(key: string, value: string) {
    const db = getOrdersOfflineDb();
    if (!db) return;
    await db.meta.put({ key, value });
  },

  async getMeta(key: string) {
    const db = getOrdersOfflineDb();
    if (!db) return null;
    const row = await db.meta.get(key);
    return row?.value ?? null;
  },
};
