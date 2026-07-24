import type { Metadata } from "next";
import CreateInventoryPage from "@/modules/stock/inventory/pages/CreateInventoryPage";

export const metadata: Metadata = {
  title: "Nouvel inventaire | NEXERA ERP",
  description: "Créer une session d'inventaire physique",
};

export default function NouvelInventairePage() {
  return <CreateInventoryPage />;
}
