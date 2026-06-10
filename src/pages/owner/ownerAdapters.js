export function getDisplayStatus(status) {
  const normalized = (status || "").toLowerCase();

  if (normalized === "active") return "Ready";
  if (normalized === "inactive") return "Closed";
  if (normalized === "pending") return "Needs review";

  return status || "Needs review";
}

export function getApiStatus(status) {
  const normalized = (status || "").toLowerCase();

  if (normalized === "ready") return "active";
  if (normalized === "closed") return "inactive";
  if (normalized === "needs review") return "pending";

  return status || "active";
}

function getAgeFromBirthDate(dateOfBirth) {
  if (!dateOfBirth) return "Not set";

  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return "Not set";

  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDelta = now.getMonth() - birthDate.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age > 0 ? age : "Not set";
}

function getNumberFromWeight(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function toOwnerHorse(apiHorse) {
  const displayStatus = getDisplayStatus(apiHorse.status);
  const weightValue = apiHorse.weight ? `${apiHorse.weight} kg` : "Not set";
  const registrationNumber = apiHorse.registration_number || apiHorse._id?.slice(-6) || "No registration";

  return {
    id: apiHorse._id,
    registrationNumber,
    name: apiHorse.name || "Unnamed horse",
    breed: apiHorse.breed || "Unknown breed",
    age: getAgeFromBirthDate(apiHorse.date_of_birth),
    height: "Not set",
    weight: weightValue,
    status: displayStatus,
    readiness: displayStatus === "Ready" ? 90 : 60,
    jockey: "Unassigned",
    nextRace: "Unassigned",
    healthNote: apiHorse.health_status || "No health status recorded yet.",
    record: "No race record",
    imageUrl: apiHorse.image_url,
    raw: apiHorse,
  };
}

export function toOwnerProfile(apiProfile, user) {
  return {
    name: user?.full_name || user?.email || "Horse Owner",
    stable: apiProfile?.stable_name || "Stable not set",
    email: user?.email || "No email",
    phone: user?.phone_number || "No phone",
    location: apiProfile?.address || "No address",
    status: getDisplayStatus(apiProfile?.status || "active"),
    season: "Season 2026",
    joined: "Joined account",
    winRate: "Not tracked",
    earnings: "Not tracked",
    licenseNumber: apiProfile?.license_number || "No license",
    raw: apiProfile,
  };
}

export function toHorsePayload(form) {
  const payload = {
    name: form.name,
    breed: form.breed,
    health_status: form.healthNote,
    registration_number: form.registrationNumber,
    status: getApiStatus(form.status),
  };

  const weight = getNumberFromWeight(form.weight);
  if (weight !== undefined) {
    payload.weight = weight;
  }

  return payload;
}
