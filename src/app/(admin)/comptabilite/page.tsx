import type { Metadata } from "next";
import { ComptaDashboardView } from "@/modules/comptabilite";

export const metadata: Metadata = {
  title: "Comptabilité Générale (M3) | NEXERA ERP",
  description:
    "Cœur comptable SYSCOHADA (AUDCIF) : Saisie multi-lignes, validation EF-008, grand livre, balance 6 colonnes et états financiers.",
};

export default function ComptabilitePage() {
  return <ComptaDashboardView />;
}
