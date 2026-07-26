import { apiRequest } from "./client";

export const ownerApi = {
  getProfile() {
    return apiRequest("/horse-owner/profile");
  },

  updateProfile(payload) {
    return apiRequest("/horse-owner/profile", {
      method: "PATCH",
      body: payload,
    });
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

  deactivateHorse(horseId) {
    return apiRequest(`/horse-owner/horses/${horseId}`, {
      method: "DELETE",
    });
  },

  updateHorseMedia(horseId, payload) {
    return apiRequest(`/horse-owner/horses/${horseId}/media`, {
      method: "PATCH",
      body: payload,
    });
  },

  getHorseApprovalStatus(horseId) {
    return apiRequest(`/horse-owner/horses/${horseId}/approval-status`);
  },

  getJockeys() {
    return apiRequest("/horse-owner/jockeys");
  },

  getJockey(jockeyId) {
    return apiRequest(`/horse-owner/jockeys/${jockeyId}`);
  },

  getTournaments() {
    return apiRequest("/horse-owner/tournaments");
  },

  getTournamentRaces(tournamentId) {
    return apiRequest(`/horse-owner/tournaments/${tournamentId}/races`);
  },

  getRaceRounds(raceId) {
    return apiRequest(`/horse-owner/races/${raceId}/rounds`);
  },

  registerHorseForTournament(payload) {
    return apiRequest("/horse-owner/tournament-registrations", {
      method: "POST",
      body: payload,
    });
  },

  registerHorseForRace(payload) {
    return apiRequest("/horse-owner/race-registrations", {
      method: "POST",
      body: payload,
    });
  },

  updateRaceEntryDetails(registrationId, payload) {
    return apiRequest(`/horse-owner/race-registrations/${registrationId}/entry-details`, {
      method: "PATCH",
      body: payload,
    });
  },

  getRegistrationPayment(orderId) {
    return apiRequest(`/horse-owner/registration-payments/${encodeURIComponent(orderId)}`);
  },

  cancelTournamentRegistration(payload) {
    return apiRequest("/horse-owner/tournament-registrations/cancel", {
      method: "PATCH",
      body: payload,
    });
  },

  cancelRaceRegistration(payload) {
    return apiRequest("/horse-owner/race-registrations/cancel", {
      method: "PATCH",
      body: payload,
    });
  },

  getRegistrations(params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();

    return apiRequest(`/registrations${query ? `?${query}` : ""}`);
  },

  getPrizeAwards(params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();

    return apiRequest(`/prizes${query ? `?${query}` : ""}`);
  },

  createJockeyAssignment(payload) {
    return apiRequest("/jockey-assignments", {
      method: "POST",
      body: payload,
    });
  },

  getJockeyAssignments(params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    ).toString();

    return apiRequest(`/jockey-assignments${query ? `?${query}` : ""}`);
  },

  updateJockeyAssignmentTerms(id, payload) {
    return apiRequest(`/jockey-assignments/${id}/terms`, {
      method: "PATCH",
      body: payload,
    });
  },

  uploadJockeyAssignmentContract(id, contract) {
    return apiRequest(`/jockey-assignments/${id}/contract`, {
      method: "POST",
      body: { contract },
    });
  },

  promoteJockeyAssignment(id, reason) {
    return apiRequest(`/jockey-assignments/${id}/promote`, {
      method: "POST",
      body: { reason },
    });
  },

  cancelJockeyAssignment(id) {
    return apiRequest(`/jockey-assignments/${id}/cancel`, {
      method: "POST",
    });
  },
};
