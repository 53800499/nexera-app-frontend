import { pdf } from "@react-pdf/renderer";
import React from "react";
import type { RhBulletinPaie } from "../types/rh.types";
import { BulletinPdfDocument } from "./BulletinPdfDocument";
import {
  createPdfPreviewUrl,
  downloadPdfBlob,
  openPdfBlob,
} from "@/shared/pdf/pdfBlob";
import { sanitizePdfFileName } from "@/modules/devis/pdf/quotationPdfFormat";

export function bulletinPdfFileName(bulletin: RhBulletinPaie): string {
  const matricule = bulletin.employe?.matricule || "SALARIE";
  const num = bulletin.numeroBulletin || "BP";
  const mois = bulletin.cyclePaie?.mois
    ? String(bulletin.cyclePaie.mois).padStart(2, "0")
    : "00";
  const annee = bulletin.cyclePaie?.annee || 2026;

  return `bulletin-paie-${sanitizePdfFileName(matricule)}-${mois}_${annee}-${sanitizePdfFileName(num)}.pdf`;
}

export async function generateBulletinPdfBlob(
  bulletin: RhBulletinPaie,
): Promise<Blob> {
  return pdf(<BulletinPdfDocument bulletin={bulletin} />).toBlob();
}

export async function downloadBulletinPdf(bulletin: RhBulletinPaie): Promise<void> {
  const blob = await generateBulletinPdfBlob(bulletin);
  downloadPdfBlob(blob, bulletinPdfFileName(bulletin));
}

export async function openBulletinPdf(bulletin: RhBulletinPaie): Promise<void> {
  const blob = await generateBulletinPdfBlob(bulletin);
  openPdfBlob(blob);
}

export async function createBulletinPreviewUrl(
  bulletin: RhBulletinPaie,
): Promise<{ blob: Blob; url: string; fileName: string }> {
  const blob = await generateBulletinPdfBlob(bulletin);
  return {
    blob,
    url: createPdfPreviewUrl(blob),
    fileName: bulletinPdfFileName(bulletin),
  };
}
