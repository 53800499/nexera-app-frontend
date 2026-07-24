import type { Metadata } from "next";
import { CreateStockExitPage } from "@/modules/stock/mouvements";

export const metadata: Metadata = {
  title: "Nouvelle sortie | NEXERA ERP",
  description: "Enregistrer une sortie de stock",
};

export default function NouvelleSortiePage() {
  return <CreateStockExitPage />;
}
