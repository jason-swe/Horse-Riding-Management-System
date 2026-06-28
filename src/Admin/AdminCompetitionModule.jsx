import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { adminApi } from "../api/adminApi";
import AdminLayout from "./AdminLayout";

const emptyTournament = {
  name: "",
  description: "",
  location: "",
  image_url: "",
  start_date: "",
  end_date: "",
  status: "draft",
  initial_round_name: "Round 1: Opening Card",
  initial_round_order: "1",
  initial_round_description: "Opening round for the tournament schedule.",
  initial_round_status: "active",
};
const emptyRound = { tournament_id: "", name: "", round_order: "", description: "", status: "draft" };
const emptyRace = { tournament_id: "", round_id: "", referee_id: "", name: "", race_date: "", location: "", distance: "", max_participants: "", status: "scheduled" };
const PAGE_SIZE = 20;

const entityConfig = {
  tournament: { title: "Tournament", create: adminApi.createTournament, update: adminApi.updateTournament, remove: adminApi.deleteTournament },
  round: { title: "Round", create: adminApi.createRound, update: adminApi.updateRound, remove: adminApi.deleteRound },
  race: { title: "Race", create: adminApi.createRace, update: adminApi.updateRace, remove: adminApi.deleteRace },
};

function idOf(value) {
  return String(value?._id || value || "");
}

function getRaceRefereeProfile(userEnvelope) {
  return userEnvelope?.profiles?.race_referee || null;
}

function getRefereeOptionId(userEnvelope) {
  const profile = getRaceRefereeProfile(userEnvelope);
  return idOf(profile);
}

function getRefereeOptionLabel(userEnvelope) {
  const user = userEnvelope?.user || userEnvelope || {};
  const profile = getRaceRefereeProfile(userEnvelope);
  const license = profile?.license_number ? ` · ${profile.license_number}` : "";
  return `${user.full_name || user.email || "Unnamed referee"}${license}`;
}

function dateValue(value, withTime = false) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, withTime ? 16 : 10);
}

function formatDate(value, withTime = false) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function titleCase(value) {
  return String(value || "unknown").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatusBadge({ value }) {
  const normalized = String(value || "unknown").toLowerCase();
  const tone = ["active", "published", "completed"].includes(normalized)
    ? "green"
    : ["running", "planning"].includes(normalized) ? "blue" : normalized === "draft" ? "gray" : "amber";
  return <span className={`admin-status-badge admin-status-badge--${tone}`}>{titleCase(value)}</span>;
}

function RowActions({ label, onEdit, onDelete }) {
  return (
    <div className="admin-competition__row-actions">
      <button type="button" onClick={onEdit} aria-label={`Edit ${label}`}><Pencil size={15} aria-hidden="true" /> Edit</button>
      <button type="button" className="admin-competition__delete" onClick={onDelete} aria-label={`Delete ${label}`}><Trash2 size={15} aria-hidden="true" /> Delete</button>
    </div>
  );
}

function Pagination({ page, totalItems, onChange, label }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  if (totalPages === 1) return null;
  return <nav className="admin-command-pagination" aria-label={`${label} pages`}><span>Page {page} of {totalPages}</span><div><button disabled={page === 1} type="button" onClick={() => onChange(page - 1)}>Previous</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} className={number === page ? "active" : ""} type="button" aria-current={number === page ? "page" : undefined} onClick={() => onChange(number)}>{number}</button>)}<button disabled={page === totalPages} type="button" onClick={() => onChange(page + 1)}>Next</button></div></nav>;
}

function TournamentForm({ value, onChange, onSubmit, onCancel, saving, mode }) {
  return (
    <form className="admin-form-grid admin-competition__form" onSubmit={onSubmit}>
      <div className="admin-competition__form-columns">
        <label className="admin-field"><span>Name *</span><input required value={value.name} onChange={(event) => onChange("name", event.target.value)} placeholder="Spring Championship 2026" /></label>
        <label className="admin-field"><span>Location</span><input value={value.location} onChange={(event) => onChange("location", event.target.value)} placeholder="Saigon Racecourse" /></label>
        <label className="admin-field"><span>Image URL</span><input type="url" value={value.image_url} onChange={(event) => onChange("image_url", event.target.value)} placeholder="https://example.com/tournament.jpg" /></label>
        <label className="admin-field"><span>Start date</span><input type="date" value={value.start_date} onChange={(event) => onChange("start_date", event.target.value)} /></label>
        <label className="admin-field"><span>End date</span><input type="date" value={value.end_date} min={value.start_date || undefined} onChange={(event) => onChange("end_date", event.target.value)} /></label>
        <label className="admin-field"><span>Status</span><select value={value.status} onChange={(event) => onChange("status", event.target.value)}><option value="draft">Draft</option><option value="planning">Planning</option><option value="active">Active</option><option value="completed">Completed</option><option value="archived">Archived</option></select></label>
      </div>
      {value.image_url && <div className="admin-competition__image-preview"><img src={value.image_url} alt="" /><span>Image preview</span></div>}
      <label className="admin-field"><span>Description</span><textarea value={value.description} onChange={(event) => onChange("description", event.target.value)} placeholder="Competition format and operating notes" /></label>
      {mode === "create" && (
        <section className="admin-live-state">
          <strong>Initial round</strong>
          <div className="admin-competition__form-columns">
            <label className="admin-field"><span>Round name *</span><input required value={value.initial_round_name} onChange={(event) => onChange("initial_round_name", event.target.value)} placeholder="Round 1: Opening Card" /></label>
            <label className="admin-field"><span>Order *</span><input required min="1" type="number" value={value.initial_round_order} onChange={(event) => onChange("initial_round_order", event.target.value)} /></label>
            <label className="admin-field"><span>Status</span><select value={value.initial_round_status} onChange={(event) => onChange("initial_round_status", event.target.value)}><option value="draft">Draft</option><option value="active">Active</option><option value="completed">Completed</option><option value="archived">Archived</option></select></label>
          </div>
          <label className="admin-field"><span>Round description</span><textarea value={value.initial_round_description} onChange={(event) => onChange("initial_round_description", event.target.value)} placeholder="Round rules and qualification notes" /></label>
        </section>
      )}
      <div className="admin-tool-card__footer"><button className="admin-header__button" disabled={saving} type="submit">{saving ? "Saving..." : `${mode === "edit" ? "Save" : "Create"} tournament`}</button><button className="admin-header__button admin-header__button--ghost" type="button" onClick={onCancel}>Cancel</button></div>
    </form>
  );
}

function RoundForm({ value, tournaments, onChange, onSubmit, onCancel, saving, mode }) {
  return (
    <form className="admin-form-grid admin-competition__form" onSubmit={onSubmit}>
      <div className="admin-competition__form-columns">
        <label className="admin-field"><span>Tournament *</span><select required value={value.tournament_id} onChange={(event) => onChange("tournament_id", event.target.value)}><option value="">Select tournament</option>{tournaments.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
        <label className="admin-field"><span>Round name *</span><input required value={value.name} onChange={(event) => onChange("name", event.target.value)} placeholder="Qualifying heat" /></label>
        <label className="admin-field"><span>Order *</span><input required min="1" type="number" value={value.round_order} onChange={(event) => onChange("round_order", event.target.value)} /></label>
        <label className="admin-field"><span>Status</span><select value={value.status} onChange={(event) => onChange("status", event.target.value)}><option value="draft">Draft</option><option value="active">Active</option><option value="completed">Completed</option><option value="archived">Archived</option></select></label>
      </div>
      <label className="admin-field"><span>Description</span><textarea value={value.description} onChange={(event) => onChange("description", event.target.value)} placeholder="Round rules and qualification notes" /></label>
      <div className="admin-tool-card__footer"><button className="admin-header__button" disabled={saving} type="submit">{saving ? "Saving..." : `${mode === "edit" ? "Save" : "Create"} round`}</button><button className="admin-header__button admin-header__button--ghost" type="button" onClick={onCancel}>Cancel</button></div>
    </form>
  );
}

function RaceForm({ value, tournaments, rounds, referees, onChange, onSubmit, onCancel, saving, mode }) {
  const availableRounds = rounds.filter((round) => idOf(round.tournament_id) === value.tournament_id);
  const hasTournament = Boolean(value.tournament_id);
  const hasRounds = availableRounds.length > 0;
  return (
    <form className="admin-form-grid admin-competition__form" onSubmit={onSubmit}>
      <div className="admin-competition__form-columns">
        <label className="admin-field"><span>Tournament *</span><select required value={value.tournament_id} onChange={(event) => onChange("tournament_id", event.target.value)}><option value="">Select tournament</option>{tournaments.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
        <label className="admin-field"><span>Round *</span><select required disabled={!hasTournament || !hasRounds} value={value.round_id} onChange={(event) => onChange("round_id", event.target.value)}><option value="">{!hasTournament ? "Select tournament first" : hasRounds ? "Select round" : "No rounds in this tournament"}</option>{availableRounds.map((item) => <option key={item._id} value={item._id}>{item.round_order}. {item.name}</option>)}</select></label>
        <label className="admin-field"><span>Race name *</span><input required value={value.name} onChange={(event) => onChange("name", event.target.value)} placeholder="Race 01 — Opening heat" /></label>
        <label className="admin-field"><span>Race date & time</span><input type="datetime-local" value={value.race_date} onChange={(event) => onChange("race_date", event.target.value)} /></label>
        <label className="admin-field"><span>Location</span><input value={value.location} onChange={(event) => onChange("location", event.target.value)} placeholder="Track A" /></label>
        <label className="admin-field"><span>Status</span><select value={value.status} onChange={(event) => onChange("status", event.target.value)}><option value="scheduled">Scheduled</option><option value="running">Running</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label>
        <label className="admin-field"><span>Race referee</span><select value={value.referee_id} onChange={(event) => onChange("referee_id", event.target.value)}><option value="">Unassigned</option>{referees.map((item) => <option key={getRefereeOptionId(item)} value={getRefereeOptionId(item)}>{getRefereeOptionLabel(item)}</option>)}</select></label>
        <label className="admin-field"><span>Distance (metres)</span><input min="1" type="number" value={value.distance} onChange={(event) => onChange("distance", event.target.value)} placeholder="1600" /></label>
        <label className="admin-field"><span>Maximum participants</span><input min="1" type="number" value={value.max_participants} onChange={(event) => onChange("max_participants", event.target.value)} placeholder="12" /></label>
      </div>
      {hasTournament && !hasRounds && <div className="admin-live-state admin-live-state--warning"><strong>This tournament has no rounds yet.</strong> Create a round for the tournament before scheduling races.</div>}
      {!referees.length && <div className="admin-live-state"><strong>No active race referees are available.</strong> Approve or assign a Race Referee role before scheduling race control.</div>}
      <div className="admin-tool-card__footer"><button className="admin-header__button" disabled={saving || !hasRounds} type="submit">{saving ? "Saving..." : `${mode === "edit" ? "Save" : "Create"} race`}</button><button className="admin-header__button admin-header__button--ghost" type="button" onClick={onCancel}>Cancel</button></div>
    </form>
  );
}

function AdminCompetitionModule({ moduleName }) {
  const isSchedule = moduleName === "schedule";
  const [data, setData] = useState({ tournaments: [], rounds: [], races: [], referees: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [roundTournament, setRoundTournament] = useState("all");
  const [tournamentPage, setTournamentPage] = useState(1);
  const [roundPage, setRoundPage] = useState(1);
  const [racePage, setRacePage] = useState(1);

  const loadData = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const [tournamentResponse, roundResponse, raceResponse, refereeResponse] = await Promise.all([
        adminApi.listTournaments(),
        adminApi.listRounds(),
        adminApi.listRaces(),
        adminApi.listUsers({ role: "race_referee", status: "active", limit: 100 }),
      ]);
      setData({
        tournaments: (tournamentResponse.tournaments || []).filter((item) => item.status !== "deleted"),
        rounds: (roundResponse.rounds || []).filter((item) => item.status !== "deleted"),
        races: (raceResponse.races || []).filter((item) => item.status !== "deleted"),
        referees: (refereeResponse.users || []).filter((item) => getRefereeOptionId(item) !== ""),
      });
    } catch (apiError) {
      setError(apiError.message || "Unable to load competition data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isSchedule]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const openForm = (kind, item = null) => {
    let next;
    if (kind === "tournament") next = item ? { name: item.name || "", description: item.description || "", location: item.location || "", image_url: item.image_url || "", start_date: dateValue(item.start_date), end_date: dateValue(item.end_date), status: item.status || "draft" } : { ...emptyTournament };
    if (kind === "round") next = item ? { tournament_id: idOf(item.tournament_id), name: item.name || "", round_order: String(item.round_order || ""), description: item.description || "", status: item.status || "draft" } : { ...emptyRound, tournament_id: data.tournaments[0]?._id || "" };
    if (kind === "race") {
      const defaultTournamentId = data.tournaments[0]?._id || "";
      const defaultRoundId = data.rounds.find((round) => idOf(round.tournament_id) === defaultTournamentId)?._id || "";
      next = item ? { tournament_id: idOf(item.tournament_id), round_id: idOf(item.round_id), referee_id: idOf(item.referee_id), name: item.name || "", race_date: dateValue(item.race_date, true), location: item.location || "", distance: String(item.distance || ""), max_participants: String(item.max_participants || ""), status: item.status || "scheduled" } : { ...emptyRace, tournament_id: defaultTournamentId, round_id: defaultRoundId };
    }
    setForm(next);
    setError("");
    setModal({ kind, mode: item ? "edit" : "create", item });
  };

  const changeField = (field, value) => {
    setForm((current) => {
      if (field === "tournament_id" && modal?.kind === "race") {
        const firstRound = data.rounds.find((round) => idOf(round.tournament_id) === value);
        return { ...current, tournament_id: value, round_id: firstRound?._id || "" };
      }

      return { ...current, [field]: value };
    });
  };

  const payloadFor = (kind) => {
    if (kind === "tournament") {
      if (form.start_date && form.end_date && form.end_date < form.start_date) throw new Error("End date must be on or after the start date.");
      const {
        initial_round_name,
        initial_round_order,
        initial_round_description,
        initial_round_status,
        ...tournamentPayload
      } = form;

      if (modal?.mode === "create" && !String(initial_round_name || "").trim()) {
        throw new Error("Initial round name is required.");
      }

      if (modal?.mode === "create" && Number(initial_round_order) < 1) {
        throw new Error("Initial round order must be at least 1.");
      }

      return {
        ...tournamentPayload,
        image_url: tournamentPayload.image_url?.trim() || "",
        start_date: tournamentPayload.start_date || null,
        end_date: tournamentPayload.end_date || null,
      };
    }
    if (kind === "round") return { ...form, round_order: Number(form.round_order) };
    const selectedRound = data.rounds.find((round) => round._id === form.round_id);
    if (!selectedRound || idOf(selectedRound.tournament_id) !== form.tournament_id) throw new Error("The selected round does not belong to this tournament.");
    return { ...form, referee_id: form.referee_id || null, race_date: form.race_date ? new Date(form.race_date).toISOString() : null, distance: form.distance ? Number(form.distance) : null, max_participants: form.max_participants ? Number(form.max_participants) : null };
  };

  const submitForm = async (event) => {
    event.preventDefault();
    const config = entityConfig[modal.kind];
    setSaving(true);
    setError("");
    try {
      const payload = payloadFor(modal.kind);
      if (modal.mode === "edit") {
        await config.update(modal.item._id, payload);
      } else if (modal.kind === "tournament") {
        const created = await config.create(payload);
        const tournamentId = created?.tournament?._id;

        if (!tournamentId) {
          throw new Error("Tournament was created, but the response did not include its id.");
        }

        await adminApi.createRound({
          tournament_id: tournamentId,
          name: form.initial_round_name.trim(),
          round_order: Number(form.initial_round_order),
          description: form.initial_round_description || "",
          status: form.initial_round_status || "active",
        });
      } else {
        await config.create(payload);
      }
      setNotice(`${config.title} ${modal.mode === "edit" ? "updated" : "created"}.`);
      setModal(null);
      setForm(null);
      await loadData(true);
    } catch (apiError) {
      setError(apiError.message || `Unable to save ${config.title.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  const removeEntity = async () => {
    if (!deleteTarget) return;
    const { kind, item } = deleteTarget;
    const config = entityConfig[kind];
    setDeleting(true);
    setError("");
    try {
      await config.remove(item._id);
      setNotice(`${config.title} deleted.`);
      setDeleteTarget(null);
      await loadData(true);
    } catch (apiError) {
      setError(apiError.message || `Unable to delete ${config.title.toLowerCase()}.`);
    } finally {
      setDeleting(false);
    }
  };

  const matchesFilters = (item) => {
    const haystack = [item.name, item.location, item.status, item.description, item.tournament_id?.name, item.round_id?.name].join(" ").toLowerCase();
    return (!query.trim() || haystack.includes(query.trim().toLowerCase())) && (status === "all" || item.status === status);
  };
  const filteredTournaments = useMemo(() => data.tournaments.filter(matchesFilters), [data.tournaments, query, status]);
  const filteredRounds = useMemo(() => data.rounds.filter((item) => matchesFilters(item) && (roundTournament === "all" || idOf(item.tournament_id) === roundTournament)), [data.rounds, query, roundTournament, status]);
  const filteredRaces = useMemo(() => data.races.filter(matchesFilters), [data.races, query, status]);
  const pagedTournaments = filteredTournaments.slice((tournamentPage - 1) * PAGE_SIZE, tournamentPage * PAGE_SIZE);
  const pagedRounds = filteredRounds.slice((roundPage - 1) * PAGE_SIZE, roundPage * PAGE_SIZE);
  const pagedRaces = filteredRaces.slice((racePage - 1) * PAGE_SIZE, racePage * PAGE_SIZE);
  const scheduledCount = data.races.filter((race) => race.status === "scheduled").length;

  useEffect(() => { setTournamentPage(1); setRoundPage(1); setRacePage(1); }, [query, status]);
  useEffect(() => { setRoundPage(1); }, [roundTournament]);
  useEffect(() => { setTournamentPage((current) => Math.min(current, Math.max(1, Math.ceil(filteredTournaments.length / PAGE_SIZE)))); }, [filteredTournaments.length]);
  useEffect(() => { setRoundPage((current) => Math.min(current, Math.max(1, Math.ceil(filteredRounds.length / PAGE_SIZE)))); }, [filteredRounds.length]);
  useEffect(() => { setRacePage((current) => Math.min(current, Math.max(1, Math.ceil(filteredRaces.length / PAGE_SIZE)))); }, [filteredRaces.length]);

  const title = isSchedule ? "Race Schedule" : "Tournament Setup";
  const description = isSchedule ? "Create races and assign each one to its tournament round." : "Create tournaments and arrange their rounds.";
  const deleteDependencyCount = deleteTarget?.kind === "tournament"
    ? data.rounds.filter((round) => idOf(round.tournament_id) === deleteTarget.item._id).length
    : deleteTarget?.kind === "round"
      ? data.races.filter((race) => idOf(race.round_id) === deleteTarget.item._id).length
      : 0;
  const deleteBlocked = deleteDependencyCount > 0;

  if (loading) return <AdminLayout title={title} eyebrow="Competition planning" description={description}><LoadingSkeleton ariaLabel={`Loading ${title}`} rows={6} variant="table" /></AdminLayout>;

  return (
    <AdminLayout title={title} eyebrow="Competition planning" description={description} actions={<><button className="admin-header__button" type="button" onClick={() => openForm(isSchedule ? "race" : "tournament")}><Plus size={17} aria-hidden="true" /> {isSchedule ? "Create race" : "Create tournament"}</button>{!isSchedule && <button className="admin-header__button admin-header__button--ghost" disabled={!data.tournaments.length} type="button" onClick={() => openForm("round")}><Plus size={17} aria-hidden="true" /> Add round</button>}</>}>
      <section className="admin-metrics admin-metrics--module" aria-label="Competition summary">
        {isSchedule ? <><article className="admin-metric-card"><p className="admin-metric-card__label">Total races</p><div className="admin-metric-card__value">{data.races.length}</div></article><article className="admin-metric-card"><p className="admin-metric-card__label">Scheduled</p><div className="admin-metric-card__value">{scheduledCount}</div></article><article className="admin-metric-card"><p className="admin-metric-card__label">Rounds</p><div className="admin-metric-card__value">{data.rounds.length}</div></article></> : <><article className="admin-metric-card"><p className="admin-metric-card__label">Tournaments</p><div className="admin-metric-card__value">{data.tournaments.length}</div></article><article className="admin-metric-card"><p className="admin-metric-card__label">Rounds</p><div className="admin-metric-card__value">{data.rounds.length}</div></article><article className="admin-metric-card"><p className="admin-metric-card__label">Active</p><div className="admin-metric-card__value">{data.tournaments.filter((item) => item.status === "active").length}</div></article></>}
      </section>

      <section className="admin-competition__flow" aria-label="Competition structure"><div><span>01</span><strong>Tournaments</strong><small>{data.tournaments.length}</small></div><i aria-hidden="true" /><div><span>02</span><strong>Rounds</strong><small>{data.rounds.length}</small></div><i aria-hidden="true" /><div><span>03</span><strong>Races</strong><small>{data.races.length}</small></div></section>

      <section className="admin-panel admin-actions-panel"><div className="admin-panel__header"><p className="admin-panel__eyebrow">Filters</p><h2>Competition records</h2></div><div className="admin-toolbar"><label className="admin-field"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, venue, tournament or round..." /></label><label className="admin-field"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{(isSchedule ? ["scheduled", "running", "completed", "cancelled"] : ["draft", "planning", "active", "completed", "archived"]).map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></label><button className="admin-header__button admin-header__button--ghost" disabled={refreshing} type="button" onClick={() => loadData(true)}><RefreshCw size={16} className={refreshing ? "admin-competition__spin" : ""} aria-hidden="true" /> {refreshing ? "Refreshing" : "Refresh"}</button></div></section>

      {notice && <section className="admin-live-state admin-competition__success" aria-live="polite">{notice}</section>}
      {error && <section className="admin-live-state admin-live-state--warning" aria-live="assertive">{error}</section>}

      {isSchedule ? (
        <section className="admin-panel"><div className="admin-panel__header admin-competition__ledger-heading"><div><p className="admin-panel__eyebrow">Race ledger</p><h2>Scheduled races</h2></div><span>{filteredRaces.length} records · 20 per page</span></div>{!data.tournaments.length || !data.rounds.length ? <div className="admin-competition__empty"><CalendarDays size={30} aria-hidden="true" /><div><h3>Competition structure required</h3><p>Create a tournament and round first.</p></div></div> : !filteredRaces.length ? <div className="admin-competition__empty"><CalendarDays size={30} aria-hidden="true" /><div><h3>No races found</h3><p>Create a race or reset the filters.</p></div></div> : <div className="admin-data-table__wrap"><table className="admin-data-table"><thead><tr><th>Race</th><th>Tournament / Round</th><th>Scheduled</th><th>Track</th><th>Referee</th><th>Status</th><th>Actions</th></tr></thead><tbody>{pagedRaces.map((race) => <tr key={race._id}><td><strong>{race.name}</strong><small className="admin-competition__id">{race._id}</small></td><td>{race.tournament_id?.name || "Unknown tournament"}<small className="admin-competition__subline">{race.round_id?.name || "Unknown round"}</small></td><td>{formatDate(race.race_date, true)}</td><td>{race.location || "Not set"}</td><td>{race.referee_id?.user_id?.full_name || "Unassigned"}</td><td><StatusBadge value={race.status} /></td><td><RowActions label={race.name} onEdit={() => openForm("race", race)} onDelete={() => setDeleteTarget({ kind: "race", item: race })} /></td></tr>)}</tbody></table></div>}<Pagination page={racePage} totalItems={filteredRaces.length} onChange={setRacePage} label="Race ledger" /></section>
      ) : (
        <div className="admin-competition__stack">
          <section className="admin-panel"><div className="admin-panel__header admin-competition__ledger-heading"><div><p className="admin-panel__eyebrow">Tournament ledger</p><h2>Tournaments</h2></div><span>{filteredTournaments.length} records · 20 per page</span></div>{!filteredTournaments.length ? <div className="admin-competition__empty"><CalendarDays size={30} aria-hidden="true" /><div><h3>No tournaments found</h3><p>Create a tournament or reset the filters.</p></div></div> : <div className="admin-data-table__wrap"><table className="admin-data-table"><thead><tr><th>Tournament</th><th>Dates</th><th>Venue</th><th>Rounds</th><th>Status</th><th>Actions</th></tr></thead><tbody>{pagedTournaments.map((tournament) => <tr key={tournament._id}><td><strong>{tournament.name}</strong><small className="admin-competition__id">{tournament._id}</small></td><td>{formatDate(tournament.start_date)}<small className="admin-competition__subline">to {formatDate(tournament.end_date)}</small></td><td>{tournament.location || "Not set"}</td><td>{data.rounds.filter((round) => idOf(round.tournament_id) === tournament._id).length}</td><td><StatusBadge value={tournament.status} /></td><td><RowActions label={tournament.name} onEdit={() => openForm("tournament", tournament)} onDelete={() => setDeleteTarget({ kind: "tournament", item: tournament })} /></td></tr>)}</tbody></table></div>}<Pagination page={tournamentPage} totalItems={filteredTournaments.length} onChange={setTournamentPage} label="Tournament ledger" /></section>
          <section className="admin-panel"><div className="admin-panel__header admin-competition__section-header"><div><p className="admin-panel__eyebrow">Round builder</p><h2>Ordered rounds</h2><span>{filteredRounds.length} records · 20 per page</span></div><div className="admin-competition__round-controls"><label className="admin-field"><span>Tournament</span><select value={roundTournament} onChange={(event) => setRoundTournament(event.target.value)}><option value="all">All tournaments</option>{data.tournaments.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label><button className="admin-header__button admin-header__button--ghost" disabled={!data.tournaments.length} type="button" onClick={() => openForm("round")}><Plus size={16} aria-hidden="true" /> Add round</button></div></div>{!filteredRounds.length ? <div className="admin-competition__empty"><CalendarDays size={30} aria-hidden="true" /><div><h3>No rounds found</h3><p>Add a round or change the tournament filter.</p></div></div> : <div className="admin-data-table__wrap"><table className="admin-data-table"><thead><tr><th>Order</th><th>Round</th><th>Tournament</th><th>Status</th><th>Actions</th></tr></thead><tbody>{pagedRounds.map((round) => <tr key={round._id}><td><span className="admin-competition__order">{round.round_order}</span></td><td><strong>{round.name}</strong><small className="admin-competition__id">{round._id}</small></td><td>{round.tournament_id?.name || "Unknown tournament"}</td><td><StatusBadge value={round.status} /></td><td><RowActions label={round.name} onEdit={() => openForm("round", round)} onDelete={() => setDeleteTarget({ kind: "round", item: round })} /></td></tr>)}</tbody></table></div>}<Pagination page={roundPage} totalItems={filteredRounds.length} onChange={setRoundPage} label="Round ledger" /></section>
        </div>
      )}

      {modal && <div className="admin-modal" role="dialog" aria-modal="true" aria-label={`${modal.mode} ${modal.kind}`} onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setModal(null); }}><div className="admin-modal__card admin-competition__modal"><div className="admin-panel__header"><p className="admin-panel__eyebrow">{modal.mode === "edit" ? "Edit record" : "Create record"}</p><h2>{modal.mode === "edit" ? "Update" : "New"} {entityConfig[modal.kind].title}</h2></div>{error && <div className="admin-live-state admin-live-state--warning">{error}</div>}{modal.kind === "tournament" && <TournamentForm value={form} onChange={changeField} onSubmit={submitForm} onCancel={() => setModal(null)} saving={saving} mode={modal.mode} />}{modal.kind === "round" && <RoundForm value={form} tournaments={data.tournaments} onChange={changeField} onSubmit={submitForm} onCancel={() => setModal(null)} saving={saving} mode={modal.mode} />}{modal.kind === "race" && <RaceForm value={form} tournaments={data.tournaments} rounds={data.rounds} referees={data.referees} onChange={changeField} onSubmit={submitForm} onCancel={() => setModal(null)} saving={saving} mode={modal.mode} />}</div></div>}
      {deleteTarget && <div className="admin-modal" role="alertdialog" aria-modal="true" aria-labelledby="competition-delete-title" aria-describedby="competition-delete-copy" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) setDeleteTarget(null); }}><div className="admin-modal__card admin-competition__delete-dialog"><Trash2 size={22} aria-hidden="true" /><div><p className="admin-panel__eyebrow">Delete {entityConfig[deleteTarget.kind].title}</p><h2 id="competition-delete-title">{deleteTarget.item.name}</h2><p id="competition-delete-copy">{deleteBlocked ? `Remove ${deleteDependencyCount} linked ${deleteTarget.kind === "tournament" ? "rounds" : "races"} first.` : "This record will be removed from the competition workspace."}</p></div><div className="admin-tool-card__footer"><button className="admin-header__button admin-header__button--red" disabled={deleting || deleteBlocked} type="button" onClick={removeEntity}>{deleting ? "Deleting..." : "Delete"}</button><button className="admin-header__button admin-header__button--ghost" disabled={deleting} type="button" onClick={() => setDeleteTarget(null)}>Cancel</button></div></div></div>}
    </AdminLayout>
  );
}

export default AdminCompetitionModule;
