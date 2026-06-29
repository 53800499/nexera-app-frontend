import type { Metadata } from "next";
import { ReminderSettingsPage } from "@/modules/parametres";

export const metadata: Metadata = {
  title: "Relances | Paramètres | NEXERA ERP",
};

export default function Page() {
  return <ReminderSettingsPage />;
}
