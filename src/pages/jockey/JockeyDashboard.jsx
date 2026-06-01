import { Link } from "react-router-dom";
import {
  Award,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flag,
  MapPin,
  Send,
  Trophy,
  UserRound,
} from "lucide-react";
import {
  celebrationImages,
  horseJockeyImages,
  jockeyActionImages,
  jockeyAssignments,
  jockeyInvitations,
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

function JockeyDashboard() {
  const pendingInvitations = jockeyInvitations.filter((item) => item.status === "Pending");
  const confirmedRaces = jockeySchedule.filter((race) => race.status === "Confirmed");
  const nextRace = jockeySchedule[0];
  const latestResult = jockeyResults[0];

  return (
    <div className="jockey-dashboard">
      <section className="jockey-hero">
        <img src={jockeyActionImages[1]} alt="Jockey accelerating on a race track" />
        <div className="jockey-hero__copy">
          <p className="jockey-kicker">Athlete command center</p>
          <h1>Ride the next invitation with race-day clarity.</h1>
          <p>Track owner invites, confirmed race slots, horse pairings, and performance signals from one jockey workspace.</p>
          <div className="jockey-hero__actions">
            <Link className="jockey-button jockey-button--primary" to="/jockey/invitations"><Send size={18} /> Review Invitations</Link>
            <Link className="jockey-button" to="/jockey/schedule">View Schedule</Link>
          </div>
        </div>
        <aside className="jockey-hero__panel">
          <span className="jockey-badge jockey-badge--green"><BadgeCheck size={14} /> {jockeyProfile.status}</span>
          <strong>{jockeyProfile.name}</strong>
          <p>{jockeyProfile.license} / {jockeyProfile.weightClass}</p>
        </aside>
      </section>

      <section className="jockey-stats" aria-label="Jockey dashboard summary">
        {[
          { label: "Pending invites", value: pendingInvitations.length, note: "Need response", icon: Send },
          { label: "Confirmed races", value: confirmedRaces.length, note: "Locked race slots", icon: CalendarDays },
          { label: "Win rate", value: jockeyProfile.winRate, note: "Season form", icon: Trophy },
          { label: "Podium rate", value: jockeyProfile.podiumRate, note: "Top-three finishes", icon: Award },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article className="jockey-stat-card" key={item.label}>
              <Icon size={18} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          );
        })}
      </section>

      <section className="jockey-dashboard-grid">
        <article className="jockey-card jockey-next-race">
          <div className="jockey-card__header">
            <div>
              <span className="jockey-kicker">Next race</span>
              <h2>{nextRace.race}</h2>
            </div>
            <span className={`jockey-badge ${statusClass(nextRace.status)}`}>{nextRace.status}</span>
          </div>
          <div className="jockey-next-race__body">
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

        <article className="jockey-card jockey-invite-card">
          <div className="jockey-card__header">
            <div>
              <span className="jockey-kicker">Invitation queue</span>
              <h2>Owner decisions waiting</h2>
            </div>
            <Send size={20} />
          </div>
          <div className="jockey-invite-list">
            {pendingInvitations.map((invite) => (
              <div className="jockey-invite-item" key={invite.id}>
                <div>
                  <span>{invite.id}</span>
                  <strong>{invite.horse}</strong>
                  <small>{invite.race} / {invite.owner}</small>
                </div>
                <Link className="jockey-badge jockey-badge--amber" to="/jockey/invitations">Review</Link>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="jockey-dashboard-lower">
        <article className="jockey-visual-card">
          <img src={horseJockeyImages[0]} alt="Horse and jockey pairing before a race" />
          <div>
            <span className="jockey-kicker">Current pairing</span>
            <h2>{jockeyAssignments[0].horse}</h2>
            <p>{jockeyAssignments[0].note}</p>
          </div>
        </article>

        <article className="jockey-card">
          <div className="jockey-card__header">
            <div>
              <span className="jockey-kicker">Assignments</span>
              <h2>Horse pairings</h2>
            </div>
            <UserRound size={20} />
          </div>
          <div className="jockey-assignment-list">
            {jockeyAssignments.map((assignment) => (
              <div className="jockey-assignment-item" key={assignment.id}>
                <span className={`jockey-badge ${statusClass(assignment.status)}`}>{assignment.status}</span>
                <div>
                  <strong>{assignment.horse}</strong>
                  <small>{assignment.race} / {assignment.owner}</small>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="jockey-card jockey-result-card">
          <div className="jockey-card__header">
            <div>
              <span className="jockey-kicker">Latest result</span>
              <h2>{latestResult.race}</h2>
            </div>
            <Trophy size={20} />
          </div>
          <img src={celebrationImages[0]} alt="Jockey celebration after race result" />
          <div className="jockey-result-card__stats">
            <div><span>Finish</span><strong>#{latestResult.position}</strong></div>
            <div><span>Time</span><strong>{latestResult.time}</strong></div>
            <div><span>Prize</span><strong>{latestResult.prize}</strong></div>
          </div>
        </article>
      </section>

      <section className="jockey-race-strip">
        {jockeySchedule.map((race) => (
          <article className="jockey-race-strip__item" key={race.id}>
            <div><Clock3 size={16} /><span>{race.time}</span></div>
            <strong>{race.race}</strong>
            <small><Flag size={13} /> {race.horse}</small>
            <span className={`jockey-badge ${statusClass(race.status)}`}>{race.status}</span>
          </article>
        ))}
      </section>
    </div>
  );
}

export default JockeyDashboard;
