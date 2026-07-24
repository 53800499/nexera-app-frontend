import type { Metadata } from "next";
import { StockAlertsPage } from "@/modules/stock/alerts";

export const metadata: Metadata = {
  title: "Alertes stock | NEXERA ERP",
  description: "Alertes et réapprovisionnement",
};

export default function AlertesPage() {
  return <StockAlertsPage />;
}
