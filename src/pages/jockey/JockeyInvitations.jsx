import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  horseJockeyImages,
  jockeyActionImages,
  jockeyInvitations,
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

function JockeyInvitations() {
  const [filter, setFilter] = useState("All");
  const [invitations, setInvitations] = useState(jockeyInvitations);

  const visibleInvitations = useMemo(
    () => invitations.filter((invite) => filter === "All" || invite.status === filter),
    [filter, invitations]
  );

  const pendingCount = invitations.filter((invite) => invite.status === "Pending").length;
  const acceptedCount = invitations.filter((invite) => invite.status === "Accepted").length;
  const rejectedCount = invitations.filter((invite) => invite.status === "Rejected").length;
  const featuredInvite = invitations.find((invite) => invite.status === "Pending") ?? invitations[0];

  const updateInvitation = (id, status) => {
    setInvitations((current) => current.map((invite) => (invite.id === id ? { ...invite, status } : invite)));
  };

  return (
    <div className="jockey-invitations-page">
      <section className="jockey-invitations-hero">
        <img src={jockeyActionImages[2]} alt="Jockey riding during a race invitation decision" />
        <div className="jockey-invitations-hero__copy">
          <p className="jockey-kicker">Invitation room</p>
          <h1>Accept only the rides that fit race day.</h1>
          <p>Review owner requests, horse context, venue, and race timing before locking your availability.</p>
        </div>
        <aside className="jockey-invitations-hero__panel">
          <span className={`jockey-badge ${statusClass(featuredInvite.status)}`}>{featuredInvite.status}</span>
          <strong>{featuredInvite.horse}</strong>
          <p>{featuredInvite.race} / {featuredInvite.date}</p>
        </aside>
      </section>

      <section className="jockey-invitation-stats" aria-label="Invitation summary">
        {[
          { label: "Pending", value: pendingCount, note: "Waiting for your response", icon: Send },
          { label: "Accepted", value: acceptedCount, note: "Added to race plan", icon: CheckCircle2 },
          { label: "Rejected", value: rejectedCount, note: "Declined locally", icon: XCircle },
          { label: "Total invites", value: invitations.length, note: "Owner requests", icon: CalendarDays },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article className="jockey-invitation-stat" key={item.label}>
              <Icon size={18} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          );
        })}
      </section>

      <section className="jockey-invitation-board">
        <div className="jockey-invitation-board__header">
          <div>
            <span className="jockey-kicker">Decision board</span>
            <h2>{filter === "All" ? "All invitations" : `${filter} invitations`}</h2>
          </div>
          <div className="jockey-segmented">
            {["All", "Pending", "Accepted", "Rejected"].map((item) => (
              <button className={filter === item ? "jockey-segmented__active" : ""} key={item} onClick={() => setFilter(item)} type="button">
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="jockey-invitation-list">
          {visibleInvitations.map((invite, index) => (
            <article className="jockey-invitation-card" key={invite.id}>
              <div className="jockey-invitation-card__media">
                <img src={horseJockeyImages[index % horseJockeyImages.length]} alt={`${invite.horse} invitation pairing`} />
                <span className={`jockey-badge ${statusClass(invite.status)}`}>{invite.status}</span>
              </div>

              <div className="jockey-invitation-card__body">
                <div className="jockey-invitation-card__title">
                  <div>
                    <span className="jockey-kicker">{invite.id}</span>
                    <h3>{invite.horse}</h3>
                  </div>
                  <strong>{invite.owner}</strong>
                </div>

                <p>{invite.note}</p>

                <div className="jockey-invitation-meta">
                  <div><span>Race</span><strong>{invite.race}</strong></div>
                  <div><span>Tournament</span><strong>{invite.tournament}</strong></div>
                  <div><span><Clock3 size={13} /> Time</span><strong>{invite.date}</strong></div>
                  <div><span><MapPin size={13} /> Venue</span><strong>{invite.venue}</strong></div>
                </div>

                <div className="jockey-invitation-card__actions">
                  <button className="jockey-button" disabled={invite.status === "Rejected"} onClick={() => updateInvitation(invite.id, "Rejected")} type="button">
                    <XCircle size={17} /> Reject
                  </button>
                  <button className="jockey-button jockey-button--primary" disabled={invite.status === "Accepted"} onClick={() => updateInvitation(invite.id, "Accepted")} type="button">
                    <ShieldCheck size={17} /> Accept
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {visibleInvitations.length === 0 && <div className="jockey-empty">No invitations match this filter.</div>}
      </section>
    </div>
  );
}

export default JockeyInvitations;
