import type { Metadata } from "next";
import { ParametresRhPage } from "@/modules/rh";

export const metadata: Metadata = {
  title: "Paramètres RH & Barèmes | NEXERA ERP",
  description: "Établissements, structure organisationnelle, postes et barèmes fiscaux CGI 2026",
};

export default function ParametresRhRoutePage() {
  return <ParametresRhPage />;
}
