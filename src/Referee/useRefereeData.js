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
      const participantSettled = await Promise.allSettled(
        raceRows.map(async (race) => ({ raceId: getId(race), payload: await refereeApi.getRaceParticipants(getId(race)) }))
      );
      const participantPayloads = participantSettled.filter((item) => item.status === "fulfilled").map((item) => item.value);
      const unavailableRaceIds = participantSettled
        .map((item, index) => (item.status === "rejected" ? getId(raceRows[index]) : null))
        .filter(Boolean);

      setIsUnavailable(participantSettled.length > 0 && participantSettled.every((item) => item.status === "rejected"));
      const baseData = {
        races: raceData,
        participantPayloads,
        unavailableRaceIds,
        results: { results: [] },
        violations: { violations: [] },
        checks: { horse_checks: [] },
        reports: { referee_reports: [] },
      };

      setRaces(adaptRefereeApiData(baseData));
      setIsLoading(false);

      const [resultData, violationData, checkData, reportData] = await Promise.allSettled([
        refereeApi.listRaceResults(),
        refereeApi.listViolations(),
        refereeApi.listHorseChecks(),
        refereeApi.listRefereeReports(),
      ]);

      setRaces(adaptRefereeApiData({
        ...baseData,
        results: resultData.status === "fulfilled" ? resultData.value : baseData.results,
        violations: violationData.status === "fulfilled" ? violationData.value : baseData.violations,
        checks: checkData.status === "fulfilled" ? checkData.value : baseData.checks,
        reports: reportData.status === "fulfilled" ? reportData.value : baseData.reports,
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
