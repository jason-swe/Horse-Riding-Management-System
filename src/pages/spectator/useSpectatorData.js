import { useCallback, useEffect, useState } from "react";
import { spectatorApi } from "../../api/spectatorApi";
import { adaptRaceResults, adaptTournamentDetail, adaptTournamentList, toHorseLeaderboard } from "./spectatorAdapters";
import { tournaments as mockTournaments, tournamentContenders, tournamentRaces } from "./tournamentData";

function isAuthError(apiError) {
  return apiError?.status === 401 || apiError?.status === 403;
}

export function useSpectatorTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [usedFallback, setUsedFallback] = useState(false);

  const loadTournaments = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await spectatorApi.listTournaments();
      const adapted = adaptTournamentList(data);
      setTournaments(adapted.tournaments);
      setUsedFallback(adapted.usedFallback);
    } catch (apiError) {
      if (isAuthError(apiError)) {
        setError(apiError.message || "Your session expired. Please sign in again.");
        setTournaments([]);
        setUsedFallback(false);
        return;
      }

      setError(apiError.message || "Unable to load live tournaments. Showing sample tournament board.");
      setTournaments(mockTournaments);
      setUsedFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  return {
    tournaments,
    isLoading,
    error,
    usedFallback,
    reload: loadTournaments,
  };
}

export function useSpectatorTournamentDetail(tournamentId) {
  const [state, setState] = useState({
    tournament: null,
    races: [],
    contenders: [],
    usedFallback: false,
  });
  const [isLoading, setIsLoading] = useState(Boolean(tournamentId));
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTournamentDetail() {
      if (!tournamentId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const tournamentPayload = await spectatorApi.getTournament(tournamentId);
        const racesPayload = await spectatorApi.listRaces({ tournament_id: tournamentId });
        const adapted = adaptTournamentDetail({ tournamentPayload, racesPayload });

        if (!cancelled) {
          setState(adapted);
        }
      } catch (apiError) {
        if (isAuthError(apiError)) {
          if (!cancelled) {
            setError(apiError.message || "Your session expired. Please sign in again.");
            setState({
              tournament: null,
              races: [],
              contenders: [],
              usedFallback: false,
            });
          }
          return;
        }

        const fallback = mockTournaments.find((item) => String(item.id) === String(tournamentId));

        if (!cancelled) {
          setError(apiError.message || "Unable to load live tournament detail. Showing sample tournament data.");
          setState({
            tournament: fallback || null,
            races: tournamentRaces,
            contenders: tournamentContenders,
            usedFallback: true,
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadTournamentDetail();

    return () => {
      cancelled = true;
    };
  }, [tournamentId]);

  return {
    ...state,
    isLoading,
    error,
  };
}

export function useSpectatorRaceResults() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [usedFallback, setUsedFallback] = useState(false);

  const loadResults = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await spectatorApi.listRaceResults({ status: "published" });
      const adapted = adaptRaceResults(data);
      setResults(adapted.results);
      setUsedFallback(adapted.usedFallback);
    } catch (apiError) {
      setError(apiError.message || "Unable to load live race results.");
      setResults([]);
      setUsedFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  return {
    results,
    horseLeaderboard: toHorseLeaderboard(results),
    isLoading,
    error,
    usedFallback,
    reload: loadResults,
  };
}
