import { apiRequest } from "./client";

export const ownerApi = {
  getProfile() {
    return apiRequest("/horse-owner/profile");
  },

  getHorses() {
    return apiRequest("/horse-owner/horses");
  },

  getHorse(horseId) {
    return apiRequest(`/horse-owner/horses/${horseId}`);
  },

  createHorse(payload) {
    return apiRequest("/horse-owner/horses", {
      method: "POST",
      body: payload,
    });
  },

  updateHorse(horseId, payload) {
    return apiRequest(`/horse-owner/horses/${horseId}`, {
      method: "PATCH",
      body: payload,
    });
  },
};
