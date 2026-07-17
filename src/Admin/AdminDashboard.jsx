import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarRange,
  CheckCircle2,
  ClipboardCheck,
  FileWarning,
  Radio,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  UsersRound,
} from "lucide-react";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { adminApi } from "../api/adminApi";
import AdminLayout from "./AdminLayout";

const backendFollowUps = [
  {
    title: "Expanded dashboard aggregate",
    endpoint: "GET /api/admin/dashboard",
    note: "Optional next step: include approvals, competition, incidents, results, and finance in one fast aggregate.",
  },
];

function asArray(value, key) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.[key])) return value[key];
  if (Array.isArray(value?.data?.[key])) return value.data[key];
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function countBy(items, getKey) {
  return items.reduce((counts, item) => {
    const key = getKey(item) || "unknown";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function getId(value) {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value._id || value.id || "-";
}

function getName(value, fallback = "Unknown") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.name || value.full_name || value.email || value.report_title || value.title || fallback;
}

function getDateTime(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

function formatNumber(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("en-US").format(number);
}

function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function isToday(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

function isUpcoming(value) {
  if (!value) return false;
  const time = getDateTime(value);
  return time > Date.now();
}

function normalizeDashboard(data) {
  if (data?.summary && data?.queues) return { ...data, source: "dashboard-api" };
  return null;
}

function currencySummary(summary, currency) {
  return summary?.[currency] || { total_count: 0, total_amount: 0, statuses: {} };
}

function countPrizeAwards(summary, predicate) {
  return Object.values(summary || {}).reduce((total, currency) => {
    const statuses = currency?.statuses || {};
    return total + Object.entries(statuses).reduce((sum, [status, value]) => (
      predicate(status) ? sum + Number(value?.count || 0) : sum
    ), 0);
  }, 0);
}

function buildFinanceSummary(financeResources = {}) {
  const dashboard = financeResources.dashboard || {};
  const betting = financeResources.bettingSummary || {};
  const deposits = financeResources.depositRequests || {};
  const prizes = financeResources.prizeAwardsSummary || {};
  const tokenPrizes = currencySummary(prizes, "TOKEN");
  const vndPrizes = currencySummary(prizes, "VND");
  const unpaidPrizeAwards = countPrizeAwards(prizes, (status) => !["paid", "cancelled"].includes(String(status).toLowerCase()));

  return {
    active_wallets: dashboard.active_wallets || 0,
    tokens_in_circulation: dashboard.total_tokens_in_circulation || 0,
    deposit_success_vnd: dashboard.total_successful_deposit_vnd || deposits.summary?.total_vnd || 0,
    deposit_pending: dashboard.queues?.pending_deposits ?? deposits.summary?.pending_count ?? 0,
    deposit_success_count: deposits.summary?.success_count || 0,
    deposit_failed_count: deposits.summary?.failed_count || 0,
    token_staked: betting.token_staked || 0,
    token_paid_out: betting.token_paid_out || 0,
    token_refunded: betting.token_refunded || 0,
    pending_bets: dashboard.queues?.pending_bets ?? betting.pending_bets ?? 0,
    settled_bets: betting.settled_bets || 0,
    prize_awards_pending_payment: unpaidPrizeAwards,
    prize_awards_paid: countPrizeAwards(prizes, (status) => String(status).toLowerCase() === "paid"),
    prize_vnd_total: vndPrizes.total_amount || 0,
    prize_token_total: tokenPrizes.total_amount || 0,
    errors: financeResources.errors || [],
  };
}

function getRaceStatus(results) {
  const statuses = [...new Set(results.map((result) => String(result.status || "draft").toLowerCase()))];
  if (statuses.includes("published")) return "published";
  if (statuses.includes("confirmed")) return "confirmed";
  return statuses[0] || "draft";
}

function buildDashboardFromResources(resources, finance) {
  const users = asArray(resources.users, "users");
  const roleApplications = asArray(resources.roleApplications, "applications");
  const registrations = asArray(resources.registrations, "registrations");
  const tournaments = asArray(resources.tournaments, "tournaments");
  const races = asArray(resources.races, "races");
  const results = asArray(resources.results, "results");
  const violations = asArray(resources.violations, "violations");
  const horseChecks = asArray(resources.horseChecks, "horse_checks");
  const refereeReports = asArray(resources.refereeReports, "referee_reports");
  const jockeyAssignments = asArray(resources.jockeyAssignments, "assignments");

  const userStatus = countBy(users, (user) => user.status || (user.email_verified ? "active" : "pending_verification"));
  const raceStatus = countBy(races, (race) => race.status);
  const tournamentStatus = countBy(tournaments, (tournament) => tournament.status);
  const registrationStatus = countBy(registrations, (registration) => registration.status);
  const violationStatus = countBy(violations, (violation) => violation.status);
  const reportStatus = countBy(refereeReports, (report) => report.status);
  const assignmentStatus = countBy(jockeyAssignments, (assignment) => assignment.status);
  const checkIssues = horseChecks.filter((check) => {
    const status = String(check.status || "").toLowerCase();
    return ["failed", "under_investigation", "rejected"].includes(status) || check.is_eligible === false;
  });

  const resultGroups = results.reduce((groups, result) => {
    const raceId = getId(result.race_id || result.race);
    if (!groups[raceId]) groups[raceId] = [];
    groups[raceId].push(result);
    return groups;
  }, {});
  const groupedResultStatuses = Object.values(resultGroups).map(getRaceStatus);
  const completedRaceIds = new Set(races.filter((race) => race.status === "completed").map((race) => getId(race)));
  const publishedRaceIds = new Set(Object.entries(resultGroups).filter(([, rows]) => getRaceStatus(rows) === "published").map(([raceId]) => raceId));
  const correctionRequested = results.filter((result) => result.correction_requested).length;

  const recentRegistrations = registrations
    .sort((first, second) => getDateTime(second.registered_at || second.created_at) - getDateTime(first.registered_at || first.created_at))
    .slice(0, 6)
    .map((registration) => ({
      id: getId(registration),
      title: getName(registration.horse_id || registration.horse, "Horse entry"),
      meta: getName(registration.race_id || registration.race, "Race") + " | " + getName(registration.tournament_id || registration.tournament, "Tournament"),
      status: registration.status || "approved",
      date: registration.registered_at || registration.created_at,
      to: "/admin/registrations",
    }));

  const upcomingRaces = races
    .filter((race) => isUpcoming(race.race_date) || isToday(race.race_date))
    .sort((first, second) => getDateTime(first.race_date) - getDateTime(second.race_date))
    .slice(0, 6)
    .map((race) => ({
      id: getId(race),
      title: race.name || "Race",
      meta: getName(race.tournament_id || race.tournament, "Tournament") + " | " + (race.location || "No track"),
      status: race.status || "scheduled",
      date: race.race_date,
      to: "/admin/schedule",
    }));

  const resultPublication = Object.entries(resultGroups)
    .map(([raceId, rows]) => {
      const race = rows[0]?.race_id || rows[0]?.race || {};
      return {
        id: raceId,
        title: getName(race, "Race result"),
        meta: `${rows.length} result rows`,
        status: getRaceStatus(rows),
        date: rows[0]?.recorded_at || rows[0]?.confirmed_at || rows[0]?.published_at,
        to: "/admin/results",
      };
    })
    .filter((item) => item.status !== "published")
    .slice(0, 6);

  const incidentReview = violations
    .filter((violation) => !["confirmed", "dismissed"].includes(String(violation.status || "").toLowerCase()))
    .sort((first, second) => getDateTime(second.created_at) - getDateTime(first.created_at))
    .slice(0, 6)
    .map((violation) => ({
      id: getId(violation),
      title: String(violation.violation_type || "Race incident").replaceAll("_", " "),
      meta: getName(violation.race_id || violation.race, "Race") + " | " + String(violation.severity || "minor"),
      status: violation.status || "recorded",
      date: violation.created_at,
      to: "/admin/incidents",
    }));

  return {
    source: "client-compose",
    summary: {
      users: {
        total: users.length,
        active: userStatus.active || 0,
        pending_verification: userStatus.pending_verification || 0,
        blocked: userStatus.blocked || 0,
        disabled: userStatus.disabled || 0,
      },
      competition: {
        tournaments_total: tournaments.length,
        tournaments_active: (tournamentStatus.active || 0) + (tournamentStatus.ongoing || 0),
        races_total: races.length,
        races_today: races.filter((race) => isToday(race.race_date)).length,
        races_scheduled: raceStatus.scheduled || 0,
        races_running: raceStatus.running || 0,
        races_completed: raceStatus.completed || 0,
        races_without_referee: races.filter((race) => !race.referee_id).length,
      },
      approvals: {
        role_applications_pending: roleApplications.filter((application) => application.status === "pending").length,
        registrations_total: registrations.length,
        registrations_pending: registrationStatus.pending || 0,
        registrations_approved: registrationStatus.approved || 0,
        registrations_rejected: registrationStatus.rejected || 0,
        jockey_assignments_pending: (assignmentStatus.meeting_invited || 0) + (assignmentStatus.contract_uploaded || 0),
      },
      results: {
        draft_races: groupedResultStatuses.filter((status) => status === "draft").length,
        confirmed_races: groupedResultStatuses.filter((status) => status === "confirmed").length,
        published_races: groupedResultStatuses.filter((status) => status === "published").length,
        correction_requested: correctionRequested,
        completed_unpublished: [...completedRaceIds].filter((raceId) => !publishedRaceIds.has(raceId)).length,
      },
      incidents: {
        violations_recorded: violationStatus.recorded || 0,
        violations_confirmed: violationStatus.confirmed || 0,
        violations_dismissed: violationStatus.dismissed || 0,
        horse_checks_failed: checkIssues.length,
        reports_submitted: reportStatus.submitted || 0,
        reports_draft: reportStatus.draft || 0,
      },
      finance,
    },
    queues: {
      recent_registrations: recentRegistrations,
      upcoming_races: upcomingRaces,
      result_publication: resultPublication,
      incident_review: incidentReview,
    },
  };
}

async function loadDashboardData() {
  const entries = await Promise.allSettled([
    adminApi.getDashboard(),
    adminApi.getBettingSummary(),
    adminApi.getDepositRequests({ page: 1, limit: 1 }),
    adminApi.getPrizeAwardsSummary(),
    adminApi.listUsers({ page: 1, limit: 500 }),
    adminApi.listRoleApplications({ page: 1, limit: 500 }),
    adminApi.listRegistrations({ page: 1, limit: 500 }),
    adminApi.listTournaments(),
    adminApi.listRaces(),
    adminApi.listRaceResults(),
    adminApi.listViolations(),
    adminApi.listHorseChecks(),
    adminApi.listRefereeReports(),
    adminApi.listJockeyAssignments({ page: 1, limit: 500 }),
  ]);

  const keys = ["dashboard", "bettingSummary", "depositRequests", "prizeAwardsSummary", "users", "roleApplications", "registrations", "tournaments", "races", "results", "violations", "horseChecks", "refereeReports", "jockeyAssignments"];
  const resources = entries.reduce((accumulator, entry, index) => {
    accumulator[keys[index]] = entry.status === "fulfilled" ? entry.value : {};
    return accumulator;
  }, {});
  const errors = entries
    .map((entry, index) => (entry.status === "rejected" ? keys[index] : null))
    .filter(Boolean);

  const dashboard = normalizeDashboard(resources.dashboard);
  if (dashboard) return dashboard;

  const finance = buildFinanceSummary({
    dashboard: resources.dashboard,
    bettingSummary: resources.bettingSummary,
    depositRequests: resources.depositRequests,
    prizeAwardsSummary: resources.prizeAwardsSummary,
    errors,
  });

  return buildDashboardFromResources(resources, finance);
}

function MetricCard({ index, label, value, note, source = "api" }) {
  return (
    <article>
      <span>{String(index).padStart(2, "0")}</span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
        {note && <em>{note}</em>}
        {source === "mock" && <b>Mock</b>}
      </div>
    </article>
  );
}

function QueueList({ title, items, emptyText, icon: Icon }) {
  return (
    <article className="admin-dashboard-queue">
      <header>
        <div><Icon size={18} aria-hidden="true" /><span><strong>{title}</strong><small>{items.length} records</small></span></div>
      </header>
      {items.length ? (
        <div className="admin-module-list">
          {items.map((item) => (
            <Link to={item.to} className="admin-module-row" key={`${title}-${item.id}`}>
              <span className="admin-module-row__icon"><Icon size={17} aria-hidden="true" /></span>
              <span className="admin-module-row__copy"><strong>{item.title}</strong><small>{item.meta}</small></span>
              <span className="admin-dashboard-queue__meta">{formatDate(item.date)}<small>{item.status}</small></span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="admin-dashboard-empty"><CheckCircle2 size={18} aria-hidden="true" />{emptyText}</div>
      )}
    </article>
  );
}

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date());

  const load = async () => {
    setIsLoading(true);
    setError("");
    try {
      setDashboard(await loadDashboardData());
    } catch (apiError) {
      setError(apiError.message || "Unable to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const summary = dashboard?.summary || {};
  const queues = dashboard?.queues || {};
  const topMetrics = useMemo(() => [
    { label: "Race entries", value: formatNumber(summary.approvals?.registrations_total ?? summary.approvals?.registrations_approved), note: "Auto-confirmed ledger" },
    { label: "Races today", value: formatNumber(summary.competition?.races_today), note: `${formatNumber(summary.competition?.races_running)} live now` },
    { label: "Unpublished results", value: formatNumber(summary.results?.completed_unpublished), note: `${formatNumber(summary.results?.correction_requested)} correction` },
    { label: "Incident review", value: formatNumber(summary.incidents?.violations_recorded), note: "Recorded violations" },
  ], [summary]);

  return (
    <AdminLayout
      title="Race control dashboard"
      eyebrow="Admin command desk"
      description="Monitor race entries, operations, incidents, publication gates, and finance signals from one workspace."
      actions={(
        <>
          <button className="admin-header__button admin-header__button--ghost" disabled={isLoading} type="button" onClick={load}>
            <RefreshCw size={16} className={isLoading ? "admin-competition__spin" : ""} aria-hidden="true" /> Refresh
          </button>
          <Link className="admin-header__button" to="/admin/registrations">View entries <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </>
      )}
    >
      <section className="admin-command-strip" aria-label="Current system context">
        <div><Radio size={16} aria-hidden="true" /><span>Data source</span><strong>{dashboard?.source === "dashboard-api" ? "Backend dashboard API" : "Composed from existing APIs"}</strong></div>
        <div><span>Business date</span><strong>{today}</strong></div>
        <div><span>Finance coverage</span><strong>{summary.finance?.errors?.length ? `${summary.finance.errors.length} summary issue(s)` : "API-backed"}</strong></div>
      </section>

      {isLoading && <LoadingSkeleton ariaLabel="Loading admin dashboard" rows={6} variant="table" />}
      {error && <section className="admin-live-state admin-live-state--warning" aria-live="assertive">{error}</section>}

      {!isLoading && dashboard && (
        <>
          <section className="admin-command-metrics admin-dashboard-metrics" aria-label="Admin dashboard headline metrics">
            {topMetrics.map((metric, index) => <MetricCard key={metric.label} index={index + 1} {...metric} />)}
          </section>

          <section className="admin-dashboard-grid admin-dashboard-grid--wide">
            <article className="admin-module-ledger" aria-labelledby="operations-title">
              <div className="admin-section-heading admin-section-heading--compact">
                <div><p>Live operations</p><h2 id="operations-title">Queues and latest records</h2></div>
                <span>API-backed where endpoints exist</span>
              </div>
              <div className="admin-dashboard-queue-grid">
                <QueueList title="Recent race entries" icon={ClipboardCheck} items={queues.recent_registrations || queues.pending_registrations || []} emptyText="No race entries have been recorded." />
                <QueueList title="Upcoming races" icon={CalendarRange} items={queues.upcoming_races || []} emptyText="No races scheduled in the current window." />
                <QueueList title="Result publication" icon={Trophy} items={queues.result_publication || []} emptyText="No draft or confirmed race results waiting." />
                <QueueList title="Incident review" icon={ShieldAlert} items={queues.incident_review || []} emptyText="No unresolved incidents returned." />
              </div>
            </article>

            <aside className="admin-race-protocol" aria-labelledby="health-title">
              <div className="admin-race-protocol__header"><span><ShieldCheck size={17} aria-hidden="true" /> System health</span><strong>API</strong></div>
              <h2 id="health-title">Operational checkpoints</h2>
              <p>Use this as the admin first screen. Finance rows are backed by the current dashboard, betting, deposit, and prize summary APIs.</p>
              <ol>
                <li><span>01</span><div><strong>{formatNumber(summary.users?.active)} active users</strong><small>{formatNumber(summary.users?.pending_verification)} pending verification</small></div></li>
                <li><span>02</span><div><strong>{formatNumber(summary.competition?.races_without_referee)} races without referee</strong><small>{formatNumber(summary.competition?.races_scheduled)} scheduled races</small></div></li>
                <li><span>03</span><div><strong>{formatNumber(summary.incidents?.reports_draft)} draft reports</strong><small>{formatNumber(summary.incidents?.horse_checks_failed)} failed checks</small></div></li>
                <li><span>04</span><div><strong>{formatMoney(summary.finance?.deposit_success_vnd)}</strong><small>Successful deposits</small></div></li>
              </ol>
              <Link to="/admin/results">Go to publication desk <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </aside>
          </section>

          <section className="admin-dashboard-section" aria-labelledby="domain-title">
            <div className="admin-section-heading">
              <div><p>Domain totals</p><h2 id="domain-title">Admin workload by area</h2></div>
              <span>Finance cards use admin-readable summary endpoints.</span>
            </div>
            <div className="admin-dashboard-domain-grid">
              <MetricCard index={1} label="Total users" value={formatNumber(summary.users?.total)} note={`${formatNumber(summary.users?.blocked + summary.users?.disabled)} suspended`} />
              <MetricCard index={2} label="Tournaments" value={formatNumber(summary.competition?.tournaments_total)} note={`${formatNumber(summary.competition?.tournaments_active)} active`} />
              <MetricCard index={3} label="Role applications" value={formatNumber(summary.approvals?.role_applications_pending)} note="Pending review" />
              <MetricCard index={4} label="Jockey invites" value={formatNumber(summary.approvals?.jockey_assignments_pending)} note="Awaiting response" />
              <MetricCard index={5} label="Published races" value={formatNumber(summary.results?.published_races)} note={`${formatNumber(summary.results?.draft_races)} drafts`} />
              <MetricCard index={6} label="Token staked" value={formatNumber(summary.finance?.token_staked)} note={`${formatNumber(summary.finance?.token_paid_out)} paid out`} />
              <MetricCard index={7} label="Pending deposits" value={formatNumber(summary.finance?.deposit_pending)} note={`${formatNumber(summary.finance?.deposit_failed_count)} failed`} />
              <MetricCard index={8} label="Unpaid prize awards" value={formatNumber(summary.finance?.prize_awards_pending_payment)} note={`${formatNumber(summary.finance?.prize_awards_paid)} paid`} />
            </div>
          </section>

          <section className="admin-dashboard-missing" aria-labelledby="missing-api-title">
            <div className="admin-section-heading admin-section-heading--compact">
              <div><p>Backend contract</p><h2 id="missing-api-title">Optional follow-up</h2></div>
              <span>{backendFollowUps.length} item</span>
            </div>
            <div className="admin-module-list">
              {backendFollowUps.map((item) => (
                <article className="admin-module-row" key={item.endpoint}>
                  <span className="admin-module-row__icon"><FileWarning size={18} aria-hidden="true" /></span>
                  <span className="admin-module-row__copy"><strong>{item.endpoint}</strong><small>{item.note}</small></span>
                  <span className="admin-module-row__state">Optional</span>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-live-state admin-live-state--warning" aria-live="polite">
            <AlertTriangle size={17} aria-hidden="true" /> {summary.finance?.errors?.length ? `Some summaries failed: ${summary.finance.errors.join(", ")}.` : "Finance and betting summaries loaded from backend APIs."}
          </section>
        </>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;

