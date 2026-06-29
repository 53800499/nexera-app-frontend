import type { Metadata } from "next";
import { CreateUserPage } from "@/modules/users";

export const metadata: Metadata = {
  title: "Nouvel utilisateur | NEXERA ERP",
  description: "Création d'un utilisateur",
};

export default function NouveauUtilisateurPage() {
  return <CreateUserPage />;
}
