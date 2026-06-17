"use client";

import { AppQueryProvider } from "@/shared/providers/AppQueryProvider";
import { useAuthSocket } from "../hooks/useAuthSocket";

function AuthSocketBridge({ children }: { children: React.ReactNode }) {
  useAuthSocket();
  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppQueryProvider>
      <AuthSocketBridge>{children}</AuthSocketBridge>
    </AppQueryProvider>
  );
}
