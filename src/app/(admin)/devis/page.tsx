import type { Metadata } from "next";
import { QuotationsListPage } from "@/modules/devis";

export const metadata: Metadata = {
  title: "Devis | NEXERA ERP",
  description: "Liste et gestion des devis commerciaux",
};

export default function DevisPage() {
  return <QuotationsListPage />;
}
