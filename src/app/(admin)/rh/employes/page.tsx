import type { Metadata } from "next";
import { EmployesListPage } from "@/modules/rh";

export const metadata: Metadata = {
  title: "Salariés & Collaborateurs | NEXERA ERP",
  description: "Répertoire des employés et fiches 360°",
};

export default function EmployesRoutePage() {
  return <EmployesListPage />;
}
