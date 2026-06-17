export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? "/api/backend",
  authCookieName: "nexera_access_token",
  refreshCookieName: "nexera_refresh_token",
  userStorageKey: "nexera_user",
} as const;
