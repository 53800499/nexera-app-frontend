"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { alertsApi } from "@/modules/stock/alerts/services/alertsApi.service";
import { fiscaliteApi } from "@/modules/fiscalite/services/fiscaliteApi.service";
import { comptabiliteApi } from "@/modules/comptabilite/services/comptabiliteApi.service";
import { rhApi } from "@/modules/rh/services/rhApi.service";
import { ndfApi } from "@/modules/notes-frais/services/ndfApi.service";

export interface ExecutiveAuxiliaryMetrics {
  stock: {
    openAlertsCount: number;
    pendingReplenishments: number;
    hasCriticalShortage: boolean;
  };
  fiscalite: {
    tvaNetteMois: number;
    creditTvaReporte: number;
    prochainesEcheancesCount: number;
    echeancesProches: Array<{
      dateLimite: string;
      libelle: string;
      statut: string;
    }>;
  };
  comptabilite: {
    ecrituresEnAttenteCount: number;
    totalDebitEnAttente: number;
  };
  rh: {
    totalActifs: number;
    masseSalarialeBrute: number;
    absencesEnAttente: number;
    dernierCycleStatut?: string;
  };
  notesFrais: {
    rapportsEnAttenteCount: number;
    montantEnAttente: number;
    anomaliesCount: number;
  };
}

export function useExecutiveAuxiliaryMetrics() {
  const queryEnabled = useQueryEnabled();

  const stockQuery = useQuery({
    queryKey: ["dashboard", "aux", "stock-alerts"],
    queryFn: async () => {
      try {
        return await alertsApi.summary();
      } catch {
        return null;
      }
    },
    enabled: queryEnabled,
    retry: false,
    staleTime: 60_000,
  });

  const fiscaliteQuery = useQuery({
    queryKey: ["dashboard", "aux", "fiscalite-kpis"],
    queryFn: async () => {
      try {
        return await fiscaliteApi.getDashboardKpis();
      } catch {
        return null;
      }
    },
    enabled: queryEnabled,
    retry: false,
    staleTime: 60_000,
  });

  const comptaQuery = useQuery({
    queryKey: ["dashboard", "aux", "compta-pending"],
    queryFn: async () => {
      try {
        return await comptabiliteApi.getEcritures({ statut: "BROUILLON" });
      } catch {
        return null;
      }
    },
    enabled: queryEnabled,
    retry: false,
    staleTime: 60_000,
  });

  const rhQuery = useQuery({
    queryKey: ["dashboard", "aux", "rh-summary"],
    queryFn: async () => {
      try {
        return await rhApi.getDashboardSummary();
      } catch {
        return null;
      }
    },
    enabled: queryEnabled,
    retry: false,
    staleTime: 60_000,
  });

  const ndfQuery = useQuery({
    queryKey: ["dashboard", "aux", "ndf-stats"],
    queryFn: async () => {
      try {
        return await ndfApi.getDashboardStats();
      } catch {
        return null;
      }
    },
    enabled: queryEnabled,
    retry: false,
    staleTime: 60_000,
  });

  const stockData = stockQuery.data;
  const fiscaliteData = fiscaliteQuery.data;
  const comptaData = comptaQuery.data;
  const rhData = rhQuery.data;
  const ndfData = ndfQuery.data;

  const comptaDebitTotal = Array.isArray(comptaData)
    ? comptaData.reduce(
        (sum, e) =>
          sum +
          (e.lignes?.reduce(
            (lSum: number, l: any) => lSum + (Number(l.montantDebit) || 0),
            0,
          ) || 0),
        0,
      )
    : 0;

  const metrics: ExecutiveAuxiliaryMetrics = {
    stock: {
      openAlertsCount: stockData?.openCount ?? 0,
      pendingReplenishments: stockData?.pendingReplenishments ?? 0,
      hasCriticalShortage:
        stockData?.byType?.some(
          (t) => t.severity === "critical" || t.alertType === "shortage",
        ) ?? false,
    },
    fiscalite: {
      tvaNetteMois: fiscaliteData?.kpis?.tvaNetteMois ?? 0,
      creditTvaReporte: fiscaliteData?.kpis?.creditTvaReporte ?? 0,
      prochainesEcheancesCount:
        fiscaliteData?.kpis?.prochainesEcheancesCount ??
        fiscaliteData?.prochainesEcheances?.length ??
        0,
      echeancesProches: (fiscaliteData?.prochainesEcheances || []).slice(0, 3).map((e) => ({
        dateLimite: e.dateLimite,
        libelle: e.taxType?.libelle || e.periodeOuExercice || "Échéance fiscale",
        statut: e.statut,
      })),
    },
    comptabilite: {
      ecrituresEnAttenteCount: Array.isArray(comptaData) ? comptaData.length : 0,
      totalDebitEnAttente: comptaDebitTotal,
    },
    rh: {
      totalActifs: rhData?.kpi?.totalActifs ?? 0,
      masseSalarialeBrute: rhData?.kpi?.masseSalarialeBrute ?? 0,
      absencesEnAttente: rhData?.kpi?.absencesEnAttente ?? 0,
      dernierCycleStatut: rhData?.dernierCycle?.statut,
    },
    notesFrais: {
      rapportsEnAttenteCount: ndfData?.nombreRapportsEnAttenteValidation ?? 0,
      montantEnAttente: ndfData?.montantEnAttenteRemboursement ?? 0,
      anomaliesCount: ndfData?.nombreAnomaliesDetectees ?? 0,
    },
  };

  const isLoading =
    stockQuery.isLoading ||
    fiscaliteQuery.isLoading ||
    comptaQuery.isLoading ||
    rhQuery.isLoading ||
    ndfQuery.isLoading;

  const refetchAll = () => {
    stockQuery.refetch();
    fiscaliteQuery.refetch();
    comptaQuery.refetch();
    rhQuery.refetch();
    ndfQuery.refetch();
  };

  return {
    metrics,
    isLoading,
    refetchAll,
  };
}
