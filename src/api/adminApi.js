import { apiRequest } from "./client";

function withQuery(path, params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return `${path}${suffix}`;
}

export const adminApi = {
  getDashboard(params = {}) {
    return apiRequest(withQuery("/admin/dashboard", params));
  },

  getBettingSummary(params = {}) {
    return apiRequest(withQuery("/admin/betting-summary", params));
  },

  getDepositRequests(params = {}) {
    return apiRequest(withQuery("/admin/deposit-requests", params));
  },

  getPrizeAwardsSummary(params = {}) {
    return apiRequest(withQuery("/admin/prize-awards/summary", params));
  },

  listUsers(params = {}) {
    return apiRequest(withQuery("/admin/users", params));
  },

  getUser(id) {
    return apiRequest(`/admin/users/${id}`);
  },

  updateUserStatus(id, status) {
    return apiRequest(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },

  assignUserRole(id, roleName) {
    return apiRequest(`/admin/users/${id}/roles`, {
      method: "POST",
      body: { role_name: roleName },
    });
  },

  removeUserRole(id, roleName) {
    return apiRequest(`/admin/users/${id}/roles/${roleName}`, {
      method: "DELETE",
    });
  },

  listRoleApplications(params = {}) {
    return apiRequest(withQuery("/admin/role-applications", params));
  },

  getRoleApplication(id) {
    return apiRequest(`/admin/role-applications/${id}`);
  },

  approveRoleApplication(id, adminNote = "Documents verified") {
    return apiRequest(`/admin/role-applications/${id}/approve`, {
      method: "POST",
      body: { admin_note: adminNote },
    });
  },

  rejectRoleApplication(id, adminNote = "Rejected by admin review") {
    return apiRequest(`/admin/role-applications/${id}/reject`, {
      method: "POST",
      body: { admin_note: adminNote },
    });
  },

  listRegistrations(params = {}) {
    return apiRequest(withQuery("/registrations", params));
  },

  getRegistration(id) {
    return apiRequest(`/registrations/${id}`);
  },

  approveRegistration(id, adminNote = "Approved") {
    return apiRequest(`/registrations/${id}/approve`, {
      method: "POST",
      body: { admin_note: adminNote },
    });
  },

  rejectRegistration(id, adminNote = "Rejected by admin review") {
    return apiRequest(`/registrations/${id}/reject`, {
      method: "POST",
      body: { admin_note: adminNote },
    });
  },

  listRaceResults(params = {}) {
    return apiRequest(withQuery("/race-results", params));
  },

  getRaceResultParticipants(raceId) {
    return apiRequest(`/race-results/races/${raceId}/participants`);
  },

  getRaceResultReadiness(raceId) {
    return apiRequest(`/race-results/races/${raceId}/readiness`);
  },

  confirmRaceResults(raceId) {
    return apiRequest(`/race-results/races/${raceId}/confirm`, { method: "POST" });
  },

  requestRaceResultCorrection(raceId, correctionNote) {
    return apiRequest(`/race-results/races/${raceId}/request-correction`, {
      method: "POST",
      body: { correction_note: correctionNote },
    });
  },

  resolveRaceResultCorrection(raceId) {
    return apiRequest(`/race-results/races/${raceId}/resolve-correction`, { method: "POST" });
  },

  publishRaceResults(raceId) {
    return apiRequest(`/race-results/races/${raceId}/publish`, { method: "POST" });
  },

  configureRacePrizes(raceId, payload) {
    return apiRequest(`/prizes/races/${raceId}/config`, { method: "POST", body: payload });
  },

  listRacePrizeAwards(raceId) {
    return apiRequest(`/prizes/races/${raceId}/awards`);
  },

  listRefereeReports(params = {}) {
    return apiRequest(withQuery("/referee-reports", params));
  },

  listViolations(params = {}) {
    return apiRequest(withQuery("/violations", params));
  },

  listJockeyAssignments(params = {}) {
    return apiRequest(withQuery("/jockey-assignments", params));
  },

  getViolation(id) {
    return apiRequest(`/violations/${id}`);
  },

  updateViolation(id, payload) {
    return apiRequest(`/violations/${id}`, { method: "PATCH", body: payload });
  },

  confirmViolation(id, decision) {
    return apiRequest(`/violations/${id}/confirm`, { method: "POST", body: { decision } });
  },

  dismissViolation(id, decision) {
    return apiRequest(`/violations/${id}/dismiss`, { method: "POST", body: { decision } });
  },

  listHorseChecks(params = {}) {
    return apiRequest(withQuery("/horse-checks", params));
  },

  updateHorseCheck(id, payload) {
    return apiRequest(`/horse-checks/${id}`, { method: "PATCH", body: payload });
  },

  listTournaments(params = {}) {
    return apiRequest(withQuery("/tournaments", params));
  },

  getTournament(id) {
    return apiRequest(`/tournaments/${id}`);
  },

  createTournament(payload) {
    return apiRequest("/tournaments", { method: "POST", body: payload });
  },

  updateTournament(id, payload) {
    return apiRequest(`/tournaments/${id}`, { method: "PATCH", body: payload });
  },

  deleteTournament(id) {
    return apiRequest(`/tournaments/${id}`, { method: "DELETE" });
  },

  listRounds(params = {}) {
    return apiRequest(withQuery("/rounds", params));
  },

  getRound(id) {
    return apiRequest(`/rounds/${id}`);
  },

  createRound(payload) {
    return apiRequest("/rounds", { method: "POST", body: payload });
  },

  updateRound(id, payload) {
    return apiRequest(`/rounds/${id}`, { method: "PATCH", body: payload });
  },

  deleteRound(id) {
    return apiRequest(`/rounds/${id}`, { method: "DELETE" });
  },

  listRaces(params = {}) {
    return apiRequest(withQuery("/races", params));
  },

  getRace(id) {
    return apiRequest(`/races/${id}`);
  },

  generateRaceOdds(id) {
    return apiRequest(`/races/${id}/odds/generate`, { method: "POST" });
  },

  getRaceOdds(id) {
    return apiRequest(`/races/${id}/odds`);
  },

  openRaceBetting(id, payload = {}) {
    return apiRequest(`/races/${id}/betting/open`, { method: "POST", body: payload });
  },

  closeRaceBetting(id) {
    return apiRequest(`/races/${id}/betting/close`, { method: "POST" });
  },

  createRace(payload) {
    return apiRequest("/races", { method: "POST", body: payload });
  },

  updateRace(id, payload) {
    return apiRequest(`/races/${id}`, { method: "PATCH", body: payload });
  },

  openRaceRegistrationDemo(id) {
    return apiRequest(`/races/${id}/open-registration-demo`, { method: "POST" });
  },

  setRaceRegistrationDemoMode(enabled) {
    return apiRequest("/races/registration-demo-mode", {
      method: "POST",
      body: { enabled },
    });
  },

  deleteRace(id) {
    return apiRequest(`/races/${id}`, { method: "DELETE" });
  },
};
