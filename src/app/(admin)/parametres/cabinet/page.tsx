import type { Metadata } from "next";
import { CabinetSharingSettingsPage } from "@/modules/cabinet";

export const metadata: Metadata = {
  title: "Cabinet comptable | Paramètres | NEXERA",
  description:
    "Autoriser un cabinet comptable ou partager l'identifiant de votre cabinet",
};

export default function Page() {
  return <CabinetSharingSettingsPage />;
}
