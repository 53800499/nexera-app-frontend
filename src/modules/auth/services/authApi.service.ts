import { AppError } from "@/shared/core/AppError";
import { OfflineError } from "@/shared/core/OfflineError";
import { isBrowserOnline } from "@/shared/hooks/useNetworkStatus";
import { apiClient } from "@/shared/http/apiClient";
import { authorizedFetch } from "@/shared/http/authorizedFetch";
import type { ProfileResponse } from "@/modules/profile/types/profile.types";
import type {
  AuthApiResponse,
  AuthSession,
  AuthUser,
  LoginCredentials,
  RegisterDirigeantData,
} from "../types/auth.types";
import {
  APP_ROLE_TO_USER_ROLE,
  CABINET_APP_ROLES,
} from "../constants/roles";
import { USER_ROLES } from "../types/user.types";
import { WORKSPACE_TYPES } from "../types/user.types";
import { tokenStorage } from "./tokenStorage.service";

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

function haveSamePermissions(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(b);
  return a.every((permission) => set.has(permission));
}

function resolveWorkspace(
  tenantType: AuthApiResponse["user"]["tenantType"] | undefined,
  roles: string[],
): AuthUser["workspace"] {
  if (tenantType === "cabinet") {
    return WORKSPACE_TYPES.CABINET;
  }
  if (tenantType === "company") {
    return WORKSPACE_TYPES.ENTREPRISE;
  }
  const isCabinet = roles.some((r) => CABINET_APP_ROLES.has(r));
  return isCabinet ? WORKSPACE_TYPES.CABINET : WORKSPACE_TYPES.ENTREPRISE;
}

function mapApiResponse(response: AuthApiResponse): AuthSession {
  const primaryAppRole = response.user.roles[0] ?? "CEO";
  const role = APP_ROLE_TO_USER_ROLE[primaryAppRole] ?? USER_ROLES.DIRIGEANT;
  const tenantType = response.user.tenantType ?? "company";
  const workspace = resolveWorkspace(response.user.tenantType, response.user.roles);

  const user: AuthUser = {
    id: response.user.id,
    email: response.user.email,
    firstName: response.user.firstName,
    lastName: response.user.lastName,
    tenantId: response.user.tenantId,
    tenantType,
    role,
    roles: response.user.roles,
    permissions: response.user.permissions,
    workspace,
  };

  return {
    user,
    tokens: {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
    },
  };
}

function persistSession(session: AuthSession, rememberMe = false) {
  tokenStorage.setTokens(session.tokens, rememberMe);
  tokenStorage.setStoredUser(session.user);
}

function getCachedSession(): AuthSession | null {
  const storedUser = tokenStorage.getStoredUser();
  const accessToken = tokenStorage.getAccessToken();
  const refreshToken = tokenStorage.getRefreshToken();
  const expiresAt = tokenStorage.getExpiresAt();

  if (!storedUser || !accessToken || !refreshToken) {
    return null;
  }

  return {
    user: storedUser,
    tokens: {
      accessToken,
      refreshToken,
      expiresAt: expiresAt ?? Date.now(),
    },
  };
}

export class AuthApiService {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const response = await apiClient<AuthApiResponse>("/auth/login", {
      method: "POST",
      body: {
        email: credentials.email,
        password: credentials.password,
      },
    });

    const session = mapApiResponse(response);
    persistSession(session, credentials.rememberMe);
    return session;
  }

  async registerDirigeant(data: RegisterDirigeantData): Promise<AuthSession> {
    const response = await apiClient<AuthApiResponse>("/auth/register", {
      method: "POST",
      body: data,
    });

    const session = mapApiResponse(response);
    persistSession(session);
    return session;
  }

  async refreshSession(): Promise<AuthSession | null> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await apiClient<AuthApiResponse>("/auth/refresh", {
        method: "POST",
        refreshToken: true,
      });

      const session = mapApiResponse(response);
      persistSession(session);
      return session;
    } catch (error) {
      if (!isBrowserOnline()) {
        return getCachedSession();
      }
      if (error instanceof AppError && error.statusCode === 401) {
        tokenStorage.clearTokens();
        return null;
      }
      return getCachedSession();
    }
  }

  private async syncPermissionsFromProfile(
    session: AuthSession,
  ): Promise<AuthSession> {
    if (!isBrowserOnline()) {
      return session;
    }

    try {
      const profile = await authorizedFetch<ProfileResponse>("/profile");
      const permissionsChanged = !haveSamePermissions(
        session.user.permissions,
        profile.permissions,
      );

      let activeSession = session;

      if (permissionsChanged) {
        const refreshed = await this.refreshSession();
        if (refreshed) {
          activeSession = refreshed;
        }
      }

      const tenantType =
        profile.tenant.type === "cabinet" ? "cabinet" : "company";
      const primaryAppRole = profile.roles[0] ?? activeSession.user.roles[0];
      const updatedUser: AuthUser = {
        ...activeSession.user,
        permissions: profile.permissions,
        roles: profile.roles,
        tenantType,
        role:
          APP_ROLE_TO_USER_ROLE[primaryAppRole ?? ""] ??
          activeSession.user.role,
        workspace: resolveWorkspace(tenantType, profile.roles),
      };
      tokenStorage.setStoredUser(updatedUser);
      return { ...activeSession, user: updatedUser };
    } catch {
      return session;
    }
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const cached = getCachedSession();
    if (!cached) {
      return null;
    }

    const isExpired = Date.now() >= cached.tokens.expiresAt;
    let session = cached;

    if (isExpired && isBrowserOnline()) {
      session = (await this.refreshSession()) ?? cached;
      if (!session) return null;
    }

    return this.syncPermissionsFromProfile(session);
  }

  logout(): void {
    tokenStorage.clearTokens();
  }

  getRedirectPath(session: AuthSession): string {
    return session.user.workspace === WORKSPACE_TYPES.CABINET ? "/cabinet" : "/";
  }
}

export const authApi = new AuthApiService();
