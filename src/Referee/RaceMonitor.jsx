import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { refereeApi } from "../api/refereeApi";
import LoadingSkeleton from "../components/LoadingSkeleton";
import RaceLifecycleControls from "./RaceLifecycleControls";
import RefereeLayout from "./RefereeLayout";
import { formatStatus, RACE_PHASES } from "./refereeConstants";
import { useRefereeData } from "./useRefereeData";

const initialForm = { horseId: "", status: "incident_recorded", eventType: "", severity: "minor", timeMarker: "", description: "", evidence: "", requiresViolation: false };

function RaceMonitor() {
  const { raceId } = useParams();
  const { getRace, isLoading, error, isUnavailable, reload } = useRefereeData();
  const race = getRace(raceId);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) return <RefereeLayout title="Race Monitor" eyebrow="During race" description=""><LoadingSkeleton ariaLabel="Loading race monitor" variant="detail" /></RefereeLayout>;
  if (error || !race) return <RefereeLayout title="Race Monitor" eyebrow="During race" description=""><section className="admin-live-state admin-live-state--warning">{error || "Race not found."}</section></RefereeLayout>;
  const editable = race.phase === RACE_PHASES.DURING_RACE;
  const incidents = race.checks.filter((check) => check.phase === RACE_PHASES.DURING_RACE);
  const selected = race.participants.find((participant) => participant.horseId === form.horseId);

  const save = async (event) => {
    event.preventDefault();
    if (!selected) return setMessage("Select a participant.");
    if (form.status !== "normal" && (!form.eventType.trim() || !form.description.trim())) return setMessage("Event type and description are required for an incident.");
    try {
      setIsSaving(true); setMessage("");
      await refereeApi.createHorseCheck(RACE_PHASES.DURING_RACE, { race_id: race.id, horse_id: selected.horseId, jockey_id: selected.jockeyId || undefined, status: form.status, event_type: form.eventType || undefined, severity: form.severity, time_marker: form.timeMarker || undefined, description: form.description || undefined, evidence_urls: form.evidence.split("\n").map((item) => item.trim()).filter(Boolean), requires_violation: form.requiresViolation });
      await reload(); setForm(initialForm); setMessage("Race event recorded.");
    } catch (apiError) { setMessage(apiError.message || "Unable to record race event."); }
    finally { setIsSaving(false); }
  };

  return <RefereeLayout title="Race Monitor" eyebrow={`During race | ${race.name}`} description="Record backend-persisted incidents and use the authoritative start or complete action when the race status allows it." actions={<Link className="admin-header__button admin-header__button--ghost" to={`/referee/races/${raceId}`}>Race Detail</Link>}>
    {!editable && <section className="admin-live-state">Current race status is {formatStatus(race.status)}. During-race records are read only.</section>}
    {isUnavailable && <section className="admin-live-state">Participants are unavailable. Incident creation is disabled.</section>}
    {message && <section className="admin-live-state" aria-live="polite">{message}</section>}
    <RaceLifecycleControls race={race} participantsUnavailable={isUnavailable} reload={reload} />
    {editable && <section className="admin-panel"><div className="admin-panel__header"><p className="admin-panel__eyebrow">New event</p><h2>Record race observation</h2></div><form className="admin-form-grid" onSubmit={save}><label className="admin-field"><span>Participant</span><select value={form.horseId} onChange={(event) => setForm({ ...form, horseId: event.target.value })}><option value="">Select horse</option>{race.participants.map((participant) => <option key={participant.horseId} value={participant.horseId}>{participant.horseName} | {participant.jockeyName}</option>)}</select></label><label className="admin-field"><span>Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{["normal", "incident_recorded", "race_stopped", "under_investigation"].map((value) => <option key={value} value={value}>{formatStatus(value)}</option>)}</select></label><label className="admin-field"><span>Event type</span><input value={form.eventType} onChange={(event) => setForm({ ...form, eventType: event.target.value })} placeholder="dangerous_riding" /></label><label className="admin-field"><span>Severity</span><select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value })}>{["minor", "major", "critical"].map((value) => <option key={value}>{value}</option>)}</select></label><label className="admin-field"><span>Race time marker</span><input value={form.timeMarker} onChange={(event) => setForm({ ...form, timeMarker: event.target.value })} placeholder="00:01:24" /></label><label className="admin-field"><span>Description</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><label className="admin-field"><span>Evidence URLs, one per line</span><textarea value={form.evidence} onChange={(event) => setForm({ ...form, evidence: event.target.value })} /></label><label className="referee-check-item"><input type="checkbox" checked={form.requiresViolation} onChange={(event) => setForm({ ...form, requiresViolation: event.target.checked })} /><span>Create a linked violation</span></label><div className="admin-tool-card__footer"><button className="admin-header__button" type="submit" disabled={isSaving || isUnavailable}>{isSaving ? "Saving..." : "Record Event"}</button></div></form></section>}
    <section className="admin-panel"><div className="admin-panel__header"><p className="admin-panel__eyebrow">Event log</p><h2>During-race records</h2></div>{incidents.length === 0 ? <p>No events recorded.</p> : <div className="admin-data-table__wrap"><table className="admin-data-table"><thead><tr><th>Horse</th><th>Status</th><th>Type</th><th>Severity</th><th>Time</th><th>Description</th></tr></thead><tbody>{incidents.map((incident) => { const participant = race.participants.find((item) => item.horseId === incident.horseId); return <tr key={incident.id}><td>{participant?.horseName || incident.horseId}</td><td>{formatStatus(incident.status)}</td><td>{formatStatus(incident.eventType)}</td><td>{formatStatus(incident.severity)}</td><td>{incident.timeMarker || "Not recorded"}</td><td>{incident.description || incident.note}</td></tr>; })}</tbody></table></div>}</section>
  </RefereeLayout>;
}

export default RaceMonitor;
