import type { Metadata } from "next";
import { PermissionsMatrixPage } from "@/modules/roles";

export const metadata: Metadata = {
  title: "Matrice permissions | NEXERA ERP",
  description: "Vue matricielle des permissions par rôle",
};

export default function MatricePermissionsPage() {
  return <PermissionsMatrixPage />;
}
