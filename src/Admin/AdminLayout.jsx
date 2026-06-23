import { Link, NavLink } from "react-router-dom";
import {
  CalendarRange,
  ClipboardCheck,
  Flag,
  Gauge,
  LogOut,
  ShieldCheck,
  Trophy,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import LogoutButton from "../auth/LogoutButton";
import "./admin.css";

const navigationGroups = [
  {
    label: "Command",
    items: [
      { to: "/admin", label: "Overview", icon: Gauge, end: true },
      { to: "/admin/registrations", label: "Approvals", icon: ClipboardCheck },
      { to: "/admin/results", label: "Results", icon: Trophy },
    ],
  },
  {
    label: "Competition",
    items: [
      { to: "/admin/tournament", label: "Tournaments", icon: Flag },
      { to: "/admin/schedule", label: "Race schedule", icon: CalendarRange },
    ],
  },
  {
    label: "Directory",
    items: [
      { to: "/admin/users", label: "Users & roles", icon: UsersRound },
      { to: "/admin/jockeys", label: "Jockeys", icon: UserRoundCheck },
      { to: "/admin/referees", label: "Referees", icon: ShieldCheck },
    ],
  },
];

function AdminLayout({ title, eyebrow, description, children, actions }) {
  return (
    <main className="admin-page" aria-label={title}>
      <a className="admin-skip-link" href="#admin-main-content">Skip to main content</a>
      <section className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <Link className="admin-brand__link" to="/admin" aria-label="Horse Racing admin overview">
              <span className="admin-brand__mark" aria-hidden="true">HR</span>
              <span className="admin-brand__copy">
                <strong>Race control</strong>
                <small>Tournament operations</small>
              </span>
            </Link>
          </div>

          <nav className="admin-nav" aria-label="Admin sections">
            {navigationGroups.map((group) => (
              <div className="admin-nav__group" key={group.label}>
                <p className="admin-nav__label">{group.label}</p>
                <div className="admin-nav__links">
                  {group.items.map(({ to, label, icon: Icon, end }) => (
                    <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? "active" : "")}>
                      <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="admin-sidebar__brief">
            <span>Priority queue</span>
            <strong>Registration review</strong>
            <p>Clear pending race entries before building the final starting field.</p>
            <Link to="/admin/registrations">Open approvals <ClipboardCheck size={15} aria-hidden="true" /></Link>
          </div>

          <div className="admin-user-row">
            <div className="admin-user-avatar" aria-hidden="true">A</div>
            <div className="admin-user-info">
              <span className="admin-user-name">Administrator</span>
              <span className="admin-user-role">Full operations access</span>
            </div>
            <LogoutButton className="admin-logout-btn" title="Sign out" ariaLabel="Sign out">
              <LogOut size={16} />
            </LogoutButton>
          </div>
        </aside>

        <section className="admin-content" id="admin-main-content">
          <header className="admin-header">
            <div className="admin-header__copy">
              <p className="admin-header__eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
              <p className="admin-header__description">{description}</p>
            </div>
            {actions && <div className="admin-header__actions">{actions}</div>}
          </header>
          {children}
        </section>
      </section>
    </main>
  );
}

export default AdminLayout;
