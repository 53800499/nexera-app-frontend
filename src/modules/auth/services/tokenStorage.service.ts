import type { AuthTokens, AuthUser } from "../types/auth.types";
import { env } from "@/shared/config/env";

const ACCESS_KEY = "nexera_access_token";
const REFRESH_KEY = "nexera_refresh_token";
const EXPIRES_KEY = "nexera_token_expires";

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export class TokenStorageService {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_KEY);
  }

  getExpiresAt(): number | null {
    if (typeof window === "undefined") return null;
    const value = localStorage.getItem(EXPIRES_KEY);
    return value ? Number(value) : null;
  }

  setTokens(tokens: AuthTokens, rememberMe = false): void {
    if (typeof window === "undefined") return;

    const accessMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;

    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    localStorage.setItem(EXPIRES_KEY, String(tokens.expiresAt));

    setCookie(env.authCookieName, tokens.accessToken, accessMaxAge);
    setCookie(env.refreshCookieName, tokens.refreshToken, 30 * 24 * 60 * 60);
  }

  clearTokens(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    localStorage.removeItem(env.userStorageKey);

    deleteCookie(env.authCookieName);
    deleteCookie(env.refreshCookieName);
  }

  getStoredUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(env.userStorageKey);
    if (!raw) return null;

    try {
      const user = JSON.parse(raw) as AuthUser;
      if (!user.tenantType) {
        user.tenantType =
          user.workspace === "cabinet" ? "cabinet" : "company";
      }
      return user;
    } catch {
      return null;
    }
  }

  setStoredUser(user: AuthUser): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(env.userStorageKey, JSON.stringify(user));
  }
}

export const tokenStorage = new TokenStorageService();
