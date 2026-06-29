import type { Metadata } from "next";
import { CommercialDashboardPage } from "@/modules/dashboard";

export const metadata: Metadata = {
  title: "Tableau de bord | NEXERA ERP",
  description: "Indicateurs commerciaux et pilotage de l'activité",
};

export default function DashboardPage() {
  return <CommercialDashboardPage />;
}
