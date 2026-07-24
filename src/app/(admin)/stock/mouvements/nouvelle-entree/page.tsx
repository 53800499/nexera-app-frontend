import type { Metadata } from "next";
import { CreateStockEntryPage } from "@/modules/stock/mouvements";

export const metadata: Metadata = {
  title: "Nouvelle entrée | NEXERA ERP",
  description: "Enregistrer une entrée de stock",
};

export default function NouvelleEntreePage() {
  return <CreateStockEntryPage />;
}
