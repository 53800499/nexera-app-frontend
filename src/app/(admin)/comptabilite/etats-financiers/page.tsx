import type { Metadata } from "next";
import { EtatsFinanciersView } from "@/modules/comptabilite";

export const metadata: Metadata = {
  title: "États Financiers SYSCOHADA | NEXERA ERP",
  description: "Bilan, Compte de Résultat et Tableau des Flux de Trésorerie selon le Système Normal ou SMT (UC-17).",
};

export default function EtatsFinanciersPage() {
  return <EtatsFinanciersView />;
}
