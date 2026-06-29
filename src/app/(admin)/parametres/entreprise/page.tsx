import type { Metadata } from "next";
import { TenantSettingsPage } from "@/modules/parametres";

export const metadata: Metadata = {
  title: "Entreprise | Paramètres | NEXERA ERP",
};

export default function Page() {
  return <TenantSettingsPage />;
}
