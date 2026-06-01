import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  ClipboardCheck,
  Flag,
  Home,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  horseJockeyImages,
  jockeyAssignments,
  jockeyProfile,
  jockeyTrackImages,
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

function JockeyAssignments() {
  const [filter, setFilter] = useState("All");

  const visibleAssignments = useMemo(
    () => jockeyAssignments.filter((assignment) => filter === "All" || assignment.status === filter),
    [filter]
  );

  const confirmedCount = jockeyAssignments.filter((assignment) => assignment.status === "Confirmed").length;
  const pendingCount = jockeyAssignments.filter((assignment) => assignment.status === "Pending").length;
  const reviewCount = jockeyAssignments.filter((assignment) => assignment.status === "Review").length;
  const featuredAssignment = visibleAssignments[0] ?? jockeyAssignments[0];

  return (
    <div className="jockey-assignments-page">
      <section className="jockey-assignments-hero">
        <img src={horseJockeyImages[1]} alt="Jockey and horse pairing in stable lane" />
        <div className="jockey-assignments-hero__copy">
          <p className="jockey-kicker">Horse pairings</p>
          <h1>Keep every assignment race-ready.</h1>
          <p>Track the horses tied to your invitations, owner context, race targets, and pairing status before you commit to the gate.</p>
        </div>
        <aside className="jockey-assignments-hero__panel">
          <span className={`jockey-badge ${statusClass(featuredAssignment.status)}`}>{featuredAssignment.status}</span>
          <strong>{featuredAssignment.horse}</strong>
          <p>{featuredAssignment.race} / {featuredAssignment.owner}</p>
        </aside>
      </section>

      <section className="jockey-assignment-stats" aria-label="Assignment summary">
        {[
          { label: "All pairings", value: jockeyAssignments.length, note: "Horse assignments", icon: Home },
          { label: "Confirmed", value: confirmedCount, note: "Ready to ride", icon: BadgeCheck },
          { label: "Pending", value: pendingCount, note: "Needs response", icon: ClipboardCheck },
          { label: "Review", value: reviewCount, note: "Owner follow-up", icon: Flag },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article className="jockey-assignment-stat" key={item.label}>
              <Icon size={18} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          );
        })}
      </section>

      <section className="jockey-assignment-layout">
        <aside className="jockey-assignment-profile">
          <img src={jockeyTrackImages[1]} alt="Race track context for jockey assignments" />
          <div>
            <span className="jockey-badge jockey-badge--green"><ShieldCheck size={14} /> {jockeyProfile.status}</span>
            <strong>{jockeyProfile.name}</strong>
            <p>{jockeyProfile.stableConnection} / {jockeyProfile.weightClass}</p>
          </div>
        </aside>

        <article className="jockey-assignment-board">
          <div className="jockey-assignment-board__header">
            <div>
              <span className="jockey-kicker">Assignment board</span>
              <h2>{filter === "All" ? "All horse pairings" : `${filter} pairings`}</h2>
            </div>
            <div className="jockey-segmented">
              {["All", "Confirmed", "Pending", "Review"].map((item) => (
                <button className={filter === item ? "jockey-segmented__active" : ""} key={item} onClick={() => setFilter(item)} type="button">
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="jockey-assignment-card-list">
            {visibleAssignments.map((assignment, index) => (
              <article className="jockey-assignment-card" key={assignment.id}>
                <div className="jockey-assignment-card__media">
                  <img src={horseJockeyImages[index % horseJockeyImages.length]} alt={`${assignment.horse} horse assignment`} />
                  <span className={`jockey-badge ${statusClass(assignment.status)}`}>{assignment.status}</span>
                </div>

                <div className="jockey-assignment-card__body">
                  <div className="jockey-assignment-card__title">
                    <div>
                      <span className="jockey-kicker">{assignment.id}</span>
                      <h3>{assignment.horse}</h3>
                    </div>
                    <strong>{assignment.owner}</strong>
                  </div>

                  <p>{assignment.note}</p>

                  <div className="jockey-assignment-meta">
                    <div><span><CalendarDays size={13} /> Race target</span><strong>{assignment.race}</strong></div>
                    <div><span><UserRound size={13} /> Rider role</span><strong>{jockeyProfile.license}</strong></div>
                    <div><span><Home size={13} /> Stable link</span><strong>{assignment.owner}</strong></div>
                    <div><span><ShieldCheck size={13} /> Pairing state</span><strong>{assignment.status}</strong></div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {visibleAssignments.length === 0 && <div className="jockey-empty">No assignments match this filter.</div>}
        </article>
      </section>
    </div>
  );
}

export default JockeyAssignments;
