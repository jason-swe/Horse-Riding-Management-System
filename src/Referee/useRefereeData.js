import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { refereeApi } from "../api/refereeApi";
import { adaptRefereeApiData } from "./refereeAdapters";

const getId = (value) => value?._id || value?.id || "";

export function useRefereeData() {
  const { profiles } = useAuth();
  const refereeId = profiles?.race_referee?._id || profiles?.race_referee?.id || "";
  const [races, setRaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUnavailable, setIsUnavailable] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setIsUnavailable(false);

    try {
      const raceData = await refereeApi.getAssignedRaces(refereeId ? { referee_id: refereeId } : {});
      const raceRows = Array.isArray(raceData?.races) ? raceData.races : [];
      const [participantSettled, resultData, violationData, checkData, reportData] = await Promise.all([
        Promise.allSettled(raceRows.map(async (race) => ({ raceId: getId(race), payload: await refereeApi.getRaceParticipants(getId(race)) }))),
        refereeApi.listRaceResults(),
        refereeApi.listViolations(),
        refereeApi.listHorseChecks(),
        refereeApi.listRefereeReports(),
      ]);
      const participantPayloads = participantSettled.filter((item) => item.status === "fulfilled").map((item) => item.value);
      const unavailableRaceIds = participantSettled
        .map((item, index) => (item.status === "rejected" ? getId(raceRows[index]) : null))
        .filter(Boolean);

      setIsUnavailable(participantSettled.length > 0 && participantSettled.every((item) => item.status === "rejected"));
      setRaces(adaptRefereeApiData({
        races: raceData,
        participantPayloads,
        unavailableRaceIds,
        results: resultData,
        violations: violationData,
        checks: checkData,
        reports: reportData,
      }));
    } catch (apiError) {
      setRaces([]);
      setError(apiError.message || "Unable to load referee workspace data.");
    } finally {
      setIsLoading(false);
    }
  }, [refereeId]);

  useEffect(() => { reload(); }, [reload]);

  const raceMap = useMemo(() => new Map(races.map((race) => [race.id, race])), [races]);

  return {
    races,
    data: races,
    isLoading,
    error,
    isEmpty: !isLoading && !error && races.length === 0,
    isUnavailable,
    reload,
    getRace: useCallback((raceId) => raceMap.get(raceId) || null, [raceMap]),
  };
}
