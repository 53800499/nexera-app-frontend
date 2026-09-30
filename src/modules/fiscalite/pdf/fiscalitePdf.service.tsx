import React from "react";
import { pdf } from "@react-pdf/renderer";
import {
  TaxContribuable,
  TaxDeclarationTva,
  TaxEcheance,
  TaxExerciceFiscal,
  TaxLiasseFiscale,
  TaxRetenueAib,
} from "../types/fiscalite.types";
import { TvaDeclarationPdfDocument } from "./TvaDeclarationPdfDocument";
import { IsBordereauPdfDocument } from "./IsBordereauPdfDocument";
import { LiasseFiscalePdfDocument } from "./LiasseFiscalePdfDocument";
import { CalendrierFiscalPdfDocument } from "./CalendrierFiscalPdfDocument";
import { AibAttestationPdfDocument } from "./AibAttestationPdfDocument";
import { AibRecapPdfDocument } from "./AibRecapPdfDocument";
import {
  createPdfPreviewUrl,
  downloadPdfBlob,
  openPdfBlob,
} from "@/shared/pdf/pdfBlob";
import { sanitizePdfFileName } from "./fiscalitePdfFormat";
import type { FiscalitePdfPreviewState } from "../components/FiscalitePdfPreviewModal";

// 1. Déclaration de TVA
export async function generateTvaDeclarationPdfBlob(
  declaration: TaxDeclarationTva,
  contribuable?: TaxContribuable | null
): Promise<Blob> {
  return pdf(
    <TvaDeclarationPdfDocument
      declaration={declaration}
      contribuable={contribuable}
    />
  ).toBlob();
}

export async function downloadTvaDeclarationPdf(
  declaration: TaxDeclarationTva,
  contribuable?: TaxContribuable | null
): Promise<void> {
  const blob = await generateTvaDeclarationPdfBlob(declaration, contribuable);
  downloadPdfBlob(
    blob,
    `Declaration_TVA_${sanitizePdfFileName(declaration.periode)}.pdf`
  );
}

export async function openTvaDeclarationPdf(
  declaration: TaxDeclarationTva,
  contribuable?: TaxContribuable | null
): Promise<void> {
  const blob = await generateTvaDeclarationPdfBlob(declaration, contribuable);
  openPdfBlob(blob);
}

// 2. Bordereau d'IS & Acomptes
export async function generateIsBordereauPdfBlob(
  exercice: TaxExerciceFiscal,
  contribuable?: TaxContribuable | null
): Promise<Blob> {
  return pdf(
    <IsBordereauPdfDocument exercice={exercice} contribuable={contribuable} />
  ).toBlob();
}

export async function downloadIsBordereauPdf(
  exercice: TaxExerciceFiscal,
  contribuable?: TaxContribuable | null
): Promise<void> {
  const annee = exercice.dateDebut.substring(0, 4);
  const blob = await generateIsBordereauPdfBlob(exercice, contribuable);
  downloadPdfBlob(blob, `Bordereau_IS_Exercice_${sanitizePdfFileName(annee)}.pdf`);
}

export async function openIsBordereauPdf(
  exercice: TaxExerciceFiscal,
  contribuable?: TaxContribuable | null
): Promise<void> {
  const blob = await generateIsBordereauPdfBlob(exercice, contribuable);
  openPdfBlob(blob);
}

// 3. Liasse Fiscale SYSCOHADA
export async function generateLiasseFiscalePdfBlob(
  liasse: TaxLiasseFiscale,
  contribuable?: TaxContribuable | null
): Promise<Blob> {
  return pdf(
    <LiasseFiscalePdfDocument liasse={liasse} contribuable={contribuable} />
  ).toBlob();
}

export async function downloadLiasseFiscalePdf(
  liasse: TaxLiasseFiscale,
  contribuable?: TaxContribuable | null
): Promise<void> {
  const blob = await generateLiasseFiscalePdfBlob(liasse, contribuable);
  downloadPdfBlob(
    blob,
    `Liasse_Fiscale_SYSCOHADA_${sanitizePdfFileName(liasse.id.substring(0, 8))}.pdf`
  );
}

export async function openLiasseFiscalePdf(
  liasse: TaxLiasseFiscale,
  contribuable?: TaxContribuable | null
): Promise<void> {
  const blob = await generateLiasseFiscalePdfBlob(liasse, contribuable);
  openPdfBlob(blob);
}

// 4. Calendrier Fiscal Consolidé
export async function generateCalendrierFiscalPdfBlob(
  echeances: TaxEcheance[],
  contribuable?: TaxContribuable | null
): Promise<Blob> {
  return pdf(
    <CalendrierFiscalPdfDocument
      echeances={echeances}
      contribuable={contribuable}
    />
  ).toBlob();
}

export async function downloadCalendrierFiscalPdf(
  echeances: TaxEcheance[],
  contribuable?: TaxContribuable | null
): Promise<void> {
  const annee = new Date().getFullYear();
  const blob = await generateCalendrierFiscalPdfBlob(echeances, contribuable);
  downloadPdfBlob(blob, `Echeancier_Fiscal_${annee}.pdf`);
}

export async function openCalendrierFiscalPdf(
  echeances: TaxEcheance[],
  contribuable?: TaxContribuable | null
): Promise<void> {
  const blob = await generateCalendrierFiscalPdfBlob(echeances, contribuable);
  openPdfBlob(blob);
}

// 5. Attestation AIB
export async function generateAibAttestationPdfBlob(
  retenue: TaxRetenueAib,
  contribuable?: TaxContribuable | null
): Promise<Blob> {
  return pdf(
    <AibAttestationPdfDocument retenue={retenue} contribuable={contribuable} />
  ).toBlob();
}

export async function downloadAibAttestationPdf(
  retenue: TaxRetenueAib,
  contribuable?: TaxContribuable | null
): Promise<void> {
  const blob = await generateAibAttestationPdfBlob(retenue, contribuable);
  downloadPdfBlob(
    blob,
    `Attestation_Retenue_AIB_${sanitizePdfFileName(retenue.id.substring(0, 8))}.pdf`
  );
}

export async function openAibAttestationPdf(
  retenue: TaxRetenueAib,
  contribuable?: TaxContribuable | null
): Promise<void> {
  const blob = await generateAibAttestationPdfBlob(retenue, contribuable);
  openPdfBlob(blob);
}

// 6. Récapitulatif AIB consolidé
export async function generateAibRecapPdfBlob(
  retenues: TaxRetenueAib[],
  recap?: {
    totalSubi?: number;
    totalOpere?: number;
    nombreRetenues?: number;
  } | null,
  contribuable?: TaxContribuable | null
): Promise<Blob> {
  return pdf(
    <AibRecapPdfDocument
      retenues={retenues}
      recap={recap}
      contribuable={contribuable}
    />
  ).toBlob();
}

export async function downloadAibRecapPdf(
  retenues: TaxRetenueAib[],
  recap?: {
    totalSubi?: number;
    totalOpere?: number;
    nombreRetenues?: number;
  } | null,
  contribuable?: TaxContribuable | null
): Promise<void> {
  const annee = new Date().getFullYear();
  const blob = await generateAibRecapPdfBlob(retenues, recap, contribuable);
  downloadPdfBlob(blob, `Recapitulatif_AIB_Gestion_${annee}.pdf`);
}

export async function openAibRecapPdf(
  retenues: TaxRetenueAib[],
  recap?: {
    totalSubi?: number;
    totalOpere?: number;
    nombreRetenues?: number;
  } | null,
  contribuable?: TaxContribuable | null
): Promise<void> {
  const blob = await generateAibRecapPdfBlob(retenues, recap, contribuable);
  openPdfBlob(blob);
}

// -------------------------------------------------------------
// Builders d'état pour la modale d'aperçu intégré (meilleure UX)
// -------------------------------------------------------------

export async function buildTvaDeclarationPreviewState(
  declaration: TaxDeclarationTva,
  contribuable?: TaxContribuable | null
): Promise<FiscalitePdfPreviewState> {
  const blob = await generateTvaDeclarationPdfBlob(declaration, contribuable);
  const fileName = `Declaration_TVA_${sanitizePdfFileName(declaration.periode)}.pdf`;
  return {
    blob,
    url: createPdfPreviewUrl(blob),
    fileName,
    title: "Déclaration de TVA (e-TVA)",
    subtitle: `Période : ${declaration.periode} • Date limite légale : ${declaration.dateLimiteLegale}`,
  };
}

export async function buildIsBordereauPreviewState(
  exercice: TaxExerciceFiscal,
  contribuable?: TaxContribuable | null
): Promise<FiscalitePdfPreviewState> {
  const annee = exercice.dateDebut.substring(0, 4);
  const blob = await generateIsBordereauPdfBlob(exercice, contribuable);
  const fileName = `Bordereau_IS_Exercice_${sanitizePdfFileName(annee)}.pdf`;
  return {
    blob,
    url: createPdfPreviewUrl(blob),
    fileName,
    title: "Bordereau d'Acomptes & Liquidation de l'IS",
    subtitle: `Exercice Fiscal : ${annee} • Statut : ${exercice.statut}`,
  };
}

export async function buildLiasseFiscalePreviewState(
  liasse: TaxLiasseFiscale,
  contribuable?: TaxContribuable | null
): Promise<FiscalitePdfPreviewState> {
  const blob = await generateLiasseFiscalePdfBlob(liasse, contribuable);
  const fileName = `Liasse_Fiscale_SYSCOHADA_${sanitizePdfFileName(liasse.id.substring(0, 8))}.pdf`;
  return {
    blob,
    url: createPdfPreviewUrl(blob),
    fileName,
    title: "Liasse Fiscale Annuelle (SYSCOHADA Révisé)",
    subtitle: `Système : ${liasse.typeSystemeComptable || "Normal"} • Visa Cabinet : ${liasse.valideParCabinet ? "Certifié" : "En attente"}`,
  };
}

export async function buildCalendrierFiscalPreviewState(
  echeances: TaxEcheance[],
  contribuable?: TaxContribuable | null
): Promise<FiscalitePdfPreviewState> {
  const annee = new Date().getFullYear();
  const blob = await generateCalendrierFiscalPdfBlob(echeances, contribuable);
  const fileName = `Echeancier_Fiscal_${annee}.pdf`;
  return {
    blob,
    url: createPdfPreviewUrl(blob),
    fileName,
    title: "Calendrier & Échéancier Fiscal Consolidé",
    subtitle: `Gestion ${annee} • ${echeances.length} obligations fiscales référencées`,
  };
}

export async function buildAibAttestationPreviewState(
  retenue: TaxRetenueAib,
  contribuable?: TaxContribuable | null
): Promise<FiscalitePdfPreviewState> {
  const blob = await generateAibAttestationPdfBlob(retenue, contribuable);
  const fileName = `Attestation_Retenue_AIB_${sanitizePdfFileName(retenue.id.substring(0, 8))}.pdf`;
  return {
    blob,
    url: createPdfPreviewUrl(blob),
    fileName,
    title: "Attestation de Retenue à la Source (AIB)",
    subtitle: `Bénéficiaire : ${retenue.tiersNom || "Tiers"} • Taux : ${retenue.tauxApplique ?? retenue.taux ?? 1}%`,
  };
}

export async function buildAibRecapPreviewState(
  retenues: TaxRetenueAib[],
  recap?: {
    totalSubi?: number;
    totalOpere?: number;
    nombreRetenues?: number;
  } | null,
  contribuable?: TaxContribuable | null
): Promise<FiscalitePdfPreviewState> {
  const annee = new Date().getFullYear();
  const blob = await generateAibRecapPdfBlob(retenues, recap, contribuable);
  const fileName = `Recapitulatif_AIB_Gestion_${annee}.pdf`;
  return {
    blob,
    url: createPdfPreviewUrl(blob),
    fileName,
    title: "État Récapitulatif des Retenues AIB",
    subtitle: `Exercice ${annee} • ${retenues.length} opérations enregistrées`,
  };
}
