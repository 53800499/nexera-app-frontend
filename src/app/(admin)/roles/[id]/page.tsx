import type { Metadata } from "next";
import { RoleDetailsPage } from "@/modules/roles";

export const metadata: Metadata = {
  title: "Détail rôle | NEXERA ERP",
  description: "Détail d'un rôle et attribution des permissions",
};

export default async function DetailRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RoleDetailsPage id={id} />;
}
