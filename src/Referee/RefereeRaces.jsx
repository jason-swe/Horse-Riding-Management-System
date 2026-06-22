import { useState } from "react";
import { Link } from "react-router-dom";
import LoadingSkeleton from "../components/LoadingSkeleton";
import RefereeLayout from "./RefereeLayout";
import { formatStatus } from "./refereeConstants";
import { useRefereeData } from "./useRefereeData";

function RefereeRaces() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const { races, isLoading, error, isEmpty, isUnavailable, reload } = useRefereeData();
  const statuses = [...new Set(races.map((race) => race.status))];
  const filtered = races.filter((race) => (status === "all" || race.status === status) && `${race.name} ${race.tournament} ${race.track}`.toLowerCase().includes(query.toLowerCase()));

  return <RefereeLayout title="My Races" eyebrow="Assigned race management" description="Only races assigned to your referee profile appear here." actions={<Link className="admin-header__button admin-header__button--ghost" to="/referee">Dashboard</Link>}>
    {isLoading && <LoadingSkeleton ariaLabel="Loading assigned races" rows={4} variant="cards" />}
    {!isLoading && error && <section className="admin-live-state admin-live-state--warning" role="alert">{error} <button type="button" className="admin-header__button admin-header__button--ghost" onClick={reload}>Retry</button></section>}
    {!isLoading && !error && isUnavailable && <section className="admin-live-state">Participant API is partly unavailable. Race metadata remains readable.</section>}
    {!isLoading && !error && <>
      <section className="admin-panel admin-actions-panel"><div className="admin-toolbar"><label className="admin-field"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search race, tournament, or track" /></label><label className="admin-field"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{formatStatus(value)}</option>)}</select></label></div></section>
      {isEmpty ? <section className="admin-panel"><h2>No assigned races</h2><p>Ask an administrator to assign a race to your referee profile.</p></section> : <section className="referee-race-grid" aria-label="Assigned races">{filtered.length === 0 && <article className="admin-panel"><p>No races match the current filters.</p></article>}{filtered.map((race) => <article key={race.id} className="admin-panel referee-race-card"><div className="referee-race-card__header"><div><p className="admin-panel__eyebrow">{race.tournament}</p><h2>{race.name}</h2></div><span className="referee-status-badge referee-status-badge--gray">{formatStatus(race.status)}</span></div><div className="referee-race-card__meta"><div>{race.track}</div><div>{race.date} at {race.startTime}</div><div>{race.participants.length} participants</div><div>{race.violations.length} violations</div></div><div className="admin-tool-card__footer"><Link className="admin-header__button" to={`/referee/races/${race.id}`}>Open Race</Link></div></article>)}</section>}
    </>}
  </RefereeLayout>;
}

export default RefereeRaces;
