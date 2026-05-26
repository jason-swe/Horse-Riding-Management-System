import { Link } from "react-router-dom";
import "./spectator.css";

const raceImages = [
  "https://agrifutures.com.au/wp-content/uploads/2022/08/a8-scaled.jpg",
  "https://images.squarespace-cdn.com/content/v1/5f99b7932a3e654c26fd0c52/39d267e3-5397-4600-b49c-322d4b14e4f8/Screenshot+2023-02-10+at+11.52.07+AM.png",
  "https://www.worcester-racecourse.co.uk/WorcesterRacecourse/images/upload/bb03d37b-d42a-486d-b913-cc62a889bf70.webp",
];

const nextRaces = [
  { time: "14:00", title: "Emerald Sprint", venue: "Grandstand A", status: "Open", distance: "1,200m", entries: 8 },
  { time: "15:30", title: "Derby Trial", venue: "Turf Circuit", status: "Live", distance: "1,600m", entries: 10 },
  { time: "17:00", title: "Sunset Stakes", venue: "Main Track", status: "Open", distance: "2,000m", entries: 7 },
];

const topPicks = [
  {
    rank: 1,
    name: "Thunderbolt",
    meta: "12 wins - 64% form",
    odds: "2.1x",
    image: "https://i.pinimg.com/236x/34/b4/a8/34b4a897a11e246d4e7d97a2981c22b1.jpg",
  },
  {
    rank: 2,
    name: "Silver Flash",
    meta: "10 wins - 58% form",
    odds: "2.8x",
    image: "https://i.pinimg.com/236x/ab/6b/71/ab6b714886cbdfbe68e6c9e016060ae9.jpg",
  },
  {
    rank: 3,
    name: "Golden Gallop",
    meta: "8 wins - 51% form",
    odds: "3.4x",
    image: "https://i.pinimg.com/474x/86/9b/90/869b907e8b730e84c65df991bad2203d.jpg",
  },
];

const quickActions = [
  { label: "Tournament Hub", meta: "Active and upcoming events", to: "/spectator/tournaments" },
  { label: "Prediction Room", meta: "Place picks before gates open", to: "/spectator/predictions" },
  { label: "Official Results", meta: "Final standings and rewards", to: "/spectator/results" },
];

const SpectatorHome = () => {
  return (
    <section className="spectator-page spectator-overview">
      <div className="spectator-overview-hero">
        <div className="spectator-overview-hero__media">
          <img src={raceImages[0]} alt="Horse racecourse grandstand" />
          <div className="spectator-overview-hero__overlay">
            <span className="spectator-badge spectator-badge--green">Live season</span>
            <strong>Grand Circuit 2026</strong>
            <span>18 races - 6 tournaments - 42 confirmed contenders</span>
          </div>
        </div>

        <div className="spectator-overview-hero__content">
          <p className="spectator-eyebrow">Spectator Command Center</p>
          <h1 className="spectator-title">Watch the season unfold from the best seat in the system.</h1>
          <p className="spectator-copy">
            Discover tournaments, follow the race timeline, compare contenders, predict winners, and track reward outcomes in one focused spectator dashboard.
          </p>
          <div className="spectator-actions">
            <Link className="spectator-button spectator-button--primary" to="/spectator/predictions">Make Prediction</Link>
            <Link className="spectator-button" to="/spectator/tournaments">View Tournaments</Link>
          </div>
        </div>
      </div>

      <div className="spectator-overview-stats">
        <article>
          <span>Reward Balance</span>
          <strong>1,280</strong>
          <small>Prediction points available</small>
        </article>
        <article>
          <span>Active Bets</span>
          <strong>04</strong>
          <small>Waiting for official results</small>
        </article>
        <article>
          <span>Win Rate</span>
          <strong>62%</strong>
          <small>Across last 30 predictions</small>
        </article>
        <article>
          <span>Next Gate</span>
          <strong>14:00</strong>
          <small>Emerald Sprint opens soon</small>
        </article>
      </div>

      <div className="spectator-overview-layout">
        <article className="spectator-card spectator-feature-card">
          <div className="spectator-card__header">
            <div>
              <p className="spectator-eyebrow">Featured Tournament</p>
              <h2>Wolverhampton Night Circuit</h2>
            </div>
            <Link className="spectator-badge" to="/spectator/tournaments">Details</Link>
          </div>
          <img src={raceImages[1]} alt="Racecourse event overview" />
          <div className="spectator-feature-card__footer">
            <div>
              <strong>$500,000</strong>
              <span>Prize pool</span>
            </div>
            <div>
              <strong>June 15</strong>
              <span>Opening date</span>
            </div>
            <div>
              <strong>12</strong>
              <span>Registered horses</span>
            </div>
          </div>
        </article>

        <aside className="spectator-card spectator-wallet-card">
          <div className="spectator-card__header">
            <h2>Reward Wallet</h2>
            <span className="spectator-badge spectator-badge--amber">Ready</span>
          </div>
          <div className="spectator-wallet-card__balance">1,280 pts</div>
          <div className="spectator-wallet-card__bar" aria-hidden="true"><span /></div>
          <p className="spectator-meta">Earn points from correct race predictions and follow every reward from the results page.</p>
          <Link className="spectator-button" to="/spectator/results">View Rewards</Link>
        </aside>
      </div>

      <div className="spectator-grid spectator-grid--two">
        <article className="spectator-card">
          <div className="spectator-card__header">
            <h2>Race Timeline</h2>
            <Link className="spectator-badge" to="/spectator/results">Results</Link>
          </div>
          <div className="spectator-timeline spectator-overview-timeline">
            {nextRaces.map((race) => (
              <div className="spectator-timeline__item" key={race.title}>
                <span className="spectator-time">{race.time}</span>
                <div>
                  <h3>{race.title}</h3>
                  <span className="spectator-meta">{race.venue} - {race.distance} - {race.entries} entries</span>
                </div>
                <span className={`spectator-badge ${race.status === "Live" ? "spectator-badge--green" : "spectator-badge--amber"}`}>{race.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="spectator-card">
          <div className="spectator-card__header">
            <h2>Popular Picks</h2>
            <Link className="spectator-badge" to="/spectator/leaderboard">Ranking</Link>
          </div>
          <ul className="spectator-list">
            {topPicks.map((pick) => (
              <li className="spectator-list__item" key={pick.name}>
                <img className="spectator-list__thumb" src={pick.image} alt={pick.name} />
                <div>
                  <h3>#{pick.rank} {pick.name}</h3>
                  <span className="spectator-meta">{pick.meta}</span>
                </div>
                <span className="spectator-badge">{pick.odds}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="spectator-overview-gallery">
        {raceImages.map((image, index) => (
          <article key={image}>
            <img src={image} alt={`Racecourse highlight ${index + 1}`} />
            <div>
              <span className="spectator-badge">{index === 0 ? "Grandstand" : index === 1 ? "Race Day" : "Trackside"}</span>
              <strong>{index === 0 ? "Crowd energy" : index === 1 ? "Race analysis" : "Finish line watch"}</strong>
            </div>
          </article>
        ))}
      </div>

      <div className="spectator-overview-actions">
        {quickActions.map((action) => (
          <Link className="spectator-card spectator-overview-action" key={action.label} to={action.to}>
            <span className="spectator-badge">Open</span>
            <strong>{action.label}</strong>
            <small>{action.meta}</small>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SpectatorHome;
