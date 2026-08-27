import type { Metadata } from "next";
import { RemboursementsPage } from "@/modules/notes-frais";

export const metadata: Metadata = {
  title: "Cartes Affaires & Rapprochement | NEXERA ERP",
  description: "Gestion des cartes affaires et réconciliation automatique des transactions",
};

export default function Page() {
  return <RemboursementsPage />;
}
