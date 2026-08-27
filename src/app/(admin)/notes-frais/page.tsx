import type { Metadata } from "next";
import { NdfDashboardPage } from "@/modules/notes-frais";

export const metadata: Metadata = {
  title: "Notes de Frais & Déplacements | NEXERA ERP",
  description:
    "Module Notes de Frais : barèmes fiscaux Bénin 2026, détection d'anomalies IA et intégration SYSCOHADA / Paie",
};

export default function Page() {
  return <NdfDashboardPage />;
}
