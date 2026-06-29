import type { Metadata } from "next";
import { RolesListPage } from "@/modules/roles";

export const metadata: Metadata = {
  title: "Rôles & permissions | NEXERA ERP",
  description: "Gestion des rôles et des permissions du tenant",
};

export default function RolesPage() {
  return <RolesListPage />;
}
