import {
  filterCatalogueItems,
  getReferenceDataCache,
  readReferenceDataWithCache,
  shouldFallbackToCache,
} from "@/shared/offline/referenceDataOffline.service";
import { settingsApi } from "@/modules/parametres/services/settingsApi.service";
import type { TaxRate } from "@/modules/parametres/types/settings.types";
import { catalogueApi } from "./catalogueApi.service";
import type { CatalogItem } from "../types/catalogue.types";

const TAX_RATES_CACHE_KEY = "tax-rates";
const CATALOGUE_ITEMS_CACHE_KEY = "catalogue-items";

export const catalogueReferenceService = {
  listTaxRates(): Promise<TaxRate[]> {
    return readReferenceDataWithCache({
      key: TAX_RATES_CACHE_KEY,
      onlineReader: () => settingsApi.listTaxRates(),
      hasUsableCache: (rates) => rates.length > 0,
    });
  },

  async listItems(query?: string): Promise<CatalogItem[]> {
    const q = query?.trim();

    try {
      if (!q) {
        return await readReferenceDataWithCache({
          key: CATALOGUE_ITEMS_CACHE_KEY,
          onlineReader: () => catalogueApi.listItems(),
          hasUsableCache: (items) => items.length > 0,
        });
      }

      return await catalogueApi.listItems(q);
    } catch (error) {
      const cached = getReferenceDataCache<CatalogItem[]>(CATALOGUE_ITEMS_CACHE_KEY);
      if (cached?.length && shouldFallbackToCache(error)) {
        return filterCatalogueItems(cached, q);
      }
      throw error;
    }
  },
};
