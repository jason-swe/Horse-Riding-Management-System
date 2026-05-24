import { Link, NavLink } from "react-router-dom";

function AdminLayout({ title, eyebrow, description, children, actions, activeSection = "dashboard" }) {
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
              <NavLink to="/admin" end className={({ isActive }) => (isActive && activeSection === "dashboard" ? "active" : "")}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "active" : "")}>
                Users & Roles
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
              Keep registrations, race planning, referee assignments, and result publication under one control panel.
            </p>
            <Link className="admin-sidebar__button" to="/login">Back to Login</Link>
          </div>
        </aside>

        <section className="admin-content">
          <header className="admin-header" id={activeSection}>
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
