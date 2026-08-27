import type { Metadata } from "next";
import { RapportsFraisPage } from "@/modules/notes-frais";

export const metadata: Metadata = {
  title: "Rapports de Frais | NEXERA ERP",
  description: "Gestion, soumission et suivi des rapports de frais",
};

export default function Page() {
  return <RapportsFraisPage />;
}
