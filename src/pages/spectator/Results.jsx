import { useState } from "react";
import DataTable from "../../components/DataTable.jsx";
import "./spectator.css";

const raceResults = [
  { position: 1, horse: "Thunderbolt", jockey: "Alex Rider", race: "Derby Trial", time: "1:10.42", reward: "+420 pts" },
  { position: 2, horse: "Silver Flash", jockey: "Chris Evans", race: "Derby Trial", time: "1:11.03", reward: "+180 pts" },
  { position: 3, horse: "Golden Gallop", jockey: "Elena Gilbert", race: "Derby Trial", time: "1:11.88", reward: "-" },
  { position: 4, horse: "Midnight Run", jockey: "David Miller", race: "Derby Trial", time: "1:12.21", reward: "-" },
];

const history = [
  { race: "Kentucky Derby Classic", pick: "Thunderbolt", result: "Won", amount: "200 pts", reward: "420 pts" },
  { race: "Royal Ascot Qualifier", pick: "Storm Chaser", result: "Lost", amount: "120 pts", reward: "0 pts" },
  { race: "Dubai Sprint Heat", pick: "Silver Flash", result: "Won", amount: "150 pts", reward: "360 pts" },
];

const Results = () => {
  const [view, setView] = useState("results");

  const resultColumns = [
    { header: "Pos", field: "position", render: (row) => <strong style={{ color: row.position === 1 ? "#ffd56a" : "#EEE7D4" }}>#{row.position}</strong> },
    { header: "Horse", field: "horse" },
    { header: "Jockey", field: "jockey" },
    { header: "Race", field: "race" },
    { header: "Time", field: "time" },
    { header: "Reward", field: "reward" },
  ];

  const historyColumns = [
    { header: "Race", field: "race" },
    { header: "Pick", field: "pick" },
    { header: "Result", field: "result", render: (row) => (
      <span className={`spectator-badge ${row.result === "Won" ? "spectator-badge--green" : ""}`}>{row.result}</span>
    ) },
    { header: "Amount", field: "amount" },
    { header: "Reward", field: "reward" },
  ];

  return (
    <section className="spectator-page">
      <div className="spectator-hero">
        <div className="spectator-hero__content">
          <p className="spectator-eyebrow">Official Results</p>
          <h1 className="spectator-title">Race standings and prediction rewards in one place.</h1>
          <p className="spectator-copy">
            Track final standings, confirmed times, and your reward history after each published race.
          </p>
        </div>
        <aside className="spectator-hero__panel">
          <div className="spectator-live-card">
            <span className="spectator-meta">Latest Winner</span>
            <strong>Thunderbolt</strong>
            <span>Derby Trial - 1:10.42 official time</span>
            <span className="spectator-badge spectator-badge--green">Published</span>
          </div>
          <div className="spectator-live-card">
            <span className="spectator-meta">My Wins</span>
            <strong>18</strong>
            <span>Lifetime successful predictions</span>
          </div>
        </aside>
      </div>

      <div className="spectator-tabs" role="tablist" aria-label="Results views">
        <button className={`spectator-tab ${view === "results" ? "spectator-tab--active" : ""}`} type="button" onClick={() => setView("results")}>
          Race Results
        </button>
        <button className={`spectator-tab ${view === "history" ? "spectator-tab--active" : ""}`} type="button" onClick={() => setView("history")}>
          Betting History
        </button>
      </div>

      <DataTable
        columns={view === "results" ? resultColumns : historyColumns}
        data={view === "results" ? raceResults : history}
        emptyMessage="No results available."
      />
    </section>
  );
};

export default Results;
