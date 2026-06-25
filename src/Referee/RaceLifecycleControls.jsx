import { useMemo, useState } from "react";
import { refereeApi } from "../api/refereeApi";
import { formatStatus, RACE_STATUSES } from "./refereeConstants";

function getReadyRestriction(race, participantsUnavailable) {
  if (race.status !== RACE_STATUSES.SCHEDULED) return "";
  if (participantsUnavailable) return "Participant eligibility is unavailable, so the race cannot be set to At the Gate.";

  const raceDate = race.raw?.race_date ? new Date(race.raw.race_date) : null;
  if (!raceDate || Number.isNaN(raceDate.getTime())) return "A valid race date is required before this race can start.";
  if (raceDate.getTime() > Date.now()) return `This race can be set to At the Gate at ${raceDate.toLocaleString()}.`;
  if (race.participants.length === 0) return "At least one eligible participant is required before this race can start.";

  // Check if all pre-race checks are completed
  const preChecks = race.checks?.filter((check) => check.phase === "pre_race") || [];
  if (preChecks.length < race.participants.length) {
    return `All pre-race horse inspections must be completed (${preChecks.length}/${race.participants.length}) before setting the race to At the Gate.`;
  }
  return "";
}

function RaceLifecycleControls({ race, participantsUnavailable = false, reload }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState("");
  const readyRestriction = useMemo(() => getReadyRestriction(race, participantsUnavailable), [race, participantsUnavailable]);

  const updateStatus = async (action) => {
    try {
      setIsUpdating(true);
      setFeedback("");
      let response;
      if (action === "ready") {
        response = await refereeApi.readyRace(race.id);
      } else if (action === "start") {
        response = await refereeApi.startRace(race.id);
      } else {
        response = await refereeApi.completeRace(race.id);
      }
      setFeedback(
        response?.race?.status
          ? `Race status updated to ${formatStatus(response.race.status)}.`
          : `Race ${action === "ready" ? "set to ready" : action === "start" ? "started" : "completed"} successfully.`
      );
      await reload();
    } catch (error) {
      if (error.status === 403) setFeedback("You are not authorized to control this race. Only its assigned referee can perform this action.");
      else if (error.status === 400 || error.status === 409) setFeedback(error.message || "The race is no longer in a valid state for this action.");
      else setFeedback(error.message || "Unable to update the race status.");
    } finally {
      setIsUpdating(false);
    }
  };

  return <section className="admin-panel">
    <div className="admin-panel__header"><div><p className="admin-panel__eyebrow">Lifecycle contract</p><h2>Authoritative race controls</h2></div></div>
    <p>The backend supports setting the race at the gate, starting it, and completing it. Pause and stop controls are not available.</p>
    {readyRestriction && <section className="admin-live-state" aria-live="polite">{readyRestriction}</section>}
    {feedback && <section className="admin-live-state" aria-live="polite">{feedback}</section>}
    <div className="admin-tool-card__footer">
      {race.status === RACE_STATUSES.SCHEDULED && <button className="admin-header__button" type="button" disabled={Boolean(readyRestriction) || isUpdating} onClick={() => updateStatus("ready")}>{isUpdating ? "Preparing..." : "Approve and Set At Gate"}</button>}
      {race.status === RACE_STATUSES.READY && <button className="admin-header__button" type="button" disabled={isUpdating} onClick={() => updateStatus("start")}>{isUpdating ? "Starting..." : "Start Race"}</button>}
      {race.status === RACE_STATUSES.RUNNING && <button className="admin-header__button" type="button" disabled={isUpdating} onClick={() => updateStatus("complete")}>{isUpdating ? "Completing..." : "Complete Race"}</button>}
      {![RACE_STATUSES.SCHEDULED, RACE_STATUSES.READY, RACE_STATUSES.RUNNING].includes(race.status) && <span>No lifecycle action is available for {formatStatus(race.status)} races.</span>}
    </div>
  </section>;
}

export default RaceLifecycleControls;
