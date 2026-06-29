import type { Metadata } from "next";
import { CommercialReportsPage } from "@/modules/dashboard";

export const metadata: Metadata = {
  title: "Rapports | NEXERA ERP",
  description: "CA, top clients et top articles pour le pilotage commercial",
};

export default function RapportsPage() {
  return <CommercialReportsPage />;
}
