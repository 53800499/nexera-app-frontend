import type { Metadata } from "next";
import { RemindersDashboardPage } from "@/modules/relances";

export const metadata: Metadata = {
  title: "Relances | NEXERA ERP",
  description: "Configuration et suivi des relances clients",
};

export default function RelancesPage() {
  return <RemindersDashboardPage />;
}
