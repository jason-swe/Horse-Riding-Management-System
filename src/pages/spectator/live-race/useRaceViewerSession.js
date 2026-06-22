import { useMemo } from "react";
import { CONNECTION_STATES } from "../../../realtime/socketEvents";
import { RACE_STATUS } from "../race/raceStatus";
import { createMockRaceResult, createMockRaceScript } from "./mockRaceFixtures";

export function useRaceViewerSession(race) {
  return useMemo(() => {
    if (!race) {
      return {
        connectionState: CONNECTION_STATES.CONNECTED,
        raceResult: null,
        raceScript: null,
      };
    }

    if (race.raceStatus === RACE_STATUS.RUNNING) {
      return {
        connectionState: CONNECTION_STATES.CONNECTED,
        raceResult: null,
        raceScript: createMockRaceScript(race.id, Date.now() + 3000),
      };
    }

    if (race.raceStatus === RACE_STATUS.COMPLETED) {
      return {
        connectionState: CONNECTION_STATES.CONNECTED,
        raceResult: createMockRaceResult(race.id),
        raceScript: createMockRaceScript(race.id, Date.now() - 90000),
      };
    }

    return {
      connectionState: CONNECTION_STATES.CONNECTED,
      raceResult: null,
      raceScript: null,
    };
  }, [race]);
}
