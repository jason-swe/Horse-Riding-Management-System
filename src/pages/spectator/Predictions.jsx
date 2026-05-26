import { useMemo, useState } from "react";
import "./spectator.css";

const heroImage = "https://www.minnpost.com/wp-content/uploads/2023/12/BreedersCup940.png";

const contenders = [
  {
    id: "thunderbolt",
    horse: "Thunderbolt",
    jockey: "Alex Rider",
    trainer: "M. Mercer",
    odds: 2.1,
    probability: 64,
    lane: 3,
    weight: "56kg",
    form: "1-2-1",
    image: "https://i.pinimg.com/236x/34/b4/a8/34b4a897a11e246d4e7d97a2981c22b1.jpg",
  },
  {
    id: "silver-flash",
    horse: "Silver Flash",
    jockey: "Chris Evans",
    trainer: "R. Holden",
    odds: 2.8,
    probability: 53,
    lane: 5,
    weight: "55kg",
    form: "2-1-3",
    image: "https://i.pinimg.com/236x/ab/6b/71/ab6b714886cbdfbe68e6c9e016060ae9.jpg",
  },
  {
    id: "golden-gallop",
    horse: "Golden Gallop",
    jockey: "Elena Gilbert",
    trainer: "S. Vance",
    odds: 3.4,
    probability: 46,
    lane: 1,
    weight: "57kg",
    form: "3-1-2",
    image: "https://i.pinimg.com/474x/86/9b/90/869b907e8b730e84c65df991bad2203d.jpg",
  },
  {
    id: "midnight-run",
    horse: "Midnight Run",
    jockey: "David Miller",
    trainer: "A. Thorne",
    odds: 4.2,
    probability: 38,
    lane: 7,
    weight: "54kg",
    form: "4-2-2",
    image: "https://i.pinimg.com/474x/2a/70/02/2a70023b9e1bd8059b82a4449d2041a7.jpg",
  },
  {
    id: "crimson-comet",
    horse: "Crimson Comet",
    jockey: "Maya Chen",
    trainer: "D. Cross",
    odds: 5.6,
    probability: 29,
    lane: 2,
    weight: "55kg",
    form: "5-3-1",
    image: "https://i.pinimg.com/236x/34/b4/a8/34b4a897a11e246d4e7d97a2981c22b1.jpg",
  },
];

const activeBets = [
  { race: "Derby Trial", pick: "Thunderbolt", amount: 250, odds: "2.1x", status: "Pending" },
  { race: "Sunset Stakes", pick: "Silver Flash", amount: 180, odds: "2.8x", status: "Pending" },
  { race: "Worcester Chase", pick: "Golden Gallop", amount: 120, odds: "3.4x", status: "Locked" },
];

const predictionHistory = [
  { race: "Kentucky Derby Classic", pick: "Thunderbolt", result: "Won", reward: "+420 pts" },
  { race: "Royal Ascot Qualifier", pick: "Storm Chaser", result: "Lost", reward: "0 pts" },
  { race: "Dubai Sprint Heat", pick: "Silver Flash", result: "Won", reward: "+360 pts" },
];

const marketSignals = [
  { label: "Track", value: "Good", note: "Dry turf, fast rail" },
  { label: "Distance", value: "1,200m", note: "Sprint profile" },
  { label: "Pool", value: "8,420 pts", note: "Prediction liquidity" },
  { label: "Closes", value: "12m", note: "Before gate opens" },
];

const stakeOptions = [50, 100, 200, 500];

const Predictions = () => {
  const [selectedId, setSelectedId] = useState(contenders[0].id);
  const [amount, setAmount] = useState(200);
  const [betType, setBetType] = useState("winner");

  const selected = contenders.find((horse) => horse.id === selectedId) ?? contenders[0];
  const stake = Number(amount || 0);
  const betTypeMultiplier = betType === "winner" ? selected.odds : betType === "place" ? selected.odds * 0.62 : selected.odds * 1.45;
  const potentialReward = useMemo(() => Math.round(stake * betTypeMultiplier), [stake, betTypeMultiplier]);

  return (
    <section className="spectator-page prediction-page">
      <div className="prediction-hero">
        <div className="prediction-hero__content">
          <p className="spectator-eyebrow">Prediction Room</p>
          <h1 className="spectator-title">Build a smarter race pick before the gate opens.</h1>
          <p className="spectator-copy">
            A prediction page should show race context, odds, contender form, wallet balance, bet type, stake, possible reward, active bets, and previous outcomes.
          </p>
          <div className="prediction-hero__stats">
            <div><span>Wallet</span><strong>1,280 pts</strong></div>
            <div><span>Open Markets</span><strong>03</strong></div>
            <div><span>My Win Rate</span><strong>62%</strong></div>
          </div>
        </div>
        <div className="prediction-hero__media">
          <img src={heroImage} alt="Breeders Cup race preview" />
          <div className="prediction-hero__race-card">
            <span className="spectator-badge spectator-badge--amber">Prediction Open</span>
            <strong>Emerald Sprint</strong>
            <span>Turf Circuit - 14:00 - 1,200m - 5 contenders</span>
          </div>
        </div>
      </div>

      <div className="prediction-signals">
        {marketSignals.map((signal) => (
          <article key={signal.label}>
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
            <small>{signal.note}</small>
          </article>
        ))}
      </div>

      <div className="prediction-layout">
        <article className="spectator-card prediction-market">
          <div className="spectator-card__header">
            <div>
              <p className="spectator-eyebrow">Odds Board</p>
              <h2>Contenders</h2>
            </div>
            <span className="spectator-badge spectator-badge--green">{contenders.length} Open</span>
          </div>

          <div className="spectator-pick-grid">
            {contenders.map((horse) => (
              <button
                className={`spectator-pick prediction-pick ${selectedId === horse.id ? "spectator-pick--active" : ""}`}
                key={horse.id}
                type="button"
                onClick={() => setSelectedId(horse.id)}
              >
                <img className="spectator-pick__image" src={horse.image} alt={horse.horse} />
                <div>
                  <div className="prediction-pick__heading">
                    <h3>{horse.horse}</h3>
                    <span className="spectator-badge">{horse.odds}x</span>
                  </div>
                  <span className="spectator-meta">
                    Lane {horse.lane} - {horse.jockey} - {horse.weight} - Form {horse.form}
                  </span>
                  <div className="spectator-progress" aria-hidden="true">
                    <span style={{ width: `${horse.probability}%` }} />
                  </div>
                  <div className="prediction-pick__footer">
                    <span>Trainer: {horse.trainer}</span>
                    <strong>{horse.probability}% model confidence</strong>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </article>

        <aside className="spectator-card spectator-slip prediction-slip">
          <div className="spectator-card__header">
            <h2>Betting Slip</h2>
            <span className="spectator-badge">Draft</span>
          </div>

          <div className="prediction-selected">
            <img src={selected.image} alt={selected.horse} />
            <div>
              <span className="spectator-meta">Selected Horse</span>
              <strong>{selected.horse}</strong>
              <span>{selected.jockey} - odds {selected.odds}x</span>
            </div>
          </div>

          <div className="prediction-segmented" aria-label="Bet type">
            {[
              { value: "winner", label: "Winner" },
              { value: "place", label: "Place" },
              { value: "exacta", label: "Exacta" },
            ].map((option) => (
              <button
                className={betType === option.value ? "prediction-segmented__active" : ""}
                key={option.value}
                type="button"
                onClick={() => setBetType(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="spectator-field">
            <label htmlFor="prediction-amount">Prediction Amount</label>
            <input
              id="prediction-amount"
              min="10"
              max="1280"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          <div className="prediction-stake-buttons">
            {stakeOptions.map((value) => (
              <button key={value} type="button" onClick={() => setAmount(value)}>
                {value}
              </button>
            ))}
          </div>

          <div className="spectator-summary">
            <div><span>Stake</span><strong>{stake} pts</strong></div>
            <div><span>Bet Type</span><strong>{betType}</strong></div>
            <div><span>Odds</span><strong>{betTypeMultiplier.toFixed(2)}x</strong></div>
            <div><span>Potential Reward</span><strong>{potentialReward} pts</strong></div>
          </div>

          <button className="spectator-button spectator-button--primary" type="button" style={{ width: "100%", marginTop: "18px" }}>
            Confirm Prediction
          </button>
        </aside>
      </div>

      <div className="prediction-lower-grid">
        <article className="spectator-card">
          <div className="spectator-card__header">
            <h2>My Active Bets</h2>
            <span className="spectator-badge">{activeBets.length} Pending</span>
          </div>
          <ul className="spectator-list">
            {activeBets.map((bet) => (
              <li className="spectator-list__item" key={`${bet.race}-${bet.pick}`}>
                <span className="spectator-rank">{bet.amount}</span>
                <div>
                  <h3>{bet.race}</h3>
                  <span className="spectator-meta">Pick: {bet.pick} - Odds {bet.odds}</span>
                </div>
                <span className={`spectator-badge ${bet.status === "Locked" ? "spectator-badge--green" : "spectator-badge--amber"}`}>{bet.status}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="spectator-card">
          <div className="spectator-card__header">
            <h2>Recent Outcomes</h2>
            <span className="spectator-badge">History</span>
          </div>
          <ul className="spectator-list">
            {predictionHistory.map((item) => (
              <li className="spectator-list__item" key={`${item.race}-${item.pick}`}>
                <span className={`spectator-badge ${item.result === "Won" ? "spectator-badge--green" : ""}`}>{item.result}</span>
                <div>
                  <h3>{item.race}</h3>
                  <span className="spectator-meta">Pick: {item.pick}</span>
                </div>
                <strong className="prediction-reward">{item.reward}</strong>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
};

export default Predictions;
