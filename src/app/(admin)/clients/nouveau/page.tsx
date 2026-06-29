import type { Metadata } from "next";
import { CreateClientPage } from "@/modules/crm";

export const metadata: Metadata = {
  title: "Nouveau client | NEXERA ERP",
  description: "Créer une fiche client",
};

export default function ClientNouveauPage() {
  return <CreateClientPage />;
}
