import type { Metadata } from "next";
import { AutresTaxesView } from "@/modules/fiscalite";

export const metadata: Metadata = {
  title: "Contribution des Patentes & Autres Taxes | NEXERA ERP",
  description:
    "Patente professionnelle Bénin 2026 (zone 1 et zone 2), Taxe Professionnelle Synthétique (TPS) et taxes locales.",
};

export default function Page() {
  return <AutresTaxesView />;
}
