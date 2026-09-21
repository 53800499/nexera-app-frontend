import type { Metadata } from "next";
import { TvaDeclarationsView } from "@/modules/fiscalite";

export const metadata: Metadata = {
  title: "Déclarations de TVA | NEXERA ERP",
  description:
    "Déclarations périodiques de Taxe sur la Valeur Ajoutée (TVA 18%), crédit reporté et suivi des déductions Bénin 2026.",
};

export default function Page() {
  return <TvaDeclarationsView />;
}
