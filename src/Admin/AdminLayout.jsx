import { Link, NavLink } from "react-router-dom";

function AdminLayout({ title, eyebrow, description, children, actions }) {
  return (
    <main className="admin-page" aria-label={title}>
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
              <NavLink to="/admin" end className={({ isActive }) => (isActive ? "active" : "")}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "active" : "")}>
                Users &amp; Roles
              </NavLink>
              <NavLink to="/admin/tournament" className={({ isActive }) => (isActive ? "active" : "")}>
                Tournament Setup
              </NavLink>
              <NavLink to="/admin/schedule" className={({ isActive }) => (isActive ? "active" : "")}>
                Race Schedule
              </NavLink>
              <NavLink to="/admin/registrations" className={({ isActive }) => (isActive ? "active" : "")}>
                Registrations
              </NavLink>
              <NavLink to="/admin/horses" className={({ isActive }) => (isActive ? "active" : "")}>
                Horses
              </NavLink>
              <NavLink to="/admin/jockeys" className={({ isActive }) => (isActive ? "active" : "")}>
                Jockeys
              </NavLink>
              <NavLink to="/admin/referees" className={({ isActive }) => (isActive ? "active" : "")}>
                Referees
              </NavLink>
              <NavLink to="/admin/results" className={({ isActive }) => (isActive ? "active" : "")}>
                Results
              </NavLink>
              <NavLink to="/admin/predictions" className={({ isActive }) => (isActive ? "active" : "")}>
                Predictions
              </NavLink>
            </nav>
          </div>

          <div className="admin-sidebar__panel">
            <p className="admin-sidebar__eyebrow">Quick action</p>
            <h3>Approve and publish faster</h3>
            <p>
              Keep registrations, race planning, referee assignments, and result
              publication under one control panel.
            </p>
            <Link className="admin-sidebar__button" to="/admin/registrations">
              Approval queue
            </Link>
          </div>

          <div className="admin-user-row">
            <div className="admin-user-avatar" aria-hidden="true">A</div>
            <div className="admin-user-info">
              <span className="admin-user-name">Admin</span>
              <span className="admin-user-role">System administrator</span>
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

export default AdminLayout;
