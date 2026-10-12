import type { Metadata } from "next";
import { LettrageView } from "@/modules/comptabilite";

export const metadata: Metadata = {
  title: "Lettrage des Comptes de Tiers | NEXERA ERP",
  description: "Rapprochement des créances et règlements sur comptes clients et fournisseurs (EF-038).",
};

export default function LettragePage() {
  return <LettrageView />;
}
