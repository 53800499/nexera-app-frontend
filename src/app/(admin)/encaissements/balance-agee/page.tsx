import type { Metadata } from "next";
import { AgedBalancePage } from "@/modules/encaissements";

export const metadata: Metadata = {
  title: "Balance âgée | NEXERA ERP",
  description: "Impayés classés par tranche d'ancienneté",
};

export default function BalanceAgeePage() {
  return <AgedBalancePage />;
}
