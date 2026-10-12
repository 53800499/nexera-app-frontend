import type { Metadata } from "next";
import { ExercicesClotureView } from "@/modules/comptabilite";

export const metadata: Metadata = {
  title: "Clôtures Périodiques & Exercices | NEXERA ERP",
  description: "Cycle de vie des exercices comptables : clôture mensuelle (EF-010), clôture annuelle, réouverture et archivage (EF-055).",
};

export default function ExercicesPage() {
  return <ExercicesClotureView />;
}
