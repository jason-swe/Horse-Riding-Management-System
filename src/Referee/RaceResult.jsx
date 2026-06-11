import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import RefereeLayout from "./RefereeLayout";
import { assignedRaces, RACE_STATUSES, RESULT_STATUSES } from "./refereeData";

function RaceResult() {
  const { raceId } = useParams();
  const race = assignedRaces.find((r) => r.id === raceId);

  const initialRows = (race?.participants || []).map((p, i) => ({
    horseId: p.horseId,
    horseName: p.horseName,
    jockeyName: p.jockeyName,
    position: race?.result?.[i]?.position ?? i + 1,
    finishTime: race?.result?.[i]?.finishTime ?? "",
    penaltyApplied: race?.result?.[i]?.penaltyApplied ?? false,
  }));

  const [rows, setRows] = useState(initialRows);
  const [resultNotes, setResultNotes] = useState("");
  const [resultStatus, setResultStatus] = useState(race?.resultStatus || null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [messages, setMessages] = useState([]);

  if (!race) return <RefereeLayout title="Not Found" eyebrow="" description=""><p>Race not found.</p></RefereeLayout>;

  const addMsg = (m) => setMessages((prev) => [m, ...prev].slice(0, 4));

  const updateRow = (idx, field, value) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));

  const validate = () => {
    const positions = rows.map((r) => Number(r.position));
    const hasMissing = rows.some((r) => !r.finishTime.trim());
    const hasDupe = new Set(positions).size !== positions.length;
    if (hasMissing) { addMsg("All finish times are required (BR-RESULT-02)."); return false; }
    if (hasDupe) { addMsg("Each horse must have a unique position (BR-RESULT-01)."); return false; }
    if (race.status !== RACE_STATUSES.FINISHED && race.status !== RACE_STATUSES.PUBLISHED) {
      addMsg("Race must be Finished before confirming result (BR-RESULT-04)."); return false;
    }
    return true;
  };

  const handleSaveDraft = () => {
    if (rows.some((r) => !r.finishTime.trim())) {
      addMsg("Fill all finish times before saving."); return;
    }
    const sorted = [...rows].sort((a, b) => Number(a.position) - Number(b.position));
    race.result = sorted;
    race.resultStatus = RESULT_STATUSES.DRAFT;
    setResultStatus(RESULT_STATUSES.DRAFT);
    addMsg("Result draft saved.");
  };

  const handleConfirm = () => {
    if (!validate()) return;
    setShowConfirmModal(true);
  };

  const doConfirm = () => {
    const sorted = [...rows].sort((a, b) => Number(a.position) - Number(b.position));
    race.result = sorted;
    race.resultStatus = RESULT_STATUSES.PUBLISHED;
    race.status = RACE_STATUSES.PUBLISHED;
    setResultStatus(RESULT_STATUSES.PUBLISHED);
    setShowConfirmModal(false);
    addMsg("Result confirmed and published! Rankings, prizes, and notifications updated.");
  };

  const isConfirmed = resultStatus === RESULT_STATUSES.PUBLISHED;
  const statusColor = { Draft: "gray", Confirmed: "blue", Published: "green" };

  return (
    <RefereeLayout
      title="Race Result"
      eyebrow={`Official result · ${race.name}`}
      description="Enter finishing positions and times. Save as draft or confirm to publish the official result immediately."
      actions={
        <Link className="admin-header__button admin-header__button--ghost" to={`/referee/races/${raceId}`}>
          ← Race Detail
        </Link>
      }
    >
      {!!messages.length && (
        <section className="admin-toast-stack" aria-live="polite">
          {messages.map((m, i) => <div key={i} className="admin-toast">{m}</div>)}
        </section>
      )}

      {/* Status banner */}
      {resultStatus && (
        <section className="admin-panel referee-result-status-banner">
          <span>Result status: </span>
          <span className={`referee-status-badge referee-status-badge--${statusColor[resultStatus] || "gray"}`}>
            {resultStatus}
          </span>
          {isConfirmed && (
            <span style={{ color: "rgba(245,247,243,0.64)", fontSize: "0.88rem", marginLeft: 12 }}>
              Results are locked. No direct edits allowed (BR-RESULT-05).
            </span>
          )}
        </section>
      )}

      {/* Results table */}
      <section className="admin-panel">
        <div className="admin-panel__header">
          <p className="admin-panel__eyebrow">Leaderboard</p>
          <h2>Race Rankings</h2>
        </div>
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
              {rows.map((row, idx) => (
                <tr key={row.horseId}>
                  <td>
                    {isConfirmed ? (
                      <span className="referee-position-badge">#{row.position}</span>
                    ) : (
                      <input
                        type="number" min="1" max={rows.length}
                        value={row.position}
                        onChange={(e) => updateRow(idx, "position", e.target.value)}
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
                        placeholder="1:41.28"
                        value={row.finishTime}
                        onChange={(e) => updateRow(idx, "finishTime", e.target.value)}
                        className="referee-time-input"
                      />
                    )}
                  </td>
                  <td>
                    {isConfirmed ? (
                      row.penaltyApplied ? <span className="referee-status-badge referee-status-badge--amber">Yes</span> : "No"
                    ) : (
                      <input type="checkbox" checked={row.penaltyApplied}
                        onChange={(e) => updateRow(idx, "penaltyApplied", e.target.checked)} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isConfirmed && (
          <label className="admin-field" style={{ marginTop: 14 }}>
            <span>Additional Notes</span>
            <textarea value={resultNotes} onChange={(e) => setResultNotes(e.target.value)}
              placeholder="Optional notes about the race outcome..." />
          </label>
        )}

        {!isConfirmed && (
          <div className="admin-tool-card__footer" style={{ marginTop: 14 }}>
            <button className="admin-header__button admin-header__button--ghost" type="button" onClick={handleSaveDraft}>
              Save Draft
            </button>
            <button className="admin-header__button referee-btn--confirm" type="button" onClick={handleConfirm}>
              Confirm Result
            </button>
          </div>
        )}

        {isConfirmed && (
          <div style={{ marginTop: 14 }}>
            <Link className="admin-header__button admin-header__button--ghost" to={`/referee/races/${raceId}/report`}>
              View Official Report →
            </Link>
          </div>
        )}
      </section>

      {/* Confirmation modal */}
      {showConfirmModal && (
        <div className="admin-modal" role="dialog" aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && setShowConfirmModal(false)}>
          <div className="admin-modal__card referee-confirm-modal">
            <div className="admin-panel__header" style={{ marginBottom: 12 }}>
              <p className="admin-panel__eyebrow">Final authority</p>
              <h2>Confirm Official Result</h2>
            </div>
            <div className="referee-confirm-modal__body">
              <p>You are about to confirm the official result for <strong>{race.name}</strong>.</p>
              <p>After confirmation:</p>
              <ul className="referee-confirm-list">
                <li>Result will be published immediately</li>
                <li>Rankings will be updated</li>
                <li>Prize calculations will run</li>
                <li>Notifications will be sent to all participants</li>
                <li>Result cannot be directly edited after confirmation</li>
              </ul>
            </div>
            <div className="admin-tool-card__footer" style={{ marginTop: 18 }}>
              <button className="admin-header__button referee-btn--confirm" type="button" onClick={doConfirm}>
                Confirm &amp; Publish
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
