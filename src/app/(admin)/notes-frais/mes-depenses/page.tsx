import type { Metadata } from "next";
import { MesDepensesPage } from "@/modules/notes-frais";

export const metadata: Metadata = {
  title: "Mes Dépenses & Reçus | NEXERA ERP",
  description: "Saisie et scan OCR assisté de dépenses professionnelles",
};

export default function Page() {
  return <MesDepensesPage />;
}
