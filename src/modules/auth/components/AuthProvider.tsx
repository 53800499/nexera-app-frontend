"use client";

import { AppQueryProvider } from "@/shared/providers/AppQueryProvider";
import { useAuthSocket } from "../hooks/useAuthSocket";

function AuthSessionBridge({ children }: { children: React.ReactNode }) {
  useAuthSocket();
  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppQueryProvider>
      <AuthSessionBridge>{children}</AuthSessionBridge>
    </AppQueryProvider>
  );
}
