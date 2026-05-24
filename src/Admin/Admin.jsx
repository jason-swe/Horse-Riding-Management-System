import { Link } from "react-router-dom";
import "../index.css";
import "../App.css";

const summaryCards = [
  { label: "Registered Users", value: "248", note: "Horse owners, jockeys, referees, spectators" },
  { label: "Active Horses", value: "76", note: "Approved for upcoming races" },
  { label: "Scheduled Races", value: "14", note: "Heats, rounds, finals" },
  { label: "Pending Approvals", value: "21", note: "Registrations waiting for review" },
];

const quickFunctions = [
  {
    title: "Users & Roles",
    items: ["Manage accounts", "Assign roles", "Suspend or activate users"],
  },
  {
    title: "Tournament Setup",
    items: ["Create tournament", "Set race rounds", "Publish schedule"],
  },
  {
    title: "Race Operations",
    items: ["Assign referee", "Track race status", "Publish results"],
  },
  {
    title: "Predictions & Prize",
    items: ["Manage bets", "Review prediction logs", "Distribute prizes"],
  },
];

const workflowBlocks = [
  {
    title: "Approvals Queue",
    details:
      "Approve horse owner registrations, jockey invitations, and referee participation before race day.",
  },
  {
    title: "Race Registry",
    details:
      "Maintain horse profiles, jockey assignments, race entries, and tournament brackets in one place.",
  },
  {
    title: "Reporting",
    details:
      "Generate referee reports, result summaries, and prediction outcome logs for the tournament record.",
  },
];

const roleMatrix = [
  { role: "Horse Owner", action: "Register horse, assign jockey, confirm race" },
  { role: "Jockey", action: "Accept invite, view assigned races, track performance" },
  { role: "Race Referee", action: "Inspect horses, monitor race, confirm results" },
  { role: "Spectator", action: "View schedule, follow results, make predictions" },
  { role: "Admin", action: "Manage accounts, schedule races, assign roles" },
];

function Admin() {
  return (
    <main className="admin-page" aria-label="Admin dashboard">
      <section className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <Link className="admin-brand__link brand" to="/" aria-label="Horse racing home">
              <span className="brand-mark">HR</span>
              <span className="brand-text">
                <strong>horse</strong>
                <span>racing</span>
              </span>
            </Link>
            <div className="admin-badge">ADMIN</div>
          </div>

          <div className="admin-sidebar__section">
            <p className="admin-sidebar__eyebrow">Operations</p>
            <nav className="admin-nav" aria-label="Admin sections">
              <a href="#dashboard" className="active">Dashboard</a>
              <a href="#users">Users & Roles</a>
              <a href="#tournament">Tournament Setup</a>
              <a href="#schedule">Race Schedule</a>
              <a href="#registrations">Registrations</a>
              <a href="#horses">Horses</a>
              <a href="#jockeys">Jockeys</a>
              <a href="#referees">Referees</a>
              <a href="#results">Results</a>
              <a href="#predictions">Predictions</a>
            </nav>
          </div>

          <div className="admin-sidebar__panel">
            <p className="admin-sidebar__eyebrow">Quick action</p>
            <h3>Approve and publish faster</h3>
            <p>
              Keep registrations, race planning, referee assignments, and result
              publication under one control panel.
            </p>
            <Link className="admin-sidebar__button" to="/login">Back to Login</Link>
          </div>
        </aside>

        <section className="admin-content">
          <header className="admin-header" id="dashboard">
            <div>
              <p className="admin-header__eyebrow">Horse Racing Tournament Management System</p>
              <h1>Admin Control Center</h1>
              <p className="admin-header__description">
                Manage users, approve registrations, organize races, assign referees,
                publish results, and monitor predictions from one dashboard.
              </p>
            </div>

            <div className="admin-header__actions">
              <Link className="admin-header__button" to="/signup">Create user</Link>
              <a className="admin-header__button admin-header__button--ghost" href="#schedule">View schedule</a>
            </div>
          </header>

          <section className="admin-metrics" aria-label="Key metrics">
            {summaryCards.map((card) => (
              <article key={card.label} className="admin-metric-card">
                <p className="admin-metric-card__label">{card.label}</p>
                <div className="admin-metric-card__value">{card.value}</div>
                <p className="admin-metric-card__note">{card.note}</p>
              </article>
            ))}
          </section>

          <section className="admin-grid">
            <article className="admin-panel" id="users">
              <div className="admin-panel__header">
                <p className="admin-panel__eyebrow">Users & Roles</p>
                <h2>Role Management</h2>
              </div>
              <ul className="admin-list">
                <li>Manage Horse Owner, Jockey, Race Referee, Spectator, and Admin accounts.</li>
                <li>Assign permissions by role and review user status.</li>
                <li>Keep account records consistent across the system.</li>
              </ul>
            </article>

            <article className="admin-panel" id="tournament">
              <div className="admin-panel__header">
                <p className="admin-panel__eyebrow">Tournament Setup</p>
                <h2>Race Planning</h2>
              </div>
              <ul className="admin-list">
                <li>Create tournaments, race rounds, heats, and finals.</li>
                <li>Set venues, race order, and published time slots.</li>
                <li>Coordinate registration deadlines and approval stages.</li>
              </ul>
            </article>

            <article className="admin-panel" id="schedule">
              <div className="admin-panel__header">
                <p className="admin-panel__eyebrow">Race Schedule</p>
                <h2>Race Orchestration</h2>
              </div>
              <ul className="admin-list">
                <li>Build race calendar and sequence.</li>
                <li>Assign horses, jockeys, and referees to each race.</li>
                <li>Monitor live race state and publication status.</li>
              </ul>
            </article>

            <article className="admin-panel" id="registrations">
              <div className="admin-panel__header">
                <p className="admin-panel__eyebrow">Registrations</p>
                <h2>Approval Queue</h2>
              </div>
              <ul className="admin-list">
                <li>Review horse owner and jockey registrations.</li>
                <li>Approve or reject tournament participation requests.</li>
                <li>Track pending items and approval history.</li>
              </ul>
            </article>
          </section>

          <section className="admin-stack">
            <article className="admin-panel" id="horses">
              <div className="admin-panel__header">
                <p className="admin-panel__eyebrow">Horse & Jockey Registry</p>
                <h2>Participants</h2>
              </div>

              <div className="admin-table">
                {roleMatrix.map((entry) => (
                  <div key={entry.role} className="admin-table__row">
                    <div className="admin-table__role">{entry.role}</div>
                    <div className="admin-table__action">{entry.action}</div>
                  </div>
                ))}
              </div>
            </article>

            <div className="admin-split">
              <article className="admin-panel" id="referees">
                <div className="admin-panel__header">
                  <p className="admin-panel__eyebrow">Referee Assignment</p>
                  <h2>Control & Verification</h2>
                </div>
                <ul className="admin-list">
                  <li>Assign referees to races and capture referee reports.</li>
                  <li>Record violations, confirmations, and approvals.</li>
                  <li>Validate horse conditions before race start.</li>
                </ul>
              </article>

              <article className="admin-panel" id="results">
                <div className="admin-panel__header">
                  <p className="admin-panel__eyebrow">Results & Prediction</p>
                  <h2>Publication</h2>
                </div>
                <ul className="admin-list">
                  <li>Publish race results and leaderboard updates.</li>
                  <li>Track bets, predictions, and prize outcomes.</li>
                  <li>Share verified results with spectators and participants.</li>
                </ul>
              </article>
            </div>
          </section>

          <section className="admin-bottom-grid" id="predictions">
            <article className="admin-panel">
              <div className="admin-panel__header">
                <p className="admin-panel__eyebrow">Quick Functions</p>
                <h2>Core Admin Actions</h2>
              </div>
              <div className="admin-quick-grid">
                {quickFunctions.map((group) => (
                  <div key={group.title} className="admin-quick-card">
                    <h3>{group.title}</h3>
                    <ul>
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>

            <article className="admin-panel">
              <div className="admin-panel__header">
                <p className="admin-panel__eyebrow">Workflow</p>
                <h2>Management Flow</h2>
              </div>
              <div className="admin-flow">
                {workflowBlocks.map((block, index) => (
                  <div key={block.title} className="admin-flow__step">
                    <div className="admin-flow__index">0{index + 1}</div>
                    <div>
                      <h3>{block.title}</h3>
                      <p>{block.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </section>
      </section>
    </main>
  );
}

export default Admin;
