import type { Metadata } from "next";
import { FecExportView } from "@/modules/fiscalite";

export const metadata: Metadata = {
  title: "Export FEC (Arrêté n° 1085-C Bénin) | NEXERA ERP",
  description:
    "Génération et audit de conformité du Fichier des Écritures Comptables conforme aux 18 colonnes de l'Arrêté ministériel 1085-C.",
};

export default function Page() {
  return <FecExportView />;
}
