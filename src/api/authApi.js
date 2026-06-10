import { apiRequest } from "./client";

export const authApi = {
  getRoles() {
    return apiRequest("/auth/roles");
  },

  login(credentials) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: credentials,
    });
  },

  register(payload) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: payload,
    });
  },

  verifyAccount(otp) {
    return apiRequest("/auth/verify-account", {
      method: "POST",
      body: { otp },
    });
  },

  me() {
    return apiRequest("/auth/me");
  },

  logout() {
    return apiRequest("/auth/logout", {
      method: "POST",
    });
  },
};
