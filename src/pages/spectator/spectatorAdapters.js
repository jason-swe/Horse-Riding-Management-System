import { normalizeBettingMarketStatus, normalizeRaceLifecycle } from "./race/raceStatus";
import horseAmber from "../../assets/pixel-horses/horse-amber.png";
import horseBlue from "../../assets/pixel-horses/horse-blue.png";
import horseIvory from "../../assets/pixel-horses/horse-ivory.png";
import horseMint from "../../assets/pixel-horses/horse-mint.png";
import horseRed from "../../assets/pixel-horses/horse-red.png";

// ─── Image pools (from asset docs) ────────────────────────────────────────────
const TRACK_IMAGES = [
  "https://i.pinimg.com/736x/4d/e7/2f/4de72f60ea3018aafe760f0148a29af6.jpg",
  "https://i.pinimg.com/1200x/3d/ff/a1/3dffa140ed55cb85b21a9e021e4cb2c8.jpg",
  "https://i.pinimg.com/736x/56/b4/2f/56b42f543b435926b04654e794d620f2.jpg",
  "https://i.pinimg.com/1200x/ae/08/50/ae0850e67c950abd7e962008bc7ae3fb.jpg",
];

const HORSE_JOCKEY_IMAGES = [horseAmber, horseBlue, horseIvory, horseMint, horseRed];

// Deterministic image selection based on id string → stable across renders
function pickImage(pool, id) {
  if (!id) return pool[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length];
}

export function getTrackImage(id) {
  return pickImage(TRACK_IMAGES, id);
}

export function getHorseJockeyImage(id) {
  return pickImage(HORSE_JOCKEY_IMAGES, id);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
}

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function formatDateDisplay(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatTimeDisplay(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function formatPrize(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return String(value);
}

function normalizeTournamentStatus(status) {
  const value = String(status || "").toLowerCase();
  if (["active", "ongoing", "running", "in_progress", "started"].includes(value)) return "Active";
  if (["completed", "finished", "closed", "archived"].includes(value)) return "Completed";
  return "Upcoming";
}

function extractCollection(payload, keys) {
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

// ─── Tournament adapter ───────────────────────────────────────────────────────
export function toSpectatorTournament(apiTournament) {
  const id = getId(apiTournament);
  const status = normalizeTournamentStatus(apiTournament.status);

  return {
    id,
    name: apiTournament.name || "Unnamed tournament",
    description: apiTournament.description || "",
    location: apiTournament.location || null,
    status,
    prize: formatPrize(apiTournament.prize_pool || apiTournament.prize),
    date: formatDate(apiTournament.start_date || apiTournament.date),
    dateDisplay: formatDateDisplay(apiTournament.start_date || apiTournament.date),
    endDate: formatDate(apiTournament.end_date),
    endDateDisplay: formatDateDisplay(apiTournament.end_date),
    image: apiTournament.image_url || getTrackImage(id),
    distance: apiTournament.distance ? `${apiTournament.distance}m` : null,
    track: apiTournament.track || null,
    entries: apiTournament.entries ?? apiTournament.max_participants ?? null,
  };
}

// ─── Race adapter ─────────────────────────────────────────────────────────────
export function toSpectatorRace(apiRace) {
  const id = getId(apiRace);
  const raceDate = apiRace.race_date || apiRace.date;
  const date = new Date(raceDate);
  const hasValidDate = !Number.isNaN(date.getTime());

  const marketStatus =
    apiRace.betting_status ||
    apiRace.market_status ||
    apiRace.betting_market?.status ||
    apiRace.market?.status;

  const bettingMarket = apiRace.betting_market
    ? {
        status: normalizeBettingMarketStatus(apiRace.betting_market.status),
        opensAt: apiRace.betting_market.opens_at || null,
        closesAt: apiRace.betting_market.closes_at || null,
        opensAtDisplay: formatDateDisplay(apiRace.betting_market.opens_at),
        closesAtDisplay: formatDateDisplay(apiRace.betting_market.closes_at),
        closesAtTimeDisplay: formatTimeDisplay(apiRace.betting_market.closes_at),
        minStake: apiRace.betting_market.min_stake ?? null,
        maxStake: apiRace.betting_market.max_stake ?? null,
        currency: apiRace.betting_market.currency || "points",
      }
    : null;

  // Referee info
  const refereeProfile = apiRace.referee_id;
  const refereeUser = refereeProfile?.user_id;
  const refereeName = refereeUser?.full_name || null;
  const refereeExperience = refereeProfile?.experience_years ?? null;

  return {
    id,
    tournamentId: getId(apiRace.tournament_id),
    roundId: getId(apiRace.round_id),
    roundName: apiRace.round_id?.name || apiRace.round?.name || apiRace.round_name || null,
    roundOrder: apiRace.round_id?.round_order ?? null,
    raceDate: hasValidDate ? date.toISOString() : null,
    raceDateDisplay: hasValidDate ? formatDateDisplay(raceDate) : null,
    time: hasValidDate
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : null,
    name: apiRace.name || "Unnamed race",
    distance: apiRace.distance ? `${apiRace.distance}m` : null,
    location: apiRace.location || apiRace.tournament_id?.location || null,
    runnerCount: apiRace.runner_count ?? apiRace.participant_count ?? apiRace.entries ?? null,
    maxParticipants: apiRace.max_participants ?? null,
    registrationLocked: apiRace.registration_locked ?? false,
    rawRaceStatus: apiRace.status || "",
    raceStatus: normalizeRaceLifecycle(apiRace.status),
    bettingStatus: normalizeBettingMarketStatus(marketStatus),
    bettingClosesAt: apiRace.betting_closes_at || apiRace.betting_market?.closes_at || null,
    bettingClosesAtDisplay: formatDateDisplay(apiRace.betting_closes_at || apiRace.betting_market?.closes_at),
    bettingMarket,
    resultStatus: apiRace.result_status || null,
    refereeName,
    refereeExperience,
    image: getHorseJockeyImage(id),
    updatedAt: apiRace.updated_at || apiRace.updatedAt || null,
  };
}

// ─── List adapters ────────────────────────────────────────────────────────────
export function adaptTournamentList(payload) {
  const rows = extractCollection(payload, ["tournaments", "data"]);
  return {
    tournaments: rows.map(toSpectatorTournament),
  };
}

export function summarizeTournamentRaces(racesPayload) {
  const races = extractCollection(racesPayload, ["races", "data"]).map(toSpectatorRace);
  const sortedRaces = [...races].sort((a, b) => new Date(a.raceDate || 0) - new Date(b.raceDate || 0));
  const nextRace = sortedRaces.find((race) => race.raceDate && new Date(race.raceDate).getTime() >= Date.now()) || sortedRaces[0];
  const distances = [...new Set(races.map((race) => race.distance).filter(Boolean))];
  const locations = [...new Set(races.map((race) => race.location).filter(Boolean))];
  const runnerCapacity = races.reduce((total, race) => total + (Number(race.maxParticipants) || 0), 0);
  const runnerEntries = races.reduce((total, race) => total + (Number(race.runnerCount) || 0), 0);

  return {
    raceCount: races.length,
    runnerCapacity: runnerCapacity || null,
    runnerEntries: runnerEntries || null,
    nextRaceDateDisplay: nextRace?.raceDateDisplay || null,
    nextRaceTime: nextRace?.time || null,
    distanceSummary: distances.length > 2 ? `${distances[0]} - ${distances[distances.length - 1]}` : distances.join(" / ") || null,
    trackSummary: locations[0] || null,
  };
}

export function adaptTournamentDetail({ tournamentPayload, racesPayload }) {
  const tournamentRow = tournamentPayload?.tournament || tournamentPayload;
  const races = extractCollection(racesPayload, ["races", "data"]);

  if (!tournamentRow?.name) {
    return {
      tournament: null,
      races: [],
    };
  }

  return {
    tournament: toSpectatorTournament(tournamentRow),
    races: races.map(toSpectatorRace),
  };
}

// ─── Race results adapters ────────────────────────────────────────────────────
export function toSpectatorRaceResult(apiResult, index = 0) {
  const horse = apiResult.horse_id || apiResult.horse || {};
  const jockey = apiResult.jockey_id || apiResult.jockey || {};
  const race = apiResult.race_id || apiResult.race || {};

  return {
    id: getId(apiResult) || `${getId(race)}-${getId(horse)}-${index}`,
    raceId: getId(race),
    horseId: getId(horse),
    position: apiResult.final_position ?? apiResult.position ?? index + 1,
    horse: typeof horse === "string" ? horse : horse.name || apiResult.horse_name || "Unknown Horse",
    jockey:
      typeof jockey === "string"
        ? jockey
        : jockey.user_id?.full_name || jockey.full_name || apiResult.jockey_name || "Unknown Jockey",
    race: typeof race === "string" ? race : race.name || apiResult.race_name || "Race",
    lane: apiResult.lane || "-",
    weight: typeof horse === "object" ? horse.weight : null,
    ownerId: typeof horse === "object" ? getId(horse.owner_id) : "",
    time: (() => {
      const val = apiResult.final_finish_time ?? apiResult.finish_time;
      if (val === null || val === undefined || val === "") return "-";
      const num = Number(val);
      return !Number.isNaN(num) ? num.toFixed(2) : val;
    })(),
    margin: (apiResult.final_position ?? apiResult.position) === 1 ? "Winner" : "-",
    status: apiResult.status === "published" ? "Official" : "Review",
    score: apiResult.final_score ?? apiResult.score ?? "-",
    publishedAt: apiResult.published_at || null,
  };
}

export function adaptRaceResults(payload) {
  const rows = extractCollection(payload, ["results", "race_results", "data"]);
  if (!rows.length) return { results: [] };
  return {
    results: rows.map(toSpectatorRaceResult),
  };
}

export function toHorseLeaderboard(results = []) {
  const byHorse = new Map();

  results.forEach((result) => {
    const key = result.horseId || result.horse;
    const existing = byHorse.get(key) || {
      name: result.horse,
      jockey: result.jockey,
      wins: 0,
      starts: 0,
      totalScore: 0,
    };

    existing.starts += 1;
    existing.wins += Number(result.position) === 1 ? 1 : 0;
    existing.totalScore += Number(result.score) || 0;
    if (!existing.jockey) existing.jockey = result.jockey;
    byHorse.set(key, existing);
  });

  return Array.from(byHorse.values())
    .sort((a, b) => b.wins - a.wins || b.totalScore - a.totalScore || a.name.localeCompare(b.name))
    .map((horse, index) => ({
      rank: index + 1,
      name: horse.name,
      jockey: horse.jockey,
      wins: horse.wins,
      starts: horse.starts,
      totalScore: horse.totalScore,
      winRate: `${Math.round((horse.wins / Math.max(horse.starts, 1)) * 100)}%`,
      image: getTrackImage(horse.name),
    }));
}
