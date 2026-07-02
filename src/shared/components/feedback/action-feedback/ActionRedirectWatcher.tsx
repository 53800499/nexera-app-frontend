"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useActionFeedbackStore } from "./actionFeedbackStore";

const REDIRECT_TIMEOUT_MS = 15_000;

export function ActionRedirectWatcher() {
  const pathname = usePathname();
  const isRedirecting = useActionFeedbackStore((state) => state.isRedirecting);
  const redirectFromPath = useActionFeedbackStore(
    (state) => state.redirectFromPath,
  );
  const stopRedirect = useActionFeedbackStore((state) => state.stopRedirect);

  useEffect(() => {
    if (!isRedirecting) return;

    if (redirectFromPath && pathname !== redirectFromPath) {
      stopRedirect();
    }
  }, [isRedirecting, pathname, redirectFromPath, stopRedirect]);

  useEffect(() => {
    if (!isRedirecting) return;

    const timeout = window.setTimeout(() => {
      stopRedirect();
    }, REDIRECT_TIMEOUT_MS);

    return () => window.clearTimeout(timeout);
  }, [isRedirecting, stopRedirect]);

  return null;
}
