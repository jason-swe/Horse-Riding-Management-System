import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Bell, CheckCircle2, Trophy, UserRound } from "lucide-react";
import { jockeyNotifications } from "./jockeyData";
import "./jockey.css";

const navItems = [
  { label: "Dashboard", to: "/jockey", end: true },
  { label: "Invitations", to: "/jockey/invitations" },
  { label: "Schedule", to: "/jockey/schedule" },
  { label: "Assignments", to: "/jockey/assignments" },
  { label: "Results", to: "/jockey/results" },
];

function JockeyLayout() {
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
    <main className="jockey-page" aria-label="Jockey athlete workspace">
      <header className="jockey-topbar">
        <Link className="brand jockey-brand" to="/" aria-label="Horse racing home">
          <span className="brand-mark">HR</span>
          <span className="brand-text">
            <strong>horse</strong>
            <span>racing</span>
          </span>
        </Link>

        <nav className="jockey-nav" aria-label="Jockey sections">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) => `jockey-nav__link ${isActive ? "jockey-nav__link--active" : ""}`}
              end={item.end}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="jockey-topbar__actions">
          <div className="jockey-notification-menu" ref={notificationsRef}>
            <button
              aria-expanded={notificationsOpen}
              aria-label="Jockey notifications"
              className="jockey-icon-button jockey-notification-trigger"
              onClick={() => setNotificationsOpen((current) => !current)}
              type="button"
            >
              <Bell size={18} />
              <span>{jockeyNotifications.length}</span>
            </button>

            <aside className={`jockey-notification-popover ${notificationsOpen ? "is-open" : ""}`} aria-label="Jockey notification list">
              <div className="jockey-notification-popover__header">
                <div>
                  <span className="jockey-kicker">Notifications</span>
                  <h2>Race alerts</h2>
                </div>
                <span className="jockey-badge jockey-badge--amber">{jockeyNotifications.length} new</span>
              </div>

              <div className="jockey-notification-popover__list">
                {jockeyNotifications.map((item, index) => (
                  <Link className="jockey-notification-item" key={item} onClick={() => setNotificationsOpen(false)} to="/jockey/profile">
                    <span className="jockey-notification-item__icon">{index === 1 ? <CheckCircle2 size={16} /> : <Trophy size={16} />}</span>
                    <span>
                      <strong>{item}</strong>
                      <small>{index === 0 ? "Just now" : index === 1 ? "18 min ago" : "Today"}</small>
                    </span>
                  </Link>
                ))}
              </div>

              <Link className="jockey-notification-popover__footer" onClick={() => setNotificationsOpen(false)} to="/jockey/profile">
                View profile notifications
              </Link>
            </aside>
          </div>

          <Link className="jockey-button jockey-button--ghost jockey-profile-pill" to="/jockey/profile">
            <UserRound size={17} />
            Profile
          </Link>
          <Link className="jockey-button jockey-button--ghost" to="/login">Logout</Link>
        </div>
      </header>

      <div className="jockey-content">
        <Outlet />
      </div>
    </main>
  );
}

export default JockeyLayout;
