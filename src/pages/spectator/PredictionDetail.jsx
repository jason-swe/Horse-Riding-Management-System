import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Flag,
  Info,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Trash2,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { CONNECTION_STATES, MARKET_STATES } from "../../realtime/socketEvents.js";
import { BETTING_STATUS } from "./race/raceStatus.js";
import { useSpectatorRaceMarkets } from "./race/useSpectatorRaceMarkets.js";
import { tournamentRaces, tournaments } from "./tournamentData.js";
import { mockContenders } from "./live-race/mockRaceFixtures.js";
import { useMockRaceSession } from "./live-race/useMockRaceSession.js";
import { BET_TYPES, getBetType, isSelectionComplete, moveSelection, updateSelection } from "./betting/fixedOddsRules.js";
import { createMockFixedOddsMarket, getMarketOdds } from "./betting/mockFixedOddsMarket.js";
import { FIXED_ODDS_MARKET_STATES, validateAcceptedBetReceipt, validateFixedOddsMarket } from "./betting/fixedOddsContract.js";
import { getHorseJockeyImage } from "./spectatorAdapters.js";
import { refereeApi } from "../../api/refereeApi.js";
import "./spectator.css";

const stakeOptions = [50, 100, 200, 500];
const formatPoints = (value) => `${Number(value || 0).toLocaleString()} pts`;

const connectionLabels = {
  [CONNECTION_STATES.CONNECTING]: "Connecting",
  [CONNECTION_STATES.CONNECTED]: "Connected",
  [CONNECTION_STATES.RECONNECTING]: "Reconnecting",
  [CONNECTION_STATES.DISCONNECTED]: "Disconnected",
  [CONNECTION_STATES.ERROR]: "Connection error",
};

function ConfirmModal({ isSubmitting, payload, onClose, onConfirm }) {
  if (!payload) return null;
  return (
    <div className="prediction-confirm-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="prediction-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="prediction-confirm-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="prediction-confirm-modal__close" disabled={isSubmitting} type="button" aria-label="Close confirmation" onClick={onClose}><X size={18} /></button>
        <div className="prediction-confirm-modal__intro">
          <span className="prediction-confirm-modal__badge"><ReceiptText size={14} /> Review bet</span>
          <h2 id="prediction-confirm-title">Confirm fixed odds</h2>
          <p>The accepted receipt keeps these odds even if the market changes later.</p>
        </div>
        <div className="prediction-confirm-hero">
          <div><span>Potential return</span><strong>{formatPoints(payload.payout)}</strong></div>
          <div><span>Fixed odds</span><strong>{payload.odds.toFixed(2)}x</strong></div>
        </div>
        <div className="prediction-confirm-summary">
          <div><span>Race</span><strong>{payload.race}</strong></div>
          <div><span>Bet type</span><strong>{payload.betType}</strong></div>
          <div><span>Selection</span><strong>{payload.selection}</strong></div>
          <div><span>Stake</span><strong>{formatPoints(payload.stake)}</strong></div>
        </div>
        <div className="prediction-confirm-actions">
          <button className="spectator-button" disabled={isSubmitting} type="button" onClick={onClose}>Cancel</button>
          <button className="spectator-button spectator-button--primary" disabled={isSubmitting} type="button" onClick={onConfirm}>{isSubmitting ? "Processing..." : "Place fixed-odds bet"}</button>
        </div>
      </section>
    </div>
  );
}

function SelectionSlots({ contendersById, disabled, onClear, onMove, selection, type }) {
  return (
    <div className={`fixed-odds-slots ${type.ordered ? "is-ordered" : "is-unordered"}`} aria-label={`${type.label} selections`}>
      {type.slots.map((slot, index) => {
        const horse = contendersById.get(selection[index]);
        return (
          <div className={`fixed-odds-slot ${horse ? "is-filled" : ""}`} key={slot}>
            <span>{type.ordered ? slot : `Pick ${index + 1}`}</span>
            {horse ? <><img src={horse.image} alt="" /><strong>{horse.horse}</strong></> : <strong>Select a runner</strong>}
            {horse && type.ordered && type.cardinality > 1 && <div className="fixed-odds-slot__move">
              <button disabled={disabled || index === 0} type="button" aria-label={`Move ${horse.horse} up`} onClick={() => onMove(index, -1)}><ArrowUp size={13} /></button>
              <button disabled={disabled || index === selection.length - 1} type="button" aria-label={`Move ${horse.horse} down`} onClick={() => onMove(index, 1)}><ArrowDown size={13} /></button>
            </div>}
            {horse && <button className="fixed-odds-slot__remove" disabled={disabled} type="button" aria-label={`Remove ${horse.horse}`} onClick={() => onClear(horse.id)}><X size={14} /></button>}
          </div>
        );
      })}
    </div>
  );
}

export default function PredictionDetail() {
  const { raceId } = useParams();
  const { isLoading: racesLoading, races } = useSpectatorRaceMarkets();
  const race = races.find((item) => String(item.id) === String(raceId))
    || tournamentRaces.find((item) => String(item.id) === String(raceId));
  const tournament = tournaments[0];
  const realtime = useMockRaceSession(race?.id || "missing-race");
  const [betTypeId, setBetTypeId] = useState("win");
  const [selection, setSelection] = useState([]);
  const [stake, setStake] = useState(200);
  const [confirmPayload, setConfirmPayload] = useState(null);
  const [message, setMessage] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const type = getBetType(betTypeId);
  const mockFixedOddsMarket = useMemo(() => createMockFixedOddsMarket(race?.id || "missing-race"), [race?.id]);
  const marketValidation = useMemo(() => validateFixedOddsMarket(mockFixedOddsMarket, race?.id), [mockFixedOddsMarket, race?.id]);
  const contendersById = useMemo(() => new Map(mockContenders.map((horse) => [horse.id, horse])), []);
  const selectedHorses = selection.map((id) => contendersById.get(id)).filter(Boolean);
  const selectionComplete = isSelectionComplete(selection, type);
  const fixedOdds = selectionComplete ? getMarketOdds(mockFixedOddsMarket, type, selection) : 0;
  const stakeValue = Number(stake);
  const stakeValid = String(stake).trim() !== "" && Number.isFinite(stakeValue) && stakeValue >= realtime.minStake && stakeValue <= realtime.maxStake && stakeValue <= realtime.balance;
  const potentialReturn = fixedOdds ? Math.round(stakeValue * fixedOdds) : 0;
  const marketOpen = marketValidation.isValid && mockFixedOddsMarket.status === FIXED_ODDS_MARKET_STATES.OPEN && race?.bettingStatus === BETTING_STATUS.OPEN && realtime.isMarketOpen;
  const formDisabled = !marketOpen || realtime.isSubmittingBet;
  const canSubmit = marketOpen && selectionComplete && stakeValid && fixedOdds > 0 && !realtime.isSubmittingBet;

  useEffect(() => {
    setSelection([]);
    setMessage(null);
  }, [betTypeId]);

  useEffect(() => {
    if (!marketOpen) setConfirmPayload(null);
  }, [marketOpen]);

  useEffect(() => {
    setSelection((current) => current.filter((horseId) => mockFixedOddsMarket.runnerStatuses[horseId] === "active"));
  }, [realtime.marketState]);

  if (racesLoading) return null;
  if (!race) return <Navigate to="/spectator/predictions" replace />;

  const handleSelect = (horseId) => {
    if (formDisabled) return;
    setSelection((current) => updateSelection(current, horseId, type));
    setMessage(null);
  };

  const handleReview = () => {
    if (!canSubmit) return;
    setConfirmPayload({
      race: race.name,
      betType: type.label,
      selection: selectedHorses.map((horse, index) => `${type.ordered && type.cardinality > 1 ? `${type.slots[index]}: ` : ""}${horse.horse}`).join(type.ordered ? " / " : " + "),
      horseIds: selection,
      stake: stakeValue,
      odds: fixedOdds,
      payout: potentialReturn,
    });
  };

  const handleConfirm = async () => {
    if (!confirmPayload || !marketOpen) return;
    try {
      const request = {
        market_id: mockFixedOddsMarket.id,
        bet_type: type.id,
        client_request_id: globalThis.crypto?.randomUUID?.() || `mock-${Date.now()}`,
        displayed_odds: confirmPayload.odds,
        horse_ids: confirmPayload.horseIds,
        race_id: race.id,
        stake: confirmPayload.stake,
      };
      const response = await realtime.submitBet(request);
      const receiptValidation = validateAcceptedBetReceipt(response, request);
      if (!receiptValidation.isValid) throw new Error(`Invalid accepted receipt: ${receiptValidation.errors.join(" ")}`);
      const acceptedReceipt = {
        id: response.bet.id,
        ...confirmPayload,
        odds: response.bet.accepted_odds,
        payout: response.bet.potential_return,
        status: "Accepted",
      };
      setReceipts((current) => [acceptedReceipt, ...current]);
      setConfirmPayload(null);
      setSelection([]);
      setMessage({ type: "success", text: `Bet accepted at ${response.bet.accepted_odds.toFixed(2)}x. Balance: ${formatPoints(response.wallet.balance)}.` });
    } catch (error) {
      setConfirmPayload(null);
      setMessage({ type: "error", text: error.message || "The bet was rejected." });
    }
  };

  const hint = !marketOpen
    ? realtime.connectionState !== CONNECTION_STATES.CONNECTED ? "A live connection is required before betting." : "This market is locked. Selections and stake controls are disabled."
    : !selectionComplete ? `Select ${type.cardinality} unique ${type.cardinality === 1 ? "runner" : "runners"} for ${type.label}.`
      : !stakeValid ? `Stake must be ${formatPoints(realtime.minStake)} to ${formatPoints(Math.min(realtime.maxStake, realtime.balance))}.`
        : "Review the slip before confirming. Odds are finalized by the server.";

  return (
    <section className="spectator-page fixed-odds-page">
      <div className="fixed-odds-topline">
        <Link className="tournament-detail-back" to={`/spectator/tournaments/${tournament.id}`}><ArrowLeft size={16} /> Back to tournament</Link>
        <div className={`fixed-odds-connection fixed-odds-connection--${realtime.connectionState}`}><span className="live-race-dot" /> {connectionLabels[realtime.connectionState]}</div>
      </div>

      <header className="fixed-odds-header">
        <div>
          <p className="spectator-eyebrow">Fixed-odds market / {tournament.name}</p>
          <h1>{race.name}</h1>
          <div className="fixed-odds-header__meta">
            <span><CalendarDays size={14} /> {race.time}</span><span><Flag size={14} /> {race.distance}</span><span><UsersRound size={14} /> {mockContenders.length} runners</span>
          </div>
        </div>
        <div className="fixed-odds-clock"><span>Market locks in</span><strong>{realtime.countdown}</strong><small>{realtime.marketState === MARKET_STATES.OPEN ? "Betting open" : "Market locked"}</small></div>
      </header>

      {(realtime.error || realtime.connectionState === CONNECTION_STATES.DISCONNECTED) && <div className="live-race-state-message live-race-state-message--error" role="alert">{realtime.error || "Connection lost. Betting remains locked until a fresh server state is received."}</div>}
      {!marketValidation.isValid && <div className="live-race-state-message live-race-state-message--error" role="alert">Market contract mismatch. Betting is disabled until a valid snapshot is received.</div>}

      <div className="fixed-odds-workspace">
        <main className="fixed-odds-board">
          <div className="fixed-odds-board__heading">
            <div><span className="live-race-kicker"><CircleDollarSign size={14} /> Odds board</span><h2>Choose your market</h2></div>
            <Link to={`/spectator/tournaments/${tournament.id}/races/${race.id}`}>View race track <ArrowRight size={15} /></Link>
          </div>

          <div className="fixed-odds-tabs" role="tablist" aria-label="Bet type">
            {BET_TYPES.map((item) => <button aria-selected={type.id === item.id} className={type.id === item.id ? "is-active" : ""} disabled={realtime.isSubmittingBet} key={item.id} role="tab" type="button" onClick={() => setBetTypeId(item.id)}>{item.label}</button>)}
          </div>

          <div className="fixed-odds-market-note"><Info size={15} /><span><strong>{type.label}:</strong> {type.description} {type.id === "place" || type.id === "show" ? "Settlement positions remain subject to the final backend rules." : ""}</span></div>

          <SelectionSlots contendersById={contendersById} disabled={formDisabled} onClear={handleSelect} onMove={(index, direction) => setSelection((current) => moveSelection(current, index, direction))} selection={selection} type={type} />

          <section className="fixed-odds-runners" aria-label="Runner odds">
            <div className="fixed-odds-runners__labels"><span>Runner</span><span>Form</span><span>{type.cardinality === 1 ? "Fixed odds" : "Selection"}</span></div>
            {mockContenders.map((horse) => {
              const isUnavailable = mockFixedOddsMarket.runnerStatuses[horse.id] !== "active";
              const selectedIndex = selection.indexOf(horse.id);
              const selected = selectedIndex >= 0;
              const singlePrice = type.cardinality === 1 ? mockFixedOddsMarket.selections[type.id][horse.id] : 0;
              return <article className={`fixed-odds-runner ${selected ? "is-selected" : ""} ${isUnavailable ? "is-unavailable" : ""}`} key={horse.id}>
                <span className="fixed-odds-runner__lane">{horse.lane}</span><img src={horse.image} alt="" />
                <div className="fixed-odds-runner__identity"><strong>{horse.horse}</strong><small>{horse.jockey} / {horse.weight}</small></div>
                <div className="fixed-odds-runner__form"><strong>{horse.form}</strong><small>{horse.probability}% model</small></div>
                <button disabled={formDisabled || isUnavailable} type="button" onClick={() => handleSelect(horse.id)}>{isUnavailable ? "Scratched" : selected ? <><Check size={15} /> {type.cardinality > 1 ? type.slots[selectedIndex] : "Selected"}</> : singlePrice ? `${singlePrice.toFixed(2)}x` : "Add"}</button>
              </article>;
            })}
          </section>
        </main>

        <aside className={`fixed-odds-slip ${formDisabled ? "is-locked" : ""}`}>
          <div className="fixed-odds-slip__wallet"><span><WalletCards size={15} /> Available balance</span><strong>{formatPoints(realtime.balance)}</strong><small>Updated by wallet events</small></div>
          <div className="fixed-odds-slip__heading"><span className="live-race-kicker"><ReceiptText size={14} /> Bet slip</span><h2>{type.label}</h2><p>{selectedHorses.length}/{type.cardinality} selections complete</p></div>

          <div className="fixed-odds-slip__selections">
            {type.slots.map((slot, index) => {
              const horse = selectedHorses[index];
              return <div key={slot}><span>{type.ordered ? slot : `Pick ${index + 1}`}</span><strong>{horse?.horse || "Not selected"}</strong>{horse && <button disabled={formDisabled} type="button" aria-label={`Remove ${horse.horse}`} onClick={() => handleSelect(horse.id)}><Trash2 size={14} /></button>}</div>;
            })}
          </div>

          <label className="fixed-odds-stake" htmlFor="fixed-odds-stake"><span>Stake</span><div><input aria-invalid={String(stake).trim() !== "" && !stakeValid} disabled={formDisabled} id="fixed-odds-stake" min={realtime.minStake} max={Math.min(realtime.maxStake, realtime.balance)} type="number" value={stake} onChange={(event) => { setStake(event.target.value); setMessage(null); }} /><small>PTS</small></div></label>
          <div className="fixed-odds-quick-stakes">{stakeOptions.map((value) => <button disabled={formDisabled || value > realtime.balance} key={value} type="button" onClick={() => setStake(value)}>{value}</button>)}</div>

          <div className="fixed-odds-slip__totals">
            <div><span>Fixed odds</span><strong>{fixedOdds ? `${fixedOdds.toFixed(2)}x` : "--"}</strong></div>
            <div><span>Potential return</span><strong>{fixedOdds && stakeValid ? formatPoints(potentialReturn) : "--"}</strong></div>
          </div>
          <p className="fixed-odds-slip__hint"><Info size={14} /> {hint}</p>
          {message && <p className={`fixed-odds-message fixed-odds-message--${message.type}`} role={message.type === "error" ? "alert" : "status"}>{message.text}</p>}
          <button className="fixed-odds-review" disabled={!canSubmit} type="button" onClick={handleReview}><LockKeyhole size={16} /> Review bet</button>
          <p className="fixed-odds-security"><ShieldCheck size={14} /><span>Every control locks immediately on <code>stop_betting</code>.</span></p>
        </aside>
      </div>

      {receipts.length > 0 && <section className="fixed-odds-receipts"><div className="live-race-section-heading"><div><span className="live-race-kicker"><CheckCircle2 size={14} /> Accepted bets</span><h2>Fixed-odds receipts</h2></div><small>{receipts.length} accepted</small></div>{receipts.map((receipt) => <article key={receipt.id}><span>{receipt.status}</span><div><strong>{receipt.selection}</strong><small>{receipt.betType} / {receipt.odds.toFixed(2)}x</small></div><b>{formatPoints(receipt.stake)}</b></article>)}</section>}

      <ConfirmModal isSubmitting={realtime.isSubmittingBet} payload={confirmPayload} onClose={() => { if (!realtime.isSubmittingBet) setConfirmPayload(null); }} onConfirm={handleConfirm} />
    </section>
  );
}
