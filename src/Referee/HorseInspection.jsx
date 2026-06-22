import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { refereeApi } from "../api/refereeApi";
import LoadingSkeleton from "../components/LoadingSkeleton";
import RefereeLayout from "./RefereeLayout";
import { formatStatus, RACE_PHASES } from "./refereeConstants";
import { useRefereeData } from "./useRefereeData";

const PRE_FIELDS = ["identity_verified", "registration_valid", "jockey_assigned", "jockey_contract_confirmed", "horse_health_status_ok", "no_visible_lameness", "no_visible_injury", "normal_gait", "normal_breathing", "equipment_ok", "fit_to_race"];
const POST_FIELDS = ["horse_finished_safely", "post_race_lameness_check", "post_race_injury_check", "breathing_recovered", "heart_rate_recovered", "bleeding_check", "medical_follow_up_required"];
const LABELS = {
  identity_verified: "Horse identity verified", registration_valid: "Registration is valid", jockey_assigned: "Jockey is assigned", jockey_contract_confirmed: "Jockey contract is confirmed", horse_health_status_ok: "Health status is acceptable", no_visible_lameness: "No visible lameness", no_visible_injury: "No visible injury", normal_gait: "Normal gait", normal_breathing: "Normal breathing", equipment_ok: "Equipment is safe", fit_to_race: "Fit to race",
  horse_finished_safely: "Horse finished safely", post_race_lameness_check: "Lameness check complete", post_race_injury_check: "Injury check complete", breathing_recovered: "Breathing recovered", heart_rate_recovered: "Heart rate recovered", bleeding_check: "Bleeding check complete", medical_follow_up_required: "Medical follow-up required",
};

function initialRows(race, phase, fields) {
  return Object.fromEntries((race?.participants || []).map((participant) => {
    const saved = race.checks.find((check) => check.horseId === participant.horseId && check.phase === phase);
    return [participant.horseId, { status: saved?.status || "", note: saved?.note || "", checklist: Object.fromEntries(fields.map((field) => [field, Boolean(saved?.checklist?.[field])])), saved }];
  }));
}

function HorseInspection() {
  const { raceId } = useParams();
  const [searchParams] = useSearchParams();
  const phase = searchParams.get("phase") === RACE_PHASES.POST_RACE ? RACE_PHASES.POST_RACE : RACE_PHASES.PRE_RACE;
  const fields = phase === RACE_PHASES.PRE_RACE ? PRE_FIELDS : POST_FIELDS;
  const statuses = phase === RACE_PHASES.PRE_RACE ? ["passed", "failed", "needs_review", "scratched"] : ["normal", "minor_issue", "injury_detected", "requires_vet_follow_up", "under_investigation"];
  const { getRace, isLoading, error, isUnavailable, reload } = useRefereeData();
  const race = getRace(raceId);
  const [rows, setRows] = useState({});
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");
  const editable = race?.phase === phase;

  useEffect(() => { setRows(initialRows(race, phase, fields)); }, [race, phase]);
  const title = phase === RACE_PHASES.PRE_RACE ? "Pre-race Horse Inspection" : "Post-race Recovery Check";
  const participants = useMemo(() => race?.participants || [], [race]);

  if (isLoading) return <RefereeLayout title={title} eyebrow="Horse checks" description=""><LoadingSkeleton ariaLabel="Loading horse checks" rows={5} variant="list" /></RefereeLayout>;
  if (error || !race) return <RefereeLayout title={title} eyebrow="Horse checks" description=""><section className="admin-live-state admin-live-state--warning">{error || "Race not found."}</section></RefereeLayout>;

  const update = (horseId, patch) => setRows((current) => ({ ...current, [horseId]: { ...current[horseId], ...patch } }));
  const save = async (participant) => {
    const row = rows[participant.horseId];
    const requiresNote = ["failed", "scratched", "injury_detected", "requires_vet_follow_up"].includes(row.status);
    if (!row.status) return setMessage("Select a check status before saving.");
    if (requiresNote && !row.note.trim()) return setMessage("This status requires a note or issue description.");
    try {
      setSavingId(participant.horseId); setMessage("");
      const payload = { race_id: race.id, horse_id: participant.horseId, jockey_id: participant.jockeyId || undefined, status: row.status, checklist: row.checklist, check_note: row.note, weight: participant.weight ?? undefined, is_eligible: phase === RACE_PHASES.PRE_RACE ? row.status === "passed" : undefined };
      if (row.saved?.id) await refereeApi.updateHorseCheck(row.saved.id, payload);
      else await refereeApi.createHorseCheck(phase, payload);
      await reload(); setMessage(`${participant.horseName}: ${formatStatus(row.status)} saved.`);
    } catch (apiError) { setMessage(apiError.message || "Unable to save horse check."); }
    finally { setSavingId(""); }
  };

  return <RefereeLayout title={title} eyebrow={`${formatStatus(phase)} | ${race.name}`} description={editable ? "This is the current race phase. Saved records reload from the API." : "This phase is read only for the current race status."} actions={<Link className="admin-header__button admin-header__button--ghost" to={`/referee/races/${raceId}`}>Race Detail</Link>}>
    {isUnavailable && <section className="admin-live-state">Participant API is unavailable, so checks cannot be created.</section>}
    {message && <section className="admin-live-state" aria-live="polite">{message}</section>}
    {participants.length === 0 && <section className="admin-panel"><p>No approved race participants are available.</p></section>}
    {participants.map((participant) => { const row = rows[participant.horseId]; if (!row) return null; return <article key={participant.horseId} className="admin-panel referee-inspection-card"><div className="admin-panel__header"><p className="admin-panel__eyebrow">{participant.lane == null ? "Lane not assigned" : `Lane ${participant.lane}`}</p><h2>{participant.horseName}</h2></div><div className="referee-horse-info"><div><span className="referee-info-label">Owner</span><span>{participant.owner}</span></div><div><span className="referee-info-label">Jockey</span><span>{participant.jockeyName}</span></div><div><span className="referee-info-label">Assignment</span><span>{formatStatus(participant.assignmentStatus)}</span></div><div><span className="referee-info-label">Weight</span><span>{participant.weight ?? "Not recorded"}</span></div></div><div className="referee-checklist"><p className="referee-checklist__title">Checklist</p>{fields.map((field) => <label key={field} className="referee-check-item"><input type="checkbox" disabled={!editable} checked={Boolean(row.checklist[field])} onChange={(event) => update(participant.horseId, { checklist: { ...row.checklist, [field]: event.target.checked } })} /><span>{LABELS[field]}</span></label>)}</div><div className="admin-form-grid"><label className="admin-field"><span>Status</span><select disabled={!editable} value={row.status} onChange={(event) => update(participant.horseId, { status: event.target.value })}><option value="">Select status</option>{statuses.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}</select></label><label className="admin-field"><span>Notes</span><textarea disabled={!editable} value={row.note} onChange={(event) => update(participant.horseId, { note: event.target.value })} /></label></div>{editable && <div className="admin-tool-card__footer"><button type="button" className="admin-header__button" disabled={savingId === participant.horseId || isUnavailable} onClick={() => save(participant)}>{savingId === participant.horseId ? "Saving..." : row.saved ? "Update Check" : "Save Check"}</button></div>}</article>; })}
  </RefereeLayout>;
}

export default HorseInspection;
