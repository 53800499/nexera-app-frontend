import type { Metadata } from "next";
import { EcrituresComptablesPaiePage } from "@/modules/rh";

export const metadata: Metadata = {
  title: "Comptabilisation Paie (OD SYSCOHADA) | NEXERA ERP",
  description: "Écritures d'Opérations Diverses de paie pour le module Comptabilité Générale",
};

export default function ComptabilitePaieRoutePage() {
  return <EcrituresComptablesPaiePage />;
}
