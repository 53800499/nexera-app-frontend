import type { Metadata } from "next";
import { UsersListPage } from "@/modules/users";

export const metadata: Metadata = {
  title: "Utilisateurs | NEXERA ERP",
  description: "Gestion des utilisateurs de l'entreprise",
};

export default function UtilisateursPage() {
  return <UsersListPage />;
}
