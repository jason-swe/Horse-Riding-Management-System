import { useMemo } from "react";
import { CONNECTION_STATES } from "../../../realtime/socketEvents";
import { RACE_STATUS } from "../race/raceStatus";
import { createMockRaceResult, createMockRaceScript } from "./mockRaceFixtures";

export function useRaceViewerSession(race, contenders) {
  return useMemo(() => {
    if (!race) {
      return {
        connectionState: CONNECTION_STATES.CONNECTED,
        raceResult: null,
        raceScript: null,
      };
    }

    if (race.raceStatus === RACE_STATUS.RUNNING) {
      const startsAt = (race.updatedAt ? new Date(race.updatedAt).getTime() : Date.now()) + 3000;
      return {
        connectionState: CONNECTION_STATES.CONNECTED,
        raceResult: null,
        raceScript: createMockRaceScript(race.id, startsAt, contenders),
      };
    }

    if (race.raceStatus === RACE_STATUS.SCHEDULED || race.raceStatus === RACE_STATUS.READY) {
      const startsAt = Date.now() + 3600000; // 1 hour in the future
      return {
        connectionState: CONNECTION_STATES.CONNECTED,
        raceResult: null,
        raceScript: createMockRaceScript(race.id, startsAt, contenders),
      };
    }

    if (race.raceStatus === RACE_STATUS.COMPLETED) {
      const startsAt = race.updatedAt ? new Date(race.updatedAt).getTime() - 68000 : Date.now() - 90000;
      return {
        connectionState: CONNECTION_STATES.CONNECTED,
        raceResult: createMockRaceResult(race.id, contenders),
        raceScript: createMockRaceScript(race.id, startsAt, contenders),
      };
    }

    return {
      connectionState: CONNECTION_STATES.CONNECTED,
      raceResult: null,
      raceScript: null,
    };
  }, [race, contenders]);
}
