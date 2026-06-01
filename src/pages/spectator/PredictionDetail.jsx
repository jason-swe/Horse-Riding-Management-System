import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flag,
  Info,
  Lock,
  ReceiptText,
  ShieldCheck,
  Trophy,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { tournaments } from "./tournamentData.js";
import "./spectator.css";

const horseImages = [
  "https://i.pinimg.com/236x/34/b4/a8/34b4a897a11e246d4e7d97a2981c22b1.jpg",
  "https://i.pinimg.com/236x/ab/6b/71/ab6b714886cbdfbe68e6c9e016060ae9.jpg",
  "https://i.pinimg.com/474x/86/9b/90/869b907e8b730e84c65df991bad2203d.jpg",
  "https://i.pinimg.com/474x/2a/70/02/2a70023b9e1bd8059b82a4449d2041a7.jpg",
];

const races = [
  { id: "opening-sprint", name: "Opening Sprint", time: "14:00", distance: "1,200m", status: "Prediction Open", closesIn: "12m", pool: "8,420 pts" },
  { id: "derby-trial", name: "Derby Trial", time: "15:30", distance: "1,600m", status: "Closing Soon", closesIn: "34m", pool: "11,260 pts" },
  { id: "championship-final", name: "Championship Final", time: "17:00", distance: "2,000m", status: "Scheduled", closesIn: "2h 04m", pool: "5,940 pts" },
];

const contenders = [
  {
    id: "thunderbolt",
    horse: "Thunderbolt",
    jockey: "Alex Rider",
    owner: "Minh Le",
    lane: 3,
    weight: "56kg",
    form: "1-2-1",
    probability: 64,
    odds: { win: 2.1, place: 1.42 },
    image: horseImages[0],
  },
  {
    id: "silver-flash",
    horse: "Silver Flash",
    jockey: "Chris Evans",
    owner: "Aisha Moreno",
    lane: 5,
    weight: "55kg",
    form: "2-1-3",
    probability: 53,
    odds: { win: 2.8, place: 1.7 },
    image: horseImages[1],
  },
  {
    id: "golden-gallop",
    horse: "Golden Gallop",
    jockey: "Elena Gilbert",
    owner: "Tuan Pham",
    lane: 1,
    weight: "57kg",
    form: "3-1-2",
    probability: 46,
    odds: { win: 3.4, place: 1.95 },
    image: horseImages[2],
  },
  {
    id: "midnight-run",
    horse: "Midnight Run",
    jockey: "David Miller",
    owner: "Nora Bennett",
    lane: 7,
    weight: "54kg",
    form: "4-2-2",
    probability: 38,
    odds: { win: 4.2, place: 2.25 },
    image: horseImages[3],
  },
  {
    id: "crimson-comet",
    horse: "Crimson Comet",
    jockey: "Maya Chen",
    owner: "Rachel Nguyen",
    lane: 2,
    weight: "55kg",
    form: "5-3-1",
    probability: 29,
    odds: { win: 5.6, place: 2.9 },
    image: horseImages[0],
  },
];

const betTypes = [
  { id: "win", label: "Win", slots: ["Winner"], description: "Pick the horse that finishes first." },
  { id: "place", label: "Place", slots: ["Top 3"], description: "Pick one horse to finish in the paid positions." },
  { id: "exacta", label: "Exacta", slots: ["1st", "2nd"], description: "Pick first and second in exact order." },
  { id: "trifecta", label: "Trifecta", slots: ["1st", "2nd", "3rd"], description: "Pick first, second, and third in exact order." },
];

const activePredictions = [
  { race: "Opening Sprint", type: "Win", pick: "Thunderbolt", stake: 200, odds: "2.10x", status: "Pending" },
  { race: "Derby Trial", type: "Place", pick: "Silver Flash", stake: 120, odds: "1.70x", status: "Locked" },
  { race: "Worcester Chase", type: "Exacta", pick: "Thunderbolt / Golden Gallop", stake: 80, odds: "7.14x", status: "Pending" },
];

const stakeOptions = [50, 100, 200, 500];
const walletBalance = 1280;

const formatPoints = (value) => `${Number(value || 0).toLocaleString()} pts`;

const getComboOdds = (selectedHorses, betType) => {
  if (selectedHorses.length === 0) {
    return 0;
  }

  if (betType === "win") {
    return selectedHorses[0].odds.win;
  }

  if (betType === "place") {
    return selectedHorses[0].odds.place;
  }

  const product = selectedHorses.reduce((total, horse) => total * horse.odds.win, 1);
  const multiplier = betType === "exacta" ? 0.92 : 1.18;
  return Number((product * multiplier).toFixed(2));
};

const SelectionBuilder = ({ activeBetType, selections, onClearSlot, onClearAll }) => (
  <div className="prediction-room-builder">
    <div className="prediction-room-builder__header">
      <div>
        <span><ShieldCheck size={15} /> Selection builder</span>
        <small>{activeBetType.description}</small>
      </div>
      {selections.length > 0 && (
        <button type="button" onClick={onClearAll}>
          Clear all
        </button>
      )}
    </div>
    <div className="prediction-room-slots">
      {activeBetType.slots.map((slot, index) => {
        const selected = selections[index];

        return (
          <button
            className={`prediction-room-slot ${selected ? "prediction-room-slot--filled" : ""}`}
            key={slot}
            type="button"
            onClick={() => selected && onClearSlot(index)}
          >
            <span>{slot}</span>
            <strong>{selected?.horse ?? "Select horse"}</strong>
          </button>
        );
      })}
    </div>
  </div>
);

const ConfirmModal = ({ payload, onClose, onConfirm }) => {
  if (!payload) {
    return null;
  }

  return (
    <div className="prediction-confirm-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="prediction-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prediction-confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="prediction-confirm-modal__close" type="button" aria-label="Close confirmation" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="prediction-confirm-modal__intro">
          <span className="prediction-confirm-modal__badge"><ReceiptText size={14} /> Review prediction</span>
          <h2 id="prediction-confirm-title">Confirm fixed-odds prediction</h2>
          <p>Odds are locked after confirmation. The win probability model can change later, but this slip keeps the displayed fixed odds.</p>
        </div>

        <div className="prediction-confirm-hero">
          <div>
            <span>Potential payout</span>
            <strong>{formatPoints(payload.payout)}</strong>
          </div>
          <div>
            <span>Fixed odds</span>
            <strong>{payload.odds.toFixed(2)}x</strong>
          </div>
        </div>

        <div className="prediction-confirm-summary">
          <div><span>Race</span><strong>{payload.race}</strong></div>
          <div><span>Bet type</span><strong>{payload.betType}</strong></div>
          <div><span>Selection</span><strong>{payload.selection}</strong></div>
          <div><span>Stake</span><strong>{formatPoints(payload.stake)}</strong></div>
        </div>

        <div className="prediction-confirm-actions">
          <button className="spectator-button" type="button" onClick={onClose}>Cancel</button>
          <button className="spectator-button spectator-button--primary" type="button" onClick={onConfirm}>
            Confirm prediction
          </button>
        </div>
      </section>
    </div>
  );
};

const PredictionDetail = () => {
  const { tournamentId } = useParams();
  const tournament = tournaments.find((item) => item.id === Number(tournamentId));
  const [selectedRaceId, setSelectedRaceId] = useState(races[0].id);
  const [betTypeId, setBetTypeId] = useState("win");
  const [selections, setSelections] = useState([]);
  const [stake, setStake] = useState(200);
  const [confirmPayload, setConfirmPayload] = useState(null);
  const [localPredictions, setLocalPredictions] = useState(activePredictions);
  const [successMessage, setSuccessMessage] = useState("");

  const selectedRace = races.find((race) => race.id === selectedRaceId) ?? races[0];
  const activeBetType = betTypes.find((type) => type.id === betTypeId) ?? betTypes[0];
  const selectedHorses = selections.filter(Boolean);
  const isSelectionComplete = selectedHorses.length === activeBetType.slots.length;
  const fixedOdds = isSelectionComplete ? getComboOdds(selectedHorses, betTypeId) : 0;
  const stakeValue = Number(stake || 0);
  const potentialPayout = useMemo(() => Math.round(stakeValue * fixedOdds), [stakeValue, fixedOdds]);
  const isMarketOpen = tournament?.status !== "Completed" && selectedRace.status !== "Scheduled";
  const canSubmit = isMarketOpen && isSelectionComplete && stakeValue > 0 && stakeValue <= walletBalance;
  const slipHint = !isMarketOpen
    ? "This race is not open for predictions yet."
    : !isSelectionComplete
      ? `Fill ${activeBetType.slots.length} selection ${activeBetType.slots.length > 1 ? "slots" : "slot"} for ${activeBetType.label}.`
      : stakeValue > walletBalance
        ? "Stake exceeds your wallet balance."
        : "Enter a valid stake to continue.";

  useEffect(() => {
    setSelections([]);
  }, [betTypeId, selectedRaceId]);

  if (!tournament) {
    return <Navigate to="/spectator/predictions" replace />;
  }

  const handleHorseSelect = (horse) => {
    if (!isMarketOpen) {
      return;
    }

    setSelections((current) => {
      if (activeBetType.slots.length === 1) {
        return [horse];
      }

      if (current.some((item) => item?.id === horse.id)) {
        return current;
      }

      const next = [...current];
      const emptyIndex = activeBetType.slots.findIndex((_, index) => !next[index]);

      if (emptyIndex === -1) {
        next[next.length - 1] = horse;
      } else {
        next[emptyIndex] = horse;
      }

      return next.slice(0, activeBetType.slots.length);
    });
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    setConfirmPayload({
      race: selectedRace.name,
      betType: activeBetType.label,
      selection: selectedHorses.map((horse) => horse.horse).join(" / "),
      stake: stakeValue,
      odds: fixedOdds,
      payout: potentialPayout,
    });
  };

  const handleConfirmPrediction = () => {
    if (!confirmPayload) {
      return;
    }

    setLocalPredictions((current) => [
      {
        race: confirmPayload.race,
        type: confirmPayload.betType,
        pick: confirmPayload.selection,
        stake: confirmPayload.stake,
        odds: `${confirmPayload.odds.toFixed(2)}x`,
        status: "Pending",
      },
      ...current,
    ]);
    setConfirmPayload(null);
    setSelections([]);
    setSuccessMessage("Prediction locked with fixed odds.");
    window.setTimeout(() => setSuccessMessage(""), 2600);
  };

  return (
    <section className="spectator-page prediction-room-page">
      <Link className="spectator-button prediction-detail-back" to="/spectator/predictions">
        <ArrowLeft size={16} /> Back to prediction overview
      </Link>

      <div className="prediction-room-hero">
        <div>
          <p className="spectator-eyebrow">Prediction room</p>
          <h1 className="spectator-title">{tournament.name}</h1>
          <p className="spectator-copy">
            Pick a race, choose a fixed-odds market, build your selection, and review the slip before locking your prediction.
          </p>
          <div className="prediction-room-hero__meta">
            <span><CalendarDays size={15} /> {tournament.date}</span>
            <span><Flag size={15} /> {tournament.track} / {tournament.distance}</span>
            <span><UsersRound size={15} /> {tournament.entries} entries</span>
          </div>
        </div>

        <aside className="prediction-room-wallet">
          <span><WalletCards size={16} /> Wallet balance</span>
          <strong>{formatPoints(walletBalance)}</strong>
          <small>{selectedRace.status} / closes in {selectedRace.closesIn}</small>
        </aside>
      </div>

      <div className="prediction-room-races" aria-label="Race selector">
        {races.map((race) => (
          <button
            className={`prediction-room-race ${selectedRaceId === race.id ? "prediction-room-race--active" : ""} ${race.status === "Scheduled" ? "prediction-room-race--locked" : ""}`}
            key={race.id}
            type="button"
            onClick={() => setSelectedRaceId(race.id)}
          >
            <span>{race.time}</span>
            <strong>{race.name}</strong>
            <small>{race.distance} / {race.status}</small>
          </button>
        ))}
      </div>

      <div className="prediction-room-signals">
        <article><Activity size={18} /><span>Pool</span><strong>{selectedRace.pool}</strong></article>
        <article><Clock3 size={18} /><span>Closes</span><strong>{selectedRace.closesIn}</strong></article>
        <article><Trophy size={18} /><span>Prize</span><strong>{tournament.prize}</strong></article>
        <article><Lock size={18} /><span>Odds</span><strong>Fixed</strong></article>
      </div>

      <div className="prediction-room-layout">
        <main className="prediction-room-main">
          <section className="prediction-room-panel">
            <div className="prediction-room-section-header">
              <div>
                <span className="spectator-badge"><Info size={14} /> Bet type</span>
                <h2>Select market</h2>
              </div>
            </div>

            <div className="prediction-room-bet-types" role="tablist" aria-label="Bet type">
              {betTypes.map((type) => (
                <button
                  className={betTypeId === type.id ? "prediction-room-bet-type prediction-room-bet-type--active" : "prediction-room-bet-type"}
                  key={type.id}
                  type="button"
                  onClick={() => setBetTypeId(type.id)}
                >
                  <strong>{type.label}</strong>
                  <span>{type.description}</span>
                </button>
              ))}
            </div>

            <SelectionBuilder
              activeBetType={activeBetType}
              selections={selections}
              onClearSlot={(index) => setSelections((current) => current.filter((_, itemIndex) => itemIndex !== index))}
              onClearAll={() => setSelections([])}
            />
          </section>

          <section className="prediction-room-panel">
            <div className="prediction-room-section-header">
              <div>
                <span className="spectator-badge"><BadgeCheck size={14} /> Odds board</span>
                <h2>Race contenders</h2>
              </div>
              <p>Fixed odds are shown now. Probability is reserved for your later algorithm.</p>
            </div>

            <div className="prediction-room-horse-list">
              <div className="prediction-room-horse-head" aria-hidden="true">
                <span>Lane</span>
                <span>Runner</span>
                <span>Win</span>
                <span>Place</span>
                <span>Model</span>
              </div>
              {contenders.map((horse) => {
                const selectedIndex = selections.findIndex((item) => item?.id === horse.id);
                const isSelected = selectedIndex >= 0;

                return (
                  <button
                    className={`prediction-room-horse ${isSelected ? "prediction-room-horse--selected" : ""}`}
                    key={horse.id}
                    type="button"
                    disabled={!isMarketOpen}
                    onClick={() => handleHorseSelect(horse)}
                  >
                    <span className="prediction-room-horse__lane">L{horse.lane}</span>
                    <img src={horse.image} alt={horse.horse} />
                    <span className="prediction-room-horse__name">
                      <strong>{horse.horse}</strong>
                      <small>{horse.jockey} / {horse.owner} / {horse.weight} / Form {horse.form}</small>
                    </span>
                    <span className="prediction-room-horse__odds">
                      <strong>{horse.odds.win.toFixed(2)}x</strong>
                      <small>Win</small>
                    </span>
                    <span className="prediction-room-horse__odds">
                      <strong>{horse.odds.place.toFixed(2)}x</strong>
                      <small>Place</small>
                    </span>
                    <span className="prediction-room-horse__probability">{horse.probability}%</span>
                    {isSelected && <span className="prediction-room-horse__selected"><CheckCircle2 size={15} /> {activeBetType.slots[selectedIndex]}</span>}
                  </button>
                );
              })}
            </div>
          </section>
        </main>

        <aside className="prediction-room-slip">
          <div className="prediction-room-slip__header">
            <span className="spectator-badge spectator-badge--amber"><ReceiptText size={14} /> Slip</span>
            <h2>Review prediction</h2>
          </div>

          <div className="prediction-room-slip__selection">
            <span>Selection</span>
            <strong>{selectedHorses.length ? selectedHorses.map((horse) => horse.horse).join(" / ") : "No horses selected"}</strong>
            <small>{activeBetType.label} / {selectedRace.name}</small>
          </div>

          <label className="prediction-room-field" htmlFor="prediction-room-stake">
            <span>Stake amount</span>
            <input
              id="prediction-room-stake"
              min="10"
              max={walletBalance}
              type="number"
              value={stake}
              onChange={(event) => setStake(event.target.value)}
            />
          </label>

          <div className="prediction-room-stakes">
            {stakeOptions.map((value) => (
              <button key={value} type="button" onClick={() => setStake(value)}>
                {value}
              </button>
            ))}
          </div>

          <div className="prediction-room-summary">
            <div><span>Fixed odds</span><strong>{fixedOdds ? `${fixedOdds.toFixed(2)}x` : "--"}</strong></div>
            <div><span>Potential payout</span><strong>{fixedOdds ? formatPoints(potentialPayout) : "--"}</strong></div>
            <div><span>Wallet after stake</span><strong>{formatPoints(walletBalance - Math.min(stakeValue, walletBalance))}</strong></div>
          </div>

          {!canSubmit && (
            <p className="prediction-room-slip__hint">
              {slipHint}
            </p>
          )}

          <button className="spectator-button spectator-button--primary" type="button" disabled={!canSubmit} onClick={handleSubmit}>
            Confirm prediction
          </button>
        </aside>
      </div>

      <section className="prediction-room-panel">
        <div className="prediction-room-section-header">
          <div>
            <span className="spectator-badge"><ReceiptText size={14} /> Active slips</span>
            <h2>My predictions in this tournament</h2>
          </div>
        </div>

        <div className="prediction-room-active-list">
          {localPredictions.map((prediction) => (
            <article key={`${prediction.race}-${prediction.pick}`}>
              <span className={`spectator-badge ${prediction.status === "Locked" ? "spectator-badge--green" : "spectator-badge--amber"}`}>
                {prediction.status}
              </span>
              <strong>{prediction.pick}</strong>
              <small>{prediction.race} / {prediction.type}</small>
              <b>{formatPoints(prediction.stake)} / {prediction.odds}</b>
            </article>
          ))}
        </div>
      </section>

      <ConfirmModal
        payload={confirmPayload}
        onClose={() => setConfirmPayload(null)}
        onConfirm={handleConfirmPrediction}
      />

      {successMessage && (
        <div className="prediction-room-toast" role="status">
          <CheckCircle2 size={16} /> {successMessage}
        </div>
      )}
    </section>
  );
};

export default PredictionDetail;
