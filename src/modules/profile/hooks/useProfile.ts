"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AUTH_QUERY_KEYS } from "@/modules/auth/constants/routes";
import { tokenStorage } from "@/modules/auth/services/tokenStorage.service";
import { useAuthStore } from "@/modules/auth/store/authStore";
import type { AuthUser } from "@/modules/auth/types/auth.types";
import { useQueryEnabled } from "@/shared/hooks/useQueryEnabled";
import { profileApi } from "../services/profileApi.service";
import type {
  ChangePasswordPayload,
  ProfileResponse,
  UpdateProfilePayload,
} from "../types/profile.types";

export const PROFILE_QUERY_KEY = ["profile"] as const;

function syncAuthUser(profile: ProfileResponse) {
  const current = useAuthStore.getState().user;
  if (!current || current.id !== profile.id) return;

  const nextUser: AuthUser = {
    ...current,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    roles: profile.roles,
    permissions: profile.permissions,
    tenantId: profile.tenantId,
  };

  useAuthStore.getState().setUser(nextUser);
  tokenStorage.setStoredUser(nextUser);
}

export function useProfile(enabled = true) {
  const queryClient = useQueryClient();
  const queryEnabled = useQueryEnabled(enabled);

  const profileQuery = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: profileApi.getProfile,
    enabled: queryEnabled,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      profileApi.updateProfile(payload),
    onSuccess: (profile) => {
      syncAuthUser(profile);
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      profileApi.changePassword(payload),
  });

  return {
    profileQuery,
    updateProfileMutation,
    changePasswordMutation,
  };
}
