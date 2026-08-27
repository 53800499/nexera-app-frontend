import type { Metadata } from "next";
import { ValidationManagerPage } from "@/modules/notes-frais";

export const metadata: Metadata = {
  title: "Validation des Notes de Frais | NEXERA ERP",
  description: "Espace manager pour le contrôle, l'audit IA et l'approbation des notes de frais",
};

export default function Page() {
  return <ValidationManagerPage />;
}
