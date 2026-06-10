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
  jockeyNotifications,
  jockeyPortraits,
} from "./jockeyData";
import { useJockeyApiData } from "./useJockeyApiData";

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
  const { assignments, error, isLoading, profile, results, schedule } = useJockeyApiData();
  const nextRace = schedule[0];
  const latestResult = results[0];
  const confirmedAssignments = assignments.filter((assignment) => assignment.status === "Accepted").length;

  return (
    <div className="jockey-profile-page">
      {(isLoading || error) && (
        <div className={`jockey-sync-note ${error ? "jockey-sync-note--warning" : ""}`}>
          {isLoading ? "Loading live profile..." : error}
        </div>
      )}
      <section className="jockey-profile-hero">
        <div className="jockey-profile-hero__portrait">
          <img src={jockeyPortraits[0]} alt={`${profile.name} jockey portrait`} />
          <span className={`jockey-badge ${statusClass(profile.status)}`}><BadgeCheck size={14} /> {profile.status}</span>
        </div>

        <div className="jockey-profile-hero__copy">
          <p className="jockey-kicker">Athlete profile</p>
          <h1>{profile.name}</h1>
          <p>{profile.license} riding in the {profile.weightClass}, connected with {profile.stableConnection} for the current season.</p>
          <div className="jockey-profile-hero__tags">
            <span><UserRound size={14} /> {profile.id}</span>
            <span><MapPin size={14} /> {profile.location}</span>
            <span><CalendarDays size={14} /> {profile.season}</span>
          </div>
        </div>

        <aside className="jockey-profile-hero__panel">
          <span className="jockey-kicker">Next availability</span>
          <strong>{profile.availability}</strong>
          <p>{nextRace.race} / {nextRace.horse}</p>
        </aside>
      </section>

      <section className="jockey-profile-stats" aria-label="Jockey profile performance summary">
        {[
          { label: "Win rate", value: profile.winRate, note: "Season form", icon: Trophy },
          { label: "Podium rate", value: profile.podiumRate, note: "Top-three pace", icon: Award },
          { label: "Earnings", value: profile.earnings, note: "Published purse", icon: BadgeCheck },
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
            <div><Mail size={16} /><span>Email</span><strong>{profile.email}</strong></div>
            <div><Phone size={16} /><span>Phone</span><strong>{profile.phone}</strong></div>
            <div><MapPin size={16} /><span>Base</span><strong>{profile.location}</strong></div>
            <div><Home size={16} /><span>Stable</span><strong>{profile.stableConnection}</strong></div>
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
            <div><span>License</span><strong>{profile.license}</strong></div>
            <div><span>Weight class</span><strong>{profile.weightClass}</strong></div>
            <div><span>Season</span><strong>{profile.season}</strong></div>
            <div><span>Status</span><strong>{profile.status}</strong></div>
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
