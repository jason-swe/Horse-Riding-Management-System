import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminModules } from "./adminModules";

/* ── Human-readable field labels ───────────────────────── */
const fieldLabels = {
  name: "Full name",
  role: "Role",
  status: "Status",
  horseName: "Horse name",
  microchip: "Microchip ID",
  age: "Age",
  gender: "Gender",
  breed: "Breed",
  owner: "Owner",
  trainer: "Trainer",
  sire: "Sire (Father)",
  dam: "Dam (Mother)",
  distancePref: "Distance preference",
  surfacePref: "Surface preference",
  studFarm: "Stud farm",
  weight: "Weight (kg)",
  height: "Height (hands)",
  lastShoed: "Last shoed",
  shoeType: "Shoe type",
  healthStatus: "Health status",
  maxSpeed: "Max speed (km/h)",
  split200: "200m split (s)",
  heartRate: "Heart rate peak (bpm)",
  recoveryTime: "Recovery time (s)",
  strideLength: "Stride length (m)",
  strideFreq: "Stride freq. (spm)",
  starts: "Starts",
  firstPlace: "1st place finishes",
  handicapRating: "Handicap rating",
  careerPts: "Career points",
  ready: "Race-ready",
  raceName: "Race name",
  date: "Race date",
  round: "Round",
  referee: "Referee",
  race: "Race ID",
  winner: "Winner",
  time: "Finish time",
  prize: "Points awarded",
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
  users:         ["ID", "Name", "Role", "Status", "Last login"],
  horses:        ["Horse ID", "Microchip", "Name", "Age", "Gender", "Breed", "Owner", "Trainer", "Status"],
  schedule:      ["Race", "Tournament", "Date", "Round", "Referee", "Status"],
  results:       ["Race", "Winner", "Time", "Points awarded", "Referee report"],
  registrations: ["Reg ID", "Participant", "Role", "Target", "Submitted", "Status"],
  jockeys:       ["Jockey ID", "Name", "Assigned horse", "Races", "Wins", "Status"],
  referees:      ["Referee ID", "Name", "Assigned race", "Violations", "Report status"],
  predictions:   ["Bet ID", "Spectator", "Race", "Pick", "Odds", "Outcome", "Points earned"],
  tournament:    ["Tournament ID", "Season", "Venue", "Rounds", "Published", "Status"],
};

/* ── Modal config: which action opens what ─────────────── */
const moduleControls = {
  users:         { title: "Create user",       fields: ["name", "role", "status"],                            options: { role: ["Admin", "Horse Owner", "Jockey", "Race Referee", "Spectator"], status: ["Active", "Pending", "Suspended"] } },
  horses:        { title: "Add horse",         fields: ["horseName", "microchip", "age", "gender", "breed", "owner", "trainer", "status"], options: { gender: ["Colt", "Filly", "Gelding", "Horse", "Mare"], breed: ["Thoroughbred", "Warmblood", "Arabian", "Other"], status: ["Ready", "Review", "Injured", "Retired"] } },
  schedule:      { title: "Create race",       fields: ["raceName", "date", "round", "referee"],              options: { round: ["Heat 1", "Heat 2", "Semi-final", "Final"] } },
  results:       { title: "Publish result",    fields: ["race", "winner", "time", "prize"],                   options: {} }, // prize = points
  registrations: { title: "Review request",   fields: ["participant", "role", "target", "status"],           options: { role: ["Horse Owner", "Jockey", "Race Referee", "Spectator"], status: ["Approved", "Pending", "Review"] } },
  jockeys:       { title: "Invite jockey",     fields: ["name", "horse", "status", "races"],                  options: { status: ["Invited", "Active", "Pending"] } },
  referees:      { title: "Assign referee",    fields: ["name", "assignedRace", "reportStatus", "violations"],options: { reportStatus: ["Draft", "Filed", "Confirmed"] } },
  predictions:   { title: "Review bet",        fields: ["spectator", "race", "pick", "odds"],                 options: {} },
  tournament:    { title: "Create tournament", fields: ["tournament", "venue", "rounds", "status"],           options: { status: ["Draft", "Planning", "Active"] } },
};

const defaultFormState = {
  users:         { name: "", role: "Horse Owner", status: "Active" },
  horses:        { horseName: "", microchip: "", age: "", gender: "Colt", breed: "Thoroughbred", owner: "", trainer: "", status: "Review" },
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
  ready:     "green",
  confirmed: "green",
  approved:  "green",
  published: "green",
  win:       "green",
  filed:     "blue",
  invited:   "blue",
  planning:  "blue",
  draft:     "gray",
  retired:   "gray",
  pending:   "amber",
  review:    "amber",
  no:        "red",
  suspended: "red",
  lose:      "red",
  injured:   "red",
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
  horses:        ["Set ready", "Flag for inspection", "Mark injured", "Update handicap", "View pedigree"],
  users:         ["Activate", "Suspend", "Reset password"],
  jockeys:       ["Confirm assignment", "Revoke invite"],
  predictions:   ["Award prize", "Disqualify"],
  schedule:      ["Publish slot", "Move to draft"],
  tournament:    ["Publish", "Archive"],
};



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

  // -- CRUD State
  const [localTables, setLocalTables] = useState([]);
  const [editRowData, setEditRowData] = useState(null);

  useEffect(() => {
    if (moduleData?.tables) {
      setLocalTables(JSON.parse(JSON.stringify(moduleData.tables)));
    } else {
      setLocalTables([]);
    }
  }, [moduleName, moduleData]);

  const filterConfig = moduleData?.filters || {};
  const searchPlaceholder = filterConfig.searchPlaceholder || "Search records...";
  const statusOptions = filterConfig.statusOptions || ["All", "Active", "Pending", "Review"];
  const controls = moduleControls[moduleName];
  const columns = tableColumnKeys[moduleName] || [];

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

  const handleRowAction = (actionLabel) => {
    const id = selectedRow?.row?.[0] || "item";
    addMessage(`✓ ${actionLabel} applied to ${id}.`);
    setSelectedRow(null);
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

  const closeAll = () => { setSelectedRow(null); setActiveModal(null); setDraftNote(""); setEditRowData(null); };

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
        {moduleData.summary.map((card) => (
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

      {/* Data tables — each table uses its own column definitions when available */}
      <section className="admin-table-panel">
        {filteredTables.map((table) => {
          const tCols = table.columns || columns;
          return (
            <article key={table.title} className="admin-panel">
              <div className="admin-panel__header">
                <p className="admin-panel__eyebrow">{moduleData.eyebrow}</p>
                <h2>{table.title}</h2>
              </div>
              <div className="admin-data-table__wrap" role="region" aria-label={table.title} tabIndex={0}>
                <table className="admin-data-table">
                  <thead>
                    <tr>{tCols.map((col) => <th key={col}>{col}</th>)}</tr>
                  </thead>
                  <tbody>
                    {table.rows.length ? table.rows.map((row) => (
                      <tr key={row[0]} onClick={() => setSelectedRow({ columns: tCols, row })}
                        style={{ cursor: "pointer" }}>
                        {row.map((cell, idx) => {
                          const colName = (tCols[idx] || "").toLowerCase();
                          const isStatus = colName === "status" || colName === "ready" || colName === "health status"
                            || colName === "report status" || colName === "outcome"
                            || colName === "referee report" || colName === "published";
                          return (
                            <td key={`${row[0]}-${idx}`}>
                              {isStatus ? <StatusBadge value={cell} /> : cell}
                            </td>
                          );
                        })}
                      </tr>
                    )) : (
                      <tr><td colSpan={tCols.length} style={{ textAlign: "center", color: "rgba(245,247,243,0.48)" }}>No rows match the current filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          );
        })}
      </section>

      {/* ── Modals (rendered via Portal to escape backdrop-filter stacking context) ── */}
      {(selectedRow || activeModal) && createPortal(
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
        </div>,
        document.body
      )}
    </AdminLayout>
  );
}

export default AdminModulePage;
