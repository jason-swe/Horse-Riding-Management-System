import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Bell, CheckCircle2, Trophy, UserRound } from "lucide-react";
import LogoutButton from "../../auth/LogoutButton";
import { ownerNotifications } from "./ownerData";
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
          <div className="owner-notification-menu" ref={notificationsRef}>
            <button
              aria-expanded={notificationsOpen}
              aria-label="Owner notifications"
              className="owner-icon-button owner-notification-trigger"
              onClick={() => setNotificationsOpen((current) => !current)}
              type="button"
            >
              <Bell size={18} />
              <span>{ownerNotifications.length}</span>
            </button>

            <aside className={`owner-notification-popover ${notificationsOpen ? "is-open" : ""}`} aria-label="Owner notification list">
              <div className="owner-notification-popover__header">
                <div>
                  <span className="owner-kicker">Notifications</span>
                  <h2>Stable alerts</h2>
                </div>
                <span className="owner-badge owner-badge--amber">{ownerNotifications.length} new</span>
              </div>

              <div className="owner-notification-popover__list">
                {ownerNotifications.map((item, index) => (
                  <Link className="owner-notification-item" key={item} onClick={() => setNotificationsOpen(false)} to="/owner/profile">
                    <span className="owner-notification-item__icon">{index === 0 ? <CheckCircle2 size={16} /> : <Trophy size={16} />}</span>
                    <span>
                      <strong>{item}</strong>
                      <small>{index === 0 ? "Just now" : index === 1 ? "12 min ago" : "Today"}</small>
                    </span>
                  </Link>
                ))}
              </div>

              <Link className="owner-notification-popover__footer" onClick={() => setNotificationsOpen(false)} to="/owner/profile">
                View profile notifications
              </Link>
            </aside>
          </div>

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
