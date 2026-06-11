import { Link } from "react-router-dom";
import RefereeLayout from "./RefereeLayout";
import { assignedRaces, auditLog, RACE_STATUSES } from "./refereeData";

const upcoming = assignedRaces.filter((r) => r.status === RACE_STATUSES.UPCOMING).length;
const inProgress = assignedRaces.filter((r) => r.status === RACE_STATUSES.IN_PROGRESS).length;
const finished = assignedRaces.filter(
  (r) => r.status === RACE_STATUSES.FINISHED || r.status === RACE_STATUSES.PUBLISHED
).length;

const recentActivity = [
  { label: "Horse Approved", detail: "Night Sprint — R-04", time: "2 days ago" },
  { label: "Horse Approved", detail: "Storm Arrow — R-04", time: "2 days ago" },
  { label: "Violation Created", detail: "Lane Violation — Duc Huy", time: "2 days ago" },
  { label: "Result Confirmed", detail: "Spring Cup Final — R-04", time: "2 days ago" },
];

function RefereeDashboard() {
  return (
    <RefereeLayout
      title="Referee Control Center"
      eyebrow="Race Referee Management System"
      description="Monitor your assigned races, conduct pre-race inspections, record violations, and confirm official results. Your decision is final."
      actions={
        <Link className="admin-header__button" to="/referee/races">
          My Races
        </Link>
      }
    >
      {/* Stats */}
      <section className="admin-metrics" aria-label="Referee statistics">
        <article className="admin-metric-card referee-metric-card">
          <p className="admin-metric-card__label">Total Assigned</p>
          <div className="admin-metric-card__value">{assignedRaces.length}</div>
          <p className="admin-metric-card__note">Races under your authority</p>
        </article>
        <article className="admin-metric-card referee-metric-card">
          <p className="admin-metric-card__label">Upcoming</p>
          <div className="admin-metric-card__value referee-metric--blue">{upcoming}</div>
          <p className="admin-metric-card__note">Awaiting inspection &amp; race day</p>
        </article>
        <article className="admin-metric-card referee-metric-card">
          <p className="admin-metric-card__label">In Progress</p>
          <div className="admin-metric-card__value referee-metric--amber">{inProgress}</div>
          <p className="admin-metric-card__note">Currently being monitored</p>
        </article>
        <article className="admin-metric-card referee-metric-card">
          <p className="admin-metric-card__label">Completed</p>
          <div className="admin-metric-card__value referee-metric--green">{finished}</div>
          <p className="admin-metric-card__note">Results confirmed &amp; published</p>
        </article>
      </section>

      <section className="admin-grid">
        {/* Recent Activity */}
        <article className="admin-panel">
          <div className="admin-panel__header">
            <p className="admin-panel__eyebrow">Activity log</p>
            <h2>Recent Actions</h2>
          </div>
          <ul className="referee-activity-list">
            {recentActivity.map((item, i) => (
              <li key={i} className="referee-activity-item">
                <div className="referee-activity-info">
                  <span className="referee-activity-label">{item.label}</span>
                  <span className="referee-activity-detail">{item.detail}</span>
                </div>
                <span className="referee-activity-time">{item.time}</span>
              </li>
            ))}
          </ul>
        </article>

        {/* Audit Log */}
        <article className="admin-panel">
          <div className="admin-panel__header">
            <p className="admin-panel__eyebrow">Compliance</p>
            <h2>Audit Log</h2>
          </div>
          <div className="admin-data-table__wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Race</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.action}</td>
                    <td>{entry.raceId}</td>
                    <td style={{ color: "rgba(245,247,243,0.56)", fontSize: "0.82rem" }}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {/* Upcoming schedule */}
      <section className="admin-panel" aria-label="Upcoming races">
        <div className="admin-panel__header">
          <p className="admin-panel__eyebrow">Schedule</p>
          <h2>Upcoming Race Calendar</h2>
        </div>
        <div className="admin-data-table__wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Race ID</th>
                <th>Race Name</th>
                <th>Track</th>
                <th>Date</th>
                <th>Start</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignedRaces.map((race) => (
                <tr key={race.id} style={{ cursor: "pointer" }}>
                  <td>
                    <Link to={`/referee/races/${race.id}`} className="referee-table-link">
                      {race.id}
                    </Link>
                  </td>
                  <td>{race.name}</td>
                  <td>{race.track}</td>
                  <td>{race.date}</td>
                  <td>{race.startTime}</td>
                  <td>
                    <span className={`referee-status-badge referee-status-badge--${race.status.toLowerCase().replace(/ /g, "-")}`}>
                      {race.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 14 }}>
          <Link className="admin-header__button admin-header__button--ghost" to="/referee/races">
            View all races →
          </Link>
        </div>
      </section>
    </RefereeLayout>
  );
}

export default RefereeDashboard;
