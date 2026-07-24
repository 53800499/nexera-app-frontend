import type { Metadata } from "next";
import { CreateStockTransferPage } from "@/modules/stock/transferts";

export const metadata: Metadata = {
  title: "Nouveau transfert | NEXERA ERP",
  description: "Créer un transfert inter-entrepôts",
};

export default function NouveauTransfertPage() {
  return <CreateStockTransferPage />;
}
