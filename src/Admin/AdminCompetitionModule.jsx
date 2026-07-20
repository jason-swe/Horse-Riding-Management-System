import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronDown, ListChecks, Lock, Pencil, Plus, RefreshCw, Save, Trash2, Unlock, X } from "lucide-react";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { adminApi } from "../api/adminApi";
import { betApi } from "../api/betApi";
import { advancedHorseGearOptions, commonHorseGearOptions, raceClasses, raceCourses, raceGoings, raceSurfaces } from "../constants/raceModelInputs";
import AdminLayout from "./AdminLayout";

const emptyTournament = {
  name: "",
  description: "",
  location: "",
  image_url: "",
  entry_fee: "",
  entry_fee_currency: "VND",
  start_date: "",
  end_date: "",
  status: "draft",
  initial_round_name: "Round 1: Opening Card",
  initial_round_order: "1",
  initial_round_description: "Opening round for the tournament schedule.",
  initial_round_status: "active",
};
const emptyRound = { tournament_id: "", name: "", round_order: "", description: "", status: "draft" };
const emptyRace = {
  tournament_id: "", round_id: "", referee_id: "", name: "", race_no: "1", race_date: "",
  location: "", venue_code: "ST", distance: "", max_participants: "", course: "B+2",
  race_class: "5", going: "Good", surface: "Turf", prize_pool: "", prize_currency: "VND",
  status: "scheduled",
};
const defaultBettingConfig = { min_stake: "1", max_stake: "1000", currency: "TOKEN", closes_at: "" };
const PAGE_SIZE = 20;

const entityConfig = {
  tournament: { title: "Tournament", create: adminApi.createTournament, update: adminApi.updateTournament, remove: adminApi.deleteTournament },
  round: { title: "Round", create: adminApi.createRound, update: adminApi.updateRound, remove: adminApi.deleteRound },
  race: { title: "Race", create: adminApi.createRace, update: adminApi.updateRace, remove: adminApi.deleteRace },
};

function idOf(value) {
  return String(value._id || value || "");
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

function formatMoney(value, currency = "VND") {
  const number = Number(value || 0);
  if (!number) return "No prize";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "VND",
    maximumFractionDigits: 0,
  }).format(number);
}

function titleCase(value) {
  return String(value || "unknown").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const statusPriority = {
  pending: 0,
  pending_verification: 0,
  draft: 0,
  planning: 0,
  scheduled: 0,
  running: 1,
  active: 1,
  generated: 1,
  open: 1,
  confirmed: 2,
  approved: 2,
  completed: 3,
  published: 3,
  closed: 3,
  settled: 3,
  cancelled: 4,
  rejected: 4,
  archived: 5,
  deleted: 6,
};

function priorityOfStatus(value) {
  return statusPriority[String(value || "").toLowerCase()] ?? 9;
}

function timeOf(item, fields) {
  for (const field of fields) {
    const value = item?.[field];
    const time = value ? new Date(value).getTime() : 0;
    if (Number.isFinite(time) && time > 0) return time;
  }
  return 0;
}

function sortNewestWithStatus(first, second, fields) {
  return priorityOfStatus(first.status) - priorityOfStatus(second.status)
    || timeOf(second, fields) - timeOf(first, fields)
    || String(second._id || "").localeCompare(String(first._id || ""));
}

function getBettingStatus(race) {
  return String(race?.betting_status || race?.betting_market?.status || "unavailable").toLowerCase();
}

function formatPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  return `${(number * 100).toFixed(1)}%`;
}

function StatusBadge({ value }) {
  const normalized = String(value || "unknown").toLowerCase();
  const tone = ["active", "published", "completed"].includes(normalized)
    ? "green"
    : ["running", "planning"].includes(normalized) ? "blue" : normalized === "draft" ? "gray" : "amber";
  return <span className={`admin-status-badge admin-status-badge--${tone}`}>{titleCase(value)}</span>;
}

function BettingStatusBadge({ race }) {
  const status = getBettingStatus(race);
  const normalized = String(status).toLowerCase();
  const tone = normalized === "open"
    ? "green"
    : ["closed", "settled"].includes(normalized)
      ? "gray"
      : ["generated", "scheduled"].includes(normalized)
        ? "blue"
        : "amber";
  return (
    <div className="admin-competition__betting-status">
      <span className={`admin-status-badge admin-status-badge--${tone}`}>{titleCase(status)}</span>
      {race?.betting_market?.min_stake && race?.betting_market?.max_stake && (
        <small>{race.betting_market.min_stake}-{race.betting_market.max_stake} {race.betting_market.currency || "TOKEN"}</small>
      )}
      {race?.betting_market?.closes_at && <small>Closes {formatDate(race.betting_market.closes_at, true)}</small>}
    </div>
  );
}

function RowActions({ label, onEdit, onDelete, children }) {
  return (
    <div className="admin-competition__row-actions">
      {children}
      <button type="button" onClick={onEdit} aria-label={`Edit ${label}`}><Pencil size={15} aria-hidden="true" /> Edit</button>
      <button type="button" className="admin-competition__delete" onClick={onDelete} aria-label={`Delete ${label}`}><Trash2 size={15} aria-hidden="true" /> Delete</button>
    </div>
  );
}

function BettingOpenSettings({ value, onChange, disabled }) {
  return (
    <div className="admin-competition__betting-settings" aria-label="Open betting settings">
      <label className="admin-field">
        <span>Min stake</span>
        <input disabled={disabled} min="1" step="1" type="number" value={value.min_stake} onChange={(event) => onChange("min_stake", event.target.value)} />
      </label>
      <label className="admin-field">
        <span>Max stake</span>
        <input disabled={disabled} min="1" step="1" type="number" value={value.max_stake} onChange={(event) => onChange("max_stake", event.target.value)} />
      </label>
      <label className="admin-field">
        <span>Currency</span>
        <select disabled={disabled} value={value.currency} onChange={(event) => onChange("currency", event.target.value)}>
          <option value="TOKEN">TOKEN</option>
          <option value="PTS">PTS</option>
          <option value="POINTS">POINTS</option>
        </select>
      </label>
      <label className="admin-field">
        <span>Closes at</span>
        <input disabled={disabled} type="datetime-local" value={value.closes_at} onChange={(event) => onChange("closes_at", event.target.value)} />
      </label>
    </div>
  );
}

function BettingActions({ race, activeAction, onAction }) {
  const raceId = race._id;
  const raceStatus = String(race.status || "").toLowerCase();
  const bettingStatus = getBettingStatus(race);
  const isBusy = activeAction.startsWith(`${raceId}:`);
  const isScheduled = raceStatus === "scheduled";
  const canOpen = isScheduled && ["generated", "scheduled", "open"].includes(bettingStatus);
  const canClose = !["unavailable", "closed", "settled"].includes(bettingStatus);
  const canSettle = ["closed", "settled"].includes(bettingStatus) || raceStatus === "completed";
  const buttonText = (action, label, busyLabel) => (activeAction === `${raceId}:${action}` ? busyLabel : label);

  return (
    <div className="admin-competition__betting-actions" aria-label={`Betting actions for ${race.name}`}>
      <button disabled={isBusy || !isScheduled} type="button" onClick={() => onAction(race, "generate")}><RefreshCw size={15} aria-hidden="true" />{buttonText("generate", "Generate odds", "Generating")}</button>
      <button disabled={isBusy || !canOpen} type="button" onClick={() => onAction(race, "open")}><Unlock size={15} aria-hidden="true" />{buttonText("open", "Open betting", "Opening")}</button>
      <button disabled={isBusy || !canClose} type="button" onClick={() => onAction(race, "close")}><Lock size={15} aria-hidden="true" />{buttonText("close", "Close betting", "Closing")}</button>
      <button disabled={isBusy || !canSettle} type="button" onClick={() => onAction(race, "settle")}><RefreshCw size={15} aria-hidden="true" />{buttonText("settle", "Retry settle", "Settling")}</button>
    </div>
  );
}

function BettingRaceContext({ race }) {
  return (
    <div className="admin-competition__race-context" aria-label="Selected race summary">
      <div>
        <span>Race status</span>
        <strong>{titleCase(race.status)}</strong>
      </div>
      <div>
        <span>Scheduled</span>
        <strong>{formatDate(race.race_date, true)}</strong>
      </div>
      <div>
        <span>Track</span>
        <strong>{race.location || "Not set"}</strong>
      </div>
    </div>
  );
}

function BettingOddsSnapshot({ market, loading, error, onSave, saving }) {
  const odds = useMemo(
    () => [...(market?.odds || [])].sort((first, second) => Number(first.probability_rank || 99) - Number(second.probability_rank || 99)),
    [market],
  );
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [editError, setEditError] = useState("");

  useEffect(() => {
    setEditing(false);
    setDraft(Object.fromEntries((market?.odds || []).map((item) => [idOf(item.horse_id), String(item.game_odds || "")])));
    setAdjustmentNote(market?.manual_adjustment_note || "");
    setEditError("");
  }, [market?._id, market?.updated_at]);

  const canEdit = String(market?.status || "").toLowerCase() === "generated";
  const startEditing = () => {
    setDraft(Object.fromEntries(odds.map((item) => [idOf(item.horse_id), String(item.game_odds || "")])));
    setEditError("");
    setEditing(true);
  };
  const cancelEditing = () => {
    setEditing(false);
    setEditError("");
  };
  const saveOdds = async () => {
    const payloadOdds = odds.map((item) => ({
      horse_id: idOf(item.horse_id),
      game_odds: Number(draft[idOf(item.horse_id)]),
    }));
    if (payloadOdds.some((item) => !Number.isFinite(item.game_odds) || item.game_odds < 1.01 || item.game_odds > 1000)) {
      setEditError("Final odds must be between 1.01 and 1000.");
      return;
    }
    setEditError("");
    try {
      await onSave({ odds: payloadOdds, adjustment_note: adjustmentNote.trim() });
      setEditing(false);
    } catch (saveError) {
      setEditError(saveError.message || "Unable to save final odds.");
    }
  };

  if (loading) {
    return <div className="admin-competition__odds-empty">Loading odds snapshot...</div>;
  }

  if (error) {
    return <div className="admin-competition__odds-empty">{error}</div>;
  }

  if (!market) {
    return <div className="admin-competition__odds-empty">Generate odds to review the win market snapshot.</div>;
  }

  return (
    <div className="admin-competition__odds-snapshot" aria-label="Win odds snapshot">
      <div className="admin-competition__odds-toolbar">
        <div className="admin-competition__odds-meta">
          <span>Generated {formatDate(market.generated_at, true)}</span>
          {market.manually_adjusted_at && <span>Adjusted {formatDate(market.manually_adjusted_at, true)}</span>}
        </div>
        {canEdit && !editing && <button type="button" onClick={startEditing}><Pencil size={15} aria-hidden="true" /> Edit final odds</button>}
        {editing && (
          <div className="admin-competition__odds-edit-actions">
            <button disabled={saving} type="button" onClick={saveOdds}><Save size={15} aria-hidden="true" /> {saving ? "Saving" : "Save odds"}</button>
            <button disabled={saving} type="button" onClick={cancelEditing}><X size={15} aria-hidden="true" /> Cancel</button>
          </div>
        )}
      </div>
      {editing && <label className="admin-competition__odds-note"><span>Review note</span><input maxLength="500" value={adjustmentNote} onChange={(event) => setAdjustmentNote(event.target.value)} placeholder="Final market review" /></label>}
      {editError && <div className="admin-competition__odds-error" role="alert">{editError}</div>}
      {odds.length ? (
        <div className="admin-competition__odds-table-wrap">
          <table className="admin-competition__odds-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Runner</th>
                <th>Win prob.</th>
                <th>Fair odds</th>
                <th>Generated odds</th>
                <th>Final odds</th>
              </tr>
            </thead>
            <tbody>
              {odds.map((item, index) => (
                <tr key={idOf(item.horse_id) || `${item.horse_name}-${index}`}>
                  <td>{item.probability_rank || index + 1}</td>
                  <td>
                    <strong>{item.horse_name || `Horse ${item.horse_no || index + 1}`}</strong>
                    <small>{item.jockey_name || "Jockey not assigned"}</small>
                  </td>
                  <td>{formatPercent(item.win_probability)}</td>
                  <td>{Number(item.fair_odds || 0).toFixed(2)}</td>
                  <td>{Number(item.generated_game_odds || item.game_odds || 0).toFixed(2)}</td>
                  <td>
                    {editing ? (
                      <input
                        aria-label={`Final odds for ${item.horse_name || `horse ${item.horse_no || index + 1}`}`}
                        disabled={saving}
                        min="1.01"
                        max="1000"
                        step="0.01"
                        type="number"
                        value={draft[idOf(item.horse_id)] ?? ""}
                        onChange={(event) => setDraft((current) => ({ ...current, [idOf(item.horse_id)]: event.target.value }))}
                      />
                    ) : <strong>{Number(item.game_odds || 0).toFixed(2)}</strong>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-competition__odds-empty">The market has no runner odds yet.</div>
      )}
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
        <label className="admin-field"><span>Entry fee pool</span><input min="0" type="number" value={value.entry_fee} onChange={(event) => onChange("entry_fee", event.target.value)} placeholder="12000000" /></label>
        <label className="admin-field"><span>Fee currency</span><select value={value.entry_fee_currency} onChange={(event) => onChange("entry_fee_currency", event.target.value)}><option value="VND">VND</option><option value="USD">USD</option><option value="EUR">EUR</option></select></label>
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
        <label className="admin-field"><span>Race name *</span><input required value={value.name} onChange={(event) => onChange("name", event.target.value)} placeholder="Race 01 - Opening heat" /></label>
        <label className="admin-field"><span>Race number *</span><input required min="1" type="number" value={value.race_no} onChange={(event) => onChange("race_no", event.target.value)} /></label>
        <label className="admin-field"><span>Race date & time</span><input type="datetime-local" value={value.race_date} onChange={(event) => onChange("race_date", event.target.value)} /></label>
        <label className="admin-field"><span>Location</span><input value={value.location} onChange={(event) => onChange("location", event.target.value)} placeholder="Track A" /></label>
        <label className="admin-field"><span>Venue code *</span><input required maxLength="8" value={value.venue_code} onChange={(event) => onChange("venue_code", event.target.value.toUpperCase())} placeholder="ST" /></label>
        <label className="admin-field"><span>Status</span><select value={value.status} onChange={(event) => onChange("status", event.target.value)}><option value="scheduled">Scheduled</option><option value="running">Running</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label>
        <label className="admin-field"><span>Race referee</span><select value={value.referee_id} onChange={(event) => onChange("referee_id", event.target.value)}><option value="">Unassigned</option>{referees.map((item) => <option key={getRefereeOptionId(item)} value={getRefereeOptionId(item)}>{getRefereeOptionLabel(item)}</option>)}</select></label>
        <label className="admin-field"><span>Distance (metres)</span><input min="1" type="number" value={value.distance} onChange={(event) => onChange("distance", event.target.value)} placeholder="1600" /></label>
        <label className="admin-field"><span>Maximum participants</span><input min="1" type="number" value={value.max_participants} onChange={(event) => onChange("max_participants", event.target.value)} placeholder="12" /></label>
        <label className="admin-field"><span>Course</span><select value={value.course} onChange={(event) => onChange("course", event.target.value)}>{raceCourses.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="admin-field"><span>Race class</span><select value={value.race_class} onChange={(event) => onChange("race_class", event.target.value)}>{raceClasses.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="admin-field"><span>Going</span><select value={value.going} onChange={(event) => onChange("going", event.target.value)}>{raceGoings.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="admin-field"><span>Surface</span><select value={value.surface} onChange={(event) => onChange("surface", event.target.value)}>{raceSurfaces.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="admin-field"><span>Prize pool</span><input min="0" type="number" value={value.prize_pool} onChange={(event) => onChange("prize_pool", event.target.value)} placeholder="50000000" /></label>
        <label className="admin-field"><span>Prize currency</span><select value={value.prize_currency} onChange={(event) => onChange("prize_currency", event.target.value)}><option value="VND">VND</option><option value="USD">USD</option><option value="EUR">EUR</option></select></label>
      </div>
      {hasTournament && !hasRounds && <div className="admin-live-state admin-live-state--warning"><strong>This tournament has no rounds yet.</strong> Create a round for the tournament before scheduling races.</div>}
      {!referees.length && <div className="admin-live-state"><strong>No active race referees are available.</strong> Approve or assign a Race Referee role before scheduling race control.</div>}
      <div className="admin-tool-card__footer"><button className="admin-header__button" disabled={saving || !hasRounds} type="submit">{saving ? "Saving..." : `${mode === "edit" ? "Save" : "Create"} race`}</button><button className="admin-header__button admin-header__button--ghost" type="button" onClick={onCancel}>Cancel</button></div>
    </form>
  );
}

function CompactGearSelector({ value = [], disabled, onToggle }) {
  const [showMore, setShowMore] = useState(false);
  const advancedSelectedCount = advancedHorseGearOptions.filter((gear) => value.includes(gear.code)).length;
  const renderOptions = (options) => options.map((gear) => (
    <label key={gear.code} title={gear.label}>
      <input disabled={disabled} checked={value.includes(gear.code)} onChange={() => onToggle(gear.code)} type="checkbox" />
      <span>{gear.code}</span>
    </label>
  ));

  return (
    <div className="admin-competition__gear-selector">
      <div className="admin-competition__gear-codes">{renderOptions(commonHorseGearOptions)}</div>
      <button
        aria-expanded={showMore}
        className="admin-competition__gear-more"
        onClick={() => setShowMore((current) => !current)}
        type="button"
      >
        <ChevronDown className={showMore ? "is-open" : ""} size={13} aria-hidden="true" />
        More{advancedSelectedCount ? ` (${advancedSelectedCount})` : ""}
      </button>
      {showMore && <div className="admin-competition__gear-codes admin-competition__gear-codes--advanced">{renderOptions(advancedHorseGearOptions)}</div>}
    </div>
  );
}

function RaceEntryWorkspace({ race, onClose, onChanged, onNotice }) {
  const [readiness, setReadiness] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");

  const applyReadiness = useCallback((next) => {
    setReadiness(next);
    setDrafts(Object.fromEntries((next?.participants || []).map((participant) => {
      const id = idOf(participant.registration_id);
      return [id, {
        horse_no: String(participant.horse_no || ""),
        draw: String(participant.draw || ""),
        declared_weight_kg: String(participant.declared_weight_kg ?? 54.5),
        gears: participant.gears?.length ? participant.gears : (participant.default_gears || []),
        current_rating: String(participant.current_rating ?? 50),
        rating_reason: "",
      }];
    })));
  }, []);

  const loadReadiness = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      applyReadiness(await adminApi.getRaceModelInputReadiness(race._id));
    } catch (apiError) {
      setError(apiError.message || "Unable to load race entries.");
    } finally {
      setLoading(false);
    }
  }, [applyReadiness, race._id]);

  useEffect(() => { loadReadiness(); }, [loadReadiness]);

  const updateDraft = (id, field, value) => {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], [field]: value } }));
  };

  const toggleGear = (id, code) => {
    const selected = drafts[id]?.gears || [];
    updateDraft(id, "gears", selected.includes(code)
      ? selected.filter((item) => item !== code)
      : [...selected, code]);
  };

  const finalize = async () => {
    setFinalizing(true);
    setError("");
    try {
      const result = await adminApi.finalizeRaceEntries(race._id);
      applyReadiness(result.readiness);
      onNotice(`Entries finalized for ${race.name}.`);
      await onChanged();
    } catch (apiError) {
      setError(apiError.message || "Unable to finalize race entries.");
    } finally {
      setFinalizing(false);
    }
  };

  const saveEntry = async (participant) => {
    const id = idOf(participant.registration_id);
    const draft = drafts[id];
    setSavingId(id);
    setError("");
    try {
      const result = await adminApi.updateRaceEntry(id, {
        horse_no: Number(draft.horse_no),
        draw: Number(draft.draw),
        declared_weight_kg: Number(draft.declared_weight_kg),
        gears: draft.gears,
      });
      applyReadiness(result.readiness);
      onNotice(`${participant.horse_name} entry updated.`);
      await onChanged();
    } catch (apiError) {
      setError(apiError.message || "Unable to update race entry.");
    } finally {
      setSavingId("");
    }
  };

  const saveRating = async (participant) => {
    const id = idOf(participant.registration_id);
    const draft = drafts[id];
    if (!draft.rating_reason.trim()) {
      setError(`Rating reason is required for ${participant.horse_name}.`);
      return;
    }
    setSavingId(id);
    setError("");
    try {
      await adminApi.updateHorseRating(idOf(participant.horse_id), {
        current_rating: Number(draft.current_rating),
        reason: draft.rating_reason.trim(),
      });
      await loadReadiness();
      onNotice(`${participant.horse_name} rating updated.`);
    } catch (apiError) {
      setError(apiError.message || "Unable to update horse rating.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-label={`Prepare entries for ${race.name}`}>
      <div className="admin-modal__card admin-competition__entry-modal">
        <div className="admin-panel__header admin-competition__entry-header">
          <div><p className="admin-panel__eyebrow">Model input</p><h2>{race.name}</h2></div>
          <div className="admin-competition__entry-header-actions">
            {readiness && <StatusBadge value={readiness.ready ? "ready" : readiness.entries_finalized ? "needs review" : "not finalized"} />}
            <button className="admin-header__button admin-header__button--ghost" type="button" onClick={onClose}>Close</button>
          </div>
        </div>
        {error && <div className="admin-live-state admin-live-state--warning">{error}</div>}
        {loading ? <LoadingSkeleton ariaLabel="Loading race entries" rows={5} variant="table" /> : (
          <>
            <div className="admin-competition__entry-summary">
              <div><span>Participants</span><strong>{readiness?.participant_count || 0}</strong></div>
              <div><span>Input version</span><strong>{readiness?.model_input_version || 0}</strong></div>
              <div><span>Race fields</span><strong>{readiness?.missing_race_fields?.length ? readiness.missing_race_fields.join(", ") : "Complete"}</strong></div>
            </div>
            {!readiness?.entries_finalized && (
              <div className="admin-competition__entry-toolbar">
                <span>{readiness?.participants?.filter((item) => item.primary_jockey).length || 0}/{readiness?.participant_count || 0} primary jockeys accepted</span>
                <button className="admin-header__button" disabled={finalizing || Number(readiness?.participant_count || 0) < 2} type="button" onClick={finalize}>
                  <ListChecks size={16} aria-hidden="true" /> {finalizing ? "Finalizing" : "Finalize entries"}
                </button>
              </div>
            )}
            <div className="admin-data-table__wrap admin-competition__entry-table-wrap">
              <table className="admin-data-table admin-competition__entry-table">
                <thead><tr><th>Runner</th><th>No.</th><th>Draw</th><th>Rating</th><th>Carried kg</th><th>Gear</th><th>Status</th><th><span className="sr-only">Save</span></th></tr></thead>
                <tbody>{(readiness?.participants || []).map((participant) => {
                  const id = idOf(participant.registration_id);
                  const draft = drafts[id] || {};
                  return (
                    <tr key={id}>
                      <td><strong>{participant.horse_name}</strong><small>{participant.primary_jockey?.name || "Primary jockey missing"}</small></td>
                      <td><input disabled={!readiness.entries_finalized} min="1" type="number" value={draft.horse_no || ""} onChange={(event) => updateDraft(id, "horse_no", event.target.value)} /></td>
                      <td><input disabled={!readiness.entries_finalized} min="1" type="number" value={draft.draw || ""} onChange={(event) => updateDraft(id, "draw", event.target.value)} /></td>
                      <td>{readiness.entries_finalized
                        ? <strong>{participant.rating_snapshot}</strong>
                        : <div className="admin-competition__rating-edit"><input min="0" max="140" type="number" value={draft.current_rating || ""} onChange={(event) => updateDraft(id, "current_rating", event.target.value)} /><input aria-label={`Rating reason for ${participant.horse_name}`} placeholder="Audit reason" value={draft.rating_reason || ""} onChange={(event) => updateDraft(id, "rating_reason", event.target.value)} /></div>}</td>
                      <td><input disabled={!readiness.entries_finalized} min="40" max="75" step="0.1" type="number" value={draft.declared_weight_kg || ""} onChange={(event) => updateDraft(id, "declared_weight_kg", event.target.value)} /></td>
                      <td><CompactGearSelector disabled={!readiness.entries_finalized} value={draft.gears || []} onToggle={(code) => toggleGear(id, code)} /></td>
                      <td>{participant.ready ? <span className="admin-competition__entry-ready"><CheckCircle2 size={14} /> Ready</span> : <small>{participant.missing_fields.join(", ")}</small>}</td>
                      <td><button aria-label={`Save ${participant.horse_name} ${readiness.entries_finalized ? "entry" : "rating"}`} className="admin-competition__entry-save" disabled={savingId === id} type="button" onClick={() => readiness.entries_finalized ? saveEntry(participant) : saveRating(participant)}><Save size={15} aria-hidden="true" /></button></td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
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
  const [registrationModeLoading, setRegistrationModeLoading] = useState("");
  const [bettingAction, setBettingAction] = useState("");
  const [bettingRaceId, setBettingRaceId] = useState("");
  const [bettingConfig, setBettingConfig] = useState(defaultBettingConfig);
  const [bettingOdds, setBettingOdds] = useState({ raceId: "", market: null, loading: false, error: "" });
  const [entryRace, setEntryRace] = useState(null);

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
    if (kind === "tournament") next = item ? { name: item.name || "", description: item.description || "", location: item.location || "", image_url: item.image_url || "", entry_fee: String(item.entry_fee || ""), entry_fee_currency: item.entry_fee_currency || "VND", start_date: dateValue(item.start_date), end_date: dateValue(item.end_date), status: item.status || "draft" } : { ...emptyTournament };
    if (kind === "round") next = item ? { tournament_id: idOf(item.tournament_id), name: item.name || "", round_order: String(item.round_order || ""), description: item.description || "", status: item.status || "draft" } : { ...emptyRound, tournament_id: data.tournaments[0]?._id || "" };
    if (kind === "race") {
      const defaultTournamentId = data.tournaments[0]?._id || "";
      const defaultRoundId = data.rounds.find((round) => idOf(round.tournament_id) === defaultTournamentId)?._id || "";
      next = item ? {
        tournament_id: idOf(item.tournament_id), round_id: idOf(item.round_id), referee_id: idOf(item.referee_id),
        name: item.name || "", race_no: String(item.race_no || 1), race_date: dateValue(item.race_date, true),
        location: item.location || "", venue_code: item.venue_code || "ST", distance: String(item.distance || ""),
        max_participants: String(item.max_participants || ""), course: item.course || "B+2",
        race_class: String(item.race_class || "5"), going: item.going || "Good", surface: item.surface || "Turf",
        prize_pool: String(item.prize_pool || ""), prize_currency: item.prize_currency || "VND",
        status: item.status || "scheduled",
      } : { ...emptyRace, tournament_id: defaultTournamentId, round_id: defaultRoundId };
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
        entry_fee: tournamentPayload.entry_fee ? Number(tournamentPayload.entry_fee) : 0,
        entry_fee_currency: tournamentPayload.entry_fee_currency || "VND",
        start_date: tournamentPayload.start_date || null,
        end_date: tournamentPayload.end_date || null,
      };
    }
    if (kind === "round") return { ...form, round_order: Number(form.round_order) };
    const selectedRound = data.rounds.find((round) => round._id === form.round_id);
    if (!selectedRound || idOf(selectedRound.tournament_id) !== form.tournament_id) throw new Error("The selected round does not belong to this tournament.");
    return {
      ...form,
      race_no: Number(form.race_no),
      referee_id: form.referee_id || null,
      race_date: form.race_date ? new Date(form.race_date).toISOString() : null,
      distance: form.distance ? Number(form.distance) : null,
      max_participants: form.max_participants ? Number(form.max_participants) : null,
      prize_pool: form.prize_pool ? Number(form.prize_pool) : 0,
      prize_currency: form.prize_currency || "VND",
    };
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

  const setOwnerRegistrationMode = async (enabled) => {
    setRegistrationModeLoading(enabled ? "on" : "off");
    setError("");
    try {
      const data = await adminApi.setRaceRegistrationDemoMode(enabled);
      const updatedCount = data.updated_count ?? 0;
      setNotice(enabled
        ? `Owner registration turned on for ${updatedCount} scheduled races.`
        : `Owner registration turned off for ${updatedCount} scheduled races.`);
      await loadData(true);
    } catch (apiError) {
      setError(apiError.message || "Unable to update owner registration mode.");
    } finally {
      setRegistrationModeLoading("");
    }
  };

  const buildOpenBettingPayload = () => {
    const minStake = Number(bettingConfig.min_stake);
    const maxStake = Number(bettingConfig.max_stake);
    if (!Number.isFinite(minStake) || minStake < 1) throw new Error("Min stake must be at least 1.");
    if (!Number.isFinite(maxStake) || maxStake < 1) throw new Error("Max stake must be at least 1.");
    if (maxStake < minStake) throw new Error("Max stake must be greater than or equal to min stake.");

    const payload = {
      min_stake: minStake,
      max_stake: maxStake,
      currency: bettingConfig.currency || "TOKEN",
    };
    if (bettingConfig.closes_at) {
      const closesAt = new Date(bettingConfig.closes_at);
      if (Number.isNaN(closesAt.getTime())) throw new Error("Close time must be a valid date and time.");
      payload.closes_at = closesAt.toISOString();
    }
    return payload;
  };

  const loadBettingOdds = useCallback(async (raceId) => {
    if (!raceId) {
      setBettingOdds({ raceId: "", market: null, loading: false, error: "" });
      return;
    }

    setBettingOdds({ raceId, market: null, loading: true, error: "" });
    try {
      const response = await adminApi.getRaceOdds(raceId);
      setBettingOdds({ raceId, market: response.market || null, loading: false, error: "" });
    } catch (apiError) {
      const message = apiError.status === 404
        ? "No odds market has been generated for this race."
        : apiError.message || "Unable to load race odds.";
      setBettingOdds({ raceId, market: null, loading: false, error: message });
    }
  }, []);

  const runBettingAction = async (race, action) => {
    const raceId = race._id;
    if (!raceId) return;
    setBettingAction(`${raceId}:${action}`);
    setError("");
    try {
      if (action === "generate") {
        await adminApi.generateRaceOdds(raceId);
        setNotice(`Odds generated for ${race.name}.`);
      } else if (action === "open") {
        await adminApi.openRaceBetting(raceId, buildOpenBettingPayload());
        setNotice(`Betting opened for ${race.name}.`);
      } else if (action === "close") {
        await adminApi.closeRaceBetting(raceId);
        setNotice(`Betting closed for ${race.name}.`);
      } else if (action === "settle") {
        await betApi.settleRaceBets(raceId);
        setNotice(`Bet settlement retried for ${race.name}.`);
      }
      await loadData(true);
      await loadBettingOdds(raceId);
    } catch (apiError) {
      setError(apiError.message || `Unable to ${action} betting for ${race.name}.`);
    } finally {
      setBettingAction("");
    }
  };

  const saveManualOdds = async (payload) => {
    const raceId = bettingControlRace?._id;
    if (!raceId) throw new Error("Select a race before editing odds.");
    setBettingAction(`${raceId}:adjust`);
    setError("");
    try {
      await adminApi.updateRaceOdds(raceId, payload);
      setNotice(`Final odds saved for ${bettingControlRace.name}.`);
      await loadData(true);
      await loadBettingOdds(raceId);
    } catch (apiError) {
      setError(apiError.message || `Unable to save final odds for ${bettingControlRace.name}.`);
      throw apiError;
    } finally {
      setBettingAction("");
    }
  };

  const matchesFilters = (item) => {
    const haystack = [item.name, item.location, item.status, item.description, item.tournament_id?.name, item.round_id?.name].join(" ").toLowerCase();
    return (!query.trim() || haystack.includes(query.trim().toLowerCase())) && (status === "all" || item.status === status);
  };
  const filteredTournaments = useMemo(
    () => data.tournaments.filter(matchesFilters).sort((first, second) => sortNewestWithStatus(first, second, ["created_at", "updated_at", "start_date"])),
    [data.tournaments, query, status],
  );
  const filteredRounds = useMemo(() => data.rounds.filter((item) => matchesFilters(item) && (roundTournament === "all" || idOf(item.tournament_id) === roundTournament)), [data.rounds, query, roundTournament, status]);
  const filteredRaces = useMemo(
    () => data.races.filter(matchesFilters).sort((first, second) => sortNewestWithStatus(first, second, ["created_at", "updated_at", "race_date"])),
    [data.races, query, status],
  );
  const bettingControlRace = useMemo(
    () => filteredRaces.find((race) => race._id === bettingRaceId) || filteredRaces[0] || null,
    [bettingRaceId, data.races, filteredRaces],
  );
  const pagedTournaments = filteredTournaments.slice((tournamentPage - 1) * PAGE_SIZE, tournamentPage * PAGE_SIZE);
  const pagedRounds = filteredRounds.slice((roundPage - 1) * PAGE_SIZE, roundPage * PAGE_SIZE);
  const pagedRaces = filteredRaces.slice((racePage - 1) * PAGE_SIZE, racePage * PAGE_SIZE);
  const scheduledCount = data.races.filter((race) => race.status === "scheduled").length;

  useEffect(() => { setTournamentPage(1); setRoundPage(1); setRacePage(1); }, [query, status]);
  useEffect(() => { setRoundPage(1); }, [roundTournament]);
  useEffect(() => { setTournamentPage((current) => Math.min(current, Math.max(1, Math.ceil(filteredTournaments.length / PAGE_SIZE)))); }, [filteredTournaments.length]);
  useEffect(() => { setRoundPage((current) => Math.min(current, Math.max(1, Math.ceil(filteredRounds.length / PAGE_SIZE)))); }, [filteredRounds.length]);
  useEffect(() => { setRacePage((current) => Math.min(current, Math.max(1, Math.ceil(filteredRaces.length / PAGE_SIZE)))); }, [filteredRaces.length]);
  useEffect(() => {
    if (!bettingControlRace) {
      setBettingRaceId("");
      return;
    }
    if (bettingRaceId !== bettingControlRace._id) setBettingRaceId(bettingControlRace._id);
  }, [bettingControlRace, bettingRaceId]);
  useEffect(() => {
    const market = bettingControlRace?.betting_market || {};
    setBettingConfig({
      min_stake: String(market.min_stake || defaultBettingConfig.min_stake),
      max_stake: String(market.max_stake || defaultBettingConfig.max_stake),
      currency: market.currency || defaultBettingConfig.currency,
      closes_at: dateValue(market.closes_at || bettingControlRace?.betting_closes_at, true),
    });
  }, [bettingControlRace?._id]);
  useEffect(() => {
    if (!isSchedule) return undefined;
    if (!bettingControlRace?._id) {
      loadBettingOdds("");
      return undefined;
    }

    const hasOddsMarket = getBettingStatus(bettingControlRace) !== "unavailable"
      || Boolean(bettingControlRace?.betting_market?.odds_market_id);

    if (!hasOddsMarket) {
      setBettingOdds({ raceId: bettingControlRace._id, market: null, loading: false, error: "" });
      return undefined;
    }

    loadBettingOdds(bettingControlRace._id);
    return undefined;
  }, [isSchedule, bettingControlRace?._id, loadBettingOdds]);

  const changeBettingConfig = (field, value) => {
    setBettingConfig((current) => ({ ...current, [field]: value }));
  };

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
    <AdminLayout title={title} eyebrow="Competition planning" description={description} actions={<><button className="admin-header__button" type="button" onClick={() => openForm(isSchedule ? "race" : "tournament")}><Plus size={17} aria-hidden="true" /> {isSchedule ? "Create race" : "Create tournament"}</button>{isSchedule && <><button className="admin-header__button admin-header__button--ghost" disabled={Boolean(registrationModeLoading)} type="button" onClick={() => setOwnerRegistrationMode(true)}><Unlock size={17} aria-hidden="true" /> {registrationModeLoading === "on" ? "Turning on" : "Turn on entries"}</button><button className="admin-header__button admin-header__button--ghost" disabled={Boolean(registrationModeLoading)} type="button" onClick={() => setOwnerRegistrationMode(false)}><Lock size={17} aria-hidden="true" /> {registrationModeLoading === "off" ? "Turning off" : "Turn off entries"}</button></>}{!isSchedule && <button className="admin-header__button admin-header__button--ghost" disabled={!data.tournaments.length} type="button" onClick={() => openForm("round")}><Plus size={17} aria-hidden="true" /> Add round</button>}</>}>
      <section className="admin-metrics admin-metrics--module" aria-label="Competition summary">
        {isSchedule ? <><article className="admin-metric-card"><p className="admin-metric-card__label">Total races</p><div className="admin-metric-card__value">{data.races.length}</div></article><article className="admin-metric-card"><p className="admin-metric-card__label">Scheduled</p><div className="admin-metric-card__value">{scheduledCount}</div></article><article className="admin-metric-card"><p className="admin-metric-card__label">Rounds</p><div className="admin-metric-card__value">{data.rounds.length}</div></article></> : <><article className="admin-metric-card"><p className="admin-metric-card__label">Tournaments</p><div className="admin-metric-card__value">{data.tournaments.length}</div></article><article className="admin-metric-card"><p className="admin-metric-card__label">Rounds</p><div className="admin-metric-card__value">{data.rounds.length}</div></article><article className="admin-metric-card"><p className="admin-metric-card__label">Active</p><div className="admin-metric-card__value">{data.tournaments.filter((item) => item.status === "active").length}</div></article></>}
      </section>

      <section className="admin-competition__flow" aria-label="Competition structure"><div><span>01</span><strong>Tournaments</strong><small>{data.tournaments.length}</small></div><i aria-hidden="true" /><div><span>02</span><strong>Rounds</strong><small>{data.rounds.length}</small></div><i aria-hidden="true" /><div><span>03</span><strong>Races</strong><small>{data.races.length}</small></div></section>

      <section className="admin-panel admin-actions-panel"><div className="admin-panel__header"><p className="admin-panel__eyebrow">Filters</p><h2>Competition records</h2></div><div className="admin-toolbar"><label className="admin-field"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, venue, tournament or round..." /></label><label className="admin-field"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{(isSchedule ? ["scheduled", "running", "completed", "cancelled"] : ["draft", "planning", "active", "completed", "archived"]).map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></label><button className="admin-header__button admin-header__button--ghost" disabled={refreshing} type="button" onClick={() => loadData(true)}><RefreshCw size={16} className={refreshing ? "admin-competition__spin" : ""} aria-hidden="true" /> {refreshing ? "Refreshing" : "Refresh"}</button></div></section>

      {notice && <section className="admin-live-state admin-competition__success" aria-live="polite">{notice}</section>}
      {error && <section className="admin-live-state admin-live-state--warning" aria-live="assertive">{error}</section>}

      {isSchedule && (
        <section className="admin-panel admin-competition__betting-panel">
          <div className="admin-panel__header admin-competition__section-header">
            <div>
              <p className="admin-panel__eyebrow">Betting control</p>
              <h2>Win market lifecycle</h2>
              <span>Generate odds, open betting, close betting, or retry settlement for one race.</span>
            </div>
            {bettingControlRace && <BettingStatusBadge race={bettingControlRace} />}
          </div>
          <div className="admin-competition__betting-controls">
            <div className="admin-competition__race-picker">
              <label className="admin-field">
                <span>Race</span>
                <select value={bettingControlRace?._id || ""} onChange={(event) => setBettingRaceId(event.target.value)} disabled={!data.races.length}>
                  {!data.races.length && <option value="">No races available</option>}
                  {filteredRaces.map((race) => (
                    <option key={race._id} value={race._id}>{race.name} - {titleCase(race.status)}</option>
                  ))}
                </select>
              </label>
              {bettingControlRace && <BettingRaceContext race={bettingControlRace} />}
            </div>
            {bettingControlRace ? (
              <>
                <div className="admin-competition__control-block">
                  <div className="admin-competition__control-block-header">
                    <strong>Opening rules</strong>
                    <span>Used when the market opens</span>
                  </div>
                  <BettingOpenSettings value={bettingConfig} onChange={changeBettingConfig} disabled={Boolean(bettingAction)} />
                </div>
                <div className="admin-competition__control-block admin-competition__control-block--actions">
                  <div className="admin-competition__control-block-header">
                    <strong>Market actions</strong>
                    <span>Current race only</span>
                  </div>
                  <BettingActions race={bettingControlRace} activeAction={bettingAction} onAction={runBettingAction} />
                </div>
              </>
            ) : (
              <p className="admin-competition__muted">Create a scheduled race before opening betting.</p>
            )}
          </div>
          {bettingControlRace && (
            <BettingOddsSnapshot
              market={bettingOdds.raceId === bettingControlRace._id ? bettingOdds.market : null}
              loading={bettingOdds.raceId === bettingControlRace._id && bettingOdds.loading}
              error={bettingOdds.raceId === bettingControlRace._id ? bettingOdds.error : ""}
              onSave={saveManualOdds}
              saving={bettingAction === `${bettingControlRace._id}:adjust`}
            />
          )}
        </section>
      )}

      {isSchedule ? (
        <section className="admin-panel"><div className="admin-panel__header admin-competition__ledger-heading"><div><p className="admin-panel__eyebrow">Race ledger</p><h2>Scheduled races</h2></div><span>{filteredRaces.length} records - 20 per page</span></div>{!data.tournaments.length || !data.rounds.length ? <div className="admin-competition__empty"><CalendarDays size={30} aria-hidden="true" /><div><h3>Competition structure required</h3><p>Create a tournament and round first.</p></div></div> : !filteredRaces.length ? <div className="admin-competition__empty"><CalendarDays size={30} aria-hidden="true" /><div><h3>No races found</h3><p>Create a race or reset the filters.</p></div></div> : <div className="admin-data-table__wrap"><table className="admin-data-table"><thead><tr><th>Race</th><th>Tournament / Round</th><th>Scheduled</th><th>Track</th><th>Referee</th><th>Status</th><th>Actions</th></tr></thead><tbody>{pagedRaces.map((race) => <tr key={race._id}><td><strong>R{race.race_no || 1} · {race.name}</strong><small className="admin-competition__id">Class {race.race_class || 5} · {race.course || "B+2"} · {race.going || "Good"}</small></td><td>{race.tournament_id?.name || "Unknown tournament"}<small className="admin-competition__subline">{race.round_id?.name || "Unknown round"}</small></td><td>{formatDate(race.race_date, true)}</td><td>{race.venue_code || "ST"} · {race.location || "Not set"}</td><td>{race.referee_id?.user_id?.full_name || "Unassigned"}</td><td><StatusBadge value={race.status} /></td><td><RowActions label={race.name} onEdit={() => openForm("race", race)} onDelete={() => setDeleteTarget({ kind: "race", item: race })}><button type="button" onClick={() => setEntryRace(race)}><ListChecks size={15} aria-hidden="true" /> Entries</button></RowActions></td></tr>)}</tbody></table></div>}<Pagination page={racePage} totalItems={filteredRaces.length} onChange={setRacePage} label="Race ledger" /></section>
      ) : (
        <div className="admin-competition__stack">
        <section className="admin-panel"><div className="admin-panel__header admin-competition__ledger-heading"><div><p className="admin-panel__eyebrow">Tournament ledger</p><h2>Tournaments</h2></div><span>{filteredTournaments.length} records - 20 per page</span></div>{!filteredTournaments.length ? <div className="admin-competition__empty"><CalendarDays size={30} aria-hidden="true" /><div><h3>No tournaments found</h3><p>Create a tournament or reset the filters.</p></div></div> : <div className="admin-data-table__wrap"><table className="admin-data-table"><thead><tr><th>Tournament</th><th>Dates</th><th>Venue</th><th>Entry fee</th><th>Rounds</th><th>Status</th><th>Actions</th></tr></thead><tbody>{pagedTournaments.map((tournament) => <tr key={tournament._id}><td><strong>{tournament.name}</strong><small className="admin-competition__id">{tournament._id}</small></td><td>{formatDate(tournament.start_date)}<small className="admin-competition__subline">to {formatDate(tournament.end_date)}</small></td><td>{tournament.location || "Not set"}</td><td>{Number(tournament.entry_fee || 0) > 0 ? formatMoney(tournament.entry_fee, tournament.entry_fee_currency || "VND") : "No fee"}</td><td>{data.rounds.filter((round) => idOf(round.tournament_id) === tournament._id).length}</td><td><StatusBadge value={tournament.status} /></td><td><RowActions label={tournament.name} onEdit={() => openForm("tournament", tournament)} onDelete={() => setDeleteTarget({ kind: "tournament", item: tournament })} /></td></tr>)}</tbody></table></div>}<Pagination page={tournamentPage} totalItems={filteredTournaments.length} onChange={setTournamentPage} label="Tournament ledger" /></section>
          <section className="admin-panel"><div className="admin-panel__header admin-competition__section-header"><div><p className="admin-panel__eyebrow">Round builder</p><h2>Ordered rounds</h2><span>{filteredRounds.length} records - 20 per page</span></div><div className="admin-competition__round-controls"><label className="admin-field"><span>Tournament</span><select value={roundTournament} onChange={(event) => setRoundTournament(event.target.value)}><option value="all">All tournaments</option>{data.tournaments.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label><button className="admin-header__button admin-header__button--ghost" disabled={!data.tournaments.length} type="button" onClick={() => openForm("round")}><Plus size={16} aria-hidden="true" /> Add round</button></div></div>{!filteredRounds.length ? <div className="admin-competition__empty"><CalendarDays size={30} aria-hidden="true" /><div><h3>No rounds found</h3><p>Add a round or change the tournament filter.</p></div></div> : <div className="admin-data-table__wrap"><table className="admin-data-table"><thead><tr><th>Order</th><th>Round</th><th>Tournament</th><th>Status</th><th>Actions</th></tr></thead><tbody>{pagedRounds.map((round) => <tr key={round._id}><td><span className="admin-competition__order">{round.round_order}</span></td><td><strong>{round.name}</strong><small className="admin-competition__id">{round._id}</small></td><td>{round.tournament_id?.name || "Unknown tournament"}</td><td><StatusBadge value={round.status} /></td><td><RowActions label={round.name} onEdit={() => openForm("round", round)} onDelete={() => setDeleteTarget({ kind: "round", item: round })} /></td></tr>)}</tbody></table></div>}<Pagination page={roundPage} totalItems={filteredRounds.length} onChange={setRoundPage} label="Round ledger" /></section>
        </div>
      )}

      {modal && <div className="admin-modal" role="dialog" aria-modal="true" aria-label={`${modal.mode} ${modal.kind}`} onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setModal(null); }}><div className="admin-modal__card admin-competition__modal"><div className="admin-panel__header"><p className="admin-panel__eyebrow">{modal.mode === "edit" ? "Edit record" : "Create record"}</p><h2>{modal.mode === "edit" ? "Update" : "New"} {entityConfig[modal.kind].title}</h2></div>{error && <div className="admin-live-state admin-live-state--warning">{error}</div>}{modal.kind === "tournament" && <TournamentForm value={form} onChange={changeField} onSubmit={submitForm} onCancel={() => setModal(null)} saving={saving} mode={modal.mode} />}{modal.kind === "round" && <RoundForm value={form} tournaments={data.tournaments} onChange={changeField} onSubmit={submitForm} onCancel={() => setModal(null)} saving={saving} mode={modal.mode} />}{modal.kind === "race" && <RaceForm value={form} tournaments={data.tournaments} rounds={data.rounds} referees={data.referees} onChange={changeField} onSubmit={submitForm} onCancel={() => setModal(null)} saving={saving} mode={modal.mode} />}</div></div>}
      {entryRace && <RaceEntryWorkspace race={entryRace} onClose={() => setEntryRace(null)} onChanged={() => loadData(true)} onNotice={setNotice} />}
      {deleteTarget && <div className="admin-modal" role="alertdialog" aria-modal="true" aria-labelledby="competition-delete-title" aria-describedby="competition-delete-copy" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) setDeleteTarget(null); }}><div className="admin-modal__card admin-competition__delete-dialog"><Trash2 size={22} aria-hidden="true" /><div><p className="admin-panel__eyebrow">Delete {entityConfig[deleteTarget.kind].title}</p><h2 id="competition-delete-title">{deleteTarget.item.name}</h2><p id="competition-delete-copy">{deleteBlocked ? `Remove ${deleteDependencyCount} linked ${deleteTarget.kind === "tournament" ? "rounds" : "races"} first.` : "This record will be removed from the competition workspace."}</p></div><div className="admin-tool-card__footer"><button className="admin-header__button admin-header__button--red" disabled={deleting || deleteBlocked} type="button" onClick={removeEntity}>{deleting ? "Deleting..." : "Delete"}</button><button className="admin-header__button admin-header__button--ghost" disabled={deleting} type="button" onClick={() => setDeleteTarget(null)}>Cancel</button></div></div></div>}
    </AdminLayout>
  );
}

export default AdminCompetitionModule;
