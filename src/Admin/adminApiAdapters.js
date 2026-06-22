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

function getNamedEntity(value, fallback = {}) {
  if (!value || typeof value !== "object") return fallback;
  return value;
}

function getEntityId(value) {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value._id || value.id || "-";
}

function getEntityName(value, fallback = "Unknown") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.name || value.full_name || value.email || value.title || value.race_name || value.horse_name || fallback;
}

function unwrapRegistrations(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.registrations)) return data.registrations;
  if (Array.isArray(data?.data?.registrations)) return data.data.registrations;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getRegistrationHorse(registration) {
  return getNamedEntity(registration.horse || registration.horse_id || registration.horseId, {});
}

function getRegistrationRace(registration) {
  return getNamedEntity(registration.race || registration.race_id || registration.raceId, {});
}

function getRegistrationTournament(registration) {
  const race = getRegistrationRace(registration);
  return getNamedEntity(
    registration.tournament || registration.tournament_id || registration.tournamentId || race.tournament || race.tournament_id,
    {},
  );
}

function getRegistrationOwner(registration) {
  const horse = getRegistrationHorse(registration);
  return getNamedEntity(registration.owner || registration.owner_id || registration.ownerId || horse.owner || horse.owner_id, {});
}

function getRegistrationTitle(registration) {
  const horseName = getEntityName(getRegistrationHorse(registration), "Horse");
  const raceName = getEntityName(getRegistrationRace(registration), "Race");
  return `${horseName} -> ${raceName}`;
}

export function adaptAdminUserDetail(data) {
  const user = data?.user || {};
  const roles = asArray(data?.roles);
  const profiles = data?.profiles || {};

  return {
    type: "user",
    id: user._id || user.id || "-",
    title: user.full_name || user.email || "User account",
    fields: [
      ["Email", user.email || "-"],
      ["Phone", user.phone_number || "-"],
      ["Status", getStatusLabel(user.status)],
      ["Verification", user.email_verified ? "Verified" : "Unverified"],
      ["Created", formatDate(user.created_at)],
      ["Updated", formatDate(user.updated_at)],
    ],
    roles,
    profiles: Object.entries(profiles).map(([role, profile]) => ({
      role,
      label: getRoleLabel(role),
      id: profile?._id || profile?.id || "-",
      status: getStatusLabel(profile?.status),
      values: Object.entries(profile || {}).filter(([key]) => !["_id", "id", "user_id", "status"].includes(key)),
    })),
  };
}

export function adaptRoleApplicationDetail(data) {
  const application = data?.application || data || {};
  const user = getApplicationUser(application);
  const applicationData = application.application_data || {};

  return {
    type: "application",
    id: application._id || application.id || "-",
    title: user.full_name || user.email || "Role application",
    fields: [
      ["Applicant email", user.email || application.user_email || "-"],
      ["Requested role", getRoleLabel(application.requested_role)],
      ["Status", getStatusLabel(application.status)],
      ["Submitted", formatDate(application.created_at)],
      ["Reviewed", formatDate(application.reviewed_at)],
      ["Admin note", application.admin_note || "-"],
    ],
    applicationData: Object.entries(applicationData),
    documents: asArray(application.documents),
  };
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

export function adaptRaceRegistrationDetail(data) {
  const registration = data?.registration || data?.data?.registration || data?.data || data || {};
  const horse = getRegistrationHorse(registration);
  const race = getRegistrationRace(registration);
  const tournament = getRegistrationTournament(registration);
  const owner = getRegistrationOwner(registration);

  return {
    type: "raceRegistration",
    id: registration._id || registration.id || "-",
    title: getRegistrationTitle(registration),
    fields: [
      ["Horse", getEntityName(horse, registration.horse_name || "Unknown horse")],
      ["Horse ID", getEntityId(registration.horse_id || horse)],
      ["Race", getEntityName(race, registration.race_name || "Unknown race")],
      ["Race ID", getEntityId(registration.race_id || race)],
      ["Tournament", getEntityName(tournament, registration.tournament_name || "-")],
      ["Owner", getEntityName(owner, registration.owner_email || "Unknown owner")],
      ["Owner ID", getEntityId(registration.owner_id || owner)],
      ["Status", getStatusLabel(registration.status)],
      ["Submitted", formatDate(registration.created_at || registration.submitted_at)],
      ["Reviewed", formatDate(registration.reviewed_at)],
      ["Admin note", registration.admin_note || registration.note || "-"],
    ],
  };
}

export function adaptRaceRegistrations(data) {
  const registrations = unwrapRegistrations(data);
  const rows = registrations.map((registration) => {
    const horse = getRegistrationHorse(registration);
    const race = getRegistrationRace(registration);
    const tournament = getRegistrationTournament(registration);
    const target = [
      getEntityName(race, registration.race_name || "Race"),
      getEntityName(tournament, registration.tournament_name || ""),
    ].filter(Boolean).join(" / ");

    return [
      registration._id || registration.id || "-",
      getEntityName(horse, registration.horse_name || "Horse"),
      "Horse Race Entry",
      target || "-",
      formatDate(registration.created_at || registration.submitted_at),
      getStatusLabel(registration.status),
    ];
  });

  return {
    summary: [
      { label: "Waiting approval", value: String(rows.filter((row) => row[5] === "Pending").length) },
      { label: "Approved entries", value: String(rows.filter((row) => row[5] === "Approved").length) },
      { label: "Rejected entries", value: String(rows.filter((row) => row[5] === "Rejected").length) },
    ],
    tables: [
      {
        title: "Race registration queue",
        columns: ["Reg ID", "Participant", "Role", "Target", "Submitted", "Status"],
        rows,
      },
    ],
  };
}
