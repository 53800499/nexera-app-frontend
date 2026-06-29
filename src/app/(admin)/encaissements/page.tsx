import type { Metadata } from "next";
import { PaymentsListPage } from "@/modules/encaissements";

export const metadata: Metadata = {
  title: "Encaissements | NEXERA ERP",
  description: "Suivi des paiements clients",
};

export default function EncaissementsPage() {
  return <PaymentsListPage />;
}
