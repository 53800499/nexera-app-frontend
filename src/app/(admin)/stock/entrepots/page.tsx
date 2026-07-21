import type { Metadata } from "next";
import { WarehousesPage } from "@/modules/stock";

export const metadata: Metadata = {
  title: "Entrepôts | NEXERA ERP",
  description: "Entrepôts, zones, allées, rayons et emplacements (UC-S02)",
};

export default function StockEntrepotsPage() {
  return <WarehousesPage />;
}
