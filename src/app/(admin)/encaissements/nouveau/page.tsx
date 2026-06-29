import type { Metadata } from "next";
import { CreatePaymentPage } from "@/modules/encaissements";

export const metadata: Metadata = {
  title: "Nouveau paiement | NEXERA ERP",
  description: "Enregistrement d'un encaissement client",
};

export default async function EncaissementNouveauPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  return <CreatePaymentPage defaultClientId={clientId} />;
}
