import { Link } from "react-router-dom";
import { Award, BadgeCheck, Calendar, CreditCard, TrendingUp, Trophy, UserRound, Wallet } from "lucide-react";
import "./spectator.css";

const bettor = {
  name: "Guest User",
  username: "@guest.bettor",
  tier: "Gold Better",
  joined: "Joined May 2026",
  email: "guest@horseracing.example",
  location: "Ho Chi Minh City, VN",
  balance: "1,280 pts",
  totalWon: "$4,860",
  winRate: "62%",
  predictions: 48,
};

const stats = [
  { label: "Wallet Balance", value: bettor.balance, note: "Available for predictions", icon: Wallet },
  { label: "Total Winnings", value: bettor.totalWon, note: "Rewards already settled", icon: Trophy },
  { label: "Win Rate", value: bettor.winRate, note: "Last 30 race predictions", icon: TrendingUp },
  { label: "Predictions", value: bettor.predictions, note: "Lifetime submitted picks", icon: CreditCard },
];

const activeBets = [
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
            <p className="spectator-eyebrow">Better Profile</p>
            <h1 className="spectator-title">{bettor.name}</h1>
            <p className="spectator-copy">
              Track profile details, reward balance, total winnings, active bets, prediction history, and betting achievements.
            </p>
            <div className="profile-tags">
              <span className="spectator-badge spectator-badge--amber"><Award size={14} /> {bettor.tier}</span>
              <span className="spectator-badge"><Calendar size={14} /> {bettor.joined}</span>
              <span className="spectator-badge spectator-badge--green"><BadgeCheck size={14} /> Verified</span>
            </div>
          </div>
        </div>

        <aside className="profile-wallet-card">
          <span>Current Balance</span>
          <strong>{bettor.balance}</strong>
          <small>Total winnings: {bettor.totalWon}</small>
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
            <h2>Profile Details</h2>
            <span className="spectator-badge">Account</span>
          </div>
          <div className="profile-detail-grid">
            <div><span>Username</span><strong>{bettor.username}</strong></div>
            <div><span>Email</span><strong>{bettor.email}</strong></div>
            <div><span>Location</span><strong>{bettor.location}</strong></div>
            <div><span>Tier</span><strong>{bettor.tier}</strong></div>
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
            <h2>Active Bets</h2>
            <span className="spectator-badge">{activeBets.length} Tracking</span>
          </div>
          <ul className="spectator-list">
            {activeBets.map((bet) => (
              <li className="spectator-list__item" key={`${bet.race}-${bet.pick}`}>
                <span className="spectator-rank">{bet.stake.replace(" pts", "")}</span>
                <div>
                  <h3>{bet.race}</h3>
                  <span className="spectator-meta">Pick: {bet.pick} - Potential {bet.potential}</span>
                </div>
                <span className={`spectator-badge ${bet.status === "Open" ? "spectator-badge--green" : "spectator-badge--amber"}`}>{bet.status}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="spectator-card">
          <div className="spectator-card__header">
            <h2>Betting History</h2>
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
