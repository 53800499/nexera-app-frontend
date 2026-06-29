/** Connexion réseau réelle du navigateur. */
export function isBrowserOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export function subscribeNetworkStatus(
  onChange: (online: boolean) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handleOnline = () => onChange(true);
  const handleOffline = () => onChange(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
