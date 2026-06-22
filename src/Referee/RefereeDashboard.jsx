import { Link } from "react-router-dom";
import LoadingSkeleton from "../components/LoadingSkeleton";
import RefereeLayout from "./RefereeLayout";
import { formatStatus, getRacePhase, RACE_PHASES } from "./refereeConstants";
import { useRefereeData } from "./useRefereeData";

function RefereeDashboard() {
  const { races, isLoading, error, isEmpty, isUnavailable, reload } = useRefereeData();
  const counts = {
    pre: races.filter((race) => getRacePhase(race.status) === RACE_PHASES.PRE_RACE).length,
    during: races.filter((race) => getRacePhase(race.status) === RACE_PHASES.DURING_RACE).length,
    post: races.filter((race) => getRacePhase(race.status) === RACE_PHASES.POST_RACE).length,
  };

  return (
    <RefereeLayout title="Referee Control Center" eyebrow="Assigned race operations" description="Inspect runners, record race incidents, prepare draft results, and submit referee reports." actions={<Link className="admin-header__button" to="/referee/races">My Races</Link>}>
      {isLoading && <LoadingSkeleton ariaLabel="Loading referee dashboard" variant="page" />}
      {!isLoading && error && <section className="admin-live-state admin-live-state--warning" role="alert">{error} <button className="admin-header__button admin-header__button--ghost" type="button" onClick={reload}>Retry</button></section>}
      {!isLoading && !error && isUnavailable && <section className="admin-live-state" aria-live="polite">Some participant records are unavailable. Race actions that require participants are disabled until the API responds.</section>}
      {!isLoading && !error && isEmpty && <section className="admin-panel"><h2>No assigned races</h2><p>Your account has no races assigned by an administrator.</p></section>}
      {!isLoading && !error && !isEmpty && <>
        <section className="admin-metrics" aria-label="Assigned race summary">
          <article className="admin-metric-card"><p className="admin-metric-card__label">Total Assigned</p><div className="admin-metric-card__value">{races.length}</div></article>
          <article className="admin-metric-card"><p className="admin-metric-card__label">Pre-race</p><div className="admin-metric-card__value referee-metric--blue">{counts.pre}</div></article>
          <article className="admin-metric-card"><p className="admin-metric-card__label">During race</p><div className="admin-metric-card__value referee-metric--amber">{counts.during}</div></article>
          <article className="admin-metric-card"><p className="admin-metric-card__label">Post-race</p><div className="admin-metric-card__value referee-metric--green">{counts.post}</div></article>
        </section>
        <section className="admin-panel">
          <div className="admin-panel__header"><p className="admin-panel__eyebrow">Schedule</p><h2>Assigned Races</h2></div>
          <div className="admin-data-table__wrap"><table className="admin-data-table"><thead><tr><th>Race</th><th>Tournament</th><th>Date</th><th>Status</th><th>Participants</th></tr></thead><tbody>{races.map((race) => <tr key={race.id}><td><Link className="referee-table-link" to={`/referee/races/${race.id}`}>{race.name}</Link></td><td>{race.tournament}</td><td>{race.date} {race.startTime}</td><td>{formatStatus(race.status)}</td><td>{race.participants.length}</td></tr>)}</tbody></table></div>
        </section>
      </>}
    </RefereeLayout>
  );
}

export default RefereeDashboard;
