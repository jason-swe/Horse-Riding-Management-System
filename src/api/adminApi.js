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

  confirmRaceResults(raceId) {
    return apiRequest(`/race-results/races/${raceId}/confirm`, { method: "POST" });
  },

  publishRaceResults(raceId) {
    return apiRequest(`/race-results/races/${raceId}/publish`, { method: "POST" });
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

  createRace(payload) {
    return apiRequest("/races", { method: "POST", body: payload });
  },

  updateRace(id, payload) {
    return apiRequest(`/races/${id}`, { method: "PATCH", body: payload });
  },

  deleteRace(id) {
    return apiRequest(`/races/${id}`, { method: "DELETE" });
  },
};
