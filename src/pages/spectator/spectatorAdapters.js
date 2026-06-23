import tournamentImage from "../../img/img_horse03.png";
import { normalizeBettingMarketStatus, normalizeRaceLifecycle } from "./race/raceStatus";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
}

function formatDate(value) {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function formatPrize(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
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

export function toSpectatorTournament(apiTournament) {
  const status = normalizeTournamentStatus(apiTournament.status);

  return {
    id: getId(apiTournament),
    name: apiTournament.name || "Unnamed tournament",
    description: apiTournament.description || "",
    location: apiTournament.location || "Venue not published",
    status,
    prize: formatPrize(apiTournament.prize_pool || apiTournament.prize),
    date: formatDate(apiTournament.start_date || apiTournament.date),
    endDate: formatDate(apiTournament.end_date),
    image: apiTournament.image_url || tournamentImage,
    distance: apiTournament.distance ? `${apiTournament.distance}m` : null,
    track: apiTournament.track || null,
    entries: apiTournament.entries ?? apiTournament.max_participants ?? null,
  };
}

export function toSpectatorRace(apiRace) {
  const raceDate = apiRace.race_date || apiRace.date;
  const date = new Date(raceDate);
  const hasValidDate = !Number.isNaN(date.getTime());
  const marketStatus = apiRace.betting_status
    || apiRace.market_status
    || apiRace.betting_market?.status
    || apiRace.market?.status;

  return {
    id: getId(apiRace),
    tournamentId: getId(apiRace.tournament_id),
    roundId: getId(apiRace.round_id),
    roundName: apiRace.round_id?.name || apiRace.round?.name || apiRace.round_name || "Round not published",
    raceDate: hasValidDate ? date.toISOString() : null,
    time: hasValidDate
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "TBD",
    name: apiRace.name || "Unnamed race",
    distance: apiRace.distance ? `${apiRace.distance}m` : "Distance not published",
    location: apiRace.location || apiRace.tournament_id?.location || "Venue not published",
    runnerCount: apiRace.runner_count ?? apiRace.participant_count ?? apiRace.entries ?? null,
    maxParticipants: apiRace.max_participants ?? null,
    rawRaceStatus: apiRace.status || "",
    raceStatus: normalizeRaceLifecycle(apiRace.status),
    bettingStatus: normalizeBettingMarketStatus(marketStatus),
    bettingClosesAt: apiRace.betting_closes_at || apiRace.betting_market?.closes_at || null,
    resultStatus: apiRace.result_status || null,
  };
}

export function adaptTournamentList(payload) {
  const rows = extractCollection(payload, ["tournaments", "data"]);

  return {
    tournaments: rows.map(toSpectatorTournament),
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
    tournament: toSpectatorTournament(tournamentRow, 0),
    races: races.map(toSpectatorRace),
  };
}

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
    jockey: typeof jockey === "string" ? jockey : jockey.user_id?.full_name || jockey.full_name || apiResult.jockey_name || "Unknown Jockey",
    race: typeof race === "string" ? race : race.name || apiResult.race_name || "Race",
    lane: apiResult.lane || "-",
    time: apiResult.final_finish_time ?? apiResult.finish_time ?? "-",
    margin: (apiResult.final_position ?? apiResult.position) === 1 ? "Winner" : "-",
    status: apiResult.status === "published" ? "Official" : "Review",
    score: apiResult.final_score ?? apiResult.score ?? "-",
    publishedAt: apiResult.published_at || null,
  };
}

export function adaptRaceResults(payload) {
  const rows = extractCollection(payload, ["results", "race_results", "data"]);

  if (!rows.length) {
    return {
      results: [],
    };
  }

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
      image: tournamentImage,
    }));
}
