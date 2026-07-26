import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  XCircle,
  MapPin,
  Trophy,
} from "lucide-react";
import LoadingSkeleton from "../../components/LoadingSkeleton.jsx";
import {
  jockeyActionImages,
  jockeyTrackImages,
} from "./jockeyData";
import { useJockeyApiData } from "./useJockeyApiData";

const statusClass = (status) => {
  if (["Accepted", "Confirmed", "Published", "Complete", "Available"].includes(status)) {
    return "jockey-badge--green";
  }
  if (["Rejected", "Expired"].includes(status)) {
    return "jockey-badge--muted";
  }
  return "jockey-badge--amber";
};

function JockeySchedule() {
  const [filter, setFilter] = useState("All");
  const { error, isLoading, schedule } = useJockeyApiData();

  const visibleRaces = useMemo(
    () => schedule.filter((race) => filter === "All" || race.status === filter),
    [filter, schedule]
  );

  const acceptedCount = schedule.filter((race) => race.status === "Accepted").length;
  const completeCount = schedule.filter((race) => race.status === "Complete").length;
  const pendingCount = schedule.filter((race) => race.status === "Pending").length;
  const rejectedCount = schedule.filter((race) => race.status === "Rejected").length;
  const nextRace = visibleRaces[0] ?? schedule[0];

  if (isLoading) {
    return <div className="jockey-schedule-page"><LoadingSkeleton ariaLabel="Loading race schedule" rows={5} variant="list" /></div>;
  }

  return (
    <div className="jockey-schedule-page">
      {error && (
        <div className={`jockey-sync-note ${error ? "jockey-sync-note--warning" : ""}`}>
          {error}
        </div>
      )}
      <section className="jockey-schedule-hero">
        <img src={jockeyTrackImages[3]} alt="Race track schedule view for jockey" />
        <div className="jockey-schedule-hero__copy">
          <p className="jockey-kicker">Race schedule</p>
          <h1>Know every start before the gate opens.</h1>
          <p>Track accepted rides, pending slots, venue details, and horse pairings in a personal race-day calendar.</p>
        </div>
        <aside className="jockey-schedule-hero__panel">
          {nextRace ? (
            <>
              <span className={`jockey-badge ${statusClass(nextRace.status)}`}>{nextRace.status}</span>
              <strong>{nextRace.race}</strong>
              <p>{nextRace.time} / {nextRace.venue}</p>
            </>
          ) : (
            <>
              <span className="jockey-badge jockey-badge--muted">Clear</span>
              <strong>No scheduled race</strong>
              <p>Accepted assignments will appear on this board.</p>
            </>
          )}
        </aside>
      </section>

      <section className="jockey-schedule-stats" aria-label="Schedule summary">
        {[
          { label: "All slots", value: schedule.length, note: "Personal race windows", icon: CalendarDays },
          { label: "Accepted", value: acceptedCount, note: "Locked rides", icon: BadgeCheck },
          { label: "Complete", value: completeCount, note: "Published results", icon: Trophy },
          { label: "Pending", value: pendingCount, note: "Awaiting decision", icon: ClipboardCheck },
          { label: "Rejected", value: rejectedCount, note: "Declined slots", icon: XCircle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article className="jockey-schedule-stat" key={item.label}>
              <Icon size={18} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          );
        })}
      </section>

      <section className="jockey-schedule-board">
        <div className="jockey-schedule-board__header">
          <div>
            <span className="jockey-kicker">Race-day board</span>
            <h2>{filter === "All" ? "All race slots" : `${filter} race slots`}</h2>
          </div>
          <div className="jockey-segmented">
            {["All", "Accepted", "Complete", "Pending", "Rejected", "Cancelled"].map((item) => (
              <button className={filter === item ? "jockey-segmented__active" : ""} key={item} onClick={() => setFilter(item)} type="button">
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="jockey-schedule-list">
          {visibleRaces.map((race, index) => {
            const [date, time] = race.time.split(", ");
            return (
              <article className="jockey-schedule-slot" key={race.id}>
                <div className="jockey-schedule-slot__media">
                  <img src={jockeyActionImages[index % jockeyActionImages.length]} alt={`${race.race} schedule`} />
                  <span className={`jockey-badge ${statusClass(race.status)}`}>{race.status}</span>
                </div>

                <div className="jockey-schedule-slot__body">
                  <div className="jockey-schedule-slot__time">
                    <span>{date}</span>
                    <strong>{time}</strong>
                  </div>

                  <div className="jockey-schedule-slot__race">
                    <span className="jockey-kicker">{race.id} / {race.round}</span>
                    <h3>{race.race}</h3>
                    <small><MapPin size={13} /> {race.venue}</small>
                  </div>

                  <div className="jockey-schedule-slot__meta">
                    <div><span>Horse</span><strong>{race.horse}</strong></div>
                    <div><span>Tournament</span><strong>{race.tournament}</strong></div>
                  </div>

                  <div className="jockey-schedule-slot__footer">
                    <small><Clock3 size={13} /> Rider check-in opens 45 minutes before start.</small>
                    <Trophy size={18} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {visibleRaces.length === 0 && <div className="jockey-empty">No race slots match this filter.</div>}
      </section>
    </div>
  );
}

export default JockeySchedule;
