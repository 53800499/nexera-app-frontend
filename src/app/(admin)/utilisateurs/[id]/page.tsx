import type { Metadata } from "next";
import { UserDetailsPage } from "@/modules/users";

export const metadata: Metadata = {
  title: "Détail utilisateur | NEXERA ERP",
  description: "Fiche utilisateur et rôles",
};

export default async function DetailUtilisateurPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserDetailsPage id={id} />;
}
