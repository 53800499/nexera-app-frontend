"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { ndfApi } from "../services/ndfApi.service";

// ----------------------------------------------------
// DASHBOARD
// ----------------------------------------------------

export const NDF_DASHBOARD_QUERY_KEY = ["notes-frais", "dashboard"] as const;

export function useNdfDashboard() {
  const queryEnabled = useQueryEnabled();

  const query = useQuery({
    queryKey: NDF_DASHBOARD_QUERY_KEY,
    queryFn: () => ndfApi.getDashboardStats(),
    enabled: queryEnabled,
    staleTime: 1000 * 60 * 2,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ----------------------------------------------------
// RÉFÉRENTIEL & BARÈMES
// ----------------------------------------------------

export function useNdfReferentiel(paysCode = "BJ") {
  const queryEnabled = useQueryEnabled();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["notes-frais", "categories", paysCode],
    queryFn: () => ndfApi.listCategories(paysCode),
    enabled: queryEnabled,
    staleTime: 1000 * 60 * 10,
  });

  const baremesKmQuery = useQuery({
    queryKey: ["notes-frais", "baremes-km", paysCode],
    queryFn: () => ndfApi.listBaremesKm(paysCode),
    enabled: queryEnabled,
    staleTime: 1000 * 60 * 10,
  });

  const baremesPerDiemQuery = useQuery({
    queryKey: ["notes-frais", "baremes-per-diem", paysCode],
    queryFn: () => ndfApi.listBaremesPerDiem(paysCode),
    enabled: queryEnabled,
    staleTime: 1000 * 60 * 10,
  });

  const parametresPaysQuery = useQuery({
    queryKey: ["notes-frais", "parametres-pays", paysCode],
    queryFn: () => ndfApi.listParametresPays(paysCode),
    enabled: queryEnabled,
    staleTime: 1000 * 60 * 10,
  });

  const politiquesQuery = useQuery({
    queryKey: ["notes-frais", "politiques"],
    queryFn: () => ndfApi.listPolitiques(),
    enabled: queryEnabled,
    staleTime: 1000 * 60 * 5,
  });

  return {
    categories: categoriesQuery.data || [],
    baremesKm: baremesKmQuery.data || [],
    baremesPerDiem: baremesPerDiemQuery.data || [],
    parametresPays: parametresPaysQuery.data || [],
    politiques: politiquesQuery.data || [],
    refetchCategories: () =>
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "categories"] }),
    refetchPolitiques: () =>
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "politiques"] }),
    isLoading:
      categoriesQuery.isLoading ||
      baremesKmQuery.isLoading ||
      baremesPerDiemQuery.isLoading,
  };
}

// ----------------------------------------------------
// DÉPENSES
// ----------------------------------------------------

export function useDepenses(params?: {
  ndfRapportFraisId?: string;
  categorieDepenseId?: string;
  statut?: string;
}) {
  const queryEnabled = useQueryEnabled();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notes-frais", "depenses", params],
    queryFn: () => ndfApi.listDepenses(params),
    enabled: queryEnabled,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => ndfApi.createDepense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "depenses"] });
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "rapports"] });
      queryClient.invalidateQueries({ queryKey: NDF_DASHBOARD_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      ndfApi.updateDepense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "depenses"] });
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "rapports"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ndfApi.deleteDepense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "depenses"] });
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "rapports"] });
    },
  });

  return {
    depenses: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createDepense: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateDepense: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteDepense: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    refetch: query.refetch,
  };
}

// ----------------------------------------------------
// RAPPORTS DE FRAIS
// ----------------------------------------------------

export function useRapportsFrais(params?: {
  employeRefId?: string;
  statut?: string;
}) {
  const queryEnabled = useQueryEnabled();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notes-frais", "rapports", params],
    queryFn: () => ndfApi.listRapports(params),
    enabled: queryEnabled,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => ndfApi.createRapport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "rapports"] });
      queryClient.invalidateQueries({ queryKey: NDF_DASHBOARD_QUERY_KEY });
    },
  });

  const soumettreMutation = useMutation({
    mutationFn: (id: string) => ndfApi.soumettreRapport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "rapports"] });
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "anomalies"] });
      queryClient.invalidateQueries({ queryKey: NDF_DASHBOARD_QUERY_KEY });
    },
  });

  const validerMutation = useMutation({
    mutationFn: ({ id, commentaire }: { id: string; commentaire?: string }) =>
      ndfApi.validerRapport(id, commentaire),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "rapports"] });
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "remboursements"] });
      queryClient.invalidateQueries({ queryKey: NDF_DASHBOARD_QUERY_KEY });
    },
  });

  const rejeterMutation = useMutation({
    mutationFn: ({ id, motifRejet }: { id: string; motifRejet: string }) =>
      ndfApi.rejeterRapport(id, motifRejet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "rapports"] });
      queryClient.invalidateQueries({ queryKey: NDF_DASHBOARD_QUERY_KEY });
    },
  });

  return {
    rapports: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createRapport: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    soumettreRapport: soumettreMutation.mutateAsync,
    isSubmitting: soumettreMutation.isPending,
    validerRapport: validerMutation.mutateAsync,
    isValidating: validerMutation.isPending,
    rejeterRapport: rejeterMutation.mutateAsync,
    isRejecting: rejeterMutation.isPending,
    refetch: query.refetch,
  };
}

// ----------------------------------------------------
// MISSIONS & AVANCES
// ----------------------------------------------------

export function useMissions(params?: {
  employeRefId?: string;
  statut?: string;
}) {
  const queryEnabled = useQueryEnabled();
  const queryClient = useQueryClient();

  const missionsQuery = useQuery({
    queryKey: ["notes-frais", "missions", params],
    queryFn: () => ndfApi.listMissions(params),
    enabled: queryEnabled,
  });

  const avancesQuery = useQuery({
    queryKey: ["notes-frais", "avances", params],
    queryFn: () => ndfApi.listAvances(params),
    enabled: queryEnabled,
  });

  const createMissionMutation = useMutation({
    mutationFn: (data: any) => ndfApi.createMission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "missions"] });
    },
  });

  const createAvanceMutation = useMutation({
    mutationFn: (data: any) => ndfApi.createAvance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "avances"] });
    },
  });

  const regulariserAvanceMutation = useMutation({
    mutationFn: ({ id, montant }: { id: string; montant: number }) =>
      ndfApi.regulariserAvance(id, montant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "avances"] });
    },
  });

  return {
    missions: missionsQuery.data || [],
    avances: avancesQuery.data || [],
    isLoading: missionsQuery.isLoading || avancesQuery.isLoading,
    createMission: createMissionMutation.mutateAsync,
    createAvance: createAvanceMutation.mutateAsync,
    regulariserAvance: regulariserAvanceMutation.mutateAsync,
  };
}

// ----------------------------------------------------
// REMBOURSEMENTS & CARTES
// ----------------------------------------------------

export function useRemboursements(statut?: string) {
  const queryEnabled = useQueryEnabled();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notes-frais", "remboursements", statut],
    queryFn: () => ndfApi.listRemboursements(statut),
    enabled: queryEnabled,
  });

  const payerMutation = useMutation({
    mutationFn: ({
      id,
      dateRemboursement,
      referenceBancaire,
    }: {
      id: string;
      dateRemboursement: string;
      referenceBancaire?: string;
    }) => ndfApi.payerRemboursement(id, { dateRemboursement, referenceBancaire }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "remboursements"] });
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "rapports"] });
      queryClient.invalidateQueries({ queryKey: NDF_DASHBOARD_QUERY_KEY });
    },
  });

  const basculerPaieMutation = useMutation({
    mutationFn: ({
      id,
      periodePaieCible,
    }: {
      id: string;
      periodePaieCible: string;
    }) => ndfApi.basculerSurBulletinPaie(id, periodePaieCible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "remboursements"] });
    },
  });

  return {
    remboursements: query.data || [],
    isLoading: query.isLoading,
    payerRemboursement: payerMutation.mutateAsync,
    isPaying: payerMutation.isPending,
    basculerSurBulletinPaie: basculerPaieMutation.mutateAsync,
    isPushingPaie: basculerPaieMutation.isPending,
    refetch: query.refetch,
  };
}

// ----------------------------------------------------
// IA & OCR
// ----------------------------------------------------

export function useNdfIa(rapportId?: string) {
  const queryEnabled = useQueryEnabled();
  const queryClient = useQueryClient();

  const anomaliesQuery = useQuery({
    queryKey: ["notes-frais", "anomalies", rapportId],
    queryFn: () => ndfApi.listAnomalies(rapportId),
    enabled: queryEnabled,
  });

  const scanMutation = useMutation({
    mutationFn: (data: { fichierUrl: string; typeFichier?: string }) =>
      ndfApi.scanJustificatif(data),
  });

  const auditerMutation = useMutation({
    mutationFn: (id: string) => ndfApi.auditerRapport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "rapports"] });
      queryClient.invalidateQueries({ queryKey: NDF_DASHBOARD_QUERY_KEY });
    },
  });

  const traiterAnomalieMutation = useMutation({
    mutationFn: ({
      id,
      statut,
      motif,
    }: {
      id: string;
      statut: "CONFIRMEE" | "ECARTEE_FAUX_POSITIF";
      motif?: string;
    }) => ndfApi.traiterAnomalie(id, { statut, motif }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes-frais", "anomalies"] });
      queryClient.invalidateQueries({ queryKey: NDF_DASHBOARD_QUERY_KEY });
    },
  });

  return {
    anomalies: anomaliesQuery.data || [],
    isLoadingAnomalies: anomaliesQuery.isLoading,
    scannerJustificatif: scanMutation.mutateAsync,
    isScanning: scanMutation.isPending,
    auditerRapport: auditerMutation.mutateAsync,
    isAuditing: auditerMutation.isPending,
    traiterAnomalie: traiterAnomalieMutation.mutateAsync,
    isResolvingAnomalie: traiterAnomalieMutation.isPending,
    refetchAnomalies: anomaliesQuery.refetch,
  };
}
