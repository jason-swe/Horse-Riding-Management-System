const roleLabels = {
  admin: "Admin",
  horse_owner: "Horse Owner",
  jockey: "Jockey",
  race_referee: "Race Referee",
  spectator: "Spectator",
};

const statusLabels = {
  active: "Active",
  pending_verification: "Pending",
  blocked: "Suspended",
  disabled: "Suspended",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

function asArray(value, key) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.[key])) return value[key];
  return [];
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
}

function getUserFromEnvelope(item) {
  return item.user || item;
}

function getRoleLabel(role) {
  return roleLabels[role] || role;
}

function getStatusLabel(status) {
  return statusLabels[status] || status || "-";
}

function getApplicationUser(application) {
  const user = application.user_id || application.user || {};
  return typeof user === "object" ? user : {};
}

function getApplicationTarget(application) {
  const data = application.application_data || {};
  return data.stable_name || data.license_number || data.accreditation_body || data.ownership_type || "Role access";
}

export function adaptAdminUsers(data) {
  const users = asArray(data, "users");
  const rows = users.map((item) => {
    const user = getUserFromEnvelope(item);
    const roles = asArray(item.roles || user.roles).map(getRoleLabel);
    const verification = user.email_verified ? "Verified" : "Unverified";

    return [
      user._id || user.id || "-",
      user.full_name || user.email || "Unknown user",
      roles.length ? roles.join(", ") : "No role",
      getStatusLabel(user.status),
      verification,
    ];
  });

  const activeCount = rows.filter((row) => row[3] === "Active").length;
  const pendingCount = rows.filter((row) => row[3] === "Pending").length;
  const roleCount = rows.reduce((total, row) => total + row[2].split(",").filter(Boolean).length, 0);

  return {
    summary: [
      { label: "Active users", value: String(activeCount) },
      { label: "Pending reviews", value: String(pendingCount) },
      { label: "Assigned roles", value: String(roleCount) },
    ],
    tables: [
      {
        title: "User accounts",
        columns: ["ID", "Name", "Role", "Status", "Verification"],
        rows,
      },
    ],
  };
}

export function adaptRoleApplications(data) {
  const applications = asArray(data, "applications");
  const rows = applications.map((application) => {
    const user = getApplicationUser(application);
    return [
      application._id || application.id || "-",
      user.full_name || user.email || application.user_email || "Applicant",
      getRoleLabel(application.requested_role),
      getApplicationTarget(application),
      formatDate(application.created_at),
      getStatusLabel(application.status),
    ];
  });

  return {
    summary: [
      { label: "Waiting approval", value: String(rows.filter((row) => row[5] === "Pending").length) },
      { label: "Approved requests", value: String(rows.filter((row) => row[5] === "Approved").length) },
      { label: "Rejected requests", value: String(rows.filter((row) => row[5] === "Rejected").length) },
    ],
    tables: [
      {
        title: "Role application queue",
        columns: ["Reg ID", "Participant", "Role", "Target", "Submitted", "Status"],
        rows,
      },
    ],
  };
}
