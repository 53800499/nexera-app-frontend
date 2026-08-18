import type { Metadata } from "next";
import { DeclarationsFiscalesPage } from "@/modules/rh";

export const metadata: Metadata = {
  title: "Déclarations Fiscales & Sociales (M7) | NEXERA ERP",
  description: "Déclarations mensuelles ITS, VPS et Cotisations CNSS Bénin",
};

export default function DeclarationsRoutePage() {
  return <DeclarationsFiscalesPage />;
}
