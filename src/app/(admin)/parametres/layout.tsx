"use client";

import { SettingsShell } from "@/modules/parametres/components/SettingsShell";

export default function ParametresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SettingsShell>{children}</SettingsShell>;
}
