import {
  Award,
  BadgeCheck,
  CalendarDays,
  Clock3,
  Home,
  Mail,
  MapPin,
  Phone,
  Trophy,
  UserRound,
} from "lucide-react";
import {
  jockeyAssignments,
  jockeyNotifications,
  jockeyPortraits,
  jockeyProfile,
  jockeyResults,
  jockeySchedule,
} from "./jockeyData";

const statusClass = (status) => {
  if (["Accepted", "Confirmed", "Published", "Available"].includes(status)) {
    return "jockey-badge--green";
  }
  if (["Rejected", "Expired"].includes(status)) {
    return "jockey-badge--muted";
  }
  return "jockey-badge--amber";
};

function JockeyProfile() {
  const nextRace = jockeySchedule[0];
  const latestResult = jockeyResults[0];
  const confirmedAssignments = jockeyAssignments.filter((assignment) => assignment.status === "Confirmed").length;

  return (
    <div className="jockey-profile-page">
      <section className="jockey-profile-hero">
        <div className="jockey-profile-hero__portrait">
          <img src={jockeyPortraits[0]} alt={`${jockeyProfile.name} jockey portrait`} />
          <span className={`jockey-badge ${statusClass(jockeyProfile.status)}`}><BadgeCheck size={14} /> {jockeyProfile.status}</span>
        </div>

        <div className="jockey-profile-hero__copy">
          <p className="jockey-kicker">Athlete profile</p>
          <h1>{jockeyProfile.name}</h1>
          <p>{jockeyProfile.license} riding in the {jockeyProfile.weightClass}, connected with {jockeyProfile.stableConnection} for the current season.</p>
          <div className="jockey-profile-hero__tags">
            <span><UserRound size={14} /> {jockeyProfile.id}</span>
            <span><MapPin size={14} /> {jockeyProfile.location}</span>
            <span><CalendarDays size={14} /> {jockeyProfile.season}</span>
          </div>
        </div>

        <aside className="jockey-profile-hero__panel">
          <span className="jockey-kicker">Next availability</span>
          <strong>{jockeyProfile.availability}</strong>
          <p>{nextRace.race} / {nextRace.horse}</p>
        </aside>
      </section>

      <section className="jockey-profile-stats" aria-label="Jockey profile performance summary">
        {[
          { label: "Win rate", value: jockeyProfile.winRate, note: "Season form", icon: Trophy },
          { label: "Podium rate", value: jockeyProfile.podiumRate, note: "Top-three pace", icon: Award },
          { label: "Earnings", value: jockeyProfile.earnings, note: "Published purse", icon: BadgeCheck },
          { label: "Confirmed", value: confirmedAssignments, note: "Horse pairings", icon: Home },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article className="jockey-profile-stat" key={item.label}>
              <Icon size={18} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          );
        })}
      </section>

      <section className="jockey-profile-layout">
        <article className="jockey-profile-card jockey-profile-contact">
          <div className="jockey-profile-card__header">
            <div>
              <span className="jockey-kicker">Contact</span>
              <h2>Rider details</h2>
            </div>
            <UserRound size={20} />
          </div>

          <div className="jockey-profile-detail-list">
            <div><Mail size={16} /><span>Email</span><strong>{jockeyProfile.email}</strong></div>
            <div><Phone size={16} /><span>Phone</span><strong>{jockeyProfile.phone}</strong></div>
            <div><MapPin size={16} /><span>Base</span><strong>{jockeyProfile.location}</strong></div>
            <div><Home size={16} /><span>Stable</span><strong>{jockeyProfile.stableConnection}</strong></div>
          </div>
        </article>

        <article className="jockey-profile-card jockey-profile-license">
          <div className="jockey-profile-card__header">
            <div>
              <span className="jockey-kicker">License and form</span>
              <h2>Race credentials</h2>
            </div>
            <BadgeCheck size={20} />
          </div>

          <div className="jockey-profile-license__grid">
            <div><span>License</span><strong>{jockeyProfile.license}</strong></div>
            <div><span>Weight class</span><strong>{jockeyProfile.weightClass}</strong></div>
            <div><span>Season</span><strong>{jockeyProfile.season}</strong></div>
            <div><span>Status</span><strong>{jockeyProfile.status}</strong></div>
          </div>
        </article>

        <article className="jockey-profile-card jockey-profile-next">
          <div className="jockey-profile-card__header">
            <div>
              <span className="jockey-kicker">Next race</span>
              <h2>{nextRace.race}</h2>
            </div>
            <span className={`jockey-badge ${statusClass(nextRace.status)}`}>{nextRace.status}</span>
          </div>

          <div className="jockey-profile-next__body">
            <div className="jockey-date-block">
              <span>{nextRace.time.split(", ")[0]}</span>
              <strong>{nextRace.time.split(", ")[1]}</strong>
            </div>
            <div>
              <strong>{nextRace.horse}</strong>
              <span>{nextRace.tournament} / {nextRace.round}</span>
              <small><MapPin size={13} /> {nextRace.venue}</small>
            </div>
          </div>
        </article>

        <article className="jockey-profile-card jockey-profile-result">
          <div className="jockey-profile-card__header">
            <div>
              <span className="jockey-kicker">Latest result</span>
              <h2>{latestResult.race}</h2>
            </div>
            <Trophy size={20} />
          </div>

          <div className="jockey-profile-result__metrics">
            <div><span>Finish</span><strong>#{latestResult.position}</strong></div>
            <div><span>Time</span><strong>{latestResult.time}</strong></div>
            <div><span>Prize</span><strong>{latestResult.prize}</strong></div>
          </div>
        </article>

        <article className="jockey-profile-card jockey-profile-activity">
          <div className="jockey-profile-card__header">
            <div>
              <span className="jockey-kicker">Activity</span>
              <h2>Profile notifications</h2>
            </div>
            <Clock3 size={20} />
          </div>

          <div className="jockey-profile-activity__list">
            {jockeyNotifications.map((item, index) => (
              <div className="jockey-profile-activity__item" key={item}>
                <span>{index + 1}</span>
                <div>
                  <strong>{item}</strong>
                  <small>{index === 0 ? "Just now" : index === 1 ? "18 min ago" : "Today"}</small>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

export default JockeyProfile;
