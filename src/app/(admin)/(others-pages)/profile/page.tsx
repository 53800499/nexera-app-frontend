import type { Metadata } from "next";
import { ProfilePage } from "@/modules/profile";

export const metadata: Metadata = {
  title: "Mon profil | NEXERA ERP",
  description: "Informations personnelles et sécurité du compte",
};

export default function Profile() {
  return <ProfilePage />;
}
