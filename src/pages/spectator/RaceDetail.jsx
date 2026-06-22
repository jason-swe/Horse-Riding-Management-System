import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, CheckCircle2, CircleDollarSign, Flag, MapPin, ShieldCheck, UsersRound } from "lucide-react";
import LoadingSkeleton from "../../components/LoadingSkeleton.jsx";
import { useSpectatorTournamentDetail } from "./useSpectatorData.js";
import { mockContenders } from "./live-race/mockRaceFixtures.js";
import RaceViewer2D from "./live-race/RaceViewer2D.jsx";
import { useRaceViewerSession } from "./live-race/useRaceViewerSession.js";
import { BETTING_STATUS, RACE_STATUS, bettingStatusMeta, raceStatusMeta } from "./race/raceStatus.js";
import "./spectator.css";

function ApprovedParticipants({ contenders }) {
  return (
    <section className="race-detail-field" aria-label="Approved race participants">
      <div className="live-race-section-heading">
        <div><span className="live-race-kicker"><UsersRound size={14} /> Approved field</span><h2>Runners and riders</h2></div>
        <small>{contenders.length} cleared</small>
      </div>
      <div className="race-detail-field__list">
        {contenders.map((horse) => (
          <article className="race-detail-field__row" key={horse.id}>
            <span className="race-detail-field__lane">{horse.lane}</span>
            <img src={horse.image} alt="" />
            <div className="race-detail-field__identity"><strong>{horse.horse}</strong><small>{horse.jockey} / {horse.owner}</small></div>
            <div className="race-detail-field__form"><span>{horse.weight}</span><small>Form {horse.form}</small></div>
            <span className="race-detail-field__approved"><CheckCircle2 size={14} /> Approved</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function RaceDetail() {
  const { raceId, tournamentId } = useParams();
  const { error, isLoading, races, tournament, usedFallback } = useSpectatorTournamentDetail(tournamentId);
  const race = races.find((item) => String(item.id) === String(raceId));
  const viewer = useRaceViewerSession(race);

  if (isLoading) {
    return <section className="spectator-page"><LoadingSkeleton ariaLabel="Loading race overview" variant="detail" /></section>;
  }

  if (!tournament || !race) return <Navigate to={`/spectator/tournaments/${tournamentId}`} replace />;

  const raceMeta = raceStatusMeta[race.raceStatus];
  const marketMeta = bettingStatusMeta[race.bettingStatus];
  const isScheduled = [RACE_STATUS.SCHEDULED, RACE_STATUS.READY].includes(race.raceStatus);
  const viewerEyebrow = race.raceStatus === RACE_STATUS.RUNNING ? "Live 2D track" : race.raceStatus === RACE_STATUS.COMPLETED ? "Official race replay" : "Track and starting field";
  const rankingEyebrow = race.raceStatus === RACE_STATUS.RUNNING ? "Live order" : race.raceStatus === RACE_STATUS.COMPLETED ? "Official order" : "Starting order";
  const rankingTitle = race.raceStatus === RACE_STATUS.COMPLETED ? "Final positions" : isScheduled ? "Lane assignment" : "Track positions";
  const statusLabel = isScheduled ? "Starting field confirmed" : undefined;

  return (
    <section className="spectator-page race-overview-page">
      <Link className="tournament-detail-back" to={`/spectator/tournaments/${tournamentId}`}><ArrowLeft size={16} /> Back to race schedule</Link>
      <header className="race-overview-header">
        <div>
          <p className="spectator-eyebrow">{tournament.name} / {race.roundName}</p>
          <h1>{race.name}</h1>
          <div className="race-hub-row__status-line">
            <span className={`race-hub-status race-hub-status--${raceMeta.tone}`}>{raceMeta.label}</span>
            <span className={`race-hub-status race-hub-status--${marketMeta.tone}`}>{marketMeta.label}</span>
          </div>
        </div>
        {race.bettingStatus === BETTING_STATUS.OPEN && (
          <Link className="race-hub-action race-hub-action--primary" to={`/spectator/predictions/races/${encodeURIComponent(race.id)}`}>
            Bet on this race <CircleDollarSign size={16} />
          </Link>
        )}
      </header>

      <div className="race-overview-facts">
        <span><CalendarDays size={15} /> {race.time}</span>
        <span><Flag size={15} /> {race.distance}</span>
        <span><MapPin size={15} /> {race.location}</span>
        <span><UsersRound size={15} /> {race.runnerCount || 0}/{race.maxParticipants || "-"} runners</span>
      </div>

      {(error || usedFallback) && <div className="race-detail-data-note" role="status"><ShieldCheck size={16} /><span><strong>Preview data active.</strong> The spectator participant endpoint is not available yet, so this screen uses the approved five-runner fixture.</span></div>}

      <div className="race-detail-viewer-shell">
        <RaceViewer2D
          connectionState={viewer.connectionState}
          contenders={mockContenders}
          eyebrow={viewerEyebrow}
          race={race}
          raceResult={viewer.raceResult}
          raceScript={viewer.raceScript}
          rankingEyebrow={rankingEyebrow}
          rankingStateLabel={isScheduled ? "Confirmed" : undefined}
          rankingTitle={rankingTitle}
          statusLabel={statusLabel}
        >
          <ApprovedParticipants contenders={mockContenders} />
        </RaceViewer2D>
      </div>

      <footer className="race-detail-boundary-note">
        <span><ShieldCheck size={15} /> Race information and official viewer only</span>
        <strong>No betting controls are available on this page.</strong>
      </footer>
    </section>
  );
}
