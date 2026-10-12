import type { Metadata } from "next";
import { GrandLivreView } from "@/modules/comptabilite";

export const metadata: Metadata = {
  title: "Grand Livre Général | NEXERA ERP",
  description: "Consultation du grand livre chronologique avec solde progressif et à-nouveaux (EF-034, EF-035).",
};

export default function GrandLivrePage() {
  return <GrandLivreView />;
}
