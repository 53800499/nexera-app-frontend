import { authorizedFetch } from "@/shared/http/authorizedFetch";
import type {
  ChangePasswordPayload,
  ProfileResponse,
  UpdateProfilePayload,
} from "../types/profile.types";

export const profileApi = {
  getProfile: () => authorizedFetch<ProfileResponse>("/profile"),

  updateProfile: (payload: UpdateProfilePayload) =>
    authorizedFetch<ProfileResponse>("/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  changePassword: (payload: ChangePasswordPayload) =>
    authorizedFetch<{ message: string }>("/profile/password", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
