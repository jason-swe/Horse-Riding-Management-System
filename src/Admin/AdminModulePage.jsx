import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LoadingSkeleton from "../components/LoadingSkeleton";
import AdminLayout from "./AdminLayout";
import { adminModules } from "./adminModules";
import { useAdminModuleApi } from "./useAdminModuleApi";

/* ── Human-readable field labels ───────────────────────── */
const fieldLabels = {
  name: "Full name",
  role: "Role",
  status: "Status",
  horseName: "Horse name",
  owner: "Owner",
  breed: "Breed",
  ready: "Race-ready",
  raceName: "Race name",
  date: "Race date",
  round: "Round",
  referee: "Referee",
  race: "Race ID",
  winner: "Winner",
  time: "Finish time",
  prize: "Prize amount",
  participant: "Participant",
  target: "Target / entry",
  horse: "Assigned horse",
  races: "Total races",
  assignedRace: "Assigned race",
  reportStatus: "Report status",
  violations: "Violations",
  spectator: "Spectator",
  pick: "Predicted winner",
  odds: "Odds",
  tournament: "Tournament name",
  venue: "Venue",
  rounds: "Rounds count",
};

/* ── Column labels for each module table ───────────────── */
const tableColumnKeys = {
  users:         ["ID", "Name", "Role", "Status", "Verification"],
  horses:        ["Horse ID", "Horse name", "Owner", "Breed", "Ready", "Next race"],
  schedule:      ["Race", "Tournament", "Date", "Round", "Referee", "Status"],
  results:       ["Race", "Winner", "Time", "Prize", "Referee report"],
  registrations: ["Reg ID", "Participant", "Role", "Target", "Submitted", "Status"],
  jockeys:       ["Jockey ID", "Name", "Assigned horse", "Races", "Wins", "Status"],
  referees:      ["Referee ID", "Name", "Assigned race", "Violations", "Report status"],
  predictions:   ["Bet ID", "Spectator", "Race", "Pick", "Odds", "Outcome", "Prize"],
  tournament:    ["Tournament ID", "Season", "Venue", "Rounds", "Published", "Status"],
};

/* ── Modal config: which action opens what ─────────────── */
const moduleControls = {
  users:         { title: "Create user",       fields: ["name", "role", "status"],                            options: { role: ["Admin", "Horse Owner", "Jockey", "Race Referee", "Spectator"], status: ["Active", "Pending", "Suspended"] } },
  horses:        { title: "Add horse",         fields: ["horseName", "owner", "breed", "ready"],              options: { breed: ["Thoroughbred", "Warmblood", "Arabian", "Other"], ready: ["Yes", "No", "Review"] } },
  schedule:      { title: "Create race",       fields: ["raceName", "date", "round", "referee"],              options: { round: ["Heat 1", "Heat 2", "Semi-final", "Final"] } },
  results:       { title: "Publish result",    fields: ["race", "winner", "time", "prize"],                   options: {} },
  registrations: { title: "Review request",   fields: ["participant", "role", "target", "status"],           options: { role: ["Horse Owner", "Jockey", "Race Referee", "Spectator"], status: ["Approved", "Pending", "Review"] } },
  jockeys:       { title: "Invite jockey",     fields: ["name", "horse", "status", "races"],                  options: { status: ["Invited", "Active", "Pending"] } },
  referees:      { title: "Assign referee",    fields: ["name", "assignedRace", "reportStatus", "violations"],options: { reportStatus: ["Draft", "Filed", "Confirmed"] } },
  predictions:   { title: "Review bet",        fields: ["spectator", "race", "pick", "odds"],                 options: {} },
  tournament:    { title: "Create tournament", fields: ["tournament", "venue", "rounds", "status"],           options: { status: ["Draft", "Planning", "Active"] } },
};

const defaultFormState = {
  users:         { name: "", role: "Horse Owner", status: "Active" },
  horses:        { horseName: "", owner: "", breed: "Thoroughbred", ready: "Review" },
  schedule:      { raceName: "", date: "", round: "Heat 1", referee: "" },
  results:       { race: "", winner: "", time: "", prize: "" },
  registrations: { participant: "", role: "Horse Owner", target: "", status: "Pending" },
  jockeys:       { name: "", horse: "", status: "Invited", races: "0" },
  referees:      { name: "", assignedRace: "", reportStatus: "Draft", violations: "0" },
  predictions:   { spectator: "", race: "", pick: "", odds: "" },
  tournament:    { tournament: "", venue: "", rounds: "12", status: "Draft" },
};

/* ── Status badge ────────────────────────────────────────── */
const STATUS_COLORS = {
  active:    "green",
  yes:       "green",
  confirmed: "green",
  approved:  "green",
  published: "green",
  win:       "green",
  filed:     "blue",
  invited:   "blue",
  planning:  "blue",
  draft:     "gray",
  pending:   "amber",
  review:    "amber",
  no:        "red",
  suspended: "red",
  lose:      "red",
};

function StatusBadge({ value }) {
  const key = (value || "").toLowerCase();
  const color = STATUS_COLORS[key] || "gray";
  return <span className={`admin-status-badge admin-status-badge--${color}`}>{value}</span>;
}

/* ── Context-aware row actions ─────────────────────────── */
const rowActions = {
  registrations: ["Approve", "Reject", "Flag for review"],
  results:       ["Confirm & publish", "Request revision"],
  referees:      ["Confirm report", "Request revision"],
  horses:        ["Mark ready", "Flag for inspection"],
  users:         ["Activate", "Suspend", "Reset password"],
  jockeys:       ["Confirm assignment", "Revoke invite"],
  predictions:   ["Award prize", "Disqualify"],
  schedule:      ["Publish slot", "Move to draft"],
  tournament:    ["Publish", "Archive"],
};

/* ── Tool panel content per module ─────────────────────── */
function PermissionMatrixPanel() {
  const roles = ["Horse Owner", "Jockey", "Referee", "Spectator"];
  const perms = ["View races", "Register", "Submit reports", "View results", "Place bets"];
  const defaults = {
    "Horse Owner": [true, true, false, true, false],
    "Jockey":      [true, true, false, true, false],
    "Referee":     [true, false, true, true, false],
    "Spectator":   [true, false, false, true, true],
  };
  const [matrix, setMatrix] = useState(defaults);
  return (
    <div className="admin-permission-matrix">
      <table className="admin-data-table">
        <thead>
          <tr>
            <th>Role</th>
            {perms.map((p) => <th key={p}>{p}</th>)}
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role}>
              <td style={{ fontWeight: 700, color: "#EEE7D4" }}>{role}</td>
              {perms.map((perm, i) => (
                <td key={perm} style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={matrix[role][i]}
                    onChange={() => setMatrix((prev) => {
                      const updated = { ...prev, [role]: [...prev[role]] };
                      updated[role][i] = !updated[role][i];
                      return updated;
                    })}
                    style={{ accentColor: "var(--accent)", width: 16, height: 16, cursor: "pointer" }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CalendarPanel() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const races = { 3: "R-01 Heat 1", 4: "R-02 Heat 2", 10: "R-03 Semi", 17: "Final" };
  return (
    <div className="admin-calendar">
      <div className="admin-calendar__header">
        <span>June 2026</span>
      </div>
      <div className="admin-calendar__grid">
        {days.map((d) => <div key={d} className="admin-calendar__day-label">{d}</div>)}
        {[...Array(2)].map((_, i) => <div key={`blank-${i}`} className="admin-calendar__cell" />)}
        {[...Array(30)].map((_, i) => {
          const day = i + 1;
          const hasRace = races[day];
          return (
            <div key={day} className={`admin-calendar__cell${hasRace ? " admin-calendar__cell--race" : ""}`}>
              <span className="admin-calendar__date">{day}</span>
              {hasRace && <span className="admin-calendar__race-label">{hasRace}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ApprovalInboxPanel({ onAction }) {
  const items = [
    { id: "REG-202", name: "Anh Khoa", role: "Jockey", target: "Blue Horizon" },
    { id: "REG-204", name: "Cam Tu",   role: "Horse Owner", target: "Golden Mane" },
    { id: "REG-205", name: "Duc Huy",  role: "Jockey", target: "Silver Wind" },
  ];
  return (
    <div className="admin-approval-list">
      {items.map((item) => (
        <div key={item.id} className="admin-approval-row">
          <div className="admin-approval-info">
            <span className="admin-approval-id">{item.id}</span>
            <span className="admin-approval-name">{item.name}</span>
            <span className="admin-approval-meta">{item.role} — {item.target}</span>
          </div>
          <div className="admin-approval-actions">
            <button className="admin-header__button" style={{ minHeight: 34, padding: "0 12px", fontSize: "0.82rem" }}
              type="button" onClick={() => onAction(`Approved ${item.name} (${item.id})`)}>
              Approve
            </button>
            <button className="admin-header__button admin-header__button--red" style={{ minHeight: 34, padding: "0 12px", fontSize: "0.82rem" }}
              type="button" onClick={() => onAction(`Rejected ${item.name} (${item.id})`)}>
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PrizeSummaryPanel() {
  const rows = [
    { race: "R-01", winner: "Storm Arrow", spectator: "Ngoc Anh", prize: "$120", status: "Paid" },
    { race: "R-02", winner: "Blue Horizon", spectator: "Phuong Mai", prize: "$210", status: "Paid" },
    { race: "R-05", winner: "Night Sprint", spectator: "Quoc Bao", prize: "$185", status: "Pending" },
  ];
  return (
    <div className="admin-data-table__wrap">
      <table className="admin-data-table">
        <thead>
          <tr>
            <th>Race</th><th>Winner</th><th>Spectator</th><th>Prize</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.race}>
              <td>{r.race}</td>
              <td>{r.winner}</td>
              <td>{r.spectator}</td>
              <td style={{ color: "#EEE7D4", fontWeight: 600 }}>{r.prize}</td>
              <td><StatusBadge value={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RoleFilterPanel() {
  const [selected, setSelected] = useState("All");
  const roles = ["All", "Admin", "Horse Owner", "Jockey", "Race Referee", "Spectator"];
  return (
    <div className="admin-role-filter">
      <p style={{ margin: "0 0 10px", fontSize: "0.84rem", color: "rgba(245,247,243,0.72)" }}>Filter users by role</p>
      <div className="admin-role-filter__chips">
        {roles.map((r) => (
          <button key={r} type="button"
            className={`admin-role-chip${selected === r ? " admin-role-chip--active" : ""}`}
            onClick={() => setSelected(r)}>
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

function AssignmentPlannerPanel({ onAction }) {
  const referees = [
    { id: "RF-01", name: "Le Quang", assigned: 1, capacity: 3 },
    { id: "RF-02", name: "Thu Trang", assigned: 1, capacity: 3 },
    { id: "RF-03", name: "Minh Tu", assigned: 1, capacity: 3 },
    { id: "RF-04", name: "Hong Son", assigned: 1, capacity: 3 },
  ];
  return (
    <div className="admin-approval-list">
      {referees.map((ref) => (
        <div key={ref.id} className="admin-approval-row">
          <div className="admin-approval-info">
            <span className="admin-approval-id">{ref.id}</span>
            <span className="admin-approval-name">{ref.name}</span>
            <span className="admin-approval-meta">Assigned: {ref.assigned} / {ref.capacity} races</span>
          </div>
          <button className="admin-header__button" style={{ minHeight: 34, padding: "0 12px", fontSize: "0.82rem" }}
            type="button" onClick={() => onAction(`Assigned ${ref.name} to new race`)}>
            Assign
          </button>
        </div>
      ))}
    </div>
  );
}

function ViolationTrackerPanel() {
  const violations = [
    { id: "V-001", race: "R-02", horse: "Blue Horizon", type: "False start", status: "Filed" },
    { id: "V-002", race: "R-04", horse: "Night Sprint", type: "Lane breach", status: "Pending" },
    { id: "V-003", race: "R-04", horse: "Silver Wind", type: "Equipment issue", status: "Pending" },
  ];
  return (
    <div className="admin-data-table__wrap">
      <table className="admin-data-table">
        <thead>
          <tr><th>ID</th><th>Race</th><th>Horse</th><th>Violation</th><th>Status</th></tr>
        </thead>
        <tbody>
          {violations.map((v) => (
            <tr key={v.id}>
              <td>{v.id}</td><td>{v.race}</td><td>{v.horse}</td><td>{v.type}</td>
              <td><StatusBadge value={v.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultApprovalPanel({ onAction }) {
  const pending = [
    { race: "R-05", winner: "Night Sprint", time: "1:38.02", referee: "Minh Tu" },
  ];
  return (
    <div className="admin-approval-list">
      {pending.map((item) => (
        <div key={item.race} className="admin-approval-row">
          <div className="admin-approval-info">
            <span className="admin-approval-id">{item.race}</span>
            <span className="admin-approval-name">{item.winner}</span>
            <span className="admin-approval-meta">Time: {item.time} · Referee: {item.referee}</span>
          </div>
          <div className="admin-approval-actions">
            <button className="admin-header__button" style={{ minHeight: 34, padding: "0 12px", fontSize: "0.82rem" }}
              type="button" onClick={() => onAction(`Published result for ${item.race} — ${item.winner}`)}>
              Publish
            </button>
            <button className="admin-header__button admin-header__button--ghost" style={{ minHeight: 34, padding: "0 12px", fontSize: "0.82rem" }}
              type="button" onClick={() => onAction(`Revision requested for ${item.race}`)}>
              Request revision
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function HorseSearchPanel() {
  const [q, setQ] = useState("");
  const horses = [
    { id: "H-001", name: "Storm Arrow", owner: "Minh Le", breed: "Thoroughbred", ready: "Yes" },
    { id: "H-002", name: "Blue Horizon", owner: "Nhan Tran", breed: "Warmblood", ready: "Yes" },
    { id: "H-003", name: "Golden Mane", owner: "Cam Tu", breed: "Arabian", ready: "Review" },
    { id: "H-004", name: "Night Sprint", owner: "Hoang Anh", breed: "Thoroughbred", ready: "Yes" },
    { id: "H-005", name: "Silver Wind", owner: "Bao Nguyen", breed: "Warmblood", ready: "No" },
  ];
  const filtered = horses.filter((h) =>
    !q || `${h.name} ${h.owner} ${h.breed}`.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <label className="admin-field">
        <span>Search horse</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, owner, breed..." />
      </label>
      <div className="admin-data-table__wrap">
        <table className="admin-data-table">
          <thead><tr><th>ID</th><th>Name</th><th>Owner</th><th>Breed</th><th>Ready</th></tr></thead>
          <tbody>
            {filtered.map((h) => (
              <tr key={h.id}>
                <td>{h.id}</td><td>{h.name}</td><td>{h.owner}</td><td>{h.breed}</td>
                <td><StatusBadge value={h.ready} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DragDropOrderPanel({ onAction }) {
  const [races, setRaces] = useState([
    { id: "R-01", name: "Heat 1", date: "2026-06-03" },
    { id: "R-02", name: "Heat 2", date: "2026-06-03" },
    { id: "R-03", name: "Semi-final", date: "2026-06-04" },
    { id: "R-04", name: "Final", date: "2026-06-05" },
  ]);
  const moveUp = (i) => {
    if (i === 0) return;
    setRaces((prev) => { const a = [...prev]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; });
    onAction("Race order updated");
  };
  const moveDown = (i) => {
    if (i === races.length - 1) return;
    setRaces((prev) => { const a = [...prev]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a; });
    onAction("Race order updated");
  };
  return (
    <div className="admin-drag-list">
      {races.map((race, i) => (
        <div key={race.id} className="admin-drag-row">
          <span className="admin-drag-index">{i + 1}</span>
          <div className="admin-drag-info">
            <span style={{ fontWeight: 700 }}>{race.id}</span>
            <span>{race.name} · {race.date}</span>
          </div>
          <div className="admin-drag-controls">
            <button type="button" onClick={() => moveUp(i)} disabled={i === 0} className="admin-drag-btn">↑</button>
            <button type="button" onClick={() => moveDown(i)} disabled={i === races.length - 1} className="admin-drag-btn">↓</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function RoundBuilderPanel({ onAction }) {
  const [rounds, setRounds] = useState([
    { name: "Heat 1", races: 4 },
    { name: "Heat 2", races: 4 },
    { name: "Semi-final", races: 2 },
    { name: "Final", races: 1 },
  ]);
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rounds.map((r, i) => (
        <div key={i} className="admin-approval-row">
          <div className="admin-approval-info">
            <span className="admin-approval-name">{r.name}</span>
            <span className="admin-approval-meta">{r.races} race{r.races > 1 ? "s" : ""}</span>
          </div>
          <button className="admin-header__button admin-header__button--ghost" style={{ minHeight: 32, padding: "0 10px", fontSize: "0.82rem" }}
            type="button" onClick={() => onAction(`Editing round: ${r.name}`)}>
            Edit
          </button>
        </div>
      ))}
      <button className="admin-header__button" style={{ width: "fit-content" }}
        type="button" onClick={() => { setRounds((p) => [...p, { name: `Round ${p.length + 1}`, races: 2 }]); onAction("New round added"); }}>
        + Add round
      </button>
    </div>
  );
}

function PublishChecklistPanel({ onAction }) {
  const checks = [
    { label: "All rounds configured", done: true },
    { label: "Referees assigned", done: true },
    { label: "Horse registrations verified", done: false },
    { label: "Schedule published", done: false },
  ];
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {checks.map((c) => (
        <div key={c.label} className="admin-approval-row" style={{ alignItems: "center" }}>
          <span style={{ fontSize: "1.1rem" }}>{c.done ? "✅" : "⬜"}</span>
          <span style={{ color: c.done ? "rgba(245,247,243,0.9)" : "rgba(245,247,243,0.55)", flex: 1 }}>{c.label}</span>
        </div>
      ))}
      <button className="admin-header__button" style={{ width: "fit-content", marginTop: 4 }}
        type="button" onClick={() => onAction("Tournament published successfully")}>
        Publish tournament
      </button>
    </div>
  );
}

function InspectionNotesPanel({ onAction }) {
  const [note, setNote] = useState("");
  const horses = [
    { id: "H-003", name: "Golden Mane" },
    { id: "H-005", name: "Silver Wind" },
  ];
  const [target, setTarget] = useState(horses[0].id);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <label className="admin-field">
        <span>Horse under review</span>
        <select value={target} onChange={(e) => setTarget(e.target.value)}>
          {horses.map((h) => <option key={h.id} value={h.id}>{h.id} — {h.name}</option>)}
        </select>
      </label>
      <label className="admin-field">
        <span>Inspection notes</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add inspection notes for this horse..." />
      </label>
      <button className="admin-header__button" style={{ width: "fit-content" }}
        type="button" onClick={() => { onAction(`Inspection note saved for ${target}`); setNote(""); }}>
        Save notes
      </button>
    </div>
  );
}

function AvailabilityPanel({ onAction }) {
  const jockeys = [
    { id: "J-11", name: "Anh Khoa", free: ["June 3", "June 5"] },
    { id: "J-12", name: "Le Nam", free: ["June 3", "June 4"] },
    { id: "J-13", name: "Phuong Vy", free: ["June 4", "June 5"] },
    { id: "J-14", name: "Duc Huy", free: ["June 3"] },
  ];
  return (
    <div className="admin-approval-list">
      {jockeys.map((j) => (
        <div key={j.id} className="admin-approval-row">
          <div className="admin-approval-info">
            <span className="admin-approval-id">{j.id}</span>
            <span className="admin-approval-name">{j.name}</span>
            <span className="admin-approval-meta">Available: {j.free.join(", ")}</span>
          </div>
          <button className="admin-header__button" style={{ minHeight: 32, padding: "0 10px", fontSize: "0.82rem" }}
            type="button" onClick={() => onAction(`Assigned ${j.name} to race`)}>
            Assign
          </button>
        </div>
      ))}
    </div>
  );
}

function InvitationPanel({ onAction }) {
  const invites = [
    { id: "INV-01", name: "Phuong Vy", horse: "Night Sprint", status: "Pending" },
    { id: "INV-02", name: "Duc Huy", horse: "Silver Wind", status: "Pending" },
  ];
  return (
    <div className="admin-approval-list">
      {invites.map((inv) => (
        <div key={inv.id} className="admin-approval-row">
          <div className="admin-approval-info">
            <span className="admin-approval-id">{inv.id}</span>
            <span className="admin-approval-name">{inv.name}</span>
            <span className="admin-approval-meta">Horse: {inv.horse} · {inv.status}</span>
          </div>
          <div className="admin-approval-actions">
            <button className="admin-header__button" style={{ minHeight: 32, padding: "0 10px", fontSize: "0.82rem" }}
              type="button" onClick={() => onAction(`Resent invitation to ${inv.name}`)}>
              Resend
            </button>
            <button className="admin-header__button admin-header__button--red" style={{ minHeight: 32, padding: "0 10px", fontSize: "0.82rem" }}
              type="button" onClick={() => onAction(`Revoked invite for ${inv.name}`)}>
              Revoke
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PredictionReviewPanel({ onAction }) {
  const bets = [
    { id: "BET-303", name: "Quoc Bao", race: "R-05", pick: "Night Sprint", odds: "2.8" },
    { id: "BET-305", name: "Thi Hoa", race: "R-06", pick: "Blue Horizon", odds: "3.5" },
  ];
  return (
    <div className="admin-approval-list">
      {bets.map((b) => (
        <div key={b.id} className="admin-approval-row">
          <div className="admin-approval-info">
            <span className="admin-approval-id">{b.id}</span>
            <span className="admin-approval-name">{b.name}</span>
            <span className="admin-approval-meta">{b.race} — {b.pick} @ {b.odds}×</span>
          </div>
          <div className="admin-approval-actions">
            <button className="admin-header__button" style={{ minHeight: 32, padding: "0 10px", fontSize: "0.82rem" }}
              type="button" onClick={() => onAction(`Prize awarded to ${b.name}`)}>
              Award
            </button>
            <button className="admin-header__button admin-header__button--ghost" style={{ minHeight: 32, padding: "0 10px", fontSize: "0.82rem" }}
              type="button" onClick={() => onAction(`Disqualified bet ${b.id}`)}>
              Disqualify
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* Tool panel renderer map */
function ToolPanelContent({ toolTitle, moduleName, onAction }) {
  const key = toolTitle.toLowerCase();
  if (key.includes("permission matrix") || key.includes("role filter")) return <PermissionMatrixPanel />;
  if (key.includes("calendar"))           return <CalendarPanel />;
  if (key.includes("approval inbox"))     return <ApprovalInboxPanel onAction={onAction} />;
  if (key.includes("prize summary"))      return <PrizeSummaryPanel />;
  if (key.includes("prediction review"))  return <PredictionReviewPanel onAction={onAction} />;
  if (key.includes("assignment planner")) return <AssignmentPlannerPanel onAction={onAction} />;
  if (key.includes("violation tracker"))  return <ViolationTrackerPanel />;
  if (key.includes("result approval"))    return <ResultApprovalPanel onAction={onAction} />;
  if (key.includes("publish controls"))   return <ResultApprovalPanel onAction={onAction} />;
  if (key.includes("horse search"))       return <HorseSearchPanel />;
  if (key.includes("inspection notes"))   return <InspectionNotesPanel onAction={onAction} />;
  if (key.includes("drag") || key.includes("drop")) return <DragDropOrderPanel onAction={onAction} />;
  if (key.includes("round builder"))      return <RoundBuilderPanel onAction={onAction} />;
  if (key.includes("publish checklist"))  return <PublishChecklistPanel onAction={onAction} />;
  if (key.includes("availability"))       return <AvailabilityPanel onAction={onAction} />;
  if (key.includes("invitation"))         return <InvitationPanel onAction={onAction} />;
  if (key.includes("bulk review"))        return <ApprovalInboxPanel onAction={onAction} />;
  return <p style={{ color: "rgba(245,247,243,0.72)", margin: 0 }}>Panel loaded. No additional config needed.</p>;
}

/* ─────────────────────────────────────────────────────── */

function AdminModulePage() {
  const { module: moduleName } = useParams();
  const moduleData = adminModules[moduleName];
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRow, setSelectedRow] = useState(null);   // { columns, row }
  const [activeModal, setActiveModal] = useState(null);   // "create" | "action:<actionName>" | "tool:<toolTitle>" | "edit"
  const [draftNote, setDraftNote] = useState("");
  const [formState, setFormState] = useState(defaultFormState);
  const [messages, setMessages] = useState([]);
  const [expandedTool, setExpandedTool] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailError, setDetailError] = useState("");
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [roleSelection, setRoleSelection] = useState("spectator");
  const [roleAction, setRoleAction] = useState("");
  const adminApiState = useAdminModuleApi(moduleName);

  // -- CRUD State
  const [localTables, setLocalTables] = useState([]);
  const [editRowData, setEditRowData] = useState(null);

  useEffect(() => {
    if (adminApiState.liveData?.tables) {
      setLocalTables(JSON.parse(JSON.stringify(adminApiState.liveData.tables)));
    } else if (moduleData?.tables) {
      setLocalTables(JSON.parse(JSON.stringify(moduleData.tables)));
    } else {
      setLocalTables([]);
    }
  }, [moduleName, moduleData, adminApiState.liveData]);

  const filterConfig = moduleData?.filters || {};
  const searchPlaceholder = filterConfig.searchPlaceholder || "Search records...";
  const statusOptions = filterConfig.statusOptions || ["All", "Active", "Pending", "Review"];
  const controls = moduleControls[moduleName];
  const columns = localTables[0]?.columns || tableColumnKeys[moduleName] || [];
  const summaryCards = adminApiState.liveData?.summary || moduleData?.summary || [];

  /* Auto-dismiss messages after 4 s */
  useEffect(() => {
    if (!messages.length) return;
    const timer = setTimeout(() => setMessages((prev) => prev.slice(0, -1)), 4000);
    return () => clearTimeout(timer);
  }, [messages]);

  const addMessage = (msg) => setMessages((prev) => [msg, ...prev].slice(0, 4));

  const filteredTables = useMemo(() => {
    return localTables.map((table) => ({
      ...table,
      rows: table.rows.filter((row) => {
        const rowText = row.join(" ").toLowerCase();
        const matchesQuery = !query || rowText.includes(query.trim().toLowerCase());
        const matchesStatus = statusFilter === "All" || rowText.includes(statusFilter.toLowerCase());
        return matchesQuery && matchesStatus;
      }),
    }));
  }, [localTables, query, statusFilter]);

  if (!moduleData) {
    return (
      <AdminLayout title="Module not found" eyebrow="Admin module" description="The requested admin module does not exist." actions={(
        <Link className="admin-header__button" to="/admin">Back to dashboard</Link>
      )}>
        <article className="admin-panel">
          <p className="admin-panel__eyebrow">Invalid route</p>
          <h2>No admin module available for this path.</h2>
        </article>
      </AdminLayout>
    );
  }

  if (adminApiState.isLoading) {
    return (
      <AdminLayout title={moduleData.title} eyebrow={moduleData.eyebrow} description={moduleData.description}>
        <LoadingSkeleton ariaLabel={`Loading ${moduleData.title}`} rows={6} variant="table" />
      </AdminLayout>
    );
  }

  const activeForm = formState[moduleName] || {};

  const handleFieldChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [moduleName]: { ...prev[moduleName], [field]: value } }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (activeModal === "edit" && editRowData) {
      setLocalTables((prev) => prev.map((t) => ({
        ...t,
        rows: t.rows.map((r) => r[0] === editRowData[0] ? editRowData : r)
      })));
      setSelectedRow({ columns, row: editRowData });
      addMessage(`✓ Record ${editRowData[0]} updated successfully.`);
      setActiveModal(null);
      return;
    }

    const label = controls?.title || "Action";
    const newId = `${moduleName.substring(0,2).toUpperCase()}-${Math.floor(Math.random() * 1000) + 100}`;
    const newRow = columns.map((col, i) => {
      if (i === 0) return newId;
      const lowerCol = col.toLowerCase();
      const keys = Object.keys(activeForm);
      const match = keys.find(k => lowerCol.includes(k.toLowerCase()) || (fieldLabels[k] && lowerCol.includes(fieldLabels[k].toLowerCase())));
      return match ? activeForm[match] : (activeForm[keys[i-1]] || "-");
    });

    setLocalTables((prev) => prev.map((t, idx) => {
      if (idx === 0) return { ...t, rows: [newRow, ...t.rows] };
      return t;
    }));

    addMessage(`✓ ${label} saved successfully. ID: ${newId}`);
    setFormState((prev) => ({ ...prev, [moduleName]: defaultFormState[moduleName] }));
    setActiveModal(null);
  };

  const handleRowAction = async (actionLabel) => {
    const id = selectedRow?.row?.[0] || "item";

    try {
      const handledByApi = await adminApiState.applyRowAction({
        actionLabel,
        id,
        note: draftNote,
      });

      addMessage(`✓ ${actionLabel} applied to ${id}.`);

      if (handledByApi) {
        closeAll();
        return;
      }

      setSelectedRow(null);
    } catch (apiError) {
      addMessage(`Unable to apply ${actionLabel}: ${apiError.message || "API request failed."}`);
    }
  };

  const openRowDetail = async (tableColumns, row) => {
    setSelectedRow({ columns: tableColumns, row });
    setSelectedDetail(null);
    setDetailError("");

    if (!adminApiState.supportsLiveData) return;

    setIsDetailLoading(true);
    try {
      setSelectedDetail(await adminApiState.getRowDetail(row[0]));
    } catch (apiError) {
      setDetailError(apiError.message || "Unable to load record detail.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleRoleMutation = async (mode, roleName) => {
    if (!selectedDetail?.id) return;
    setRoleAction(`${mode}:${roleName}`);
    setDetailError("");

    try {
      const nextDetail = mode === "assign"
        ? await adminApiState.assignRole(selectedDetail.id, roleName)
        : await adminApiState.removeRole(selectedDetail.id, roleName);
      setSelectedDetail(nextDetail);
      addMessage(`${mode === "assign" ? "Role assigned" : "Role removed"}: ${roleName}.`);
    } catch (apiError) {
      setDetailError(apiError.message || `Unable to ${mode} role.`);
    } finally {
      setRoleAction("");
    }
  };

  const handleDelete = () => {
    const id = selectedRow.row[0];
    if (window.confirm(`Are you sure you want to delete record ${id}?`)) {
      setLocalTables((prev) => prev.map((t) => ({
        ...t,
        rows: t.rows.filter((r) => r[0] !== id)
      })));
      closeAll();
      addMessage(`✓ Record ${id} deleted.`);
    }
  };

  const closeAll = () => { setSelectedRow(null); setSelectedDetail(null); setDetailError(""); setActiveModal(null); setDraftNote(""); setEditRowData(null); };

  const actions = moduleData.primaryActions;

  return (
    <AdminLayout
      title={moduleData.title}
      eyebrow={moduleData.eyebrow}
      description={moduleData.description}
      actions={(
        <>
          {actions.map((action, i) => (
            <button key={action} className={`admin-header__button${i > 0 ? " admin-header__button--ghost" : ""}`}
              type="button"
              onClick={() => setActiveModal(`action:${action}`)}>
              {action}
            </button>
          ))}
        </>
      )}
    >
      {/* Summary metrics */}
      <section className="admin-metrics admin-metrics--module" aria-label="Module summary">
        {summaryCards.map((card) => (
          <article key={card.label} className="admin-metric-card">
            <p className="admin-metric-card__label">{card.label}</p>
            <div className="admin-metric-card__value">{card.value}</div>
          </article>
        ))}
      </section>

      {/* Search / filter toolbar */}
      <section className="admin-panel admin-actions-panel">
        <div className="admin-panel__header">
          <p className="admin-panel__eyebrow">Live controls</p>
          <h2>{moduleData.title} workspace</h2>
        </div>
        <div className="admin-toolbar">
          <label className="admin-field">
            <span>Search</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchPlaceholder} />
          </label>
          <label className="admin-field">
            <span>Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {statusOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </label>
          <button className="admin-header__button admin-header__button--ghost" type="button"
            onClick={() => { setQuery(""); setStatusFilter("All"); }}>
            Reset
          </button>
        </div>
      </section>

      {/* Activity toast messages */}
      {!!messages.length && (
        <section className="admin-toast-stack" aria-live="polite">
          {messages.map((msg, i) => (
            <div key={i} className="admin-toast">{msg}</div>
          ))}
        </section>
      )}

      {adminApiState.error && (
        <section className={`admin-live-state ${adminApiState.error ? "admin-live-state--warning" : ""}`} aria-live="polite">
          {adminApiState.error}
        </section>
      )}

      {/* Module info sections */}
      <section className="admin-grid admin-grid--module">
        {moduleData.sections.map((section) => (
          <article key={section.title} className="admin-panel">
            <div className="admin-panel__header">
              <p className="admin-panel__eyebrow">{moduleData.eyebrow}</p>
              <h2>{section.title}</h2>
            </div>
            <ul className="admin-list">{section.items.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        ))}
      </section>

      {/* Tool cards — with expandable panels */}
      {!!moduleData.tools?.length && (
        <section className="admin-tools-grid">
          {moduleData.tools.map((tool) => {
            const isExpanded = expandedTool === tool.title;
            return (
              <article key={tool.title} className="admin-panel admin-tool-card">
                <div className="admin-panel__header">
                  <p className="admin-panel__eyebrow">Added UI</p>
                  <h2>{tool.title}</h2>
                </div>
                <p>{tool.content}</p>
                {isExpanded && (
                  <div className="admin-tool-expanded">
                    <ToolPanelContent toolTitle={tool.title} moduleName={moduleName} onAction={addMessage} />
                  </div>
                )}
                <div className="admin-tool-card__footer">
                  <button className="admin-header__button" type="button"
                    onClick={() => setExpandedTool(isExpanded ? null : tool.title)}>
                    {isExpanded ? "Collapse" : "Open"}
                  </button>
                  <button className="admin-header__button admin-header__button--ghost" type="button"
                    onClick={() => setActiveModal(`tool:${tool.title}`)}>
                    Full view
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Data tables */}
      <section className="admin-table-panel">
        {filteredTables.map((table) => (
          <article key={table.title} className="admin-panel">
            <div className="admin-panel__header">
              <p className="admin-panel__eyebrow">{moduleData.eyebrow}</p>
              <h2>{table.title}</h2>
            </div>
            <div className="admin-data-table__wrap" role="region" aria-label={table.title} tabIndex={0}>
              <table className="admin-data-table">
                <thead>
                  <tr>{columns.map((col) => <th key={col}>{col}</th>)}</tr>
                </thead>
                <tbody>
                  {table.rows.length ? table.rows.map((row) => (
                    <tr key={row[0]} onClick={() => openRowDetail(columns, row)}
                      style={{ cursor: "pointer" }}>
                      {row.map((cell, idx) => {
                        const colName = (columns[idx] || "").toLowerCase();
                        const isStatus = colName === "status" || colName === "ready" || colName === "report status"
                          || colName === "outcome" || colName === "referee report" || colName === "published";
                        return (
                          <td key={`${row[0]}-${idx}`}>
                            {isStatus ? <StatusBadge value={cell} /> : cell}
                          </td>
                        );
                      })}
                    </tr>
                  )) : (
                    <tr><td colSpan={columns.length} style={{ textAlign: "center", color: "rgba(245,247,243,0.48)" }}>No rows match the current filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </section>

      {/* ── Modals ────────────────────────────────────────── */}
      {(selectedRow || activeModal) && (
        <div className="admin-modal" role="dialog" aria-modal="true" aria-label="Admin popup"
          onClick={(e) => { if (e.target === e.currentTarget) closeAll(); }}>
          <div className="admin-modal__card">

            {/* ── Row detail modal ─────────────── */}
            {selectedRow && !activeModal && (
              <>
                <div className="admin-panel__header" style={{ marginBottom: 6 }}>
                  <p className="admin-panel__eyebrow">Record detail</p>
                  <h2>{moduleData.title} — {selectedRow.row[0]}</h2>
                </div>
                <div className="admin-detail-grid">
                  {selectedRow.columns.map((col, i) => {
                    const cell = selectedRow.row[i];
                    const isStatus = ["status", "ready", "report status", "outcome", "referee report", "published"]
                      .includes(col.toLowerCase());
                    return (
                      <div key={col} className="admin-detail-item">
                        <span className="admin-detail-label">{col}</span>
                        <span className="admin-detail-value">
                          {isStatus ? <StatusBadge value={cell} /> : cell}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {isDetailLoading && <LoadingSkeleton ariaLabel="Loading record detail" variant="inline" />}
                {detailError && <div className="admin-live-state admin-live-state--warning">{detailError}</div>}

                {selectedDetail && (
                  <section className="admin-api-detail">
                    <div className="admin-panel__header">
                      <p className="admin-panel__eyebrow">Backend detail</p>
                      <h3>{selectedDetail.title}</h3>
                    </div>
                    <div className="admin-detail-grid">
                      {selectedDetail.fields.map(([label, value]) => (
                        <div className="admin-detail-item" key={label}>
                          <span className="admin-detail-label">{label}</span>
                          <span className="admin-detail-value">{value}</span>
                        </div>
                      ))}
                    </div>

                    {selectedDetail.type === "user" && (
                      <div className="admin-role-manager">
                        <div className="admin-role-manager__header">
                          <div><span className="admin-detail-label">Assigned roles</span><strong>{selectedDetail.roles.length} active</strong></div>
                          <div className="admin-role-manager__assign">
                            <select value={roleSelection} onChange={(event) => setRoleSelection(event.target.value)}>
                              {Object.keys({ admin: 1, horse_owner: 1, jockey: 1, race_referee: 1, spectator: 1 }).map((role) => <option key={role} value={role}>{role.replaceAll("_", " ")}</option>)}
                            </select>
                            <button className="admin-header__button" disabled={Boolean(roleAction)} type="button" onClick={() => handleRoleMutation("assign", roleSelection)}>
                              {roleAction.startsWith("assign:") ? "Assigning..." : "Assign role"}
                            </button>
                          </div>
                        </div>
                        <div className="admin-role-manager__list">
                          {selectedDetail.roles.map((role) => (
                            <div className="admin-role-manager__item" key={role}>
                              <span>{role.replaceAll("_", " ")}</span>
                              <button className="admin-header__button admin-header__button--red" disabled={Boolean(roleAction) || selectedDetail.roles.length === 1} type="button" onClick={() => handleRoleMutation("remove", role)}>
                                {roleAction === `remove:${role}` ? "Removing..." : "Remove"}
                              </button>
                            </div>
                          ))}
                        </div>
                        {!!selectedDetail.profiles.length && (
                          <div className="admin-profile-summary">
                            {selectedDetail.profiles.map((profile) => (
                              <div key={profile.role}><span>{profile.label}</span><strong>{profile.status}</strong><small>Profile {profile.id}</small></div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {selectedDetail.type === "application" && !!selectedDetail.applicationData.length && (
                      <div className="admin-application-data">
                        <span className="admin-detail-label">Application data</span>
                        <div className="admin-detail-grid">
                          {selectedDetail.applicationData.map(([key, value]) => (
                            <div className="admin-detail-item" key={key}><span className="admin-detail-label">{key.replaceAll("_", " ")}</span><span className="admin-detail-value">{String(value ?? "-")}</span></div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDetail.type === "application" && !!selectedDetail.documents.length && (
                      <div className="admin-application-documents">
                        <span className="admin-detail-label">Submitted documents</span>
                        <div className="admin-application-documents__list">
                          {selectedDetail.documents.map((document, index) => (
                            <a href={document.url} key={`${document.type || "document"}-${index}`} rel="noreferrer" target="_blank">
                              <span>{String(document.type || `Document ${index + 1}`).replaceAll("_", " ")}</span>
                              <small>{document.note || "Open uploaded document"}</small>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                <label className="admin-field" style={{ marginTop: 14 }}>
                  <span>Internal note</span>
                  <textarea value={draftNote} onChange={(e) => setDraftNote(e.target.value)}
                    placeholder="Add an internal note for this record..." />
                </label>

                {rowActions[moduleName] && (
                  <div className="admin-tool-card__footer" style={{ marginTop: 14 }}>
                    {rowActions[moduleName].map((action, i) => (
                      <button key={action}
                        className={`admin-header__button${i > 0 ? " admin-header__button--ghost" : ""}`}
                        type="button" onClick={() => handleRowAction(action)}>
                        {action}
                      </button>
                    ))}
                  </div>
                )}

                <div className="admin-tool-card__footer" style={{ marginTop: 10 }}>
                  {draftNote && (
                    <button className="admin-header__button admin-header__button--ghost" type="button"
                      onClick={() => { addMessage(`✓ Note saved for ${selectedRow.row[0]}.`); setDraftNote(""); }}>
                      Save note
                    </button>
                  )}
                  <button className="admin-header__button admin-header__button--ghost" type="button" 
                    onClick={() => { setEditRowData([...selectedRow.row]); setActiveModal("edit"); }}>
                    Edit record
                  </button>
                  <button className="admin-header__button admin-header__button--red" type="button" onClick={handleDelete}>
                    Delete
                  </button>
                  <button className="admin-header__button admin-header__button--ghost" type="button" onClick={closeAll}>
                    Close
                  </button>
                </div>
              </>
            )}

            {/* ── Edit form modal ───── */}
            {activeModal === "edit" && editRowData && (
              <>
                <div className="admin-panel__header" style={{ marginBottom: 6 }}>
                  <p className="admin-panel__eyebrow">Edit Record</p>
                  <h2>{moduleData.title} — {editRowData[0]}</h2>
                </div>
                <form className="admin-form-grid" onSubmit={handleSubmit}>
                  {columns.map((col, i) => i > 0 && (
                    <label key={col} className="admin-field">
                      <span>{col}</span>
                      <input value={editRowData[i]} onChange={(e) => {
                        const newRow = [...editRowData];
                        newRow[i] = e.target.value;
                        setEditRowData(newRow);
                      }} />
                    </label>
                  ))}
                  <div className="admin-tool-card__footer" style={{ marginTop: 4 }}>
                    <button className="admin-header__button" type="submit">Save changes</button>
                    <button className="admin-header__button admin-header__button--ghost" type="button" onClick={() => setActiveModal(null)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ── Create / action form modal ───── */}
            {activeModal?.startsWith("action:") && controls && (
              <>
                <div className="admin-panel__header" style={{ marginBottom: 6 }}>
                  <p className="admin-panel__eyebrow">{moduleData.eyebrow}</p>
                  <h2>{activeModal.replace("action:", "")}</h2>
                </div>
                <form className="admin-form-grid" onSubmit={handleSubmit}>
                  {controls.fields.map((field) => (
                    <label key={field} className="admin-field">
                      <span>{fieldLabels[field] || field}</span>
                      {controls.options[field] ? (
                        <select value={activeForm[field] || ""} onChange={(e) => handleFieldChange(field, e.target.value)}>
                          {controls.options[field].map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <input value={activeForm[field] || ""} onChange={(e) => handleFieldChange(field, e.target.value)}
                          placeholder={`Enter ${fieldLabels[field] || field}`}
                          type={field === "date" ? "date" : "text"} />
                      )}
                    </label>
                  ))}
                  <div className="admin-tool-card__footer" style={{ marginTop: 4 }}>
                    <button className="admin-header__button" type="submit">Save</button>
                    <button className="admin-header__button admin-header__button--ghost" type="button"
                      onClick={() => setFormState((prev) => ({ ...prev, [moduleName]: defaultFormState[moduleName] }))}>
                      Clear
                    </button>
                    <button className="admin-header__button admin-header__button--ghost" type="button" onClick={closeAll}>
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ── Tool full-view modal ─────────── */}
            {activeModal?.startsWith("tool:") && (
              <>
                <div className="admin-panel__header" style={{ marginBottom: 6 }}>
                  <p className="admin-panel__eyebrow">Tool panel</p>
                  <h2>{activeModal.replace("tool:", "")}</h2>
                </div>
                <div className="admin-modal__body">
                  <ToolPanelContent toolTitle={activeModal.replace("tool:", "")} moduleName={moduleName} onAction={addMessage} />
                </div>
                <div className="admin-tool-card__footer" style={{ marginTop: 14 }}>
                  <button className="admin-header__button admin-header__button--ghost" type="button" onClick={closeAll}>
                    Close
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminModulePage;
