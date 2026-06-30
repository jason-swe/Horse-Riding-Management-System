import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Flag,
  Radio,
  ShieldCheck,
  Trophy,
  UsersRound,
} from "lucide-react";
import AdminLayout from "./AdminLayout";

const controlLanes = [
  {
    number: "01",
    label: "Entry control",
    title: "Review registrations",
    description: "Approve eligible horse entries before jockey assignment and race seeding.",
    to: "/admin/registrations",
    action: "Open approval queue",
    icon: ClipboardCheck,
    tone: "signal",
  },
  {
    number: "02",
    label: "Programme",
    title: "Build the race card",
    description: "Create tournament rounds, schedule races, and keep each event relationship valid.",
    to: "/admin/tournament",
    action: "Manage competition",
    icon: CalendarRange,
    tone: "neutral",
  },
  {
    number: "03",
    label: "Official record",
    title: "Publish race results",
    description: "Review referee drafts, request corrections when needed, then publish the official finishing order.",
    to: "/admin/results",
    action: "Review result board",
    icon: Trophy,
    tone: "neutral",
  },
];

const modules = [
  { label: "Users & roles", note: "Accounts, access and role review", to: "/admin/users", icon: UsersRound },
  { label: "Tournaments", note: "Competition and round structure", to: "/admin/tournament", icon: Flag },
  { label: "Race schedule", note: "Race dates, tracks and status", to: "/admin/schedule", icon: CalendarRange },
  { label: "Registrations", note: "Horse entry approval queue", to: "/admin/registrations", icon: ClipboardCheck },
  { label: "Official results", note: "Review and publish outcomes", to: "/admin/results", icon: Trophy },
  { label: "Referee desk", note: "Assignments and report status", to: "/admin/referees", icon: ShieldCheck },
];

const workflow = [
  { label: "Registration", note: "Validate race entries" },
  { label: "Race card", note: "Lock rounds and schedule" },
  { label: "Steward review", note: "Resolve reports and results" },
  { label: "Publication", note: "Release official outcome" },
];

function AdminDashboard() {
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date());

  return (
    <AdminLayout
      title="Race control overview"
      eyebrow="Admin command desk"
      description="Manage entries, race schedules, and official results."
      actions={(
        <>
          <Link className="admin-header__button" to="/admin/registrations">Review entries <ArrowUpRight size={16} aria-hidden="true" /></Link>
          <Link className="admin-header__button admin-header__button--ghost" to="/admin/schedule">Open schedule</Link>
        </>
      )}
    >
      <section className="admin-command-strip" aria-label="Current system context">
        <div><Radio size={16} aria-hidden="true" /><span>Priority queue</span><strong>Registration approvals</strong></div>
        <div><span>Business date</span><strong>{today}</strong></div>
        <div><span>Control sequence</span><strong>Entries → programme → results</strong></div>
      </section>

      <section className="admin-dashboard-section" aria-labelledby="control-lanes-title">
        <div className="admin-section-heading">
          <div><p>Priority lanes</p><h2 id="control-lanes-title">Run today’s programme</h2></div>
          <span>Start with entries. Publication is the final gate.</span>
        </div>
        <div className="admin-control-grid">
          {controlLanes.map(({ number, label, title, description, to, action, icon: Icon, tone }) => (
            <article className={`admin-control-card admin-control-card--${tone}`} key={title}>
              <div className="admin-control-card__top"><span>{number}</span><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></div>
              <p>{label}</p>
              <h3>{title}</h3>
              <div className="admin-control-card__rule" aria-hidden="true" />
              <p className="admin-control-card__description">{description}</p>
              <Link to={to}>{action}<ArrowUpRight size={16} aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-module-ledger" aria-labelledby="workspace-title">
          <div className="admin-section-heading admin-section-heading--compact">
            <div><p>Workspace index</p><h2 id="workspace-title">Operations directory</h2></div>
            <span>{modules.length} workspaces</span>
          </div>
          <div className="admin-module-list">
            {modules.map(({ label, note, to, icon: Icon }) => (
              <Link to={to} className="admin-module-row" key={label}>
                <span className="admin-module-row__icon"><Icon size={18} strokeWidth={1.8} aria-hidden="true" /></span>
                <span className="admin-module-row__copy"><strong>{label}</strong><small>{note}</small></span>
                <ChevronRight size={17} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </article>

        <aside className="admin-race-protocol" aria-labelledby="protocol-title">
          <div className="admin-race-protocol__header"><span><CheckCircle2 size={17} aria-hidden="true" /> Operating protocol</span><strong>04 gates</strong></div>
          <h2 id="protocol-title">From entry to record</h2>
          <p>Keep the official sequence intact. A downstream action should only begin after its preceding record is ready.</p>
          <ol>
            {workflow.map((item, index) => (
              <li key={item.label}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item.label}</strong><small>{item.note}</small></div></li>
            ))}
          </ol>
          <Link to="/admin/results">Go to publication desk <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </aside>
      </section>
    </AdminLayout>
  );
}

export default AdminDashboard;
