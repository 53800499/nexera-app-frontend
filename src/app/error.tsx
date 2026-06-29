"use client";

import { RouteErrorFallback } from "@/shared/components/feedback/RouteErrorFallback";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorFallback error={error} reset={reset} fullScreen />;
}
