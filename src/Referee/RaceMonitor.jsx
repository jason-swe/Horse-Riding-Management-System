import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import RefereeLayout from "./RefereeLayout";
import { assignedRaces, RACE_STATUSES } from "./refereeData";

function RaceMonitor() {
  const { raceId } = useParams();
  const race = assignedRaces.find((r) => r.id === raceId);

  const [raceState, setRaceState] = useState(race?.status || RACE_STATUSES.UPCOMING);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = useState(race?.monitorNotes || []);
  const [noteInput, setNoteInput] = useState("");
  const [stopReason, setStopReason] = useState("");
  const [showStopModal, setShowStopModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  if (!race) return <RefereeLayout title="Race Not Found" eyebrow="" description=""><p>Not found.</p></RefereeLayout>;

  const addMsg = (m) => setMessages((prev) => [m, ...prev].slice(0, 5));

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleStart = () => {
    if (raceState !== RACE_STATUSES.READY) { addMsg("Race must be in Ready status (BR-MONITOR-01)."); return; }
    setRaceState(RACE_STATUSES.IN_PROGRESS);
    race.status = RACE_STATUSES.IN_PROGRESS;
    setRunning(true);
    addMsg("Race started.");
  };

  const handlePause = () => { setRunning(false); addMsg("Race paused."); };
  const handleResume = () => { setRunning(true); addMsg("Race resumed."); };

  const handleFinish = () => {
    setRunning(false);
    setRaceState(RACE_STATUSES.FINISHED);
    race.status = RACE_STATUSES.FINISHED;
    addMsg("Race finished. Proceed to enter results.");
  };

  const handleStop = () => {
    if (!stopReason.trim()) { addMsg("Stop reason is required (BR-MONITOR-02)."); return; }
    setRunning(false);
    setShowStopModal(false);
    setRaceState("Stopped");
    addMsg(`Race stopped — Reason: ${stopReason}`);
    setStopReason("");
  };

  const addNote = () => {
    if (!noteInput.trim()) return;
    const note = `[${formatTime(elapsed)}] ${noteInput.trim()}`;
    setNotes((prev) => [...prev, note]);
    race.monitorNotes = [...notes, note];
    setNoteInput("");
    addMsg("Note added.");
  };

  const stateColor = {
    [RACE_STATUSES.READY]: "#3b9e67",
    [RACE_STATUSES.IN_PROGRESS]: "#e87c3e",
    [RACE_STATUSES.FINISHED]: "#4a90d9",
    Stopped: "#e85555",
  };

  return (
    <RefereeLayout
      title="Race Monitor"
      eyebrow={`Live control · ${race.name}`}
      description="Manage race flow in real time. Start, pause, resume, or stop the race and record violations."
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

      {/* Race Header */}
      <section className="admin-panel referee-monitor-header">
        <div className="referee-timer-block">
          <span className="referee-timer">{formatTime(elapsed)}</span>
          <span className="referee-timer-label">Race Timer</span>
        </div>
        <div className="referee-monitor-status">
          <span className="referee-info-label">Current Status</span>
          <span className="referee-monitor-status-badge" style={{ color: stateColor[raceState] || "#f5f7f3" }}>
            {raceState}
          </span>
        </div>
        <div className="admin-tool-card__footer referee-monitor-controls">
          {raceState === RACE_STATUSES.READY && (
            <button className="admin-header__button referee-btn--start" type="button" onClick={handleStart}>
              Start Race
            </button>
          )}
          {raceState === RACE_STATUSES.IN_PROGRESS && running && (
            <button className="admin-header__button referee-btn--pause" type="button" onClick={handlePause}>
              Pause
            </button>
          )}
          {raceState === RACE_STATUSES.IN_PROGRESS && !running && (
            <button className="admin-header__button referee-btn--resume" type="button" onClick={handleResume}>
              Resume
            </button>
          )}
          {raceState === RACE_STATUSES.IN_PROGRESS && (
            <>
              <button className="admin-header__button referee-btn--finish" type="button" onClick={handleFinish}>
                Finish Race
              </button>
              <button className="admin-header__button referee-btn--stop" type="button" onClick={() => setShowStopModal(true)}>
                Stop Race
              </button>
            </>
          )}
          {raceState !== RACE_STATUSES.READY && raceState !== RACE_STATUSES.IN_PROGRESS && (
            <span style={{ color: "rgba(245,247,243,0.54)", fontSize: "0.92rem" }}>
              No live controls available for this state.
            </span>
          )}
        </div>
      </section>

      {/* Participants */}
      <section className="admin-panel">
        <div className="admin-panel__header">
          <p className="admin-panel__eyebrow">Live</p>
          <h2>Participants</h2>
        </div>
        <div className="admin-data-table__wrap">
          <table className="admin-data-table">
            <thead>
              <tr><th>Lane</th><th>Horse</th><th>Jockey</th></tr>
            </thead>
            <tbody>
              {race.participants.map((p) => (
                <tr key={p.horseId}>
                  <td><span className="referee-lane-badge">{p.lane}</span></td>
                  <td><strong>{p.horseName}</strong></td>
                  <td>{p.jockeyName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Actions */}
      <section className="admin-grid">
        <article className="admin-panel">
          <div className="admin-panel__header">
            <p className="admin-panel__eyebrow">Record</p>
            <h2>Add Note</h2>
          </div>
          <label className="admin-field">
            <span>Note</span>
            <input
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Enter race observation..."
              onKeyDown={(e) => e.key === "Enter" && addNote()}
            />
          </label>
          <div className="admin-tool-card__footer" style={{ marginTop: 10 }}>
            <button className="admin-header__button" type="button" onClick={addNote}>Add Note</button>
          </div>
          <ul className="referee-notes-list">
            {notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </article>

        <article className="admin-panel">
          <div className="admin-panel__header">
            <p className="admin-panel__eyebrow">Violations</p>
            <h2>Record Violation</h2>
          </div>
          <p style={{ color: "rgba(245,247,243,0.64)", marginBottom: 14 }}>
            Navigate to the Violations page to create a full violation record with penalty and evidence.
          </p>
          <Link className="admin-header__button admin-header__button--ghost" to={`/referee/races/${raceId}/violations`}>
            Open Violations →
          </Link>
        </article>
      </section>

      {/* Stop modal */}
      {showStopModal && (
        <div className="admin-modal" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && setShowStopModal(false)}>
          <div className="admin-modal__card">
            <div className="admin-panel__header" style={{ marginBottom: 12 }}>
              <p className="admin-panel__eyebrow">Emergency stop</p>
              <h2>Stop Race</h2>
            </div>
            <p style={{ color: "rgba(245,247,243,0.72)", marginBottom: 14 }}>
              Stopping the race requires a reason. This action will be logged in the Audit Trail.
            </p>
            <label className="admin-field">
              <span>Stop Reason <span style={{ color: "#e87c3e" }}>*</span></span>
              <textarea
                value={stopReason}
                onChange={(e) => setStopReason(e.target.value)}
                placeholder="Describe why the race is being stopped (BR-MONITOR-02)..."
              />
            </label>
            <div className="admin-tool-card__footer" style={{ marginTop: 14 }}>
              <button className="admin-header__button referee-btn--stop" type="button" onClick={handleStop}>
                Confirm Stop
              </button>
              <button className="admin-header__button admin-header__button--ghost" type="button" onClick={() => setShowStopModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </RefereeLayout>
  );
}

export default RaceMonitor;
