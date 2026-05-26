import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Trophy } from "lucide-react";
import SearchFilterBar from "../../components/SearchFilterBar.jsx";
import { tournaments } from "./tournamentData.js";
import "./spectator.css";

const TournamentCard = ({ tournament }) => {
  const statusStyles = {
    Active: { color: "#72df8a", bg: "rgba(78, 207, 107, 0.12)", border: "rgba(78, 207, 107, 0.34)" },
    Upcoming: { color: "#ffbd63", bg: "rgba(255, 179, 71, 0.12)", border: "rgba(255, 179, 71, 0.34)" },
    Completed: { color: "#bbb", bg: "rgba(150, 150, 150, 0.12)", border: "rgba(150, 150, 150, 0.34)" },
  };

  const style = statusStyles[tournament.status] || statusStyles.Completed;

  return (
    <div className="spectator-card tournament-card">
      <div
        className="tournament-card__image"
        style={{ backgroundImage: `url(${tournament.image})` }}
      />
      <div className="tournament-card__body">
        <span className="spectator-badge tournament-card__status" style={{
            borderColor: style.border,
            color: style.color,
            backgroundColor: style.bg,
          }}>
            {tournament.status}
        </span>
        <h3>{tournament.name}</h3>
      </div>
      <div className="tournament-card__meta">
        <div>
          <MapPin size={14} /> <span>{tournament.location}</span>
        </div>
        <div>
          <Calendar size={14} /> <span>{tournament.date}</span>
        </div>
        <div className="tournament-card__prize">
          <Trophy size={14} /> <span>Prize: {tournament.prize}</span>
        </div>
      </div>
      <Link className="spectator-button spectator-button--primary tournament-card__button" to={`/spectator/tournaments/${tournament.id}`}>
        View Details
      </Link>
    </div>
  );
};

const TournamentList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || t.status.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="spectator-page">
      <header style={{ marginBottom: "32px" }}>
        <h1 style={{
          fontFamily: '"Sora", sans-serif',
          fontSize: "2.5rem",
          margin: "0 0 8px 0",
          color: "#EEE7D4",
          letterSpacing: "-0.04em"
        }}>
          Tournaments
        </h1>
        <p style={{ color: "rgba(238, 231, 212, 0.6)", fontSize: "1rem" }}>
          Explore upcoming and active horse racing tournaments across the globe.
        </p>
      </header>

      <SearchFilterBar
        onSearch={setSearchQuery}
        onFilterChange={setFilter}
        initialValue={searchQuery}
      />

      <div className="spectator-grid">
        {filteredTournaments.length > 0 ? (
          filteredTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)
        ) : (
          <div style={{
            gridColumn: "1/-1",
            textAlign: "center",
            padding: "40px",
            color: "rgba(238, 231, 212, 0.5)"
          }}>
            No tournaments found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentList;
