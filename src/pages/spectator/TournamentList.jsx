import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  CalendarRange,
  Flag,
  MapPin,
  RefreshCw,
  SearchX,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import SearchFilterBar from "../../components/SearchFilterBar.jsx";
import LoadingSkeleton from "../../components/LoadingSkeleton.jsx";
import { useSpectatorTournaments } from "./useSpectatorData.js";
import "./spectator.css";

// Status config
const STATUS_META = {
  Active: {
    label: "Active",
    className: "tournament-status--active",
    dotClass: "tcard-status-dot--active",
  },
  Upcoming: {
    label: "Upcoming",
    className: "tournament-status--upcoming",
    dotClass: "tcard-status-dot--upcoming",
  },
  Completed: {
    label: "Closed",
    className: "tournament-status--completed",
    dotClass: "tcard-status-dot--closed",
  },
};

// Format short date range: "Jul 15 – 19, 2026"
function formatDateRange(startIso, endIso) {
  if (!startIso) return null;
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : null;
  if (Number.isNaN(start.getTime())) return null;

  const opts = { day: "numeric", month: "short", timeZone: "UTC" };
  const yearOpts = { year: "numeric", timeZone: "UTC" };
  const startStr = start.toLocaleDateString("en-US", opts);
  if (!end || Number.isNaN(end.getTime())) {
    return `${startStr}, ${start.toLocaleDateString("en-US", yearOpts)}`;
  }
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const endStr = end.toLocaleDateString("en-US", opts);
  return sameYear
    ? `${startStr} – ${endStr}, ${end.toLocaleDateString("en-US", yearOpts)}`
    : `${startStr}, ${start.toLocaleDateString("en-US", yearOpts)} – ${endStr}, ${end.toLocaleDateString("en-US", yearOpts)}`;
}

// ─── Tournament Card ──────────────────────────────────────────────────────────
const TournamentCard = ({ tournament }) => {
  const status = STATUS_META[tournament.status] ?? STATUS_META.Completed;
  const dateRange = formatDateRange(
    tournament.date ? `${tournament.date}T00:00:00Z` : null,
    tournament.endDate ? `${tournament.endDate}T00:00:00Z` : null
  );

  return (
    <article className="tcard">
      {/* Image banner */}
      <Link className="tcard__image" to={`/spectator/tournaments/${tournament.id}`} tabIndex={-1} aria-hidden="true">
        <img src={tournament.image} alt="" loading="lazy" />
        <div className="tcard__image-overlay" />
        <span className={`tcard__status-badge ${status.className}`}>
          <span className={`tcard-status-dot ${status.dotClass}`} />
          {status.label}
        </span>
      </Link>

      {/* Body */}
      <div className="tcard__body">
        <div className="tcard__location">
          <MapPin size={12} />
          <span>{tournament.location || "Venue TBA"}</span>
        </div>
        <h3 className="tcard__name">
          <Link to={`/spectator/tournaments/${tournament.id}`}>{tournament.name}</Link>
        </h3>
        {tournament.description && (
          <p className="tcard__description">{tournament.description}</p>
        )}

        <div className="tcard__meta">
          {dateRange && (
            <div className="tcard__meta-item">
              <CalendarRange size={13} />
              <span>{dateRange}</span>
            </div>
          )}
          {tournament.prize && (
            <div className="tcard__meta-item">
              <Trophy size={13} />
              <span>{tournament.prize}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="tcard__footer">
        <div className="tcard__footer-left">
          {tournament.entries != null && (
            <span className="tcard__entries">
              <Users size={13} /> {tournament.entries} entries
            </span>
          )}
        </div>
        <Link
          className="tcard__cta"
          to={`/spectator/tournaments/${tournament.id}`}
          aria-label={`View ${tournament.name}`}
        >
          View races <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TournamentList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const { tournaments, isLoading, error, reload } = useSpectatorTournaments();

  const counts = tournaments.reduce(
    (acc, t) => {
      const key = t.status.toLowerCase();
      if (key in acc) acc[key] += 1;
      return acc;
    },
    { active: 0, upcoming: 0, completed: 0 }
  );

  const statusOrder = { Active: 0, Upcoming: 1, Completed: 2 };

  const filteredTournaments = tournaments
    .filter((t) => {
      const haystack = `${t.name} ${t.location} ${t.description} ${t.date}`.toLowerCase();
      const matchesSearch = haystack.includes(searchQuery.toLowerCase());
      const matchesFilter =
        filter === "all" || t.status.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(a.date) - new Date(b.date);
    });

  const summaryCards = [
    {
      key: "active",
      value: counts.active,
      label: "Active",
      icon: Zap,
      cls: "tlboard-metric--active",
    },
    {
      key: "upcoming",
      value: counts.upcoming,
      label: "Upcoming",
      icon: Calendar,
      cls: "tlboard-metric--upcoming",
    },
    {
      key: "total",
      value: tournaments.length,
      label: "Total",
      icon: Flag,
      cls: "tlboard-metric--total",
    },
  ];

  if (isLoading) {
    return (
      <div className="spectator-page tournament-hub-page">
        <LoadingSkeleton ariaLabel="Loading tournament board" rows={6} variant="cards" />
      </div>
    );
  }

  return (
    <div className="spectator-page tournament-hub-page">
      {error && (
        <section
          className="admin-live-state admin-live-state--warning spectator-api-state"
          aria-live="polite"
        >
          <span>{error}</span>
          <button type="button" onClick={reload}>
            <RefreshCw size={15} /> Retry
          </button>
        </section>
      )}

      {/* ── Page Header ── */}
      <section className="tlboard-header">
        <div className="tlboard-header__text">
          <p className="spectator-eyebrow">Tournament Board</p>
          <h1>Find your next race.</h1>
          <p>Browse all published tournaments. Open the race schedule to view betting markets and event details.</p>
        </div>
        <div className="tlboard-header__metrics">
          {summaryCards.map(({ key, value, label, icon: Icon, cls }) => (
            <button
              key={key}
              type="button"
              className={`tlboard-metric ${cls}${filter === (key === "total" ? "all" : key) ? " is-active" : ""}`}
              onClick={() => setFilter(key === "total" ? "all" : key)}
            >
              <Icon size={16} />
              <strong>{value}</strong>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Filter Bar ── */}
      <section className="tlboard-filter-bar">
        <div className="tlboard-filter-bar__chip">
          <span>Tournaments</span>
          <strong>{filteredTournaments.length}</strong>
        </div>
        <SearchFilterBar
          onSearch={setSearchQuery}
          onFilterChange={setFilter}
          initialValue={searchQuery}
          placeholder="Search tournament, city, date…"
        />
      </section>

      {/* ── Grid ── */}
      <div className="tcard-grid">
        {filteredTournaments.length > 0 ? (
          filteredTournaments.map((t) => <TournamentCard key={t.id} tournament={t} />)
        ) : (
          <div className="spectator-empty-state">
            <SearchX size={22} />
            <span>
              {error
                ? "Tournament data is unavailable right now."
                : tournaments.length
                ? "No tournaments match your search."
                : "No tournaments have been published yet."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentList;
