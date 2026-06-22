import { tournaments as mockTournaments, tournamentContenders, tournamentRaces } from "./tournamentData";
import { normalizeBettingMarketStatus, normalizeRaceLifecycle } from "./race/raceStatus";

const fallbackImages = mockTournaments.map((tournament) => tournament.image);

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

function formatPrize(value, index) {
  if (value) return value;
  return mockTournaments[index % mockTournaments.length]?.prize || "$0";
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

export function toSpectatorTournament(apiTournament, index = 0) {
  const fallback = mockTournaments[index % mockTournaments.length] || mockTournaments[0];
  const status = normalizeTournamentStatus(apiTournament.status);

  return {
    id: getId(apiTournament),
    name: apiTournament.name || fallback.name,
    description: apiTournament.description || "",
    location: apiTournament.location || fallback.location,
    status,
    prize: formatPrize(apiTournament.prize_pool || apiTournament.prize, index),
    date: formatDate(apiTournament.start_date || apiTournament.date),
    endDate: formatDate(apiTournament.end_date),
    image: apiTournament.image_url || fallbackImages[index % fallbackImages.length],
    distance: apiTournament.distance ? `${apiTournament.distance}m` : fallback.distance,
    track: apiTournament.track || "Race track",
    entries: apiTournament.entries || apiTournament.max_participants || fallback.entries,
  };
}

export function toSpectatorRace(apiRace, index = 0) {
  const raceDate = apiRace.race_date || apiRace.date;
  const date = new Date(raceDate);
  const fallback = tournamentRaces[index % tournamentRaces.length] || tournamentRaces[0];
  const marketStatus = apiRace.betting_status
    || apiRace.market_status
    || apiRace.betting_market?.status
    || apiRace.market?.status;

  return {
    id: getId(apiRace) || fallback.id,
    tournamentId: getId(apiRace.tournament_id),
    roundId: getId(apiRace.round_id),
    roundName: apiRace.round_id?.name || apiRace.round_name || fallback.roundName,
    raceDate: Number.isNaN(date.getTime()) ? fallback.raceDate : date.toISOString(),
    time: Number.isNaN(date.getTime())
      ? fallback.time
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    name: apiRace.name || fallback.name,
    distance: apiRace.distance ? `${apiRace.distance}m` : fallback.distance,
    location: apiRace.location || fallback.location || "Race track",
    runnerCount: apiRace.runner_count || apiRace.participant_count || apiRace.entries || 0,
    maxParticipants: apiRace.max_participants || fallback.maxParticipants || 0,
    rawRaceStatus: apiRace.status || "",
    raceStatus: normalizeRaceLifecycle(apiRace.status),
    bettingStatus: normalizeBettingMarketStatus(marketStatus),
    bettingClosesAt: apiRace.betting_closes_at || apiRace.betting_market?.closes_at || null,
    resultStatus: apiRace.result_status || null,
  };
}

export function adaptTournamentList(payload) {
  const rows = extractCollection(payload, ["tournaments", "data"]);

  if (!rows.length) {
    return {
      tournaments: mockTournaments,
      usedFallback: true,
    };
  }

  return {
    tournaments: rows.map(toSpectatorTournament),
    usedFallback: false,
  };
}

export function adaptTournamentDetail({ tournamentPayload, racesPayload }) {
  const tournamentRow = tournamentPayload?.tournament || tournamentPayload;
  const races = extractCollection(racesPayload, ["races", "data"]);

  if (!tournamentRow?.name) {
    return {
      tournament: null,
      races: tournamentRaces,
      contenders: tournamentContenders,
      usedFallback: true,
    };
  }

  return {
    tournament: toSpectatorTournament(tournamentRow, 0),
    races: races.length ? races.map(toSpectatorRace) : tournamentRaces,
    contenders: tournamentContenders,
    usedFallback: !races.length,
  };
}

export function toSpectatorRaceResult(apiResult, index = 0) {
  const horse = apiResult.horse_id || apiResult.horse || {};
  const jockey = apiResult.jockey_id || apiResult.jockey || {};
  const race = apiResult.race_id || apiResult.race || {};

  return {
    id: getId(apiResult) || `${getId(race)}-${getId(horse)}-${index}`,
    position: apiResult.position || index + 1,
    horse: typeof horse === "string" ? horse : horse.name || apiResult.horse_name || "Unknown Horse",
    jockey: typeof jockey === "string" ? jockey : jockey.user_id?.full_name || jockey.full_name || apiResult.jockey_name || "Unknown Jockey",
    race: typeof race === "string" ? race : race.name || apiResult.race_name || "Race",
    lane: apiResult.lane || "-",
    time: apiResult.finish_time ? String(apiResult.finish_time) : "-",
    margin: apiResult.position === 1 ? "Winner" : "-",
    status: apiResult.status === "published" ? "Official" : "Review",
    reward: apiResult.score ? `+${apiResult.score} pts` : "-",
  };
}

export function adaptRaceResults(payload) {
  const rows = extractCollection(payload, ["results", "race_results", "data"]);

  if (!rows.length) {
    return {
      results: [],
      usedFallback: true,
    };
  }

  return {
    results: rows.map(toSpectatorRaceResult),
    usedFallback: false,
  };
}

export function toHorseLeaderboard(results = []) {
  const byHorse = new Map();

  results.forEach((result) => {
    const existing = byHorse.get(result.horse) || {
      name: result.horse,
      owner: "Live result feed",
      jockey: result.jockey,
      wins: 0,
      starts: 0,
      score: 0,
    };

    existing.starts += 1;
    existing.wins += Number(result.position) === 1 ? 1 : 0;
    existing.score += Number(String(result.reward).replace(/[^0-9]/g, "")) || 0;
    existing.jockey = result.jockey || existing.jockey;
    byHorse.set(result.horse, existing);
  });

  return Array.from(byHorse.values())
    .sort((a, b) => b.wins - a.wins || b.score - a.score || a.name.localeCompare(b.name))
    .map((horse, index) => ({
      rank: index + 1,
      name: horse.name,
      owner: horse.owner,
      jockey: horse.jockey,
      wins: horse.wins,
      starts: horse.starts,
      prizeMoney: `${horse.score} pts`,
      rating: horse.wins > 2 ? "S" : horse.wins > 0 ? "A" : "B",
      form: `${Math.round((horse.wins / Math.max(horse.starts, 1)) * 100)}%`,
      signal: `${horse.wins > 0 ? "+" : ""}${horse.wins}`,
      image: fallbackImages[index % fallbackImages.length],
    }));
}
