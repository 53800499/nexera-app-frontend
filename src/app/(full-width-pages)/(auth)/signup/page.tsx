import SignUpForm from "@/modules/auth/components/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription | NEXERA ERP",
  description: "Créez votre compte entreprise sur NEXERA ERP",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
