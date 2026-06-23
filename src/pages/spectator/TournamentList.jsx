import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, CircleDollarSign, Flag, Gauge, RefreshCw, SearchX, Trophy, UsersRound } from "lucide-react";
import SearchFilterBar from "../../components/SearchFilterBar.jsx";
import LoadingSkeleton from "../../components/LoadingSkeleton.jsx";
import { useSpectatorTournaments } from "./useSpectatorData.js";
import "./spectator.css";

const TournamentCard = ({ tournament }) => {
  const statusMeta = {
    Active: { label: "Active", className: "tournament-status--active" },
    Upcoming: { label: "Upcoming", className: "tournament-status--upcoming" },
    Completed: { label: "Closed", className: "tournament-status--completed" },
  };
  const status = statusMeta[tournament.status] ?? statusMeta.Completed;

  return (
    <article className="tournament-card tournament-card--redesign">
      <Link className="tournament-card__image" to={`/spectator/tournaments/${tournament.id}`}>
        <img src={tournament.image} alt={tournament.name} />
        <span className={`tournament-card__status ${status.className}`}>
          {status.label}
        </span>
      </Link>

      <div className="tournament-card__body">
        <h3>{tournament.name}</h3>
        <p>{tournament.location}</p>
      </div>

      <div className="tournament-card__meta">
        <div>
          <Calendar size={14} /> <span>{tournament.date}</span>
        </div>
        <div>
          <Flag size={14} /> <span>{tournament.track && tournament.distance ? `${tournament.track} - ${tournament.distance}` : "Race details not published"}</span>
        </div>
        <div>
          <UsersRound size={14} /> <span>{tournament.entries === null ? "Entry count unavailable" : `${tournament.entries} entries`}</span>
        </div>
        <div>
          <Gauge size={14} /> <span>Open schedule for race data</span>
        </div>
      </div>

      <div className="tournament-card__footer">
        <span><Trophy size={15} /> {tournament.prize || "Prize not published"}</span>
        <Link className="tournament-card__link" to={`/spectator/tournaments/${tournament.id}`} aria-label={`View ${tournament.name}`}>
          <ArrowRight size={18} />
        </Link>
      </div>
    </article>
  );
};

const TournamentList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const { tournaments, isLoading, error, reload } = useSpectatorTournaments();

  const counts = tournaments.reduce(
    (acc, tournament) => {
      acc[tournament.status.toLowerCase()] += 1;
      return acc;
    },
    { active: 0, upcoming: 0, completed: 0 }
  );

  const activePrizePool = tournaments
    .filter((tournament) => tournament.status === "Active")
    .reduce((sum, tournament) => sum + Number(String(tournament.prize || "").replace(/[^0-9.]/g, "")), 0);

  const statusOrder = { Active: 0, Upcoming: 1, Completed: 2 };

  const filteredTournaments = tournaments.filter(t => {
    const haystack = `${t.name} ${t.location} ${t.track} ${t.date}`.toLowerCase();
    const matchesSearch = haystack.includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || t.status.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return new Date(a.date) - new Date(b.date);
  });

  if (isLoading) {
    return <div className="spectator-page tournament-hub-page"><LoadingSkeleton ariaLabel="Loading tournament board" rows={6} variant="cards" /></div>;
  }

  return (
    <div className="spectator-page tournament-hub-page">
      {error && (
        <section className="admin-live-state admin-live-state--warning spectator-api-state" aria-live="polite">
          <span>{error}</span>
          <button type="button" onClick={reload}><RefreshCw size={15} /> Retry</button>
        </section>
      )}

      <section className="tournament-board-header">
        <div>
          <p className="spectator-eyebrow">Tournament Board</p>
          <h1>Find a race worth backing.</h1>
          <p>
            Scan prize pool, field size, track surface, distance, and market status before opening a tournament.
          </p>
        </div>

        <div className="tournament-board-metrics">
          <article className="tournament-metric tournament-metric--active">
            <Trophy size={18} />
            <strong>{counts.active}</strong>
            <span>Active</span>
          </article>
          <article className="tournament-metric tournament-metric--upcoming">
            <Calendar size={18} />
            <strong>{counts.upcoming}</strong>
            <span>Upcoming</span>
          </article>
          <article className="tournament-metric tournament-metric--pool">
            <CircleDollarSign size={18} />
            <strong>{activePrizePool ? `$${(activePrizePool / 1000000).toFixed(1)}M` : "-"}</strong>
            <span>Pools</span>
          </article>
          <article className="tournament-metric tournament-metric--entries">
            <UsersRound size={18} />
            <strong>{tournaments.reduce((sum, tournament) => sum + (Number(tournament.entries) || 0), 0) || "-"}</strong>
            <span>Entries</span>
          </article>
        </div>
      </section>

      <section className="tournament-filter-panel">
        <div className="tournament-filter-panel__header">
          <span>Tournament Board</span>
          <strong>{filteredTournaments.length}</strong>
        </div>

        <SearchFilterBar
          onSearch={setSearchQuery}
          onFilterChange={setFilter}
          initialValue={searchQuery}
          placeholder="Search tournament, city, track, or date..."
        />
      </section>

      <div className="tournament-grid">
        {filteredTournaments.length > 0 ? (
          filteredTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)
        ) : (
          <div className="spectator-empty-state">
            <SearchX size={22} />
            <span>{error ? "Tournament data is unavailable right now." : tournaments.length ? "No tournaments found matching your search." : "No tournaments have been published yet."}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentList;
