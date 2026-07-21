import type { Metadata } from "next";
import { StockTransfersListPage } from "@/modules/stock";

export const metadata: Metadata = {
  title: "Transferts | NEXERA ERP",
  description: "Transferts inter-entrepôts",
};

export default function TransfertsPage() {
  return <StockTransfersListPage />;
}
