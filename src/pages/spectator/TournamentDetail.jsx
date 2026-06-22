import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Flag,
  MapPin,
  Radio,
  Trophy,
  UsersRound,
} from "lucide-react";
import LoadingSkeleton from "../../components/LoadingSkeleton.jsx";
import raceHubImage from "../../img/img_horse03.png";
import { useSpectatorTournamentDetail } from "./useSpectatorData.js";
import {
  BETTING_STATUS,
  RACE_STATUS,
  bettingStatusMeta,
  canBetOnRace,
  getRaceSortWeight,
  raceStatusMeta,
} from "./race/raceStatus.js";
import "./spectator.css";

const FILTERS = [
  { id: "all", label: "All races" },
  { id: "betting", label: "Betting open" },
  { id: "live", label: "Live" },
  { id: "completed", label: "Completed" },
];

const tournamentStatusClass = {
  Active: "spectator-badge--green",
  Upcoming: "spectator-badge--amber",
  Completed: "",
};

function raceMatchesFilter(race, filter) {
  if (filter === "betting") return race.bettingStatus === BETTING_STATUS.OPEN;
  if (filter === "live") return race.raceStatus === RACE_STATUS.RUNNING;
  if (filter === "completed") return race.raceStatus === RACE_STATUS.COMPLETED;
  return true;
}

function RaceStatusBadge({ status, type }) {
  const meta = type === "betting"
    ? bettingStatusMeta[status] || bettingStatusMeta[BETTING_STATUS.UNAVAILABLE]
    : raceStatusMeta[status] || raceStatusMeta[RACE_STATUS.UNKNOWN];

  return <span className={`race-hub-status race-hub-status--${meta.tone}`}>{meta.label}</span>;
}

function RaceRow({ race, tournament }) {
  const canBet = canBetOnRace(race);
  const detailPath = `/spectator/tournaments/${tournament.id}/races/${race.id}`;
  const bettingPath = `/spectator/predictions/races/${encodeURIComponent(race.id)}`;

  return (
    <article className={`race-hub-row race-hub-row--${race.raceStatus}`}>
      <div className="race-hub-row__time">
        <span>{race.time}</span>
        <small>{race.roundName || "Tournament race"}</small>
      </div>

      <div className="race-hub-row__identity">
        <div className="race-hub-row__status-line">
          <RaceStatusBadge status={race.raceStatus} type="race" />
          <RaceStatusBadge status={race.bettingStatus} type="betting" />
        </div>
        <h3>{race.name}</h3>
        <div className="race-hub-row__meta">
          <span><Flag size={14} /> {race.distance}</span>
          <span><MapPin size={14} /> {race.location || tournament.location}</span>
          <span><UsersRound size={14} /> {race.runnerCount || 0}/{race.maxParticipants || "-"} runners</span>
        </div>
      </div>

      <div className="race-hub-row__actions">
        <Link className="race-hub-action race-hub-action--secondary" to={detailPath}>
          {race.raceStatus === RACE_STATUS.RUNNING ? "Watch race" : race.raceStatus === RACE_STATUS.COMPLETED ? "View result" : "View race"}
          <ArrowRight size={15} />
        </Link>
        {canBet && (
          <Link className="race-hub-action race-hub-action--primary" to={bettingPath}>
            Bet now <CircleDollarSign size={16} />
          </Link>
        )}
      </div>
    </article>
  );
}

function TournamentDetail() {
  const { tournamentId } = useParams();
  const { error, isLoading, races, tournament, usedFallback } = useSpectatorTournamentDetail(tournamentId);
  const [activeFilter, setActiveFilter] = useState("all");

  const sortedRaces = useMemo(() => [...races].sort((a, b) => {
    const weight = getRaceSortWeight(a) - getRaceSortWeight(b);
    if (weight !== 0) return weight;
    return new Date(a.raceDate || 0).getTime() - new Date(b.raceDate || 0).getTime();
  }), [races]);

  const counts = useMemo(() => ({
    all: races.length,
    betting: races.filter((race) => race.bettingStatus === BETTING_STATUS.OPEN).length,
    live: races.filter((race) => race.raceStatus === RACE_STATUS.RUNNING).length,
    completed: races.filter((race) => race.raceStatus === RACE_STATUS.COMPLETED).length,
  }), [races]);

  const visibleRaces = sortedRaces.filter((race) => raceMatchesFilter(race, activeFilter));

  if (isLoading) {
    return (
      <section className="spectator-page tournament-detail-page">
        <LoadingSkeleton ariaLabel="Loading tournament race hub" rows={5} variant="detail" />
        <LoadingSkeleton ariaLabel="Loading tournament races" rows={5} variant="list" />
      </section>
    );
  }

  if (!tournament) return <Navigate to="/spectator/tournaments" replace />;

  return (
    <section className="spectator-page tournament-detail-page tournament-race-hub">
      <Link className="tournament-detail-back" to="/spectator/tournaments">
        <ArrowLeft size={16} /> Back to tournaments
      </Link>

      {(error || usedFallback) && (
        <section className={`admin-live-state ${error ? "admin-live-state--warning" : ""}`} aria-live="polite">
          {error ? "Live race data could not be refreshed. Showing the saved race schedule." : "Showing the saved race schedule until live tournament race data is available."}
        </section>
      )}

      <header className="race-hub-header">
        <div className="race-hub-header__media">
          <img src={raceHubImage} alt={`Race horses at ${tournament.name}`} />
        </div>
        <div className="race-hub-header__body">
          <div className="race-hub-header__topline">
            <span className={`spectator-badge ${tournamentStatusClass[tournament.status] || ""}`}>{tournament.status}</span>
            <span>{races.length} scheduled races</span>
          </div>
          <p className="spectator-eyebrow">Tournament race hub</p>
          <h1>{tournament.name}</h1>
          <dl className="race-hub-header__facts">
            <div><dt><MapPin size={15} /> Venue</dt><dd>{tournament.location}</dd></div>
            <div><dt><CalendarDays size={15} /> Race day</dt><dd>{tournament.date}</dd></div>
            <div><dt><Flag size={15} /> Surface</dt><dd>{tournament.track}</dd></div>
            <div><dt><Trophy size={15} /> Prize pool</dt><dd>{tournament.prize}</dd></div>
          </dl>
        </div>
      </header>

      <section className="race-hub-overview" aria-label="Tournament race summary">
        <div><span>All races</span><strong>{counts.all}</strong><small>Published schedule</small></div>
        <div><span>Betting open</span><strong>{counts.betting}</strong><small>Backend market open</small></div>
        <div><span>Live now</span><strong>{counts.live}</strong><small>Currently running</small></div>
        <div><span>Completed</span><strong>{counts.completed}</strong><small>Finished races</small></div>
      </section>

      <section className="race-hub-schedule">
        <div className="race-hub-schedule__heading">
          <div>
            <span><Clock3 size={15} /> Race schedule</span>
            <h2>Every race in this tournament</h2>
          </div>
        </div>

        <div className="race-hub-filters" role="tablist" aria-label="Filter tournament races">
          {FILTERS.map((filter) => (
            <button
              aria-selected={activeFilter === filter.id}
              className={activeFilter === filter.id ? "is-active" : ""}
              key={filter.id}
              role="tab"
              type="button"
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.id === "live" && <Radio size={14} />}
              <span>{filter.label}</span>
              <b>{counts[filter.id]}</b>
            </button>
          ))}
        </div>

        <div className="race-hub-list">
          {visibleRaces.length ? visibleRaces.map((race) => (
            <RaceRow key={race.id || race.name} race={race} tournament={tournament} />
          )) : (
            <div className="race-hub-empty" role="status">
              <Flag size={22} />
              <strong>No races match this filter</strong>
              <span>Choose another status to review the full tournament schedule.</span>
              <button type="button" onClick={() => setActiveFilter("all")}>Show all races</button>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}

export default TournamentDetail;
