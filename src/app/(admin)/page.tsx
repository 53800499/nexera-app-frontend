import type { Metadata } from "next";
import { CommercialDashboardPage } from "@/modules/dashboard";

export const metadata: Metadata = {
  title: "Cockpit Exécutif & Pilotage Général | NEXERA ERP",
  description:
    "Indicateurs de performance, trésorerie, stocks, conformité SYSCOHADA et e-MECeF DGI Bénin",
};

export default function DashboardPage() {
  return <CommercialDashboardPage />;
}
