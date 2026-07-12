import { Link, NavLink, Outlet } from "react-router-dom";
import { UserRound } from "lucide-react";
import LogoutButton from "../../auth/LogoutButton";
import "./owner.css";

const navItems = [
  { label: "Dashboard", to: "/owner", end: true },
  { label: "Horses", to: "/owner/horses" },
  { label: "Registrations", to: "/owner/registrations" },
  { label: "Jockeys", to: "/owner/jockeys" },
  { label: "Schedule", to: "/owner/schedule" },
  { label: "Results", to: "/owner/results" },
];

function OwnerLayout() {
  return (
    <main className="owner-page" aria-label="Horse owner workspace">
      <header className="owner-topbar">
        <Link className="brand owner-brand" to="/" aria-label="Horse racing home">
          <span className="brand-mark">HR</span>
          <span className="brand-text">
            <strong>horse</strong>
            <span>racing</span>
          </span>
        </Link>

        <nav className="owner-nav" aria-label="Horse owner sections">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) => `owner-nav__link ${isActive ? "owner-nav__link--active" : ""}`}
              end={item.end}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="owner-topbar__actions">
          <Link className="owner-button owner-button--ghost owner-profile-pill" to="/owner/profile">
            <UserRound size={17} />
            Profile
          </Link>
          <LogoutButton className="owner-button owner-button--ghost">Logout</LogoutButton>
        </div>
      </header>

      <div className="owner-content">
        <Outlet />
      </div>
    </main>
  );
}

export default OwnerLayout;
