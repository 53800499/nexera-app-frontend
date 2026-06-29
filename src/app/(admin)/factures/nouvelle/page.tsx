import type { Metadata } from "next";
import { CreateInvoicePage } from "@/modules/factures";

export const metadata: Metadata = {
  title: "Nouvelle facture | NEXERA ERP",
  description: "Création d'une facture commerciale",
};

export default function FactureNouvellePage() {
  return <CreateInvoicePage />;
}
