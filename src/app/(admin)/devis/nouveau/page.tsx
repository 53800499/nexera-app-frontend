import type { Metadata } from "next";
import { CreateQuotationPage } from "@/modules/devis";

export const metadata: Metadata = {
  title: "Nouveau devis | NEXERA ERP",
  description: "Création d'un devis commercial",
};

export default function NouveauDevisPage() {
  return <CreateQuotationPage />;
}
