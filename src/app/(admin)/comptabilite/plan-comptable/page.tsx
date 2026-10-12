import type { Metadata } from "next";
import { PlanComptableView } from "@/modules/comptabilite";

export const metadata: Metadata = {
  title: "Plan Comptable SYSCOHADA | NEXERA ERP",
  description: "Nomenclature officielle 9 classes SYSCOHADA et gestion des comptes auxiliaires de tiers.",
};

export default function PlanComptablePage() {
  return <PlanComptableView />;
}
