import type { Metadata } from "next";
import { EcrituresJournalView } from "@/modules/comptabilite";

export const metadata: Metadata = {
  title: "Saisie d'Écritures & Journaux | NEXERA ERP",
  description: "Saisie d'écritures multi-lignes équilibrées par journal avec contrôle d'intégrité comptable.",
};

export default function EcrituresPage() {
  return <EcrituresJournalView />;
}
