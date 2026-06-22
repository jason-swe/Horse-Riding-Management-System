import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight, CalendarClock, CircleDollarSign, Flag, MapPin, RefreshCw, Timer, UsersRound, WalletCards } from "lucide-react";
import LoadingSkeleton from "../../components/LoadingSkeleton.jsx";
import { BETTING_STATUS, RACE_STATUS, bettingStatusMeta, raceStatusMeta } from "./race/raceStatus.js";
import { useSpectatorRaceMarkets } from "./race/useSpectatorRaceMarkets.js";
import "./spectator.css";

const filters = [
  { id: "available", label: "Available", test: (race) => race.bettingStatus === BETTING_STATUS.OPEN },
  { id: "opening", label: "Opening soon", test: (race) => race.bettingStatus === BETTING_STATUS.SCHEDULED },
  { id: "live", label: "Live races", test: (race) => race.raceStatus === RACE_STATUS.RUNNING },
  { id: "upcoming", label: "All upcoming", test: (race) => [RACE_STATUS.SCHEDULED, RACE_STATUS.READY].includes(race.raceStatus) },
];

function sortRaceMarkets(races) {
  const weight = (race) => {
    if (race.bettingStatus === BETTING_STATUS.OPEN) return 0;
    if ([RACE_STATUS.SCHEDULED, RACE_STATUS.READY].includes(race.raceStatus)) return 1;
    if (race.raceStatus === RACE_STATUS.RUNNING) return 2;
    return 3;
  };
  return [...races].sort((a, b) => weight(a) - weight(b) || new Date(a.raceDate) - new Date(b.raceDate));
}

function RaceMarketRow({ race }) {
  const raceMeta = raceStatusMeta[race.raceStatus] || raceStatusMeta[RACE_STATUS.UNKNOWN];
  const marketMeta = bettingStatusMeta[race.bettingStatus] || bettingStatusMeta[BETTING_STATUS.UNAVAILABLE];
  const canBet = race.bettingStatus === BETTING_STATUS.OPEN;
  const racePath = `/spectator/tournaments/${race.tournamentId}/races/${race.id}`;
  const primaryPath = canBet ? `/spectator/predictions/races/${race.id}` : racePath;
  const primaryLabel = canBet ? "Open market" : race.raceStatus === RACE_STATUS.RUNNING ? "Watch live" : "View race";

  return (
    <article className={`race-market-row race-market-row--${race.raceStatus}`}>
      <div className="race-market-row__time"><strong>{race.time}</strong><span>{race.roundName}</span></div>
      <div className="race-market-row__identity">
        <div className="race-market-row__context"><span>{race.tournamentName}</span>{race.isPreview && <small>Preview</small>}</div>
        <h2>{race.name}</h2>
        <div className="race-market-row__meta">
          <span><Flag size={14} /> {race.distance}</span><span><MapPin size={14} /> {race.location}</span><span><UsersRound size={14} /> {race.runnerCount}/{race.maxParticipants}</span>
        </div>
      </div>
      <div className="race-market-row__states">
        <span className={`race-hub-status race-hub-status--${raceMeta.tone}`}>{raceMeta.label}</span>
        <span className={`race-hub-status race-hub-status--${marketMeta.tone}`}>{marketMeta.label}</span>
      </div>
      <div className="race-market-row__actions">
        {canBet && <Link className="race-market-row__track" to={racePath}>Race info</Link>}
        <Link className={`race-market-row__primary ${canBet ? "is-open" : ""}`} to={primaryPath}>{canBet && <CircleDollarSign size={16} />}{primaryLabel}<ArrowRight size={15} /></Link>
      </div>
    </article>
  );
}

export default function Predictions() {
  const { error, isLoading, isPreview, races, reload } = useSpectatorRaceMarkets();
  const [filter, setFilter] = useState("upcoming");
  const sortedRaces = useMemo(() => sortRaceMarkets(races), [races]);
  const counts = useMemo(() => Object.fromEntries(filters.map((item) => [item.id, sortedRaces.filter(item.test).length])), [sortedRaces]);
  const visibleRaces = sortedRaces.filter(filters.find((item) => item.id === filter)?.test || (() => true));
  const openCount = counts.available || 0;
  const nextRace = sortedRaces.find((race) => [RACE_STATUS.SCHEDULED, RACE_STATUS.READY].includes(race.raceStatus));

  if (isLoading) return <section className="spectator-page"><LoadingSkeleton ariaLabel="Loading race markets" rows={4} variant="list" /></section>;

  return (
    <section className="spectator-page race-market-board">
      <header className="race-market-board__header">
        <div><p className="spectator-eyebrow">Race markets</p><h1>Choose a race, not a tournament.</h1><p>Open markets come first. Upcoming races stay visible without implying that betting is available.</p></div>
        <aside className="race-market-board__wallet"><span><WalletCards size={15} /> Preview balance</span><strong>1,280 pts</strong><small>Live wallet API pending</small></aside>
      </header>

      <div className="race-market-board__summary">
        <div><CircleDollarSign size={17} /><span>Markets open</span><strong>{openCount}</strong></div>
        <div><Activity size={17} /><span>Races live</span><strong>{counts.live || 0}</strong></div>
        <div><CalendarClock size={17} /><span>Upcoming</span><strong>{counts.upcoming || 0}</strong></div>
        <div><Timer size={17} /><span>Next race</span><strong>{nextRace?.time || "TBD"}</strong></div>
      </div>

      {error && <div className={`race-market-board__notice ${isPreview ? "is-preview" : "is-error"}`} role="status"><span>{error}</span><button type="button" onClick={reload}><RefreshCw size={14} /> Retry</button></div>}

      <section className="race-market-board__schedule">
        <div className="race-market-board__toolbar">
          <div><span className="live-race-kicker"><Flag size={14} /> Race schedule</span><h2>Available and upcoming races</h2></div>
          <div className="race-market-board__filters" role="tablist" aria-label="Race market filter">
            {filters.map((item) => <button aria-selected={filter === item.id} className={filter === item.id ? "is-active" : ""} key={item.id} role="tab" type="button" onClick={() => setFilter(item.id)}><span>{item.label}</span><b>{counts[item.id] || 0}</b></button>)}
          </div>
        </div>

        <div className="race-market-board__list">
          {visibleRaces.length ? visibleRaces.map((race) => <RaceMarketRow key={race.id} race={race} />) : <div className="race-market-board__empty"><strong>No races in this view</strong><span>Choose another filter or retry when the schedule is updated.</span></div>}
        </div>
      </section>
    </section>
  );
}
