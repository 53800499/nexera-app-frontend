"use client";

import { useState } from "react";
import type { RhBulletinPaie } from "../types/rh.types";
import {
  downloadBulletinPdf,
  openBulletinPdf,
} from "./bulletinPdf.service";
import { useToast } from "@/shared/components/feedback";

export function useBulletinPdf() {
  const [isExporting, setIsExporting] = useState(false);
  const toast = useToast();

  const handleDownload = async (bulletin: RhBulletinPaie) => {
    try {
      setIsExporting(true);
      await downloadBulletinPdf(bulletin);
      toast.success(
        "Bulletin exporté",
        `Le bulletin ${bulletin.numeroBulletin} a été téléchargé en PDF.`,
      );
    } catch (error) {
      console.warn("Erreur lors de l'exportation du bulletin en PDF:", error);
      toast.error(
        "Erreur d'exportation",
        "Impossible de générer le fichier PDF du bulletin.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpen = async (bulletin: RhBulletinPaie) => {
    try {
      setIsExporting(true);
      await openBulletinPdf(bulletin);
    } catch (error) {
      console.warn("Erreur lors de l'ouverture du PDF:", error);
      toast.error(
        "Erreur d'affichage",
        "Impossible d'ouvrir l'aperçu PDF du bulletin.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    downloadPdf: handleDownload,
    openPdf: handleOpen,
  };
}
