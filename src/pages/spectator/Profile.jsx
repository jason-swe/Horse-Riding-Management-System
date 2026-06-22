import { Link } from "react-router-dom";
import { Award, BadgeCheck, Calendar, CreditCard, MapPin, Radio, Target, TrendingUp, Trophy, UserRound, Wallet } from "lucide-react";
import "./spectator.css";

const spectator = {
  name: "Guest User",
  username: "@guest.spectator",
  tier: "Gold Spectator",
  joined: "Joined May 2026",
  email: "guest@horseracing.example",
  location: "Ho Chi Minh City, VN",
  balance: "1,280 pts",
  totalWon: "$4,860",
  winRate: "62%",
  predictions: 48,
  trustScore: "94.6",
  nextRace: "Emerald Sprint",
};

const stats = [
  { label: "Wallet balance", value: spectator.balance, note: "Available for predictions", icon: Wallet },
  { label: "Rewards earned", value: spectator.totalWon, note: "Settled spectator rewards", icon: Trophy },
  { label: "Prediction rate", value: spectator.winRate, note: "Last 30 race predictions", icon: TrendingUp },
  { label: "Prediction slips", value: spectator.predictions, note: "Lifetime submitted picks", icon: CreditCard },
];

const activePredictions = [
  { race: "Emerald Sprint", pick: "Thunderbolt", stake: "200 pts", potential: "420 pts", status: "Open" },
  { race: "Derby Trial", pick: "Silver Flash", stake: "180 pts", potential: "504 pts", status: "Pending" },
  { race: "Worcester Chase", pick: "Golden Gallop", stake: "120 pts", potential: "408 pts", status: "Locked" },
];

const history = [
  { date: "2026-05-24", race: "Kentucky Derby Classic", pick: "Thunderbolt", result: "Won", reward: "+420 pts" },
  { date: "2026-05-18", race: "Royal Ascot Qualifier", pick: "Storm Chaser", result: "Lost", reward: "0 pts" },
  { date: "2026-05-10", race: "Dubai Sprint Heat", pick: "Silver Flash", result: "Won", reward: "+360 pts" },
  { date: "2026-05-02", race: "Laurel Park Invitational", pick: "Midnight Run", result: "Won", reward: "+220 pts" },
];

const achievements = [
  { title: "Hot Streak", detail: "Won 3 predictions in a row" },
  { title: "Sharp Eye", detail: "Picked a winner above 3.0x odds" },
  { title: "Early Market", detail: "Placed 10 predictions before race day" },
];

const Profile = () => {
  return (
    <section className="spectator-page profile-page">
      <div className="profile-hero">
        <div className="profile-identity">
          <div className="profile-avatar" aria-hidden="true">
            <UserRound size={42} />
          </div>
          <div>
            <p className="spectator-eyebrow">Spectator profile</p>
            <h1 className="spectator-title">{spectator.name}</h1>
            <p className="spectator-copy profile-copy">
              Track spectator details, reward balance, active predictions, race history, and achievements from one focused profile.
            </p>
            <div className="profile-tags">
              <span className="spectator-badge spectator-badge--amber"><Award size={14} /> {spectator.tier}</span>
              <span className="spectator-badge"><Calendar size={14} /> {spectator.joined}</span>
              <span className="spectator-badge spectator-badge--green"><BadgeCheck size={14} /> Verified</span>
            </div>
          </div>
        </div>

        <aside className="profile-wallet-card">
          <span>Current balance</span>
          <strong>{spectator.balance}</strong>
          <small>Rewards earned: {spectator.totalWon}</small>
          <div className="profile-wallet-card__meta">
            <span><Target size={14} /> Score {spectator.trustScore}</span>
            <span><Radio size={14} /> {spectator.nextRace}</span>
          </div>
          <Link className="spectator-button spectator-button--primary" to="/spectator/predictions">
            Make Prediction
          </Link>
        </aside>
      </div>

      <div className="profile-stat-grid">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <article className="profile-stat-card" key={item.label}>
              <div className="profile-stat-card__icon"><Icon size={20} /></div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          );
        })}
      </div>

      <div className="profile-layout">
        <article className="spectator-card">
          <div className="spectator-card__header">
            <h2>Spectator details</h2>
            <span className="spectator-badge">Account</span>
          </div>
          <div className="profile-detail-grid">
            <div><span>Username</span><strong>{spectator.username}</strong></div>
            <div><span>Email</span><strong>{spectator.email}</strong></div>
            <div><span><MapPin size={13} /> Location</span><strong>{spectator.location}</strong></div>
            <div><span>Tier</span><strong>{spectator.tier}</strong></div>
          </div>
        </article>

        <article className="spectator-card">
          <div className="spectator-card__header">
            <h2>Achievements</h2>
            <span className="spectator-badge spectator-badge--amber">3 Earned</span>
          </div>
          <div className="profile-achievements">
            {achievements.map((item) => (
              <div key={item.title}>
                <Trophy size={18} />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="profile-layout">
        <article className="spectator-card">
          <div className="spectator-card__header">
            <h2>Active predictions</h2>
            <span className="spectator-badge">{activePredictions.length} Tracking</span>
          </div>
          <ul className="spectator-list">
            {activePredictions.map((prediction) => (
              <li className="spectator-list__item profile-prediction-item" key={`${prediction.race}-${prediction.pick}`}>
                <span className="spectator-rank">{prediction.stake.replace(" pts", "")}</span>
                <div>
                  <h3>{prediction.race}</h3>
                  <span className="spectator-meta">Pick: {prediction.pick} - Potential {prediction.potential}</span>
                </div>
                <span className={`spectator-badge ${prediction.status === "Open" ? "spectator-badge--green" : "spectator-badge--amber"}`}>{prediction.status}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="spectator-card">
          <div className="spectator-card__header">
            <h2>Prediction history</h2>
            <span className="spectator-badge">Recent</span>
          </div>
          <div className="profile-history">
            {history.map((item) => (
              <div key={`${item.date}-${item.race}`}>
                <span>{item.date}</span>
                <strong>{item.race}</strong>
                <small>Pick: {item.pick}</small>
                <b className={item.result === "Won" ? "profile-history__won" : ""}>{item.reward}</b>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
};

export default Profile;
