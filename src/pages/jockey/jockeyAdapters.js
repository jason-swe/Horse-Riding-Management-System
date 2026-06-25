import {
  jockeyAssignments,
  jockeyInvitations,
  jockeyProfile,
  jockeyResults,
  jockeySchedule,
} from "./jockeyData";

const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("en", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function asArray(value, key) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.[key])) return value[key];
  return [];
}

function getId(value) {
  return value?._id || value?.id || value || "";
}

function getName(value, fallback = "Unknown") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.name || value.full_name || value.stable_name || value.title || fallback;
}

function formatRaceTime(value) {
  if (!value) return "Race day, TBA";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return `${monthFormatter.format(date)}, ${timeFormatter.format(date)}`;
}

function normalizeStatus(status, fallback = "Pending") {
  const value = String(status || fallback).toLowerCase();
  const map = {
    pending: "Pending",
    meeting_invited: "Meeting invite",
    meeting_accepted: "Meeting accepted",
    meeting_rejected: "Meeting rejected",
    terms_agreed: "Terms ready",
    contract_uploaded: "Contract review",
    contract_rejected: "Contract rejected",
    accepted: "Accepted",
    approved: "Accepted",
    confirmed: "Accepted",
    rejected: "Rejected",
    cancelled: "Cancelled",
    canceled: "Cancelled",
    review: "Review",
    draft: "Draft",
    published: "Published",
    active: "Available",
    inactive: "Unavailable",
  };

  return map[value] || value.charAt(0).toUpperCase() + value.slice(1);
}

function mapAssignment(item, index = 0) {
  const race = item.race_id || item.race || {};
  const horse = item.horse_id || item.horse || {};
  const owner = item.owner_id || item.owner || horse.owner_id || {};
  const meeting = item.meeting || {};
  const contract = item.contract || {};
  const status = normalizeStatus(item.status);

  return {
    id: getId(item) || `ASG-${index + 1}`,
    horse: getName(horse, item.horse_name || `Horse ${index + 1}`),
    owner: getName(owner, item.owner_name || "Race owner"),
    status,
    race: getName(race, item.race_name || "Assigned race"),
    tournament: getName(race.tournament_id || item.tournament_id, item.tournament_name || "Tournament"),
    date: formatRaceTime(race.race_date || item.race_date || item.created_at),
    venue: race.location || item.location || "Race track",
    round: getName(race.round_id || item.round_id, item.round_name || "Race round"),
    note: item.invitation_message || item.response_message || item.note || "Owner invitation is ready for review.",
    rawStatus: item.status || "",
    meetingTitle: meeting.title || item.meeting_title || "Owner meeting",
    meetingUrl: meeting.meeting_url || item.meeting_url || "",
    meetingTime: formatRaceTime(meeting.meeting_time || item.meeting_time),
    contractTitle: contract.title || item.contract_title || "Jockey agreement",
    contractUrl: contract.file_url || item.contract_url || item.contract_link || "",
    contractFileName: contract.file_name || item.contract_file_name || "",
    contractNumber: contract.contract_number || item.contract_number || "",
    contractNote: contract.note || "",
    terms: item.terms?.agreed_terms || item.agreed_terms || "",
    meetingNote: item.terms?.meeting_note || "",
    responseMessage: contract.response_message || meeting.response_message || item.response_message || "",
  };
}

function mapResult(item, index = 0) {
  const race = item.race_id || item.race || {};
  const horse = item.horse_id || item.horse || {};
  const position = Number(item.position || index + 1);
  const rawTime = item.finish_time;
  const finishTime = rawTime !== null && rawTime !== undefined && rawTime !== "" && !Number.isNaN(Number(rawTime))
    ? `${Number(rawTime).toFixed(2)}s`
    : item.time || "TBA";

  return {
    id: getId(item) || `RES-${index + 1}`,
    date: formatRaceTime(race.race_date || item.created_at).split(", ")[0],
    race: getName(race, item.race_name || "Published race"),
    horse: getName(horse, item.horse_name || "Assigned horse"),
    position,
    time: finishTime,
    prize: item.prize || item.prize_amount || "-",
    status: normalizeStatus(item.status, "Published"),
  };
}

function mapProfile(data, user, stats, approvalStatus) {
  const profile = data?.jockey || data?.profile || data?.jockey_profile || data || {};
  const account = data?.user || user || {};
  const winRate = Number(stats?.win_rate ?? 0);
  const totalRaces = Number(stats?.total_races ?? 0);
  const top3 = Number(stats?.top_3_finishes ?? 0);
  const podiumRate = totalRaces ? Math.round((top3 / totalRaces) * 100) : 0;
  const approved = approvalStatus?.approval_status || approvalStatus || {};
  const status = approved.is_approved || profile.status === "active" ? "Available" : normalizeStatus(profile.status, "Review");

  return {
    ...jockeyProfile,
    id: profile._id || approved.jockey_id || jockeyProfile.id,
    name: account.full_name || profile.full_name || jockeyProfile.name,
    email: account.email || jockeyProfile.email,
    phone: account.phone_number || jockeyProfile.phone,
    location: profile.location || profile.address || jockeyProfile.location,
    license: profile.license_number ? `License ${profile.license_number}` : jockeyProfile.license,
    status,
    stableConnection: profile.stable_name || jockeyProfile.stableConnection,
    weightClass: profile.weight ? `${profile.weight} kg class` : jockeyProfile.weightClass,
    height: profile.height || "",
    weight: profile.weight || "",
    experienceYears: profile.experience_years || 0,
    licenseNumber: profile.license_number || "",
    apiStatus: profile.status || "active",
    winRate: totalRaces ? `${Math.round(winRate)}%` : jockeyProfile.winRate,
    podiumRate: totalRaces ? `${podiumRate}%` : jockeyProfile.podiumRate,
  };
}

function mapViolation(item, index = 0) {
  const race = item.race_id || item.race || {};
  const horse = item.horse_id || item.horse || {};
  const referee = item.referee_id || item.referee || {};
  const refereeUser = referee.user_id || referee.user || {};

  return {
    id: getId(item) || `VIO-${index + 1}`,
    type: item.violation_type || "Recorded violation",
    description: item.description || "No additional description.",
    penalty: item.penalty || "No penalty recorded",
    status: normalizeStatus(item.status, "Recorded"),
    race: getName(race, "Race pending"),
    horse: getName(horse, "Horse pending"),
    referee: getName(refereeUser, "Race referee"),
    date: formatRaceTime(item.created_at).split(", ")[0],
  };
}

export function adaptJockeyApiData({ me, assignments, schedule, results, stats, violations, approvalStatus, user }) {
  const assignmentItems = asArray(assignments, "assignments").map(mapAssignment);
  const scheduleItems = asArray(schedule, "schedule").map((item, index) => {
    const mapped = item.race_id || item.horse_id ? mapAssignment(item, index) : mapAssignment({ ...item, status: item.status || "accepted" }, index);
    return {
      id: mapped.id,
      time: mapped.date,
      race: mapped.race,
      tournament: mapped.tournament,
      horse: mapped.horse,
      venue: mapped.venue,
      round: mapped.round,
      status: mapped.status,
    };
  });
  const resultItems = asArray(results, "results").map(mapResult);
  const violationItems = asArray(violations, "violations").map(mapViolation);
  const normalizedStats = stats?.stats || stats || {};
  const profile = mapProfile(me, user, normalizedStats, approvalStatus);
  const sourceAssignments = assignmentItems.length ? assignmentItems : jockeyAssignments;
  const sourceSchedule = scheduleItems.length ? scheduleItems : jockeySchedule;
  const sourceResults = resultItems.length ? resultItems : jockeyResults;

  return {
    profile,
    assignments: sourceAssignments,
    invitations: sourceAssignments.length ? sourceAssignments : jockeyInvitations,
    schedule: sourceSchedule,
    results: sourceResults,
    stats: normalizedStats,
    violations: violationItems,
    usedFallback: !assignmentItems.length && !scheduleItems.length && !resultItems.length,
  };
}
