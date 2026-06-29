import { crmOfflineRepository } from "@/modules/crm/offline/services/crmOfflineRepository";
import { isLocalId } from "@/modules/crm/offline/types/offline.types";
import { quotationsOfflineRepository } from "@/modules/devis/offline/services/quotationsOfflineRepository";
import { ordersApi } from "../../services/ordersApi.service";
import type {
  CreateOrderPayload,
  UpdateOrderPayload,
} from "../../types/order.types";
import { ordersOfflineRepository } from "./ordersOfflineRepository";
import { ordersSyncQueue } from "./ordersSyncQueue.service";

let syncing = false;

async function resolveClientId(clientId: string) {
  if (!isLocalId(clientId)) return clientId;

  const client = await crmOfflineRepository.getClient(clientId);
  if (client && !isLocalId(client.id)) return client.id;

  const crmDb = await import("@/modules/crm/offline/db/crmOffline.db").then(
    (m) => m.getCrmOfflineDb(),
  );
  const record = await crmDb?.clients.get(clientId);
  if (record?.serverId) return record.serverId;

  throw new Error("Le client local n'est pas encore synchronisé.");
}

async function resolveQuotationId(quotationId?: string | null) {
  if (!quotationId || !isLocalId(quotationId)) return quotationId ?? undefined;

  const quotation = await quotationsOfflineRepository.getQuotation(quotationId);
  if (quotation && !isLocalId(quotation.id)) return quotation.id;

  const db = await import("@/modules/devis/offline/db/quotationsOffline.db").then(
    (m) => m.getQuotationsOfflineDb(),
  );
  const record = await db?.quotations.get(quotationId);
  if (record?.serverId) return record.serverId;

  throw new Error("Le devis local n'est pas encore synchronisé.");
}

async function resolveOrderId(orderId: string) {
  if (!isLocalId(orderId)) return orderId;

  const order = await ordersOfflineRepository.getOrder(orderId);
  if (order && !isLocalId(order.id)) return order.id;

  const db = await import("../db/ordersOffline.db").then((m) =>
    m.getOrdersOfflineDb(),
  );
  const record = await db?.orders.get(orderId);
  if (record?.serverId) return record.serverId;

  throw new Error("La commande locale n'est pas encore synchronisée.");
}

export const ordersSyncEngine = {
  async sync(): Promise<{ processed: number; failed: number }> {
    if (syncing || typeof navigator === "undefined" || !navigator.onLine) {
      return { processed: 0, failed: 0 };
    }

    syncing = true;
    let processed = 0;
    let failed = 0;

    try {
      const queue = await ordersSyncQueue.peekAll();

      for (const item of queue) {
        if (item.id == null) continue;

        try {
          await processQueueItem(item);
          await ordersSyncQueue.remove(item.id);
          processed += 1;
        } catch (error) {
          failed += 1;
          const message =
            error instanceof Error ? error.message : "Erreur de synchronisation";
          await ordersSyncQueue.markError(item.id, message);
        }
      }

      if (processed > 0) {
        await pullLatestOrders();
      }

      await ordersOfflineRepository.setMeta(
        "lastSyncAt",
        new Date().toISOString(),
      );
    } finally {
      syncing = false;
    }

    return { processed, failed };
  },

  get isSyncing() {
    return syncing;
  },
};

async function processQueueItem(
  item: Awaited<ReturnType<typeof ordersSyncQueue.peekAll>>[number],
) {
  switch (item.operation) {
    case "createOrder": {
      const payload = ordersSyncQueue.parsePayload<CreateOrderPayload>(
        item.payload,
      );
      const resolvedPayload: CreateOrderPayload = {
        ...payload,
        clientId: await resolveClientId(payload.clientId),
        quotationId: await resolveQuotationId(payload.quotationId),
      };
      const created = await ordersApi.create(resolvedPayload);
      await ordersOfflineRepository.replaceLocalOrder(item.entityId, created);
      return;
    }
    case "updateOrder": {
      const orderId = await resolveOrderId(item.entityId);
      const payload = ordersSyncQueue.parsePayload<UpdateOrderPayload>(
        item.payload,
      );
      const updated = await ordersApi.update(orderId, payload);
      await ordersOfflineRepository.upsertOrder(updated, "synced");
      return;
    }
    case "deleteOrder": {
      const orderId = await resolveOrderId(item.entityId);
      await ordersApi.remove(orderId);
      const db = await import("../db/ordersOffline.db").then((m) =>
        m.getOrdersOfflineDb(),
      );
      await db?.orders.delete(item.entityId);
      return;
    }
    default:
      throw new Error(`Opération inconnue : ${item.operation}`);
  }
}

async function pullLatestOrders() {
  const page1 = await ordersApi.list({ page: 1, limit: 100 });
  await Promise.all(
    page1.items.map((summary) =>
      ordersOfflineRepository.upsertOrder(
        { ...summary, lines: [], invoices: [] },
        "synced",
      ),
    ),
  );
}
