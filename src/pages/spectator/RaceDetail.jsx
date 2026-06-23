import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, CheckCircle2, CircleDollarSign, Flag, MapPin, ShieldCheck, UsersRound } from "lucide-react";
import LoadingSkeleton from "../../components/LoadingSkeleton.jsx";
import { useSpectatorTournamentDetail } from "./useSpectatorData.js";
import { mockContenders } from "./live-race/mockRaceFixtures.js";
import RaceViewer2D from "./live-race/RaceViewer2D.jsx";
import { useRaceViewerSession } from "./live-race/useRaceViewerSession.js";
import { BETTING_STATUS, bettingStatusMeta, raceStatusMeta } from "./race/raceStatus.js";
import "./spectator.css";

function ParticipantPreview({ contenders }) {
  return (
    <section className="race-detail-field" aria-label="Prototype race participants">
      <div className="live-race-section-heading">
        <div><span className="live-race-kicker"><UsersRound size={14} /> Prototype field</span><h2>Sample runners and riders</h2></div>
        <small>{contenders.length} fixtures</small>
      </div>
      <div className="race-detail-field__list">
        {contenders.map((horse) => (
          <article className="race-detail-field__row" key={horse.id}>
            <span className="race-detail-field__lane">{horse.lane}</span>
            <img src={horse.image} alt="" />
            <div className="race-detail-field__identity"><strong>{horse.horse}</strong><small>{horse.jockey} / {horse.owner}</small></div>
            <div className="race-detail-field__form"><span>{horse.weight}</span><small>Form {horse.form}</small></div>
            <span className="race-detail-field__approved"><CheckCircle2 size={14} /> Preview</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function RaceDetail() {
  const { raceId, tournamentId } = useParams();
  const { isLoading, races, tournament } = useSpectatorTournamentDetail(tournamentId);
  const race = races.find((item) => String(item.id) === String(raceId));
  const viewer = useRaceViewerSession(race);

  if (isLoading) {
    return <section className="spectator-page"><LoadingSkeleton ariaLabel="Loading race overview" variant="detail" /></section>;
  }

  if (!tournament || !race) return <Navigate to={`/spectator/tournaments/${tournamentId}`} replace />;

  const raceMeta = raceStatusMeta[race.raceStatus];
  const marketMeta = bettingStatusMeta[race.bettingStatus];
  const viewerEyebrow = "Prototype 2D track";
  const rankingEyebrow = "Sample order";
  const rankingTitle = "Fixture positions";
  const statusLabel = "Simulation only";

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
        <span><UsersRound size={15} /> {race.runnerCount === null ? "Participant count unavailable" : `${race.runnerCount}/${race.maxParticipants || "-"} runners`}</span>
      </div>

      <div className="race-detail-data-note" role="status"><ShieldCheck size={16} /><span><strong>Participant preview.</strong> The backend has no spectator-safe participant endpoint, so the runner field and 2D viewer remain an explicitly labelled prototype.</span></div>

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
          <ParticipantPreview contenders={mockContenders} />
        </RaceViewer2D>
      </div>

      <footer className="race-detail-boundary-note">
        <span><ShieldCheck size={15} /> Race information is live; viewer data is a prototype</span>
        <strong>No participant or realtime race API is connected.</strong>
      </footer>
    </section>
  );
}
