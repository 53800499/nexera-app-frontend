import type { Metadata } from "next";
import { CabinetCockpitPage } from "@/modules/cabinet";

export const metadata: Metadata = {
  title: "Cockpit cabinet | NEXERA",
  description: "Vue portefeuille multi-entreprises pour cabinets comptables",
};

export default function CabinetPage() {
  return <CabinetCockpitPage />;
}
