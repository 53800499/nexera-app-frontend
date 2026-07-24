import type { Metadata } from "next";
import InventoryListPage from "@/modules/stock/inventory/pages/InventoryListPage";

export const metadata: Metadata = {
  title: "Inventaires | NEXERA ERP",
  description: "Inventaires physiques de stock",
};

export default function InventairesPage() {
  return <InventoryListPage />;
}
