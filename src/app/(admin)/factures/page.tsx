import type { Metadata } from "next";
import { InvoicesListPage } from "@/modules/factures";

export const metadata: Metadata = {
  title: "Factures | NEXERA ERP",
  description: "Liste et gestion des factures commerciales",
};

export default function FacturesPage() {
  return <InvoicesListPage />;
}
