import type { Metadata } from "next";
import { StockValuationPage } from "@/modules/stock/valuation";

export const metadata: Metadata = {
  title: "Valorisation | NEXERA ERP",
  description: "Valorisation du stock CMUP FIFO LIFO",
};

export default function ValorisationPage() {
  return <StockValuationPage />;
}
