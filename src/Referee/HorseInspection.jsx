import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import RefereeLayout from "./RefereeLayout";
import { assignedRaces } from "./refereeData";

const CHECKLIST = [
  "Registered for this race",
  "Age eligible for race category",
  "No current injury",
  "Not suspended",
  "Assigned jockey confirmed",
];

function HorseInspection() {
  const { raceId } = useParams();
  const race = assignedRaces.find((r) => r.id === raceId);

  const [inspections, setInspections] = useState(() =>
    Object.fromEntries(
      (race?.participants || []).map((p) => [
        p.horseId,
        {
          checks: Object.fromEntries(CHECKLIST.map((c) => [c, false])),
          decision: null,
          reason: "",
          notes: "",
          saved: p.horseInspection,
        },
      ])
    )
  );
  const [messages, setMessages] = useState([]);

  if (!race) return <RefereeLayout title="Race Not Found" eyebrow="" description=""><p>Race not found.</p></RefereeLayout>;

  const addMsg = (m) => setMessages((prev) => [m, ...prev].slice(0, 4));

  const toggle = (horseId, check) => {
    setInspections((prev) => ({
      ...prev,
      [horseId]: {
        ...prev[horseId],
        checks: { ...prev[horseId].checks, [check]: !prev[horseId].checks[check] },
      },
    }));
  };

  const setDecision = (horseId, decision) => {
    setInspections((prev) => ({ ...prev, [horseId]: { ...prev[horseId], decision } }));
  };

  const handleSave = (p) => {
    const insp = inspections[p.horseId];
    if (!insp.decision) { addMsg("Please select Approved or Rejected."); return; }
    if (insp.decision === "Rejected" && !insp.reason.trim()) {
      addMsg("Rejection reason is required (BR-HORSE-02)."); return;
    }
    setInspections((prev) => ({
      ...prev,
      [p.horseId]: { ...prev[p.horseId], saved: { status: insp.decision, notes: insp.notes } },
    }));
    p.horseInspection = { status: insp.decision, notes: insp.notes };
    addMsg(`${p.horseName} — inspection recorded as ${insp.decision}.`);
  };

  return (
    <RefereeLayout
      title="Horse Inspection"
      eyebrow={`Pre-race check · ${race.name}`}
      description="Verify each horse's eligibility before the race starts. All horses must be Approved (BR-HORSE-01)."
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
        const insp = inspections[p.horseId];
        const allChecked = Object.values(insp.checks).every(Boolean);

        return (
          <article key={p.horseId} className="admin-panel referee-inspection-card">
            <div className="admin-panel__header">
              <p className="admin-panel__eyebrow">Lane {p.lane}</p>
              <h2>{p.horseName}</h2>
            </div>

            {/* Horse info */}
            <div className="referee-horse-info">
              <div><span className="referee-info-label">Horse ID</span><span>{p.horseId}</span></div>
              <div><span className="referee-info-label">Breed</span><span>{p.breed}</span></div>
              <div><span className="referee-info-label">Age</span><span>{p.age} yrs</span></div>
              <div><span className="referee-info-label">Weight</span><span>{p.weight} kg</span></div>
              <div><span className="referee-info-label">Owner</span><span>{p.owner}</span></div>
              <div><span className="referee-info-label">Jockey</span><span>{p.jockeyName}</span></div>
            </div>

            {/* Saved result banner */}
            {insp.saved && (
              <div className={`referee-saved-banner referee-saved-banner--${insp.saved.status.toLowerCase()}`}>
                Inspection recorded: <strong>{insp.saved.status}</strong>
                {insp.saved.notes && ` — ${insp.saved.notes}`}
              </div>
            )}

            {/* Checklist */}
            <div className="referee-checklist">
              <p className="referee-checklist__title">Eligibility Checklist</p>
              {CHECKLIST.map((check) => (
                <label key={check} className="referee-check-item">
                  <input
                    type="checkbox"
                    checked={insp.checks[check]}
                    onChange={() => toggle(p.horseId, check)}
                  />
                  <span>{check}</span>
                </label>
              ))}
            </div>

            {/* Decision */}
            <div className="referee-decision-row">
              <span className="referee-info-label">Decision</span>
              <label className="referee-radio-option referee-radio-option--approve">
                <input type="radio" name={`decision-${p.horseId}`} value="Approved"
                  checked={insp.decision === "Approved"} onChange={() => setDecision(p.horseId, "Approved")} />
                <span>Approved</span>
              </label>
              <label className="referee-radio-option referee-radio-option--reject">
                <input type="radio" name={`decision-${p.horseId}`} value="Rejected"
                  checked={insp.decision === "Rejected"} onChange={() => setDecision(p.horseId, "Rejected")} />
                <span>Rejected</span>
              </label>
            </div>

            {insp.decision === "Rejected" && (
              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                <label className="admin-field">
                  <span>Rejection Reason <span style={{ color: "#e87c3e" }}>*</span></span>
                  <input
                    placeholder="Required — explain why the horse is rejected"
                    value={insp.reason}
                    onChange={(e) => setInspections((prev) => ({ ...prev, [p.horseId]: { ...prev[p.horseId], reason: e.target.value } }))}
                  />
                </label>
              </div>
            )}

            <label className="admin-field" style={{ marginTop: 10 }}>
              <span>Notes</span>
              <textarea
                placeholder="Optional inspection notes..."
                value={insp.notes}
                onChange={(e) => setInspections((prev) => ({ ...prev, [p.horseId]: { ...prev[p.horseId], notes: e.target.value } }))}
              />
            </label>

            <div className="admin-tool-card__footer" style={{ marginTop: 14 }}>
              <button
                className={`admin-header__button${!allChecked ? " admin-header__button--ghost" : ""}`}
                type="button"
                onClick={() => handleSave(p)}
              >
                Save Inspection
              </button>
              {!allChecked && (
                <span style={{ color: "rgba(245,247,243,0.48)", fontSize: "0.85rem", alignSelf: "center" }}>
                  Complete checklist first
                </span>
              )}
            </div>
          </article>
        );
      })}
    </RefereeLayout>
  );
}

export default HorseInspection;
