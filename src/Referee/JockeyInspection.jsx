import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import RefereeLayout from "./RefereeLayout";
import { assignedRaces } from "./refereeData";

const CHECKLIST = [
  "License is valid and not expired",
  "Not currently suspended",
  "Assigned to the correct horse",
];

function JockeyInspection() {
  const { raceId } = useParams();
  const race = assignedRaces.find((r) => r.id === raceId);

  const [inspections, setInspections] = useState(() =>
    Object.fromEntries(
      (race?.participants || []).map((p) => [
        p.jockeyId,
        {
          checks: Object.fromEntries(CHECKLIST.map((c) => [c, false])),
          decision: null,
          reason: "",
          saved: p.jockeyInspection,
        },
      ])
    )
  );
  const [messages, setMessages] = useState([]);

  if (!race) return <RefereeLayout title="Race Not Found" eyebrow="" description=""><p>Race not found.</p></RefereeLayout>;

  const addMsg = (m) => setMessages((prev) => [m, ...prev].slice(0, 4));

  const toggle = (jockeyId, check) =>
    setInspections((prev) => ({
      ...prev,
      [jockeyId]: { ...prev[jockeyId], checks: { ...prev[jockeyId].checks, [check]: !prev[jockeyId].checks[check] } },
    }));

  const setDecision = (jockeyId, decision) =>
    setInspections((prev) => ({ ...prev, [jockeyId]: { ...prev[jockeyId], decision } }));

  const handleSave = (p) => {
    const insp = inspections[p.jockeyId];
    if (!insp.decision) { addMsg("Please select Approved or Rejected."); return; }
    if (insp.decision === "Rejected" && !insp.reason.trim()) {
      addMsg("Rejection reason is required (BR-JOCKEY-01)."); return;
    }
    setInspections((prev) => ({
      ...prev,
      [p.jockeyId]: { ...prev[p.jockeyId], saved: { status: insp.decision } },
    }));
    p.jockeyInspection = { status: insp.decision, notes: "" };
    addMsg(`${p.jockeyName} — jockey inspection recorded as ${insp.decision}.`);
  };

  return (
    <RefereeLayout
      title="Jockey Inspection"
      eyebrow={`Pre-race check · ${race.name}`}
      description="Verify each jockey's license, suspension status, and horse assignment before the race starts (BR-JOCKEY-01)."
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

      {race.participants.map((p) => {
        const insp = inspections[p.jockeyId];
        const allChecked = Object.values(insp.checks).every(Boolean);

        return (
          <article key={p.jockeyId} className="admin-panel referee-inspection-card">
            <div className="admin-panel__header">
              <p className="admin-panel__eyebrow">Lane {p.lane}</p>
              <h2>{p.jockeyName}</h2>
            </div>

            <div className="referee-horse-info">
              <div><span className="referee-info-label">Jockey ID</span><span>{p.jockeyId}</span></div>
              <div><span className="referee-info-label">License No.</span><span>{p.jockeyLicense}</span></div>
              <div><span className="referee-info-label">Assigned Horse</span><span>{p.horseName}</span></div>
            </div>

            {insp.saved && (
              <div className={`referee-saved-banner referee-saved-banner--${insp.saved.status.toLowerCase()}`}>
                Inspection recorded: <strong>{insp.saved.status}</strong>
              </div>
            )}

            <div className="referee-checklist">
              <p className="referee-checklist__title">Eligibility Checklist</p>
              {CHECKLIST.map((check) => (
                <label key={check} className="referee-check-item">
                  <input type="checkbox" checked={insp.checks[check]} onChange={() => toggle(p.jockeyId, check)} />
                  <span>{check}</span>
                </label>
              ))}
            </div>

            <div className="referee-decision-row">
              <span className="referee-info-label">Decision</span>
              <label className="referee-radio-option referee-radio-option--approve">
                <input type="radio" name={`jdecision-${p.jockeyId}`} checked={insp.decision === "Approved"}
                  onChange={() => setDecision(p.jockeyId, "Approved")} />
                <span>Approved</span>
              </label>
              <label className="referee-radio-option referee-radio-option--reject">
                <input type="radio" name={`jdecision-${p.jockeyId}`} checked={insp.decision === "Rejected"}
                  onChange={() => setDecision(p.jockeyId, "Rejected")} />
                <span>Rejected</span>
              </label>
            </div>

            {insp.decision === "Rejected" && (
              <label className="admin-field" style={{ marginTop: 10 }}>
                <span>Rejection Reason <span style={{ color: "#e87c3e" }}>*</span></span>
                <input
                  placeholder="Required — state the reason for rejection"
                  value={insp.reason}
                  onChange={(e) => setInspections((prev) => ({ ...prev, [p.jockeyId]: { ...prev[p.jockeyId], reason: e.target.value } }))}
                />
              </label>
            )}

            <div className="admin-tool-card__footer" style={{ marginTop: 14 }}>
              <button
                className={`admin-header__button${!allChecked ? " admin-header__button--ghost" : ""}`}
                type="button"
                onClick={() => handleSave(p)}
              >
                Save Inspection
              </button>
            </div>
          </article>
        );
      })}
    </RefereeLayout>
  );
}

export default JockeyInspection;
