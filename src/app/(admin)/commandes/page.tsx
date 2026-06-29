import type { Metadata } from "next";
import { OrdersListPage } from "@/modules/commandes";

export const metadata: Metadata = {
  title: "Commandes | NEXERA ERP",
  description: "Liste et gestion des bons de commande",
};

export default function CommandesPage() {
  return <OrdersListPage />;
}
