import type { Metadata } from "next";
import { SettingsHubPage } from "@/modules/parametres";

export const metadata: Metadata = {
  title: "Paramètres | NEXERA ERP",
  description: "Configuration de l'entreprise et du module commercial",
};

export default function ParametresPage() {
  return <SettingsHubPage />;
}
