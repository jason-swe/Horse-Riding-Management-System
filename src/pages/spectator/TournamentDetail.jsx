import { Link, Navigate, useParams } from "react-router-dom";
import { Calendar, Flag, MapPin, Trophy } from "lucide-react";
import { tournamentContenders, tournamentRaces, tournaments } from "./tournamentData.js";
import "./spectator.css";

const statusClass = {
  Active: "spectator-badge--green",
  Upcoming: "spectator-badge--amber",
  Completed: "",
};

const TournamentDetail = () => {
  const { tournamentId } = useParams();
  const tournament = tournaments.find((item) => item.id === Number(tournamentId));

  if (!tournament) {
    return <Navigate to="/spectator/tournaments" replace />;
  }

  return (
    <section className="spectator-page tournament-detail-page">
      <Link className="spectator-button tournament-detail-back" to="/spectator/tournaments">
        Back to Tournaments
      </Link>

      <div className="tournament-detail-hero">
        <div className="tournament-detail-hero__image">
          <img src={tournament.image} alt={tournament.name} />
        </div>
        <div className="tournament-detail-hero__content">
          <span className={`spectator-badge ${statusClass[tournament.status] ?? ""}`}>{tournament.status}</span>
          <h1 className="spectator-title">{tournament.name}</h1>
          <p className="spectator-copy">
            Follow race schedule, prize pool, track conditions, participant form, and prediction availability for this tournament.
          </p>
          <div className="tournament-detail-meta">
            <div><MapPin size={16} /><span>{tournament.location}</span></div>
            <div><Calendar size={16} /><span>{tournament.date}</span></div>
            <div><Trophy size={16} /><span>{tournament.prize}</span></div>
            <div><Flag size={16} /><span>{tournament.track} - {tournament.distance}</span></div>
          </div>
        </div>
      </div>

      <div className="tournament-detail-stats">
        <article>
          <span>Prize Pool</span>
          <strong>{tournament.prize}</strong>
          <small>Published rewards</small>
        </article>
        <article>
          <span>Entries</span>
          <strong>{tournament.entries}</strong>
          <small>Registered horses</small>
        </article>
        <article>
          <span>Track</span>
          <strong>{tournament.track}</strong>
          <small>Race surface</small>
        </article>
        <article>
          <span>Distance</span>
          <strong>{tournament.distance}</strong>
          <small>Main event length</small>
        </article>
      </div>

      <div className="tournament-detail-grid">
        <article className="spectator-card">
          <div className="spectator-card__header">
            <h2>Race Schedule</h2>
            <span className="spectator-badge">{tournamentRaces.length} Races</span>
          </div>
          <div className="spectator-timeline">
            {tournamentRaces.map((race) => (
              <div className="spectator-timeline__item" key={race.name}>
                <span className="spectator-time">{race.time}</span>
                <div>
                  <h3>{race.name}</h3>
                  <span className="spectator-meta">{race.distance} - {tournament.track}</span>
                </div>
                <span className="spectator-badge spectator-badge--amber">{race.status}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="spectator-card tournament-detail-panel">
          <div className="spectator-card__header">
            <h2>Prediction Market</h2>
            <span className="spectator-badge spectator-badge--green">Open</span>
          </div>
          <p className="spectator-meta">Compare odds and place predictions before the opening sprint gate closes.</p>
          <Link className="spectator-button spectator-button--primary" to="/spectator/predictions">
            Open Prediction Room
          </Link>
        </aside>
      </div>

      <article className="spectator-card">
        <div className="spectator-card__header">
          <h2>Featured Contenders</h2>
          <span className="spectator-badge">Odds Board</span>
        </div>
        <div className="tournament-contender-grid">
          {tournamentContenders.map((contender) => (
            <div className="tournament-contender-card" key={contender.horse}>
              <strong>{contender.horse}</strong>
              <span>Jockey: {contender.jockey}</span>
              <span>Form: {contender.form}</span>
              <span className="spectator-badge">{contender.odds}</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
};

export default TournamentDetail;
