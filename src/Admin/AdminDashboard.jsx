import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";

const summaryCards = [
  { label: "Registered Users", value: "248", note: "Horse owners, jockeys, referees, spectators", module: "users" },
  { label: "Active Horses", value: "76", note: "Approved for upcoming races", module: "horses" },
  { label: "Scheduled Races", value: "14", note: "Heats, rounds, finals", module: "schedule" },
  { label: "Pending Approvals", value: "21", note: "Registrations waiting for review", module: "registrations" },
  { label: "Published Results", value: "42", note: "Verified and announced to all roles", module: "results" },
  { label: "Prize Entries", value: "12", note: "Reward logs linked to predictions", module: "predictions" },
];

const overviewPanels = [
  {
    eyebrow: "Users & Roles",
    title: "Role Management",
    module: "users",
    items: [
      "Manage Horse Owner, Jockey, Race Referee, Spectator, and Admin accounts.",
      "Assign permissions by role and review user status.",
      "Keep account records consistent across the system.",
    ],
  },
  {
    eyebrow: "Tournament Setup",
    title: "Race Planning",
    module: "tournament",
    items: [
      "Create tournaments, race rounds, heats, and finals.",
      "Set venues, race order, and published time slots.",
      "Coordinate registration deadlines and approval stages.",
    ],
  },
  {
    eyebrow: "Race Schedule",
    title: "Race Orchestration",
    module: "schedule",
    items: [
      "Build race calendar and sequence.",
      "Assign horses, jockeys, and referees to each race.",
      "Monitor live race state and publication status.",
    ],
  },
  {
    eyebrow: "Registrations",
    title: "Approval Queue",
    module: "registrations",
    items: [
      "Review horse owner and jockey registrations.",
      "Approve or reject tournament participation requests.",
      "Track pending items and approval history.",
    ],
  },
];

const adminFeatureCards = [
  {
    title: "Registration Review",
    eyebrow: "Approvals",
    module: "registrations",
    description: "Review pending registrations, approve or reject requests, and keep approval history visible.",
    stats: [
      { label: "Pending", value: "21" },
      { label: "Processed today", value: "13" },
      { label: "Flagged", value: "4" },
    ],
  },
  {
    title: "Schedule Builder",
    eyebrow: "Planning",
    module: "schedule",
    description: "Create race calendar, add rounds, assign referees, and manage draft vs published states.",
    stats: [
      { label: "Upcoming races", value: "14" },
      { label: "Published slots", value: "11" },
      { label: "Draft rounds", value: "3" },
    ],
  },
  {
    title: "Result Publication",
    eyebrow: "Race outcomes",
    module: "results",
    description: "Verify race result, update leaderboard, and publish official outcomes to participants.",
    stats: [
      { label: "Verified", value: "42" },
      { label: "Prize claims", value: "9" },
      { label: "Reports filed", value: "27" },
    ],
  },
  {
    title: "Prediction Control",
    eyebrow: "Rewards",
    module: "predictions",
    description: "Review spectator predictions, compare outcomes, and distribute prize notifications.",
    stats: [
      { label: "Entries", value: "156" },
      { label: "Winning picks", value: "38" },
      { label: "Payouts", value: "12" },
    ],
  },
];

const adminOperations = [
  {
    title: "Create & Manage Users",
    module: "users",
    items: ["Create user account", "Assign role", "Review user status", "Suspend / activate account"],
  },
  {
    title: "Manage Horses & Jockeys",
    module: "horses",
    items: ["Add horse data", "Assign jockey", "Check readiness", "Track horse-jockey pairing"],
  },
  {
    title: "Manage Schedule & Tournament",
    module: "schedule",
    items: ["Create tournament", "Build round structure", "Set race date", "Publish calendar"],
  },
  {
    title: "Manage Results & Prediction",
    module: "results",
    items: ["Publish result", "Check report", "Review prediction", "Track prize payout"],
  },
];

const workflowBlocks = [
  {
    title: "Approvals Queue",
    module: "registrations",
    details: "Approve horse owner registrations, jockey invitations, referee assignments, and spectator access before race day.",
  },
  {
    title: "Race Registry",
    module: "horses",
    details: "Maintain horse profiles, jockey assignments, race entries, schedules, and tournament brackets in one control panel.",
  },
  {
    title: "Reporting",
    module: "results",
    details: "Generate referee reports, result summaries, prize logs, and prediction outcome records for the tournament history.",
  },
];

function AdminDashboard() {
  return (
    <AdminLayout
      title="Admin Control Center"
      eyebrow="Horse Racing Tournament Management System"
      description="Manage users, approve registrations, organize races, assign referees, publish results, and monitor predictions from one dashboard."
      actions={(
        <>
          <Link className="admin-header__button" to="/admin/users">Manage users</Link>
          <Link className="admin-header__button admin-header__button--ghost" to="/admin/registrations">Approvals</Link>
        </>
      )}
    >
      {/* Key metrics */}
      <section className="admin-metrics" aria-label="Key metrics">
        {summaryCards.map((card) => (
          <Link key={card.label} to={`/admin/${card.module}`} className="admin-metric-card admin-metric-card--link">
            <p className="admin-metric-card__label">{card.label}</p>
            <div className="admin-metric-card__value">{card.value}</div>
            <p className="admin-metric-card__note">{card.note}</p>
          </Link>
        ))}
      </section>

      {/* Overview panels */}
      <section className="admin-grid">
        {overviewPanels.map((panel) => (
          <article key={panel.title} className="admin-panel">
            <div className="admin-panel__header">
              <p className="admin-panel__eyebrow">{panel.eyebrow}</p>
              <h2>{panel.title}</h2>
            </div>
            <ul className="admin-list">
              {panel.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <div>
              <Link className="admin-header__button admin-header__button--ghost admin-panel__cta" to={`/admin/${panel.module}`}>
                Go to {panel.eyebrow} →
              </Link>
            </div>
          </article>
        ))}
      </section>

      {/* Feature cards with stats */}
      <section className="admin-grid" aria-label="Admin feature cards">
        {adminFeatureCards.map((card) => (
          <article key={card.title} className="admin-panel">
            <div className="admin-panel__header">
              <p className="admin-panel__eyebrow">{card.eyebrow}</p>
              <h2>{card.title}</h2>
            </div>
            <p>{card.description}</p>
            <div className="admin-stat-row">
              {card.stats.map((stat) => (
                <div key={stat.label} className="admin-stat-chip">
                  <span className="admin-stat-chip__value">{stat.value}</span>
                  <span className="admin-stat-chip__label">{stat.label}</span>
                </div>
              ))}
            </div>
            <div>
              <Link className="admin-header__button admin-panel__cta" to={`/admin/${card.module}`}>
                Open {card.eyebrow} →
              </Link>
            </div>
          </article>
        ))}
      </section>

      {/* Operations grid */}
      <section className="admin-grid">
        {adminOperations.map((group) => (
          <article key={group.title} className="admin-panel">
            <div className="admin-panel__header">
              <p className="admin-panel__eyebrow">Admin Actions</p>
              <h2>{group.title}</h2>
            </div>
            <ul className="admin-list">
              {group.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <div>
              <Link className="admin-header__button admin-header__button--ghost admin-panel__cta" to={`/admin/${group.module}`}>
                Manage →
              </Link>
            </div>
          </article>
        ))}
      </section>

      {/* Workflow steps */}
      <section className="admin-panel" aria-label="Management workflow">
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
              <Link className="admin-header__button admin-header__button--ghost" to={`/admin/${block.module}`} style={{ alignSelf: "center" }}>
                Open →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
}

export default AdminDashboard;
