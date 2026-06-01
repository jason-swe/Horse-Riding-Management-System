import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  Clock,
  MapPin,
  Plus,
  ShieldCheck,
  Trophy,
  UsersRound,
} from "lucide-react";
import {
  ownerHorses,
  ownerJockeys,
  ownerNotifications,
  ownerProfile,
  ownerRegistrations,
  ownerSchedule,
} from "./ownerData";

const ownerStats = [
  {
    label: "Active Horses",
    value: String(ownerHorses.length).padStart(2, "0"),
    note: `${ownerHorses.filter((horse) => horse.status === "Ready").length} race-ready this season`,
    icon: Activity,
  },
  {
    label: "Pending Registrations",
    value: String(ownerRegistrations.filter((item) => item.status !== "Approved").length).padStart(2, "0"),
    note: "Awaiting admin review",
    icon: ClipboardCheck,
  },
  {
    label: "Assigned Jockeys",
    value: String(ownerJockeys.filter((jockey) => jockey.status === "Assigned").length).padStart(2, "0"),
    note: "2 invitations still open",
    icon: UsersRound,
  },
  {
    label: "Season Earnings",
    value: "$42K",
    note: "Prize tracking updated",
    icon: CircleDollarSign,
  },
];

const quickActions = [
  { label: "Add Horse", meta: "Create a new horse profile", to: "/owner/horses/new", icon: Plus },
  { label: "Register Tournament", meta: "Submit horse entries", to: "/owner/registrations", icon: ClipboardCheck },
  { label: "Assign Jockey", meta: "Invite or confirm riders", to: "/owner/jockeys", icon: UsersRound },
];

const dashboardImages = {
  stable: "https://i.pinimg.com/1200x/a9/46/9e/a9469ee3363098f154678502a9eeef9b.jpg",
  track: "https://i.pinimg.com/1200x/3d/ff/a1/3dffa140ed55cb85b21a9e021e4cb2c8.jpg",
  trophy: "https://i.pinimg.com/1200x/30/d4/ec/30d4ec1fb8d7efed15adf856c338efe6.jpg",
};

const horseImages = [
  "https://i.pinimg.com/736x/16/b4/e0/16b4e0814c679b1a64548914e499497d.jpg",
  "https://i.pinimg.com/736x/28/b6/ab/28b6ab0f95a9f5945b17ba17a3800ae8.jpg",
  "https://i.pinimg.com/736x/94/98/ab/9498ab5a8136f433c8d716fec64a7556.jpg",
  "https://i.pinimg.com/1200x/0b/9c/f0/0b9cf065f5a0823c9870113e206bfbd6.jpg",
];

function OwnerDashboard() {
  const dashboardRef = useRef(null);

  useEffect(() => {
    const root = dashboardRef.current;
    if (!root) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = Array.from(root.querySelectorAll(".owner-reveal"));

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -60px 0px" },
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="owner-dashboard" ref={dashboardRef}>
      <section className="owner-hero owner-dashboard-hero owner-reveal">
        <div className="owner-hero__content">
          <p className="owner-eyebrow">Horse Owner Command Center</p>
          <h1>Manage your stable, entries, and race readiness.</h1>
          <p>
            Track horse profiles, tournament registrations, jockey assignments, schedules, and prize outcomes from one focused owner dashboard.
          </p>
          <div className="owner-hero__actions">
            <Link className="owner-button owner-button--primary" to="/owner/horses/new">
              <Plus size={18} />
              Add Horse
            </Link>
            <Link className="owner-button" to="/owner/registrations">
              Open Registrations
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <aside className="owner-hero-media" aria-label="Stable command visuals">
          <img src={dashboardImages.stable} alt="Premium stable interior for horse care" />
          <div className="owner-hero-media__overlay">
            <span className="owner-badge owner-badge--green"><ShieldCheck size={14} /> Verified Owner</span>
            <strong>{ownerProfile.stable}</strong>
            <p>{ownerHorses.length} horses registered, {ownerJockeys.filter((jockey) => jockey.status === "Assigned").length} riders assigned.</p>
          </div>
        </aside>
      </section>

      <section className="owner-stable-showcase owner-reveal" aria-label="Active stable horses">
        <div className="owner-stable-showcase__header">
          <div>
            <p className="owner-eyebrow">Stable Spotlight</p>
            <h2>Four horses to watch this race window.</h2>
          </div>
          <Link className="owner-badge" to="/owner/horses">
            View stable
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="owner-visual-strip">
          {ownerHorses.slice(0, 4).map((horse, index) => (
            <Link className="owner-visual-horse" to={`/owner/horses/${horse.id}`} key={horse.id}>
              <img src={horseImages[index]} alt={`${horse.name} profile`} />
              <div className="owner-visual-horse__content">
                <strong>{horse.name}</strong>
                <small>{horse.breed} / {horse.nextRace}</small>
              </div>
              <div className="owner-visual-horse__reveal">
                <span>{horse.record}</span>
                <span>Jockey: {horse.jockey}</span>
                <b>Open profile <ArrowRight size={15} /></b>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="owner-layout owner-reveal">
        <aside className="owner-hero__panel owner-season-panel">
          <div className="owner-hero__panel-header">
            <span className="owner-badge owner-badge--green"><ShieldCheck size={14} /> Verified Owner</span>
            <span className="owner-meta">{ownerProfile.season}</span>
          </div>
          <strong>{ownerProfile.stable}</strong>
          <p>{ownerHorses.length} horses registered, {ownerJockeys.filter((jockey) => jockey.status === "Assigned").length} jockey relationships active, and {ownerRegistrations.filter((item) => item.status !== "Approved").length} tournament entries under review.</p>
          <div className="owner-hero__panel-grid">
            <div><span>Next Race</span><b>Jun 03</b></div>
            <div><span>Win Rate</span><b>{ownerProfile.winRate}</b></div>
          </div>
        </aside>

        <article className="owner-image-card">
          <img src={dashboardImages.track} alt="Race track before an upcoming horse race" />
          <div>
            <span className="owner-eyebrow">Track window</span>
            <h2>Four race slots need owner confirmation this week.</h2>
            <Link className="owner-badge" to="/owner/schedule">Review schedule</Link>
          </div>
        </article>
      </section>

      <section className="owner-stats owner-reveal" aria-label="Owner dashboard summary">
        {ownerStats.map((item) => {
          const Icon = item.icon;
          return (
            <article className="owner-stat-card" key={item.label}>
              <div className="owner-stat-card__icon"><Icon size={20} /></div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          );
        })}
      </section>

      <section className="owner-layout owner-schedule-band owner-reveal">
        <article className="owner-card owner-card--wide">
          <div className="owner-card__header">
            <div>
              <p className="owner-eyebrow">Race Calendar</p>
              <h2>Upcoming Schedule</h2>
            </div>
            <Link className="owner-badge" to="/owner/schedule">View all</Link>
          </div>

          <div className="owner-timeline">
            {ownerSchedule.slice(0, 3).map((race) => (
              <div className="owner-timeline__item" key={race.id}>
                <div className="owner-timeline__time">
                  <CalendarDays size={16} />
                  <span>{race.time}</span>
                </div>
                <div>
                  <h3>{race.race}</h3>
                  <div className="owner-race-meta">
                    <span>{race.horse}</span>
                    <span>{race.jockey}</span>
                    <small><MapPin size={13} /> {race.venue}</small>
                  </div>
                </div>
                <span className={`owner-badge ${race.status === "Confirmed" ? "owner-badge--green" : "owner-badge--amber"}`}>
                  {race.status}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="owner-layout owner-layout--lower owner-reveal">
        <article className="owner-card">
          <div className="owner-card__header">
            <div>
              <p className="owner-eyebrow">Approval Flow</p>
              <h2>Registration Queue</h2>
            </div>
            <ClipboardCheck size={20} />
          </div>

          <div className="owner-registration-list">
            {ownerRegistrations.slice(0, 3).map((item) => (
              <div className="owner-registration" key={item.id}>
                <span>{item.id}</span>
                <div className="owner-registration__body">
                  <strong>{item.horse}</strong>
                  <small>{item.tournament}</small>
                </div>
                <span className={`owner-badge ${item.status === "Approved" ? "owner-badge--green" : "owner-badge--amber"}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="owner-card">
          <div className="owner-card__header">
            <div>
              <p className="owner-eyebrow">Quick Actions</p>
              <h2>Next Steps</h2>
            </div>
            <Clock size={20} />
          </div>

          <div className="owner-action-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link className="owner-action" to={action.to} key={action.label}>
                  <span><Icon size={18} /></span>
                  <strong>{action.label}</strong>
                  <small>{action.meta}</small>
                </Link>
              );
            })}
          </div>
        </article>

        <article className="owner-card">
          <div className="owner-card__header">
            <div>
              <p className="owner-eyebrow">Alerts</p>
              <h2>Owner Notifications</h2>
            </div>
            <Bell size={20} />
          </div>

          <ul className="owner-notifications">
            {ownerNotifications.map((notification) => (
              <li key={notification}>
                <Trophy size={16} />
                <span>{notification}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

export default OwnerDashboard;
