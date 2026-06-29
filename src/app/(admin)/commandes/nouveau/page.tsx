import type { Metadata } from "next";
import { CreateOrderPage } from "@/modules/commandes";

export const metadata: Metadata = {
  title: "Nouveau BC | NEXERA ERP",
  description: "Création d'un bon de commande",
};

export default function CommandeNouveauPage() {
  return <CreateOrderPage />;
}
