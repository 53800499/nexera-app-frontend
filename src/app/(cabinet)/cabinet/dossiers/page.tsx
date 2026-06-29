import type { Metadata } from "next";
import { DossiersListPage } from "@/modules/cabinet";

export const metadata: Metadata = {
  title: "Dossiers clients | NEXERA Cabinet",
  description: "Liste des entreprises liées au cabinet comptable",
};

export default function CabinetDossiersPage() {
  return <DossiersListPage />;
}
