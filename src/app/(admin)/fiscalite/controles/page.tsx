import type { Metadata } from "next";
import { ControlesContentieuxView } from "@/modules/fiscalite";

export const metadata: Metadata = {
  title: "Contrôles Fiscaux & Contentieux | NEXERA ERP",
  description:
    "Suivi des avis de vérification, redressements, simulateur d'estimation des pénalités CGI Bénin 2026 et gestion des recours.",
};

export default function Page() {
  return <ControlesContentieuxView />;
}
