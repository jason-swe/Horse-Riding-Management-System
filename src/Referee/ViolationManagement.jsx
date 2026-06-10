import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import RefereeLayout from "./RefereeLayout";
import { assignedRaces, VIOLATION_TYPES, PENALTY_TYPES } from "./refereeData";

const defaultForm = {
  type: VIOLATION_TYPES[0],
  subjectKind: "Jockey",
  subjectId: "",
  penalty: PENALTY_TYPES[0],
  description: "",
  notes: "",
};

function ViolationManagement() {
  const { raceId } = useParams();
  const race = assignedRaces.find((r) => r.id === raceId);
  const [violations, setViolations] = useState(race?.violations || []);
  const [form, setForm] = useState(defaultForm);
  const [showForm, setShowForm] = useState(false);
  const [messages, setMessages] = useState([]);

  if (!race) return <RefereeLayout title="Not Found" eyebrow="" description=""><p>Race not found.</p></RefereeLayout>;

  const addMsg = (m) => setMessages((prev) => [m, ...prev].slice(0, 4));

  const participants = race.participants.map((p) => ({
    id: form.subjectKind === "Horse" ? p.horseId : p.jockeyId,
    name: form.subjectKind === "Horse" ? p.horseName : p.jockeyName,
  }));

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.type) { addMsg("Violation type is required (BR-VIOLATION-01)."); return; }
    if (!form.penalty) { addMsg("Penalty type is required (BR-VIOLATION-02)."); return; }
    if (form.penalty === "Disqualification" && !form.description.trim()) {
      addMsg("Disqualification requires a detailed description (BR-VIOLATION-03)."); return;
    }
    const subject = participants.find((p) => p.id === form.subjectId) || participants[0];
    const v = {
      id: `V-${Date.now()}`,
      type: form.type,
      subject: form.subjectKind,
      subjectName: subject?.name || "Unknown",
      penalty: form.penalty,
      description: form.description,
      timestamp: new Date().toISOString(),
    };
    const updated = [...violations, v];
    setViolations(updated);
    race.violations = updated;
    setForm(defaultForm);
    setShowForm(false);
    addMsg(`Violation recorded — ${v.type} / ${v.penalty} for ${v.subjectName}.`);
  };

  const penaltyColor = { Warning: "amber", "Time Penalty": "blue", Disqualification: "red" };

  return (
    <RefereeLayout
      title="Violations"
      eyebrow={`Penalty management · ${race.name}`}
      description="Record, review, and manage violations during the race. All violations are logged in the Audit Trail."
      actions={
        <>
          <button className="admin-header__button" type="button" onClick={() => setShowForm(true)}>
            + New Violation
          </button>
          <Link className="admin-header__button admin-header__button--ghost" to={`/referee/races/${raceId}`}>
            ← Race Detail
          </Link>
        </>
      }
    >
      {!!messages.length && (
        <section className="admin-toast-stack" aria-live="polite">
          {messages.map((m, i) => <div key={i} className="admin-toast">{m}</div>)}
        </section>
      )}

      {/* Summary */}
      <section className="admin-metrics admin-metrics--module">
        <article className="admin-metric-card">
          <p className="admin-metric-card__label">Total Violations</p>
          <div className="admin-metric-card__value">{violations.length}</div>
        </article>
        <article className="admin-metric-card">
          <p className="admin-metric-card__label">Disqualifications</p>
          <div className="admin-metric-card__value" style={{ color: "#e85555" }}>
            {violations.filter((v) => v.penalty === "Disqualification").length}
          </div>
        </article>
        <article className="admin-metric-card">
          <p className="admin-metric-card__label">Warnings</p>
          <div className="admin-metric-card__value referee-metric--amber">
            {violations.filter((v) => v.penalty === "Warning").length}
          </div>
        </article>
      </section>

      {/* Violation list */}
      <section className="admin-panel">
        <div className="admin-panel__header">
          <p className="admin-panel__eyebrow">Records</p>
          <h2>Violation Log</h2>
        </div>
        {violations.length === 0 ? (
          <p style={{ color: "rgba(245,247,243,0.48)", textAlign: "center", padding: "24px 0" }}>
            No violations recorded yet.
          </p>
        ) : (
          <div className="admin-data-table__wrap">
            <table className="admin-data-table">
              <thead>
                <tr><th>ID</th><th>Type</th><th>Subject</th><th>Kind</th><th>Penalty</th><th>Description</th><th>Time</th></tr>
              </thead>
              <tbody>
                {violations.map((v) => (
                  <tr key={v.id}>
                    <td>{v.id}</td>
                    <td>{v.type}</td>
                    <td><strong>{v.subjectName}</strong></td>
                    <td>{v.subject}</td>
                    <td>
                      <span className={`referee-status-badge referee-status-badge--${penaltyColor[v.penalty] || "gray"}`}>
                        {v.penalty}
                      </span>
                    </td>
                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {v.description || "—"}
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "rgba(245,247,243,0.56)" }}>
                      {new Date(v.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* New violation modal */}
      {showForm && (
        <div className="admin-modal" role="dialog" aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="admin-modal__card">
            <div className="admin-panel__header" style={{ marginBottom: 12 }}>
              <p className="admin-panel__eyebrow">New violation</p>
              <h2>Record Violation</h2>
            </div>
            <form className="admin-form-grid" onSubmit={handleSave}>
              <label className="admin-field">
                <span>Violation Type <span style={{ color: "#e87c3e" }}>*</span></span>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {VIOLATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label className="admin-field">
                <span>Subject Kind</span>
                <select value={form.subjectKind} onChange={(e) => setForm({ ...form, subjectKind: e.target.value, subjectId: "" })}>
                  <option value="Jockey">Jockey</option>
                  <option value="Horse">Horse</option>
                </select>
              </label>
              <label className="admin-field">
                <span>Subject</span>
                <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
                  <option value="">Select...</option>
                  {participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
              <label className="admin-field">
                <span>Penalty Type <span style={{ color: "#e87c3e" }}>*</span></span>
                <select value={form.penalty} onChange={(e) => setForm({ ...form, penalty: e.target.value })}>
                  {PENALTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label className="admin-field">
                <span>Description {form.penalty === "Disqualification" && <span style={{ color: "#e87c3e" }}>* (required for disqualification)</span>}</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the incident in detail..."
                />
              </label>
              <div className="admin-tool-card__footer" style={{ marginTop: 4 }}>
                <button className="admin-header__button" type="submit">Save Violation</button>
                <button className="admin-header__button admin-header__button--ghost" type="button"
                  onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </RefereeLayout>
  );
}

export default ViolationManagement;
