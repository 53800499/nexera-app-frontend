"use client";

import { RouteErrorFallback } from "@/shared/components/feedback/RouteErrorFallback";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="dark:bg-gray-900">
        <RouteErrorFallback error={error} reset={reset} fullScreen />
      </body>
    </html>
  );
}
