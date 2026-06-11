import { Link, NavLink } from "react-router-dom";

function RefereeLayout({ title, eyebrow, description, children, actions }) {
  return (
    <main className="admin-page referee-page" aria-label={title}>
      <section className="admin-shell">
        <aside className="admin-sidebar referee-sidebar">
          <div className="admin-brand">
            <Link className="admin-brand__link brand" to="/" aria-label="Horse racing home">
              <span className="brand-mark">HR</span>
              <span className="brand-text">
                <strong>horse</strong>
                <span>racing</span>
              </span>
            </Link>
            <div className="admin-badge referee-badge">REFEREE</div>
          </div>

          <div className="admin-sidebar__section">
            <p className="admin-sidebar__eyebrow">Race Operations</p>
            <nav className="admin-nav" aria-label="Referee sections">
              <NavLink to="/referee" end className={({ isActive }) => (isActive ? "active" : "")}>
                Dashboard
              </NavLink>
              <NavLink to="/referee/races" className={({ isActive }) => (isActive ? "active" : "")}>
                My Races
              </NavLink>
            </nav>
          </div>

          <div className="admin-sidebar__panel referee-sidebar__panel">
            <p className="admin-sidebar__eyebrow">Authority</p>
            <h3>Final decision maker</h3>
            <p>
              You are the final authority. Confirm results to publish them immediately — no Admin approval required.
            </p>
          </div>

          <div className="admin-sidebar__panel referee-sidebar__panel referee-sidebar__panel--rules">
            <p className="admin-sidebar__eyebrow">Restrictions</p>
            <ul className="referee-restriction-list">
              <li>Cannot create tournaments</li>
              <li>Cannot edit race schedules</li>
              <li>Cannot assign horses/jockeys</li>
              <li>Cannot delete race data</li>
            </ul>
          </div>

          <div className="admin-user-row">
            <div className="admin-user-avatar referee-avatar" aria-hidden="true">RF</div>
            <div className="admin-user-info">
              <span className="admin-user-name">Le Quang</span>
              <span className="admin-user-role">Race Referee</span>
            </div>
            <Link className="admin-logout-btn" to="/login" title="Sign out" aria-label="Sign out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </Link>
          </div>
        </aside>

        <section className="admin-content">
          <header className="admin-header">
            <div>
              <p className="admin-header__eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
              <p className="admin-header__description">{description}</p>
            </div>
            <div className="admin-header__actions">{actions}</div>
          </header>
          {children}
        </section>
      </section>
    </main>
  );
}

export default RefereeLayout;
