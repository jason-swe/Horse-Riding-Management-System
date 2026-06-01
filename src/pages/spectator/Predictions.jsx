import { useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight, CalendarDays, CheckCircle, Eye, Flag, MapPin, Trophy, WalletCards, X } from "lucide-react";
import { tournaments } from "./tournamentData.js";
import "./spectator.css";

const predictionPortfolio = [
  { tournamentId: 1, picks: 3, stake: 420, potential: 980, status: "Live", nextRace: "14:00" },
  { tournamentId: 5, picks: 2, stake: 260, potential: 710, status: "Live", nextRace: "15:30" },
  { tournamentId: 7, picks: 1, stake: 120, potential: 336, status: "Locked", nextRace: "19:45" },
  { tournamentId: 3, picks: 4, stake: 500, potential: 0, status: "Settled", nextRace: "Closed" },
];

const statusMeta = {
  Active: { label: "Live", className: "prediction-overview-status--active" },
  Upcoming: { label: "Upcoming", className: "prediction-overview-status--upcoming" },
  Completed: { label: "Closed", className: "prediction-overview-status--closed" },
};

const formatPoints = (value) => `${value.toLocaleString()} pts`;

const getPortfolio = (tournamentId) =>
  predictionPortfolio.find((item) => item.tournamentId === tournamentId);

const predictionTournaments = tournaments
  .map((tournament) => ({
    ...tournament,
    portfolio: getPortfolio(tournament.id),
  }))
  .filter((tournament) => tournament.status !== "Completed" || tournament.portfolio)
  .sort((a, b) => {
    const aJoined = a.portfolio ? 0 : 1;
    const bJoined = b.portfolio ? 0 : 1;
    const statusOrder = { Active: 0, Upcoming: 1, Completed: 2 };
    return aJoined - bJoined || statusOrder[a.status] - statusOrder[b.status] || new Date(a.date) - new Date(b.date);
  });

const totals = predictionPortfolio.reduce(
  (acc, item) => ({
    picks: acc.picks + item.picks,
    stake: acc.stake + item.stake,
    potential: acc.potential + item.potential,
    live: acc.live + (item.status === "Live" ? 1 : 0),
  }),
  { picks: 0, stake: 0, potential: 0, live: 0 }
);

const PredictionTournamentRow = ({ tournament, onViewDetails }) => {
  const portfolio = tournament.portfolio;
  const status = statusMeta[tournament.status] ?? statusMeta.Completed;
  const predictionState = portfolio?.status ?? (tournament.status === "Active" ? "Open" : "Opening soon");

  return (
    <article className={`prediction-list-row ${portfolio ? "prediction-list-row--joined" : ""}`}>
      <div className="prediction-list-row__main">
        <span className={`prediction-overview-status prediction-list-row__status ${status.className}`}>
          {status.label}
        </span>
        {portfolio && (
          <span className="prediction-list-row__joined" aria-label="Joined prediction tournament" title="Joined">
            <CheckCircle size={15} />
          </span>
        )}
        <h3>{tournament.name}</h3>
        <div className="prediction-list-row__meta">
          <span><MapPin size={14} /> {tournament.location}</span>
          <span><CalendarDays size={14} /> {tournament.date}</span>
          <span><Flag size={14} /> {tournament.track} / {tournament.distance}</span>
          <span><Activity size={14} /> {tournament.entries} entries</span>
        </div>
      </div>

      <div className="prediction-list-row__portfolio">
        {portfolio ? (
          <>
            <span>{portfolio.picks} picks</span>
            <strong>{formatPoints(portfolio.stake)}</strong>
            <small>{portfolio.potential ? `${formatPoints(portfolio.potential)} return` : "Settled"}</small>
          </>
        ) : (
          <>
            <span>{predictionState}</span>
            <strong>{tournament.prize}</strong>
            <small>{tournament.status === "Active" ? "Market open" : "Watchlist"}</small>
          </>
        )}
      </div>

      <div className="prediction-list-row__actions">
        <button className="prediction-list-row__detail" type="button" onClick={() => onViewDetails(tournament)}>
          <Eye size={16} /> Details
        </button>
        <Link className="prediction-list-row__predict" to={`/spectator/predictions/${tournament.id}`}>
          Predict <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
};

const TournamentDetailModal = ({ tournament, onClose }) => {
  if (!tournament) {
    return null;
  }

  const portfolio = tournament.portfolio;
  const status = statusMeta[tournament.status] ?? statusMeta.Completed;

  return (
    <div className="prediction-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="prediction-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prediction-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="prediction-modal__close" type="button" aria-label="Close tournament details" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="prediction-modal__media">
          <img className="prediction-modal__image" src={tournament.image} alt={tournament.name} />
          <div className="prediction-modal__media-caption">
            <span>{tournament.status}</span>
            <strong>{tournament.track} / {tournament.distance}</strong>
          </div>
        </div>

        <div className="prediction-modal__body">
          <div className="prediction-modal__topline">
            <span className={`prediction-overview-status ${status.className}`}>{status.label}</span>
            <small>Tournament details</small>
          </div>
          <h2 id="prediction-modal-title">{tournament.name}</h2>
          <p>{tournament.location}</p>

          <div className="prediction-modal__stats">
            <span><CalendarDays size={14} /> {tournament.date}</span>
            <span><Flag size={14} /> {tournament.track} / {tournament.distance}</span>
            <span><Activity size={14} /> {tournament.entries} entries</span>
            <span><Trophy size={14} /> {tournament.prize}</span>
          </div>

          <div className="prediction-modal__portfolio" aria-label="Prediction activity">
            <div>
              <span>Picks</span>
              <strong>{portfolio ? portfolio.picks : 0}</strong>
            </div>
            <div>
              <span>Stake</span>
              <strong>{portfolio ? formatPoints(portfolio.stake) : "0 pts"}</strong>
            </div>
            <div>
              <span>Return</span>
              <strong>{portfolio?.potential ? formatPoints(portfolio.potential) : "Open"}</strong>
            </div>
          </div>

          <Link className="prediction-modal__action" to={`/spectator/predictions/${tournament.id}`}>
            Go to prediction room <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

const Predictions = () => {
  const [selectedTournament, setSelectedTournament] = useState(null);

  return (
    <section className="spectator-page prediction-overview-page">
      <div className="prediction-overview-hero">
        <div>
          <p className="spectator-eyebrow">Prediction overview</p>
          <h1 className="spectator-title">Your tournament prediction board.</h1>
          <p className="spectator-copy">
            Review tournaments you have joined, track active prediction exposure, and open upcoming markets from one focused screen.
          </p>
        </div>

        <aside className="prediction-overview-wallet">
          <span><WalletCards size={16} /> Wallet balance</span>
          <strong>1,280 pts</strong>
          <p>{totals.live} live tournaments with {totals.picks} active picks.</p>
        </aside>
      </div>

      <div className="prediction-overview-metrics">
        <article>
          <span>Active picks</span>
          <strong>{totals.picks}</strong>
          <small>Across joined tournaments</small>
        </article>
        <article>
          <span>Total stake</span>
          <strong>{formatPoints(totals.stake)}</strong>
          <small>Currently committed</small>
        </article>
        <article>
          <span>Potential return</span>
          <strong>{formatPoints(totals.potential)}</strong>
          <small>Open markets only</small>
        </article>
        <article>
          <span>Next lock</span>
          <strong>14:00</strong>
          <small>Grand National Cup</small>
        </article>
      </div>

      <section className="prediction-overview-section prediction-list-section">
        <div className="prediction-overview-section__header">
          <div>
            <h2>Prediction tournaments</h2>
          </div>
        </div>

        <div className="prediction-list" aria-label="Prediction tournament list">
          {predictionTournaments.map((tournament) => (
            <PredictionTournamentRow
              key={tournament.id}
              tournament={tournament}
              onViewDetails={setSelectedTournament}
            />
          ))}
        </div>
      </section>

      <TournamentDetailModal tournament={selectedTournament} onClose={() => setSelectedTournament(null)} />
    </section>
  );
};

export default Predictions;
