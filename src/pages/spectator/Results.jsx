import { useState } from "react";
import { Award, Clock3, Flag, History, Medal, Timer, Trophy } from "lucide-react";
import DataTable from "../../components/DataTable.jsx";
import LoadingSkeleton from "../../components/LoadingSkeleton.jsx";
import { useSpectatorRaceResults } from "./useSpectatorData.js";
import "./spectator.css";

const Results = () => {
  const [view, setView] = useState("results");
  const { error, isLoading, results: liveResults } = useSpectatorRaceResults();
  const displayResults = liveResults;
  const latestWinner = displayResults.find((result) => Number(result.position) === 1) || null;
  const publishedRaceCount = new Set(displayResults.map((result) => result.raceId || result.race)).size;
  const scoredResults = displayResults.filter((result) => Number.isFinite(Number(result.score)));
  const timedResults = displayResults.filter((result) => Number.isFinite(Number(result.time)));
  const fastestResult = timedResults.reduce((fastest, result) => !fastest || Number(result.time) < Number(fastest.time) ? result : fastest, null);
  const summaryStats = [
    { label: "Published races", value: publishedRaceCount, detail: `${displayResults.length} official finishes`, icon: Flag },
    { label: "Fastest time", value: fastestResult?.time ?? "-", detail: fastestResult?.horse || "No timed result", icon: Timer },
    { label: "Result entries", value: displayResults.length, detail: "Published by Admin", icon: Medal },
    { label: "Scored entries", value: scoredResults.length, detail: "Backend final score", icon: Award },
  ];

  const resultColumns = [
    { header: "Pos", field: "position", render: (row) => (
      <strong className={row.position === 1 ? "results-rank results-rank--winner" : "results-rank"}>#{row.position}</strong>
    ) },
    { header: "Horse", field: "horse", render: (row) => (
      <span className="results-competitor">
        <strong>{row.horse}</strong>
        <small>Lane {row.lane} / {row.margin}</small>
      </span>
    ) },
    { header: "Jockey", field: "jockey" },
    { header: "Race", field: "race" },
    { header: "Time", field: "time", render: (row) => <span className="results-time">{row.time}</span> },
    { header: "Status", field: "status", render: (row) => (
      <span className={`results-status ${row.status === "Official" ? "results-status--official" : "results-status--review"}`}>
        {row.status}
      </span>
    ) },
    { header: "Score", field: "score", render: (row) => <span className="results-reward">{row.score}</span> },
  ];

  if (isLoading) {
    return <section className="spectator-page results-page"><LoadingSkeleton ariaLabel="Loading race results" rows={5} variant="table" /></section>;
  }

  return (
    <section className="spectator-page results-page">
      {error && (
        <section className="admin-live-state admin-live-state--warning" aria-live="polite">
          {error} No sample results are being substituted.
        </section>
      )}

      <div className="results-hero">
        <div className="results-hero__copy">
          <p className="spectator-eyebrow">Official results</p>
          <h1 className="results-title">Official race standings from the published ledger.</h1>
          <p className="results-copy">
            Track final positions, confirmed times, and backend scores after each result is published.
          </p>
          <div className="results-hero__meta" aria-label="Latest result summary">
            <span><Clock3 size={15} /> {latestWinner?.publishedAt ? `Published ${new Date(latestWinner.publishedAt).toLocaleDateString()}` : "Awaiting published result"}</span>
            <span><Trophy size={15} /> {latestWinner?.horse || "No winner yet"}</span>
            <span><Medal size={15} /> {displayResults.length} official finishes</span>
          </div>
        </div>
        {latestWinner ? (
          <aside className="results-winner-card" aria-label="Latest winner">
            <span className="results-winner-card__label">Latest winner</span>
            <strong>{latestWinner.horse}</strong>
            <p>{latestWinner.race} / lane {latestWinner.lane} / official time {latestWinner.time}</p>
            <div className="results-winner-card__footer">
              <span className="results-status results-status--official">Published</span>
              <span>{latestWinner.score === "-" ? "Score unavailable" : `${latestWinner.score} pts`}</span>
            </div>
          </aside>
        ) : (
          <aside className="results-winner-card" aria-label="No published winner">
            <span className="results-winner-card__label">Latest winner</span>
            <strong>No published results</strong>
            <p>Published race results will appear here after admin confirmation.</p>
          </aside>
        )}
      </div>

      <div className="results-summary" aria-label="Results summary">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article className="results-summary-card" key={stat.label}>
              <Icon size={18} />
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.detail}</small>
            </article>
          );
        })}
      </div>

      <div className="results-board">
        <div className="results-board__header">
          <div>
            <span className="results-kicker">{view === "results" ? "Race control" : "Wallet history"}</span>
            <h2>{view === "results" ? "Published race results" : "Settled prediction history"}</h2>
          </div>

          <div className="results-tabs" role="tablist" aria-label="Results views">
            <button className={`results-tab ${view === "results" ? "results-tab--active" : ""}`} type="button" onClick={() => setView("results")}>
              <Flag size={16} />
              Race results
              <span>{displayResults.length}</span>
            </button>
            <button className={`results-tab ${view === "history" ? "results-tab--active" : ""}`} type="button" onClick={() => setView("history")}>
              <History size={16} />
              Betting history
              <span>Unavailable</span>
            </button>
          </div>
        </div>

        {view === "results" ? (
          <DataTable columns={resultColumns} data={displayResults} emptyMessage="No published race results are available." />
        ) : (
          <div className="spectator-empty-state results-unavailable-state" role="status">
            <History size={22} />
            <strong>Betting history is unavailable</strong>
            <span>The backend does not expose bet submission, settlement, wallet, or history routes yet.</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default Results;
