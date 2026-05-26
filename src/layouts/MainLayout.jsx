import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import "../App.css";

const MainLayout = () => {
  const location = useLocation();
  const navItems = [
    { name: "Overview", path: "/spectator" },
    { name: "Tournaments", path: "/spectator/tournaments" },
    { name: "Leaderboard", path: "/spectator/leaderboard" },
    { name: "Predictions", path: "/spectator/predictions" },
    { name: "Results", path: "/spectator/results" },
  ];

  return (
    <div className="page-shell" style={{
      backgroundColor: "#1D3024",
      minHeight: "100vh",
      color: "#f5f7f3",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Topbar - Exact Landing Page Pattern */}
      <header className="topbar">
        <Link className="brand" to="/" aria-label="Horse racing home">
          <span className="brand-mark">HR</span>
          <span className="brand-text">
            <strong>horse</strong>
            <span>racing</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/spectator"}
              className={({ isActive }) => `nav-link ${isActive ? "nav-link--active" : ""}`}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <Link className="user-profile-pill" to="/spectator/profile" aria-label="View user profile">
            <div className="avatar-small" />
            <span className="user-name">Guest User</span>
          </Link>
          <Link className="logout-btn" to="/login">Logout</Link>
        </div>
      </header>

      <div className="dashboard-container">
        <main className="content-area" key={location.pathname}>
          <Outlet />
        </main>
      </div>

      <footer className="site-footer" aria-label="Site footer">
        <div className="site-footer__inner">
          <div className="footer-brand">
            <Link className="brand footer-brand__link" to="/" style={{ textDecoration: "none" }}>
              <span className="brand-mark">HR</span>
              <span className="brand-text">
                <strong>horse</strong>
                <span>racing</span>
              </span>
            </Link>
            <p className="footer-copy">Providing race registrations, schedules, results, rankings, and prediction tools since 2010.</p>
          </div>

          <nav className="footer-links" aria-label="Footer navigation">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link></li>
              <li><Link to="/spectator/tournaments" style={{ color: "inherit", textDecoration: "none" }}>Schedule</Link></li>
              <li><Link to="/spectator/leaderboard" style={{ color: "inherit", textDecoration: "none" }}>Leaderboard</Link></li>
            </ul>
          </nav>

          <div className="footer-contact">
            <h4>Contact</h4>
            <address style={{ fontStyle: "normal", color: "inherit" }}>
              123 Race Circuit<br />
              Grandstand District, CA 90210
            </address>
            <a href="mailto:info@horseracing.example" style={{ color: "inherit", textDecoration: "none" }}>info@horseracing.example</a>
            <a href="tel:+1234567890" style={{ color: "inherit", textDecoration: "none" }}>+1 (234) 567-890</a>
          </div>

          <div className="footer-newsletter">
            <h4>Join our newsletter</h4>
            <p>Get updates on race schedules, results, rankings, and tournament announcements.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input className="newsletter-input" type="email" placeholder="Email address" aria-label="Email address" />
              <button className="newsletter-btn" type="submit">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="site-footer__bottom">
          <div className="footer-copyright">© {new Date().getFullYear()} Horse Racing Tournament Management System. All rights reserved.</div>
          <div className="footer-social" aria-hidden="false">
            <a href="#" aria-label="Facebook" className="social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07C2 17.09 5.66 21.2 10.44 21.95v-6.94H8.08v-2.9h2.36V9.41c0-2.33 1.39-3.62 3.52-3.62 1.02 0 2.09.18 2.09.18v2.3h-1.18c-1.16 0-1.52.72-1.52 1.46v1.76h2.59l-.41 2.9h-2.18v6.94C18.34 21.2 22 17.09 22 12.07z" fill="currentColor"/></svg>
            </a>
            <a href="#" aria-label="Instagram" className="social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.2a4 4 0 100 8 4 4 0 000-8zm5.5-.5a1 1 0 11-2 0 1 1 0 012 0z" fill="currentColor"/></svg>
            </a>
            <a href="#" aria-label="Twitter" className="social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 5.92c-.6.27-1.23.45-1.9.53.68-.4 1.2-1.03 1.44-1.78-.63.37-1.32.64-2.06.79A3.29 3.29 0 0015.5 5c-1.8 0-3.26 1.5-3.26 3.36 0 .26.03.52.09.77-2.71-.13-5.12-1.5-6.73-3.56-.28.48-.44 1.03-.44 1.62 0 1.12.55 2.11 1.38 2.69-.51-.02-.98-.16-1.39-.4v.04c0 1.61 1.15 2.96 2.68 3.27-.28.08-.57.12-.88.12-.22 0-.44-.02-.65-.06.45 1.4 1.75 2.42 3.29 2.45A6.63 6.63 0 012 18.4a9.33 9.33 0 005.05 1.48c6.06 0 9.38-4.98 9.38-9.3v-.42c.64-.46 1.18-1.04 1.62-1.7-.58.26-1.2.44-1.86.52z" fill="currentColor"/></svg>
            </a>
          </div>
        </div>
      </footer>

      <style>{`
        .dashboard-container {
          flex: 1;
          padding: 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        .page-shell > .topbar {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 72px;
          padding: 0 4px;
        }
        .page-shell > .topbar .brand,
        .page-shell > .topbar .header-actions {
          position: relative;
          z-index: 2;
          flex: 0 0 auto;
        }
        .page-shell > .topbar .nav {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 8px 10px;
          border: 1px solid rgba(238, 231, 212, 0.08);
          border-radius: 999px;
          background: rgba(238, 231, 212, 0.035);
          backdrop-filter: blur(10px);
        }
        .nav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 118px;
          min-height: 42px;
          padding: 0 22px;
          border-radius: 999px;
          color: rgba(245, 247, 243, 0.62);
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 700;
          overflow: hidden;
          transition: color 180ms ease, background 180ms ease, transform 180ms ease, box-shadow 180ms ease;
        }
        .nav-link::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(180deg, rgba(238, 231, 212, 0.16), rgba(238, 231, 212, 0.05));
          opacity: 0;
          transform: scale(0.86);
          transition: opacity 180ms ease, transform 180ms ease;
        }
        .nav-link:hover {
          color: #EEE7D4;
          transform: translateY(-1px);
        }
        .nav-link:hover::before {
          opacity: 1;
          transform: scale(1);
        }
        .nav-link--active {
          color: #1D3024;
          background: #EEE7D4;
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.22);
        }
        .nav-link--active::before {
          opacity: 0;
        }
        .content-area {
          animation: routeEnter 360ms cubic-bezier(0.2, 0.8, 0.2, 1);
          transform-origin: top center;
        }
        @keyframes routeEnter {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.992);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        @media (max-width: 1100px) {
          .page-shell > .topbar {
            flex-wrap: wrap;
            row-gap: 14px;
          }
          .page-shell > .topbar .nav {
            position: static;
            order: 3;
            width: 100%;
            transform: none;
            flex-wrap: wrap;
          }
          .nav-link {
            min-width: 132px;
          }
        }
        @media (max-width: 640px) {
          .page-shell > .topbar .nav {
            gap: 8px;
            padding: 8px;
          }
          .nav-link {
            flex: 1 1 150px;
            min-width: 0;
          }
        }
        .user-profile-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          font-size: 0.88rem;
          color: #EEE7D4;
          text-decoration: none;
          transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
        }
        .user-profile-pill:hover {
          background: rgba(238, 231, 212, 0.1);
          border-color: rgba(238, 231, 212, 0.3);
          transform: translateY(-1px);
        }
        .avatar-small {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6e5a45, #c89a69);
        }
        .logout-btn {
          color: #EEE7D4;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 600;
          padding: 8px 18px;
          border-radius: 999px;
          border: 1px solid rgba(238, 231, 212, 0.3);
          transition: all 160ms ease;
        }
        .logout-btn:hover {
          background: rgba(238, 231, 212, 0.1);
          border-color: #EEE7D4;
        }
        .footer-copyright {
          font-size: 0.88rem;
          color: rgba(245, 247, 243, 0.4);
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
