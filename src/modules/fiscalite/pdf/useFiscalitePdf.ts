"use client";

import { useCallback, useEffect, useState } from "react";
import {
  TaxContribuable,
  TaxDeclarationTva,
  TaxEcheance,
  TaxExerciceFiscal,
  TaxLiasseFiscale,
  TaxRetenueAib,
} from "../types/fiscalite.types";
import {
  buildAibAttestationPreviewState,
  buildAibRecapPreviewState,
  buildCalendrierFiscalPreviewState,
  buildIsBordereauPreviewState,
  buildLiasseFiscalePreviewState,
  buildTvaDeclarationPreviewState,
  downloadAibAttestationPdf,
  downloadAibRecapPdf,
  downloadCalendrierFiscalPdf,
  downloadIsBordereauPdf,
  downloadLiasseFiscalePdf,
  downloadTvaDeclarationPdf,
} from "./fiscalitePdf.service";
import { useToast } from "@/shared/components/feedback";
import { revokePdfPreviewUrl } from "@/shared/pdf/pdfBlob";
import type { FiscalitePdfPreviewState } from "../components/FiscalitePdfPreviewModal";

export type { FiscalitePdfPreviewState };
export type FiscalitePdfExportMode = "download" | "open" | "preview";

export function useFiscalitePdf() {
  const [isExporting, setIsExporting] = useState(false);
  const [preview, setPreview] = useState<FiscalitePdfPreviewState | null>(null);
  const toast = useToast();

  const closePreview = useCallback(() => {
    setPreview((current) => {
      if (current) revokePdfPreviewUrl(current.url);
      return null;
    });
  }, []);

  useEffect(() => {
    const url = preview?.url;
    return () => {
      if (url) revokePdfPreviewUrl(url);
    };
  }, [preview?.url]);

  // 1. Déclaration TVA
  const previewTva = useCallback(
    async (
      declaration: TaxDeclarationTva,
      contribuable?: TaxContribuable | null
    ) => {
      try {
        setIsExporting(true);
        closePreview();
        const state = await buildTvaDeclarationPreviewState(
          declaration,
          contribuable
        );
        setPreview(state);
      } catch (err) {
        console.error("Erreur aperçu TVA:", err);
        toast.error(
          "Erreur d'aperçu",
          "Impossible de générer l'aperçu PDF de la déclaration TVA."
        );
      } finally {
        setIsExporting(false);
      }
    },
    [closePreview, toast]
  );

  const downloadTva = useCallback(
    async (
      declaration: TaxDeclarationTva,
      contribuable?: TaxContribuable | null
    ) => {
      try {
        setIsExporting(true);
        await downloadTvaDeclarationPdf(declaration, contribuable);
        toast.success(
          "Déclaration TVA exportée",
          `La déclaration pour la période ${declaration.periode} a été téléchargée en PDF.`
        );
      } catch (err) {
        console.error("Erreur génération PDF TVA:", err);
        toast.error(
          "Erreur d'exportation",
          "Impossible de générer le document PDF de la déclaration TVA."
        );
      } finally {
        setIsExporting(false);
      }
    },
    [toast]
  );

  const exportTva = async (
    declaration: TaxDeclarationTva,
    contribuable?: TaxContribuable | null,
    mode: FiscalitePdfExportMode = "download"
  ) => {
    if (mode === "download") {
      await downloadTva(declaration, contribuable);
    } else {
      await previewTva(declaration, contribuable);
    }
  };

  // 2. Bordereau IS
  const previewIs = useCallback(
    async (
      exercice: TaxExerciceFiscal,
      contribuable?: TaxContribuable | null
    ) => {
      try {
        setIsExporting(true);
        closePreview();
        const state = await buildIsBordereauPreviewState(exercice, contribuable);
        setPreview(state);
      } catch (err) {
        console.error("Erreur aperçu IS:", err);
        toast.error(
          "Erreur d'aperçu",
          "Impossible de générer l'aperçu du bordereau d'IS."
        );
      } finally {
        setIsExporting(false);
      }
    },
    [closePreview, toast]
  );

  const downloadIs = useCallback(
    async (
      exercice: TaxExerciceFiscal,
      contribuable?: TaxContribuable | null
    ) => {
      try {
        setIsExporting(true);
        await downloadIsBordereauPdf(exercice, contribuable);
        toast.success(
          "Bordereau IS exporté",
          "Le bordereau d'IS de l'exercice a été téléchargé en PDF."
        );
      } catch (err) {
        console.error("Erreur génération PDF IS:", err);
        toast.error(
          "Erreur d'exportation",
          "Impossible de générer le bordereau PDF de liquidation de l'IS."
        );
      } finally {
        setIsExporting(false);
      }
    },
    [toast]
  );

  const exportIs = async (
    exercice: TaxExerciceFiscal,
    contribuable?: TaxContribuable | null,
    mode: FiscalitePdfExportMode = "download"
  ) => {
    if (mode === "download") {
      await downloadIs(exercice, contribuable);
    } else {
      await previewIs(exercice, contribuable);
    }
  };

  // 3. Liasse Fiscale
  const previewLiasse = useCallback(
    async (
      liasse: TaxLiasseFiscale,
      contribuable?: TaxContribuable | null
    ) => {
      try {
        setIsExporting(true);
        closePreview();
        const state = await buildLiasseFiscalePreviewState(liasse, contribuable);
        setPreview(state);
      } catch (err) {
        console.error("Erreur aperçu Liasse:", err);
        toast.error(
          "Erreur d'aperçu",
          "Impossible de générer l'aperçu de la liasse fiscale."
        );
      } finally {
        setIsExporting(false);
      }
    },
    [closePreview, toast]
  );

  const downloadLiasse = useCallback(
    async (
      liasse: TaxLiasseFiscale,
      contribuable?: TaxContribuable | null
    ) => {
      try {
        setIsExporting(true);
        await downloadLiasseFiscalePdf(liasse, contribuable);
        toast.success(
          "Liasse Fiscale exportée",
          "La liasse fiscale SYSCOHADA a été générée et téléchargée en PDF."
        );
      } catch (err) {
        console.error("Erreur génération PDF Liasse:", err);
        toast.error(
          "Erreur d'exportation",
          "Impossible de générer la liasse fiscale PDF."
        );
      } finally {
        setIsExporting(false);
      }
    },
    [toast]
  );

  const exportLiasse = async (
    liasse: TaxLiasseFiscale,
    contribuable?: TaxContribuable | null,
    mode: FiscalitePdfExportMode = "download"
  ) => {
    if (mode === "download") {
      await downloadLiasse(liasse, contribuable);
    } else {
      await previewLiasse(liasse, contribuable);
    }
  };

  // 4. Calendrier Fiscal
  const previewCalendrier = useCallback(
    async (
      echeances: TaxEcheance[],
      contribuable?: TaxContribuable | null
    ) => {
      try {
        setIsExporting(true);
        closePreview();
        const state = await buildCalendrierFiscalPreviewState(
          echeances,
          contribuable
        );
        setPreview(state);
      } catch (err) {
        console.error("Erreur aperçu Calendrier:", err);
        toast.error(
          "Erreur d'aperçu",
          "Impossible de générer l'aperçu du calendrier fiscal."
        );
      } finally {
        setIsExporting(false);
      }
    },
    [closePreview, toast]
  );

  const downloadCalendrier = useCallback(
    async (
      echeances: TaxEcheance[],
      contribuable?: TaxContribuable | null
    ) => {
      try {
        setIsExporting(true);
        await downloadCalendrierFiscalPdf(echeances, contribuable);
        toast.success(
          "Échéancier fiscal exporté",
          "Le calendrier consolidé des échéances a été téléchargé en PDF."
        );
      } catch (err) {
        console.error("Erreur génération PDF Calendrier:", err);
        toast.error(
          "Erreur d'exportation",
          "Impossible de générer le calendrier fiscal en PDF."
        );
      } finally {
        setIsExporting(false);
      }
    },
    [toast]
  );

  const exportCalendrier = async (
    echeances: TaxEcheance[],
    contribuable?: TaxContribuable | null,
    mode: FiscalitePdfExportMode = "download"
  ) => {
    if (mode === "download") {
      await downloadCalendrier(echeances, contribuable);
    } else {
      await previewCalendrier(echeances, contribuable);
    }
  };

  // 5. Attestation AIB
  const previewAib = useCallback(
    async (
      retenue: TaxRetenueAib,
      contribuable?: TaxContribuable | null
    ) => {
      try {
        setIsExporting(true);
        closePreview();
        const state = await buildAibAttestationPreviewState(
          retenue,
          contribuable
        );
        setPreview(state);
      } catch (err) {
        console.error("Erreur aperçu AIB:", err);
        toast.error(
          "Erreur d'aperçu",
          "Impossible de générer l'aperçu de l'attestation AIB."
        );
      } finally {
        setIsExporting(false);
      }
    },
    [closePreview, toast]
  );

  const downloadAib = useCallback(
    async (
      retenue: TaxRetenueAib,
      contribuable?: TaxContribuable | null
    ) => {
      try {
        setIsExporting(true);
        await downloadAibAttestationPdf(retenue, contribuable);
        toast.success(
          "Attestation AIB exportée",
          "L'attestation de retenue à la source a été générée en PDF."
        );
      } catch (err) {
        console.error("Erreur génération PDF AIB:", err);
        toast.error(
          "Erreur d'exportation",
          "Impossible de générer l'attestation PDF AIB."
        );
      } finally {
        setIsExporting(false);
      }
    },
    [toast]
  );

  const exportAib = async (
    retenue: TaxRetenueAib,
    contribuable?: TaxContribuable | null,
    mode: FiscalitePdfExportMode = "download"
  ) => {
    if (mode === "download") {
      await downloadAib(retenue, contribuable);
    } else {
      await previewAib(retenue, contribuable);
    }
  };

  // 6. Récapitulatif consolidé AIB
  const previewAibRecap = useCallback(
    async (
      retenues: TaxRetenueAib[],
      recap?: {
        totalSubi?: number;
        totalOpere?: number;
        nombreRetenues?: number;
      } | null,
      contribuable?: TaxContribuable | null
    ) => {
      try {
        setIsExporting(true);
        closePreview();
        const state = await buildAibRecapPreviewState(
          retenues,
          recap,
          contribuable
        );
        setPreview(state);
      } catch (err) {
        console.error("Erreur aperçu Récap AIB:", err);
        toast.error(
          "Erreur d'aperçu",
          "Impossible de générer l'aperçu du récapitulatif AIB."
        );
      } finally {
        setIsExporting(false);
      }
    },
    [closePreview, toast]
  );

  const downloadAibRecap = useCallback(
    async (
      retenues: TaxRetenueAib[],
      recap?: {
        totalSubi?: number;
        totalOpere?: number;
        nombreRetenues?: number;
      } | null,
      contribuable?: TaxContribuable | null
    ) => {
      try {
        setIsExporting(true);
        await downloadAibRecapPdf(retenues, recap, contribuable);
        toast.success(
          "Récapitulatif AIB exporté",
          "L'état récapitulatif des retenues AIB a été téléchargé en PDF."
        );
      } catch (err) {
        console.error("Erreur génération PDF Récap AIB:", err);
        toast.error(
          "Erreur d'exportation",
          "Impossible de générer le récapitulatif PDF AIB."
        );
      } finally {
        setIsExporting(false);
      }
    },
    [toast]
  );

  return {
    isExporting,
    preview,
    closePreview,
    previewTva,
    downloadTva,
    exportTva,
    previewIs,
    downloadIs,
    exportIs,
    previewLiasse,
    downloadLiasse,
    exportLiasse,
    previewCalendrier,
    downloadCalendrier,
    exportCalendrier,
    previewAib,
    downloadAib,
    exportAib,
    previewAibRecap,
    downloadAibRecap,
  };
}
