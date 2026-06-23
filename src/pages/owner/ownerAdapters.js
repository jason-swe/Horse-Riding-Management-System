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
    season: "Unavailable",
    joined: "Join date unavailable",
    winRate: "Unavailable",
    earnings: "Unavailable",
    licenseNumber: apiProfile?.license_number || "No license",
    raw: apiProfile,
  };
}

export function toOwnerProfilePayload(form) {
  return {
    stable_name: form.stable,
    address: form.location,
    license_number: form.licenseNumber,
    status: getApiStatus(form.status),
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

function getName(value, fallback = "Unknown") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.full_name || value.name || value.email || fallback;
}

export function toOwnerJockey(apiJockey, index = 0) {
  const user = apiJockey.user_id || apiJockey.user || {};
  const races = apiJockey.total_races || apiJockey.races || 0;
  const wins = apiJockey.total_wins || apiJockey.wins || 0;

  return {
    id: apiJockey._id || apiJockey.id || `J-${index + 1}`,
    name: getName(user, apiJockey.name || `Jockey ${index + 1}`),
    assignedHorse: "Unassigned",
    races,
    wins,
    availability: apiJockey.status === "active" ? "Available" : getDisplayStatus(apiJockey.status),
    status: apiJockey.status === "active" ? "Available" : getDisplayStatus(apiJockey.status),
    licenseNumber: apiJockey.license_number || "No license",
    raw: apiJockey,
  };
}

export function toOwnerTournament(apiTournament, index = 0) {
  return {
    id: apiTournament._id || apiTournament.id || `T-${index + 1}`,
    name: apiTournament.name || `Tournament ${index + 1}`,
    location: apiTournament.location || "Location TBD",
    status: getDisplayStatus(apiTournament.status || "active"),
    date: apiTournament.start_date ? new Date(apiTournament.start_date).toISOString().slice(0, 10) : "TBD",
    raw: apiTournament,
  };
}

export function toHorseApprovalStatus(data) {
  return {
    readyToRace: Boolean(data?.ready_to_race),
    registrations: (data?.registrations || []).map(toOwnerRegistration),
    checks: data?.checks || [],
  };
}

function getRegistrationStatus(status) {
  const normalized = (status || "").toLowerCase();

  if (normalized === "approved") return "Approved";
  if (normalized === "rejected") return "Rejected";
  if (normalized === "cancelled" || normalized === "canceled") return "Cancelled";

  return "Pending";
}

export function toOwnerRegistration(apiRegistration, index = 0) {
  const horse = apiRegistration.horse_id || apiRegistration.horse || {};
  const race = apiRegistration.race_id || apiRegistration.race || {};
  const tournament = apiRegistration.tournament_id || apiRegistration.tournament || race.tournament_id || {};
  const registeredAt = apiRegistration.registered_at || apiRegistration.created_at || apiRegistration.updated_at;
  const date = registeredAt && !Number.isNaN(new Date(registeredAt).getTime())
    ? new Date(registeredAt).toISOString().slice(0, 10)
    : "Pending date";

  return {
    id: apiRegistration._id || apiRegistration.id || `REG-${index + 1}`,
    horseId: horse._id || horse.id || apiRegistration.horse_id,
    raceId: race._id || race.id || apiRegistration.race_id,
    tournamentId: tournament._id || tournament.id || apiRegistration.tournament_id,
    horse: horse.name || `Horse ${index + 1}`,
    race: race.name || "Race pending",
    tournament: tournament.name || "Tournament pending",
    submitted: date,
    note: apiRegistration.note || apiRegistration.admin_note || "No note recorded.",
    status: getRegistrationStatus(apiRegistration.status),
    raceDate: race.race_date || null,
    venue: race.location || "Venue unavailable",
    round: getName(race.round_id || race.round, "Round unavailable"),
    raceStatus: getDisplayStatus(race.status || "scheduled"),
    raw: apiRegistration,
  };
}

export function toOwnerScheduleEntry(registration) {
  const raceDate = registration.raceDate ? new Date(registration.raceDate) : null;
  const hasRaceDate = raceDate && !Number.isNaN(raceDate.getTime());
  const status = registration.status === "Approved"
    ? "Confirmed"
    : registration.status === "Pending"
      ? "Pending"
      : "Closed";

  return {
    id: registration.id,
    raceId: registration.raceId,
    horseId: registration.horseId,
    race: registration.race,
    tournament: registration.tournament,
    horse: registration.horse,
    jockey: "Assignment unavailable",
    venue: registration.venue,
    round: registration.round,
    status,
    raceStatus: registration.raceStatus,
    date: hasRaceDate
      ? raceDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      : "Date unavailable",
    clock: hasRaceDate
      ? raceDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      : "Time unavailable",
    time: hasRaceDate
      ? `${raceDate.toLocaleDateString("en-US", { month: "short", day: "2-digit" })}, ${raceDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
      : "Date unavailable",
  };
}
