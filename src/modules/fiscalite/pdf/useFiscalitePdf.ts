"use client";

import { useState } from "react";
import {
  TaxContribuable,
  TaxDeclarationTva,
  TaxEcheance,
  TaxExerciceFiscal,
  TaxLiasseFiscale,
  TaxRetenueAib,
} from "../types/fiscalite.types";
import {
  downloadAibAttestationPdf,
  downloadCalendrierFiscalPdf,
  downloadIsBordereauPdf,
  downloadLiasseFiscalePdf,
  downloadTvaDeclarationPdf,
  openAibAttestationPdf,
  openCalendrierFiscalPdf,
  openIsBordereauPdf,
  openLiasseFiscalePdf,
  openTvaDeclarationPdf,
} from "./fiscalitePdf.service";
import { useToast } from "@/shared/components/feedback";

export type FiscalitePdfExportMode = "download" | "open" | "preview";

export function useFiscalitePdf() {
  const [isExporting, setIsExporting] = useState(false);
  const toast = useToast();

  // Export Déclaration TVA
  const exportTva = async (
    declaration: TaxDeclarationTva,
    contribuable?: TaxContribuable | null,
    mode: FiscalitePdfExportMode = "download"
  ) => {
    try {
      setIsExporting(true);
      if (mode === "download") {
        await downloadTvaDeclarationPdf(declaration, contribuable);
        toast.success(
          "Déclaration TVA exportée",
          `La déclaration pour la période ${declaration.periode} a été téléchargée en PDF.`
        );
      } else {
        await openTvaDeclarationPdf(declaration, contribuable);
      }
    } catch (err) {
      console.error("Erreur génération PDF TVA:", err);
      toast.error(
        "Erreur d'exportation",
        "Impossible de générer le document PDF de la déclaration TVA."
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Export Bordereau IS
  const exportIs = async (
    exercice: TaxExerciceFiscal,
    contribuable?: TaxContribuable | null,
    mode: FiscalitePdfExportMode = "download"
  ) => {
    try {
      setIsExporting(true);
      if (mode === "download") {
        await downloadIsBordereauPdf(exercice, contribuable);
        toast.success(
          "Bordereau IS exporté",
          `Le bordereau d'IS de l'exercice a été téléchargé en PDF.`
        );
      } else {
        await openIsBordereauPdf(exercice, contribuable);
      }
    } catch (err) {
      console.error("Erreur génération PDF IS:", err);
      toast.error(
        "Erreur d'exportation",
        "Impossible de générer le bordereau PDF de liquidation de l'IS."
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Export Liasse Fiscale
  const exportLiasse = async (
    liasse: TaxLiasseFiscale,
    contribuable?: TaxContribuable | null,
    mode: FiscalitePdfExportMode = "download"
  ) => {
    try {
      setIsExporting(true);
      if (mode === "download") {
        await downloadLiasseFiscalePdf(liasse, contribuable);
        toast.success(
          "Liasse Fiscale exportée",
          "La liasse fiscale SYSCOHADA a été générée et téléchargée en PDF."
        );
      } else {
        await openLiasseFiscalePdf(liasse, contribuable);
      }
    } catch (err) {
      console.error("Erreur génération PDF Liasse:", err);
      toast.error(
        "Erreur d'exportation",
        "Impossible de générer la liasse fiscale PDF."
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Export Calendrier Fiscal
  const exportCalendrier = async (
    echeances: TaxEcheance[],
    contribuable?: TaxContribuable | null,
    mode: FiscalitePdfExportMode = "download"
  ) => {
    try {
      setIsExporting(true);
      if (mode === "download") {
        await downloadCalendrierFiscalPdf(echeances, contribuable);
        toast.success(
          "Échéancier fiscal exporté",
          "Le calendrier consolidé des échéances a été téléchargé en PDF."
        );
      } else {
        await openCalendrierFiscalPdf(echeances, contribuable);
      }
    } catch (err) {
      console.error("Erreur génération PDF Calendrier:", err);
      toast.error(
        "Erreur d'exportation",
        "Impossible de générer le calendrier fiscal en PDF."
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Export Attestation AIB
  const exportAib = async (
    retenue: TaxRetenueAib,
    contribuable?: TaxContribuable | null,
    mode: FiscalitePdfExportMode = "download"
  ) => {
    try {
      setIsExporting(true);
      if (mode === "download") {
        await downloadAibAttestationPdf(retenue, contribuable);
        toast.success(
          "Attestation AIB exportée",
          "L'attestation de retenue à la source a été générée en PDF."
        );
      } else {
        await openAibAttestationPdf(retenue, contribuable);
      }
    } catch (err) {
      console.error("Erreur génération PDF AIB:", err);
      toast.error(
        "Erreur d'exportation",
        "Impossible de générer l'attestation PDF AIB."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportTva,
    exportIs,
    exportLiasse,
    exportCalendrier,
    exportAib,
  };
}
