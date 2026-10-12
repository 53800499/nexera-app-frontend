import type { Metadata } from "next";
import { BalancesView } from "@/modules/comptabilite";

export const metadata: Metadata = {
  title: "Balances 6 Colonnes & Auxiliaires | NEXERA ERP",
  description: "Balance générale à 6 colonnes et balance auxiliaire des comptes de tiers avec contrôle d'équilibre (EF-037).",
};

export default function BalancesPage() {
  return <BalancesView />;
}
