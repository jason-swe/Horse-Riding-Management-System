import { apiRequest } from "./client";

function withQuery(path, params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return `${path}${suffix}`;
}

export const jockeyApi = {
  getMe() {
    return apiRequest("/jockeys/me");
  },

  updateMe(payload) {
    return apiRequest("/jockeys/me", {
      method: "PATCH",
      body: payload,
    });
  },

  getApprovalStatus() {
    return apiRequest("/jockeys/me/approval-status");
  },

  getAssignments(params = {}) {
    return apiRequest(withQuery("/jockeys/me/assignments", params));
  },

  acceptAssignment(id, responseMessage = "Accepted") {
    return apiRequest(`/jockeys/me/assignments/${id}/accept`, {
      method: "POST",
      body: { response_message: responseMessage },
    });
  },

  rejectAssignment(id, responseMessage = "Rejected") {
    return apiRequest(`/jockeys/me/assignments/${id}/reject`, {
      method: "POST",
      body: { response_message: responseMessage },
    });
  },

  getSchedule(params = {}) {
    return apiRequest(withQuery("/jockeys/me/schedule", params));
  },

  getResults() {
    return apiRequest("/jockeys/me/results");
  },

  getStats() {
    return apiRequest("/jockeys/me/stats");
  },

  getViolations() {
    return apiRequest("/jockeys/me/violations");
  },
};
