import { Metadata } from "next";
import { NotFoundView } from "@/shared/components/feedback";

export const metadata: Metadata = {
  title: "Page introuvable | NEXERA",
  description: "La page demandée est introuvable.",
};

export default function Error404() {
  return <NotFoundView />;
}
