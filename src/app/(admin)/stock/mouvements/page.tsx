import type { Metadata } from "next";
import { StockMovementsListPage } from "@/modules/stock/mouvements";

export const metadata: Metadata = {
  title: "Mouvements stock | NEXERA ERP",
  description: "Entrées et mouvements de stock",
};

export default function MouvementsPage() {
  return <StockMovementsListPage />;
}
