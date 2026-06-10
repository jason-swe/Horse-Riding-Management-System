import { Link, useParams } from "react-router-dom";
import RefereeLayout from "./RefereeLayout";
import { assignedRaces, RACE_STATUSES, RESULT_STATUSES } from "./refereeData";

function StatusBadge({ value }) {
  const map = {
    approved: "green", published: "green", confirmed: "green",
    ready: "green", rejected: "red", disqualified: "red",
    "in progress": "amber", "inspection pending": "amber",
    upcoming: "blue", finished: "blue", draft: "gray",
  };
  const color = map[(value || "").toLowerCase()] || "gray";
  return <span className={`referee-status-badge referee-status-badge--${color}`}>{value}</span>;
}

function RefereeRaceDetail() {
  const { raceId } = useParams();
  const race = assignedRaces.find((r) => r.id === raceId);

  if (!race) {
    return (
      <RefereeLayout title="Race Not Found" eyebrow="Race detail" description="">
        <article className="admin-panel">
          <p style={{ color: "rgba(245,247,243,0.54)" }}>
            No race found with ID <strong>{raceId}</strong>.
          </p>
          <Link className="admin-header__button admin-header__button--ghost" to="/referee/races" style={{ marginTop: 14, display: "inline-flex" }}>
            ← Back to races
          </Link>
        </article>
      </RefereeLayout>
    );
  }

  const allHorsesApproved = race.participants.every((p) => p.horseInspection?.status === "Approved");
  const allJockeysApproved = race.participants.every((p) => p.jockeyInspection?.status === "Approved");

  return (
    <RefereeLayout
      title={race.name}
      eyebrow={race.tournament}
      description={`Track: ${race.track} · Date: ${race.date} at ${race.startTime} · Status: ${race.status}`}
      actions={
        <Link className="admin-header__button admin-header__button--ghost" to="/referee/races">
          ← My Races
        </Link>
      }
    >
      {/* Race overview */}
      <section className="admin-metrics admin-metrics--module" aria-label="Race overview">
        <article className="admin-metric-card">
          <p className="admin-metric-card__label">Race Status</p>
          <div style={{ marginTop: 10 }}><StatusBadge value={race.status} /></div>
          <p className="admin-metric-card__note">{race.tournament}</p>
        </article>
        <article className="admin-metric-card">
          <p className="admin-metric-card__label">Participants</p>
          <div className="admin-metric-card__value">{race.participants.length}</div>
          <p className="admin-metric-card__note">Horse &amp; jockey pairs</p>
        </article>
        <article className="admin-metric-card">
          <p className="admin-metric-card__label">Violations</p>
          <div className="admin-metric-card__value" style={{ color: race.violations.length ? "#e87c3e" : undefined }}>
            {race.violations.length}
          </div>
          <p className="admin-metric-card__note">Recorded so far</p>
        </article>
      </section>

      {/* Action panel */}
      <section className="admin-panel">
        <div className="admin-panel__header">
          <p className="admin-panel__eyebrow">Referee actions</p>
          <h2>Race Operations</h2>
        </div>
        <div className="referee-action-grid">
          <Link to={`/referee/races/${raceId}/horse-inspection`} className="referee-action-card">
            <div>
              <strong>Horse Inspection</strong>
              <p>Verify each horse&apos;s eligibility before the race.</p>
              <span className={`referee-insp-badge ${allHorsesApproved ? "referee-insp-badge--done" : "referee-insp-badge--pending"}`}>
                {race.participants.filter(p => p.horseInspection?.status === "Approved").length}/{race.participants.length} approved
              </span>
            </div>
          </Link>
          <Link to={`/referee/races/${raceId}/jockey-inspection`} className="referee-action-card">
            <div>
              <strong>Jockey Inspection</strong>
              <p>Verify license, assignment, and suspension status.</p>
              <span className={`referee-insp-badge ${allJockeysApproved ? "referee-insp-badge--done" : "referee-insp-badge--pending"}`}>
                {race.participants.filter(p => p.jockeyInspection?.status === "Approved").length}/{race.participants.length} approved
              </span>
            </div>
          </Link>
          <Link to={`/referee/races/${raceId}/monitor`} className="referee-action-card">
            <div>
              <strong>Monitor Race</strong>
              <p>Live race control — start, pause, stop, record violations.</p>
              <span className={`referee-insp-badge ${race.status === RACE_STATUSES.READY ? "referee-insp-badge--done" : "referee-insp-badge--pending"}`}>
                {race.status === RACE_STATUSES.READY ? "Ready to start" : race.status}
              </span>
            </div>
          </Link>
          <Link to={`/referee/races/${raceId}/violations`} className="referee-action-card">
            <div>
              <strong>Violations</strong>
              <p>Create or review violation records and penalties.</p>
              <span className="referee-insp-badge referee-insp-badge--pending">
                {race.violations.length} recorded
              </span>
            </div>
          </Link>
          <Link to={`/referee/races/${raceId}/result`} className="referee-action-card">
            <div>
              <strong>Race Result</strong>
              <p>Enter finish positions and confirm official result.</p>
              <span className={`referee-insp-badge ${race.resultStatus === RESULT_STATUSES.PUBLISHED ? "referee-insp-badge--done" : "referee-insp-badge--pending"}`}>
                {race.resultStatus || "No result yet"}
              </span>
            </div>
          </Link>
          <Link to={`/referee/races/${raceId}/report`} className="referee-action-card">
            <div>
              <strong>Race Report</strong>
              <p>Generate and export the official race report (PDF).</p>
              <span className={`referee-insp-badge ${race.resultStatus === RESULT_STATUSES.PUBLISHED ? "referee-insp-badge--done" : "referee-insp-badge--pending"}`}>
                {race.resultStatus === RESULT_STATUSES.PUBLISHED ? "Available" : "Pending confirmation"}
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Participants table */}
      <section className="admin-panel">
        <div className="admin-panel__header">
          <p className="admin-panel__eyebrow">Participants</p>
          <h2>Horse &amp; Jockey Pairs</h2>
        </div>
        <div className="admin-data-table__wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Lane</th>
                <th>Horse</th>
                <th>Owner</th>
                <th>Jockey</th>
                <th>Horse Inspection</th>
                <th>Jockey Inspection</th>
              </tr>
            </thead>
            <tbody>
              {race.participants.map((p) => (
                <tr key={p.horseId}>
                  <td>{p.lane}</td>
                  <td><strong>{p.horseName}</strong></td>
                  <td>{p.owner}</td>
                  <td>{p.jockeyName}</td>
                  <td>
                    <StatusBadge value={p.horseInspection?.status || "Pending"} />
                  </td>
                  <td>
                    <StatusBadge value={p.jockeyInspection?.status || "Pending"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Violations */}
      {race.violations.length > 0 && (
        <section className="admin-panel">
          <div className="admin-panel__header">
            <p className="admin-panel__eyebrow">Violations</p>
            <h2>Recorded Violations</h2>
          </div>
          <div className="admin-data-table__wrap">
            <table className="admin-data-table">
              <thead>
                <tr><th>Type</th><th>Subject</th><th>Penalty</th><th>Time</th></tr>
              </thead>
              <tbody>
                {race.violations.map((v) => (
                  <tr key={v.id}>
                    <td>{v.type}</td>
                    <td>{v.subjectName}</td>
                    <td><StatusBadge value={v.penalty} /></td>
                    <td style={{ fontSize: "0.82rem", color: "rgba(245,247,243,0.56)" }}>
                      {new Date(v.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </RefereeLayout>
  );
}

export default RefereeRaceDetail;
