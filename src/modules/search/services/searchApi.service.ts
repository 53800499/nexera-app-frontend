import { apiClient } from "@/shared/http/apiClient";
import { GlobalSearchResponse } from "../types/search.types";

export const searchApi = {
  /**
   * Recherche globale multi-entités (Clients, Devis, Factures, Commandes, Catalogue, RH)
   */
  globalSearch: async (query: string): Promise<GlobalSearchResponse> => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      return {
        query: trimmed,
        totalMatches: 0,
        clients: [],
        quotations: [],
        invoices: [],
        orders: [],
        catalogItems: [],
        employes: [],
      };
    }

    try {
      return await apiClient<GlobalSearchResponse>(
        `/search?q=${encodeURIComponent(trimmed)}`,
        { auth: true }
      );
    } catch (error) {
      console.error("Erreur lors de la recherche globale:", error);
      return {
        query: trimmed,
        totalMatches: 0,
        clients: [],
        quotations: [],
        invoices: [],
        orders: [],
        catalogItems: [],
        employes: [],
      };
    }
  },
};
