import { useState } from "react";
import { Link } from "react-router-dom";
import RefereeLayout from "./RefereeLayout";
import { assignedRaces, RACE_STATUSES } from "./refereeData";

const STATUS_ORDER = [
  RACE_STATUSES.UPCOMING,
  RACE_STATUSES.INSPECTION_PENDING,
  RACE_STATUSES.READY,
  RACE_STATUSES.IN_PROGRESS,
  RACE_STATUSES.FINISHED,
  RACE_STATUSES.PUBLISHED,
];

function RefereeRaces() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = assignedRaces.filter((race) => {
    const text = `${race.id} ${race.name} ${race.tournament} ${race.track}`.toLowerCase();
    const matchQuery = !query || text.includes(query.toLowerCase());
    const matchStatus = statusFilter === "All" || race.status === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <RefereeLayout
      title="My Races"
      eyebrow="Assigned race management"
      description="All races assigned to you for officiating. Click a race to view details, conduct inspections, monitor progress, and confirm results."
      actions={
        <Link className="admin-header__button admin-header__button--ghost" to="/referee">
          ← Dashboard
        </Link>
      }
    >
      {/* Filter toolbar */}
      <section className="admin-panel admin-actions-panel">
        <div className="admin-panel__header">
          <p className="admin-panel__eyebrow">Filter &amp; search</p>
          <h2>Race list</h2>
        </div>
        <div className="admin-toolbar">
          <label className="admin-field">
            <span>Search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search race ID, name, track, tournament..."
            />
          </label>
          <label className="admin-field">
            <span>Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <button
            className="admin-header__button admin-header__button--ghost"
            type="button"
            onClick={() => { setQuery(""); setStatusFilter("All"); }}
          >
            Reset
          </button>
        </div>
      </section>

      {/* Race cards */}
      <section className="referee-race-grid" aria-label="Assigned races">
        {filtered.length === 0 && (
          <article className="admin-panel">
            <p style={{ color: "rgba(245,247,243,0.54)", textAlign: "center" }}>
              No races match the current filters.
            </p>
          </article>
        )}
        {filtered.map((race) => (
          <article key={race.id} className="admin-panel referee-race-card">
            <div className="referee-race-card__header">
              <div>
                <p className="admin-panel__eyebrow">{race.tournament}</p>
                <h2>{race.name}</h2>
              </div>
              <span className={`referee-status-badge referee-status-badge--${race.status.toLowerCase().replace(/ /g, "-")}`}>
                {race.status}
              </span>
            </div>

            <div className="referee-race-card__meta">
              <div className="referee-race-card__meta-item">
                <span>{race.track}</span>
              </div>
              <div className="referee-race-card__meta-item">
                <span>{race.date} at {race.startTime}</span>
              </div>
              <div className="referee-race-card__meta-item">
                <span>{race.participants.length} participants</span>
              </div>
              <div className="referee-race-card__meta-item">
                <span>{race.violations.length} violation{race.violations.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            <div className="referee-race-card__inspection">
              <span className="referee-insp-label">Inspections:</span>
              <span className={`referee-insp-badge ${race.participants.every(p => p.horseInspection?.status === "Approved") ? "referee-insp-badge--done" : "referee-insp-badge--pending"}`}>
                Horse: {race.participants.filter(p => p.horseInspection?.status === "Approved").length}/{race.participants.length}
              </span>
              <span className={`referee-insp-badge ${race.participants.every(p => p.jockeyInspection?.status === "Approved") ? "referee-insp-badge--done" : "referee-insp-badge--pending"}`}>
                Jockey: {race.participants.filter(p => p.jockeyInspection?.status === "Approved").length}/{race.participants.length}
              </span>
            </div>

            <div className="admin-tool-card__footer" style={{ marginTop: 14 }}>
              <Link className="admin-header__button" to={`/referee/races/${race.id}`}>
                Open Race →
              </Link>
              {(race.status === RACE_STATUSES.INSPECTION_PENDING || race.status === RACE_STATUSES.UPCOMING) && (
                <Link className="admin-header__button admin-header__button--ghost" to={`/referee/races/${race.id}/horse-inspection`}>
                  Horse Inspection
                </Link>
              )}
              {race.status === RACE_STATUSES.READY && (
                <Link className="admin-header__button admin-header__button--ghost" to={`/referee/races/${race.id}/monitor`}>
                  Monitor
                </Link>
              )}
              {(race.status === RACE_STATUSES.FINISHED) && (
                <Link className="admin-header__button admin-header__button--ghost" to={`/referee/races/${race.id}/result`}>
                  Submit Result
                </Link>
              )}
              {race.status === RACE_STATUSES.PUBLISHED && (
                <Link className="admin-header__button admin-header__button--ghost" to={`/referee/races/${race.id}/report`}>
                  View Report
                </Link>
              )}
            </div>
          </article>
        ))}
      </section>
    </RefereeLayout>
  );
}

export default RefereeRaces;
