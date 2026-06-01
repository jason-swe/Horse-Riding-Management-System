import { useState } from "react";
import { Award, CircleDollarSign, Clock3, Flag, History, Medal, Timer, Trophy } from "lucide-react";
import DataTable from "../../components/DataTable.jsx";
import "./spectator.css";

const raceResults = [
  { position: 1, horse: "Thunderbolt", jockey: "Alex Rider", race: "Derby Trial", lane: 4, time: "1:10.42", margin: "Winner", status: "Official", reward: "+420 pts" },
  { position: 2, horse: "Silver Flash", jockey: "Chris Evans", race: "Derby Trial", lane: 2, time: "1:11.03", margin: "+0.61s", status: "Official", reward: "+180 pts" },
  { position: 3, horse: "Golden Gallop", jockey: "Elena Gilbert", race: "Derby Trial", lane: 7, time: "1:11.88", margin: "+1.46s", status: "Official", reward: "-" },
  { position: 4, horse: "Midnight Run", jockey: "David Miller", race: "Derby Trial", lane: 1, time: "1:12.21", margin: "+1.79s", status: "Review", reward: "-" },
];

const history = [
  { race: "Kentucky Derby Classic", pick: "Thunderbolt", result: "Won", amount: "200 pts", odds: "2.10x", reward: "420 pts", settled: "12 May, 19:42" },
  { race: "Royal Ascot Qualifier", pick: "Storm Chaser", result: "Lost", amount: "120 pts", odds: "3.40x", reward: "0 pts", settled: "09 May, 21:18" },
  { race: "Dubai Sprint Heat", pick: "Silver Flash", result: "Won", amount: "150 pts", odds: "2.40x", reward: "360 pts", settled: "04 May, 20:05" },
];

const summaryStats = [
  { label: "Published races", value: "24", detail: "+3 this week", icon: Flag },
  { label: "Fastest time", value: "1:10.42", detail: "Thunderbolt", icon: Timer },
  { label: "Rewards paid", value: "960 pts", detail: "Settled wallet", icon: CircleDollarSign },
  { label: "Hit rate", value: "47.2%", detail: "Last 30 picks", icon: Award },
];

const Results = () => {
  const [view, setView] = useState("results");
  const latestWinner = raceResults[0];
  const winningBets = history.filter((item) => item.result === "Won").length;
  const visibleRows = view === "results" ? raceResults : history;

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
    { header: "Reward", field: "reward", render: (row) => <span className="results-reward">{row.reward}</span> },
  ];

  const historyColumns = [
    { header: "Race", field: "race" },
    { header: "Pick", field: "pick", render: (row) => (
      <span className="results-competitor">
        <strong>{row.pick}</strong>
        <small>Odds {row.odds}</small>
      </span>
    ) },
    { header: "Result", field: "result", render: (row) => (
      <span className={`results-status ${row.result === "Won" ? "results-status--won" : "results-status--lost"}`}>{row.result}</span>
    ) },
    { header: "Amount", field: "amount" },
    { header: "Reward", field: "reward", render: (row) => <span className="results-reward">{row.reward}</span> },
    { header: "Settled", field: "settled" },
  ];

  return (
    <section className="spectator-page results-page">
      <div className="results-hero">
        <div className="results-hero__copy">
          <p className="spectator-eyebrow">Official results</p>
          <h1 className="results-title">Race standings with the reward trail attached.</h1>
          <p className="results-copy">
            Track final standings, confirmed times, and your reward history after each published race.
          </p>
          <div className="results-hero__meta" aria-label="Latest result summary">
            <span><Clock3 size={15} /> Published 18 minutes ago</span>
            <span><Trophy size={15} /> {latestWinner.horse}</span>
            <span><Medal size={15} /> {winningBets} winning slips</span>
          </div>
        </div>
        <aside className="results-winner-card" aria-label="Latest winner">
          <span className="results-winner-card__label">Latest winner</span>
          <strong>{latestWinner.horse}</strong>
          <p>{latestWinner.race} / lane {latestWinner.lane} / official time {latestWinner.time}</p>
          <div className="results-winner-card__footer">
            <span className="results-status results-status--official">Published</span>
            <span>{latestWinner.reward}</span>
          </div>
        </aside>
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
              <span>{raceResults.length}</span>
            </button>
            <button className={`results-tab ${view === "history" ? "results-tab--active" : ""}`} type="button" onClick={() => setView("history")}>
              <History size={16} />
              Betting history
              <span>{history.length}</span>
            </button>
          </div>
        </div>

        <DataTable
          columns={view === "results" ? resultColumns : historyColumns}
          data={visibleRows}
          emptyMessage="No results available."
        />
      </div>
    </section>
  );
};

export default Results;
