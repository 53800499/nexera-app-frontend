import type { Metadata } from "next";
import { VeilleReferentielView } from "@/modules/fiscalite";

export const metadata: Metadata = {
  title: "Veille Réglementaire & Paramètres Fiscaux | NEXERA ERP",
  description:
    "Circulaires et notes de service DGI Bénin 2026, qualification des sources, barèmes actifs et paramètres fiscaux nationaux.",
};

export default function Page() {
  return <VeilleReferentielView />;
}
