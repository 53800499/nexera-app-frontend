import type { Metadata } from "next";
import { EditUserPage } from "@/modules/users";

export const metadata: Metadata = {
  title: "Modifier l'utilisateur | NEXERA ERP",
  description: "Modifier un utilisateur et ses rôles",
};

export default async function ModifierUtilisateurPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditUserPage id={id} />;
}
