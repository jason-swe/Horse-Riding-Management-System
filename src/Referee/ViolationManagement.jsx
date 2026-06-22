import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { refereeApi } from "../api/refereeApi";
import LoadingSkeleton from "../components/LoadingSkeleton";
import RefereeLayout from "./RefereeLayout";
import { PENALTY_TYPES, VIOLATION_TYPES } from "./refereeConstants";
import { useRefereeData } from "./useRefereeData";

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
  const { error, getRace, isLoading, isUnavailable, reload } = useRefereeData();
  const race = getRace(raceId);
  const [violations, setViolations] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [showForm, setShowForm] = useState(false);
  const [editingViolationId, setEditingViolationId] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setViolations(race?.violations || []);
  }, [race]);

  const participants = useMemo(() => {
    return (race?.participants || []).map((participant) => ({
      id: form.subjectKind === "Horse" ? participant.horseId : participant.jockeyId,
      horseId: participant.horseId,
      jockeyId: participant.jockeyId,
      name: form.subjectKind === "Horse" ? participant.horseName : participant.jockeyName,
    }));
  }, [form.subjectKind, race]);

  if (isLoading) {
    return (
      <RefereeLayout title="Violations" eyebrow="" description="">
        <LoadingSkeleton ariaLabel="Loading race violations" rows={5} variant="table" />
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

  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.type) {
      addMsg("Violation type is required (BR-VIOLATION-01).");
      return;
    }

    if (!form.penalty) {
      addMsg("Penalty type is required (BR-VIOLATION-02).");
      return;
    }

    if (form.penalty === "Disqualification" && !form.description.trim()) {
      addMsg("Disqualification requires a detailed description (BR-VIOLATION-03).");
      return;
    }

    const subject = participants.find((participant) => participant.id === form.subjectId) || participants[0];

    if (!subject) {
      addMsg("Select a horse or jockey before saving a violation.");
      return;
    }

    const existingViolation = violations.find((violation) => violation.id === editingViolationId);
    const localViolation = {
      id: existingViolation?.id || `V-${Date.now()}`,
      horseId: form.subjectKind === "Horse" ? subject.horseId : "",
      jockeyId: form.subjectKind === "Jockey" ? subject.jockeyId : "",
      type: form.type,
      subject: form.subjectKind,
      subjectName: subject.name || "Unknown",
      penalty: form.penalty,
      description: form.description,
      timestamp: new Date().toISOString(),
    };

    try {
      setIsSaving(true);

      {
        const payload = {
          race_id: race.id,
          horse_id: subject.horseId || undefined,
          jockey_id: subject.jockeyId || undefined,
          violation_type: form.type,
          description: form.description,
          penalty: form.penalty,
          status: "recorded",
        };

        if (editingViolationId) {
          await refereeApi.updateViolation(editingViolationId, payload);
        } else {
          await refereeApi.createViolation(payload);
        }

        await reload();
      }

      setForm(defaultForm);
      setEditingViolationId("");
      setShowForm(false);
      addMsg(`Violation ${editingViolationId ? "updated" : "recorded"} - ${localViolation.type} / ${localViolation.penalty} for ${localViolation.subjectName}.`);
    } catch (apiError) {
      addMsg(apiError.message || "Unable to save violation.");
    } finally {
      setIsSaving(false);
    }
  };

  const penaltyColor = { Warning: "amber", "Time Penalty": "blue", Disqualification: "red" };

  const openCreateForm = () => {
    setForm(defaultForm);
    setEditingViolationId("");
    setShowForm(true);
  };

  const openEditForm = (violation) => {
    const subjectKind = violation.horseId ? "Horse" : "Jockey";
    setForm({
      type: violation.type || VIOLATION_TYPES[0],
      subjectKind,
      subjectId: subjectKind === "Horse" ? violation.horseId : violation.jockeyId,
      penalty: violation.penalty || PENALTY_TYPES[0],
      description: violation.description || "",
      notes: "",
    });
    setEditingViolationId(violation.id);
    setShowForm(true);
  };

  return (
    <RefereeLayout
      title="Violations"
      eyebrow={`Penalty management - ${race.name}`}
      description="Record, review, and manage violations during the race. All violations are logged in the audit trail."
      actions={
        <>
          <button className="admin-header__button" type="button" onClick={openCreateForm}>
            New Violation
          </button>
          <Link className="admin-header__button admin-header__button--ghost" to={`/referee/races/${raceId}`}>
            Back to Race Detail
          </Link>
        </>
      }
    >
      {error && <section className="admin-live-state admin-live-state--warning" role="alert">{error}</section>}
      {isUnavailable && <section className="admin-live-state">Participant data is unavailable. Creating participant-linked violations is disabled.</section>}

      {!!messages.length && (
        <section className="admin-toast-stack" aria-live="polite">
          {messages.map((message, index) => <div key={index} className="admin-toast">{message}</div>)}
        </section>
      )}

      <section className="admin-metrics admin-metrics--module">
        <article className="admin-metric-card">
          <p className="admin-metric-card__label">Total Violations</p>
          <div className="admin-metric-card__value">{violations.length}</div>
        </article>
        <article className="admin-metric-card">
          <p className="admin-metric-card__label">Disqualifications</p>
          <div className="admin-metric-card__value" style={{ color: "#e85555" }}>
            {violations.filter((violation) => violation.penalty === "Disqualification").length}
          </div>
        </article>
        <article className="admin-metric-card">
          <p className="admin-metric-card__label">Warnings</p>
          <div className="admin-metric-card__value referee-metric--amber">
            {violations.filter((violation) => violation.penalty === "Warning").length}
          </div>
        </article>
      </section>

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
                <tr><th>ID</th><th>Type</th><th>Subject</th><th>Kind</th><th>Penalty</th><th>Description</th><th>Time</th><th>Action</th></tr>
              </thead>
              <tbody>
                {violations.map((violation) => (
                  <tr key={violation.id}>
                    <td>{violation.id}</td>
                    <td>{violation.type}</td>
                    <td><strong>{violation.subjectName}</strong></td>
                    <td>{violation.subject}</td>
                    <td>
                      <span className={`referee-status-badge referee-status-badge--${penaltyColor[violation.penalty] || "gray"}`}>
                        {violation.penalty}
                      </span>
                    </td>
                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {violation.description || "-"}
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "rgba(245,247,243,0.56)" }}>
                      {new Date(violation.timestamp).toLocaleTimeString()}
                    </td>
                    <td>
                      <button className="admin-header__button admin-header__button--ghost" type="button" onClick={() => openEditForm(violation)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div className="admin-modal" role="dialog" aria-modal="true"
          onClick={(event) => event.target === event.currentTarget && setShowForm(false)}>
          <div className="admin-modal__card">
            <div className="admin-panel__header" style={{ marginBottom: 12 }}>
              <p className="admin-panel__eyebrow">New violation</p>
              <h2>{editingViolationId ? "Update Violation" : "Record Violation"}</h2>
            </div>
            <form className="admin-form-grid" onSubmit={handleSave}>
              <label className="admin-field">
                <span>Violation Type <span style={{ color: "#e87c3e" }}>*</span></span>
                <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                  {VIOLATION_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="admin-field">
                <span>Subject Kind</span>
                <select value={form.subjectKind} onChange={(event) => setForm({ ...form, subjectKind: event.target.value, subjectId: "" })}>
                  <option value="Jockey">Jockey</option>
                  <option value="Horse">Horse</option>
                </select>
              </label>
              <label className="admin-field">
                <span>Subject</span>
                <select value={form.subjectId} onChange={(event) => setForm({ ...form, subjectId: event.target.value })}>
                  <option value="">Select...</option>
                  {participants.map((participant) => <option key={participant.id} value={participant.id}>{participant.name}</option>)}
                </select>
              </label>
              <label className="admin-field">
                <span>Penalty Type <span style={{ color: "#e87c3e" }}>*</span></span>
                <select value={form.penalty} onChange={(event) => setForm({ ...form, penalty: event.target.value })}>
                  {PENALTY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="admin-field">
                <span>Description {form.penalty === "Disqualification" && <span style={{ color: "#e87c3e" }}>* (required for disqualification)</span>}</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Describe the incident in detail..."
                />
              </label>
              <div className="admin-tool-card__footer" style={{ marginTop: 4 }}>
                <button className="admin-header__button" disabled={isSaving || isUnavailable} type="submit">
                  {isSaving ? "Saving..." : editingViolationId ? "Update Violation" : "Save Violation"}
                </button>
                <button className="admin-header__button admin-header__button--ghost" type="button"
                  onClick={() => { setShowForm(false); setEditingViolationId(""); setForm(defaultForm); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </RefereeLayout>
  );
}

export default ViolationManagement;
