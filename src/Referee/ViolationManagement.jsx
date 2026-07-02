import { AlertTriangle, Check, Eye, Pencil, Plus, Scale, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { refereeApi } from "../api/refereeApi";
import LoadingSkeleton from "../components/LoadingSkeleton";
import RefereeLayout from "./RefereeLayout";
import { formatStatus } from "./refereeConstants";
import { useRefereeData } from "./useRefereeData";

const emptyForm = {
  type: "",
  severity: "minor",
  subjectKind: "Jockey",
  subjectId: "",
  description: "",
  timeMarker: "",
  evidence: "",
};

const unresolvedStatuses = new Set(["recorded", "under_review"]);

function getPolicy(options, type, severity) {
  return options?.penalty_policies?.find((item) => item.violation_type === type && item.severity === severity) || null;
}

function describePenalty(penalty) {
  if (!penalty) return "Pending policy decision";
  const facts = [formatStatus(penalty.type)];
  if (penalty.time_penalty_seconds) facts.push(`+${penalty.time_penalty_seconds}s`);
  if (penalty.position_delta) facts.push(`${penalty.position_delta} position demotion`);
  if (penalty.score_deduction) facts.push(`${penalty.score_deduction} point deduction`);
  if (penalty.suspension_days) facts.push(`${penalty.suspension_days} day suspension`);
  if (penalty.fine_amount) facts.push(`${penalty.fine_amount} fine`);
  if (penalty.disqualified) facts.push("Disqualification");
  return facts.join(" · ");
}

function statusTone(status) {
  if (["confirmed", "resolved"].includes(status)) return "green";
  if (status === "dismissed") return "gray";
  if (status === "under_review") return "amber";
  return "blue";
}

function getDetailSubject(violation) {
  const jockey = violation?.jockey_id;
  const horse = violation?.horse_id;
  return jockey?.user_id?.full_name || jockey?.full_name || horse?.name || "Unlinked subject";
}

function ViolationManagement() {
  const { raceId } = useParams();
  const { error, getRace, isLoading, isUnavailable, reload } = useRefereeData();
  const race = getRace(raceId);
  const [options, setOptions] = useState(null);
  const [optionsError, setOptionsError] = useState("");
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [detailError, setDetailError] = useState("");
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [decision, setDecision] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [decisionAction, setDecisionAction] = useState("");

  const violations = race?.violations || [];
  const participants = useMemo(() => (race?.participants || []).filter((participant) => participant.eligible).map((participant) => ({
    id: form.subjectKind === "Horse" ? participant.horseId : participant.jockeyId,
    horseId: participant.horseId,
    jockeyId: participant.jockeyId,
    name: form.subjectKind === "Horse" ? participant.horseName : participant.jockeyName,
  })).filter((participant) => participant.id), [form.subjectKind, race]);

  const loadOptions = async () => {
    try {
      setIsOptionsLoading(true);
      setOptionsError("");
      const data = await refereeApi.getViolationOptions();
      setOptions(data);
      setForm((current) => ({ ...current, type: current.type || data.violation_types?.[0] || "" }));
    } catch (apiError) {
      setOptions(null);
      setOptionsError(apiError.message || "Unable to load violation policy options.");
    } finally {
      setIsOptionsLoading(false);
    }
  };

  useEffect(() => { loadOptions(); }, []);

  useEffect(() => {
    if (!showForm || !form.type || !form.severity) return undefined;
    let active = true;
    const timer = setTimeout(async () => {
      try {
        setIsPreviewLoading(true);
        setPreviewError("");
        const data = await refereeApi.previewViolationPenalty({ violation_type: form.type, severity: form.severity });
        if (active) setPreview(data.policy || null);
      } catch (apiError) {
        if (active) { setPreview(null); setPreviewError(apiError.message || "Unable to preview the backend penalty policy."); }
      } finally {
        if (active) setIsPreviewLoading(false);
      }
    }, 220);
    return () => { active = false; clearTimeout(timer); };
  }, [form.severity, form.type, showForm]);

  if (isLoading) return <RefereeLayout title="Violations" eyebrow="" description=""><LoadingSkeleton ariaLabel="Loading race violations" rows={5} variant="table" /></RefereeLayout>;
  if (!race) return <RefereeLayout title="Not Found" eyebrow="" description=""><section className="admin-live-state admin-live-state--warning">{error || "Race not found."}</section></RefereeLayout>;

  const addMsg = (message) => setMessages((current) => [message, ...current].slice(0, 4));

  const closeForm = () => {
    setShowForm(false);
    setEditingId("");
    setPreview(null);
    setPreviewError("");
    setForm({ ...emptyForm, type: options?.violation_types?.[0] || "" });
  };

  const openCreateForm = () => {
    setEditingId("");
    setForm({ ...emptyForm, type: options?.violation_types?.[0] || "" });
    setShowForm(true);
  };

  const openEditForm = (violation) => {
    const subjectKind = violation.jockeyId ? "Jockey" : "Horse";
    setEditingId(violation.id);
    setForm({
      type: violation.type,
      severity: violation.severity || "minor",
      subjectKind,
      subjectId: subjectKind === "Jockey" ? violation.jockeyId : violation.horseId,
      description: violation.description || "",
      timeMarker: violation.timeMarker || "",
      evidence: violation.evidenceUrls.join("\n"),
    });
    setShowForm(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const subject = participants.find((participant) => participant.id === form.subjectId);
    if (!editingId && !subject) return addMsg("Select a horse or jockey before recording the violation.");
    if (!form.description.trim()) return addMsg("Describe the incident before saving.");

    const evidenceUrls = form.evidence.split("\n").map((item) => item.trim()).filter(Boolean);
    try {
      setIsSaving(true);
      if (editingId) {
        await refereeApi.updateViolation(editingId, { severity: form.severity, description: form.description.trim(), time_marker: form.timeMarker || undefined, evidence_urls: evidenceUrls });
      } else {
        const policy = preview || getPolicy(options, form.type, form.severity);
        await refereeApi.createViolation({
          race_id: race.id,
          horse_id: subject.horseId || undefined,
          jockey_id: form.subjectKind === "Jockey" ? subject.jockeyId || undefined : undefined,
          violation_type: form.type,
          severity: form.severity,
          description: form.description.trim(),
          time_marker: form.timeMarker || undefined,
          evidence_urls: evidenceUrls,
          status: policy?.requires_review ? "under_review" : "recorded",
        });
      }
      await reload();
      addMsg(editingId ? "Violation details updated." : "Violation recorded with the backend penalty policy.");
      closeForm();
    } catch (apiError) {
      addMsg(apiError.message || "Unable to save violation.");
    } finally {
      setIsSaving(false);
    }
  };

  const openDetail = async (id) => {
    try {
      setSelectedViolation(null);
      setDecision("");
      setDetailError("");
      setIsDetailLoading(true);
      const data = await refereeApi.getViolation(id);
      setSelectedViolation(data.violation || null);
    } catch (apiError) {
      setDetailError(apiError.status === 403 ? "You do not have permission to view this violation." : apiError.message || "Unable to load violation detail.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const decide = async (action) => {
    if (!decision.trim()) return setDetailError("A decision note is required.");
    try {
      setDecisionAction(action);
      setDetailError("");
      if (action === "confirm") await refereeApi.confirmViolation(selectedViolation._id, decision.trim());
      else await refereeApi.dismissViolation(selectedViolation._id, decision.trim());
      await reload();
      addMsg(action === "confirm" ? "Policy penalty applied to the confirmed incident." : "Incident dismissed with an audit decision.");
      setSelectedViolation(null);
    } catch (apiError) {
      setDetailError(apiError.status === 403 ? "This violation requires Admin review or belongs to another official." : apiError.message || `Unable to ${action} violation.`);
    } finally {
      setDecisionAction("");
    }
  };

  const unresolved = violations.filter((item) => unresolvedStatuses.has(item.status));
  const resultsLocked = ["confirmed", "published"].includes(race.resultStatus);
  const reviewRequiredCount = violations.filter((item) => getPolicy(options, item.type, item.severity)?.requires_review && unresolvedStatuses.has(item.status)).length;
  const detailPolicy = selectedViolation ? getPolicy(options, selectedViolation.violation_type, selectedViolation.severity) : null;
  const detailIsUnresolved = selectedViolation && unresolvedStatuses.has(selectedViolation.status);
  const canRefereeDecide = detailIsUnresolved && Boolean(detailPolicy) && !detailPolicy.requires_review && !resultsLocked;

  const closeDetail = () => {
    setSelectedViolation(null);
    setDetailError("");
    setDecision("");
  };

  return <RefereeLayout title="Violation decisions" eyebrow={`Race incident policy | ${race.name}`} description="Record incidents against backend policy, inspect the suggested penalty, and resolve only decisions within Referee authority." actions={<><button className="admin-header__button" type="button" disabled={isOptionsLoading || Boolean(optionsError) || isUnavailable || resultsLocked} onClick={openCreateForm}><Plus aria-hidden="true" size={17} /> New violation</button><Link className="admin-header__button admin-header__button--ghost" to={`/referee/races/${raceId}`}>Race detail</Link></>}>
    {(error || optionsError) && <section className="admin-live-state admin-live-state--warning" role="alert">{error || optionsError} {optionsError && <button className="admin-header__button admin-header__button--ghost" type="button" onClick={loadOptions}>Retry policy</button>}</section>}
    {isUnavailable && <section className="admin-live-state">Participant data is unavailable. Participant-linked violation creation is disabled.</section>}
    {resultsLocked && <section className="admin-live-state">Violation decisions are locked because race results are {formatStatus(race.resultStatus)}.</section>}
    {!!messages.length && <section className="admin-toast-stack" aria-live="polite">{messages.map((message, index) => <div key={`${message}-${index}`} className="admin-toast">{message}</div>)}</section>}

    <section className="referee-violation-summary" aria-label="Violation summary"><article><span>Total records</span><strong>{violations.length}</strong></article><article><span>Awaiting decision</span><strong>{unresolved.length}</strong></article><article><span>Admin review</span><strong>{reviewRequiredCount}</strong></article><article><span>Confirmed</span><strong>{violations.filter((item) => item.status === "confirmed").length}</strong></article></section>

    <section className="admin-panel"><div className="admin-panel__header referee-section-heading"><div><p className="admin-panel__eyebrow">Audit ledger</p><h2>Recorded incidents</h2></div><span>{options?.penalty_policies?.[0]?.policy_version ? `Policy ${options.penalty_policies[0].policy_version}` : "Policy unavailable"}</span></div>
      {violations.length === 0 ? <div className="referee-empty-state"><Scale aria-hidden="true" size={28} /><div><h2>No violations recorded</h2><p>New incidents will appear here with their policy state.</p></div></div> : <div className="admin-data-table__wrap"><table className="admin-data-table"><thead><tr><th>Incident</th><th>Subject</th><th>Severity</th><th>Policy penalty</th><th>Status</th><th>Time</th><th>Actions</th></tr></thead><tbody>{violations.map((violation) => { const policy = getPolicy(options, violation.type, violation.severity); return <tr key={violation.id}><td><strong>{formatStatus(violation.type)}</strong><span className="referee-table-subline">{violation.description || "No description"}</span></td><td>{violation.subjectName}</td><td>{formatStatus(violation.severity)}</td><td>{describePenalty(violation.penalty || policy?.suggested_penalty)}{policy?.requires_review && <span className="referee-table-subline">Admin review required</span>}</td><td><span className={`referee-status-badge referee-status-badge--${statusTone(violation.status)}`}>{formatStatus(violation.status)}</span></td><td>{violation.timeMarker || "—"}</td><td><div className="referee-row-actions"><button type="button" aria-label="View violation detail" onClick={() => openDetail(violation.id)}><Eye aria-hidden="true" size={16} /></button>{!resultsLocked && unresolvedStatuses.has(violation.status) && <button type="button" aria-label="Edit unresolved violation" onClick={() => openEditForm(violation)}><Pencil aria-hidden="true" size={15} /></button>}</div></td></tr>; })}</tbody></table></div>}
    </section>

    {showForm && <div className="admin-modal" role="dialog" aria-modal="true" aria-label={editingId ? "Edit violation" : "Record violation"} onClick={(event) => event.target === event.currentTarget && closeForm()}><div className="admin-modal__card referee-violation-modal"><div className="admin-panel__header"><p className="admin-panel__eyebrow">{editingId ? "Unresolved record" : "New incident"}</p><h2>{editingId ? "Update violation details" : "Record policy-backed violation"}</h2></div><form className="admin-form-grid" onSubmit={handleSave}><div className="referee-violation-form-grid"><label className="admin-field"><span>Violation type</span><select disabled={Boolean(editingId)} value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>{options?.violation_types?.map((type) => <option key={type} value={type}>{formatStatus(type)}</option>)}</select></label><label className="admin-field"><span>Severity</span><select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value })}>{options?.severities?.map((severity) => <option key={severity} value={severity}>{formatStatus(severity)}</option>)}</select></label><label className="admin-field"><span>Subject kind</span><select disabled={Boolean(editingId)} value={form.subjectKind} onChange={(event) => setForm({ ...form, subjectKind: event.target.value, subjectId: "" })}><option value="Jockey">Jockey</option><option value="Horse">Horse</option></select></label><label className="admin-field"><span>Subject</span><select disabled={Boolean(editingId)} value={form.subjectId} onChange={(event) => setForm({ ...form, subjectId: event.target.value })}><option value="">Select participant</option>{participants.map((participant) => <option key={participant.id} value={participant.id}>{participant.name}</option>)}</select></label><label className="admin-field"><span>Race time marker</span><input value={form.timeMarker} onChange={(event) => setForm({ ...form, timeMarker: event.target.value })} placeholder="00:01:24" /></label></div><label className="admin-field"><span>Incident description</span><textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="State what happened and the observable facts." /></label><label className="admin-field"><span>Evidence URLs, one per line</span><textarea value={form.evidence} onChange={(event) => setForm({ ...form, evidence: event.target.value })} placeholder="https://..." /></label><section className={`referee-policy-preview${preview?.requires_review ? " referee-policy-preview--review" : ""}`} aria-live="polite">{isPreviewLoading ? <LoadingSkeleton ariaLabel="Loading penalty preview" variant="inline" /> : previewError ? <p>{previewError}</p> : preview ? <><div><Scale aria-hidden="true" size={19} /><span>Backend policy preview</span></div><strong>{describePenalty(preview.suggested_penalty)}</strong><p>{preview.suggested_penalty?.note}</p><small>{preview.requires_review ? "Admin decision required for confirmation or dismissal." : `Referee may resolve this incident · Policy ${preview.policy_version}`}</small></> : <p>Select a type and severity to preview the policy.</p>}</section><div className="admin-tool-card__footer"><button className="admin-header__button" disabled={isSaving || isUnavailable || isPreviewLoading || Boolean(previewError)} type="submit">{isSaving ? "Saving..." : editingId ? "Update details" : "Record violation"}</button><button className="admin-header__button admin-header__button--ghost" type="button" onClick={closeForm}>Cancel</button></div></form></div></div>}

    {(isDetailLoading || detailError || selectedViolation) && <div className="admin-modal" role="dialog" aria-modal="true" aria-label="Violation decision" onClick={(event) => event.target === event.currentTarget && !decisionAction && closeDetail()}><div className="admin-modal__card referee-violation-modal">{isDetailLoading ? <LoadingSkeleton ariaLabel="Loading violation detail" variant="detail" /> : detailError && !selectedViolation ? <><section className="admin-live-state admin-live-state--warning">{detailError}</section><button className="admin-header__button admin-header__button--ghost" type="button" onClick={closeDetail}>Close</button></> : selectedViolation && <><div className="admin-panel__header"><p className="admin-panel__eyebrow">Violation detail</p><h2>{formatStatus(selectedViolation.violation_type)}</h2></div><div className="admin-detail-grid"><div className="admin-detail-item"><span className="admin-detail-label">Subject</span><span className="admin-detail-value">{getDetailSubject(selectedViolation)}</span></div><div className="admin-detail-item"><span className="admin-detail-label">Severity</span><span className="admin-detail-value">{formatStatus(selectedViolation.severity)}</span></div><div className="admin-detail-item"><span className="admin-detail-label">Status</span><span className="admin-detail-value">{formatStatus(selectedViolation.status)}</span></div><div className="admin-detail-item"><span className="admin-detail-label">Time marker</span><span className="admin-detail-value">{selectedViolation.time_marker || "—"}</span></div></div><section className="referee-policy-preview"><div><Scale aria-hidden="true" size={19} /><span>Applicable policy</span></div><strong>{describePenalty(selectedViolation.penalty || detailPolicy?.suggested_penalty)}</strong><p>{selectedViolation.penalty?.note || detailPolicy?.suggested_penalty?.note}</p>{detailPolicy?.requires_review ? <small>Admin review is mandatory for this violation type.</small> : <small>Confirming this incident applies the backend policy penalty. Referees cannot edit the penalty amount.</small>}</section><section className="referee-decision-copy"><p>{selectedViolation.description || "No incident description."}</p>{selectedViolation.decision && <blockquote>{selectedViolation.decision}</blockquote>}{selectedViolation.evidence_urls?.length > 0 && <div className="referee-evidence-links">{selectedViolation.evidence_urls.map((url, index) => <a href={url} key={`${url}-${index}`} rel="noreferrer" target="_blank">Evidence {index + 1}</a>)}</div>}</section>{canRefereeDecide && <label className="admin-field"><span>Decision note</span><textarea value={decision} onChange={(event) => setDecision(event.target.value)} placeholder="Explain why this incident should apply or be dismissed." /></label>}{detailError && <section className="admin-live-state admin-live-state--warning">{detailError}</section>}<div className="admin-tool-card__footer">{canRefereeDecide && <><button className="admin-header__button" disabled={Boolean(decisionAction)} type="button" onClick={() => decide("confirm")}><Check aria-hidden="true" size={16} />{decisionAction === "confirm" ? "Applying..." : "Apply policy penalty"}</button><button className="admin-header__button admin-header__button--red" disabled={Boolean(decisionAction)} type="button" onClick={() => decide("dismiss")}><X aria-hidden="true" size={16} />{decisionAction === "dismiss" ? "Dismissing..." : "Dismiss incident"}</button></>}{detailIsUnresolved && detailPolicy?.requires_review && <span className="referee-admin-review-note"><AlertTriangle aria-hidden="true" size={17} /> Admin review required</span>}{detailIsUnresolved && resultsLocked && <span className="referee-admin-review-note"><AlertTriangle aria-hidden="true" size={17} /> Results locked</span>}{detailIsUnresolved && !detailPolicy && <span className="referee-admin-review-note"><AlertTriangle aria-hidden="true" size={17} /> Policy unavailable</span>}<button className="admin-header__button admin-header__button--ghost" disabled={Boolean(decisionAction)} type="button" onClick={closeDetail}>Close</button></div></>}</div></div>}
  </RefereeLayout>;
}

export default ViolationManagement;

