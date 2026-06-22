import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { refereeApi } from "../api/refereeApi";
import LoadingSkeleton from "../components/LoadingSkeleton";
import RefereeLayout from "./RefereeLayout";
import { RESULT_STATUSES } from "./refereeConstants";
import { useRefereeData } from "./useRefereeData";

function parseFinishTime(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  if (raw.includes(":")) {
    const [minutes, seconds] = raw.split(":").map(Number);
    if (Number.isFinite(minutes) && Number.isFinite(seconds)) {
      return minutes * 60 + seconds;
    }
  }

  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatFinishTime(value) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "string") return value;
  return String(value);
}

function buildRows(race) {
  const resultsByHorseId = new Map((race?.result || []).map((result) => [result.horseId, result]));
  const passedHorseIds = new Set((race?.checks || []).filter((check) => check.phase === "pre_race" && check.status === "passed").map((check) => check.horseId));
  const source = race?.participants?.length
    ? race.participants.filter((participant) => passedHorseIds.has(participant.horseId))
    : (race?.result || []);

  return source.map((item, index) => {
    const existing = resultsByHorseId.get(item.horseId) || item;

    return {
      resultId: existing.id || null,
      horseId: item.horseId,
      horseName: item.horseName,
      jockeyId: item.jockeyId || existing.jockeyId,
      jockeyName: item.jockeyName || existing.jockeyName,
      position: existing.position ?? index + 1,
      finishTime: formatFinishTime(existing.finishTime),
      penaltyApplied: existing.penaltyApplied ?? false,
    };
  });
}

function RaceResult() {
  const { raceId } = useParams();
  const { error, getRace, isLoading, isUnavailable, reload } = useRefereeData();
  const race = getRace(raceId);
  const [rows, setRows] = useState([]);
  const [resultNotes, setResultNotes] = useState("");
  const [resultStatus, setResultStatus] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setRows(buildRows(race));
    setResultStatus(race?.resultStatus || null);
  }, [race]);

  if (isLoading) {
    return (
      <RefereeLayout title="Race Result" eyebrow="" description="">
        <LoadingSkeleton ariaLabel="Loading race results" rows={5} variant="table" />
      </RefereeLayout>
    );
  }

  if (!race) {
    return (
      <RefereeLayout title="Not Found" eyebrow="" description="">
        <p>Race not found.</p>
      </RefereeLayout>
    );
  }

  const addMsg = (message) => setMessages((prev) => [message, ...prev].slice(0, 4));

  const updateRow = (index, field, value) => {
    setRows((prev) => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
  };

  const validate = () => {
    const positions = rows.map((row) => Number(row.position));
    const hasMissing = rows.some((row) => !String(row.finishTime).trim());
    const hasDupe = new Set(positions).size !== positions.length;

    if (!rows.length) {
      addMsg("No participants are available for result entry.");
      return false;
    }

    if (hasMissing) {
      addMsg("All finish times are required (BR-RESULT-02).");
      return false;
    }

    if (hasDupe) {
      addMsg("Each horse must have a unique position (BR-RESULT-01).");
      return false;
    }

    return true;
  };

  const saveDraftRows = async () => {
    if (!validate()) return false;

    const sorted = [...rows].sort((a, b) => Number(a.position) - Number(b.position));

    try {
      setIsSaving(true);

      await Promise.all(sorted.map((row) => {
          const payload = {
            race_id: race.id,
            horse_id: row.horseId,
            jockey_id: row.jockeyId,
            position: Number(row.position),
            finish_time: parseFinishTime(row.finishTime),
            score: Math.max(0, 100 - (Number(row.position) - 1) * 5),
            note: resultNotes,
          };

          if (row.resultId) {
            return refereeApi.updateRaceResult(row.resultId, payload);
          }

          return refereeApi.createRaceResult(payload);
      }));

      await reload();

      setRows(sorted);
      setResultStatus(RESULT_STATUSES.DRAFT);
      addMsg("Result draft saved.");
      return true;
    } catch (apiError) {
      addMsg(apiError.message || "Unable to save result draft.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = () => {
    saveDraftRows();
  };

  const handleConfirm = async () => {
    const saved = await saveDraftRows();
    if (!saved) return;
    setShowConfirmModal(true);
  };

  const doConfirm = () => {
    addMsg("Draft saved. Admin must confirm and publish official race results.");
    setShowConfirmModal(false);
  };

  const isConfirmed = [RESULT_STATUSES.CONFIRMED, RESULT_STATUSES.PUBLISHED].includes(resultStatus);
  const statusColor = { Draft: "gray", Confirmed: "blue", Published: "green" };

  return (
    <RefereeLayout
      title="Race Result"
      eyebrow={`Official result - ${race.name}`}
      description="Enter finishing positions and times. Race referees can save draft results; admin confirms and publishes official results."
      actions={
        <Link className="admin-header__button admin-header__button--ghost" to={`/referee/races/${raceId}`}>
          Back to Race Detail
        </Link>
      }
    >
      {error && <section className="admin-live-state admin-live-state--warning" role="alert">{error}</section>}
      {isUnavailable && <section className="admin-live-state">Participant data is unavailable. Result editing is disabled.</section>}

      {!!messages.length && (
        <section className="admin-toast-stack" aria-live="polite">
          {messages.map((message, index) => <div key={index} className="admin-toast">{message}</div>)}
        </section>
      )}

      {resultStatus && (
        <section className="admin-panel referee-result-status-banner">
          <span>Result status: </span>
          <span className={`referee-status-badge referee-status-badge--${statusColor[resultStatus] || "gray"}`}>
            {resultStatus}
          </span>
          <span style={{ color: "rgba(245,247,243,0.64)", fontSize: "0.88rem", marginLeft: 12 }}>Referee results remain draft until admin confirmation.</span>
        </section>
      )}

      <section className="admin-panel">
        <div className="admin-panel__header">
          <p className="admin-panel__eyebrow">Leaderboard</p>
          <h2>Race Rankings</h2>
        </div>

        {rows.length === 0 ? (
          <p style={{ color: "rgba(245,247,243,0.48)", textAlign: "center", padding: "24px 0" }}>
            No participants are available for result entry.
          </p>
        ) : (
          <div className="admin-data-table__wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Horse</th>
                  <th>Jockey</th>
                  <th>Finish Time</th>
                  <th>Penalty Applied</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.horseId}>
                    <td>
                      {isConfirmed ? (
                        <span className="referee-position-badge">#{row.position}</span>
                      ) : (
                        <input
                          type="number"
                          min="1"
                          max={rows.length}
                          value={row.position}
                          onChange={(event) => updateRow(index, "position", event.target.value)}
                          className="referee-pos-input"
                        />
                      )}
                    </td>
                    <td><strong>{row.horseName}</strong></td>
                    <td>{row.jockeyName}</td>
                    <td>
                      {isConfirmed ? row.finishTime : (
                        <input
                          type="text"
                          placeholder="101.28 or 1:41.28"
                          value={row.finishTime}
                          onChange={(event) => updateRow(index, "finishTime", event.target.value)}
                          className="referee-time-input"
                        />
                      )}
                    </td>
                    <td>
                      {isConfirmed ? (
                        row.penaltyApplied ? <span className="referee-status-badge referee-status-badge--amber">Yes</span> : "No"
                      ) : (
                        <input
                          type="checkbox"
                          checked={row.penaltyApplied}
                          onChange={(event) => updateRow(index, "penaltyApplied", event.target.checked)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isConfirmed && (
          <label className="admin-field" style={{ marginTop: 14 }}>
            <span>Additional Notes</span>
            <textarea
              value={resultNotes}
              onChange={(event) => setResultNotes(event.target.value)}
              placeholder="Optional notes about the race outcome..."
            />
          </label>
        )}

        {!isConfirmed && (
          <div className="admin-tool-card__footer" style={{ marginTop: 14 }}>
            <button className="admin-header__button admin-header__button--ghost" disabled={isSaving || isUnavailable} type="button" onClick={handleSaveDraft}>
              {isSaving ? "Saving..." : "Save Draft"}
            </button>
            <button className="admin-header__button referee-btn--confirm" disabled={isSaving || isUnavailable} type="button" onClick={handleConfirm}>
              Save and Review Draft
            </button>
          </div>
        )}

        {isConfirmed && (
          <div style={{ marginTop: 14 }}>
            <Link className="admin-header__button admin-header__button--ghost" to={`/referee/races/${raceId}/report`}>
              View Official Report
            </Link>
          </div>
        )}
      </section>

      {showConfirmModal && (
        <div className="admin-modal" role="dialog" aria-modal="true"
          onClick={(event) => event.target === event.currentTarget && setShowConfirmModal(false)}>
          <div className="admin-modal__card referee-confirm-modal">
            <div className="admin-panel__header" style={{ marginBottom: 12 }}>
              <p className="admin-panel__eyebrow">Final authority</p>
              <h2>Draft Result Saved</h2>
            </div>
            <div className="referee-confirm-modal__body">
              <p>The draft result for <strong>{race.name}</strong> has been saved. Admin confirmation and publication are required.</p>
            </div>
            <div className="admin-tool-card__footer" style={{ marginTop: 18 }}>
              <button className="admin-header__button referee-btn--confirm" type="button" onClick={doConfirm}>
                OK
              </button>
              <button className="admin-header__button admin-header__button--ghost" type="button"
                onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </RefereeLayout>
  );
}

export default RaceResult;
