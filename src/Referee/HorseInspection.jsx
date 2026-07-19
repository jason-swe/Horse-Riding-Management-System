import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CheckSquare, Save, CheckCircle2 } from "lucide-react";
import { refereeApi } from "../api/refereeApi";
import LoadingSkeleton from "../components/LoadingSkeleton";
import RefereeLayout from "./RefereeLayout";
import { formatStatus, RACE_PHASES } from "./refereeConstants";
import { useRefereeData } from "./useRefereeData";

const PRE_FIELDS = [
  "identity_verified",
  "registration_valid",
  "jockey_assigned",
  "jockey_contract_confirmed",
  "horse_health_status_ok",
  "no_visible_lameness",
  "no_visible_injury",
  "normal_gait",
  "normal_breathing",
  "equipment_ok",
  "fit_to_race"
];

const POST_FIELDS = [
  "horse_finished_safely",
  "post_race_lameness_check",
  "post_race_injury_check",
  "breathing_recovered",
  "heart_rate_recovered",
  "bleeding_check",
  "medical_follow_up_required"
];

const LABELS = {
  identity_verified: "Horse identity verified",
  registration_valid: "Registration is valid",
  jockey_assigned: "Jockey is assigned",
  jockey_contract_confirmed: "Jockey contract is confirmed",
  horse_health_status_ok: "Health status is acceptable",
  no_visible_lameness: "No visible lameness",
  no_visible_injury: "No visible injury",
  normal_gait: "Normal gait",
  normal_breathing: "Normal breathing",
  equipment_ok: "Equipment is safe",
  fit_to_race: "Fit to race",
  horse_finished_safely: "Horse finished safely",
  post_race_lameness_check: "Lameness check complete",
  post_race_injury_check: "Injury check complete",
  breathing_recovered: "Breathing recovered",
  heart_rate_recovered: "Heart rate recovered",
  bleeding_check: "Bleeding check complete",
  medical_follow_up_required: "Medical follow-up required",
};

const NOTE_REQUIRED_STATUSES = ["failed", "scratched", "injury_detected", "requires_vet_follow_up"];

function getDefaultBulkNote(status) {
  if (status === "failed") return "Marked failed during bulk inspection.";
  if (status === "scratched") return "Scratched during bulk inspection.";
  if (status === "injury_detected") return "Injury detected during bulk inspection.";
  if (status === "requires_vet_follow_up") return "Requires veterinary follow-up after bulk inspection.";
  return "";
}

function initialRows(race, phase, fields) {
  return Object.fromEntries(
    (race?.participants || []).map((participant) => {
      const saved = race.checks.find(
        (check) => check.horseId === participant.horseId && check.phase === phase
      );
      return [
        participant.horseId,
        {
          status: saved?.status || "",
          note: saved?.note || "",
          checklist: Object.fromEntries(fields.map((field) => [field, Boolean(saved?.checklist?.[field])])),
          saved
        }
      ];
    })
  );
}

function HorseInspection() {
  const { raceId } = useParams();
  const [searchParams] = useSearchParams();
  const phase = searchParams.get("phase") === RACE_PHASES.POST_RACE ? RACE_PHASES.POST_RACE : RACE_PHASES.PRE_RACE;
  const fields = phase === RACE_PHASES.PRE_RACE ? PRE_FIELDS : POST_FIELDS;
  const statuses = phase === RACE_PHASES.PRE_RACE
    ? ["passed", "failed", "needs_review", "scratched"]
    : ["normal", "minor_issue", "injury_detected", "requires_vet_follow_up", "under_investigation"];

  const { getRace, isLoading, error, isUnavailable, reload } = useRefereeData();
  const race = getRace(raceId);
  const [rows, setRows] = useState({});
  const [savingId, setSavingId] = useState("");
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [message, setMessage] = useState("");
  const editable = race?.phase === phase;
  const participantsUnavailable = Boolean(isUnavailable || race?.participantsUnavailable);

  useEffect(() => {
    setRows(initialRows(race, phase, fields));
  }, [race, phase]);

  const title = phase === RACE_PHASES.PRE_RACE ? "Pre-race Horse Inspection" : "Post-race Recovery Check";
  const participants = useMemo(() => {
    const rows = race?.participants || [];

    if (phase === RACE_PHASES.POST_RACE) {
      return rows.filter((participant) => participant.eligible);
    }

    return rows;
  }, [race, phase]);

  if (isLoading) {
    return (
      <RefereeLayout title={title} eyebrow="Horse checks" description="">
        <LoadingSkeleton ariaLabel="Loading horse checks" rows={5} variant="list" />
      </RefereeLayout>
    );
  }

  if (error || !race) {
    return (
      <RefereeLayout title={title} eyebrow="Horse checks" description="">
        <section className="admin-live-state admin-live-state--warning">
          {error || "Race not found."}
        </section>
      </RefereeLayout>
    );
  }

  const update = (horseId, patch) =>
    setRows((current) => ({
      ...current,
      [horseId]: { ...current[horseId], ...patch }
    }));

  const handlePassAll = () => {
    const nextRows = { ...rows };
    participants.forEach((p) => {
      nextRows[p.horseId] = {
        ...nextRows[p.horseId],
        status: phase === RACE_PHASES.PRE_RACE ? "passed" : "normal",
        checklist: Object.fromEntries(fields.map((field) => [field, true])),
      };
    });
    setRows(nextRows);
    setMessage("Marked all checklist items as checked and set all status to passed/normal. Click 'Save All Checks' to commit to database.");
  };

  const handlePassSingle = (horseId) => {
    setRows((current) => ({
      ...current,
      [horseId]: {
        ...current[horseId],
        status: phase === RACE_PHASES.PRE_RACE ? "passed" : "normal",
        checklist: Object.fromEntries(fields.map((field) => [field, true])),
      }
    }));
  };

  const handleSaveAll = async () => {
    setIsSavingAll(true);
    setMessage("Saving all checks...");
    const checks = [];
    let skippedCount = 0;

    for (const participant of participants) {
      const row = rows[participant.horseId];

      if (!row || !row.status) {
        skippedCount++;
        continue;
      }

      const requiresNote = NOTE_REQUIRED_STATUSES.includes(row.status);
      const note = row.note.trim() || (requiresNote ? getDefaultBulkNote(row.status) : "");

      checks.push({
        horse_id: participant.horseId,
        jockey_id: participant.jockeyId || undefined,
        status: row.status,
        checklist: row.checklist,
        check_note: note,
        weight: participant.weight ?? undefined,
        is_eligible: phase === RACE_PHASES.PRE_RACE ? row.status === "passed" : undefined
      });
    }

    if (!checks.length) {
      setIsSavingAll(false);
      setMessage("No checks are ready to save. Select at least one status before saving.");
      return;
    }

    try {
      const response = await refereeApi.bulkSaveHorseChecks(phase, {
        race_id: race.id,
        checks
      });
      const summary = response.summary || {};
      const failed = response.failed || [];

      await reload();
      setMessage(
        `Bulk save complete. Created: ${summary.created_count || 0}. Updated: ${summary.updated_count || 0}. ` +
        `Failed: ${summary.failed_count || failed.length || 0}. Skipped: ${skippedCount}.`
      );
    } catch (apiError) {
      setMessage(apiError.message || "Unable to bulk save horse checks.");
    } finally {
      setIsSavingAll(false);
    }
  };

  const save = async (participant) => {
    const row = rows[participant.horseId];
    const requiresNote = NOTE_REQUIRED_STATUSES.includes(row.status);
    if (!row.status) return setMessage("Select a check status before saving.");
    if (requiresNote && !row.note.trim()) return setMessage("This status requires a note or issue description.");

    try {
      setSavingId(participant.horseId);
      setMessage("");
      const payload = {
        race_id: race.id,
        horse_id: participant.horseId,
        jockey_id: participant.jockeyId || undefined,
        status: row.status,
        checklist: row.checklist,
        check_note: row.note,
        weight: participant.weight ?? undefined,
        is_eligible: phase === RACE_PHASES.PRE_RACE ? row.status === "passed" : undefined
      };

      if (row.saved?.id) await refereeApi.updateHorseCheck(row.saved.id, payload);
      else await refereeApi.createHorseCheck(phase, payload);

      await reload();
      setMessage(`${participant.horseName}: ${formatStatus(row.status)} saved.`);
    } catch (apiError) {
      setMessage(apiError.message || "Unable to save horse check.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <RefereeLayout
      title={title}
      eyebrow={`${formatStatus(phase)} | ${race.name}`}
      description={editable ? "This is the current race phase. Saved records reload from the API." : "This phase is read only for the current race status."}
      actions={
        <Link className="admin-header__button admin-header__button--ghost" to={`/referee/races/${raceId}`}>
          Race Detail
        </Link>
      }
    >
      {participantsUnavailable && (
        <section className="admin-live-state">
          Participant API is unavailable, so checks cannot be created.
        </section>
      )}
      
      {message && (
        <section className="admin-live-state" aria-live="polite">
          {message}
        </section>
      )}

      {editable && participants.length > 0 && (
        <div className="referee-global-actions-bar">
          <div className="referee-global-actions-bar__title">
            <CheckSquare size={16} />
            <span>Perform inspections for {participants.length} runners</span>
          </div>
          <div className="referee-global-actions-bar__buttons">
            <button
              type="button"
              className="referee-global-btn referee-global-btn--pass"
              disabled={participantsUnavailable}
              onClick={handlePassAll}
            >
              <CheckCircle2 size={15} /> Pass All Horses
            </button>
            <button
              type="button"
              className="referee-global-btn referee-global-btn--save"
              disabled={isSavingAll || participantsUnavailable}
              onClick={handleSaveAll}
            >
              <Save size={15} /> {isSavingAll ? "Saving All..." : "Save All Checks"}
            </button>
          </div>
        </div>
      )}

      {participants.length === 0 && (
        <section className="admin-panel">
          <p>No approved race participants are available.</p>
        </section>
      )}

      <div className="referee-inspection-grid">
        {participants.map((participant) => {
          const row = rows[participant.horseId];
          if (!row) return null;

          return (
            <article key={participant.horseId} className="referee-inspection-card">
              <div className="referee-inspection-card__header-row">
                <div className="referee-inspection-card__title-group">
                  <p className="admin-panel__eyebrow">
                    {participant.lane == null ? "Draw not assigned" : `Draw ${participant.lane}`}
                  </p>
                  <h2>{participant.horseName}</h2>
                </div>
                {editable && (
                  <button
                    type="button"
                    className="referee-single-pass-btn"
                    onClick={() => handlePassSingle(participant.horseId)}
                  >
                    Pass All
                  </button>
                )}
              </div>

              <div className="referee-info-grid-compact">
                <div>
                  <span className="referee-info-label">Owner</span>
                  <span>{participant.owner}</span>
                </div>
                <div>
                  <span className="referee-info-label">Jockey</span>
                  <span>{participant.jockeyName}</span>
                </div>
                <div>
                  <span className="referee-info-label">Horse weight</span>
                  <span>{participant.weight ?? "Not recorded"}</span>
                </div>
                <div>
                  <span className="referee-info-label">Declared gear</span>
                  <span>{participant.gears?.length ? participant.gears.join(" / ") : "None"}</span>
                </div>
                <div>
                  <span className="referee-info-label">Assign</span>
                  <span>{formatStatus(participant.assignmentStatus)}</span>
                </div>
              </div>

              <div className="referee-checklist-container">
                <div className="referee-checklist-header">
                  <span className="referee-checklist-title-label">Checklist</span>
                </div>
                <div className="referee-checklist-grid-compact">
                  {fields.map((field) => (
                    <label key={field} className="referee-check-item-compact">
                      <input
                        type="checkbox"
                        disabled={!editable}
                        checked={Boolean(row.checklist[field])}
                        onChange={(event) =>
                          update(participant.horseId, {
                            checklist: { ...row.checklist, [field]: event.target.checked }
                          })
                        }
                      />
                      <span>{LABELS[field]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="referee-card-form-grid">
                <label className="admin-field">
                  <span>Status</span>
                  <select
                    disabled={!editable}
                    value={row.status}
                    onChange={(event) => update(participant.horseId, { status: event.target.value })}
                  >
                    <option value="">Status</option>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">
                  <span>Notes</span>
                  <textarea
                    disabled={!editable}
                    value={row.note}
                    placeholder="Enter inspection notes..."
                    onChange={(event) => update(participant.horseId, { note: event.target.value })}
                  />
                </label>
              </div>

              {editable && (
                <div className="referee-card-footer">
                  <button
                    type="button"
                    className="referee-save-btn"
                    disabled={savingId === participant.horseId || participantsUnavailable}
                    onClick={() => save(participant)}
                  >
                    <Save size={13} />
                    {savingId === participant.horseId ? "Saving..." : row.saved ? "Update" : "Save"}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </RefereeLayout>
  );
}

export default HorseInspection;
