import type { Metadata } from "next";
import { MissionsAvancesPage } from "@/modules/notes-frais";

export const metadata: Metadata = {
  title: "Missions & Avances | NEXERA ERP",
  description: "Ordres de mission et avances sur frais de déplacement",
};

export default function Page() {
  return <MissionsAvancesPage />;
}
