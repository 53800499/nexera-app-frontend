import type { Metadata } from "next";
import { RemboursementsPage } from "@/modules/notes-frais";

export const metadata: Metadata = {
  title: "Remboursements des Frais | NEXERA ERP",
  description: "Règlements par virement et bascules sur bulletins de paie M4",
};

export default function Page() {
  return <RemboursementsPage />;
}
