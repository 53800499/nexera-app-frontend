import type { Metadata } from "next";
import { EvenementsReglesView } from "@/modules/comptabilite";

export const metadata: Metadata = {
  title: "Moteur & Événements Amont | NEXERA ERP",
  description: "Surveillance des événements de facturation, stock, paie, notes de frais et règles de comptabilisation (UC-06).",
};

export default function EvenementsPage() {
  return <EvenementsReglesView />;
}
