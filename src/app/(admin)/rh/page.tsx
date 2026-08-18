import type { Metadata } from "next";
import { RhDashboardPage } from "@/modules/rh";

export const metadata: Metadata = {
  title: "Ressources Humaines & Paie | NEXERA ERP",
  description: "Module de gestion des ressources humaines, carrières, paie et fiscalité sociale Bénin 2026",
};

export default function RhPage() {
  return <RhDashboardPage />;
}
