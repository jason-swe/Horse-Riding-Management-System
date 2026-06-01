import { useMemo, useState } from "react";
import { Award, BadgeCheck, Clock3, Flag, Trophy } from "lucide-react";
import {
  celebrationImages,
  jockeyProfile,
  jockeyResults,
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

const finishLabel = (position) => {
  if (position === 1) return "Winner";
  if (position === 2) return "Runner-up";
  if (position === 3) return "Podium";
  return `Place ${position}`;
};

function JockeyResults() {
  const [filter, setFilter] = useState("All");

  const visibleResults = useMemo(() => {
    return jockeyResults.filter((result) => {
      if (filter === "Wins") return result.position === 1;
      if (filter === "Podiums") return result.position <= 3;
      if (filter === "Published") return result.status === "Published";
      return true;
    });
  }, [filter]);

  const bestResult = jockeyResults.reduce((best, result) => (
    result.position < best.position ? result : best
  ), jockeyResults[0]);
  const podiumCount = jockeyResults.filter((result) => result.position <= 3).length;
  const winCount = jockeyResults.filter((result) => result.position === 1).length;

  return (
    <div className="jockey-results-page">
      <section className="jockey-results-hero">
        <img src={celebrationImages[1]} alt="Jockey celebrating a published race result" />
        <div className="jockey-results-hero__copy">
          <p className="jockey-kicker">Performance results</p>
          <h1>Read the season through finish, pace, and prize.</h1>
          <p>Review published race outcomes with clean finish ranking, horse context, official time, and earned prize money.</p>
        </div>
        <aside className="jockey-results-hero__panel">
          <span className="jockey-badge jockey-badge--green"><Trophy size={14} /> Best finish</span>
          <strong>#{bestResult.position}</strong>
          <p>{bestResult.race} / {bestResult.horse}</p>
        </aside>
      </section>

      <section className="jockey-results-stats" aria-label="Jockey result summary">
        {[
          { label: "Season earnings", value: jockeyProfile.earnings, note: "Published purse", icon: Award },
          { label: "Win rate", value: jockeyProfile.winRate, note: `${winCount} season win`, icon: Trophy },
          { label: "Podium rate", value: jockeyProfile.podiumRate, note: `${podiumCount} top-three finishes`, icon: BadgeCheck },
          { label: "Best time", value: bestResult.time, note: bestResult.horse, icon: Clock3 },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article className="jockey-results-stat" key={item.label}>
              <Icon size={18} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          );
        })}
      </section>

      <section className="jockey-results-layout">
        <aside className="jockey-results-feature">
          <img src={celebrationImages[0]} alt="Jockey after winning a race" />
          <div>
            <span className="jockey-kicker">Latest result</span>
            <h2>{jockeyResults[0].race}</h2>
            <p>{jockeyResults[0].horse} finished #{jockeyResults[0].position} with an official time of {jockeyResults[0].time}.</p>
          </div>
          <div className="jockey-results-feature__metrics">
            <div><span>Finish</span><strong>#{jockeyResults[0].position}</strong></div>
            <div><span>Prize</span><strong>{jockeyResults[0].prize}</strong></div>
          </div>
        </aside>

        <article className="jockey-results-board">
          <div className="jockey-results-board__header">
            <div>
              <span className="jockey-kicker">Official ledger</span>
              <h2>{filter === "All" ? "All published results" : `${filter} results`}</h2>
            </div>
            <div className="jockey-segmented">
              {["All", "Wins", "Podiums", "Published"].map((item) => (
                <button className={filter === item ? "jockey-segmented__active" : ""} key={item} onClick={() => setFilter(item)} type="button">
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="jockey-results-list">
            {visibleResults.map((result) => (
              <article className="jockey-results-row" key={result.id}>
                <div className="jockey-results-row__date">
                  <span>{result.date.split(" ")[0]}</span>
                  <strong>{result.date.split(" ")[1]}</strong>
                </div>

                <div className="jockey-results-row__main">
                  <span className="jockey-kicker">{result.id}</span>
                  <h3>{result.race}</h3>
                  <p><Flag size={13} /> {result.horse} / {finishLabel(result.position)}</p>
                </div>

                <div className="jockey-results-row__metrics" aria-label={`${result.race} metrics`}>
                  <div><span>Finish</span><strong>#{result.position}</strong></div>
                  <div><span>Time</span><strong>{result.time}</strong></div>
                  <div><span>Prize</span><strong>{result.prize}</strong></div>
                </div>

                <span className={`jockey-badge ${statusClass(result.status)}`}>{result.status}</span>
              </article>
            ))}
          </div>

          {visibleResults.length === 0 && <div className="jockey-empty">No results match this filter.</div>}
        </article>
      </section>
    </div>
  );
}

export default JockeyResults;
