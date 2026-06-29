import type { Metadata } from "next";
import { CreateRolePage } from "@/modules/roles";

export const metadata: Metadata = {
  title: "Nouveau rôle | NEXERA ERP",
  description: "Créer un rôle et lui attribuer des permissions",
};

export default function NouveauRolePage() {
  return <CreateRolePage />;
}
