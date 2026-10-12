import type { Metadata } from "next";
import { FecExportView } from "@/modules/comptabilite";

export const metadata: Metadata = {
  title: "Export FEC (Arrêté 1085-C) | NEXERA ERP",
  description: "Fichier des Écritures Comptables homologué Direction Générale des Impôts (Bénin / UEMOA) (UC-18).",
};

export default function FecPage() {
  return <FecExportView />;
}
