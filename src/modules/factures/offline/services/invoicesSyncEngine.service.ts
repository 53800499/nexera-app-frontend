import { crmOfflineRepository } from "@/modules/crm/offline/services/crmOfflineRepository";
import { isLocalId } from "@/modules/crm/offline/types/offline.types";
import { ordersOfflineRepository } from "@/modules/commandes/offline/services/ordersOfflineRepository";
import { quotationsOfflineRepository } from "@/modules/devis/offline/services/quotationsOfflineRepository";
import { invoicesApi } from "../../services/invoicesApi.service";
import type {
  CreateInvoicePayload,
  UpdateInvoicePayload,
} from "../../types/invoice.types";
import { invoicesOfflineRepository } from "./invoicesOfflineRepository";
import { invoicesSyncQueue } from "./invoicesSyncQueue.service";

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

async function resolveOrderId(orderId?: string | null) {
  if (!orderId || !isLocalId(orderId)) return orderId ?? undefined;

  const order = await ordersOfflineRepository.getOrder(orderId);
  if (order && !isLocalId(order.id)) return order.id;

  const db = await import("@/modules/commandes/offline/db/ordersOffline.db").then(
    (m) => m.getOrdersOfflineDb(),
  );
  const record = await db?.orders.get(orderId);
  if (record?.serverId) return record.serverId;

  throw new Error("La commande locale n'est pas encore synchronisée.");
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

async function resolveInvoiceId(invoiceId: string) {
  if (!isLocalId(invoiceId)) return invoiceId;

  const invoice = await invoicesOfflineRepository.getInvoice(invoiceId);
  if (invoice && !isLocalId(invoice.id)) return invoice.id;

  const db = await import("../db/invoicesOffline.db").then((m) =>
    m.getInvoicesOfflineDb(),
  );
  const record = await db?.invoices.get(invoiceId);
  if (record?.serverId) return record.serverId;

  throw new Error("La facture locale n'est pas encore synchronisée.");
}

export const invoicesSyncEngine = {
  async sync(): Promise<{ processed: number; failed: number }> {
    if (syncing || typeof navigator === "undefined" || !navigator.onLine) {
      return { processed: 0, failed: 0 };
    }

    syncing = true;
    let processed = 0;
    let failed = 0;

    try {
      const queue = await invoicesSyncQueue.peekAll();

      for (const item of queue) {
        if (item.id == null) continue;

        try {
          await processQueueItem(item);
          await invoicesSyncQueue.remove(item.id);
          processed += 1;
        } catch (error) {
          failed += 1;
          const message =
            error instanceof Error ? error.message : "Erreur de synchronisation";
          await invoicesSyncQueue.markError(item.id, message);
        }
      }

      if (processed > 0) {
        await pullLatestInvoices();
      }

      await invoicesOfflineRepository.setMeta(
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
  item: Awaited<ReturnType<typeof invoicesSyncQueue.peekAll>>[number],
) {
  switch (item.operation) {
    case "createInvoice": {
      const payload = invoicesSyncQueue.parsePayload<CreateInvoicePayload>(
        item.payload,
      );
      const resolvedPayload: CreateInvoicePayload = {
        ...payload,
        clientId: await resolveClientId(payload.clientId),
        orderId: await resolveOrderId(payload.orderId),
        quotationId: await resolveQuotationId(payload.quotationId),
      };
      const created = await invoicesApi.create(resolvedPayload);
      await invoicesOfflineRepository.replaceLocalInvoice(item.entityId, created);
      return;
    }
    case "updateInvoice": {
      const invoiceId = await resolveInvoiceId(item.entityId);
      const payload = invoicesSyncQueue.parsePayload<UpdateInvoicePayload>(
        item.payload,
      );
      const updated = await invoicesApi.update(invoiceId, payload);
      await invoicesOfflineRepository.upsertInvoice(updated, "synced");
      return;
    }
    case "deleteInvoice": {
      const invoiceId = await resolveInvoiceId(item.entityId);
      await invoicesApi.remove(invoiceId);
      const db = await import("../db/invoicesOffline.db").then((m) =>
        m.getInvoicesOfflineDb(),
      );
      await db?.invoices.delete(item.entityId);
      return;
    }
    default:
      throw new Error(`Opération inconnue : ${item.operation}`);
  }
}

async function pullLatestInvoices() {
  const page1 = await invoicesApi.list({ page: 1, limit: 100 });
  await Promise.all(
    page1.items.map((summary) =>
      invoicesOfflineRepository.upsertInvoice(
        { ...summary, lines: [], payments: [], creditNotes: [] },
        "synced",
      ),
    ),
  );
}
