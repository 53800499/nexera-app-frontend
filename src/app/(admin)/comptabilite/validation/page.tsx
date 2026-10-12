import type { Metadata } from "next";
import { ValidationWorkflowView } from "@/modules/comptabilite";

export const metadata: Metadata = {
  title: "File de Validation des Écritures | NEXERA ERP",
  description: "Circuit d'approbation comptable centralisé avec respect de la règle EF-008 de séparation des tâches.",
};

export default function ValidationPage() {
  return <ValidationWorkflowView />;
}
