import { crmOfflineRepository } from "@/modules/crm/offline/services/crmOfflineRepository";
import { isLocalId } from "@/modules/crm/offline/types/offline.types";
import { quotationsApi } from "../../services/quotationsApi.service";
import type {
  CreateQuotationPayload,
  UpdateQuotationPayload,
} from "../../types/quotation.types";
import { quotationsOfflineRepository } from "./quotationsOfflineRepository";
import { quotationsSyncQueue } from "./quotationsSyncQueue.service";

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

async function resolveQuotationId(quotationId: string) {
  if (!isLocalId(quotationId)) return quotationId;

  const quotation = await quotationsOfflineRepository.getQuotation(quotationId);
  if (quotation && !isLocalId(quotation.id)) return quotation.id;

  const db = await import("../db/quotationsOffline.db").then((m) =>
    m.getQuotationsOfflineDb(),
  );
  const record = await db?.quotations.get(quotationId);
  if (record?.serverId) return record.serverId;

  throw new Error("Le devis local n'est pas encore synchronisé.");
}

export const quotationsSyncEngine = {
  async sync(): Promise<{ processed: number; failed: number }> {
    if (syncing || typeof navigator === "undefined" || !navigator.onLine) {
      return { processed: 0, failed: 0 };
    }

    syncing = true;
    let processed = 0;
    let failed = 0;

    try {
      const queue = await quotationsSyncQueue.peekAll();

      for (const item of queue) {
        if (item.id == null) continue;

        try {
          await processQueueItem(item);
          await quotationsSyncQueue.remove(item.id);
          processed += 1;
        } catch (error) {
          failed += 1;
          const message =
            error instanceof Error ? error.message : "Erreur de synchronisation";
          await quotationsSyncQueue.markError(item.id, message);
        }
      }

      if (processed > 0) {
        await pullLatestQuotations();
      }

      await quotationsOfflineRepository.setMeta(
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
  item: Awaited<ReturnType<typeof quotationsSyncQueue.peekAll>>[number],
) {
  switch (item.operation) {
    case "createQuotation": {
      const payload = quotationsSyncQueue.parsePayload<CreateQuotationPayload>(
        item.payload,
      );
      const resolvedPayload = {
        ...payload,
        clientId: await resolveClientId(payload.clientId),
      };
      const created = await quotationsApi.create(resolvedPayload);
      await quotationsOfflineRepository.replaceLocalQuotation(
        item.entityId,
        created,
      );
      return;
    }
    case "updateQuotation": {
      const quotationId = await resolveQuotationId(item.entityId);
      const payload = quotationsSyncQueue.parsePayload<UpdateQuotationPayload>(
        item.payload,
      );
      const updated = await quotationsApi.update(quotationId, payload);
      await quotationsOfflineRepository.upsertQuotation(updated, "synced");
      return;
    }
    case "deleteQuotation": {
      const quotationId = await resolveQuotationId(item.entityId);
      await quotationsApi.remove(quotationId);
      const db = await import("../db/quotationsOffline.db").then((m) =>
        m.getQuotationsOfflineDb(),
      );
      await db?.quotations.delete(item.entityId);
      return;
    }
    default:
      throw new Error(`Opération inconnue : ${item.operation}`);
  }
}

async function pullLatestQuotations() {
  const page1 = await quotationsApi.list({ page: 1, limit: 100 });
  await Promise.all(
    page1.items.map((summary) =>
      quotationsOfflineRepository.upsertQuotation(
        { ...summary, lines: [] },
        "synced",
      ),
    ),
  );
}
