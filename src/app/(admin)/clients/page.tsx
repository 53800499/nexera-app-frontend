import type { Metadata } from "next";
import { ClientsListPage } from "@/modules/crm";

export const metadata: Metadata = {
  title: "Clients | NEXERA ERP",
  description: "Référentiel clients et gestion CRM",
};

export default function ClientsPage() {
  return <ClientsListPage />;
}
