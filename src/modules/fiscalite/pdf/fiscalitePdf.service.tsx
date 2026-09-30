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
import {
  createPdfPreviewUrl,
  downloadPdfBlob,
  openPdfBlob,
} from "@/shared/pdf/pdfBlob";
import { sanitizePdfFileName } from "./fiscalitePdfFormat";

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
