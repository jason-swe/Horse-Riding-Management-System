import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Coins,
  Flag,
  Lock,
  MapPin,
  Shield,
  ShieldCheck,
  Trophy,
  Unlock,
  Users,
  UsersRound,
} from "lucide-react";
import LoadingSkeleton from "../../components/LoadingSkeleton.jsx";
import { useSpectatorTournamentDetail, useSpectatorRaceResultsSingle } from "./useSpectatorData.js";
import { getHorseJockeyImage } from "./spectatorAdapters.js";
import { mockContenders } from "./live-race/mockRaceFixtures.js";
import RaceViewer2D from "./live-race/RaceViewer2D.jsx";
import { useRaceViewerSession } from "./live-race/useRaceViewerSession.js";
import { refereeApi } from "../../api/refereeApi.js";
import {
  BETTING_STATUS,
  RACE_STATUS,
  bettingStatusMeta,
  raceStatusMeta,
} from "./race/raceStatus.js";
import "./spectator.css";

function StatusPill({ meta }) {
  if (!meta) return null;
  return (
    <span className={`race-hub-status race-hub-status--${meta.tone}`}>{meta.label}</span>
  );
}

function FactCard({ icon: Icon, label, value, accent }) {
  return (
    <div className={`rd-fact${accent ? " rd-fact--accent" : ""}`}>
      <span className="rd-fact__label">
        <Icon size={14} />
        {label}
      </span>
      <strong className="rd-fact__value">{value}</strong>
    </div>
  );
}

function ParticipantPreview({ contenders, isOfficial, isLiveConnection }) {
  const isReal = isOfficial || isLiveConnection;
  return (
    <section className="race-detail-field" aria-label={isReal ? "Race participants" : "Prototype race participants"}>
      <div className="live-race-section-heading">
        <div>
          <span className="live-race-kicker">
            <UsersRound size={14} /> {isReal ? "Field" : "Prototype field"}
          </span>
          <h2>{isReal ? "Runners and riders" : "Sample runners and riders"}</h2>
        </div>
        <small>{contenders.length} fixtures</small>
      </div>
      <div className="race-detail-field__list">
        {contenders.map((horse) => (
          <article className="race-detail-field__row" key={horse.id}>
            <span className="race-detail-field__lane">{horse.lane}</span>
            <img src={horse.image} alt="" />
            <div className="race-detail-field__identity">
              <strong>{horse.horse}</strong>
              <small>
                {horse.jockey} {horse.owner && `/ ${horse.owner}`}
              </small>
            </div>
            <div className="race-detail-field__form">
              <span>{horse.weight}</span>
              {!isReal && <small>Form {horse.form}</small>}
            </div>
            <span className="race-detail-field__approved">
              <CheckCircle2 size={14} /> {isReal ? "Official" : "Preview"}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

function seededRandom(seedStr) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  return function() {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    return hash / 0xffffffff;
  };
}

export default function RaceDetail() {
  const { raceId, tournamentId } = useParams();
  const { isLoading: isLoadingTournament, races, tournament } = useSpectatorTournamentDetail(tournamentId);
  const { results: realResults, isLoading: isLoadingResults } = useSpectatorRaceResultsSingle(raceId);
  const race = races.find((item) => String(item.id) === String(raceId));

  const [backendParticipants, setBackendParticipants] = useState([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  const hasRealResults = realResults && realResults.length > 0;

  useEffect(() => {
    if (!raceId || hasRealResults) return;

    let active = true;
    async function fetchParticipants() {
      setIsLoadingParticipants(true);
      try {
        const data = await refereeApi.getRaceParticipants(raceId);
        if (active && data && data.participants) {
          const mapped = data.participants.map((p, idx) => {
            const horse = p.horse;
            const jockey = p.jockey || p.assignment?.jockey_id;
            return {
              id: horse._id || horse.id,
              horse: horse.name,
              jockey: jockey?.user_id?.full_name || jockey?.full_name || "Unknown Jockey",
              owner: p.owner?.user_id?.full_name || "Horse Owner",
              lane: p.registration?.lane != null ? Number(p.registration.lane) : idx + 1,
              weight: horse.weight ? `${horse.weight}kg` : "56kg",
              form: "—",
              image: getHorseJockeyImage(horse._id || horse.id),
              color: ["#f0a15c", "#9dd5b1", "#eee7d4", "#d96a61", "#78b9ef", "#e6b080", "#b1ebd6", "#80c4e6"][idx % 8],
              position: idx + 1,
            };
          });
          setBackendParticipants(mapped);
        }
      } catch (err) {
        console.warn("Could not fetch real participants from backend (spectator access may be restricted):", err.message);
      } finally {
        if (active) setIsLoadingParticipants(false);
      }
    }

    fetchParticipants();
    return () => {
      active = false;
    };
  }, [raceId, hasRealResults]);

  const realContenders = hasRealResults
    ? realResults.map((r, idx) => ({
        id: r.horseId,
        horse: r.horse,
        jockey: r.jockey,
        owner: "Horse Owner",
        lane: r.lane !== "-" && r.lane != null ? Number(r.lane) : idx + 1,
        weight: r.weight ? `${r.weight}kg` : "56kg",
        form: "—",
        image: getHorseJockeyImage(r.horseId),
        color: ["#f0a15c", "#9dd5b1", "#eee7d4", "#d96a61", "#78b9ef", "#e6b080", "#b1ebd6", "#80c4e6"][idx % 8],
        position: Number(r.position),
      }))
    : [];

  let contenders = [];
  if (hasRealResults) {
    contenders = [...realContenders];
  } else if (backendParticipants.length > 0) {
    const rand = seededRandom(raceId || "default-race-id");
    const indices = Array.from({ length: backendParticipants.length }, (_, i) => i + 1);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    contenders = backendParticipants.map((p, idx) => ({
      ...p,
      position: indices[idx],
    }));
  } else {
    const usedLanes = new Set();
    const usedIds = new Set();
    let nextLane = 1;
    for (const mock of mockContenders) {
      if (contenders.length >= 8) break;
      if (usedIds.has(mock.id)) continue;
      while (usedLanes.has(nextLane)) {
        nextLane++;
      }
      contenders.push({
        ...mock,
        lane: nextLane,
        position: contenders.length + 1,
      });
      usedLanes.add(nextLane);
      usedIds.add(mock.id);
    }
  }

  contenders.sort((a, b) => a.lane - b.lane);

  const viewer = useRaceViewerSession(race, contenders);

  const isLoading = isLoadingTournament || isLoadingResults || isLoadingParticipants;

  if (isLoading) {
    return (
      <section className="spectator-page">
        <LoadingSkeleton ariaLabel="Loading race overview" variant="detail" />
      </section>
    );
  }

  if (!tournament || !race)
    return <Navigate to={`/spectator/tournaments/${tournamentId}`} replace />;

  const raceMeta = raceStatusMeta[race.raceStatus];
  const marketMeta =
    race.bettingStatus === BETTING_STATUS.UNAVAILABLE
      ? null
      : bettingStatusMeta[race.bettingStatus];

  const canBet = race.bettingStatus === BETTING_STATUS.OPEN;
  const isScheduled = race.raceStatus === RACE_STATUS.SCHEDULED;

  const raceResult = hasRealResults
    ? {
        race_id: raceId,
        finished_at: realResults[0]?.publishedAt || new Date().toISOString(),
        results: realResults.map((r) => ({
          horse_id: r.horseId,
          position: Number(r.position),
          finish_time_ms: Number(r.time) * 1000,
        })),
        sequence: 301,
      }
    : viewer.raceResult;

  const isResultPending = race.raceStatus === RACE_STATUS.COMPLETED && !hasRealResults;
  const viewerEyebrow = hasRealResults ? "Official 2D track" : isResultPending ? "Result pending" : backendParticipants.length > 0 ? "Live 2D track" : "Prototype 2D track";
  const rankingEyebrow = hasRealResults ? "Official ranking" : isResultPending ? "Race Engine" : backendParticipants.length > 0 ? "Live order" : "Sample order";
  const rankingTitle = hasRealResults ? "Final standings" : isResultPending ? "Awaiting official standings" : backendParticipants.length > 0 ? "Current positions" : "Fixture positions";
  const statusLabel = hasRealResults ? "Official" : isResultPending ? "Awaiting official result" : backendParticipants.length > 0 ? "Live" : "Simulation only";

  const coreFactItems = [
    race.raceDateDisplay
      ? { icon: CalendarDays, label: "Race date", value: race.raceDateDisplay }
      : null,
    race.time ? { icon: Clock3, label: "Start time", value: race.time } : null,
    race.distance ? { icon: Flag, label: "Distance", value: race.distance } : null,
    race.location || tournament.location
      ? { icon: MapPin, label: "Venue", value: race.location || tournament.location }
      : null,
    race.maxParticipants != null
      ? {
          icon: Users,
          label: "Runners",
          value:
            race.runnerCount != null
              ? `${race.runnerCount} / ${race.maxParticipants}`
              : `Max ${race.maxParticipants}`,
        }
      : null,
    tournament.prize
      ? { icon: Trophy, label: "Tournament prize", value: tournament.prize }
      : null,
  ].filter(Boolean);

  return (
    <section className="spectator-page rd-page">
      {/* Back link */}
      <Link
        className="tournament-detail-back"
        to={`/spectator/tournaments/${tournamentId}`}
      >
        <ArrowLeft size={16} /> Back to race schedule
      </Link>

      {/* ── Hero ── */}
      <header className="rd-hero">
        <div className="rd-hero__image-wrap">
          <img src={race.image} alt={race.name} />
          <div className="rd-hero__image-overlay" />
        </div>
        <div className="rd-hero__content">
          <p className="spectator-eyebrow">
            {tournament.name}
            {race.roundName ? ` · ${race.roundName}` : ""}
          </p>
          <h1 className="rd-hero__title">{race.name}</h1>
          <div className="rd-hero__status-row">
            <StatusPill meta={raceMeta} />
            <StatusPill meta={marketMeta} />
          </div>
          {canBet && (
            <Link
              className="race-hub-action race-hub-action--primary rd-hero__bet-cta"
              to={`/spectator/predictions/races/${encodeURIComponent(race.id)}`}
            >
              Bet on this race <CircleDollarSign size={16} />
            </Link>
          )}
        </div>
      </header>

      {/* ── Core Facts ── */}
      {coreFactItems.length > 0 && (
        <section className="rd-facts-panel" aria-label="Race details">
          <h2 className="rd-panel-title">
            <Flag size={15} /> Race details
          </h2>
          <div className="rd-facts-grid">
            {coreFactItems.map(({ icon, label, value }) => (
              <FactCard key={label} icon={icon} label={label} value={value} />
            ))}
          </div>
        </section>
      )}

      {/* ── Betting Market Panel ── */}
      {race.bettingMarket && race.bettingStatus !== BETTING_STATUS.UNAVAILABLE && (
        <section className="rd-market-panel" aria-label="Betting market">
          <h2 className="rd-panel-title">
            <Coins size={15} /> Betting market
          </h2>
          <div className="rd-market-grid">
            <div className="rd-market-card rd-market-card--status">
              <span>Market status</span>
              <StatusPill meta={marketMeta} />
            </div>
            {race.bettingMarket.minStake != null && (
              <div className="rd-market-card">
                <span>Min stake</span>
                <strong>
                  {race.bettingMarket.minStake} {race.bettingMarket.currency}
                </strong>
              </div>
            )}
            {race.bettingMarket.maxStake != null && (
              <div className="rd-market-card">
                <span>Max stake</span>
                <strong>
                  {race.bettingMarket.maxStake} {race.bettingMarket.currency}
                </strong>
              </div>
            )}
            {race.bettingMarket.closesAtDisplay && (
              <div className="rd-market-card">
                <span>Closes</span>
                <strong>
                  {race.bettingMarket.closesAtDisplay}
                  {race.bettingMarket.closesAtTimeDisplay
                    ? ` · ${race.bettingMarket.closesAtTimeDisplay}`
                    : ""}
                </strong>
              </div>
            )}
          </div>

          {canBet && (
            <Link
              className="race-hub-action race-hub-action--primary rd-market-cta"
              to={`/spectator/predictions/races/${encodeURIComponent(race.id)}`}
            >
              Place a bet <CircleDollarSign size={16} />
            </Link>
          )}
        </section>
      )}

      {/* ── Referee & Registration ── */}
      <section className="rd-meta-row" aria-label="Race administration">
        {race.refereeName && (
          <div className="rd-meta-card">
            <span className="rd-meta-card__label">
              <Shield size={13} /> Race referee
            </span>
            <strong className="rd-meta-card__value">{race.refereeName}</strong>
            {race.refereeExperience != null && (
              <span className="rd-meta-card__sub">{race.refereeExperience} yrs experience</span>
            )}
          </div>
        )}
        <div className="rd-meta-card">
          <span className="rd-meta-card__label">
            {race.registrationLocked ? <Lock size={13} /> : <Unlock size={13} />}
            Registration
          </span>
          <strong className="rd-meta-card__value">
            {race.registrationLocked ? "Locked" : "Open"}
          </strong>
          <span className="rd-meta-card__sub">
            {race.registrationLocked
              ? "No further entries accepted"
              : "Entries still being accepted"}
          </span>
        </div>
      </section>

      <div className="race-detail-data-note" role="status">
        <ShieldCheck size={16} />
        {hasRealResults ? (
          <span>
            <strong>Official results connected.</strong> Standing details, finish times, and rankings are verified by the official race engine.
          </span>
        ) : backendParticipants.length > 0 ? (
          <span>
            <strong>{isResultPending ? "Race completed." : "Live participants connected."}</strong> {isResultPending ? "Waiting for confirmed Race Engine results before showing the official standings." : "The runner field and 2D viewer are displaying the real-time registration data from the backend."}
          </span>
        ) : (
          <span>
            <strong>Participant preview.</strong> The backend has no spectator-safe participant endpoint, so the runner field and 2D viewer remain an explicitly labelled prototype.
          </span>
        )}
      </div>

      <div className="race-detail-viewer-shell">
        <RaceViewer2D
          connectionState={viewer.connectionState}
          contenders={contenders}
          eyebrow={viewerEyebrow}
          race={race}
          raceResult={raceResult}
          raceScript={viewer.raceScript}
          rankingEyebrow={rankingEyebrow}
          rankingStateLabel={isScheduled ? "Confirmed" : (hasRealResults ? "Official" : undefined)}
          rankingTitle={rankingTitle}
          statusLabel={statusLabel}
        >
          <ParticipantPreview contenders={contenders} isOfficial={hasRealResults} isLiveConnection={backendParticipants.length > 0} />
        </RaceViewer2D>
      </div>

      <footer className="race-detail-boundary-note">
        {hasRealResults ? (
          <span>
            <ShieldCheck size={15} /> Race results are verified and live
          </span>
        ) : backendParticipants.length > 0 ? (
          <span>
            <ShieldCheck size={15} /> {isResultPending ? "Race complete; waiting for official Race Engine result" : "Real-time race participants connected; viewer running in simulation mode"}
          </span>
        ) : (
          <>
            <span>
              <ShieldCheck size={15} /> Race information is live; viewer data is a prototype
            </span>
            <strong>No participant or realtime race API is connected.</strong>
          </>
        )}
      </footer>
    </section>
  );
}
