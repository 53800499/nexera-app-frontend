import { apiClient } from "@/shared/http/apiClient";

type MessageResponse = {
  message: string;
};

export class PasswordApiService {
  async forgotPassword(email: string): Promise<MessageResponse> {
    return apiClient<MessageResponse>("/forgot-password", {
      method: "POST",
      body: { email },
    });
  }

  async resetPassword(
    token: string,
    password: string,
  ): Promise<MessageResponse> {
    return apiClient<MessageResponse>("/reset-password", {
      method: "POST",
      body: { token, password },
    });
  }
}

export const passwordApi = new PasswordApiService();
