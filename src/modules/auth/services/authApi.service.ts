import { apiClient } from "@/shared/http/apiClient";
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

function mapApiResponse(response: AuthApiResponse): AuthSession {
  const primaryAppRole = response.user.roles[0] ?? "CEO";
  const role = APP_ROLE_TO_USER_ROLE[primaryAppRole] ?? USER_ROLES.DIRIGEANT;
  const isCabinet = response.user.roles.some((r) => CABINET_APP_ROLES.has(r));

  const user: AuthUser = {
    id: response.user.id,
    email: response.user.email,
    firstName: response.user.firstName,
    lastName: response.user.lastName,
    tenantId: response.user.tenantId,
    role,
    roles: response.user.roles,
    permissions: response.user.permissions,
    workspace: isCabinet ? WORKSPACE_TYPES.CABINET : WORKSPACE_TYPES.ENTREPRISE,
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
    } catch {
      tokenStorage.clearTokens();
      return null;
    }
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const storedUser = tokenStorage.getStoredUser();
    const accessToken = tokenStorage.getAccessToken();

    if (!accessToken && !tokenStorage.getRefreshToken()) {
      return null;
    }

    const expiresAt = tokenStorage.getExpiresAt();
    const isExpired = expiresAt ? Date.now() >= expiresAt : false;

    if (isExpired || !storedUser) {
      return this.refreshSession();
    }

    return {
      user: storedUser,
      tokens: {
        accessToken: accessToken!,
        refreshToken: tokenStorage.getRefreshToken()!,
        expiresAt: expiresAt!,
      },
    };
  }

  logout(): void {
    tokenStorage.clearTokens();
  }

  getRedirectPath(session: AuthSession): string {
    return session.user.workspace === WORKSPACE_TYPES.CABINET ? "/cabinet" : "/";
  }
}

export const authApi = new AuthApiService();
