"use client";

import { ToastProvider } from "@/shared/components/feedback";

export function AppFeedbackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
}
