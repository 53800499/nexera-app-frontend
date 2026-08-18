import type { Metadata } from "next";
import { TempsAbsencesPage } from "@/modules/rh";

export const metadata: Metadata = {
  title: "Temps & Congés | NEXERA ERP",
  description: "Pointages d'heures, heures supplémentaires, demandes d'absences et soldes de congés",
};

export default function TempsAbsencesRoutePage() {
  return <TempsAbsencesPage />;
}
